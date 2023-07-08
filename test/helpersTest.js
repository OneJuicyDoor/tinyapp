const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, 'User ID should match the expected value');
    assert.equal(user.email, "user@example.com", 'User email should match the provided email');
    assert.equal(user.password, "purple-monkey-dinosaur", 'User password should match the provided password');
  });
});
describe('getUserByEmail', function() {
    it('should return undefined for an invalid email', function() {
      const user = getUserByEmail("nonexistent@example.com", testUsers);
      assert.equal(user, undefined, 'User should be undefined for an invalid email');
    });
  });
  