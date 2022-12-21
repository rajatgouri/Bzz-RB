const methods = require("../crudController");
const endpoints = methods.crudController("HIMS_Research_Study_TimePoints");
var sql = require("mssql");
const { getDateTime } = require("../utilController");
const sqlConnection = require('../../sql')

const Model = "[FI_DM_HIMS_ICD].[dbo].[HIMS_Research_Study_TimePoints]";
const Sheet_Model = '[FI_DM_HIMS_ICD].[dbo].[StudySheets]'
const Studies_Model = '[FI_DM_HIMS_ICD].[dbo].[Studies]'
const Study_Items_Model = '[FI_DM_HIMS_ICD].[dbo].[StudyItems]'
const TimePoint_Mapping_Model = '[FI_DM_HIMS_ICD].[dbo].[SA_TimepointMapping]'
const rb_TimePoint_Mapping_Model = 'SA_TimepointMapping'
const TimePoints_Model = '[FI_DM_HIMS_ICD].[dbo].[Timepoints]'
const ARM_Mapping_Model = '[FI_DM_HIMS_ICD].[dbo].[SA_ARMMapping]'
const Logger_Model = 'TimepointMappingLogger'
const Billing_TimePointMap = '[FI_DM_HIMS_ICD].[dbo].[Billing_TimePointMap]'

delete endpoints["update"];
delete endpoints["list"];
 

