function mutationResponse (code = 500, success = false, message = '', data = {}) {
  return { ...data, code, success, message }
}

module.exports = { mutationResponse }
