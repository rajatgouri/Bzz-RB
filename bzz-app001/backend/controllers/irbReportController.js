const methods = require("./crudController");
const endpoints = methods.crudController("IRBreport");
var sql = require("mssql");

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
        
        if (value && value.length > 0) {
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
      sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

  
    let sq = sorterQuery.slice(0, -1)


    var query = `select  * from ${Model}   `;
    var totalQuery = `select count(*) from ${Model}  `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += ` ORDER BY ${Model}.ID ` 
      }

    } else {
      query += `ORDER BY ${Model}.ID OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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


    const [{recordset:Total}, {recordset: IRB}, {recordset: Medicare}, {recordset: TargetCriteria } ] = await Promise.all([
      await sql.query(`SELECT COUNT(*) as count from ${Model}` ),
      await sql.query(`SELECT COUNT(*) as count from ${Model} where [Match] = 'Y'` ),
      await sql.query(`SELECT COUNT(*) as count from ${Model} where [Medicare Match] = 'Y'` ),
      await sql.query(`SELECT COUNT(*) as count from ${Model} where [Match] = 'Y' and [Medicare Match] = 'Y'` )

    ])


  
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
      extra: {
        Total: Total[0]['count'],
        IRB: IRB[0]['count'],
        Medicare: Medicare[0]['count'],
        TargetCriteria: TargetCriteria[0]['count']
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
};


endpoints.filters = async (req, res) => {

  try {

      const First = req.query.user;
      const managementAccess = req.admin.ManagementCard

      let { recordset: columns } = await sql.query(
          `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = N'${Model}'
      `
      );

      columns = columns.filter((column) => column['COLUMN_NAME'] == 'Name' || column['COLUMN_NAME'] == 'Form Type'  )

      let queriesToExecute = []

      let result1 = {}

          for (let i = 0; i < columns.length; i++) {
                  queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} `))
          }

          const filterResult = await Promise.all(queriesToExecute)
          let filters = (filterResult.map((result, index) => ({ column: columns[index].COLUMN_NAME, recordset: result.recordset })))

          result1 = {
              filters,
              username: First,
          }

    
      return res.status(200).json({
          success: true,
          // result: recordset,
          result: result1,
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
  

