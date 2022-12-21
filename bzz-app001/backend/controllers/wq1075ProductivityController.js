const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075Productivity");
var sql = require("mssql");

delete endpoints["list"];
const Model = "WQ1075Productivity";

endpoints.list = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard
        var page = req.query.page || 1;
        var filter = JSON.parse(req.query.filter);
        var sorter = JSON.parse(req.query.sorter);
            
        var top10 = false;
        
        let filterQuery = "";
        let sorterQuery = "";

        for (key in filter) {
            if(filter[key]) {

                switch (key) {
                    case "Status" : {
                        let values = filter[key];
                        
                        if(values.indexOf('Review') > -1) {
                            values.push('')
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            filterQuery +=  +filter[key] !== null ?  "(" + key + " IN (" + valueQuery + ") or " : "" ;
                            filterQuery += 'Status IS NULL) and '

                        } else {
                            
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                            }
                        }
                        break
                    }
                   
                    case "BillerName" : {
                        let values = filter[key];
                        
                       
                            valueQuery = values.map(v =>  {
                                return ( "'" + v + "'")
                            })
                            
                            if(valueQuery.length > 0 ) {
                                filterQuery += filter[key] !== null ?"[" +  key  + "] IN (" + valueQuery + ") and " : "" ;
                            }

                        break
                    }
                    case "Notes": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery +=  key + " NOT IN ( '' )  and " 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Notes IS NULL) and " ;
                        } 
                        break;
                    } 

                    
                    case "Error": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery +=  key + " NOT IN ( '' )  and " 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Error IS NULL) and " ;
                        } 
                        break;
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

            if(sort.field == 'Aging Days' && top10 ) {
                return
            }

            if(sort.field == 'Sess Amount' && top10 ) {
                return
            }

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
                    query += " ORDER BY " + sq +  " "   
                } 

                if (top10) {
                    query += "OFFSET  0  ROWS FETCH NEXT 10 ROWS ONLY "     
                }

            } else {
                query +="ORDER BY ID ASC OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
            }
            


            const { recordset: result } = await sql.query(query);
            
            // if(sorterQuery == "") {
            //     recordset = result.sort((a,b) => {
            //         if(a.Patient < b.Patient) { return -1; }
            //         if(a.Patient > b.Patient) { return 1; }
            //         return 0;
            //     })
            // } else {
                recordset = result
            // }
            const { recordset: coun } = await sql.query(totalQuery);
            arr = coun
        // } else {
        //     //  Query the database for a list of particular results
           
        //     var query = `select * from ${Model} where UserAssigned = '${First}' `;    
        //     var totalQuery = `select count(*) from ${Model} where UserAssigned = '${First}'`;    

        //     if(filterQuery || sorterQuery) {
        //         if(filterQuery ) {
        //             query += `and ${filterQuery} `
        //             totalQuery += `and ${filterQuery} `
        //         }  else if (sorterQuery) {
        //             query += `  ORDER BY ${sorterQuery} `   
        //         }

        //     } else {
        //         query +=`ORDER BY ID OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
        //     }
             
        //     const { recordset: result } = await sql.query(query);
        //     recordset = result;
        //     const { recordset: count } = await sql.query(totalQuery);

        //     arr = count
           
        // }
         
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

endpoints.fullList = async (req, res) => {
    try {
      const ID = req.admin.EMPID;
      const First = req.admin.First;
      const managementAccess = req.admin.ManagementCard
      const page = req.query.page || 1;

      const limit = parseInt(req.query.items) || 100;
      const skip = page * limit - limit;

      var recordset;
      var arr;

      if (managementAccess) {
        //  Query the database for a list of all results
        let result = await sql.query(
            `select * from ${Model}  OFFSET `
        );
        recordset = result.recordset
        const countList = await sql.query(
            `SELECT COUNT(*) from  ${Model}`
        );
        arr = countList.recordset
      } else {
        let result  = await sql.query(
            `select * from ${Model} where UserAssigned = '${First}'`
        );
        recordset = result.recordset
        const countList = await sql.query(
            `SELECT COUNT(*) from  ${Model} where UserAssigned = '${First}'`
        );
        arr = countList.recordset

      }

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
