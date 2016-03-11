'use strict'

const nonLrTaxonomies = require('./nonLrTaxonomies.js')

module.exports = (aeDb) => {

  // create nonLrTaxonomies
  nonLrTaxonomies.forEach((tax) => {
    
  })

  aeDb.view('objects', 'objects', {
    'include_docs': true
  }, (error, body) => {
    if (error) return console.log(error)

  })
}
