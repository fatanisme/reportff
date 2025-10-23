import { executeQuery } from "@/lib/oracle";

const MAX_RETRY = 5;

async function insertWithGeneratedId(userId, groupId) {
  let attempt = 0;

  while (attempt < MAX_RETRY) {
    attempt += 1;
    try {
      await executeQuery(
        `
          INSERT INTO REPORTFF.USERS_GROUPS (ID, USER_ID, GROUP_ID)
          SELECT NVL(MAX(ID), 0) + 1, :userId, :groupId
          FROM REPORTFF.USERS_GROUPS
        `,
        { userId, groupId }
      );
      return;
    } catch (error) {
      // ORA-00001: unique constraint violated, retry with fresh MAX(ID)
      if (error?.errorNum === 1 && attempt < MAX_RETRY) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Gagal menambah relasi user-group setelah beberapa percobaan");
}

export async function insertUserGroupMappings(userId, groupIds) {
  if (!userId || !Array.isArray(groupIds) || groupIds.length === 0) {
    return;
  }

  for (const groupId of groupIds) {
    await insertWithGeneratedId(userId, groupId);
  }
}
