'use strict'
module.exports = function (aeDb) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/objekte', {
      'include_docs': true
    }, (error, res) => {
      if (error) reject(`error getting objects: ${error}`)
      resolve(res)
    })
  })
}
