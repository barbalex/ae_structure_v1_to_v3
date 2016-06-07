'use strict'

const uuid = require('node-uuid')
const groups = require('./groups.json')

module.exports = function (db) {
  return new Promise((resolve, reject) => {
    db.save(groups, (error, results) => {
      if (error) reject(`error saving groups: ${error}`)
      // update nonLrTaxonomies
      console.log('Groups built')
      resolve(true)
    })
  })
}
