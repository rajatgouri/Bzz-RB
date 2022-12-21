const methods = require("../crudController");
const endpoints = methods.crudController("Studies");
var sql = require("mssql");
const sqlConnection = require('../../sql')


const Model = "[FI_DM_HIMS_ICD].[dbo].[Studies]";
const JWT = "JWT";
delete endpoints["update"];


endpoints.list = async (req, res) => {
  try {
    
    const { recordset: result } = await sqlConnection.query(
      `select Distinct([StudyNumber]) from ${Model} `
    );

    
    return res.status(200).json({
      success: true,
      result: result,
      message: "Successfully found all documents",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};



  
module.exports = endpoints;
  

