const methods = require("./crudController");
const endpoints = methods.crudController("EPICDailyWQSummary");
var sql = require("mssql");

delete endpoints["list"];

endpoints.list = async (req, res,) => {
    try {

        const {id, user } = req.query;
        
        const query = `

            SELECT Count(Status) as count , Convert(Date, DateTime) as DateTime, Status, UserName
            FROM [HIMSRB].[dbo].[${id}] 
            where Status IN ('Start', 'Finish -Done', 'Finish', 'Finish -Pending', 'Finish -Misc', 'Finish -Deferred', 'Misc', 'Done', 'Pending', 'Deferred' ) AND UserName = '${user}' and DateTime < CURRENT_TIMESTAMP and Datetime > DATEADD(Year, -2, CURRENT_TIMESTAMP)
            group By Convert(Date, DateTime) , Status,  UserName
            order By Convert(Date, DateTime) desc
            
        `;

        var { recordset: result } = await sql.query(query);

        let dates = ([...new Set(result.map(d => {
            return d['DateTime'].toISOString().split('T')[0] 
        }))])

        dates = (dates.filter((date) => new Date(date) > new Date('2021-11-24')))

        result = dates.map((date) => {
            let item  = result.filter((data) => data.DateTime.toISOString().split('T')[0] == date)

            let finish = ['Finish -Done', 'Finish', 'Finish -Pending', 'Finish -Misc', 'Finish -Deferred'];

            return {
                Date: date,
                Start: item.filter((i) => i.Status == 'Start')[0]? item.filter((i) => i.Status == 'Start')[0]['count'] : 0,
                Finish: item.filter((i) => finish.indexOf(i.Status) > -1 ? true : false)[0] ? item.filter((i) => finish.indexOf(i.Status) > -1 ? true : false)[0]['count'] : 0
            }
        })
        

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
