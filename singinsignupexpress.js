const express = require('express');
const fs = require('fs');

const FILE_PATH = 'users.json'; // Define the file path
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Function to read users from the JSON file
function readUsers() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data || '{}'); // Return object to handle users by id
  } catch (error) {
    return {};
  }
}

// Function to write users to the JSON file
function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

// 1. POST /user - Add a new user
app.post('/user', (req, res) => {
  const { name, age, email } = req.body;
  const users = readUsers();
  
  if (users[email]) { // Check if email exists using email as key
    return res.status(404).json({ message: 'Email already exists.' });
  }

  const id = Object.keys(users).length + 1;
  users[email] = { id, name, age, email };
  writeUsers(users);
  
  res.status(200).json({ message: 'User added successfully.' });
});

// 2. PATCH /user/:id - Update user by ID
app.patch('/user/:id', (req, res) => {
  const { id } = req.params;
  const { age } = req.body;
  const users = readUsers();
  
  const email = Object.keys(users).find(key => users[key].id === parseInt(id));
  if (!email) {
    return res.status(404).json({ message: 'User not found.' });
  }

  users[email].age = age;
  writeUsers(users);
  
  res.status(200).json({ message: 'User age updated successfully.' });
});

// 3. DELETE /user/:id - Delete user by ID
app.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  
  const email = Object.keys(users).find(key => users[key].id === parseInt(id));
  if (!email) {
    return res.status(404).json({ message: 'User not found.' });
  }

  delete users[email];
  writeUsers(users);
  
  res.status(200).json({ message: 'User deleted successfully.' });
});

// 4. GET /user/getByName - Get user by name
app.get('/user/getByName', (req, res) => {
  const { name } = req.query;
  const users = readUsers();
  
  const email = Object.keys(users).find(key => users[key].name === name);
  if (!email) {
    return res.status(404).json({ message: 'User name not found.' });
  }

  res.status(200).json(users[email]);
});

// 5. GET /user - Get all users
app.get('/user', (req, res) => {
  const users = readUsers();
  const allUsers = Object.values(users);
  res.status(200).json(allUsers.length ? allUsers : []);
});

// 6. GET /user/filter - Filter users by minimum age
app.get('/user/filter', (req, res) => {
  const { minAge } = req.query;
  const users = readUsers();
  
  const filteredUsers = Object.values(users).filter(user => !minAge || user.age >= parseInt(minAge));
  if (filteredUsers.length === 0) {
    return res.status(404).json({ message: 'No users found.' });
  }

  res.status(200).json(filteredUsers);
});

// 7. GET /user/:id - Get user by ID
app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  
  const email = Object.keys(users).find(key => users[key].id === parseInt(id));
  if (!email) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json(users[email]);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});