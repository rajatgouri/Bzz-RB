const methods = require("./crudController");
const endpoints = methods.crudController("EPICProductivity");
const utilController = require('./utilController');
var sql = require("mssql");

const Model = "EPICProductivity";
delete endpoints["update"];
delete endpoints['list'];


endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;
    const order = req.query.order || "DESC";

    var filter = JSON.parse(req.query.filter);
    var sorter = JSON.parse(req.query.sorter);


    let filterQuery = "";
    for (key in filter) {
      if (filter[key]) {

        switch (key) {
          

          default: {
            filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
            break
          }
        }
      }
    }

    filterQuery = filterQuery.slice(0, -4);
    let sorterQuery = "";

    
    if (sorter[0] && sorter[0].field) {
      sorterQuery += `[${sorter[0].field}] ${sorter[0].order == "ascend" ? "ASC" : "DESC"}`
    }

    var query = `select * from ${Model}   `;
    var totalQuery = `select count(*) from ${Model}  `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sorterQuery + " "
      } else {
        query += ` ORDER BY ${Model}.WeekEndingDate DESC  ` 
      }

    } else {
      query += `ORDER BY ${Model}.WeekEndingDate Desc  ` 
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
  

