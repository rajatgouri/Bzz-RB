const methods = require("./crudController");
const endpoints = methods.crudController("WQ1262Logger");
const utilController = require('./utilController');

var sql = require("mssql");

const Model = "[COHTEAMS].[dbo].[Chat]";
delete endpoints["update"];
delete endpoints['list'];

endpoints.create = async (req, res) => {
    try {
        const {User1, User2} = req.body;
       
       let {recordset} = await sql.query(`SELECT * FROM ${Model} where ([User1] = '${User1}' and [User2] = '${User2}' ) or (User2 = '${User1}' and User1 = '${User2}' )`)
       
        if (recordset.length > 0) {
            return res.status(200).json({
                success: true,
                result: recordset[0],
                pagination: 1,
                message: "Successfully found all documents",
              });
        } else {    
             await sql.query(`INSERT INTO ${Model} (User1, User2, DateTime) values ('${User1}', '${User2}', '${utilController.getDateTime()}')`)
            
            let {recordset} = await sql.query(`SELECT * FROM ${Model} where ([User1] = '${User1}' and [User2] = '${User2}' ) or (User2 = '${User1}' and User1 = '${User2}' )`)
       
            if (recordset.length > 0) {
                return res.status(200).json({
                    success: true,
                    result: recordset[0],
                    pagination: 1,
                    message: "Successfully found all documents",
                  });
                }
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


endpoints.list = async (req, res,) => {
    try {


        var user = req.query.user ;

        let {recordset} = await sql.query(`SELECT * FROM ${Model} where ([User1] = '${user}' ) or (User2 = '${user}') Order By DateTime DESC`)
        

        return res.status(200).json({
            success: true,
            result: recordset,
            pagination: 1,
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


