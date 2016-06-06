'use strict'
module.exports = function (sourceDb) {
  return new Promise((resolve, reject) => {
    sourceDb.view('ae/taxonomy_objects', {
      'include_docs': true
    }, (error, res) => {
      if (error) reject(`error getting objects: ${error}`)
      const objects = res.map((doc) => doc)
      resolve(objects)
    })
  })
}
