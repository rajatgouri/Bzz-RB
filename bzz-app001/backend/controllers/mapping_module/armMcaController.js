const methods = require("../crudController");
const endpoints = methods.crudController("HIMS_Research_Study_Details");
var sql = require("mssql");
const { getDateTime } = require("../utilController");
const sqlConnection = require('../../sql')

const Model = "[FI_DM_HIMS_ICD].[dbo].[HIMS_Research_Study_Details]";
const sheet_Model = '[FI_DM_HIMS_ICD].[dbo].[StudySheets]'
const studies_Model = '[FI_DM_HIMS_ICD].[dbo].[Studies]'
const ARM_Mapping_Model = '[FI_DM_HIMS_ICD].[dbo].[SA_ARMMapping]'
const rb_ARM_Mapping_Model = '[SA_ARMMapping]'
const Logger_Model = '[ARMMappingLogger]'


delete endpoints["update"];
delete endpoints["list"];
 

endpoints.list = async (req, res) => {
  try {
    
    const {irb} = req.query
    let virb = JSON.parse(irb).irb 

    let [{recordset:Epic_ARM},{recordset: MCA_ARM} ] = await
    Promise.all([
      await sqlConnection.query(`
      select Distinct([TP_NAME]), [Selected MCA], t2.[Notes] from ${Model} t1 WITH (NOLOCK)  Left JOIN ${ARM_Mapping_Model} t2 on t1.[TP_NAME] = t2.[EPIC ARM] where [IRB_APPROVAL_NUM]= '${virb}'`),
      await sqlConnection.query(`select Distinct([SheetName]) from ${sheet_Model} ss WITH (NOLOCK) LEFT JOIN ${studies_Model} si ON ss.[StudyId] = si.[StudyId] where [StudyNumber] = ${virb} AND Lower([SheetName])  NOT like '%study info%'`),
    ])

    
    MCA_ARM.unshift({SheetName: ""})
    MCA_ARM.push({SheetName: "ARM TBD"})



    result = Epic_ARM.map((EA, i) => {
      return {item: EA, option: MCA_ARM, value: EA['Selected MCA'], index: i, IRB: virb, Notes: EA['Notes'] }
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




endpoints.create = async (req, res) => {
  try {
    const values = req.body;    
    values['UserName'] = req.admin.Nickname
    values['ActionTimeStamp'] = getDateTime()
    let {recordset: result} =  await sqlConnection.query(`SELECT * from ${ARM_Mapping_Model} where [EPIC ARM] = '${values['EPIC ARM']}' AND IRB = ${values['IRB']}`)
   
    if(result.  length == 0 ) {
      const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"

  
      let valuesQuery = "";
      for (key in values) {
        if (values[key] == null || values[key] == "null" || values[key] == "") {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
  
  
      const insertQuery = `insert into ${ARM_Mapping_Model} ${columnsQ} values ${valuesQuery}`
      const insertRBQuery = `insert into ${rb_ARM_Mapping_Model} ${columnsQ} values ${valuesQuery}`

      await sqlConnection.query(insertQuery);
      await sql.query(insertRBQuery);

      let selectQuery = `SELECT ID from ${ARM_Mapping_Model} ORDER BY ID Desc OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`
      let {recordset: result} = await sqlConnection.query(selectQuery);
      
      logger({
        ARMID : (result[0].ID),
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
    
      await sqlConnection.query(`update ${ARM_Mapping_Model} set ${valuesQuery} where [EPIC ARM] = '${values['EPIC ARM']}' AND [IRB] = '${values.IRB}'`);
      await sql.query(`update ${rb_ARM_Mapping_Model} set ${valuesQuery} where [EPIC ARM] = '${values['EPIC ARM']}' AND [IRB] = '${values.IRB}'`);


      let selectQuery = `SELECT ID from ${ARM_Mapping_Model} where [EPIC ARM] = '${values['EPIC ARM']}' AND [IRB] = '${values.IRB}'`
      let {recordset: result} = await sqlConnection.query(selectQuery);
      
      logger({
        ARMID : (result[0].ID),
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




endpoints.saveAll = async (req, res) => {
  try {
    const values = req.body;    
    values['UserName'] = req.admin.Nickname
    values['ActionTimeStamp'] = getDateTime()

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
    
      await sqlConnection.query(`update ${ARM_Mapping_Model} set ${valueQuery} where [EPIC ARM] = '${value['EPIC ARM']}' AND [IRB] = '${value.IRB}'`);
      await sql.query(`update ${rb_ARM_Mapping_Model} set ${valueQuery} where [EPIC ARM] = '${value['EPIC ARM']}' AND [IRB] = '${value.IRB}'`);

      let selectQuery = `SELECT ID from ${ARM_Mapping_Model} where [EPIC ARM] = '${value['EPIC ARM']}' AND [IRB] = '${value.IRB}'`
      let {recordset: result} = await sqlConnection.query(selectQuery);
      
      if(result[0]) {
        logger({
          ARMID : (result[0].ID),
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
    
      await sqlConnection.query(`update ${ARM_Mapping_Model} set ${valuesQuery} where [EPIC ARM] = '${Name}' AND [IRB] = '${irb}'`);
      await sql.query(`update ${rb_ARM_Mapping_Model} set ${valuesQuery} where [EPIC ARM] = '${Name}' AND [IRB] = '${irb}'`);

 
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

    let {recordset: result} =   await sqlConnection.query(`SELECT * FROM ${ARM_Mapping_Model} where [EPIC ARM] = '${Name}' AND [IRB] = '${IRB}'`);

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