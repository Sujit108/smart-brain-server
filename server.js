const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "Sujit@143",
    database: "smartbrain",
  },
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

// const database = {
//   users: [
//     {
//       id: "123",
//       name: "Sujit Parida",
//       email: "iamsujit108@gmail.com",
//       password: "Sujit@143",
//       entries: 0,
//       joined: new Date(),
//     },
//     {
//       id: "124",
//       name: "Ubaid Qureshi",
//       email: "iamubaid0507@gmail.com",
//       password: "Ubaid@143",
//       entries: 0,
//       joined: new Date(),
//     },
//   ],
// };

app.get("/", (req, res) => {
  res.send(success);
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("Incorrect form submission");
  }
  db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("Wrong Credentials"));
  // if (
  //   req.body.email === database.users[0].email &&
  //   req.body.password === database.users[0].password
  // ) {
  //   res.json(database.users[0]);
  // } else {
  //   res.status(400).json("error loging in");
  // }
});

app.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("Incorrect form submission");
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to join"));
  // database.users.push({
  //   id: "125",
  //   name: name,
  //   email: email,
  //   entries: 0,
  //   joined: new Date(),
  // });
});

// app.post('/register', (req, res) => {
//   const { email, name, password } = req.body;
//   const hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//       trx.insert({
//         hash: hash,
//         email: email
//       })
//       .into('login')
//       .returning('email')
//       .then(loginEmail => {
//         return trx('users')
//           .returning('*')
//           .insert({
//             // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
//             // loginEmail[0] --> this used to return the email
//             // TO
//             // loginEmail[0].email --> this now returns the email
//             email: loginEmail[0].email,
//             name: name,
//             joined: new Date()
//           })
//           .then(user => {
//             res.json(user[0]);
//           })
//       })
//       .then(trx.commit)
//       .catch(trx.rollback)
//     })
//     .catch(err => res.status(400).json('unable to register'))
// })

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  // let found = false;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not Found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
});
// database.users.forEach((user) => {
//   if (user.id === id) {
//     found = true;
//     return res.json(user);
//   }
// });
// if (!found) {
//   res.status(400).json("no such user");
// }

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
  // let found = false;
  // database.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true;
  //     user.entries++;
  //     return res.json(user.entries);
  //   }
  // });
  // if (!found) {
  //   res.status(400).json("no such user");
  // }
});

// bcrypt.hash("bacon", null, null, function (err, hash) {
//   // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function (err, res) {
//   // res == true
// });
// bcrypt.compare("veggies", hash, function (err, res) {
//   // res = false
// });

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

/*
root route(/):- res= this is working
SIgnIn:- POST = success or fail
/register:- POST = user
/profile/:userid = GET = user
/image:- PUT = user


*/
