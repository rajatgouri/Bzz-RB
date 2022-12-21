const methods = require("./crudController");
const endpoints = methods.crudController("WQ5508");
var sql = require("mssql");


delete endpoints["update"];
delete endpoints['list'];


endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;
    const order = req.query.order || "DESC";
    // const filter = req.query.filter || "New";

    var filter = JSON.parse(req.query.filter);
    var sorter = JSON.parse(req.query.sorter);


    var query = `
    SELECT * FROM
(SELECT [UserAssigned]
      ,'5508' [WQ]
      ,CASE WHEN gc.Government=0 THEN 'Non-Gov' ELSE 'Gov' END [Gov Coverage]
	  ,COUNT([Sess Amount]) [Count]
	  ,SUM([Sess Amount]) [Amount]
FROM [HIMSRB].[dbo].[WQ5508] wq5508 WITH (NOLOCK)
  LEFT JOIN [HIMSRB].[dbo].[CoveragesGovernment] gc ON wq5508.[Primary Coverage]=gc.[PrimaryCoverage]
  WHERE [Status]='Review'
  GROUP BY [UserAssigned], CASE WHEN gc.Government=0 THEN 'Non-Gov' ELSE 'Gov' END
UNION ALL
SELECT [UserAssigned]
      ,'1075' [WQ]
      ,CASE WHEN gc.Government=0 THEN 'Non-Gov' ELSE 'Gov' END [Gov Coverage]
	  ,COUNT([Sess Amount]) [Count]
	  ,SUM([Sess Amount]) [Amount]
FROM [HIMSRB].[dbo].[WQ1075] wq5508 WITH (NOLOCK)
  LEFT JOIN [HIMSRB].[dbo].[CoveragesGovernment] gc ON wq5508.[Primary Coverage]=gc.[PrimaryCoverage]
  WHERE [Status]='Review'
  GROUP BY [UserAssigned], CASE WHEN gc.Government=0 THEN 'Non-Gov' ELSE 'Gov' END) t
  ORDER BY [WQ], [UserAssigned],  [Gov Coverage], [COUNT] DESC

    `;

    var recordset;
    var arr;

    const { recordset: result } = await sql.query(query);
    recordset = result;
    arr = result.length

    const obj = arr[0];
    const count = 100;

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
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


