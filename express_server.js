const express = require("express");
const app = express();
const PORT = 8089; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');
const { returnId } = require('./helpers');
const { generateRandomString } = require('./helpers');

const urlDatabase = {};
const users = {};

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
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// ------  /urls/new  -------
//  GET
app.get('/urls/new', (req, res) => {
  let username = null;
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  username = req.session.user_id.email;
  let templateVars = { username: username };
  res.render('urls_new', templateVars);
});

//  POST
app.post("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('401 User Authentication Required');
  }

  let random = generateRandomString();
  urlDatabase[random] = { longURL: req.body.longURL, userID: req.session.user_id.id };
  res.redirect("/urls");
});

// -----  /urls -----
app.get('/urls', (req, res) => {
  let username = null;
  if (!req.session.user_id) {
    return res.status(401).send('401 Unauthorized Access. Please Login.');
  }
  
  username = req.session.user_id.email;
  let userId = req.session.user_id.id;
  let personalUrls = urlsForUser(userId);
  let templateVars = {
    username: username,
    urls: personalUrls
  };
  res.render('urls_index', templateVars);
});

// -----  /urls/:id -----
//  GET
app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id)  {
    return res.status(401).send('401 Unauthorized Access. Please Log in.');
  }
  
  const id = req.params.id;
  const url = urlDatabase[id];
  const urlData = urlDatabase[id];
  let username = req.session.user_id.email;

  if (!url) {
    return res.status(401).send('You do not have access to this url.');
  }

  const templateVars = {
    username: username,
    id: id,
    longURL: urlData.longURL
  };
  res.render('urls_show', templateVars);
});

//  POST
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  let user = req.session.user_id.id;
  if (!url || url.userID !== user) {
    return res.status(404).send('404 ID not found.');
  }
  
  const longUrl = req.body.longUrl;
  urlDatabase[id].longURL = longUrl;
  res.redirect("/urls");
});


// -----  DELETE -----

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  let user = req.session.user_id.id;
  if (!url || url.userID !== user) {
    return res.status(404).send('404 ID not found.');
  }
  
  delete urlDatabase[id];
  res.redirect("/urls");
});

// -----  /u/:id  -----
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


// -----  Login  -----
//  GET
app.get('/login', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (!req.session.user_id) {
    return res.render('urls_login', templateVars);
  }

  res.redirect('/urls');
});

//  POST
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = returnId(users, email);
  const user = users[id];
  
  if (!user) {
    return res.status(403).send('Invalid username');
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Invalid password');
  }
  
  req.session.user_id = users[id];
  res.redirect('/urls');
});

// -----  Register  ------
//  GET
app.get('/register', (req, res) => {
  let username = null;
  let templateVars = { username: username };
  if (!req.session.user_id) {
    return res.render('urls_register', templateVars);
  }
  
  res.redirect('/urls');
});

//  POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users);
  const userEmail = user.email;
  if (userEmail === email || !password || !email) {
    return res.status(400).send('400 Invalid inputs or user already exists');
  }

  let randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email: email,
    password: hashedPassword
  };

  req.session.user_id = users[randomId];
  res.redirect('/urls');
});

// -----  Logout -----
//  POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
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