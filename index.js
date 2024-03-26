const express = require('express')
const morgan = require('morgan')

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
]

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/', (request, response) => {
    response.json(notes)
})

app.post('/api/persons', (request, response) => {
    const note = request.body
    if (!note.content || notes.some(n => n.content === note.content)) {
        response.status(400).json({ error: 'name must be unique or not empty' })
    } else {
        note.id = Math.floor(Math.random() * 1000000)
        notes.push(note)
        response.json(note)
    }
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
