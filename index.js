const express = require('express')
const fileUpload = require("express-fileupload")
const path = require("path")
const fs = require('fs')
const {parse} = require('csv-parse');

const port = 3000

const app = express()

app.use(
  fileUpload()
)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.")
  }

  const file = req.files.csvFile
  console.log(`Got file: ${file.name}`)
  //console.log(file)
  processCSV(file)
})

const processCSV = (csvFile) => {
  parse(csvFile.data, { columns: true }, function (err, data) {
    console.log(data)
  })
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})