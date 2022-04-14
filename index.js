const express = require('express')
const fileUpload = require("express-fileupload")
const path = require("path")
const fs = require('fs')
const {parse} = require('csv-parse')
const Transform = require("stream").Transform

const port = 3000

const app = express()

app.use(
  fileUpload()
)

app.use(express.static('public'))

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.")
  }

  const file = req.files.csvFile
  console.log(`Got file: ${file.name}`)
  processCSV(file, req, res)
})

const processCSV = (csvFile, req, res) => {
  parse(csvFile.data, { columns: true }, function (err, data) {
    console.log(data)
    // const videoJson = JSON.parse(data)
    // var viewHTML = path.join(__dirname, "view.html")
    // res.sendFile(viewHTML).replace(/${TITLE}/gi, 'test')
    //res.send(data[0].video_url)
    const videoData = data[0]
    const replacementTransform = new Transform()
    replacementTransform._transform = function(data, encoding, done) {
        const str = data.toString().replace(/{VIDEO_URL}/gi, videoData.video_url).replace(/{TITLE}/gi, videoData.name)
        this.push(str)
        done()
    }
    let stream = fs.createReadStream('./view.html')
    stream.pipe(replacementTransform)
    .on('end', () => {
        res.write('\n<!-- End -->')
    }).pipe(res)
  })
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})