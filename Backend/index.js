// const http = require('node:http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });



// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "Person",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test route
app.get("/", (req, res) => {
  res.send("Express and MySQL2 are working!");
});

// Get users example
app.get("/Person", (req, res) => {
  pool.query("SELECT * FROM Person", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.use(express.json());
app.post("/Person", (req, res) => {

  const { Name, Email, Occupation } = req.body;

  const sql = "INSERT INTO PERSON(Name, Email, Occupation) VALUES (?, ?, ?)";
  pool.query(sql, [Name, Email, Occupation], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({message: "Person added successfully!!"},results);
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
