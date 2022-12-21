const methods = require("./crudController");
const endpoints = methods.crudController("EmailLogger");
const utilController = require('./utilController');
var sql = require("mssql");

const Model = "EmailLogger";
delete endpoints["update"];
delete endpoints['list'];
const FullModel = "[COHTEAMS].[dbo].[COH_MasterStaff_PSoft]";


endpoints.search = async (req, res) => {
  try {

    var filter = JSON.parse(req.query.filter);
    var query = `select [Start Timestamp], [Duration in Seconds] from ${Model}  Left JOIN ${FullModel} WITH (NOLOCK) ON ${Model}.Email = ${FullModel}.EMAIL_ADDR  where FIRST_NAME = '${filter['FIRST_NAME']}' and [Start Timestamp] > '${filter['StartTime'][0]}' and  [Start Timestamp] < '${filter['StartTime'][1]}'`;  
    var recordset;
    // var arr;

    const { recordset: result } = await sql.query(query);
    recordset = result;
   

    // // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
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


endpoints.userFilter = async (req,res) => {
  try {

      const query = `select DISTINCT(EMPID), FIRST_NAME, LAST_NAME from ${Model}  Left JOIN ${FullModel} WITH (NOLOCK) ON ${Model}.Email = ${FullModel}.EMAIL_ADDR  `;
      const { recordset: result1 } = await sql.query(query);

      const query1 = `select top 1 ([Finish Timestamp]) from EmailLogger order by [Finish Timestamp]  ASC`;
      const { recordset: result2 } = await sql.query(query1);

  
      return res.status(200).json({
          success: true,
          result: {
            result1,
            result2
          },
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
} 


endpoints.list1 = async (req, res,) => {
  try {

    let {EMPID, date} =  JSON.parse(req.query.filter)
    
      var today = new Date(date)
      var priorDate = new Date().setDate(today.getDate()- 45)
      let date1 = new Date(priorDate).toISOString().split('T')[0] 

      const query = `select * from ${Model}  Left JOIN ${FullModel} WITH (NOLOCK) ON ${Model}.Email = ${FullModel}.EMAIL_ADDR where EMPID = ${EMPID} and [Start Timestamp] < '${date}' and  [Start Timestamp] > '${date1}' ORDER BY [Start Timestamp] DESC`;
      const { recordset: result } = await sql.query(query);

  
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



endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;
    const order = req.query.order || "DESC";
    // const filter = req.query.filter || "New";

    var filter = JSON.parse(req.query.filter);
    var sorter = JSON.parse(req.query.sorter);

    let filterQuery = "";
    for (key in filter) {
      if (filter[key]) {

        switch (key) {
          case "FIRST_NAME": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ?   "[COHTEAMS].[dbo].[COH_MasterStaff_PSoft].[FIRST_NAME] IN (" + valueQuery + ") and " : "";
            break
          }

          case "Category": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and " : "";
            break
          }

          case "Start Timestamp": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ?  "cast ([Start Timestamp] as date) IN (" + valueQuery + ") and " : "";
            break
          }


          case "Finish Timestamp": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ?  "cast ([Finish Timestamp] as date) IN (" + valueQuery + ") and " : "";
            break
          }



          
          default: {
            filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
            break
          }
        }
      }
    }
    filterQuery = filterQuery.slice(0, -4);
    let sorterQuery = "";

    sorter.map((sort) => {



      sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

    let sq = sorterQuery.slice(0, -1)

    var query = `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}  Left JOIN ${FullModel} WITH (NOLOCK) ON ${Model}.Email = ${FullModel}.EMAIL_ADDR   `;
    var totalQuery = `select count(*) from ${Model}  Left JOIN ${FullModel} ON ${Model}.Email = ${FullModel}.EMAIL_ADDR  `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += ` ORDER BY ${Model}.[Start Timestamp] DESC ` 
      }

    } else {
      query += `ORDER BY ${Model}.[Start Timestamp] Desc OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
    }


    var recordset;
    var arr;

    const { recordset: result } = await sql.query(query);
    recordset = result;
    const { recordset: coun } = await sql.query(totalQuery);
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


  module.exports = endpoints;
  

