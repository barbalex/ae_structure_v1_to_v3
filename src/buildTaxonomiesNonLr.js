'use strict'

const nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = (aeDb) => {
  return new Promise((resolve, reject) => {
    // console.log('buildTaxonomiesNonLr would save', nonLrTaxonomies)
    resolve(true)
    /*aeDb.save(nonLrTaxonomies, (error, result) => {
      if (error) reject(`error saving nonLrTaxonomies: ${error}`)
      resolve(true)
    })*/
  })
}
