const express = require("express");

const router = express.Router();

const { catchErrors } = require("../handlers/errorHandlers");
const {
  login,
  logout,
  ssoLogin,
  resetPassword
} = require("../controllers/authController");
const adminController = require('../controllers/adminController')

// const { loginDemo, logout } = require("../controllers/authControllerDemo");

// use {login } from authController , uncomment line below

// router.route("/login").post(catchErrors(login));

// for development & production don't use this line router.route("/login").post(catchErrors(loginDemo)); (you should remove it) , this is just demo login contoller
router.route("/login").post(catchErrors(login));
router.route("/sso-login").post(catchErrors(ssoLogin));
router.route("/reset-password").post(catchErrors(resetPassword));

router.route("/change-password/create").post(catchErrors(adminController.changePassword));


router.route("/logout").post(catchErrors(logout));

module.exports = router;
