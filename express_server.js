const express = require("express");
const app = express();
const PORT = 8089; // default port 8080
const cookieParser = require('cookie-parser');

const urlDatabase = {};

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

const urlsForUser = (id) => {
  let urlList = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlList.push({[key]: urlDatabase[key]});
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
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
    let templateVars = { username: username };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// ADD - create new url
app.post("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    let random = generateRandomString();
    urlDatabase[random] = { longURL: req.body.longURL, userID: req.cookies['user_id'].id };
    res.redirect("/urls");
  } else {
    res.status(401).send('401 User Authentication Required');
  }
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
    const templateVars = {
      username: username,
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('401 Unauthorized Access. Please Log in.');
  }
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
  console.log(req.params.id);
  const longURL = urlDatabase[req.params.id].longURL;
  for (let id in urlDatabase) {
    if (id === req.params.id) {
      res.redirect(longURL);
    }
  }
  res.status(404).send('404 Not Found');
});

// shows all urls
app.get('/urls', (req, res) => {
  // req.cookies['user_id'] ==={ id: 'zguo1d', email: 'jeffreycheung_@live.com', password: '123321' }
  let username = null;
  if (req.cookies['user_id']) {
    username = req.cookies['user_id'].email;
    let userId = req.cookies['user_id'].id;
    let personalUrls = urlsForUser(userId);
    console.log(personalUrls);
    let templateVars = {
      username: username,
      urls: personalUrls
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send('401 Unauthorized Access. Please Login.');
  }
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