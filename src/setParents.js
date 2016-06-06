'use strict'

const couchPass = require('../couchPass.json')
const cradle = require('cradle')
const connection = new (cradle.Connection)(`127.0.0.1`, 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const sourceDb = connection.database('artendb')
const aeDb = connection.database('ae')
const setParentInLrTaxObjects = require('./setParentInLrTaxObjects.js')

setParentInLrTaxObjects(sourceDb, aeDb)
