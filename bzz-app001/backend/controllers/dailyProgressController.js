const methods = require("./crudController");
const endpoints = methods.crudController("EPICDailyWQSummary");
var sql = require("mssql");

delete endpoints["list"];
const Model = "EPICDailyWQSummary";

endpoints.list = async (req, res,) => {
    try {

        var {id , dates} = req.query;
        var query = ''

        if (dates) {
            dates = (JSON.parse(dates).filter((d) => d != ''))
            
        }

        if (dates && dates.length > 0) {
            query =`select * from ${Model} where WORKQUEUE_ID = '${id}' and CAST ([HX_DATE] as Date) between FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as datetime),'yyyy-MM-dd')   Order By HX_DATE DESC `

        } else {
            query = `select * from ${Model} where WORKQUEUE_ID = '${id}' and [HX_DATE] > '2021-06-01' Order By HX_DATE DESC `;
        }

        const { recordset: result } = await sql.query(query);

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
