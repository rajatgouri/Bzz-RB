const methods = require("./crudController");
const endpoints = methods.crudController("TruePBKPIDetails");
var sql = require("mssql");

delete endpoints["update"];
delete endpoints['list'];
const Model = 'TruePBKPIDetails'

endpoints.list = async (req, res,) => {
  try {

      const ID = req.admin.EMPID;
      const First = req.admin.First;
      const managementAccess = req.admin.ManagementCard
      var page = req.query.page || 1;
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
      delete filter['sort'];
          

      var top10 = false;
      
      let filterQuery = "";
      let sorterQuery = "";

      for (key in filter) {
          if(filter[key]) {

              switch (key) {
                   
                  case "UserName" : {
                      let values = filter[key];

                      if(values.indexOf('null') > -1) {
                          values.push('')
                          valueQuery = values.map(v => ( "'" + v  + "'"))
                          filterQuery +=  +filter[key] !== null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                          filterQuery += '[UserName] IS NULL) and '

                      } else {
                          
                          valueQuery = values.map(v => ( "'" + v  + "'"))
                          if(values.length > 0) {
                              filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                          }
                      }
                  
                      break
                  }

                  case "WQ" : {
                      let values = filter[key];
                      valueQuery = values.map(v => ( "'" + v + "'"))
                      if(valueQuery.length > 0) {
                          filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "" ;
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
                  query += " ORDER BY " + sq +  " OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY"   
              } 

              if (top10) {
                  query += "OFFSET  0  ROWS FETCH NEXT 10 ROWS ONLY "     
              }

          } else {
              query +="ORDER BY ID Desc OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
          }
          


          const { recordset: result } = await sql.query(query);
          
          
          recordset = result
          const { recordset: coun } = await sql.query(totalQuery);
          arr = coun
    
      const obj = arr[0];
      var count = obj[""];

      const pages = Math.ceil(count / limit);

      // Getting Pagination Object
      const pagination = { page, pages, count };

      const filters = filter;
      const sorters = sorter
      // Getting Pagination Object


  
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


module.exports = endpoints;


