const express = require("express");
const app = express();
const PORT = 8089; // default port 8080
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

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

const matchId = (object, testEmail, testPassword) => {
  for (let id in object) {
    if (object[id].email === testEmail && object[id].password === testPassword) {
      return true;
    }
  }
  return false;
};

const returnId = (object, testEmail, testPassword) => {
  for (let id in object) {
    if (object[id].email === testEmail && object[id].password === testPassword) {
      return id;
    }
  }
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ADD
app.get('/urls/new', (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
    let templateVars = { username: username };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// ADD - create new url
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect("/urls");
});

// READ
// get login form
app.get('/login', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

// get user registration form
app.get('/register', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

// get page by id
app.get('/urls/:id', (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
  }
  const templateVars = {
    username: username,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

// EDIT
// handle login form data
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const match = matchId(users, email, password);
  const id = returnId(users, email, password);
  if (match) {
    res.cookie('user_id', users[id]);
    res.redirect('/urls');
  } else {
    res.status(403).send('403 Forbidden');
  }
});

// handle registration form data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByKey(users, email, 'email') || !password || !email) {
    res.status(400).send('400 Bad Request');
  } else {
    let randomId = generateRandomString();
    users[randomId] = {
      id: randomId,
      email: email,
      password: password
    };
    res.cookie('user_id', users[randomId]);
    res.redirect('/urls');
  }
});

// edit button on urls page
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
  const longUrl = req.body.longUrl;
  urlDatabase[id] = longUrl;
  res.redirect("/urls");
});

// logout button
app.post("/logout", (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
  }
  const templateVars = { username: username };
  res.clearCookie('user_id');
  res.redirect('/login');
});

// DELETE
// delete button on urls page
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// redirect to longURL from short url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// shows all urls
app.get('/urls', (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
  }
  const templateVars = {
    username: username,
    urls: urlDatabase
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