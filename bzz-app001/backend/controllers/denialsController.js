const methods = require("./crudController");
const endpoints = methods.crudController("Denials");
var sql = require("mssql");
const sqlConnection = require('../sql')

delete endpoints["update"];
delete endpoints['list'];
const {getFilters} = require('../Utils/applyFilter')



endpoints.list = async (req, res) => {
  try {
    const page = req.body.page || 1;

    const limit = parseInt(req.body.items) || 100;
    const skip = page * limit - limit;
    const order = req.body.order || "DESC";

    var filter = (req.body.filter);
    var sorter = (req.body.sorter);

    let filterQuery = "";
    
    const customSwitch = []
    for ( f in filter) {
        let {value, type} = filter[f]
        if (value && value.length > 0 ) {
            customSwitch.push({
                condition: f,
                value: value,
                type: type
            })
        }
        
    }
    filterQuery = await getFilters(filter, customSwitch)
    filterQuery = filterQuery.slice(0, -4);
    
    let sorterQuery = "";
    sorter.map((sort) => {
      let k = sort.field
     
      sorterQuery += `[${k}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

  
    let sq = sorterQuery.slice(0, -1)


    var query = `

    SELECT * FROM (
      SELECT DISTINCT
      bkt.[HSP_ACCOUNT_ID] [HAR]
     ,bdc.[CLAIM_PRINT_ID] [Claim ID]
   ,CASE WHEN bdc.[RECORD_TYPE_C]='1' THEN 'Denied' ELSE 'Paid' END [Denial Status]
   ,CAST(bdc.[BDC_CREATE_DATE] AS DATE) [Denial Date]
   ,CAST(clmd.[MIN_SERVICE_DT] AS DATE) [From Service Date]
   ,CAST(clmd.[MAX_SERVICE_DT] AS DATE) [To Service Date]
   ,cvg.[PAYOR_NAME] [Payor]
   ,cvg.[BENEFIT_PLAN_NAME] [Plan]
   ,rsh.[NCT_NUM] [NCT]
   ,clmd.[TTL_CHRGS_AMT] [Total Charge Amount]
   ,clmd.[TTL_DUE_AMT] [Total Amount Due]
   ,clmd.[TTL_PMT_AMT] [Total Amount Paid]
   ,clmd.[TTL_NONCVD_AMT] [Total Non Covered Amount]
   ,clmd.[TTL_ADJ_AMT] [Total Adjusted Amount]
 FROM [Clarity_PRD_Report].[dbo].[CLP_APC_GRPR_DATA]  bdcdx WITH (NOLOCK) 
 LEFT JOIN [Clarity_PRD_Report].[dbo].[BDC_INFO] bdc  WITH (NOLOCK) ON bdcdx.[CLAIM_PRINT_ID]=bdc.[CLAIM_PRINT_ID] 
 LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_CLAIM_DETAIL2] clmd WITH (NOLOCK) ON bdc.[CLAIM_PRINT_ID]=clmd.[CLAIM_PRINT_ID]
 LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_BUCKET] bkt WITH (NOLOCK) ON  bdc.[BUCKET_ID]=bkt.[BUCKET_ID]
 LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK) ON clmd.[RESEARCH_ID]=rsh.[RESEARCH_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[V_COVERAGE_PAYOR_PLAN] cvg WITH (NOLOCK) ON bkt.[COVERAGE_ID]=cvg.[COVERAGE_ID] 
 WHERE CAST([BDC_CREATE_DATE] AS DATE) BETWEEN '2021-10-01' AND GETDATE()  AND bdcdx.[GP_FIELD_VALUE]='Z006'
        ) AS A


        `;
     var totalQuery = `
    SELECT COUNT(*) FROM (
        SELECT DISTINCT
        bkt.[HSP_ACCOUNT_ID] [HAR]
       ,bdc.[CLAIM_PRINT_ID] [Claim ID]
     ,CASE WHEN bdc.[RECORD_TYPE_C]='1' THEN 'Denied' ELSE 'Paid' END [Denial Status]
     ,CAST(bdc.[BDC_CREATE_DATE] AS DATE) [Denial Date]
     ,CAST(clmd.[MIN_SERVICE_DT] AS DATE) [From Service Date]
     ,CAST(clmd.[MAX_SERVICE_DT] AS DATE) [To Service Date]
     ,cvg.[PAYOR_NAME] [Payor]
     ,cvg.[BENEFIT_PLAN_NAME] [Plan]
     ,rsh.[NCT_NUM] [NCT]
     ,clmd.[TTL_CHRGS_AMT] [Total Charge Amount]
     ,clmd.[TTL_DUE_AMT] [Total Amount Due]
     ,clmd.[TTL_PMT_AMT] [Total Amount Paid]
     ,clmd.[TTL_NONCVD_AMT] [Total Non Covered Amount]
     ,clmd.[TTL_ADJ_AMT] [Total Adjusted Amount]
   FROM [Clarity_PRD_Report].[dbo].[CLP_APC_GRPR_DATA]  bdcdx WITH (NOLOCK) 
   LEFT JOIN [Clarity_PRD_Report].[dbo].[BDC_INFO] bdc  WITH (NOLOCK) ON bdcdx.[CLAIM_PRINT_ID]=bdc.[CLAIM_PRINT_ID] 
   LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_CLAIM_DETAIL2] clmd WITH (NOLOCK) ON bdc.[CLAIM_PRINT_ID]=clmd.[CLAIM_PRINT_ID]
   LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_BUCKET] bkt WITH (NOLOCK) ON  bdc.[BUCKET_ID]=bkt.[BUCKET_ID]
   LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK) ON clmd.[RESEARCH_ID]=rsh.[RESEARCH_ID]
    LEFT JOIN [Clarity_PRD_Report].[dbo].[V_COVERAGE_PAYOR_PLAN] cvg WITH (NOLOCK) ON bkt.[COVERAGE_ID]=cvg.[COVERAGE_ID] 
   WHERE CAST([BDC_CREATE_DATE] AS DATE) BETWEEN '2021-10-01' AND GETDATE()  AND bdcdx.[GP_FIELD_VALUE]='Z006'
          ) AS A


     `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += " where " + filterQuery + " "
        totalQuery += " where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += ` ORDER BY [Denial Date] DESC` 
      }

    } else {
      query += `ORDER BY [Denial Date] DESC OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
    }


    var recordset;
    var arr;


    const { recordset: result } = await sqlConnection.query(query);
    recordset = result;
    const { recordset: coun } = await sqlConnection.query(totalQuery);
    arr = coun
   
    const obj = arr[0];
    const count = obj[""];

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


