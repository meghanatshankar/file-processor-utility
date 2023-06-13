const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "./mydb.sqlite";

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Connected to the database successfully");
    });
    return db;
  }
}