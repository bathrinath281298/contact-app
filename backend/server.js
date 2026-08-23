const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "contactdb",
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("Database connected successfully");

    connection.release();
  } catch (error) {
    console.error("Database connection failed");
    console.error(error.message);
  }
}

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Contact Management Backend is running"
  });
});

// GET all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM contacts ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch contacts"
    });
  }
});

// ADD a contact
app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required"
      });
    }

    const [result] = await pool.query(
      "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );

    res.status(201).json({
      message: "Contact added successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add contact"
    });
  }
});

// DELETE a contact
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM contacts WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.json({
      message: "Contact deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete contact"
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await testDatabaseConnection();
});
