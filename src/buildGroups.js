'use strict'

const uuid = require('node-uuid')
const groups = require('./groups.json')

module.exports = function (sourceDb, aeDb) {
  return new Promise((resolve, reject) => {
    aeDb.save(groups, (error, results) => {
      if (error) reject(`error saving groups: ${error}`)
      // update nonLrTaxonomies
      console.log('Groups built')
      resolve(true)
    })
  })
}
