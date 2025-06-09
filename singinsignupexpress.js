const express = require('express');
const fs = require('fs');

const FILE_PATH = 'users.json'; 
const app = express();
app.use(express.json()); 

function readUsers() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

// 1. POST /user - Add a new user
app.post('/user', (req, res) => {
  const { name, age, email } = req.body;
  const users = readUsers();
  
  if (users.some(user => user.email === email)) {
    return res.status(404).json({ message: 'Email already exists.' });
  }

  const id = users.length + 1;
  users.push({ id, name, age, email });
  writeUsers(users);
  
  res.status(200).json({ message: 'User added successfully.' });
});

app.patch('/user/:id', (req, res) => {
  const { id } = req.params;
  const { age } = req.body; // Only age is mentioned to update
  const users = readUsers();
  
  const userIndex = users.findIndex(user => user.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  users[userIndex].age = age;
  writeUsers(users);
  
  res.status(200).json({ message: 'User age updated successfully.' });
});

app.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  let users = readUsers();
  
  const userIndex = users.findIndex(user => user.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  users.splice(userIndex, 1);
  writeUsers(users);
  
  res.status(200).json({ message: 'User deleted successfully.' });
});

app.get('/user/getByName', (req, res) => {
  const { name } = req.query;
  const users = readUsers();
  
  const user = users.find(user => user.name === name);
  if (!user) {
    return res.status(404).json({ message: 'User name not found.' });
  }

  res.status(200).json(user);
});

// 5. GET /user - Get all users
app.get('/user', (req, res) => {
  const users = readUsers();
  res.status(200).json(users);
});

app.get('/user/filter', (req, res) => {
  const { minAge } = req.query;
  const users = readUsers();
  
  const filteredUsers = users.filter(user => user.age >= parseInt(minAge) || !minAge);
  if (filteredUsers.length === 0) {
    return res.status(404).json({ message: 'No users found.' });
  }

  res.status(200).json(filteredUsers);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});