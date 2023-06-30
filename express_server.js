function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

function authenticateUser(email, password) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      return userId;
    }
  }
  return false;
}

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {};

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID1'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID2'
  }
};

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('http://localhost:8080/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = authenticateUser(email, password);
  if (userID) {
    res.cookie('userRandomID', userID);
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userRandomID');
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id].longURL = newURL;
  res.redirect(`/urls/${id}`);
});

app.post('/urls', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  if (!user) {
    res.status(401).send('You must be logged in to shorten URLs.');
  } else {
    console.log(req.body); // Log the POST request body to the console
    const id = generateRandomString(); // create a new id with random letters
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: userId
    }; // add the new url to the database
    res.redirect(`/urls/${id}`); // redirect
  }
});

app.get('/register', (req, res) => {
  const userId = req.cookies.userRandomID;
  if (userId && users[userId]) {
    res.redirect('/urls');
  } else {
    res.render('urls_registration');
  }
});

app.get('/login', (req, res) => {
  const userId = req.cookies.userRandomID;
  if (userId && users[userId]) {
    res.redirect('/urls');
  } else {
    res.render('urls_loginpage.ejs');
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.sendStatus(400);
    return;
  }

  const existingUser = Object.values(users).find((user) => user.email === email);
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
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];

  if (!urlEntry) {
    res.status(404).send('Short URL not found');
  } else {
    const longURL = urlEntry.longURL;
    res.redirect(longURL);
  }
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: user
    };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls', (req, res) => {
  const userId = req.cookies.userRandomID; // Get the user ID from the cookie
  const user = users[userId]; // Look up the user object using the ID

  const userURLs = {};
  for (const id in urlDatabase) {
    const urlEntry = urlDatabase[id];
    if (urlEntry.userID === userId) {
      userURLs[id] = urlEntry.longURL;
    }
  }

  const templateVars = {
    user: user,
    urls: userURLs
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies.userRandomID; // Get the user ID from the cookie
  const user = users[userId]; // Look up the user object using the ID
  const id = req.params.id;
  const urlEntry = urlDatabase[id];

  if (!urlEntry || urlEntry.userID !== userId) {
    res.status(404).send('URL not found');
  } else {
    const templateVars = {
      user: user,
      id: id,
      longURL: urlEntry.longURL
    };
    res.render('urls_show', templateVars);
  }
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
