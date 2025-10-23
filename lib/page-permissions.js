import oracledb from "oracledb";
import { executeQuery } from "@/lib/oracle";

const TABLE_PERMISSION = "REPORTFF.PAGE_PERMISSIONS";
const TABLE_DIVISION_PIVOT = "REPORTFF.PAGE_PERMISSION_DIVISIONS";
const TABLE_GROUP_PIVOT = "REPORTFF.PAGE_PERMISSION_GROUPS";
const TABLE_DIVISION = "REPORTFF.TB_DIVISI";
const TABLE_GROUP = "REPORTFF.GROUPS";

const CACHE_SYMBOL = Symbol.for("reportff.pagePermissionsCache");
const CACHE_TTL_MS = 60 * 1000;

function getCacheStore() {
  if (!globalThis[CACHE_SYMBOL]) {
    globalThis[CACHE_SYMBOL] = {
      data: null,
      expiresAt: 0,
    };
  }
  return globalThis[CACHE_SYMBOL];
}

export function invalidatePagePermissionsCache() {
  const cache = getCacheStore();
  cache.data = null;
  cache.expiresAt = 0;
}

export function normalizePath(value) {
  if (!value) return "/";
  let normalized = String(value).trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized.toLowerCase();
}

function formatPathForStore(value) {
  if (!value) return "/";
  let formatted = String(value).trim();
  if (!formatted.startsWith("/")) {
    formatted = `/${formatted}`;
  }
  if (formatted.length > 1 && formatted.endsWith("/")) {
    formatted = formatted.slice(0, -1);
  }
  return formatted;
}

function normalizeFlag(value) {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1" ||
    Number(value) === 1
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathMatches(requestPath, pattern) {
  const req = normalizePath(requestPath);
  const pat = normalizePath(pattern);

  if (pat === "/") {
    return req === "/";
  }

  if (pat.includes("*")) {
    const regexPattern =
      "^" +
      pat
        .split("*")
        .map((segment) => escapeRegExp(segment))
        .join(".*") +
      "$";
    const regex = new RegExp(regexPattern);
    return regex.test(req);
  }

  if (req === pat) return true;
  return req.startsWith(`${pat}/`);
}

function sanitizeIdList(values) {
  if (!Array.isArray(values)) return [];
  const unique = new Set(
    values
      .map((value) => {
        if (value === null || value === undefined) return null;
        const stringified = String(value).trim();
        return stringified ? stringified : null;
      })
      .filter(Boolean)
  );
  return Array.from(unique);
}

async function fetchPermissionsFromDatabase() {
  const permissions = await executeQuery(
    `
      SELECT
        p.ID,
        p.URL_PATH,
        p.DESCRIPTION,
        p.ALLOW_ALL,
        p.ALLOW_ANONYMOUS,
        p.CREATED_AT,
        p.UPDATED_AT
      FROM ${TABLE_PERMISSION} p
      ORDER BY p.URL_PATH
    `
  );

  if (!permissions || permissions.length === 0) {
    return [];
  }

  const permissionIds = permissions.map((row) => row.ID);

  const bindPlaceholders = permissionIds
    .map((_, index) => `:id${index}`)
    .join(", ");
  const bindParams = permissionIds.reduce((acc, id, index) => {
    acc[`id${index}`] = id;
    return acc;
  }, {});

  const [divisionRows, groupRows] = await Promise.all([
    executeQuery(
      `
        SELECT
          pd.PAGE_PERMISSION_ID,
          d.ID_DIVISI,
          d.KODE_DIVISI,
          d.NAMA_DIVISI
        FROM ${TABLE_DIVISION_PIVOT} pd
        JOIN ${TABLE_DIVISION} d
          ON d.ID_DIVISI = pd.DIVISION_ID
        WHERE pd.PAGE_PERMISSION_ID IN (${bindPlaceholders})
      `,
      bindParams
    ).catch((error) => {
      console.error("Gagal memuat relasi divisi:", error);
      return [];
    }),
    executeQuery(
      `
        SELECT
          pg.PAGE_PERMISSION_ID,
          g.ID,
          g.NAME
        FROM ${TABLE_GROUP_PIVOT} pg
        JOIN ${TABLE_GROUP} g
          ON g.ID = pg.GROUP_ID
        WHERE pg.PAGE_PERMISSION_ID IN (${bindPlaceholders})
      `,
      bindParams
    ).catch((error) => {
      console.error("Gagal memuat relasi group:", error);
      return [];
    }),
  ]);

  const divisionMap = new Map();
  for (const row of divisionRows ?? []) {
    const key = row.PAGE_PERMISSION_ID;
    if (!divisionMap.has(key)) {
      divisionMap.set(key, []);
    }
    divisionMap.get(key).push({
      id: (row.ID_DIVISI ?? "").toString(),
      code:
        row.KODE_DIVISI === null || row.KODE_DIVISI === undefined
          ? ""
          : String(row.KODE_DIVISI),
      name: row.NAMA_DIVISI ?? "",
    });
  }

  const groupMap = new Map();
  for (const row of groupRows ?? []) {
    const key = row.PAGE_PERMISSION_ID;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key).push({
      id: (row.ID ?? "").toString(),
      name: row.NAME ?? "",
    });
  }

  return permissions.map((row) => {
    const divisions = divisionMap.get(row.ID) ?? [];
    const groups = groupMap.get(row.ID) ?? [];

    return {
      id: row.ID,
      urlPath: row.URL_PATH ?? "",
      description: row.DESCRIPTION ?? "",
      allowAll: normalizeFlag(row.ALLOW_ALL),
      allowAnonymous: normalizeFlag(row.ALLOW_ANONYMOUS),
      divisionIds: divisions.map((division) => division.id),
      groupIds: groups.map((group) => group.id),
      divisions,
      groups,
      createdAt: row.CREATED_AT ?? null,
      updatedAt: row.UPDATED_AT ?? null,
    };
  });
}

