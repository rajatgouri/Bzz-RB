const methods = require("./crudController");
const endpoints = methods.crudController("TruePBKPISummary");
var sql = require("mssql");

delete endpoints["update"];
delete endpoints['list'];

endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;

    var query = `
      
    SELECT
      dtl.[User Name]
     ,dtl.[WQ]
     ,dtl.[Process Type]
     ,COUNT(DISTINCT dtl.[Patient MRN]) [Accounts]
     ,SUM(dtl.[Claims]) [Claims]
     ,SUM(dtl.[Charges/CPT Count]) [Charges]
     ,SUM(dtl.[Minutes]) [Minutes]
     ,CASE WHEN SUM(dtl.[Minutes])=0 THEN 0 ELSE ROUND(COUNT(DISTINCT dtl.[Patient MRN])/SUM(dtl.[Minutes]),2) END [Minutes per Account]
     ,CASE WHEN SUM(dtl.[Minutes])=0 THEN 0 ELSE ROUND(SUM(dtl.[Claims])/SUM(dtl.[Minutes]),2) END [Minutes per Claim]
     ,CASE WHEN SUM(dtl.[Minutes])=0 THEN 0 ELSE ROUND(SUM(dtl.[Charges/CPT Count])/SUM(dtl.[Minutes]),2) END [Minutes per Charge]
FROM
(SELECT 'WQ5508' [WQ]
      ,wqm.[ID]
     ,wqm.[ID] [TAR ID]
      ,wqm.[Notes]
      ,wqm.[Process Type]
      ,wqm.[Svc Date] [Service Date]
      ,wqm.[Patient MRN] [Patient MRN]
      ,wqm.[Patient] [Patient Name]
      ,wqm.[CPT Codes] [CPT Code]
      ,wqm.[Sess Amount] [Amount]
      ,wqm.[Primary Coverage]
      ,wqm.[Study Type] [Study Type]
      ,wqm.[Days Until Timely Filing]
      ,wqm.[Aging Days]
      ,wqm.[Research IRB] [Study IRB]
      ,wqm.[UserAssigned] [User Name]
      ,wqm.[Color]
      ,wqm.[User] [User Rev]
      ,wqm.[Status]
     ,cst.[FirstCopyMRNTime] [First Copy MRN Or Start]
      ,COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) [Last Done or Finish Done]
      ,CAST(DATEDIFF(SECOND, cst.[FirstCopyMRNTime], COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]))/60 AS FLOAT) [Minutes]
     ,CASE WHEN cst.[FirstCopyMRNTime] IS NULL THEN 'Copy MRN Time Missing'
           WHEN COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) IS NULL THEN 'Done Time Missing'
            WHEN CAST(cst.[FirstCopyMRNTime] AS DATE)<>CAST(COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) AS DATE) THEN 'Not Reviewed on Same Date'
           WHEN cst.[FirstCopyMRNTime]>COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) THEN 'Incorrect Clicking Order'
           WHEN ABS(DATEDIFF(MINUTE, cst.[FirstCopyMRNTime], COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp])))>30 THEN 'Above 30 Minutes'
            ELSE 'Compliant'
       END [Productivity Data Compliance Status]
      ,wqm.[UploadDateTime]
     ,1 [Claims]
     ,LEN([CPT Codes]) - LEN(REPLACE([CPT Codes],',',''))+1 [Charges/CPT Count]
  FROM [HIMSRB].[dbo].[WQ5508] wqm
  LEFT JOIN (SELECT [IDWQ5508] ,MIN([DateTime]) [FirstCopyMRNTime] FROM [HIMSRB].[dbo].[WQ5508Logger] WHERE [Status] LIKE '%Copy%' OR [Status] LIKE '%Start%' GROUP BY [IDWQ5508]) cst ON wqm.[ID]=cst.[IDWQ5508]
  LEFT JOIN (SELECT [IDWQ5508] ,MAX([DateTime]) [LastDoneTime] FROM [HIMSRB].[dbo].[WQ5508Logger] WHERE [Status] LIKE '%Done%' GROUP BY [IDWQ5508]) cet ON wqm.[ID]=cet.[IDWQ5508]
  WHERE wqm.[Status] LIKE '%Done%'
UNION ALL
SELECT 'WQ1075' [WQ]
      ,wqm.[ID]
     ,wqm.[ID] [TAR ID]
      ,wqm.[Notes]
      ,wqm.[Process Type]
      ,wqm.[Svc Date] [Service Date]
      ,wqm.[Patient MRN] [Patient MRN]
      ,wqm.[Patient] [Patient Name]
      ,wqm.[CPT Codes] [CPT Code]
      ,wqm.[Sess Amount] [Amount]
      ,wqm.[Primary Coverage]
      ,wqm.[Study Type] [Study Type]
      ,wqm.[Days Until Timely Filing]
      ,wqm.[Aging Days]
      ,wqm.[Research IRB] [Study IRB]
      ,wqm.[UserAssigned] [User Name]
      ,wqm.[Color]
      ,wqm.[User] [User Rev]
      ,wqm.[Status]
     ,cst.[FirstCopyMRNTime] [First Copy MRN Or Start]
      ,COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) [Last Done or Finish Done]
      ,CAST(DATEDIFF(SECOND, cst.[FirstCopyMRNTime], COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]))/60 AS FLOAT) [Minutes]
     ,CASE WHEN cst.[FirstCopyMRNTime] IS NULL THEN 'Copy MRN Time Missing'
           WHEN COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) IS NULL THEN 'Done Time Missing'
           WHEN cst.[FirstCopyMRNTime]>COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) THEN 'Incorrect Clicking Order'
            WHEN CAST(cst.[FirstCopyMRNTime] AS DATE)<>CAST(COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp]) AS DATE) THEN 'Not Reviewed on Same Date'
           WHEN ABS(DATEDIFF(MINUTE, cst.[FirstCopyMRNTime], COALESCE(cet.[LastDoneTime],wqm.[ActionTimeStamp])))>30 THEN 'Above 30 Minutes'
            ELSE 'Compliant'
       END [Productivity Data Compliance Status]
      ,wqm.[UploadDateTime]
     ,1 [Claims]
     ,LEN([CPT Codes]) - LEN(REPLACE([CPT Codes],',',''))+1 [Charges/CPT Count]
  FROM [HIMSRB].[dbo].[WQ1075] wqm
  LEFT JOIN (SELECT [IDWQ1075] ,MIN([DateTime]) [FirstCopyMRNTime] FROM [HIMSRB].[dbo].[WQ1075Logger] WHERE [Status] LIKE '%Copy%' OR [Status] LIKE '%Start%' GROUP BY [IDWQ1075]) cst ON wqm.[ID]=cst.[IDWQ1075]
  LEFT JOIN (SELECT [IDWQ1075] ,MAX([DateTime]) [LastDoneTime] FROM [HIMSRB].[dbo].[WQ1075Logger] WHERE [Status] LIKE '%Done%' GROUP BY [IDWQ1075]) cet ON wqm.[ID]=cet.[IDWQ1075]
  WHERE wqm.[Status] LIKE '%Done%') dtl
  WHERE dtl.[Productivity Data Compliance Status]='Compliant'
  GROUP BY dtl.[User Name]
     ,dtl.[WQ]
     ,dtl.[Process Type]
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


