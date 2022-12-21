const methods = require("./crudController");
const endpoints = methods.crudController("CoveragesGovernmentLogger");
const utilController = require('./utilController')
var sql = require("mssql");


const Model = "CoveragesGovernmentLogger";
delete endpoints["update"];
delete endpoints['list'];

endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      values.UserName = req.admin.First; 
      
      var usDate = utilController.getDateTime()

      values.ActionTimeStamp = usDate;
      const columnsQ = "(" + Object.keys(values).toString() + ")"
  
      let valuesQuery = "";
      for (key in values) {
            if (values[key] === "null") {
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
  