export async function listPagePermissions({ refresh = false } = {}) {
  const cache = getCacheStore();
  if (!refresh && cache.data && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const data = await fetchPermissionsFromDatabase();
  cache.data = data;
  cache.expiresAt = Date.now() + CACHE_TTL_MS;
  return data;
}

async function fetchPermissionById(id) {
  const rows = await executeQuery(
    `
      SELECT
        p.ID,
        p.URL_PATH,
        p.DESCRIPTION,
        p.ALLOW_ALL,
        p.ALLOW_ANONYMOUS,
        p.CREATED_AT,
        p.UPDATED_AT
      FROM ${TABLE_PERMISSION} p
      WHERE p.ID = :id
    `,
    { id }
  );

  const permission = rows?.[0];
  if (!permission) return null;

  const [divisionRows, groupRows] = await Promise.all([
    executeQuery(
      `
        SELECT
          pd.PAGE_PERMISSION_ID,
          d.ID_DIVISI,
          d.KODE_DIVISI,
          d.NAMA_DIVISI
        FROM ${TABLE_DIVISION_PIVOT} pd
        JOIN ${TABLE_DIVISION} d
          ON d.ID_DIVISI = pd.DIVISION_ID
        WHERE pd.PAGE_PERMISSION_ID = :id
      `,
      { id }
    ).catch((error) => {
      console.error("Gagal memuat relasi divisi:", error);
      return [];
    }),
    executeQuery(
      `
        SELECT
          pg.PAGE_PERMISSION_ID,
          g.ID,
          g.NAME
        FROM ${TABLE_GROUP_PIVOT} pg
        JOIN ${TABLE_GROUP} g
          ON g.ID = pg.GROUP_ID
        WHERE pg.PAGE_PERMISSION_ID = :id
      `,
      { id }
    ).catch((error) => {
      console.error("Gagal memuat relasi group:", error);
      return [];
    }),
  ]);

  const divisions = (divisionRows ?? []).map((row) => ({
    id: (row.ID_DIVISI ?? "").toString(),
    code:
      row.KODE_DIVISI === null || row.KODE_DIVISI === undefined
        ? ""
        : String(row.KODE_DIVISI),
    name: row.NAMA_DIVISI ?? "",
  }));

  const groups = (groupRows ?? []).map((row) => ({
    id: (row.ID ?? "").toString(),
    name: row.NAME ?? "",
  }));

  return {
    id: permission.ID,
    urlPath: permission.URL_PATH ?? "",
    description: permission.DESCRIPTION ?? "",
    allowAll: normalizeFlag(permission.ALLOW_ALL),
    allowAnonymous: normalizeFlag(permission.ALLOW_ANONYMOUS),
    divisionIds: divisions.map((division) => division.id),
    groupIds: groups.map((group) => group.id),
    divisions,
    groups,
    createdAt: permission.CREATED_AT ?? null,
    updatedAt: permission.UPDATED_AT ?? null,
  };
}

export async function getPagePermissionById(id, { refresh = false } = {}) {
  if (!id) return null;
  if (!refresh) {
    const cache = getCacheStore();
    if (cache.data) {
      const found = cache.data.find((item) => item.id === id);
      if (found) return found;
    }
  }
  const result = await fetchPermissionById(id);
  return result;
}

export async function createPagePermission({
  urlPath,
  description = "",
  allowAll = false,
  allowAnonymous = false,
  divisionIds = [],
  groupIds = [],
}) {
  const cleanedUrlPath = formatPathForStore(urlPath);
  const cleanedDescription = description?.trim() ?? "";
  const allowAllFlag = normalizeFlag(allowAll) ? "1" : "0";
  const allowAnonymousFlag = normalizeFlag(allowAnonymous) ? "1" : "0";
  const divisions = sanitizeIdList(divisionIds);
  const groups = sanitizeIdList(groupIds);

  let insertedId = null;

  try {
    const insertResult = await executeQuery(
      `
        INSERT INTO ${TABLE_PERMISSION} (URL_PATH, DESCRIPTION, ALLOW_ALL, ALLOW_ANONYMOUS)
        VALUES (:urlPath, :description, :allowAll, :allowAnonymous)
        RETURNING ID INTO :id
      `,
      {
        urlPath: cleanedUrlPath,
        description: cleanedDescription,
        allowAll: allowAllFlag,
        allowAnonymous: allowAnonymousFlag,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    insertedId = insertResult?.outBinds?.id?.[0];
    if (!insertedId) {
      throw new Error("Gagal menyimpan data page permission");
    }

    for (const divisionId of divisions) {
      await executeQuery(
        `
          INSERT INTO ${TABLE_DIVISION_PIVOT} (PAGE_PERMISSION_ID, DIVISION_ID)
          VALUES (:permissionId, :divisionId)
        `,
        { permissionId: insertedId, divisionId: Number(divisionId) }
      );
    }

    for (const groupId of groups) {
      await executeQuery(
        `
          INSERT INTO ${TABLE_GROUP_PIVOT} (PAGE_PERMISSION_ID, GROUP_ID)
          VALUES (:permissionId, :groupId)
        `,
        { permissionId: insertedId, groupId: Number(groupId) }
      );
    }
  } catch (error) {
    if (insertedId) {
      try {
        await executeQuery(
          `DELETE FROM ${TABLE_PERMISSION} WHERE ID = :id`,
          { id: insertedId }
        );
      } catch (cleanupError) {
        console.error("Gagal menghapus data setelah error:", cleanupError);
      }
    }
    throw error;
  }

  invalidatePagePermissionsCache();
  return fetchPermissionById(insertedId);
}

export async function updatePagePermission(
  id,
  {
    urlPath,
    description = "",
    allowAll = false,
    allowAnonymous = false,
    divisionIds = [],
    groupIds = [],
  }
) {
  const cleanedUrlPath = formatPathForStore(urlPath);
  const cleanedDescription = description?.trim() ?? "";
  const allowAllFlag = normalizeFlag(allowAll) ? "1" : "0";
  const allowAnonymousFlag = normalizeFlag(allowAnonymous) ? "1" : "0";
  const divisions = sanitizeIdList(divisionIds);
  const groups = sanitizeIdList(groupIds);

  await executeQuery(
    `
      UPDATE ${TABLE_PERMISSION}
      SET URL_PATH = :urlPath,
          DESCRIPTION = :description,
          ALLOW_ALL = :allowAll,
          ALLOW_ANONYMOUS = :allowAnonymous,
          UPDATED_AT = SYSTIMESTAMP
      WHERE ID = :id
    `,
    {
      urlPath: cleanedUrlPath,
      description: cleanedDescription,
      allowAll: allowAllFlag,
      allowAnonymous: allowAnonymousFlag,
      id,
    }
  );

  await executeQuery(
    `DELETE FROM ${TABLE_DIVISION_PIVOT} WHERE PAGE_PERMISSION_ID = :id`,
    { id }
  );
  await executeQuery(
    `DELETE FROM ${TABLE_GROUP_PIVOT} WHERE PAGE_PERMISSION_ID = :id`,
    { id }
  );

  for (const divisionId of divisions) {
    await executeQuery(
      `
        INSERT INTO ${TABLE_DIVISION_PIVOT} (PAGE_PERMISSION_ID, DIVISION_ID)
        VALUES (:permissionId, :divisionId)
      `,
      { permissionId: id, divisionId: Number(divisionId) }
    );
  }

  for (const groupId of groups) {
    await executeQuery(
      `
        INSERT INTO ${TABLE_GROUP_PIVOT} (PAGE_PERMISSION_ID, GROUP_ID)
        VALUES (:permissionId, :groupId)
      `,
      { permissionId: id, groupId: Number(groupId) }
    );
  }

  invalidatePagePermissionsCache();
  return fetchPermissionById(id);
}

export async function deletePagePermission(id) {
  const result = await executeQuery(
    `DELETE FROM ${TABLE_PERMISSION} WHERE ID = :id`,
    { id }
  );
  invalidatePagePermissionsCache();
  return result?.rowsAffected ?? 0;
}

export async function findPermissionForPath(path) {
  if (!path) return null;
  const permissions = await listPagePermissions();
  const normalizedPath = normalizePath(path);

  let matched = null;
  for (const permission of permissions) {
    if (!permission?.urlPath) continue;
    if (pathMatches(normalizedPath, permission.urlPath)) {
      if (
        !matched ||
        normalizePath(permission.urlPath).length >
          normalizePath(matched.urlPath).length
      ) {
        matched = permission;
      }
    }
  }
  return matched;
}
