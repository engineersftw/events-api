const nockBack = require('nock').back
const path = require('path')

nockBack.fixtures = path.join(__dirname, '../fixtures')
nockBack.setMode('record')

const nockVCR = function (vcrTape, callback) {
  return nockBack(vcrTape)
    .then( ({ nockDone }) => {
      return callback().then(nockDone)
    })
}

module.exports = nockVCR
