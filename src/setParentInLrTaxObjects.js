'use strict'

const getTaxonomieObjects = require('./getTaxonomieObjects.js')

module.exports = function (sourceDb, aeDb) {
  console.log('getting taxonomy objects to set parent')
  getTaxonomieObjects(sourceDb)
    .then((taxObjects) => {
      console.log('got taxonomy objects > now setting parents')
      taxObjects.forEach((taxObject) => {
        if (taxObject.parentObject) {
          const parentTaxObject = taxObjects.find((tO) => {
            if (tO.Objekt && tO.Objekt.id && tO.Objekt.id === taxObject.parentObject) return true
            return false
          })
          if (!parentTaxObject) {
            console.log('no parentTaxObject found for:', taxObject)
          } else {
            taxObject.parent = parentTaxObject._id
            delete taxObject.parentObject
            aeDb.save(taxObject, (error, res) => {
              if (error) console.log('error saving:', taxObject)
            })
          }
        }
      })
    })
    .catch((error) => console.log(error))
}
