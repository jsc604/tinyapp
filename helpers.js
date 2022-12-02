const getUserByEmail = (email, database) => {
  let user = '';
  for (let id in database) {
    if (database[id].email === email) {
      user = database[id];
    }
  }
  return user;
};

module.exports = { getUserByEmail };