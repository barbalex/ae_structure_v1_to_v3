'use strict'

const _ = require('lodash')

module.exports = (aeDb) => {
  return new Promise((resolve, reject) => {
    const levels = [1, 2, 3, 5]
    aeDb.view('artendb/baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      console.log('buildTaxObjectsFauna, baumFauna, names of level ' + level, names)
      resolve(true)
      const taxonomyObjects = result.map((name) => {
        return {
          Typ: 'Taxonomie-Objekt',
          Name: name,
          children: []
        }
      })/*
      aeDb.save(taxonomies, (error, result) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        resolve(result.rows)
      })*/
    })
  })
}
