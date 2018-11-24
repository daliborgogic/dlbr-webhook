'use strict'
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const remove = require('lodash.remove')
const contentful = require('contentful')

const {
  PORT = 5000,
  CONTENTFUL_WEBHOOK_USERNAME,
  CONTENTFUL_WEBHOOK_PASSWORD,
  CONTENTFUL_SPACE,
  CONTENTFUL_ACCESS_TOKEN
} = process.env

const username = CONTENTFUL_WEBHOOK_USERNAME
const password = CONTENTFUL_WEBHOOK_PASSWORD
const space = CONTENTFUL_SPACE
const accessToken = CONTENTFUL_ACCESS_TOKEN

const webhookServer = require('./lib/webhook-server')({ username, password })

const client = contentful.createClient({ space, accessToken })

client.sync({ initial: true })
  .then(response => {
    return new Promise((resolve, reject) => {
      fs.writeFile('entries.json', JSON.stringify(response['entries']), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  })
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  return new Promise((resolve, reject) => {
    fs.readFile('entries.json', (err, data) => {
      if (err) reject(err)
      let obj = JSON.parse(data)
      res.json(obj)
      resolve(data)
    })
  })
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({type: 'application/*'}))
app.use('/', webhookServer.mountAsMiddleware)

app.listen(PORT, () =>
  console.log(`*:${PORT}`)
)

function writeFile (file, obj) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(obj), 'utf-8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

webhookServer.on('ContentManagement.Entry.publish', req => {
  // console.log('An entry was published!')
  return new Promise((resolve, reject) => {
    fs.readFile('entries.json', (err, data) => {
      if (err) reject(err)
      let obj = JSON.parse(data)
      obj.push(req.body)
      writeFile('entries.json', obj)
      resolve(data)
    })
  })
})

webhookServer.on('ContentManagement.Entry.unpublish', req => {
  // console.log('An entry was unpublished!')
  return new Promise((resolve, reject) => {
    fs.readFile('entries.json', (err, data) => {
      if (err) reject(err)
      let obj = JSON.parse(data)
      remove(obj, e => e.sys.id === req.body.sys.id)
      writeFile('entries.json', obj)
      resolve(data)
    })
  })
})

function cleanup () {
  console.log(` Bye .`)
  process.exit(0)
}

// If the Node process ends, cleanup existing connections
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
