const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075Answers");
var sql = require("mssql");
var sqlConnection = require('../sql')


delete endpoints["list"];


endpoints.list = async (req, res,) => {
    try {

       
        var id = JSON.parse(req.query.id);
        id = id.id
        const {recordset: result} = await sqlConnection.query(`
        SELECT TOP (500) [HSP_ACCOUNT_ID] [HAR]
        ,[SERVICE_DATE] [Svc Date]
        ,[CPT_CODE] [CPT Code]
        ,[HCPCS_CODE] [HCPCS Code]
        ,[UB_REV_CODE_ID] [Rev Code]
        ,[PROCEDURE_DESC] [Procedure]
        ,[QUANTITY] [Quantity]
        ,[TX_AMOUNT] [Amount]
        ,[TX_POST_DATE] [Post Date]
    FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] t
    LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_TX_TYPE_HA] tt  WITH (NOLOCK) ON t.[TX_TYPE_HA_C]=tt.[TX_TYPE_HA_C]
    WHERE [HSP_ACCOUNT_ID]='${id}' 
      AND tt.[NAME] LIKE '%Charge%'
	  order by [TX_POST_DATE] DESC
  
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
