const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(request.body.password, 10)
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO
        user (username, name, password, gender, location)
      VALUES
        (
          '${username}',
          '${name}',
          '${hashedPassword}',
          '${gender}',
          '${location}'
        )`
    const dbResponse = await db.run(createUserQuery)
    const newUserId = dbResponse.lastID
    response.send(`Created new user with ${newUserId}`)
  } else {
    response.status = 400
    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid User')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      response.send('Login Success!')
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})

// 1. Installing Third-party package bcrypt
// Storing the passwords in plain text within a database is not a good idea since they can be misused, So Passwords should be encrypted

// bcrypt package provides functions to perform operations like encryption, comparison, etc

// bcrypt.hash() uses various processes and encrypts the given password and makes it unpredictable
// bcrypt.compare() function compares the password entered by the user and hash against each other


// Status Codes	Status Text ID
// 200	OK
// 204	No Response
// 301	Moved Permanently
// 400	Bad Request
// 403	Forbidden
// 401	Unauthorized

// const express = require('express')
// const {open} = require('sqlite')
// const sqlite3 = require('sqlite3')
// const app = express()
// const path = require('path')

// const dbPath = path.join(__dirname, 'goodreads.db') // Assume there is goodreads.db database
// let db = null

// const initializeDBAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     })
//     app.listen(3000)
//   } catch (e) {
//     console.log(`DB Error: ${e.message}`)
//     process.exit(1)
//   }
// }

// app.get('/books/:bookId', async (request, response) => {
//   const {bookId} = request.params
//   const getBookQuery = `
//     SELECT
//       *
//     FROM
//       book
//     WHERE
//       book_id = ${bookId};`
//   const book = db.get(getBookQuery)
//   console.log(book)
//   response.send(book)
// })

// initializeDBAndServer()
