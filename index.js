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
      fs.writeFile('entries.json', JSON.stringify(response['entries']), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  })
  .catch(err => console.log(err))

app.get('/', (req, res) => {
   fs.readFile('data.json', (err, data, i) => {
     if (err) console.error(err)
    let obj = JSON.parse(data)
     res.json(obj)
   })
})

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({type: 'application/*'}))
app.use('/', webhookServer.mountAsMiddleware)


const server = app.listen(PORT, (() =>
  console.log(`*:${PORT}`)
))

webhookServer.on('ContentManagement.Entry.publish', (req => {
  console.log('An entry was published!')
  fs.readFile('entries.json', (err, data, id) => {
    if (err) console.error(err)
    let obj = JSON.parse(data)
    obj.push(req.body)
    fs.writeFile('entries.json', JSON.stringify(obj), 'utf-8', (err, data) => {
      if (err) console.error(err)
      console.log('done!')
    })
  })
}))

webhookServer.on('ContentManagement.Entry.unpublish', (req => {
  console.log('An entry was unpublished!')
  fs.readFile('entries.json', (err, data, id) => {
    if (err) console.error(err)
    let obj = JSON.parse(data)
    remove(obj, e => e.sys.id === req.body.sys.id)
    fs.writeFile('entries.json', JSON.stringify(obj), 'utf-8', (err, data) => {
      if (err) console.error(err)
      console.log('done!')
    })
  })

}))

function cleanup () {
  console.log(` Bye .`)
  process.exit(0)
}

// If the Node process ends, cleanup existing connections
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
