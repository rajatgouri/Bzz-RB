const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075Progress");
var sql = require("mssql");

const Model = "WQ1075Progress";
delete endpoints["update"];

endpoints.create = async (req,res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;
        const EMPID = req.admin.EMPID;
        const First = req.admin.First;
        const Last = req.admin.Last;

        if(req.admin.ManagementCard) {
          return res.status(200).json({
            success: true,
            result: {},
            message: "Success",
          });
        }
      
        let {recordsets} = await sql.query(`Select * from ${Model} where EMPID = ${EMPID}`);
          
        // create new entry in table
        if(recordsets[0].length == 0) {

          values.EMPID = EMPID;
          values.First = First;
          values.Last = Last;
          
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

        } else { // updating the table
          let valuesQuery = "";
          for (key in values) {
            valuesQuery += key + "='" + values[key] + "',";
          }
  
          valuesQuery = valuesQuery.slice(0, -1);
  
          await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${EMPID}`);
      
          return res.status(200).json({
            success: true,
            result: {},
            message: "we update this document by this id: " + EMPID,
          });
        }        
      } catch (err) {
        return res.status(500).json({
          success: false,
          result: null,
          message: "Oops there is an Error",
          error: err,
        });
      }
}

module.exports = endpoints;
  

