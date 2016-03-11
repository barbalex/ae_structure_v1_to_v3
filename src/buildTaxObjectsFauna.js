'use strict'

module.exports = (aeDb) => {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      console.log('buildTaxObjectsFauna got this from baumFauna, group_level 1', result)
      resolve(true)
      /*const taxonomies = result.rows.map((doc) => {
        return {
          Typ: 'Taxonomie-Objekt',
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
      aeDb.save(taxonomies, (error, result) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        resolve(result.rows)
      })*/
    })
  })
}
