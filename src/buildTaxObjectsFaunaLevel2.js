'use strict'

module.exports = function ({ aeDb, taxFauna, taxObjectsFaunaLevel1 }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let taxObjectsFaunaLevel2 = result.map((row) => {
        const taxonomie = taxFauna._id
        const klasseName = row[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) => taxObj.Name === klasseName)
        const name = row[1]
        const parent = klasseObject._id
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(taxObjectsFaunaLevel2, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel2
        results.forEach((res, i) => {
          let taxObj = taxObjectsFaunaLevel2[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel2)
      })
    })
  })
}
