const methods = require("./crudController");
const endpoints = methods.crudController("WQ5508");
var sql = require("mssql");
const utilController = require('./utilController')
const { getDateTime } = require('./utilController');
const {getFilters} = require('../Utils/applyFilter')
const io = require('../socket');
const { getScrubs } = require("./WQsController");

delete endpoints["list"];

let Model = "WQ5508";
const ColumnModel = "WQ5508Columns"
const ScrubIRBMoDel = 'Agenda';

endpoints.WQ5508 = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);
        delete filter['sort'];

        Model = "WQ5508"

        let filterQuery = "";
        let sorterQuery = "";

        const { recordset: result2 } = await sql.query(`
        
            SELECT 
            [value] as IRB 
            FROM ${ScrubIRBMoDel} t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
        `)
        
        let scrubIRBs = (result2.map((i) => i.IRB))


        
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
      


        if (sorter.filter.length == 1 && sorter.filter((sort) => sort.field == "Sess Amount").length == 0) {
            sorter.push({
                field: "Sess Amount",
                order: "descend"
            })
        }

        sorter.map((sort) => {

           

            sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
        })


        let sq = sorterQuery.slice(0, -1)

        const limit = parseInt(req.body.items) || 100;
        const skip = page * limit - limit;

        var recordset;

        // if (managementAccess) { 
        //  Query the database for a list of all results
        var query = `select  * from ${Model} `;
        var totalQuery = `select count(*) from ${Model} `;

        if (filterQuery || sorterQuery) {
            if (filterQuery) {
                query += "where " + filterQuery + " "
                totalQuery += "where " + filterQuery + " "
            }

            if (sorterQuery) {
                query += " ORDER BY " + sq + " OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY"
            }

           
        } else {
            query += "ORDER BY [Sess Amount] Desc OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
        }


        console.log(query)
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

        for (i in filters) {
            filters[i] = filters[i].value
        }  
      
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



