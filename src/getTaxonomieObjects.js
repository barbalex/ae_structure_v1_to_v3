'use strict'
module.exports = function (aeDb) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/taxonomie_objekte', {
      'include_docs': true
    }, (error, res) => {
      if (error) reject(`error getting objects: ${error}`)
      const objects = res.map((doc) => doc)
      resolve(objects)
    })
  })
}
