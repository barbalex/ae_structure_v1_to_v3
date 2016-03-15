'use strict'

module.exports = function ({ aeDb, taxFauna, taxObjectsFaunaLevel1, taxObjectsFaunaLevel2, taxObjectsFaunaLevel3, objects }) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      let taxObjectsFaunaLevel4 = result.map((row) => {
        const taxonomie = taxFauna._id
        const klasseObjektName = row[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) => taxObj.Name === klasseObjektName)
        const ordnungObjektName = row[1]
        const ordnungObject = taxObjectsFaunaLevel2.find(
          (taxObj) => taxObj.Name === ordnungObjektName && taxObj.parent === klasseObject._id
        )
        const familieName = row[2]
        const familieObject = taxObjectsFaunaLevel3.find(
          (taxObj) => taxObj.Name === familieName && taxObj.parent === ordnungObject._id
        )
        const name = row[3]
        const parent = familieObject._id
        const objId = row[4]
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
