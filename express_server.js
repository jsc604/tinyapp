const express = require("express");
const app = express();
const PORT = 8089; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// ADD
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// ADD - create new url
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect("/urls");
});

// READ - show specific id
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

// EDIT
// edit button on urls page
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id;
  const longUrl = req.body.longUrl;
  urlDatabase[id] = longUrl;
  res.redirect("/urls");
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
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});