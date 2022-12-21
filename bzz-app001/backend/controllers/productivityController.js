const methods = require("./crudController");
const endpoints = methods.crudController("ProductivityLog");
var sql = require("mssql");
const { getDateTime } = require("./utilController");

delete endpoints["list"];
const Model = "ProductivityLog";


endpoints.list = async (req, res,) => {
  try {

      
      var page = req.query.page || 1;
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
          
      var top10 = false;
      
      let filterQuery = "";
      let sorterQuery = "";

      for (key in filter) {
          if(filter[key]) {

              switch (key) {
                  
                 
                  case "User" : {
                      let values = filter[key];
                      
                     
                          valueQuery = values.map(v =>  {
                              return ( "'" + v + "'")
                          })
                          
                          if(valueQuery.length > 0 ) {
                              filterQuery += filter[key] !== null ?"[" +  key  + "] IN (" + valueQuery + ") and " : "" ;
                          }

                      break
                  }



                  case "EMPID" : {
                    let values = filter[key];
                    
                   
                        valueQuery = values.map(v =>  {
                            return ( "'" + v + "'")
                        })
                        
                        if(valueQuery.length > 0 ) {
                            filterQuery += filter[key] !== null ?"[" +  key  + "] IN (" + valueQuery + ") and " : "" ;
                        }

                    break
                }


                  default: {
                      filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key] + "%' and " : "" ;
                      break
                  } 
              }
          } 
      }

      filterQuery = filterQuery.slice(0, -4);


      if(  sorter.filter((sort) => sort.field == "DateTime").length == 0) {
        sorter.push({
            field: "DateTime",
            order: "descend"  
        })      
    }

      
      sorter.map((sort) => {
          sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
      })


      let sq = sorterQuery.slice(0, -1)
       
      const limit = parseInt(req.query.items) || 100;
      const skip = page * limit - limit;

      var recordset;
      
      // if (managementAccess) { 
          //  Query the database for a list of all results
          var query = `select  * from ${Model} `;    
          var totalQuery = `select count(*) from ${Model} `;    

          if(filterQuery || sorterQuery) {
              if(filterQuery ) {
                  query += "where " + filterQuery + " "
                  totalQuery += "where " + filterQuery + " "
              }  
              
              if (sorterQuery) {
                  query += " ORDER BY " + sq +  "  "   
              } 

              if (top10) {
                  query += "OFFSET  0  ROWS FETCH NEXT 10 ROWS ONLY "     
              }

          } else {
              query +=" ORDER BY ID ASC OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
          }
          
          const { recordset: result } = await sql.query(query);
          recordset = result
          const { recordset: coun } = await sql.query(totalQuery);
          arr = coun
     
       
      const obj = arr[0];
      var count = obj[""];

      if (top10) {
          count = 10
      }

      const pages = Math.ceil(count / limit);

      // Getting Pagination Object
      const pagination = { page, pages, count };

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

endpoints.update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;

      const id = req['params']['id'];// please do not update this line
      let valuesQuery = "";
      for (key in values) {
        if(values[key] == null) {
          valuesQuery += "[" +key + "]= NULL,";
          
        } else {
          valuesQuery += "[" + key  + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
      await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);
  
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
  


endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    values.EMPID = req.admin.EMPID
    values.User = req.admin.Nickname
    values.DateTime= getDateTime()
    const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"

  
      let valuesQuery = "";
      for (key in values) {
            if (values[key] === "null") {
                valuesQuery += "NULL" + ",";
            } else {
                valuesQuery += "'" + values[key] + "',";
            }
        }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
    
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


endpoints.filters = async (req, res) => {
  try {
    
      const {recordset: result} = await sql.query(`SELECT DISTINCT([User]) from ${Model} `) 

 
      return res.status(200).json({
        success: true,
        result: result,
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

 

module.exports = endpoints;
