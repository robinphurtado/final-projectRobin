const express = require("express");
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool");
const bcrypt = require("bcrypt");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//express-session code
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secret_key!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.get('/', async (req, res) => {
  let sql = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let rows = await executeSQL(sql);
  let images = `SELECT image FROM products ORDER BY productId`;
  res.render('index', { "types": rows, "slides": images });
});

app.get('/products', async (req, res) => {
  let ptId = req.query.productTypeId;
  console.log(ptId);
  let sql = `SELECT * FROM productTypes NATURAL JOIN products NATURAL JOIN productBrands WHERE productTypeId = ?`;
  let params = [ptId];
  let rows = await executeSQL(sql, params);
  let sqlTwo = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let secondRows = await executeSQL(sqlTwo);
  res.render("products", { "listings": rows, "types": secondRows });
});

//secured viewProducts route
app.get('/admin/viewProducts', async (req, res) => {
  let sql = `SELECT * FROM products NATURAL JOIN productBrands ORDER BY productId`;
  let rows = await executeSQL(sql);
  //check for authenticated session before rendering route
  if (req.session.authenticated) {
    res.render("adminViewProducts", { "listings": rows });
  } else {
    res.redirect("/");
  }

});

app.get('/admin/viewComments', async (req, res) => {
  let sql = `SELECT * FROM reviews NATURAL JOIN products NATURAL JOIN productBrands ORDER BY productId`;
  let rows = await executeSQL(sql);
  //check for authenticated session before rendering route
  if (req.session.authenticated) {
    res.render("adminViewComments", { "listings": rows });
  } else {
    res.redirect("/");
  }

});

//secured addProducts route
app.get("/admin/addProducts", async function(req, res) {
  let sqlTwo = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let secondRows = await executeSQL(sqlTwo);
  let sqlThree = `SELECT productBrandId, productBrandName FROM productBrands ORDER BY productBrandId`;
  let thirdRows = await executeSQL(sqlThree);
  //check for authenticated session before rendering route
  if (req.session.authenticated) {
    res.render("adminAddProduct", { "types": secondRows, "brands": thirdRows });
  } else {
    res.redirect("/");
  }
});

app.post("/admin/addProducts", async function(req, res) {
  let sql = "INSERT INTO products (productBrandId, productTypeId, basePrice, optionalAddOn, addOnPrice, productInfo, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?, ? );"
  let sqlTwo = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let sqlThree = `SELECT productBrandId, productBrandName FROM productBrands ORDER BY productBrandId`;

  let params = [req.body.prodBrand, req.body.prodType, req.body.prodPrice,
  req.body.prodExtra, req.body.prodXPrice, req.body.prodInfo,
  req.body.prodQuantity, req.body.prodPic];

  let rows = await executeSQL(sql, params);
  let secondRows = await executeSQL(sqlTwo);
  let thirdRows = await executeSQL(sqlThree);
  res.render("adminAddProduct", { "message": "Product Added!", "types": secondRows, "brands": thirdRows });
});

//secured editProducts route
app.get("/admin/editProduct", async function(req, res) {
  let productId = req.query.productId;
  let sql = `SELECT *
            FROM products
            WHERE productId =  ${productId}`;
  let rows = await executeSQL(sql);
  let sqlTwo = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let secondRows = await executeSQL(sqlTwo);
  let sqlThree = `SELECT productBrandId, productBrandName FROM productBrands ORDER BY productBrandId`;
  let thirdRows = await executeSQL(sqlThree);
  //check for authenticated session before rendering route
  if (req.session.authenticated) {
    res.render("adminEditProduct", { "currProducts": rows, "types": secondRows, "brands": thirdRows });
  } else {
    res.redirect("/");
  }
});

