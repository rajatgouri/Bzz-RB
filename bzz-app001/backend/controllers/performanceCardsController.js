var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("PerformanceCards");

delete endpoints["read"];
delete endpoints["update"];

const Model = "PerformanceCards";
endpoints.read = async (req, res) => {

  const { id} = req.params;

  try {
   
    const { recordset: arr } = await sql.query(
      `SELECT * FROM ${Model} where EMPID = ${id}`
    );

    return res.status(200).json({
      success: true,
      result: arr,
      message: `Successfully found ${Model} where EMPID = ${id} `,
    });
  } catch (err) {

    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM ${Model} WHERE EMPID = ${id}`,
      error: err,
    });
  }
};


endpoints.create = async (req, res) => {
  try {
   
    const values = req.body;
    const columnsQ = "(" + Object.keys(values).toString() + ")"
  
    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
          valuesQuery += "NULL" + ",";
      } else {
          valuesQuery += "'" + values[key] + "',";
      }
   }
    const result = await sql.query(
      `Insert into ${Model} ${columnsQ} Values ('${valuesQuery}' )`
    );

    return res.status(200).json({
      success: true,
      result: result,
      message: "Successfully found data where EMPID  = ${id} ",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: ` * FROM ${Model} WHERE EMPID = ${id}`,
      error: err,
    });
  }
};



endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    const { id } = req.params;

    
    const {recordsets } = await sql.query(`select * from ${Model}  where EMPID = ${id}`);  

    if(recordsets[0].length == 0) {
      values.EMPID = id

      const columnsQ = "(" + Object.keys(values).toString() + ")"

      let valuesQuery = "";
      for (key in values) {
        if (values[key] === "null") {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
    
    
      await sql.query(`Insert into ${Model} ${columnsQ} Values ${valuesQuery}`);
    } else {

        
    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
        valuesQuery += key + "= NULL" + ",";
      } else {
        valuesQuery += key + "='" + values[key] + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);


      await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${id}`);
    }


    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this EMPID: " + req.params.id,
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