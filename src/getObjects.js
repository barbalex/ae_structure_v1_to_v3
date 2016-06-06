'use strict'
module.exports = function (sourceDb) {
  return new Promise((resolve, reject) => {
    sourceDb.view('ae/prov_objekte', {
      'include_docs': true
    }, (error, res) => {
      if (error) {
        console.log('getObject.js, error', error)
        reject(`error getting objects: ${error}`)
      }
      const objects = res.map((doc) => doc)
      resolve(objects)
    })
  })
}
