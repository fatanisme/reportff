import oracledb from "oracledb";

const connectionConfigs = Object.freeze({
  default: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  },
  itHelpdesk: {
    user: process.env.IT_HELPDESK_DB_USER,
    password: process.env.IT_HELPDESK_DB_PASSWORD,
    connectString: process.env.IT_HELPDESK_DB_CONNECT_STRING,
  },
});

function getConnectionConfig(connectionName = "default") {
  const normalizedName = connectionName || "default";
  const config = connectionConfigs[normalizedName] || connectionConfigs.default;

  if (!config || !config.user || !config.password || !config.connectString) {
    throw new Error(
      `Environment variables for database connection "${normalizedName}" are missing`
    );
  }

  return config;
}

export async function executeQuery(query, binds = {}, options = {}) {
  const connectionName = options.connectionName || "default";
  let connection;

  try {
    connection = await oracledb.getConnection(getConnectionConfig(connectionName));

    const result = await connection.execute(query, binds, {
      outFormat: options.outFormat || oracledb.OUT_FORMAT_OBJECT,
      autoCommit:
        options.autoCommit === undefined ? true : Boolean(options.autoCommit),
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
