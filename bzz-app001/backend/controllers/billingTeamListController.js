var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("CalendarStaff");

delete endpoints["read"];
delete endpoints["update"];

const Model = "teamList";
endpoints.list = async (req, res) => {

  try {
   
    const { recordset } = await sql.query(
      `SELECT * FROM ${Model}`
    );


    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found billing Team List  ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM BillingColor `,
      error: err,
    });
  }
};



module.exports = endpoints;