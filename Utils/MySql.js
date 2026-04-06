const mysql = require("mysql2/promise");

const pool1 = mysql.createPool({
  host: "m3preprod.cuce9do7mxez.ap-south-1.rds.amazonaws.com",
  user: "starktech",
  password: "csr12brxiQXbuS2c0YmI",
  database: "datacollect",
  waitForConnections: true,
  multipleStatements: true,
  connectionLimit: 100,
});

pool1.on("connection", (connection) => {
  console.log("Database connected");
  connection.on("end", () => {
    console.log("Database connection released");
  });
});

pool1.on("error", (err) => {
  console.log(`Database error: ${err}`);
});

module.exports = { pool1 };
