var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("CoveragesGovernment");

delete endpoints["list"];
delete endpoints["update"];
const Model = "CoveragesGovernment";

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
          case "First": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and" : "";
            break
          }
          case "Notes": {

            let values = filter[key];
            if (values.length < 2 && values[0] == 0) {
                filterQuery += "(Convert(varchar, " +key + ") NOT IN ( '' )) and " 
            } else if ((values.length < 2 && values[0] == 1)) {
                filterQuery += "(Convert(varchar, " +key + ") IN ( '' ) or (Convert(varchar, " +key + ") IS NULL  )) and " ;
            } 
            break;
          } 
          case "Government" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,"+ key + ") IN (" + valueQuery + ") or  Convert(varchar,"+ key + ") IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and " : "";

              }
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


    var query = `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo,  * from ${Model} Left JOIN JWT ON CoveragesGovernment.EMPID = JWT.EMPID `;
    var totalQuery = `select count(*) from ${Model} Left JOIN JWT ON CoveragesGovernment.EMPID = JWT.EMPID `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += " ORDER BY Government" 
      }

    } else {
      query += "ORDER BY Government OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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

endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    values.EMPID = +req.admin.EMPID;

    const { id } = req.params;
    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
        valuesQuery += key + "= NULL" + ",";
      } else {
        valuesQuery += key + "='" + values[key] + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);
  
    await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);

    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this id: " + req.params.id,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
};

module.exports = endpoints;
