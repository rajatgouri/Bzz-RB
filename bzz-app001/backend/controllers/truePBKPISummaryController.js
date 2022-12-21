const methods = require("./crudController");
const endpoints = methods.crudController("TruePBKPISummary");
var sql = require("mssql");

delete endpoints["update"];
delete endpoints['list'];
const Model = 'TruePBKPISummary'

endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;

    var query = `
      SELECT * from ${Model}
    `;

    var recordset;
    var arr;

    const { recordset: result } = await sql.query(query);
    recordset = result;
    arr = result.length

    const obj = arr[0];
    const count = 100;

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
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