endpoints.WQ5508Filters = async (req, res) => {

    try {

        Model = "WQ5508"
       
        const { recordset: result2 } = await sql.query(`
        SELECT 
        [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
        `)
        let scrubIRBs = (result2.map((i) => i.IRB))
        let { recordset: columns } = await sql.query(
            `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'${Model}'
        `
        );

        columns.unshift({ COLUMN_NAME: "Total" })
        columns = columns.filter((column) => column['COLUMN_NAME'] == 'Total' || column['COLUMN_NAME'] == 'Primary Coverage' || column['COLUMN_NAME'] == 'CPT Codes' || column['COLUMN_NAME'] == 'User' || column['COLUMN_NAME'] == 'Patient' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' || column['COLUMN_NAME'] == 'Research IRB')

        let queriesToExecute = []

        let result1 = {}

            queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].COLUMN_NAME != "Total") {
                    queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model}  WHERE [Error] = '1' order by [${columns[i].COLUMN_NAME}] asc`))
                }
            }

            const filterResult = await Promise.all(queriesToExecute)
            let filters = (filterResult.map((result, index) => ({ column: columns[index].COLUMN_NAME, recordset: result.recordset })))

            result1 = {
                filters,
               
                scrubIRBs
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


endpoints.WQ1262 = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);
        delete filter['sort'];
        let status = filter['Status']
            
        Model = 'WQ1262'
        const {recordset: result1} = await sql.query(`
        SELECT 
         [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
`)
        var scrubIRBs = (result1.map((i) => i.IRB ))

        
        let filterQuery = "";
        let sorterQuery = "";



        for (key in filter) {

            if(filter[key]) {

                switch (key) {
                   
                    
                    case "UserAssigned" : {
                        let values = filter[key];
                        values = values.value

                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? " ["+ key + "] IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }

                    
                    case "OriginalUserAssigned" : {
                        let values = filter[key];
                        values = values.value

                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }

                   
                    
                    case "User" : {
                        let values = filter[key];
                        values = values.value

                        if(values.indexOf('null') > -1) {
                            values.push('')
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            filterQuery +=  +filter[key] !== null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                            filterQuery += '[User] IS NULL) and '

                        } else {
                            
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                            }
                        }
                    
                        break
                    }

                    


                    

                    case "Code" : {
                        let values = filter[key];
                        values = values.value

                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }
                    

                   
                 

                    case "SOC Flag" : 
                    case "Line Count":
                    case "Study Status":
                    case "Fin Class" :
                    case "Billing Status" :
                    case "Acct Class" :
                    case "SR/SOC Ratio" :
                    case "Category" :
                    case "Study Type": 
                    case "Acct Name": 


                    {
                        let values = filter[key];

                        values = values.value
                        values = [... new Set(values)]

                        if(values.indexOf(null) > -1) {
                            values.push('')
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            filterQuery +=  +filter[key] !== null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                            filterQuery += `[${key}] IS NULL) and `

                        } else {
                            
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                            }
                        }
                    
                        break
                    }

                   
                    
                    
                    case "Message" : {
                        let values = filter[key];
                        values = values.value
                        values = [... new Set(values)]

                        if(values.indexOf(null) > -1) {
                            values.push('')
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            filterQuery +=  +filter[key] !== null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                            filterQuery += `[${key}] IS NULL) and `

                        } else {
                            
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                            }
                        }
                    
                        break
                    }
                    
                    

                    case "Error": {

                        let values = filter[key];
                        values = values.value

                        if (values.length < 2 && values[0] == 0) {
                            filterQuery +=  key + ` NOT IN ( '' )  and ` 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Error IS NULL) and " ;
                        } 
                        break;
                    } 

                    case "Process Type": {
                        let values = filter[key];
                        values = values.value


                        if (values[0] == 'Do Not Scrub IRB') {
                            filterQuery += `ID >= 0 and [Code] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) and `;
                            sorterQuery += ' '
                        } else if (values[0] == 'ALL') {
                            filterQuery += `ID >= 0  and `;
                            sorterQuery += ' '
                        }  else if (values[0] == 'Perm') {
                            filterQuery += `ID >= 0 and [Code] IN ( SELECT 
                                [value] as IRB 
                                FROM ${ScrubIRBMoDel} t1
                                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                                where [No Scrub-Perm] = 'Perm') and `;
                            sorterQuery += ' '
                        }  else if (values[0] == 'Test') {
                            filterQuery += `ID >= 0 and [Code] IN ( SELECT 
                                [value] as IRB 
                                FROM ${ScrubIRBMoDel} t1
                                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                                where [No Scrub-Test] = 'Test') and `;
                            sorterQuery += ' '
                        }
                        
                        else if (values[0] == 'SOCs' ) {
                            filterQuery += `   ID IN (
                            
                                select ID
                                from WQ1262
                                where [Acct ID] in (
                                select x.[Acct ID]
                                from (
                                select [Acct ID], [SOC Flag]
                                from WQ1262
                                group by [Acct ID], [SOC Flag]
                                ) x
                                group by x.[Acct ID]
                                having COUNT(1) = 1
                                )
                                and [Soc Flag] = 'SOC'
                            )  and   ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
                        }
                        else if (values[0] == 'Pending' ) {
                            filterQuery += `Status IN ('Pending') and  [Process Type] IN ('RN', 'Outpatient')  and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
                            delete filter['Status']

                        } else if (values[0] == 'Misc' ) {
                            filterQuery += `(Status IN ('Misc')  ) and  [Process Type] IN ('RN', 'Outpatient')   and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
                            delete filter['Status']

                        } else if (values[0] == 'Deferred' ) {
                            filterQuery += `(Status IN ('Deferred')  ) and  [Process Type] IN ('RN', 'Outpatient')    and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
                            delete filter['Status']

                        } else if (values[0] == 'Deferred' ) {
                            filterQuery += `Status IN ('Deferred') and  [Process Type] IN ('RN', 'Outpatient')    and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
                            delete filter['Status']
                        }
                        
                        else {

                            valueQuery = values.map(v => {
                                return ("'" + v + "'")
                            })

                            if (valueQuery.length > 0) {
                                {
                                    filter['Status'] != 'Deferred' ?
                                        filterQuery += "[" + key + "] IN (" + valueQuery + `)   and Status NOT In ('Deferred')  and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and `
                                    : 
                                        filterQuery += "[" + key + "] IN (" + valueQuery + `)   and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and `
                                }
                             }
                        }

                        break
                    }

                    case "Status" : {

                            // let valuesP = filter['Process Type']
                            // console.log(valuesP)
                            // if (['Pending','Misc','Deferred'].includes(valuesP[0])) {
                            //     break
                            // } else {
                                let values = filter[key];
                                values = values.value

                                valueQuery = values.map(v => ( "'" + v  + "'"))
                                if(values.length > 0) {
                                    filterQuery +=  +filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                                }
                            
                            break
                            // }

                          
                    }

                    default: {
                        filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key].value + "%' and " : "" ;
                        break
                    } 
                }
            } 
        }

        filterQuery = filterQuery.slice(0, -4);


        if( sorter.filter.length == 1   && sorter.filter((sort) => sort.field == "Acct Bal").length == 0) {
            sorter.push({
                field: "Acct Bal",
                order: "descend"  
            })      
        }
    
        sorter.map((sort) => {

           

           

            sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
        })


        let sq = sorterQuery.slice(0, -1)
         
        const limit = parseInt(req.body.items) || 100;
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

               

            } else {
                query +="ORDER BY [Acct Bal] Desc OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
            }
            
            console.log(query)
            const { recordset: result } = await sql.query(query);
            
            recordset = result
            const { recordset: coun } = await sql.query(totalQuery);
            arr = coun
      
        const obj = arr[0];
        var count = obj[""];

       
  
        const pages = Math.ceil(count / limit);

        // Getting Pagination Object
        const pagination = { page, pages, count };

        if (filter.Status == 'Deferred' || filter.Status == 'Pending' || filter.Status == 'Misc'  ) {
            filter['Process Type'] = filter['Status']
        }
        filter['Status'] = status
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


