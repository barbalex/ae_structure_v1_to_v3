'use strict'
module.exports = function (db) {
  return new Promise((resolve, reject) => {
    db.view('artendb/taxonomy_objects', {
      'include_docs': true
    }, (error, res) => {
      if (error) reject(`error getting objects: ${error}`)
      const objects = res.map((doc) => doc)
      resolve(objects)
    })
  })
}