endpoints.list = async (req, res) => {
  try {
    
    const {irb, sheet} = req.body
    let virb = irb 
    let vsheet = sheet 



    let query1 =`
    
SELECT DISTINCT
etp.[TIME_POINT] [TIME_POINT]
,tpm.[Selected MCA] [Selected MCA]
,tpm.[Selected Column] [Selected Column]
,arm.[IRB]
,           arm.[Selected MCA] [MCA Arm]
,           arm.[Notes]
FROM ${Model} etp
LEFT JOIN ${ARM_Mapping_Model} arm WITH (NOLOCK) ON etp.[IRB_APPROVAL_NUM]=arm.[IRB] AND etp.[TRT_PLAN_NAME]=arm.[EPIC ARM]
Left JOIN ${TimePoint_Mapping_Model} tpm WITH (NOLOCK) ON arm.[IRB]=tpm.[IRB] AND arm.[Selected MCA]=tpm.[MCA Arm] AND etp.[TIME_POINT]=tpm.[Timepoint]
WHERE arm.[IRB]='${virb}' AND arm.[Selected MCA] IN ('${vsheet}')
    `

    let query2 = `
    SELECT DISTINCT
    (CASE WHEN [Parent3] IS NOT NULL
    THEN [Parent3] + ', '
    ELSE ''
    END)+
    (CASE WHEN [Parent2] IS NOT NULL
    THEN [Parent2] + ', '
    ELSE ''
    END) +
    (CASE WHEN [Parent1] IS NOT NULL
    THEN [Parent1] + ', '
    ELSE ''
    END)+
    (CASE WHEN [ParentTimePoint] IS NOT NULL
    THEN [ParentTimePoint] + ', '
    ELSE ''
    END)+
    COALESCE([TimePoint],'') [MCA TimePoint]
    ,tp.[ColumnLetter]
    ,tp.SortOrder
FROM ${TimePoints_Model} tp
LEFT JOIN ${Study_Items_Model} AS si WITH (NOLOCK) ON tp.[ItemId]=si.[ItemId]
LEFT JOIN ${Sheet_Model} AS ss WITH (NOLOCK) ON si.SheetId = ss.SheetId
LEFT JOIN ${Studies_Model} AS s WITH (NOLOCK) ON ss.StudyId= s.StudyId
WHERE s.[StudyNumber]='${virb}' AND ss.[SheetName] IN ('${vsheet}')
ORDER BY tp.[SortOrder]
    `
  
    let [{recordset:Epic_Timepoint},{recordset: MCA_Timepoint} ] = await
    Promise.all([
      await sqlConnection.query(query1),
      await sqlConnection.query(query2),
    ])

  
  
  
    MCA_Timepoint.unshift({'MCA TimePoint': ""})
    MCA_Timepoint.push({'MCA TimePoint': "TBD"})
    
    result = Epic_Timepoint.map((ET, i) => {
      return {item: ET, option: MCA_Timepoint, value: ET['Selected MCA'], index: i, IRB: virb, Notes: ET['Notes'], 'MCA Column' : MCA_Timepoint.length > 0 ? ET['Selected Column'] : ''}
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


const logger = async (values) => {

  const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"
  
  let valuesQuery = "";
  for (key in values) {
    if (values[key] === "null") {
      valuesQuery += "NULL" + ",";
    } else {
      valuesQuery += "'" + values[key] + "',";
    }
  }
  valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


  const insertQuery = `insert into ${Logger_Model} ${columnsQ} values ${valuesQuery}`
  await sql.query(insertQuery);
}

endpoints.saveAll = async (req, res) => {
  try {
    const values = req.body;   
    values['UserName'] = req.admin.Nickname
    values['ActionTimeStamp'] = getDateTime() 

    console.log(values)
    let promise = new Promise(async (resolve, reject) => {

      for(let i=0; i< values.length ;i++) {

        let value = values[i]
        let valueQuery = "";

        for (key in value) {
          if (value[key] == null || value[key] == "null" || value[key] == "") {
            valueQuery += "[" + key + "]= NULL" + ",";
          } else {
            valueQuery += "[" + key + "]='" + value[key] + "',";
          }
        }
    
        valueQuery = valueQuery.slice(0, -1);
      
  
        await sqlConnection.query(`update ${TimePoint_Mapping_Model} set ${valueQuery} where [Timepoint] = '${value['Timepoint']}' AND [IRB] = '${value.IRB}'`);
        await sql.query(`update ${rb_TimePoint_Mapping_Model} set ${valueQuery} where [Timepoint] = '${value['Timepoint']}' AND [IRB] = '${value.IRB}'`);
  
        
        let selectQuery = `SELECT ID from ${TimePoint_Mapping_Model}  where [Timepoint] = '${value['Timepoint']}' AND [IRB] = '${value.IRB}'`
        let {recordset: result} = await sqlConnection.query(selectQuery);
        if (result[0]) {
          logger({
            TimePointID : (result[0].ID),
            UserName: req.admin.First,
            ActionTimeStamp: getDateTime()
          })
        }
        
      

        if(i == values.length -1) {
          resolve(true)
        }
      }
    })
   
      await promise

    return res.status(200).json({
      success: true,
      result: result,

      message: "Successfully saved all items",
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

endpoints.create = async (req, res) => {
  try {
    const values = req.body;    
    values['UserName'] = req.admin.Nickname
    values['ActionTimeStamp'] = getDateTime()

    let {recordset: result} =  await sqlConnection.query(`SELECT * from ${TimePoint_Mapping_Model} where [Timepoint] = '${values['Timepoint']}' AND IRB = ${values['IRB']}`)
   
    if(result.  length == 0 ) {
      const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"

  
      let valuesQuery = "";
      for (key in values) {
        if (values[key] == "null" || values[key] == null || values[key] == "" ) {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
  
  
      const insertQuery = `insert into ${TimePoint_Mapping_Model} ${columnsQ} values ${valuesQuery}`
      const insertRBQuery = `insert into ${rb_TimePoint_Mapping_Model} ${columnsQ} values ${valuesQuery}`

      await sqlConnection.query(insertQuery);
      await sql.query(insertRBQuery);

      
      let selectQuery = `SELECT ID from ${TimePoint_Mapping_Model} ORDER BY ID Desc OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`
      let {recordset: result} = await sqlConnection.query(selectQuery);
      
      logger({
        TimePointID : (result[0].ID),
        UserName: req.admin.First,
        ActionTimeStamp: getDateTime()
      })
      

    } else {
      let valuesQuery = "";

      for (key in values) {
        if (values[key] == null || values[key] == "null" || values[key] == "") {
          valuesQuery += "[" + key + "]= NULL" + ",";
        } else {
          valuesQuery += "[" + key + "]='" + values[key] + "',";
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
    

      await sqlConnection.query(`update ${TimePoint_Mapping_Model} set ${valuesQuery} where [Timepoint] = '${values['Timepoint']}' AND [IRB] = '${values.IRB}'`);
      await sql.query(`update ${rb_TimePoint_Mapping_Model} set ${valuesQuery} where [Timepoint] = '${values['Timepoint']}' AND [IRB] = '${values.IRB}'`);

      
      let selectQuery = `SELECT ID from ${TimePoint_Mapping_Model}  where [Timepoint] = '${values['Timepoint']}' AND [IRB] = '${values.IRB}'`
      let {recordset: result} = await sqlConnection.query(selectQuery);
      
      logger({
        TimePointID : (result[0].ID),
        UserName: req.admin.First,
        ActionTimeStamp: getDateTime()
      })
    }


    
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


endpoints.update = async (req, res) => {
  try {
    const {irb} = req.params
    const values = req.body;    
    const Name = req.body['Name']
    values['UserName'] = req.admin.Nickname
    values['ActionTimeStamp'] = getDateTime()

    delete values['Name']
      let valuesQuery = "";
      for (key in values) {
        if (values[key] == null || values[key] == "null" || values[key] == "") {
          valuesQuery += "[" + key + "]= NULL" + ",";
        } else {
          valuesQuery += "[" + key + "]='" + values[key] + "',";
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
    
      await sqlConnection.query(`update ${TimePoint_Mapping_Model} set ${valuesQuery} where [Timepoint] = '${Name}' AND [IRB] = '${irb}'`);
      await sql.query(`update ${rb_TimePoint_Mapping_Model} set ${valuesQuery} where [Timepoint] = '${Name}' AND [IRB] = '${irb}'`);

 
    return res.status(200).json({
      success: true,
      result: [],

      message: "Successfully updated  document",
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


endpoints.getItem = async (req, res) => {
  try {
    const IRB = req.body['IRB'];    
    const Name = req.body['Name']

    let {recordset: result} =   await sqlConnection.query(`SELECT * FROM ${TimePoint_Mapping_Model} where [Timepoint] = '${Name}' AND [IRB] = '${IRB}'`);

    return res.status(200).json({
      success: true,
      result: result,

      message: "get document successfully",
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