const http = require("http");
const fs   = require("fs");
const url  = require("url");

const FILE_PATH = "users.json";

function readUsers() {
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading/parsing users.json:", err);
    throw err;
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing users.json:", err);
    throw err;
  }
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        // No body sent
        resolve({});
      } else {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(new Error("Invalid JSON body"));
        }
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendError(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message }));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;      
  const method   = req.method;              

  let trimmedPath = pathname.replace(/\/+$/, "");
  if (trimmedPath === "") trimmedPath = "/";
  const parts = trimmedPath.split("/"); 

  if (method === "POST" && trimmedPath === "/user") {
    try {
      const body = await parseRequestBody(req);
      const { name, age, email } = body;

      if (!name || !age || !email) {
        return sendError(res, 400, "name, age, and email are required.");
      }

      const users = readUsers();
      const emailExists = users.some(u => u.email === email);
      if (emailExists) {
        return sendError(res, 409, "Email already exists."); 
      }

      const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
      const newUser = { id, name, age, email };
      users.push(newUser);
      writeUsers(users);

      sendJson(res, 201, { message: "User added successfully.", user: newUser });
    } catch (err) {
      if (err.message === "Invalid JSON body") {
        return sendError(res, 400, "Invalid JSON in request body.");
      }
      console.error(err);
      sendError(res, 500, "Internal Server Error");
    }
    return;
  }

  if (parts[1] === "user" && parts.length === 3) {
    const idFromUrl = parseInt(parts[2], 10);
    if (isNaN(idFromUrl)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    if (method === "GET") {
      try {
        const users = readUsers();
        const user = users.find(u => u.id === idFromUrl);
        if (!user) {
          return sendError(res, 404, "User not found.");
        }
        return sendJson(res, 200, user);
      } catch (err) {
        console.error(err);
        return sendError(res, 500, "Internal Server Error");
      }
    }

    if (method === "PATCH") {
      try {
        const body = await parseRequestBody(req);
        const { name, age, email } = body;

        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === idFromUrl);
        if (userIndex === -1) {
          return sendError(res, 404, "User ID not found.");
        }

        if (email) {
          const dup = users.some(u => u.email === email && u.id !== idFromUrl);
          if (dup) {
            return sendError(res, 409, "Email already in use by another user.");
          }
          users[userIndex].email = email;
        }
        if (name) users[userIndex].name = name;
        if (age)  users[userIndex].age = age;

        writeUsers(users);
        return sendJson(res, 200, { message: "User updated successfully.", user: users[userIndex] });
      } catch (err) {
        if (err.message === "Invalid JSON body") {
          return sendError(res, 400, "Invalid JSON in request body.");
        }
        console.error(err);
        return sendError(res, 500, "Internal Server Error");
      }
    }

    if (method === "DELETE") {
      try {
        let users = readUsers();
        const initialCount = users.length;
        users = users.filter(u => u.id !== idFromUrl);

        if (users.length === initialCount) {
          return sendError(res, 404, "User ID not found.");
        }

        writeUsers(users);
        return sendJson(res, 200, { message: "User deleted successfully." });
      } catch (err) {
        console.error(err);
        return sendError(res, 500, "Internal Server Error");
      }
    }

    return sendError(res, 405, "Method Not Allowed");
  }

  if (method === "GET" && trimmedPath === "/user") {
    try {
      const users = readUsers();
      return sendJson(res, 200, users);
    } catch (err) {
      console.error(err);
      return sendError(res, 500, "Internal Server Error");
    }
  }

  sendError(res, 404, "Not Found");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
