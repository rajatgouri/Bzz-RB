let admins = require("../data/admins");

const { writeDataToFile } = require("../utils");

function findAll() {
  return new Promise((resolve, reject) => {
    resolve(admins);
  });
}



function findById(_id) {
  return new Promise((resolve, reject) => {
    const admin = admins.find((p) => p._id === _id);
    resolve(admin);
  });
}
function findByEmail(email) {
  return new Promise((resolve, reject) => {
    const admin = admins.find((p) => p.email === email);
    resolve(admin);
  });
}
function create(admin) {
  return new Promise((resolve, reject) => {
    const date = new Date();
    const created = date.toString();
    const newadmin = { _id: Date.now(), created, ...admin };
    admins.push(newadmin);
    writeDataToFile("./data/admins.json", admins);
    resolve(newadmin);
  });
}

function update(_id, admin) {
  return new Promise((resolve, reject) => {
    const index = admins.findIndex((p) => p._id === _id);
    admins[index] = { _id, ...admin };
    writeDataToFile("./data/admins.json", admins);
    resolve(admins[index]);
  });
}

function remove(_id) {
  return new Promise((resolve, reject) => {
    admins = admins.filter((p) => p._id !== _id);
    writeDataToFile("./data/admins.json", admins);
    resolve();
  });
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
};