endpoints.filters = async (req, res) => {

  try {

    const [{recordset: Payor}, {recordset: Plan}] = await Promise.all([
      await sqlConnection.query(`
      SELECT DISTINCT([Payor]) FROM (
        SELECT DISTINCT
            cvg.[PAYOR_NAME] [Payor]
          FROM [Clarity_PRD_Report].[dbo].[BDC_INFO] bdc
          INNER JOIN [Clarity_PRD_Report].[dbo].[CLP_APC_GRPR_DATA] bdcdx WITH (NOLOCK)  ON bdc.[CLAIM_PRINT_ID]=bdcdx.[CLAIM_PRINT_ID] AND bdcdx.[GP_FIELD_VALUE]='Z006' AND bdc.[RECORD_TYPE_C]='1'
          LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_CLAIM_DETAIL2] clmd WITH (NOLOCK)  ON bdc.[CLAIM_PRINT_ID]=clmd.[CLAIM_PRINT_ID]
          LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_BUCKET] bkt WITH (NOLOCK)  ON bdc.[BUCKET_ID]=bkt.[BUCKET_ID]
          LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK)  ON clmd.[RESEARCH_ID]=rsh.[RESEARCH_ID]
           LEFT JOIN [Clarity_PRD_Report].[dbo].[V_COVERAGE_PAYOR_PLAN] cvg WITH (NOLOCK)  ON bkt.[COVERAGE_ID]=cvg.[COVERAGE_ID] -- AND bkt.[BENEFIT_PLAN_ID]=cvg.[BENEFIT_PLAN_ID] AND bkt.[PAYOR_ID]=cvg.[PAYOR_ID]
          WHERE CAST([BDC_CREATE_DATE] AS DATE) BETWEEN '2021-10-01' AND GETDATE()
          ) AS A
        
        
      `),
      await sqlConnection.query(`
      SELECT DISTINCT([Plan]) FROM (
        SELECT DISTINCT
            cvg.[BENEFIT_PLAN_NAME] [Plan]
          FROM [Clarity_PRD_Report].[dbo].[BDC_INFO] bdc
          INNER JOIN [Clarity_PRD_Report].[dbo].[CLP_APC_GRPR_DATA] bdcdx WITH (NOLOCK)  ON bdc.[CLAIM_PRINT_ID]=bdcdx.[CLAIM_PRINT_ID] AND bdcdx.[GP_FIELD_VALUE]='Z006' AND bdc.[RECORD_TYPE_C]='1'
          LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_CLAIM_DETAIL2] clmd WITH (NOLOCK)  ON bdc.[CLAIM_PRINT_ID]=clmd.[CLAIM_PRINT_ID]
          LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_BUCKET] bkt WITH (NOLOCK)  ON bdc.[BUCKET_ID]=bkt.[BUCKET_ID]
          LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK)  ON clmd.[RESEARCH_ID]=rsh.[RESEARCH_ID]
           LEFT JOIN [Clarity_PRD_Report].[dbo].[V_COVERAGE_PAYOR_PLAN] cvg WITH (NOLOCK)  ON bkt.[COVERAGE_ID]=cvg.[COVERAGE_ID] -- AND bkt.[BENEFIT_PLAN_ID]=cvg.[BENEFIT_PLAN_ID] AND bkt.[PAYOR_ID]=cvg.[PAYOR_ID]
          WHERE CAST([BDC_CREATE_DATE] AS DATE) BETWEEN '2021-10-01' AND GETDATE()
          ) AS A
      `)
    ])

         let obj = [
          { column: 'Payor', recordset: Payor },
          { column: 'Plan', recordset: Plan },
         ]

    
      return res.status(200).json({
          success: true,
          // result: recordset,
          result: obj,
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
};





  module.exports = endpoints;
  

