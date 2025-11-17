import express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`)
})
