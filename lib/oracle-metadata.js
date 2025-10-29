import { executeQuery } from "@/lib/oracle";

const tableColumnsCache = new Map();

const normalizeKeyPart = (value) => String(value || "").trim().toUpperCase();

const buildTableCacheKey = ({
  owner,
  table,
  connectionName = "default",
}) =>
  [
    normalizeKeyPart(connectionName),
    normalizeKeyPart(owner),
    normalizeKeyPart(table),
  ].join("|");

export function getTableColumns({
  owner,
  table,
  connectionName = "default",
}) {
  const cacheKey = buildTableCacheKey({ owner, table, connectionName });
  const cached = tableColumnsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const lookupPromise = (async () => {
    try {
      const rows = await executeQuery(
        `
          SELECT COLUMN_NAME
          FROM ALL_TAB_COLUMNS
          WHERE OWNER = :owner
            AND TABLE_NAME = :tableName
        `,
        {
          owner: normalizeKeyPart(owner),
          tableName: normalizeKeyPart(table),
        },
        { connectionName, autoCommit: false }
      );

      const columnNames = Array.isArray(rows)
        ? rows.map((row) => normalizeKeyPart(row.COLUMN_NAME))
        : [];

      return new Set(columnNames);
    } catch (error) {
      console.error("Failed to fetch table columns:", error);
      return new Set();
    }
  })();

  lookupPromise.catch(() => {
    tableColumnsCache.delete(cacheKey);
  });

  tableColumnsCache.set(cacheKey, lookupPromise);
  return lookupPromise;
}

export async function columnExists({
  owner,
  table,
  column,
  connectionName = "default",
}) {
  const columns = await getTableColumns({ owner, table, connectionName });
  return columns.has(normalizeKeyPart(column));
}
