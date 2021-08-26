const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const account = users.find((users) => users.username === username)

  if (!account) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.account = account;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((users) => users.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({
      error: 'User already exists'
    })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user)

  return response.status(200).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { account } = request

  return response.json(account.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { account } = request;

  const todoCreation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  account.todos.push(todoCreation)

  return response.status(201).json(todoCreation)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { account } = request;
  const { id } = request.params

  const todoUpdate = account.todos.find(todo => todo.id === id)

  if(!todoUpdate){
    return response.json({ error: 'Todo not found'})
  }

  todoUpdate.title = title
  todoUpdate.deadline = new Date(deadline)

  return response.json(todoUpdate )
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params

  const todoUpdate = account.todos.find(todo => todo.id === id)

  if(!todoUpdate){
    return response.json({ error: 'Todo not found'})
  }

  todoUpdate.done = true 

  return response.json(todoUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params

  const index = account.todos.findIndex(todo => todo.id === id);

  if(index === -1){
    return response.json({ error: 'Todo not found'})
  }

   account.todos.splice(index, 1);

   return response.status(204).json()
});

module.exports = app;