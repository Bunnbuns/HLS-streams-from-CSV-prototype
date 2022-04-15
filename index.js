const express = require('express')
const fileUpload = require("express-fileupload")
const path = require("path")
const fs = require('fs')
const {parse} = require('csv-parse')
const Transform = require("stream").Transform

const port = 3000

const app = express()

app.use(
  fileUpload(),
  express.static('public')
)

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.")
  }

  const file = req.files.csvFile
  console.log(`Got file: ${file.name}`)
  processCSV(file, req, res)
})

const createVideosHTML = (videosData) => {
  let html = '<div class="flex-container">'
  for (const video of videosData) {
    html += (`
      	<span class="video-item">
      		<video-js id="myPlayer" controls preload="auto" class="video-js" data-setup='{"fluid": true}'>
      			<source src="${video.video_url}" type="application/x-mpegURL">
      		</video-js>
      		<div class="flex-center">
      			<a href="${video.traceid_url}" target="_blank" class="title">${video.name}</a>
      			<span class="flex-grow"></span>
      			<span class="date">${video.creation_time}</span>
      		</div>
      	</span>
    `)
  }
  html += '</div>'
  return html
}

const processCSV = (csvFile, req, res) => {
  parse(csvFile.data, { columns: true }, function (err, data) {
    console.log(data)
    const videoData = data
    const videosHTML = createVideosHTML(videoData)
    const replacementTransform = new Transform()
    replacementTransform._transform = function(data, encoding, done) {
        const str = data.toString().replace(/{videos}/gi, videosHTML)
        this.push(str)
        done()
    }
    let stream = fs.createReadStream('./view.html')
    stream.pipe(replacementTransform)
    .on('end', () => {
        res.write('\n<!-- End -->')
    }).pipe(res)
    if (err) {
      conslole.log(err)
    }
  })
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})