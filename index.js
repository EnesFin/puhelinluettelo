const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('build'));
app.use(morgan((tokens, req, res) => {
  return 
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time', 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}));

// Routes
app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result);
  });
});

app.get('/info', (request, response) => {
  const currentDate = new Date();
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    second: '2-digit',
    timeZoneName: 'long',
  };

  const formattedDateTime = currentDate.toLocaleString('en-US', options);
  Person.countDocuments({}).then(count => {
    console.log('Number of people in the collection:', count);
    const response_text = `Phonebook has info for ${count} people`;
    response.end(response_text + '\n' + formattedDateTime);
  }).catch(error => {
    console.error('Error:', error);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => response.json(person))
    .catch(error => next(error));
});

app.delete('/api/persons/:id/', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end();
  })
    .catch(error => next(error));
});

app.put('/api/persons/:id/', (request, response, next) => {
  const { number } = request.body;
  Person.findOneAndUpdate(request.params.id).then(result => {
    result.number = number;
    result.save();
    response.json(result);
  })
    .catch(error => {
      next(error);
    });
});

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;
  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' });
  }
  number.trim();
  const newPerson = new Person({
    name,
    number,
  });

  newPerson.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => next(error));
});

// Error handling
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

// Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});