endpoints.WQ1262Filters = async (req,res) => {
    try {

        const values = req.body;
        delete values['sort']

        Model = "WQ1262"
        let scrubIRBs = await getScrubs()

        let valuesQuery = "";
        for (key in values) {
          if (values[key] === "null" || values[key] === null || values[key] === undefined || values[key].length == 0) {
            continue
          } else if (values[key] == 'Do Not Scrub IRB')  {
            valuesQuery += ` [Code] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) and ` ;
           } else if (values[key] == 'SOCs')  {
            valuesQuery += `   ID IN (
                            
                select ID
                from WQ1262
                where [Acct ID] in (
                select x.[Acct ID]
                from (
                select [Acct ID], [SOC Flag]
                from WQ1262
                group by [Acct ID], [SOC Flag]
                ) x
                group by x.[Acct ID]
                having COUNT(1) = 1
                )
                and [Soc Flag] = 'SOC'
            )  and   ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) ) and `;
           } 
           
           else if (values[key] == 'Perm') {
            valuesQuery += ` [Code] IN ( SELECT 
                [value] as IRB 
                FROM ${ScrubIRBMoDel} t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [No Scrub-Perm] = 'Perm') and `;
           } else if (values[key] == 'Test') {
            valuesQuery += ` [Code] IN ( SELECT 
                [value] as IRB 
                FROM ${ScrubIRBMoDel} t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [No Scrub-Test] = 'Test') and `;
           } else if (values[key] == 'Non-Therapeutic') {
            valuesQuery += ` [Study Type] = 'Non-Therapeutic' and (([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or [Code] IS NULL )  ) and ` ;
            
           } else  if(values[key] == 'ALL' ) {

            valuesQuery += ` ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Code] IS NULL )  and `;
           } else if (values[key] == 'RN' ||  values[key] == 'Outpatient') {
            valuesQuery += ` [Process Type] = '${values[key]}' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Code] IS NULL )  and `;

           }  else  if(values[key] == 'Pending' || values[key] == 'Misc'  || values[key] == 'Deferred'      ) {

            valuesQuery += `[Status] = '${values[key]}' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Code] IS NULL )  and `;
           }  else {
        
            valuesQuery +=  "[" + key + "] IN  (" + values[key].map(v => "'" + v + "'").join(',') + ") and "  ;
          }
        }
    
        valuesQuery = valuesQuery.slice(0, -4);
        console.log(valuesQuery)

        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard || req.admin.Nickname == 'Bernadette'
      
        let {recordset: columns} = await sql.query(
          `
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = N'WQ1262'
          `
      );
  
      columns.unshift({COLUMN_NAME: "Total"})
      columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'Total' || column['COLUMN_NAME'] == 'Code' ||  column['COLUMN_NAME'] == 'User' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' || column['COLUMN_NAME'] == 'Acct Name' || column['COLUMN_NAME'] == 'Billing Status' ||  column['COLUMN_NAME'] == 'Acct Class' ||  column['COLUMN_NAME'] == 'Fin Class' || column['COLUMN_NAME'] == 'Message' || column['COLUMN_NAME'] == 'Line Count' )
  
      let queriesToExecute = []
  
      let result1 = {} 
      
          //  Query the database for a list of all results
          queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))
  
  
          for(let i = 0 ;i < columns.length ;i++) {
              if(columns[i].COLUMN_NAME != "Total") {

                  queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model}  WHERE [Error] = '1' order by [${columns[i].COLUMN_NAME}] asc`))
              }
          }
      
          const filterResult = await Promise.all(queriesToExecute)
      
          // filters
          let filters = (filterResult.map((result, index) => ({column:  columns[index].COLUMN_NAME , recordset:   result.recordset})))
      
          result1 = {
              filters,
              username: First,
              scrubIRBs
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
}



endpoints.WQ5508update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      let process = req.body.process
      console.log(process)

      const id = req['params']['id'];// please do not update this line

     
      let valuesQuery = "";
      for (key in values) {
        if(values[key] == null || values[key] == 'null' || values[key] == '' || undefined) {
          valuesQuery +=  "["+ key  + "]= NULL,";
          
        } else {
          valuesQuery +=  "["+ key  + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }

     
  
      valuesQuery = valuesQuery.slice(0, -1);
      let q = (`update WQ5508 set ${valuesQuery} where ID = ${id}`);
      
      await sql.query(q);
  
     
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


  endpoints.WQ1262update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      let process = req.body.process

      const id = req['params']['id'];// please do not update this line

     
      let valuesQuery = "";
      for (key in values) {
        if(values[key] == null || values[key] == 'null' || values[key] == '' || undefined) {
          valuesQuery +=  "["+ key  + "]= NULL,";
          
        } else {
          valuesQuery +=  "["+ key  + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }

     
  
      valuesQuery = valuesQuery.slice(0, -1);
      let q = (`update WQ1262 set ${valuesQuery} where ID = ${id}`);
      
      await sql.query(q);
  
     
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



  endpoints.WQ5508KPI = async (req, res,) => {
    try {
        var result = {
            KPI : [],
            Total: 0
        }
        Model = "WQ5508"
      
        let [{recordset: kpi}, {recordset: total}] = await Promise.all([
            await sql.query(`
            SELECT COUNT(*) from ${Model} where [SA Error] = 'Yes' and [Error] = '1'
            UNION ALL   
            SELECT COUNT(*) from ${Model} where [SA Error] IS NULL and [Error] = '1'
            `),
            await sql.query(`SELECT COUNT(*) as count from WQ5508`),
  
           
        ])
  
  
        result.KPI =  kpi
        result.Total = total

      
        let obj = {
            KPI: {
  
              'SA Error': result.KPI[0][""],
              'Error': result.KPI[1][""],
              total: total[0]['count'],
                data: [
                    {
                        type: 'SA Error' ,
                        value: +(result.KPI[0][""] / ( result.Total[0]["count"])  * 100).toFixed(2),
                        count: result.KPI[0][""],
                        color: '#C5E0B4'
                    },
                    {
                      type: 'Error' ,
                      value: +(result.KPI[1][""] / ( result.Total[0]["count"]) * 100).toFixed(2),
                      count: result.KPI[1][""],
                      color: '#FF9999'
                  },
                ]
            }       
        }
  
  
        console.log(obj)
  
        return res.status(200).json({
            success: true,
            result: obj,
            pagination: 1,
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


  endpoints.WQ1262KPI = async (req, res,) => {
    try {
        var result = {
            KPI : [],
            Total: 0
        }
        Model = "WQ1262"
      
        let [{recordset: kpi}, {recordset: total}] = await Promise.all([
            await sql.query(`
            SELECT COUNT(*) from ${Model} where [SA Error] = 'Yes' and [Error] = '1'
            UNION ALL   
            SELECT COUNT(*) from ${Model} where [SA Error] IS NULL and [Error] = '1'
            `),
            await sql.query(`SELECT COUNT(*) as count from ${Model} `),
  
           
        ])
  
  
        result.KPI =  kpi
        result.Total = total
       
        let obj = {
            KPI: {
  
              'SA Error': result.KPI[0][""],
              'Error': result.KPI[1][""],
              total: total[0]['count'],
             
                data: [
                    {
                        type: 'SA Error' ,
                        value: +(result.KPI[0][""] / ( result.Total[0]["count"])  * 100).toFixed(2),
                        count: result.KPI[0][""],
                        color: '#C5E0B4'
                    },
                    {
                      type: 'Error' ,
                      value: +(result.KPI[1][""] / ( result.Total[0]["count"])  * 100).toFixed(2),
                      count: result.KPI[1][""],
                      color: '#FF9999'
                  },
                ]
            }       
        }
  
  
  
        return res.status(200).json({
            success: true,
            result: obj,
            pagination: 1,
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
