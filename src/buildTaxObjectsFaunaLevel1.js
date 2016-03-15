'use strict'

module.exports = function ({ aeDb, taxFauna }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let taxObjectsFaunaLevel1 = result.map((name) => {
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxFauna._id,
          Name: name
        }
      })
      aeDb.save(taxObjectsFaunaLevel1, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel1
        results.forEach((res, i) => {
          let taxObj = taxObjectsFaunaLevel1[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel1)
      })
    })
  })
}
