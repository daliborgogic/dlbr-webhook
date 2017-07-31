'use strict'
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const remove = require('lodash.remove')
const merge = require('lodash.merge')
const webhookServer = require('contentful-webhook-server')({
  username: process.env.CONTENTFUL_WEBHOOK_USERNAME,
  password: process.env.CONTENTFUL_WEBHOOK_PASSWORD
})
const PORT = process.env.PORT || 5000
const contentful = require('contentful')
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

client.sync({ initial: true })
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
  res.json({status: 200})
})

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({type: 'application/*'}))
app.use('/', webhookServer.mountAsMiddleware)


const server = app.listen(PORT, (() =>
  console.log(`*:${PORT}`)
))

webhookServer.on('ContentManagement.Entry.publish', (req => {
  console.log('An entry was published!')
  console.log(req.body)
}))

webhookServer.on('ContentManagement.Entry.unpublish', (req => {
  console.log('An entry was unpublished!')
  console.log(req.body)
}))

function cleanup () {
  console.log(` Bye .`)
  process.exit(0)
}

// If the Node process ends, cleanup existing connections
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
