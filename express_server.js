const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
};

function authenticateUser(email, password) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && bcrypt.compareSync(password, user.hashedPassword)) {
      return userId;
    }
  }
  return false;
}

const bcrypt = require("bcryptjs");
const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const { getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'example@example.com',
    hashedPassword: 'exampleHashedPassword'
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('http://localhost:8080/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (user && bcrypt.compareSync(password, user.hashedPassword)) {
    const userId = user.id;
    const hashedUserId = bcrypt.hashSync(userId, 10);
    res.cookie('userRandomID', userId);
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});

app.get('/login', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render('urls_loginpage.ejs', templateVars);
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
  let user = users[userId];
  console.log(req.body);
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  };
  res.redirect(`/urls/${id}`);
});

app.get('/register', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];

  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: null
    };
    res.render('urls_registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10)
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
    hashedPassword: hashedPassword
  };

  users[userRandomID] = user;
  res.cookie('userRandomID', userRandomID);
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    res.status(404).send('URL not found');
    return;
  }
  res.redirect(url.longURL);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];
  if (!userId) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: user
  };
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];
  if (!userId) {
    res.redirect("/login");
    return;
  }
  
  const userURLs = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      userURLs[id] = urlDatabase[id].longURL;
    }
  }

  const templateVars = {
    user: user,
    urls: userURLs
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies.userRandomID;
  const user = users[userId];
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!userId || !url || url.userID !== userId) {
    res.status(404).send('URL not found');
    return;
  }
  const templateVars = {
    user: user,
    id: id,
    longURL: url.longURL // Access the longURL property of the url object
  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
