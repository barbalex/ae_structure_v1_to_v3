'use strict'

module.exports = function ({ aeDb, taxFauna, taxObjectsFaunaLevel1 }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let buildTaxObjectsFaunaLevel2 = result.map((row) => {
        const taxonomie = taxFauna._id
        const name = row[1]
        const parentName = row[0]
        const parentObject = taxObjectsFaunaLevel1.find((taxObj) => taxObj.Name === parentName)
        const parent = parentObject._id
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(buildTaxObjectsFaunaLevel2, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update buildTaxObjectsFaunaLevel2
        results.forEach((res, i) => {
          let taxObj = buildTaxObjectsFaunaLevel2[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(buildTaxObjectsFaunaLevel2)
      })
    })
  })
}
