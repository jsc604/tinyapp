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
    const user = getUserByEmail("user@example.com", testUsers);
    const userId = user.id;
    const expectedUserID = "userRandomID";
    assert.equal(userId, expectedUserID);
  });

  it('should return undefined with a non-existent email', function() {
    const user = getUserByEmail("user@ele.co", testUsers);
    const userId = user.id;
    const expectedUserID = undefined;
    assert.equal(userId, expectedUserID);
  });
});
