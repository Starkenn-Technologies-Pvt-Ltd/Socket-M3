const { Pool } = require("pg");

const questDBPool = new Pool({
  host: "13.203.1.157",
  port: "8812",
  user: "admin",
  password: "quest",
  database: "qdb",
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

questDBPool.on("connect", (client) => {
  console.log("QuestDB client connected to database.");
  client.on("end", () => {
    console.log("QuestDB client connection released.");
  });
});

questDBPool.on("error", (err, client) => {
  console.error(`QuestDB pool error: ${err.message}`);
});

module.exports = { questDBPool };
