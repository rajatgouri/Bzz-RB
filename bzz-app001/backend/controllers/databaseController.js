

var sql = require("mssql");
const methods = require("./crudController");



exports.query = async (req,res) => {
  const {query} = req.body;

  const {recordset: result} = await sql.query(query)
  
  try {
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 




