const getUserByEmail = function(email, urlDatabase) {
    for (const userId in urlDatabase) {
      const user = urlDatabase[userId];
      if (user.email === email) {
        return user;
      }
    }
    return undefined; // Return undefind if user not found
  };
  
  module.exports = { getUserByEmail };
