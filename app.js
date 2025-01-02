const path = require("path");
const db = require("./connection");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bycrypt = require("bcryptjs")

// middleware authentification function
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const { rows } = await db.query(`SELECT * FROM top_users WHERE username = $1`, [username]);
    const user = rows[0];
    const match = await bycrypt.compare(password, user.password);


    if (!user) {
      return done(null, false, { msg: 'Incorrect username' })
    }
    if (!match) {
      return done(null, false, { msg: 'Incorrect password' })
    }
    return done(null, user)

  } catch (err) {
    console.log(err);
    return done(err)
  }
}
));

// receive the user object found from a successful login and store its id property in the session data.
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// retrieve the id we stored in the session data. We then use that id to query our database for the specified user, then done(null, user) attaches that user object to req.user. Now in the rest of the request, we have access to that user object via req.user
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query(`SELECT * FROM top_users WHERE id = $1`, [id]);
    const user = rows[0];

    done(null, user)

  } catch (err) {
    console.log(err);
    return done(err)
  }
});

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: 'cats', resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// you will have access to the currentUser variable in all of your views, and you won’t have to manually pass it into all of the controllers in which you need it.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("index", { user: req.user })
});

app.get("/sign-up", (req, res) => {
  res.render("sign-up-form")
});

app.post("/sign-up", (req, res, next) => {
  const { username, password } = req.body;

  bycrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) {
      console.log(err)
    }
    await db.query(`INSERT INTO top_users(username, password) VALUES ($1, $2) RETURNING *`, [username, hashedPassword]).then(({ rows }) => { console.log(rows) });
    res.redirect("/")
  })

});

app.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}));

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/")
  })
})

app.listen(3000, () => {
  console.log('Listening on port 3000...')
})