app.post("/admin/editProduct", async function(req, res) {
  let sql = `UPDATE products SET productBrandId = ?, productTypeId = ?, basePrice = ?, optionalAddOn = ?, addOnPrice = ?, productInfo = ?, quantity = ?, image = ? WHERE productId = ?`;
  let sqlTwo = `SELECT productTypeId, productTypeName FROM productTypes ORDER BY productTypeId`;
  let sqlThree = `SELECT productBrandId, productBrandName FROM productBrands ORDER BY productBrandId`;

  let params = [req.body.prodBrand, req.body.prodType, req.body.prodPrice,
  req.body.prodExtra, req.body.prodXPrice, req.body.prodInfo,
  req.body.prodQuantity, req.body.prodPic, req.body.prodIdNum];


  let rows = await executeSQL(sql, params);
  let secondRows = await executeSQL(sqlTwo);
  let thirdRows = await executeSQL(sqlThree);

  sql = `SELECT * FROM products WHERE productId = ${req.body.prodIdNum}`;
  rows = await executeSQL(sql);
  res.render("adminEditProduct", { "message": "Product Updated!", "currProducts": rows, "types": secondRows, "brands": thirdRows });
});

//secured removeProducts route
app.get("/admin/removeProduct", async function(req, res) {
  let sql = `DELETE FROM products WHERE productId = ${req.query.productId}`;
  let rows = await executeSQL(sql);
  res.redirect("/admin/viewProducts");
});

app.get("/admin/removeComment", async function(req, res) {
  let sql = `DELETE FROM reviews WHERE commentId = ${req.query.commentId}`;
  let rows = await executeSQL(sql);
  res.redirect("/admin/viewComments");
});

//admin landing page after login
app.get('/adminPage', async (req, res) => {
  //check for authenticated session before rendering route
  if (req.session.authenticated) {
    res.render("adminPage");
  } else {
    res.redirect("/");
  }
});


app.get('/adminLogin', async (req, res) => {
  let sql = `SELECT * FROM admins`;
  let rows = await executeSQL(sql);
  res.render("adminLogin", { "listings": rows });
});

//secure login
app.post('/adminLogin', async (req, res) => {
  let sql2 = `SELECT * FROM admins`;
  let rows = await executeSQL(sql2);
  let passwordHash = "";
  let savedAdminId = "";
  let savedAdminName = "";
  let savedAdminEmail = "";
  let adminId = req.body.adminIdNum;
  let adminName = req.body.adminName;
  let adminEmailAddr = req.body.adminEmailAddr;
  let adminPass = req.body.adminPass;

  let sql = `SELECT * 
              FROM admins
              WHERE adminId = ?`;
  let data = await executeSQL(sql, [adminId]);
  let user = data[0];

  if (data.length > 0) {
    passwordHash = data[0].password;
    savedAdminId = data[0].adminId;
    savedAdminName = data[0].name;
    savedAdminEmail = data[0].email;
  }

  //compare to user entered password to hashed password
  const match = await bcrypt.compare(adminPass, passwordHash);

  //compare all user entered values with saved admin values and direct to appropriate page
  if (adminId == savedAdminId && adminName == savedAdminName && adminEmailAddr == savedAdminEmail && match) {
    req.session.authenticated = true;
    res.render('adminPage')
  } else {
    res.render("adminLogin", { "listings": rows, "error": "INVALID CREDENTIALS" });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

//logout route to end admin session
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});


app.get('/api/comment/:id', async (req, res) => {
  let commentId = req.params.id;
  let sql = `SELECT *
            FROM reviews
            WHERE productId = ? `;
  let rows = await executeSQL(sql, [commentId]);
  res.send(rows)
});

app.get('/api/product/:id', async (req, res) => {
  let productId = req.params.id;
  let sql = `SELECT *
            FROM products NATURAL JOIN productBrands
            WHERE productId = ? `;
  let rows = await executeSQL(sql, [productId]);
  res.send(rows)
});


app.get('/api/admin/:id', async (req, res) => {
  let adminId = req.params.id;
  let sql = `SELECT *
            FROM admins
            WHERE adminId = ? `;
  let rows = await executeSQL(sql, [adminId]);
  res.send(rows)
});

app.listen(3000, () => {
  console.log('server started');
});


//functions
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}