const methods = require("./crudController");
const endpoints = methods.crudController("NonTherapeuticStudies");
var sql = require("mssql");

const Model = "NonTherapeuticStudies";
delete endpoints["update"];
delete endpoints['list'];


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
            filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and " : "";
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
          case "Type" : {
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

    var query = `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model} Left JOIN JWT ON ${Model}.EMPID = JWT.EMPID  `;
    var totalQuery = `select count(*) from ${Model} Left JOIN JWT ON ${Model}.EMPID = JWT.EMPID `;

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
      query += `ORDER BY ${Model}.LastUpdated desc  OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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
      values.EMPID = req.admin.EMPID 
      const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"
      values['LastUpdated'] =getDateTime()
  
      let valuesQuery = "";
      for (key in values) {
            if (values[key] === "null") {
              valuesQuery += "NULL" + ",";
            } else {
              valuesQuery += "'" + values[key] + "',";
            }
          }
          valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
          
          let {recordsets} = await sql.query(`Select * from ${Model} where IRB like '${values.IRB}'`);
          
          if(recordsets[0].length > 0) {
              return res.status(400).json({
                  success: false,
                  result: null,
                  message: "The IRB is already exists",
                  error: "The IRB is already exists",
                });
          }
        
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
  
  endpoints.delete = async (req,res) => {
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


  endpoints.update = async (req,res) => {
        try {
            // Find document by id and updates with the required fields
            const values = req.body;
            values.EMPID = req.admin.EMPID 
            const id = req['params']['id'];// please do not update this line
            let valuesQuery = "";
            for (key in values) {
              valuesQuery += key + "='" + values[key] + "',";
            }

            valuesQuery = valuesQuery.slice(0, -1);

            await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);
        
            return res.status(200).json({
              success: true,
              result: {},
              message: "we update this document by this id: " + id,
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



  module.exports = endpoints;
  

