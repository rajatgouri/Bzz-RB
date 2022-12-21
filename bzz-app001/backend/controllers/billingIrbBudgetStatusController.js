var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("IRBBudgetStatus");

delete endpoints["list"];
delete endpoints["update"];
const Model = "IRBBudgetStatus";
endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;
    var filter = JSON.parse(req.query.filter);
    var sorter = JSON.parse(req.query.sorter);

    let filterQuery = "";
    for (key in filter) {
      if (filter[key]) {

        switch (key) {
          case "Status": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and " : "";
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

      if(sort.field == 'SNo') {
        sort.field = 'ID'
      }
      
      sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

    let sq = sorterQuery.slice(0, -1)

    var query = `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo,  * from ${Model} `;
    var totalQuery = `select count(*) from ${Model} `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " +  sq + " "
      }

    } else {
      query += "ORDER BY ID OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
    }

    // //  Query the database for a list of all results
    // const { recordset } = await sql.query(
    //   `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model} ORDER BY ID OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
    // );

    // const { recordset: arr } = await sql.query(
    //   `SELECT COUNT(*) from  ${Model}`
    // );


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

    const filters = filter;
    const sorters = sorter
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
      filters,
      sorters,
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



endpoints.getStatus = async (req, res, next) => {
  try {
    //  Query the database for a list of all results
    const { recordset } = await sql.query(
      `SELECT DISTINCT(CONVERT([nvarchar], Status)) as [IRB Budget Status] from ${Model} order By [IRB Budget Status] desc
      `
    );

    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found all documents",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
}
endpoints.fullList = async (req, res, next) => {
  try {
    //  Query the database for a list of all results
    const { recordset } = await sql.query(
      `select Status from ${Model} `
    );

    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found all documents",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
}

endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    const columnsQ = "(" + Object.keys(values).toString() + ")"

    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
        valuesQuery += "NULL" + ",";
      } else {
        valuesQuery += "'" + values[key] + "',";
      }
    }
    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
    await sql.query(insertQuery);

    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
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

endpoints.delete = async (req, res) => {
  try {
    const { id } = req.params;


    const deleteQuery = `Delete from ${Model} where ID= ${id}`;

    await sql.query(deleteQuery);

    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
}

endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;

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
