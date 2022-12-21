const methods = require("./crudController");
const endpoints = methods.crudController("Feedback");
var sql = require("mssql");

const Model = "Feedback";
delete endpoints["update"];
delete endpoints['list'];


endpoints.list = async (req, res) => {
  try {
    
    const { recordset } = await sql.query(
      `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}  `
    );

    
    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found all documents",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};


endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      values.Admin = req.admin.First 
      const columnsQ = "(" + Object.keys(values).toString() + ")"
  
      
          let {recordsets} = await sql.query(`Select * from ${Model} where EMPID = ${values.EMPID}`);
            
          if(recordsets[0].length > 0) {

            let valuesQuery = "";
            for (key in values) {
              valuesQuery += key + "='" + values[key] + "',";
            }

            valuesQuery = valuesQuery.slice(0, -1);

            await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${values.EMPID}`);
        
            return res.status(200).json({
              success: true,
              result: {},
              message: "we update this document by this EMPID: " + values.EMPID,
            });

          } else {

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
          }
        
      
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
  

