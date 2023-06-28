function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  
  return randomString;
}


const express = require("express");
const { post } = require("request");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const users = {
  
}

app.use(cookieParser())
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("http://localhost:8080/urls");
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString(); // create a new id with random letters
  urlDatabase[id] = req.body.longURL // add the new url to the database
  res.redirect(`/urls/${id}`) //rederect 
});

app.get("/register", (req,res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
if (email === "" || password === "") {
  res.sendStatus(400);
  return;
}

const existingUser = Object.values(users).find(user => user.email === email)
if (existingUser) {
  res.sendStatus(400);
  return;
}
  const userRandomID = generateRandomString();

  const user = {
    id: userRandomID,
    email: email,
    password: password,
  };

  users[userRandomID] = user;
  res.cookie("userRandomID", userRandomID);
  console.log(users);
  res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userRandomID; // Get the user ID from the cookie
  const user = users[userId]; // Look up the user object using the ID

  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.userRandomID; // Get the user ID from the cookie
  const user = users[userId]; // Look up the user object using the ID
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = {
    user: user,
    id: id,
    longURL: longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});