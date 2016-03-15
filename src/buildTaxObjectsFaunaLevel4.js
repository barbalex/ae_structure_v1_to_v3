'use strict'

const _ = require('lodash')

module.exports = function (aeDb, taxFauna, taxObjectsFaunaLevel1, taxObjectsFaunaLevel2, taxObjectsFaunaLevel3, objects) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsFaunaLevel4 = _.map(keys, (key) => {
        const taxonomie = taxFauna._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) => taxObj.Name === klasseObjektName)
        const ordnungObjektName = key[1]
        const ordnungObject = taxObjectsFaunaLevel2.find(
          (taxObj) => taxObj.Name === ordnungObjektName && taxObj.parent === klasseObject._id
        )
        const familieName = key[2]
        const familieObject = taxObjectsFaunaLevel3.find(
          (taxObj) => taxObj.Name === familieName && taxObj.parent === ordnungObject._id
        )
        const name = key[3]
        const parent = familieObject._id
        const objId = key[4]
        const object = objects.find((obj) => obj._id === objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          Objekt: {
            id: objId,
            Eigenschaften: eigenschaften
          },
          parent: parent
        }
      })
      aeDb.save(taxObjectsFaunaLevel4, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel4
        results.forEach((res, i) => {
          let taxObj = taxObjectsFaunaLevel4[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel4)
      })
    })
  })
}
