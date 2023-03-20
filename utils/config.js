require('dotenv').config()

const PORT = process.env.PORT || 3001
const mongoUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_mongoUrl
  : process.env.mongoUrl

module.exports = {
  mongoUrl,
  PORT
}