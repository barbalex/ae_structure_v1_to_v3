'use strict'

module.exports = function ({ aeDb, taxFauna }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let taxonomyObjectsFaunaLevel1 = result.map((name) => {
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxFauna._id,
          Name: name
        }
      })
      aeDb.save(taxonomyObjectsFaunaLevel1, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxonomyObjectsFaunaLevel1
        results.forEach((res, i) => {
          let taxObj = taxonomyObjectsFaunaLevel1[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxonomyObjectsFaunaLevel1)
      })
    })
  })
}
