'use strict'

let nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = function (aeDb) {
  return new Promise((resolve, reject) => {
    // console.log('buildTaxonomiesNonLr would save', nonLrTaxonomies)
    resolve(true)
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
