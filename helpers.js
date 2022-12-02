const getUserByEmail = (email, database) => {
  let user = '';
  for (let id in database) {
    if (database[id].email === email) {
      user = database[id];
    }
  }
  return user;
};

const returnId = (object, testEmail) => {
  for (let id in object) {
    if (object[id].email === testEmail) {
      return id;
    }
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

module.exports = { getUserByEmail, returnId, generateRandomString };