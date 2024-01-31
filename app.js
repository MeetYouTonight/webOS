const express = require('express')
const path = require('path')
// var cors = require('cors')

const app = express()
const port = 3000


// app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/instatrend', express.static(path.join(__dirname, 'public', 'instaTrendRedirect.html')))

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})