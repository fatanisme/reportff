import oracledb from "oracledb";

const dbConfig = {
    user: "ILOS",
    password: "ilosuser",
    connectString: "10.0.220.42:1521/devwisdb"
};

export async function executeQuery(query, binds = []) {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
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
