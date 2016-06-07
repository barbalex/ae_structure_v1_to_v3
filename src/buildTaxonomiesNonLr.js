'use strict'

const uuid = require('node-uuid')
let nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = function (db) {
  return new Promise((resolve, reject) => {
    // generate id's
    nonLrTaxonomies.forEach((tax) => {
      tax._id = uuid.v4()
    })
    db.save(nonLrTaxonomies, (error, results) => {
      if (error) reject(`error saving nonLrTaxonomies: ${error}`)

      // update nonLrTaxonomies
      results.forEach((res, i) => {
        nonLrTaxonomies[i]._rev = res.rev
      })
      resolve(nonLrTaxonomies)
    })
  })
}
