const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();
const db = new sqlite3.Database('mydb.sqlite');
const cors = require('cors')
// app.post('/upload', function(req, res) {
//   // upload(req, res, function(err) {
//     if (err) {
//       console.log(err);
//       res.send({error: 'An error occurred while uploading the file'});
//     } else {
//       console.log(req.file);
//     }
// // Create table to store uploaded files
// db.serialize(function() {
//   db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, name TEXT, path TEXT)");
//   const stmt = db.prepare('INSERT INTO files values(?)');
//   for (let i = 0; i < 10; i++ ){
//     stmt.run('test'+ i);
//   }
//   stmt.finalize();
//   db.each("SELECT rowid AS id, info FROM files",(err,row) => {
//     console.log(row.id + ": " + row.info);
//   })
// });
// // })
// })

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  console.log(req.file)
  if (req.file) {
    // The request includes a file
    // db.serialize(function() {
    //     db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, name TEXT, path TEXT)");
    //     const stmt = db.prepare('INSERT INTO files values(?)');
    //     for (let i = 0; i < 10; i++ ){
    //       stmt.run('test'+ i);
    //     }
    //     stmt.finalize();
    //     db.each("SELECT rowid AS id, info FROM files",(err,row) => {
    //       console.log(row.id + ": " + row.info);
    //     })
    //   });
    res.send('File uploaded successfully');
  } else {
    // The request does not include a file
    res.status(400).send('No file uploaded');
  }
});
// Set the storage engine
// const storage = multer.diskStorage({
//   destination: './public/uploads/',
//   filename: function(req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// // Initialize multer middleware
// const upload = multer({
//   storage: storage
// }).single('file');

//test
app.get("/", function(req, res){
  // res = "Hello World"
  res.send("Hello world")  
})
// Handle file upload on button click
// app.post('/upload', function(req, res) {
//   upload(req, res, function(err) {
//     if (err) {
//       console.log(err);
//       res.send({error: 'An error occurred while uploading the file'});
//     } else {
//       console.log(req.file);

//       // Insert file information into database
//       db.run("INSERT INTO files (name, path) VALUES (?, ?)", [req.file.filename, req.file.path], function(err) {
//         if (err) {
//           console.log(err);
//           res.send({error: 'An error occurred while saving the file information to the database'});
//         } else {
//           res.send({success: 'File uploaded successfully'});
//         }
//       });
//     }
//   });
// });

// List the files available in the storage
app.get('/files', function(req, res) {
    const directoryPath = path.join(__dirname, 'public', 'uploads');
    fs.readdir(directoryPath, function(err, files) {
      if (err) {
        console.log(err);
        res.send({error: 'An error occurred while retrieving the list of files'});
      } else {
        res.send({files: files});
      }
    });
  });

// Start the server

app.use(cors())
app.options('*', cors()); // enable pre-flight request for all routes
app.listen(8000, function() {
  console.log('Server started on port 8000');
});
db.close();