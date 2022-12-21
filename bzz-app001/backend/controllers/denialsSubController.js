const methods = require("./crudController");
const endpoints = methods.crudController("Denails");
var sql = require("mssql");
var sqlConnection = require('../sql')

delete endpoints["list"];


endpoints.list = async (req, res,) => {
    try {

       
        var id = JSON.parse(req.query.id);

      
        const {recordset: result} = await sqlConnection.query(`
        SELECT [HCPCS_CODES] [HCPC Code]
        ,[PROC_DESC] [Proc Description]
        ,clml.[QUANTITY] [Quantity]
        ,[CHARGE_AMT] [Charge Amount]
        ,cft.[NAME] [Charge File to]
        ,CASE
            WHEN cft.[NAME] LIKE '%Study%' THEN 'R'
            WHEN cft.[NAME] LIKE '%Pat%' THEN 'S'
            ELSE 'SOC'
         END [R or S]
        ,'' [Biller Reviewed]
    FROM [Clarity_PRD_Report].[dbo].[HSP_CLP_CMS_LINE] clml WITH (NOLOCK) 
    LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_CLAIM_DETAIL2] clmd  WITH (NOLOCK) ON clml.[CLAIM_PRINT_ID]=clmd.[CLAIM_PRINT_ID]
    LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt WITH (NOLOCK)  ON clmd.[HOSPITAL_ACCT_ID]=hspt.[HSP_ACCOUNT_ID] AND clml.[PROC_ID]=hspt.[PROC_ID] AND clml.[FROM_SERV_DT]=hspt.[SERVICE_DATE]
    LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS_2] hspt2 WITH (NOLOCK)  ON hspt.[TX_ID]=hspt2.[TX_ID]
    INNER JOIN [Clarity_PRD_Report].[dbo].[ZC_RSH_CHG_ROUTE] cft WITH (NOLOCK)  ON hspt2.[RSH_CHG_ROUTE_C]=cft.[RSH_CHG_ROUTE_C]
    WHERE clml.[CLAIM_PRINT_ID]='${id.id}'
        `)


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
