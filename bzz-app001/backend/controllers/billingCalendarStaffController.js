var sql = require("mssql");
const methods = require("./crudController");
const { getDateTime } = require("./utilController");
const endpoints = methods.crudController("CalendarStaff");

delete endpoints["list"];
delete endpoints['delete'];
delete endpoints["update"];

const Model = "CalendarStaff";
endpoints.list = async (req, res) => {
  const { month, year, date_column } = req.params;

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;
    
    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} WHERE month(${date_column}) = ${month} and year(${date_column})= ${year}`
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model} WHERE month(${date_column}) = ${month} and year(${date_column})= ${year}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      params: req.params,
      pagination,
      message: "Successfully found all documents",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM${Model} WHERE month(WhenPosted) = ${month} and year(WhenPosted)= ${year}`,
      error: err,
    });
  }
};



endpoints.listYear = async (req, res) => {
  const { month, year, date_column , EMPID} = req.params;

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;
    
    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} WHERE year(${date_column})= ${year} and LoginNumber = ${EMPID}`
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model} WHERE year(${date_column})= ${year} and LoginNumber = ${EMPID}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      params: req.params,
      pagination,
      message: "Successfully found all documents",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM${Model} WHERE month(WhenPosted) = ${month} and year(WhenPosted)= ${year}`,
      error: err,
    });
  }
};


endpoints.delete = async (req, res) => {
  const { id } = req.params;

  const { recordset } = await sql.query(
    `DELETE from ${Model} WHERE ID = ${id}`
  );

  try {
   
    return res.status(200).json({
      success: true,
      result: recordset,
      
      message: `Successfully deleted document where id = ${id}`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `dlete from ${Model} where id = ${id}`,
      error: err,
    });
  }
};

endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    const { id } = req.params;
    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
        valuesQuery += key + "= NULL" + ",";
      } else {
        valuesQuery += key + "='" + values[key] + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);

    await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);

    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this id: " + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
};


endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    values.LoginNumber = values.EmployeeID;
   

    
    const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


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
      // query: insertQuery,
      error: err,
    });
  }
};

module.exports = endpoints;
