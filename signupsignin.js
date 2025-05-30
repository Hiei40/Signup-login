const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE_PATH = "users.json";

function readUsers() {
  const data = fs.readFileSync(FILE_PATH, "utf8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

app.post("/user", (req, res) => {
  const users = readUsers();
  const { name, age, email } = req.body;

  const emailExists = users.some(user => user.email === email);
  if (emailExists) {
    return res.status(404).json({ message: "Email already exists." });
  }

  const id = users.length + 1;
  users.push({ id, name, age, email });
  writeUsers(users);

  res.json({ message: "User added successfully." });
});

app.patch("/user/:id", (req, res) => {
  const users = readUsers();
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.json({ message: "User ID not found." });
  }

  const { name, age, email } = req.body;
  if (name) user.name = name;
  if (age) user.age = age;
  if (email) user.email = email;

  writeUsers(users);
  res.status(201).json({ message: "User age updated successfully." });
});

app.delete("/user/:id", (req, res) => {
  let users = readUsers();
  const userId = parseInt(req.params.id);
  const initialLength = users.length;

  users = users.filter(u => u.id !== userId);

  if (users.length === initialLength) {
    return res.status(404).json({ message: "User ID not found." });
  }

  writeUsers(users);
  res.json({ message: "User deleted successfully." });
});

app.get("/user", (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get("/user/:id", (req, res) => {
  const users = readUsers();
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.json({ message: "User not found." });
  }

  res.json(user);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
