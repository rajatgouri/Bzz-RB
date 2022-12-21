const methods = require("./crudController");
const endpoints = methods.crudController("WeeklyPBKPIs");
var sql = require("mssql");

delete endpoints["list"];
const Model = "WeeklyPBKPIs";

endpoints.list = async (req, res) => {
    try {
      
     const {recordset: result} =  await sql.query(`
     -- Daily
     ;WITH CTEAverageCountDaily
     AS
     (
       SELECT [User], [EMPID],
       SUM(ISNULL(WQ5508AmountRemoved, 0)) WQ5508AmountRemoved, SUM(CASE WHEN ISNULL(WQ5508AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ5508AmountRemovedCnt, 
       SUM(ISNULL(WQ1075AmountRemoved, 0)) WQ1075AmountRemoved, SUM(CASE WHEN ISNULL(WQ1075AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ1075AmountRemovedCnt,
       SUM(ISNULL(WQ5508ChargesProcessed, 0)) WQ5508ChargesProcessed, SUM(CASE WHEN ISNULL(WQ5508ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508ChargesProcessedCnt,
       SUM(ISNULL(WQ1075ChargesProcessed, 0)) WQ1075ChargesProcessed, SUM(CASE WHEN ISNULL(WQ1075ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075ChargesProcessedCnt,
       SUM(ISNULL(WQ1075AccountsProcessed, 0)) WQ1075AccountsProcessed, SUM(CASE WHEN ISNULL(WQ1075AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075AccountsProcessedCnt,
       SUM(ISNULL(WQ5508AccountsProcessed, 0)) WQ5508AccountsProcessed, SUM(CASE WHEN ISNULL(WQ5508AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508AccountsProcessedCnt
       FROM TotalPBKPIs
       GROUP BY [User], [EMPID]
     ),
     CTEDaily
     AS
     (
       SELECT [User], [EMPID],
       CASE WHEN WQ5508AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AmountRemoved / WQ5508AmountRemovedCnt, 2) ELSE 0.00 END WQ5508AmountRemovedAvg,
       CASE WHEN WQ1075AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AmountRemoved / WQ1075AmountRemovedCnt, 2) ELSE 0.00 END WQ1075AmountRemovedAvg,
       CASE WHEN WQ5508ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508ChargesProcessed / WQ5508ChargesProcessedCnt, 2) ELSE 0.00 END WQ5508ChargesProcessedAvg,
       CASE WHEN WQ1075ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075ChargesProcessed / WQ1075ChargesProcessedCnt, 2) ELSE 0.00 END WQ1075ChargesProcessedAvg,
       CASE WHEN WQ1075AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AccountsProcessed / WQ1075AccountsProcessedCnt, 2) ELSE 0.00 END WQ1075AccountsProcessedAvg,
       CASE WHEN WQ5508AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AccountsProcessed / WQ5508AccountsProcessedCnt, 2) ELSE 0.00 END WQ5508AccountsProcessedAvg,
       'Daily' DataRange
       FROM CTEAverageCountDaily
     )
     -- Weekly
     ,CTEAverageCountWeeklyTemp
     AS
     (
       SELECT [User] ,[EMPID], DATENAME(WEEK, ActionTimeStamp) WeekNumber,
       SUM(ISNULL(WQ5508AmountRemoved, 0)) WQ5508AmountRemoved,
       SUM(ISNULL(WQ1075AmountRemoved, 0)) WQ1075AmountRemoved,
       SUM(ISNULL(WQ5508ChargesProcessed, 0)) WQ5508ChargesProcessed,
       SUM(ISNULL(WQ1075ChargesProcessed, 0)) WQ1075ChargesProcessed,
       SUM(ISNULL(WQ1075AccountsProcessed, 0)) WQ1075AccountsProcessed,
       SUM(ISNULL(WQ5508AccountsProcessed, 0)) WQ5508AccountsProcessed
       FROM TotalPBKPIs
       GROUP BY [User], [EMPID], DATENAME(WEEK, ActionTimeStamp)
     ),
     CTEAverageCountWeekly
     AS
     (
       SELECT [User],[EMPID],
       SUM(ISNULL(WQ5508AmountRemoved, 0)) WQ5508AmountRemoved, SUM(CASE WHEN ISNULL(WQ5508AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ5508AmountRemovedCnt, 
       SUM(ISNULL(WQ1075AmountRemoved, 0)) WQ1075AmountRemoved, SUM(CASE WHEN ISNULL(WQ1075AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ1075AmountRemovedCnt,
       SUM(ISNULL(WQ5508ChargesProcessed, 0)) WQ5508ChargesProcessed, SUM(CASE WHEN ISNULL(WQ5508ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508ChargesProcessedCnt,
       SUM(ISNULL(WQ1075ChargesProcessed, 0)) WQ1075ChargesProcessed, SUM(CASE WHEN ISNULL(WQ1075ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075ChargesProcessedCnt,
       SUM(ISNULL(WQ1075AccountsProcessed, 0)) WQ1075AccountsProcessed, SUM(CASE WHEN ISNULL(WQ1075AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075AccountsProcessedCnt,
       SUM(ISNULL(WQ5508AccountsProcessed, 0)) WQ5508AccountsProcessed, SUM(CASE WHEN ISNULL(WQ5508AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508AccountsProcessedCnt
       FROM CTEAverageCountWeeklyTemp
       GROUP BY [User],[EMPID]
     ),
     CTEWeekly
     AS
     (
       SELECT [User],[EMPID],
       CASE WHEN WQ5508AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AmountRemoved / WQ5508AmountRemovedCnt, 2) ELSE 0.00 END WQ5508AmountRemovedAvg,
       CASE WHEN WQ1075AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AmountRemoved / WQ1075AmountRemovedCnt, 2) ELSE 0.00 END WQ1075AmountRemovedAvg,
       CASE WHEN WQ5508ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508ChargesProcessed / WQ5508ChargesProcessedCnt, 2) ELSE 0.00 END WQ5508ChargesProcessedAvg,
       CASE WHEN WQ1075ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075ChargesProcessed / WQ1075ChargesProcessedCnt, 2) ELSE 0.00 END WQ1075ChargesProcessedAvg,
       CASE WHEN WQ1075AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AccountsProcessed / WQ1075AccountsProcessedCnt, 2) ELSE 0.00 END WQ1075AccountsProcessedAvg,
       CASE WHEN WQ5508AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AccountsProcessed / WQ5508AccountsProcessedCnt, 2) ELSE 0.00 END WQ5508AccountsProcessedAvg,
       'Weekly' DataRange
       FROM CTEAverageCountWeekly
     )
     
     -- Monthly
     ,CTEAverageCountMonthlyTemp
     AS
     (
       SELECT [User] ,[EMPID], MONTH(ActionTimeStamp) MonthNo, YEAR(ActionTimeStamp) YearNo,
       SUM(ISNULL(WQ5508AmountRemoved, 0)) WQ5508AmountRemoved,
       SUM(ISNULL(WQ1075AmountRemoved, 0)) WQ1075AmountRemoved,
       SUM(ISNULL(WQ5508ChargesProcessed, 0)) WQ5508ChargesProcessed,
       SUM(ISNULL(WQ1075ChargesProcessed, 0)) WQ1075ChargesProcessed,
       SUM(ISNULL(WQ1075AccountsProcessed, 0)) WQ1075AccountsProcessed,
       SUM(ISNULL(WQ5508AccountsProcessed, 0)) WQ5508AccountsProcessed
       FROM TotalPBKPIs
       GROUP BY [User],[EMPID], MONTH(ActionTimeStamp), YEAR(ActionTimeStamp)
     ),
     CTEAverageCountMonthly
     AS
     (
       SELECT [User],[EMPID],
       SUM(ISNULL(WQ5508AmountRemoved, 0)) WQ5508AmountRemoved, SUM(CASE WHEN ISNULL(WQ5508AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ5508AmountRemovedCnt, 
       SUM(ISNULL(WQ1075AmountRemoved, 0)) WQ1075AmountRemoved, SUM(CASE WHEN ISNULL(WQ1075AmountRemoved, 0) > 0 THEN 1 ELSE 0 END) WQ1075AmountRemovedCnt,
       SUM(ISNULL(WQ5508ChargesProcessed, 0)) WQ5508ChargesProcessed, SUM(CASE WHEN ISNULL(WQ5508ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508ChargesProcessedCnt,
       SUM(ISNULL(WQ1075ChargesProcessed, 0)) WQ1075ChargesProcessed, SUM(CASE WHEN ISNULL(WQ1075ChargesProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075ChargesProcessedCnt,
       SUM(ISNULL(WQ1075AccountsProcessed, 0)) WQ1075AccountsProcessed, SUM(CASE WHEN ISNULL(WQ1075AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ1075AccountsProcessedCnt,
       SUM(ISNULL(WQ5508AccountsProcessed, 0)) WQ5508AccountsProcessed, SUM(CASE WHEN ISNULL(WQ5508AccountsProcessed, 0) > 0 THEN 1 ELSE 0 END) WQ5508AccountsProcessedCnt
       FROM CTEAverageCountMonthlyTemp
       GROUP BY [User],[EMPID]
     ),
     CTEMonthly
     AS
     (
       SELECT [User],[EMPID],
       CASE WHEN WQ5508AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AmountRemoved / WQ5508AmountRemovedCnt, 2) ELSE 0.00 END WQ5508AmountRemovedAvg,
       CASE WHEN WQ1075AmountRemovedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AmountRemoved / WQ1075AmountRemovedCnt, 2) ELSE 0.00 END WQ1075AmountRemovedAvg,
       CASE WHEN WQ5508ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508ChargesProcessed / WQ5508ChargesProcessedCnt, 2) ELSE 0.00 END WQ5508ChargesProcessedAvg,
       CASE WHEN WQ1075ChargesProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075ChargesProcessed / WQ1075ChargesProcessedCnt, 2) ELSE 0.00 END WQ1075ChargesProcessedAvg,
       CASE WHEN WQ1075AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ1075AccountsProcessed / WQ1075AccountsProcessedCnt, 2) ELSE 0.00 END WQ1075AccountsProcessedAvg,
       CASE WHEN WQ5508AccountsProcessedCnt > 0 THEN CONVERT(NUMERIC(18, 2), WQ5508AccountsProcessed / WQ5508AccountsProcessedCnt, 2) ELSE 0.00 END WQ5508AccountsProcessedAvg,
       'Monthly' DataRange
       FROM CTEAverageCountMonthly
     )
     
     SELECT *
     FROM CTEDaily
     UNION ALL
     SELECT *
     FROM CTEWeekly
     UNION ALL
     SELECT *
     FROM CTEMonthly
        `)

      return res.status(200).json({
        success: true,
        result: result,
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
