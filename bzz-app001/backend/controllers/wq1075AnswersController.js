const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075Answers");
var sql = require("mssql");


delete endpoints["list"];

const Model = "WQ1075Answers";

endpoints.list = async (req, res,) => {
    try {

       
        var id = JSON.parse(req.query.id);

        const {recordset: result} = await sql.query(`SELECT * from ${Model} where WQID = ${id.id}`)
        return res.status(200).json({
            success: true,
            result: result,
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
