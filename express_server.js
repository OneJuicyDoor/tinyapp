const bcrypt = require("bcryptjs");
const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, authenticateUser, getError, getURLsForUser } = require('./helpers');
const { users, urlDatabase } = require('./database');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.get('/', (req, res) => {
  if(req.session.user_id) {
    return res.redirect("/urls")
  }
  res.redirect("/login")
});

app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId) {
    return res.redirect("/login");
  }
  
  const templateVars = {
    user,
    urls: getURLsForUser(urlDatabase, userId)
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = { user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const error = getError(req.session.user_id, urlDatabase, req.params.id)

  if (error) {
    return res.status(error.status).render("error", { user: users[req.session.user_id], message: error.message });
  }

  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL // Access the longURL property of the url object
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).render("error", { user: users[req.session.user_id], message: "Please login" });;
  }

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  };

  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id
  const error = getError(req.session.user_id, urlDatabase, id)

  if (error) {
    return res.status(error.status).render("error", { user: users[req.session.user_id], message: error.message });
  }

  const newURL = req.body.longURL;
  
  urlDatabase[id].longURL = newURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id
  const error = getError(req.session.user_id, urlDatabase, id)

  if (error) {
    return res.status(error.status).send(error.message)
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.status(404).render("error", { user: users[req.session.user_id], message: 'URL not found' });
  }
  
  res.redirect(url.longURL);
});

app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls");
  } 

  const templateVars = {
    user: null
  };
  res.render('login.ejs', templateVars); 
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).render("error", { user: users[req.session.user_id], message: 'Please fill in details' });
  }

  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(404).render("error", { user: users[req.session.user_id], message: 'User not found' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(404).render("error", { user: users[req.session.user_id], message: 'Password incorrect' });
  }

  req.session.user_id =  user.id;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (user) {
    return res.redirect('/urls');
  } 

  const templateVars = {
    user: null
  };
  res.render('register', templateVars);

});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    return res.status(400).render("error", { user: users[req.session.user_id], message: 'Please fill in details' });
  }
  
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.status(404).render("error", { user: users[req.session.user_id], message: 'User already exists' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  const userRandomID = generateRandomString();

  const user = {
    id: userRandomID,
    email,
    password: hashedPassword
  };

  users[userRandomID] = user;
  req.session.user_id = userRandomID;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
