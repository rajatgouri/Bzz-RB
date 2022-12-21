const methods = require("./crudController");
const endpoints = methods.crudController("DailyCheckmark");
var sql = require("mssql");

const Model = "DailyCheckmark";
delete endpoints["update"];
delete endpoints['list'];


endpoints.list = async (req, res) => {
  try {
    
    const {data} = req.body

    let {EMPID, date} = JSON.parse(data)
    
    const { recordset } = await sql.query(
      `select * from ${Model} where  EMPID = ${EMPID} and year(Date) = ${date}`
    );

    
    return res.status(200).json({
      success: true,
      result: recordset,
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


endpoints.create = async (req, res) => {
    try {
      const {EMPID, Date} = req.body;
      const values = req.body
      
      
          let {recordsets} = await sql.query(`Select * from ${Model} where EMPID = ${EMPID} and Date IN ('${Date}')`);
            
          if(recordsets[0].length > 0) {
            if(recordsets[0][0].Checked == 1 ) {
              values.Checked = 0
            } else if (recordsets[0][0].Checked == 0) {
              values.Checked = null
            } else {
              values.Checked = 1
            }
            
            let valuesQuery = "";
            
            for (key in values) {
              if(values[key]) {
                valuesQuery += key + "='" + values[key] + "',";
              } else {
                valuesQuery += key + "=" + values[key] + ",";

              }
            }

            valuesQuery = valuesQuery.slice(0, -1);
            await sql.query(`update ${Model} set ${valuesQuery} where ID = ${recordsets[0][0].ID}`);
        
            return res.status(200).json({
              success: true,
              result: {},
              message: "we update this document by this EMPID: " + values.EMPID,
            });

          } else {
            values.Checked = 1

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
  

