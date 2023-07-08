const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined; // Return undefind if user not found
};

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

const getURLsForUser = (urlDatabase, userId) => {
  const userURLs = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      userURLs[id] = urlDatabase[id].longURL;
    }
  }

  return userURLs
}

const getError = (userId, urlDatabase, id) => {
  if (!userId) {
    return { status: 403, message: "Unauthorized"}
  }

  if (!urlDatabase[id]) {
    return { status: 404, message: "URL does not exist"}
  }

  if (userId !== urlDatabase[id].userID) {
    return { status: 403, message: "Unauthorized"}
  }
}

module.exports = { getUserByEmail, generateRandomString, authenticateUser, getURLsForUser, getError };
