'use strict'

const uuid = require('node-uuid')
let nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = function (aeDb) {
  return new Promise((resolve, reject) => {
    // generate id's
    nonLrTaxonomies.forEach((tax) => {
      tax._id = uuid.v4()
    })
    aeDb.save(nonLrTaxonomies, (error, results) => {
      if (error) reject(`error saving nonLrTaxonomies: ${error}`)
      // update nonLrTaxonomies
      results.forEach((res, i) => {
        let nonLrTaxonomy = nonLrTaxonomies[i]
        nonLrTaxonomy._id = res.id
        nonLrTaxonomy._rev = res.rev
      })
      resolve(nonLrTaxonomies)
    })
  })
}
