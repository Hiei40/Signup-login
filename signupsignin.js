// const express = require('express');
// const CryptoJS = require('crypto-js');
// const app = express();

// app.use(express.json());

// app.post('/decrypt', (req, res) => {
//   try {
//     const { encryptedData, keyBase64, ivBase64 } = req.body;

//     if (!encryptedData || !keyBase64 || !ivBase64) {
//       return res.status(400).json({ error: 'encryptedData, keyBase64, and ivBase64 are required' });
//     }

//     const key = CryptoJS.enc.Base64.parse(keyBase64);
//     const iv = CryptoJS.enc.Base64.parse(ivBase64);

//     const decrypted = CryptoJS.AES.decrypt(
//       { ciphertext: CryptoJS.enc.Base64.parse(encryptedData) },
//       key,
//       { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
//     );

//     const text = decrypted.toString(CryptoJS.enc.Utf8);

//     if (!text) {
//       return res.status(400).json({ error: 'Empty or invalid decrypted output' });
//     }

//     res.json({ decryptedText: text });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Decryption API running on port ${PORT}`);
// });

const http = require("http");
const fs = require("fs");

// ثابت لمكان ملف المستخدمين
const FILE_PATH = "users.json";

// دالة لقراءة المستخدمين
function readUsers() {
  const data = fs.readFileSync(FILE_PATH, "utf8");
  return JSON.parse(data || "[]");
}

// دالة لكتابة المستخدمين
function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

// دالة لمساعدة قراءة البودي
function parseBody(req, callback) {
  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const parsed = JSON.parse(body);
      callback(null, parsed);
    } catch (e) {
      callback(e);
    }
  });
}

// إنشاء السيرفر
const server = http.createServer((req, res) => {
  const urlParts = req.url.split("/");
  const method = req.method;

  // route: POST /user
  if (method === "POST" && req.url === "/user") {
    parseBody(req, (err, body) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Invalid JSON" }));
      }

      const users = readUsers();
      const { name, age, email } = body;

      const emailExists = users.some(user => user.email === email);
      if (emailExists) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Email already exists." }));
      }

      const id = users.length + 1;
      users.push({ id, name, age, email });
      writeUsers(users);

      res.writeHead(200);
      res.end(JSON.stringify({ message: "User added successfully." }));
    });
  }

  // route: PATCH /user/:id
  else if (method === "PATCH" && urlParts[1] === "user" && urlParts[2]) {
    const userId = parseInt(urlParts[2]);
    const users = readUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      res.writeHead(200);
      return res.end(JSON.stringify({ message: "User ID not found." }));
    }

    parseBody(req, (err, body) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Invalid JSON" }));
      }

      const { name, age, email } = body;
      if (name) user.name = name;
      if (age) user.age = age;
      if (email) user.email = email;

      writeUsers(users);
      res.writeHead(201);
      res.end(JSON.stringify({ message: "User age updated successfully." }));
    });
  }

  // route: DELETE /user/:id
  else if (method === "DELETE" && urlParts[1] === "user" && urlParts[2]) {
    const userId = parseInt(urlParts[2]);
    let users = readUsers();
    const initialLength = users.length;

    users = users.filter(u => u.id !== userId);

    if (users.length === initialLength) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: "User ID not found." }));
    }

    writeUsers(users);
    res.writeHead(200);
    res.end(JSON.stringify({ message: "User deleted successfully." }));
  }

  // route: GET /user
  else if (method === "GET" && req.url === "/user") {
    const users = readUsers();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  }

  // route: GET /user/:id
  else if (method === "GET" && urlParts[1] === "user" && urlParts[2]) {
    const userId = parseInt(urlParts[2]);
    const users = readUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      res.writeHead(200);
      return res.end(JSON.stringify({ message: "User not found." }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
  }

  // غير كده
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found." }));
  }
});

// تشغيل السيرفر
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});