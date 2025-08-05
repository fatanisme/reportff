import oracledb from "oracledb";

const dbConfig = {
  user: "ILOS",
  password: "ilosuser",
  connectString: "10.0.220.42:1521/devwisdb",
};

export async function executeQuery(query, binds = {}) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true, // <-- WAJIB untuk query DML!
    });

    // Jika hasilnya berupa REF CURSOR
    if (result.outBinds && result.outBinds.p_cursor) {
      const resultSet = result.outBinds.p_cursor;
      const rows = await resultSet.getRows(); // Ambil semua baris
      await resultSet.close();
      return rows;
    }

    return result.rows ?? result;
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
