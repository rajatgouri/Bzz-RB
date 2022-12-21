const methods = require("./crudController");
const endpoints = methods.crudController("IRBreport");
var sql = require("mssql");
const sqlConnection = require('../sql')

const Model = "IRBreport";
delete endpoints["update"];
delete endpoints['list'];
const {getFilters} = require('../Utils/applyFilter')



endpoints.list = async (req, res) => {
  try {
    const page = req.body.page || 1;

    const limit = parseInt(req.body.items) || 100;
    const skip = page * limit - limit;
    const order = req.body.order || "DESC";
    // const filter = req.body.filter || "New";

    var filter = (req.body.filter);
    var sorter = (req.body.sorter);

    let filterQuery = "";
    
    const customSwitch = []
    for ( f in filter) {
        let {value, type} = filter[f]
        if (value && value.length > 0 &&  (f != 'HAR EDW' && f != 'Account Financial Class EDW' && f != 'Admission Date EDW' && f != 'Discharge Date EDW' && f != 'Claim Paid EDW' && f != 'DOB')) {
            customSwitch.push({
                condition: f,
                value: value,
                type: type
            })
        }
        
    }
        filterQuery = await getFilters(filter, customSwitch)

        for (key in filter) {
          if (filter[key].value) {

          

              switch (key) {
                  
                 
                    case "HAR EDW" : {
                      let k = 'har.[HSP_ACCOUNT_ID]'
                      filterQuery += filter[key].value !== null ? ( key.split(" ").length > 1 ?   k  : k ) + " Like '%" + filter[key].value + "%' and " : "" ;
                      break
                    }

                    case "Account Financial Class EDW" : {
                      let k = 'afc.[NAME]'
                      filterQuery += filter[key].value !== null ? ( key.split(" ").length > 1 ?   k  : k ) + " Like '%" + filter[key].value + "%' and " : "" ;
                      break
                    }

                    case "Discharge Date EDW" : {
                      let k = 'har.[DISCH_DATE_TIME]'
                      // filterQuery += filter[key].value !== null ? ('CAST (' + k + ' as DateTime) ') + " =  FORMAT(TRY_CAST('"+ filter[key].value +"' as datetime),'yyyy-MM-dd hh:mm:ss')" + " and " : "";
                      filterQuery += filter[key].value !== null ? ("FORMAT(TRY_CAST("+k+" as DateTime),'yyyy-MM-dd hh:mm:ss') ") + " =  FORMAT(TRY_CAST('"+ filter[key].value +"' as datetime),'yyyy-MM-dd hh:mm:ss')" + " and " : "";

                      break
                    }

                    case "Admission Date EDW" : {
                      let k = 'har.[ADM_DATE_TIME]'
                      filterQuery += filter[key].value !== null ? ("FORMAT(TRY_CAST("+k+" as DateTime),'yyyy-MM-dd hh:mm:ss') ") + " =  FORMAT(TRY_CAST('"+ filter[key].value +"' as datetime),'yyyy-MM-dd hh:mm:ss')" + " and " : "";

                      break
                    }

                    case "Claim Paid EDW" : {
                      let k = 'har.[TOT_PMTS]'
                      filterQuery += filter[key].value !== null ? ( key.split(" ").length > 1 ?   k : k ) + " Like '%" + filter[key].value + "%' and " : "" ;
                      break
                    }
              }
          }
      }

    filterQuery = filterQuery.slice(0, -4);

    
    let sorterQuery = "";
    sorter.map((sort) => {
      let k = sort.field
      if (sort.field == 'HAR EDW') {
        k = 'har.[HSP_ACCOUNT_ID]'
      } else if (sort.field == 'Account Financial Class EDW') {
        k = 'afc.[NAME]'
      } else if (sort.field == 'Admission Date EDW') {
        k = 'har.[ADM_DATE_TIME]'
      }
        else if (sort.field == 'Discharge Date EDW') {
        k = 'har.[DISCH_DATE_TIME]'
      } else if (sort.field == 'Claim Paid EDW') {
        k = 'har.[TOT_PMTS]'
      }
      sorterQuery += `[${k}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

  
    let sq = sorterQuery.slice(0, -1)


    var query = `

    SELECT [MRN]
      ,[Last Name]
      ,[First Name]
      ,[Arm]
      ,[Location]
      ,[Sequence No]
      ,[Consented]
      ,[Consented2]
      ,[On Study Date]
      ,[On Treatment Date]
      ,[Off Treatment Date]
      ,[Off Study Date]
      ,[Expired Date]
      ,[Media Consent_Linked in Epic]
      ,[Sub Consent 02149 YES/NO]
      ,[NCT No# _Claim Billed With] 
      ,[HAR]
      ,har.[HSP_ACCOUNT_ID] [HAR EDW]
      ,afc.[NAME] [Account Financial Class EDW]
      ,[Transplant Case?]
      ,[Procedure]
      ,[DX]
      ,[Stmt From Date]
      ,har.[ADM_DATE_TIME] [Admission Date EDW]
      ,[Stmt Thru Date]
      ,har.[DISCH_DATE_TIME] [Discharge Date EDW]
      ,[Deseased YES/NO]
      ,CASE WHEN pat.DEATH_DATE IS NULL THEN 'No' ELSE 'Yes' END AS [Deceased YES/NO EDW]
      ,[Claim Payer Name]
      ,[Claim Paid]
      ,har.[TOT_PMTS] [Claim Paid EDW]
      ,[Alternate Payor]
      ,[Note/Age]
      ,pat.[BIRTH_DATE] [DOB]
      ,DATEDIFF(DAY,pat.[BIRTH_DATE],GETDATE())/365 [AgeEDW]
  FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb
  LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON irb.[MRN]=pat.[PAT_MRN_ID]
  LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                            AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                            AND har.[ACCT_BASECLS_HA_C]=1
                                                            --AND har.[PAT_NAME] IS NOT NULL
                                                            --AND har.[ADM_PROV_ID] IS NOT NULL
                                                            AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
  LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc  WITH (NOLOCK) ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
  WHERE irb.[HAR] IS NOT NULL 

        `;
     var totalQuery = `
     SELECT COUNT(*)
     FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb
     LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON irb.[MRN]=pat.[PAT_MRN_ID]
     LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                               AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                               AND har.[ACCT_BASECLS_HA_C]=1
                                                               --AND har.[PAT_NAME] IS NOT NULL
                                                               --AND har.[ADM_PROV_ID] IS NOT NULL
                                                               AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
     LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc WITH (NOLOCK) ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
     WHERE irb.[HAR] IS NOT NULL 


     `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += " and " + filterQuery + " "
        totalQuery += " and " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += ` ORDER BY [MRN] ` 
      }

    } else {
      query += `ORDER BY [MRN] OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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

    const [{recordset: Arm}, {recordset: Location}, {recordset: Consented}, {recordset: NCTNoClaimBilledWith}, {recordset: ClaimPayerName}] = await Promise.all([
      await sqlConnection.query(`
      SELECT DISTINCT (Arm)
      FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat ON irb.[MRN]=pat.[PAT_MRN_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har ON pat.[PAT_ID]=har.[PAT_ID] 
                                                                AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                                AND har.[ACCT_BASECLS_HA_C]=1
                                                                --AND har.[PAT_NAME] IS NOT NULL
                                                                --AND har.[ADM_PROV_ID] IS NOT NULL
                                                                AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
      WHERE irb.[HAR] IS NOT NULL 
      `),
      await sqlConnection.query(`
      SELECT DISTINCT ([Location])
      FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON irb.[MRN]=pat.[PAT_MRN_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                                AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                                AND har.[ACCT_BASECLS_HA_C]=1
                                                                --AND har.[PAT_NAME] IS NOT NULL
                                                                --AND har.[ADM_PROV_ID] IS NOT NULL
                                                                AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc WITH (NOLOCK) ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
      WHERE irb.[HAR] IS NOT NULL 
      `),
      await sqlConnection.query(`
      SELECT DISTINCT ([Consented])
      FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb WITH (NOLOCK)
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat ON irb.[MRN]=pat.[PAT_MRN_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                                AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                                AND har.[ACCT_BASECLS_HA_C]=1
                                                                --AND har.[PAT_NAME] IS NOT NULL
                                                                --AND har.[ADM_PROV_ID] IS NOT NULL
                                                                AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc WITH (NOLOCK)s ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
      WHERE irb.[HAR] IS NOT NULL 
      `),
      await sqlConnection.query(`
      SELECT DISTINCT ([NCT No# _Claim Billed With])
      FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb WITH (NOLOCK)
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON irb.[MRN]=pat.[PAT_MRN_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                                AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                                AND har.[ACCT_BASECLS_HA_C]=1
                                                                --AND har.[PAT_NAME] IS NOT NULL
                                                                --AND har.[ADM_PROV_ID] IS NOT NULL
                                                                AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc WITH (NOLOCK) ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
      WHERE irb.[HAR] IS NOT NULL 
      `),
      await sqlConnection.query(`
      SELECT DISTINCT ([Claim Payer Name])
      FROM [FI_DM_HIMS_ICD].[dbo].[IRB02149_Report_for_Beth] irb WITH (NOLOCK)
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON irb.[MRN]=pat.[PAT_MRN_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] har WITH (NOLOCK) ON pat.[PAT_ID]=har.[PAT_ID] 
                                                                AND CAST(irb.[On Study Date] AS DATE) between CAST(har.[ADM_DATE_TIME] AS DATE) AND CAST(har.[DISCH_DATE_TIME] AS DATE) 
                                                                AND har.[ACCT_BASECLS_HA_C]=1
                                                                --AND har.[PAT_NAME] IS NOT NULL
                                                                --AND har.[ADM_PROV_ID] IS NOT NULL
                                                                AND LEFT(har.[HSP_ACCOUNT_ID],1)<>'6'
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_FIN_CLASS] afc WITH (NOLOCK) ON har.[ACCT_FIN_CLASS_C]=afc.[FIN_CLASS_C]
      WHERE irb.[HAR] IS NOT NULL 
      `),
    
    ])

         let obj = [
          { column: 'Arm', recordset: Arm },
          { column: 'Location', recordset: Location },
          { column: 'Consented', recordset: Consented },
          { column: 'NCT No# _Claim Billed With', recordset: NCTNoClaimBilledWith },
          { column: 'Claim Payer Name', recordset:  ClaimPayerName },




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
  

