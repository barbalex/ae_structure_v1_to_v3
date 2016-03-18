'use strict'

const buildTaxObjectsMooseLevel1 = require('./buildTaxObjectsMooseLevel1.js')
const buildTaxObjectsMooseLevel2 = require('./buildTaxObjectsMooseLevel2.js')
const buildTaxObjectsMooseLevel3 = require('./buildTaxObjectsMooseLevel3.js')

let taxObjectsMooseLevel1 = null
let taxObjectsMooseLevel2 = null
let taxObjectsMooseLevel3 = null

module.exports = function (aeDb, taxMoose, objects) {
  return new Promise((resolve, reject) => {
    buildTaxObjectsMooseLevel1(aeDb, taxMoose)
      .then((result) => {
        taxObjectsMooseLevel1 = result
        console.log('taxObjectsMooseLevel1', taxObjectsMooseLevel1.slice(0, 2))
        return buildTaxObjectsMooseLevel2(aeDb, taxMoose, taxObjectsMooseLevel1)
      })
      .then((result) => {
        taxObjectsMooseLevel2 = result
        console.log('taxObjectsMooseLevel2', taxObjectsMooseLevel2.slice(0, 2))
        return buildTaxObjectsMooseLevel3(aeDb, taxMoose, taxObjectsMooseLevel1, taxObjectsMooseLevel2, objects)
      })
      .then((result) => {
        taxObjectsMooseLevel3 = result
        console.log('taxObjectsMooseLevel3', taxObjectsMooseLevel3.slice(0, 2))
        console.log('finished building fauna objects')
        resolve(taxObjectsMooseLevel1, taxObjectsMooseLevel2, taxObjectsMooseLevel3)
      })
      .catch((error) => reject(error))
  })
}
