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

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ADD
app.get('/urls/new', (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
  }
  const templateVars = { username: username };
  res.render('urls_new', templateVars);
});

// ADD - create new url
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect("/urls");
});

// READ - show specific id
// get user registration form
app.get('/register', (req, res) => {
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
  }
  const templateVars = { username: username };
  res.render('urls_register', templateVars);
})
;
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
// handle registration form data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email: email,
    password: password
  };
  res.cookie('user_id', users[randomId]);
  console.log(users);
  res.redirect('/urls');
});
// edit button on urls page
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
  const longUrl = req.body.longUrl;
  urlDatabase[id] = longUrl;
  res.redirect("/urls");
});

// login button
app.post("/login", (req, res) => {
  let login = req.body.username;
  res.cookie('user_id', login);
  res.redirect('/urls');
});

// logout button
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
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
  // console.log(templateVars);
  console.log(req.cookies['user_id']);
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