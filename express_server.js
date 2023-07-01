const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
};

const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const { getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {}; // User database

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// Delete URL endpoint
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('http://localhost:8080/urls');
});

// Login endpoint
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (user && user.password === password) {
    res.cookie('userRandomID', user.id);
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('userRandomID');
  res.redirect('/urls');
});

// Edit URL endpoint
app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/${id}`);
});

// Create URL endpoint
app.post('/urls', (req, res) => {
  console.log(req.body);
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// Registration page
app.get('/register', (req, res) => {
  res.render('urls_registration');
});

// Login page
app.get('/login', (req, res) => {
  res.render('urls_loginpage.ejs');
});

// User registration endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.sendStatus(400);
    return;
  }

  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    res.sendStatus(400);
    return;
  }

  const userRandomID = generateRandomString();

  const user = {
    id: userRandomID,
    email: email,
    password: password
  };

  users[userRandomID] = user;
  res.cookie('userRandomID', userRandomID);
  console.log('astring', users);
  res.redirect('/urls');
});

// Redirect to longURL when accessing the shortURL
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// Create new URL page
app.get('/urls/new', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  const templateVars = {
    user: user
  };
  res.render('urls_new', templateVars);
});

// URL index page
app.get('/urls', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  console.log(userId);
  console.log(user);
  res.render('urls_index', templateVars);
});

// Show specific URL page
app.get('/urls/:id', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = {
    user: user,
    id: id,
    longURL: longURL
  };
  res.render('urls_show', templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
