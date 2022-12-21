const express = require("express");
const router = express.Router();

const { catchErrors } = require("../handlers/errorHandlers");
const pageLoggerController = require("../controllers/pageLoggerController");

//_____________________________________ API for PageLogger ___________________________
router.route("/pageLogger/create").post(catchErrors(pageLoggerController.create));

module.exports = router;
