const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();
const csv = require("csv-parser");
const reader = require('xlsx')
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const db = new sqlite3.Database('filedb.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the file DB");
});
// db.serialize(() => {
//   db.run("CREATE TABLE files");
// });
// db.close();
const cors = require('cors');
const { error } = require('console');
// app.post('/upload', function(req, res) {
//   upload(req, res, function(err) {
//     if (err) {
//       console.log(err);
//       res.send({error: 'An error occurred while uploading the file'});
//     } else {
//       console.log(req.file);
//     }
// Create table to store uploaded files
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
  console.log("File is -", req.file)
  if (req.file) {
    filename = req.file.originalname;
    console.log(filename)
    function getExtension(filename) {
      var i = filename.lastIndexOf('.');
      return (i < 0) ? '' : filename.substr(i + 1);
      // console.log(extension)
    }
    let table_query = `CREATE TABLE IF NOT EXISTS FileTable (id INTEGER PRIMARY KEY, filename text,timestamp int, data text) }`
    db.serialize(function(){
      db.run(table_query);
    })
    console.log(getExtension(filename))
    if (getExtension(filename) == "csv") {
      try {
        const uniqueId = uuidv4();
        const timestamp = Date.now();
        let results = [];
        let finalData = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            // results.push(data)
            // let tempData = Object.values(data);
            // finalData.push(tempData)

            let insert_query = `INSERT INTO FileTable (id, filename, timestamp, data) 
            values ('${uniqueId}', '${filename}', ${timestamp}, '${JSON.stringify(data)}')`
          })
          .on('end', () => {
            
            console.log(table_query);
            // let updatedResult = resultsJson[key].forEach(resultsJson[key].size)
            let insert_query = `INSERT INTO FileTable (id, filename, timestamp, data) values ${resultsJson[key].map(e => { return `('${key}', '${filename}', ${timestamp}, '${e}')` }).join(',')}`
            console.log(insert_query);
            // db.serialize(function () {
            //   db.run(insert_query);

              //   for (let i = 0; i < row + 1; i++) {
              //     stmt.run(i);
              //   }
              // stmt.finalize();
            })
          // })
          .on("error", function () {
            console.log(error.message);
          })

      }
      catch (error) {
        console.log(error.message);
      }
    }
    else {
      filename = req.file.originalname;
      // const file = reader.readFile(filename)
      var workbook = XLSX.readFile(filename);
      var sheet_name_list = workbook.SheetNames;
      for (var sheet of workbook.SheetNames) {
        console.log("Sheet: " + sheet);
        var cells = workbook.Sheets[sheet];
        var sql = {
          def: {
            dro: "DROP TABLE IF EXISTS `$table$`;",
            cre: "CREATE TABLE `$table$` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT$cres$ );",
            ins: "INSERT INTO `$table$` ( $columns$ ) VALUES ( $values$ );"
          },
          cmd: {
            dro: {},
            cre: {},
            ins: {},
          },
          cols: {},
          cres: {},
          vals: {}
        };
        sql.cols[sheet] = "";
        sql.cres[sheet] = "";
        sql.vals[sheet] = [];
        var rowindex = 0;
        for (var row = cells.range.R[0]; row <= cells.range.R[1]; row++) {
          sql.vals[sheet][rowindex] = [];
          for (var colindex = XLSX.utils.decode_col(cells.range.C[0]); colindex <= XLSX.utils.decode_col(cells.range.C[1]); colindex++) {
            var col = XLSX.utils.encode_col(colindex);
            var cell = (typeof cells[col + "" + row] != "undefined") ? cells[col + "" + row].v : "";

            if (row == 1) {
              //create table
              sql.cols[sheet] += " ,`" + cell + "`";
              sql.cres[sheet] += ", `" + cell + "` " +
                (cell * 1.0 == cell ? ((cell * 1 + "") == cell ? "INTEGER" : "REAL") : "TEXT");
            } else {
              sql.vals[sheet][rowindex].push(cell + "");
              //console.log(sql.vals[ sheet ]);
            }
          }
          if (row == 1) {
            // drop table
            sql.cmd.dro[sheet] = sql.def.dro
              .replace("$table$", sheet);
            db.exec(sql.cmd.dro[sheet]);

            // create table
            sql.cmd.cre[sheet] = sql.def.cre
              .replace("$table$", sheet)
              .replace("$cres$", sql.cres[sheet]);
            db.exec(sql.cmd.cre[sheet]);

            console.log("Columns: `id`" + sql.cres[sheet]);
            //prepare insert
            sql.cmd.ins[sheet] = sql.def.ins
              .replace("$table$", sheet)
              .replace("$columns$", sql.cols[sheet].substr(2))
              .replace("$values$", sql.cols[sheet].substr(2)
                .replace(/(`[^`]+?`)/g, "?")
              );
            sql.cmd.ins[sheet] = db.prepare(sql.cmd.ins[sheet]);
          } else {
            //insert prepared values
            console.log("Row: " + row, "Values: ", sql.vals[sheet][rowindex]);
            sql.cmd.ins[sheet].run(sql.vals[sheet][rowindex++]);
          }
        }

      }

    }

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
app.get("/", function (req, res) {
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
app.get('/files', function (req, res) {
  const directoryPath = path.join(__dirname, 'public', 'uploads');
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      console.log(err);
      res.send({ error: 'An error occurred while retrieving the list of files' });
    } else {
      res.send({ files: files });
    }
  });
});

// Start the server

app.use(cors())
// enable pre-flight request for all routes
app.listen(8000, function () {
  console.log('Server started on port 8000');
});
db.close();