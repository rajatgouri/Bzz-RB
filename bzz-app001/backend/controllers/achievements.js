var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("Achievements");
const utilController = require('./utilController')
const {getDateTime} = require('./utilController')

var XLSX = require("xlsx");


delete endpoints["list"];
delete endpoints["update"];
const Model = "Achievements";



endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    values.ByWhom = req.admin.EMPID
    values.DateTime = getDateTime()

    const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


    let valuesQuery = "";
    for (key in values) {
          if (values[key] === "null" || values[key] === null || values[key] === "") {
              valuesQuery += "NULL" + ",";
          } else {
              valuesQuery += "'" + values[key] + "',";
          }
      }
    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
  
    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

    await sql.query(insertQuery);

  

    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }

};




module.exports = endpoints;
