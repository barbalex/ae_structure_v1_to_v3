'use strict'

const getTaxonomieObjects = require('./getTaxonomieObjects.js')

module.exports = function (aeDb) {
  console.log('getting taxonomy objects to set parent')
  getTaxonomieObjects(aeDb)
    .then((taxObjects) => {
      console.log('got taxonomy objects > now setting parents')
      taxObjects.forEach((taxObject) => {
        if (taxObject.parentObject) {
          const parentTaxObject = taxObjects.find((tO) => tO.Objekt.id === taxObject.parentObject)
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
