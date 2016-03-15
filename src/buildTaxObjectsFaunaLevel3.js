'use strict'

module.exports = function ({ aeDb, taxFauna, taxObjectsFaunaLevel1, taxObjectsFaunaLevel2 }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let taxObjectsFaunaLevel3 = result.map((row) => {
        const taxonomie = taxFauna._id
        const klasseObjektName = row[0]
        const klasseObject = taxObjectsFaunaLevel1.find(
          (taxObj) => taxObj.Name === klasseObjektName
        )
        const ordnungName = row[1]
        const ordnungObject = taxObjectsFaunaLevel2.find(
          (taxObj) => taxObj.Name === ordnungName && taxObj.parent === klasseObject._id
        )
        const name = row[2]
        const parent = ordnungObject._id
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(taxObjectsFaunaLevel3, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel3
        results.forEach((res, i) => {
          let taxObj = taxObjectsFaunaLevel3[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel3)
      })
    })
  })
}
