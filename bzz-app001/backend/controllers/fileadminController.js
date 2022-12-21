const adminModel = require("../models/adminModel");

const { getPostData } = require("../utils");

// @desc    Gets All admins
// @route   GET /api/admins
async function getadmins(req, res) {
  try {
    const admins = await adminModel.findAll();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(admins));
  } catch (error) {
    console.log(error);
  }
}

// @desc    Gets Single admin
// @route   GET /api/admin/:id
async function getadmin(req, res, id) {
  try {
    const admin = await adminModel.findById(id);

    if (!admin) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "admin Not Found" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(admin));
    }
  } catch (error) {
    console.log(error);
  }
}

// @desc    Create a admin
// @route   POST /api/admins
async function createadmin(req, res, note) {
  try {
    const admin = {
      note,
    };

    const newadmin = await adminModel.create(admin);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(newadmin));
  } catch (error) {
    console.log(error);
  }
}

// @desc    Update a admin
// @route   PUT /api/admins/:id
async function updateadmin(req, res, id) {
  try {
    const admin = await adminModel.findById(id);

    if (!admin) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "admin Not Found" }));
    } else {
      const body = await getPostData(req);

      const { note } = JSON.parse(body);

      const adminData = {
        note: note || adminModel.note,
      };

      const updadmin = await adminModel.update(id, adminData);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(updadmin));
    }
  } catch (error) {
    console.log(error);
  }
}

// @desc    Delete admin
// @route   DELETE /api/admin/:id
async function deleteadmin(req, res, id) {
  try {
    const admin = await adminModel.findById(id);

    if (!admin) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "admin Not Found" }));
    } else {
      await adminModel.remove(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `admin ${id} removed` }));
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getadmins,
  getadmin,
  createadmin,
  updateadmin,
  deleteadmin,
};
