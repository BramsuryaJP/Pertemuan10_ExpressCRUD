
// // module http node js
// const http = require('http');

// // fileSystem module
// const fs = require('fs');

// // port
// const port = 3000;

// // fungsi untuk membaca halaman
// const findPage = (url ,response) => {
//   fs.readFile(url, (error, data) => {
//     if (error) {
//       response.writeHead(404);
//       response.write('Page Not Found !');
//     } else {
//       response.write(data);
//     }
//     response.end();
//   })
// }

// http
//   .createServer((request, response) => {
//     // membuat variable url
//     const url = request.url

//     console.log(url);

//     // response.writeHead(200, {
//     //     'Content-Type': 'text/html'
//     // })

//     // menampilkan halaman berdasarkan url
//     if (url === '/about') {
//       findPage('about.html', response)
//     } else if (url === '/contact') {
//       findPage('contact.html', response)
//     } else {
//       findPage('index.html', response)
//       // response.write('Hello World');
//       // response.end();
//     }
//   })

//   .listen({ port }, () => {
//     console.log(`Server is listening on port ${ port }`);
//   })

// memanggil module express
const express = require('express')

// fileSystem module
const fs = require('fs');

// memanggil module express-ejs-layouts
const expressLayouts = require('express-ejs-layouts')

// memanggil module express-validator
const { body, validationResult, check, cookie } = require('express-validator');

// memanggil module morgan
const morgan = require('morgan')

// memanggil module express-session
const session = require('express-session')

// memanggil module cookie parser
const cookieParser = require('cookie-parser')

// memanggil module connect flash
var flash = require('connect-flash');

const app = express()
const port = 3000

// memanggil file contact.js
const { loadContact, updateContact, findContact, deleteContact, cekNama } = require('./contact') 

// informasi menggunakan EJS
app.use(expressLayouts);

// meng-set layout  dan view engine
app.set('layout', './layout/layout');
app.set('view engine', 'ejs');

// menggunakan morgan dev untuk menampilkan info log
app.use(morgan('dev'));

// menggunakan express static untuk memberi izin terhadap folder public
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

// flash configuration
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
// menampilkan waktu 
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
})

// mendeklarasi variable name
const name = "Bramsurya Johannes Paulus"

// mendapatkan route home
app.get('/', (req, res) => {

  // memanggil variable name
  res.render('index',
  {
    name,
    title: "Webserver EJS",

  })
})

// mendapatkan route about
app.get('/about', (req, res) => {
  res.render('about', { title: "About Page" })
})

// mendapatkan route contact
app.get('/contact', (req, res) => {

  // memanggil function loadContact
  const contacts = loadContact()

  res.render('contact', 
  { 
    title: "Contact Page",
    contacts,
    msg: req.flash('msg')
  })
})

// mendapatkan route contact add
app.get('/contact/add', (req, res) => {

  // memanggil function loadContact
  const contacts = loadContact()

  res.render('add-contact', 
  { 
    title: "Add Contact Page",
    contacts,
  })
})

// post data contact yang ditambah
app.post('/contact', [
  body('name').custom((value) => {
    const duplicate = cekNama(value);

    if (duplicate) {
      throw new Error('Nama Sudah Terdaftar, Silahkan Gunakan Nama Lain')
    } else {
      return true;
    }
  }),
  check('name', 'Field Nama Tidak Boleh Kosong').notEmpty(),
  check('email', 'Field Email Tidak Boleh Kosong').notEmpty(),
  check('phoneNumber', 'Field Phone Number Tidak Boleh Kosong').notEmpty(),
  check('email', 'Email Tidak Valid').isEmail(),
  check('phoneNumber', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID')
] ,(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add-contact', 
    { 
      title: "Add Contact Page",
      errors: errors.array(),
      params: req.body
    })
  } else {
    // memanggil function loadContact
    const contacts = loadContact()

    // mendapatkan data yang sudah diinput
    const getData = req.body;

    // mengpush data yang sudah diinput
    contacts.push(getData)

    // menuliskan data yang sudah diinput kedalam contacts.json
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts, null, 2));

    // pesan flash
    req.flash('msg', 'Data Contact Berhasil Ditambahkan !');

    // mengalihkan kembali ke halaman contact
    res.redirect("/contact")
    }
})

// mendapatkan route detail contact
app.get('/contact/:name', (req, res) => {

  // memanggil function untuk menemukan contact berdasarkan name
  const contact = findContact(req.params.name)

  res.render('detail-page', 
  { 
    title: "Detail Contact Page",
    contact
  })
})

// menghapus contact
app.get('/contact/delete/:name', (req, res) => {
  const contact = findContact(req.params.name)

  if (!contact) {
    res.status(404)
  } else {
    // memanggil fungsi deleteContact untuk menghapus contact
    deleteContact(req.params.name)

    // pesan flash
    req.flash('msg', 'Data Contact Berhasil Dihapus !');

    // mengalihkan kembali ke halaman contact
    res.redirect("/contact")
  }
  
})

// mengedit contact
app.get('/contact/edit/:name', (req,res) => {
  // memanggil function untuk menemukan contact berdasarkan name
  const contact = findContact(req.params.name)

  res.render('edit-contact', 
  { 
    title: "Edit Contact Page",
    contact
  })
})

// mengpost data yang sudah dirubah
app.post('/contact/update', [
  body('name').custom((value, { req }) => {
    const duplicate = cekNama(value);

    if ( value !== req.body.oldName && duplicate) {
      throw new Error('Nama Sudah Terdaftar, Silahkan Gunakan Nama Lain')
    } else {
      return true;
    }
  }),
  check('name', 'Field Nama Tidak Boleh Kosong').notEmpty(),
  check('email', 'Field Email Tidak Boleh Kosong').notEmpty(),
  check('phoneNumber', 'Field Phone Number Tidak Boleh Kosong').notEmpty(),
  check('email', 'Email Tidak Valid').isEmail(),
  check('phoneNumber', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('edit-contact', 
    { 
      title: "Edit Contact Page",
      errors: errors.array(),
      contact: req.body
    })
  } else {
    // memanggil fungsi updateContact
    updateContact(req.body)

    // pesan flash
    req.flash('msg', 'Data Contact Berhasil Dirubah !');
  
    // mengalihkan kembali ke halaman contact
    res.redirect("/contact")
  }
})

// query params
app.get('/product/:id?', (req, res) => {
  // res.send('Product id : ' + req.params.id + '<br></br>'
  // + 'Category id : ' + req.params.idCat)
  res.send(`Product id : ${req.params.id} <br> Category id : ${req.query.category}`)
})

// error jika tidak ada route yang terdaftar
app.use('/', (req, res) => {
  res.status(404)
  res.send('Page Not Found : 404')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

