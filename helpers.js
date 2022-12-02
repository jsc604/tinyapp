const getUserByEmail = (database, email) => {
  for (let id in database) {
    if (database[id].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = getUserByEmail;