const methods = require("./crudController");
const endpoints = methods.crudController("[COHTEAMS].[dbo].[HIMS_MasterTaskList]");
var sql = require("mssql");

const Model = "[COHTEAMS].[dbo].[HIMS_MasterTaskList]";
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
            let values = filter[key];
            if(values.indexOf(null) > -1) {
                values.push('')
                values.splice(values.indexOf(null), 1)
                valueQuery = values.map(v => ( "'" + v  + "'"))
                filterQuery +=  filter[key] != null ?  "(" + "["+ key + "] IN (" + valueQuery + ") or " : "" ;
                filterQuery +=  '['+ key + '] IS NULL) and '

            } else {
                
                valueQuery = values.map(v => ( "'" + v  + "'"))
                if(values.length > 0) {
                    filterQuery +=  +filter[key] !== null ? "["+ key + "] IN (" + valueQuery + ") and " : "" ;
                }
            }

            break
            // filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
            // break
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

    var query = `select * from ${Model} `;
    var totalQuery = `select count(*) from ${Model}   `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query +=  "where  " +  filterQuery + " "
        totalQuery += "where   " +  filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += ` ORDER BY ${Model}.UID ` 
      }

    } else {
      query += `ORDER BY ${Model}.UID OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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

endpoints.create = async (req,res) => {
  try {
      // Find document by id and updates with the required fields
      const values = req.body;
      
        const columnsQ1 = "(" + Object.keys(values).map(v => ('[' + v + ']')).toString() + ")"
  
          let valuesQuery = "";
          for (key in values) {
              if(values[key] == 0) {
                  valuesQuery += "'" + values[key] + "',";
              } else if ( values[key] == "" || values[key] == undefined ) {
              valuesQuery += " NULL" + ",";
            } else {
              valuesQuery += "'" + values[key] + "',";
            }
          }
          valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
        
          const insertQuery = `insert into ${Model} ${columnsQ1} values ${valuesQuery}`
  
          await sql.query(insertQuery);
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "Entry Add Successfully!"
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
}





endpoints.filters = async (req,res) => {
  try {


  const [{recordset: Type}, {recordset:Standard }]  = await Promise.all([
        await sql.query(`Select DISTINCT([Type]) from ${Model}`),
        await sql.query(`Select DISTINCT([Standard]) from ${Model}`),
         
  ])
  
  let results = {
    Type,
    Standard
  }


  return res.status(200).json({
    success: true,
    result: results,
    message: "Filter Fetch Successfully",
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
      const {EMPID, EMAIL_ADDR} = req.body;
      const id = req['params']['id'];// please do not update this line
      let valuesQuery = "";
      
      let {recordsets: record} = await sql.query(`Select * from ${Model} where UID = ${id}`);

      record = (record[0][0])

      for (key in values) {
          
          if(values[key]) {
              valuesQuery += key + "='" + values[key] + "',";
          } else if (values[key] == 0) {
              valuesQuery += key + "='" + values[key] + "',";
            } else { 
                 valuesQuery += key + "= NULL ,";
              }
      }

      valuesQuery = valuesQuery.slice(0, -1);

      await sql.query(`update ${Model} set ${valuesQuery} where UID = ${id}`);
      
      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this id: " + id,
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
}



endpoints.delete = async (req, res) => {
  let { id } = req.params;

  try { 
      
    const deleteQuery = `delete from ${Model}  where UID= ${id}`;
  
    await sql.query(deleteQuery);

    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
    });

  } catch (e) {
      console.log(e)
    return res
      .status(500)
      .json({ success: false, error: e, message: `Error in deleting the where UID = ${id}`});
  }
};


module.exports = endpoints;
  

