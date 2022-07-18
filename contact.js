// core modules
// file system
const fs = require('fs');

// third party module
// const validator = require('validator');

//membuat folder data apabila tidak ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// membuat file contacts json jika belom ada
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath,'[]','utf-8');
}

// membuat fungsi untuk mengecek data/contacts.json
const loadContact = () => {
  const file = fs.readFileSync('data/contacts.json', 'utf8');
  const contacts = JSON.parse(file);
  return contacts;
}

// fungsi untuk mencari contact
const findContact = (name) => {
  const contacts = loadContact();
  const findName = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
  return findName;
}

const cekNama = (name) => {
  const contacts = loadContact();
  // validasi nama menggunakan method find
  const duplicate = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
  return duplicate;
}

// fungsi untuk melihat detail sebuah contact berdasarkan nama
const detailContact = (name) => {
  const contacts = loadContact();
  const findName = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
  return findName;
}

// fungsi untuk menghapus contact
const deleteContact = (name) => {
  const contacts = loadContact();
  const findName = contacts.filter((contact) => contact.name.toLowerCase() !== name.toLowerCase());
  
  fs.writeFileSync('data/contacts.json', JSON.stringify(findName, null, 2));
}

// fungsi untuk mengedit contact
const updateContact = (newContact) => {
  const contacts = loadContact();
  const findName = contacts.filter((contact) => contact.name.toLowerCase() !== newContact.oldName.toLowerCase());

  delete newContact.oldName

  findName.push(newContact)

  fs.writeFileSync('data/contacts.json', JSON.stringify(findName, null, 2));
}
module.exports = { loadContact, detailContact, findContact, deleteContact, cekNama, updateContact }