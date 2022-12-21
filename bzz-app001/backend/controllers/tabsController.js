const methods = require("./crudController");
const endpoints = methods.crudController("WQ1262Tabs");
var sql = require("mssql");

delete endpoints["list"];

const TabModel = 'WQ1262Tabs'



endpoints.tabs = async (req,res) => {
    try {

        const EMPID  = req.query.EMPID;
        const entity = req.query.entity;


        const {recordset: result} = await sql.query(`SELECT * from ${TabModel} where EMPID = '${EMPID}'`)

        return res.status(200).json({
          success: true,
          // result: recordset,
          result: result,
          // pagination,
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
}



endpoints.create = async (req, res) => {
    try {
        const values = req.body;
       values.EMPID = req.admin.EMPID



            const {recordset: exists } = await sql.query(`SELECT * from ${TabModel} where EMPID = '${values.EMPID}'`)

            if (exists.length > 0) {

              // values.EMPID = +req.admin.EMPID;
              const { id } = req.params;
              let valuesQuery = "";
              for (key in values) {
          
                if (values[key] == 0) {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
          
                } else if (  values[key] == null || values[key] == "null" || values[key] == "") {
                  valuesQuery += "[" + key + "]= NULL" + ",";
                } else {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
                }
              }
          
              valuesQuery = valuesQuery.slice(0, -1);
            
              let updateQ = `update T1  set ${valuesQuery} from ${TabModel} T1 where EMPID = ${values.EMPID}`
              await sql.query(updateQ);
          
              return res.status(200).json({
                success: true,
                result: {},
                message: "we update this document by this id: " + req.params.id,
              });
            } else {
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
              
                const insertQuery = `insert into ${TabModel} ${columnsQ} values ${valuesQuery}`
            
                await sql.query(insertQuery);
            
                return res.status(200).json({
                    success: true,
                    result: {},
                    message: "we added document" ,
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
};




module.exports = endpoints;
