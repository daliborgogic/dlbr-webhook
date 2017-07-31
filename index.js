'use strict'
const fs = require('fs')
const express = require('express')
const app = express()




const contentful = require('contentful')
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

client.sync({
  initial: true,
})
.then(response => {
  return new Promise((resolve, reject) => {
    fs.writeFile('data.json', JSON.stringify(response), (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
})
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.json({entries: []})
})

const PORT = process.env.PORT || 5000
app.listen(PORT, (_ =>
  console.log(`*:${PORT}`)
))
