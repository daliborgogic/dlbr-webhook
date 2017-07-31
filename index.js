'use strict'
const fs = require('fs')
const express = require('express')
const webhookServer = require('contentful-webhook-server')({
  path: './',
  username: process.env.CONTENTFUL_WEBHOOK_USERNAME,
  password: process.env.CONTENTFUL_WEBHOOK_PASSWORD
})
const app = express()
const PORT = process.env.PORT || 5000
const contentful = require('contentful')
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

client.sync({
  initial: true
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
  res.send('Express response')
})

app.use('/', webhookServer.mountAsMiddleware)

const server = app.listen(PORT, (() =>
  console.log(`*:${PORT}`)
))

// Handler for all successful requests
// Is not emitted when an error occurs
webhookServer.on('ContentManagement.*', (topic, req) =>
  // topic is available as string
  // e.g. ContentManagement.Asset.unpublish
  console.log('Request came in for: ' + topic)
)

webhookServer.on('ContentManagement.ContentType.publish', (req =>
  console.log('A content type was published!')
))

webhookServer.on('ContentManagement.ContentType.unpublish', (req =>
  console.log('A content type was unpublished!')
))

webhookServer.on('ContentManagement.Entry.publish', (req =>
  console.log('An entry was published!')
))

webhookServer.on('ContentManagement.Entry.unpublish', (req =>
  console.log('An entry was unpublished!')
))

webhookServer.on('ContentManagement.Asset.publish', (req =>
  console.log('An asset was published!')
))

webhookServer.on('ContentManagement.Asset.unpublish', (req =>
  console.log('An asset was unpublished!')
))

// Handle errors
webhookServer.on('ContentManagement.error', (err, req) =>
  console.log(err)
)

function cleanup () {
  console.log(` Bye .`)
  process.exit(0)
}

// If the Node process ends, cleanup existing connections
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
