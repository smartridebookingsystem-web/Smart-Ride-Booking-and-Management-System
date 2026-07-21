let exp = require("express");
let mysql = require("mysql2");
let app = exp();
let cors = require("cors");
app.use(exp.json()); // for JSON
app.use(exp.urlencoded({ extended: true })); // for form data
let con = mysql.createConnection({
  host: "localhost",
  database: "p03_srbms",
  user: "root",
  password: "system",
});
con.connect(function (err) {
  if (!err) {
    console.log("dabase connected");
  } else {
    console.log("database not connected");
  }
});
app.use(cors());
app.listen(3000, function () {
  console.log("server started at port 3000");
});
app.post("/login", function (req, res) {
  let { username, password } = req.body;
  let sql = "SELECT * FROM users WHERE username=? AND password=?";

  con.query(sql, [username, password], function (err, results) {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ MSG: "Database error" });
    }

    if (results.length === 1) {
      const user = results[0];
      res.status(200).json({
        user: {
          userid: user.username,
          role: user.role_id,
        },
        token: "dummy-token",
      });
    } else {
      res.status(400).json({ MSG: "Invalid credentials" });
    }
  });
});
