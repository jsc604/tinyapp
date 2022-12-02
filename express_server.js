const express = require("express");
const app = express();
const PORT = 8089; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const urlDatabase = {
  testShort:
  {
    id: 'testShort',
    longURL: 'google.ca',
    userID: 'testUser'
  }
};

const users = {
  asdfds:
  {
    id: 'testUser',
    email: 'testEmail@email.com',
    password: 'password'
  }
};

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

const getUserByKey = (usersEmail, newEmail, key) => {
  for (let id in usersEmail) {
    if (usersEmail[id][key] === newEmail) {
      return true;
    }
  }
  return false;
};

const returnId = (object, testEmail) => {
  for (let id in object) {
    if (object[id].email === testEmail) {
      return id;
    }
  }
};

const urlsForUser = (id) => {
  let urlList = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlList[key] = urlDatabase[key];
    }
  }
  return urlList;
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ADD
app.get('/urls/new', (req, res) => {
  let username = null;
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }

  username = req.cookies['user_id'].email;
  let templateVars = { username: username };
  res.render('urls_new', templateVars);
});

// ADD - create new url
app.post("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(401).send('401 User Authentication Required');
  }

  let random = generateRandomString();
  urlDatabase[random] = { longURL: req.body.longURL, userID: req.cookies['user_id'].id };
  res.redirect("/urls");
});

// READ
// get login form
app.get('/login', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (!req.cookies['user_id']) {
    res.render('urls_login', templateVars);
  }

  res.redirect('/urls');
});

// get user registration form
app.get('/register', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (!req.cookies['user_id']) {
    res.render('urls_register', templateVars);
  }

  res.redirect('/urls');
});

// get page by id
app.get('/urls/:id', (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(401).send('401 Unauthorized Access. Please Log in.');
  }
  const id = req.params.id;
  let user = id
  let username = req.cookies['user_id'].email;
  const templateVars = {
    username: username,
    id: id,
    longURL: user.longURL
  };

  res.render('urls_show', templateVars);
});

// EDIT

// handle login form data
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = returnId(users, email);
  const user = users[id];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('403 Invalid user or password');
  }

  res.cookie('user_id', users[id]);
  res.redirect('/urls');
});

// handle registration form data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (getUserByKey(users, email, 'email') || !password || !email) {
    return res.status(400).send('400 Bad Request');
  }

  let randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email: email,
    password: hashedPassword
  };

  res.cookie('user_id', users[randomId]);
  res.redirect('/urls');
});

// submit button on urls_show page
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  let user = req.cookies['user_id'].id;
  if (!url || url.userID !== user) {
    return res.status(404).send('404 ID not found.');
  }

  const longUrl = req.body.longUrl;
  urlDatabase[id].longURL = longUrl;
  res.redirect("/urls");
});

// logout button
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// DELETE
// delete button on urls page
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  let user = req.cookies['user_id'].id;
  if (!url || url.userID !== user) {
    res.status(404).send('404 ID not found.');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// redirect to longURL from short url
app.get("/u/:id", (req, res) => {
  const urlId = urlDatabase[req.params.id];
  const longURL = urlId.longURL;
  for (let id in urlDatabase) {
    if (id === req.params.id) {
      return res.redirect(longURL);
    }
  }
  res.status(404).send('404 Not Found');
});

// shows all urls
app.get('/urls', (req, res) => {
  let username = null;
  if (!req.cookies['user_id']) {
    return res.status(401).send('401 Unauthorized Access. Please Login.');
  }

  username = req.cookies['user_id'].email;
  let userId = req.cookies['user_id'].id;
  let personalUrls = urlsForUser(userId);
  let templateVars = {
    username: username,
    urls: personalUrls
  };
  res.render('urls_index', templateVars);
});

// homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});