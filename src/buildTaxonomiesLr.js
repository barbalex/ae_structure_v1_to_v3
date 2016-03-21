'use strict'

const uuid = require('node-uuid')

module.exports = function (aeDb) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumLr', {
      startkey: [1],
      endkey: [1, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
      reduce: false,
      'include_docs': true
    }, (error, result) => {
      if (error) reject(`error querying view baumLr: ${error}`)
      // console.log('buildTaxonomiesLr, result from baumLr', result)
      // resolve(true)
      let taxonomies = result.rows.map((row) => {
        const doc = row.doc
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie',
          Name: doc.Taxonomie.Eigenschaften.Taxonomie,
          Label: doc.Taxonomie.Eigenschaften['Einheit-Abkürzung'],
          Beschreibung: doc.Taxonomie.Eigenschaften.Beschreibung,
          Bemerkungen: doc.Taxonomie.Eigenschaften.Bemerkungen,
          Datenstand: null,
          'Einheit-Nrn FNS von': doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS von'],
          'Einheit-Nrn FNS bis': doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS bis'],
          Gruppe: 'Lebensräume',
          Standardtaxonomie: true,
          'Organisation mit Schreibrecht': 'FNS Kt. ZH'
        }
      })
      aeDb.save(taxonomies, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxonomies
        results.forEach((res, i) => {
          taxonomies[i]._rev = res.rev
        })
        resolve(taxonomies)
      })
    })
  })
}
