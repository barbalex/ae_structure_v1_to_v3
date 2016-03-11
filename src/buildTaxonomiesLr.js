'use strict'

module.exports = (aeDb) => {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumLr'/*, {
      startkey: [1],
      endkey: [1, '\u9999', '\u9999', '\u9999', '\u9999', '\u9999'],
      'include_docs': true
    }*/, (error, result) => {
      if (error) reject(`error querying view baumLr: ${error}`)
      console.log('buildTaxonomiesLr, result from baumLr', result)
      resolve(true)
      /*const taxonomies = result.rows.map((doc) => {
        return {
          Typ: 'Taxonomie',
          Name: doc.Taxonomie.Eigenschaften.Taxonomie,
          Label: doc.Taxonomie.Eigenschaften['Einheit-Abkürzung'],
          Beschreibung: doc.Taxonomie.Eigenschaften.Beschreibung,
          Bemerkungen: doc.Taxonomie.Eigenschaften.Bemerkungen,
          Datenstand: null,
          'Einheit-Nrn FNS von': doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS von'],
          'Einheit-Nrn FNS bis': doc.Taxonomie.Eigenschaften['Einheit-Nrn FNS bis'],
          Gruppe: 'Lebensräume',
          Standardtaxonomie: false,
          'Organisation mit Schreibrecht': 'FNS Kt. ZH',
          children: []
        }
      })
      console.log('buildTaxonomiesLr would save', taxonomies)
      resolve(true)*/
      /*aeDb.save(taxonomies, (error, result) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        resolve(result.rows)
      })*/
    })
  })
}
