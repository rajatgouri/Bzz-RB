const methods = require("./crudController");
const endpoints = methods.crudController("WQ1262");
var sql = require("mssql");
const utilController = require('./utilController')
const {getDateTime} = require('./utilController')
const sqlConnection = require('../sql')
const io = require('../socket');
const { getScrubs } = require("./WQsController");

delete endpoints["list"];

const Model = "WQ1262";
const ColumnModel = 'WQ1262Columns'
const ScrubIRBMoDel = 'Agenda';
const TabModel = 'WQ1262Tabs'



io.get().then(i => {
    i.on('connection' , (socket) => {
        
        socket.on("WQ1262-process-start",(data)=>{
            i.sockets.emit('WQ1262-process-started',{
                id:data.id
            })
        })

        socket.on("WQ1262-process-end",(data)=>{
            i.sockets.emit('WQ1262-process-ended',{
                id:data.id
            })
        })
    })
})

endpoints.list = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);
        delete filter['sort'];
        let status = filter['Status']
            
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
                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? " ["+ key + "] IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }

                    
                    case "OriginalUserAssigned" : {
                        let values = filter[key];
                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }

                   
                    
                    case "User" : {
                        let values = filter[key];

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
                    
                    // case "Notes": {

                    //     let values = filter[key];
                    //     if (values.length < 2 && values[0] == 0) {
                    //         filterQuery +=  key + " NOT IN ( '' )  and " 
                    //     } else if ((values.length < 2 && values[0] == 1)) {
                    //         filterQuery += "("+ key + " IN ( '' ) or Notes IS NULL) and " ;
                    //     } 
                    //     break;
                    // } 

                    case "Error": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery +=  key + ` NOT IN ( '' )  and ` 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Error IS NULL) and " ;
                        } 
                        break;
                    } 

                    case "Process Type": {
                        let values = filter[key];

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
                                valueQuery = values.map(v => ( "'" + v  + "'"))
                                if(values.length > 0) {
                                    filterQuery +=  +filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                                }
                            
                            break
                            // }

                          
                    }

                    default: {
                        filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key] + "%' and " : "" ;
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
        // Getting Pagination Object

        let colors = {}
        let RN = {}
        let PERM = {}

        if (managementAccess) {
            const [{recordset: Done}, {recordset: Pending}, {recordset: Deferred}, {recordset: MiscI}, {recordset: MiscII} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc') `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred')  `),
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) `),
                
            ])    

            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Deferred'] = Deferred;
            colors['Misc'] = MiscI;
            colors['Deferred'] = MiscII;
            colors['Review'] = Review;

            const [{recordset: hasRN}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where [Process Type] IN ('RN') and [Status] = 'Review' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)  `),
            ])  
            const [{recordset: hasPERM}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where  [Code] IN ( SELECT 
                    [value] as IRB 
                    FROM ${ScrubIRBMoDel} t1
                    CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                    where [No Scrub-Perm] = 'Perm')  and  [Status] = 'Review' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) `),
            ])  


            RN  = hasRN
            PERM  = hasPERM


        } else {


            const [{recordset: Done}, {recordset: Pending}, {recordset: Deferred}, {recordset: MiscI}, {recordset: MiscII} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred') and UserAssigned IN ('${First}')  `),
                // await sql.query(`Select count(*)  as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and UserAssigned IN ('${First}')  `),
               
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and UserAssigned IN ('${First}') `),
                
            ])    

            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Deferred'] = Deferred;
            colors['Misc'] = MiscI;
            colors['Deferred'] = MiscII;
            colors['Review'] = Review;


            const [{recordset: hasRN}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where  [Process Type] IN ('RN')  and [UserAssigned] = '${First}'  and [Status] = 'Review'  and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            ])  


            const [{recordset: hasPERM}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where  [Code] IN ( SELECT 
                    [value] as IRB 
                    FROM ${ScrubIRBMoDel} t1
                    CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                    where [No Scrub-Perm] = 'Perm')  and  [Status] = 'Review' and [UserAssigned] = '${First}' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) `),
            ])  


            RN  = hasRN
            PERM  = hasPERM

        }

        // for (i in filters) {
        //     filters[i] = filters[i].value
        // }
    
        
        
        return res.status(200).json({
            success: true,
            result: recordset,
            pagination,
            filters,
            sorters,
            colors,
            extra: {
                RN: RN,
                PERM: PERM
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


endpoints.getFilters = async (req,res) => {
    try {

        const values = req.body;
        delete values['sort']

        console.log(Model)

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
      columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'Total' || column['COLUMN_NAME'] == 'Code' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' || column['COLUMN_NAME'] == 'Acct Name' || column['COLUMN_NAME'] == 'Billing Status' ||  column['COLUMN_NAME'] == 'Acct Class' ||  column['COLUMN_NAME'] == 'Fin Class' || column['COLUMN_NAME'] == 'Message' || column['COLUMN_NAME'] == 'Line Count' )
  
      let queriesToExecute = []
  
      let result1 = {} 
      
        if (managementAccess ) {
          //  Query the database for a list of all results
          queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))
  
  
          for(let i = 0 ;i < columns.length ;i++) {
              if(columns[i].COLUMN_NAME != "Total") {

                  queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} where ${valuesQuery} order by [${columns[i].COLUMN_NAME}] asc`))
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
    
        } else if (req.admin.SpecialAccess ) {
          //  Query the database for a list of all results
          queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))
  
  
          for(let i = 0 ;i < columns.length ;i++) {
              if(columns[i].COLUMN_NAME != "Total") {
                  queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} where   ${valuesQuery} order by [${columns[i].COLUMN_NAME}] asc`))
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
    
        }
        
        
        else {
  
  
          queriesToExecute.push(await sql.query(`Select count(*) from ${Model} where UserAssigned IN (${First.split(",").map(f => "'" + f + "'")})`))
  
          for(let i = 0 ;i < columns.length ;i++) {
              if(columns[i].COLUMN_NAME != "Total") {
                  queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} where ${valuesQuery} order by [${columns[i].COLUMN_NAME}] asc`))
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

endpoints.fullList = async (req, res) => {

    try {
      const First = req.admin.First;
      const managementAccess = req.admin.ManagementCard 
    

       res.status(200).json({
        success: true,
        // result: recordset,
        result: [],
        // pagination,
        message: "Successfully found all documents",
      });
    let result1 = {} 
    
        var date1 = new Date();
        date1.setDate(date1.getDate(getDateTime().split('T')[0]) -1);
        date1 = date1.toISOString().split('T')[0]
        
        let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
        const hours = (new Date(date).getHours())


        const { recordset: result2 } = await sql.query(`
        
        SELECT 
    [value] as IRB 
FROM ${ScrubIRBMoDel} t1
CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
where [SCRUB STATUS] = '0'
        `)
        let scrubIRBs = (result2.map((i) => i.IRB))

      if (managementAccess) {
        //  Query the database for a list of all results
       
        const [
            {recordset: chargesProcessedCount},  //1
            {recordset: chargesReviewCount},     //2
            {recordset: chargesReview},          //3
            {recordset: notToReview},            //4
            {recordset: total},                  //5
            {recordset: amount},                 //6
            {recordset: charges},                //7
            {recordset: today},                   //8
            {recordset: kpi},                   //9

        ]  = await Promise.all([
            await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count from ${Model} where Status  IN ('Review') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count  from ${Model} where Status NOT IN ('Review')  and [ActionTimeStamp]> '${utilController.getDateTime().split('T')[0]}'`),
            await sql.query(`Select * from ${Model} where Status NOT IN ('Done') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count from ${Model}  where ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]} ' or [Status] = 'Review' ) `),
            await sql.query(`Select SUM([Acct Bal]) as count  from ${Model} where Status In ('Done') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)  ,
            await sql.query(`Select count(*) as count from ${Model} where Status NOT In ('Review') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`),
            await sql.query(`
            
            SELECT ISNULL(SUM(count), 0 ) count from (
                SELECT COUNT(*) as count from WQ1262 where [Status] = 'Done'   and  [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}'
                UNION ALL 
                SELECT COUNT(*) as count FROM SA_HB_WQAudit WHERE  [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}'
                ) as A
            
             `),
            await sql.query(`
            SELECT * FROM (
                SELECT 'RN' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt,
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  ) 
                and [Process Type] = 'RN'
                UNION ALL
                SELECT 'Outpatient' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt, 
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  ) 
                and [Process Type] = 'Outpatient'
                UNION ALL
                SELECT 'Expedite' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt,
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  ) 
                and ID IN (
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
                )
                ) as A
                Order BY [SUM] DESC
            `)
        ])
    
        let data  = {
            chargesProcessedCount,
            chargesReviewCount,
            chargesReview,
            notToReview    ,
            total,
            amount,
            charges,
            today,
            kpi
        }

        result1 = {
            data,
            username: First,
        } 
  
           

      } else {

    
        const [
            {recordset: chargesProcessedCount},
            {recordset: chargesReviewCount}, 
            {recordset: chargesReview}, 
            {recordset: notToReview}, 
            {recordset: total},
            {recordset: amount}, 
            {recordset: charges}, 
            {recordset: today},
            {recordset: kpi},                   //9

        ]  = await Promise.all([
            await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and UserAssigned IN ('${First}') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count from ${Model} where Status  IN ('Review') and UserAssigned IN ('${First}') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count from ${Model} where Status NOT IN ('Review') and UserAssigned IN ('${First}')  and [ActionTimeStamp]> '${utilController.getDateTime().split('T')[0]}'`),
            await sql.query(`Select * from ${Model} where Status NOT IN ('Done') and UserAssigned IN ('${First}') and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
            await sql.query(`Select count(*) as count from ${Model} where ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and  UserAssigned IN ('${First}') and ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]} ' or [Status] = 'Review' )`),
            await sql.query(`Select ISNULL(SUM([Acct Bal]),0) as count from ${Model} where Status In ('Done') and [User] IN ('${First}') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)  ,
            await sql.query(`Select count(*) as count from ${Model} where Status NOT In ('Review') and [User] IN ('${First}') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`) ,
            await sql.query(`
            
            SELECT ISNULL(SUM(count), 0 ) count from (
                SELECT COUNT(*) as count from WQ1262 where [Status] = 'Done' and [UserAssigned]= '${First}'  and  [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}'
                UNION ALL 
                SELECT COUNT(*) as count FROM SA_HB_WQAudit WHERE [User] = '${First}' and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}'
                ) as A

            `),
            await sql.query(`
            SELECT * FROM (
                SELECT 'RN' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt,
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  )  and [UserAssigned] = '${First}'
                and [Process Type] = 'RN'
                UNION ALL
                SELECT 'Outpatient' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt, 
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  )  and [UserAssigned] = '${First}'
                and [Process Type] = 'Outpatient'
                UNION ALL
                SELECT 'Expedite' as [Type],
                CASE 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000000), 2)) + ' M' 
                WHEN ISNULL(SUM([Acct Bal]),0) >= 1000 AND ISNULL(SUM([Acct Bal]),0) < 1000000  THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) / 1000), 2)) + ' K'
                WHEN  ISNULL(SUM([Acct Bal]),0) < 1000 THEN CONVERT (VARCHAR, ROUND((ISNULL(SUM([Acct Bal]),0) ), 2)) END AS [Amount],
                COUNT(*) as Cnt,
                ISNULL(SUM([Acct Bal]),0) as [SUM]
                FROM WQ1262 where ([Status] = 'Review'  )  and [UserAssigned] = '${First}'
                and ID IN (
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
                )
                ) as A
                Order BY [SUM] DESC
            `)


        ])
    
    
        let data  = {
            chargesProcessedCount,
            chargesReviewCount,
            chargesReview,
            notToReview    ,
            total,
            amount,
            charges,
            today,
            kpi
        }

        result1 = {
            data,
            username: First,

        } 
        
      }

      io.get().then(i=> {
        i.to(req.admin.EMPID).emit('WQ1262-fulllist', {data: result1})
      })


     
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





endpoints.populateSOC = async(req,res) => {
    try {

        let SOCs= []
        const { recordset : results} = await sql.query(
            `
            SELECT [Acct ID],  [UserAssigned], CAST([UploadDateTime] as Date) FROM WQ1262
            where ([SOC Flag] IS NULL ) 
            or ([SOC Flag] = 'N/A' AND [UploadDateTime] < '${getDateTime().split('T')[0]}')
            GROUP BY [Acct ID], [UserAssigned], CAST([UploadDateTime] as Date)
             order by  
            case when [UserAssigned] IN ( 'Julie') then 1 else 2 end,
            case when [UserAssigned] IN ( 'Anna') then 3 else 4 end,
             [UserAssigned] ASC, CAST([UploadDateTime] as Date) DESC`
     
     );


     if(results.length <1) {
        return res.status(200).json({
            success: true,
            // result: recordset,
            result: [],
            // pagination,
            message: "no documents found",
          });
     } else {
        res.status(200).json({
            success: true,
            // result: recordset,
            result: [],
            // pagination,
            message: "Population start on documents",
          });
     }

     SOCs = results.filter((r) => r['Acct ID'] != null && r['Acct ID'] != '' )


     let parts = SOCs.length/10
     if (parts< 1) {
       parts =1
     }
 
     let result = splitArray(SOCs, parts)
 
     for (let i=0; i< result.length ; i++) {
 
       let HAR =   result[i].map(r => r['Acct ID']).join(',') 

       let {recordset} = await sqlConnection.query(`
       USE [FI_DM_HIMS_ICD]
       DECLARE @vHAR NVARCHAR(MAX) = '${HAR}'
     
;WITH OGT AS
(SELECT X.[Value] [HAR], NULL [Source], NULL [SOC Flag] from  string_split(@vHAR, ',') X)
,HspTran0 AS
(SELECT DISTINCT 
       hspt0.[HSP_ACCOUNT_ID] [HAR]
      ,CASE WHEN hspac0.[NAME] IN ('Hospital Outpatient Surgery', 'Observation', 'Inpatient') THEN 'Account Class: RN'
       ELSE 'CPT: EKGs'
       END [Source]
      ,'Study-Related' [SOC Flag]
  FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt0
  LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_ACCT_CLASS_HA] hspac0 ON hspt0.[ACCT_CLASS_HA_C]=hspac0.[ACCT_CLASS_HA_C]
  WHERE [HCPCS_CODE] IN ('93000', '93005', '93010', 'PRO141') 
     OR [CPT_CODE] IN ('93000', '93005', '93010', 'PRO141')
     OR hspac0.[NAME] IN ('Hospital Outpatient Surgery', 'Observation', 'Inpatient'))
,Result0 AS
(SELECT DISTINCT ogt.[HAR], hspt0.[Source] [Source], hspt0.[SOC Flag] [SOC Flag] FROM OGT ogt
LEFT JOIN HspTran0 hspt0 ON ogt.[HAR]=hspt0.[HAR])
,HspTran1 AS
(SELECT DISTINCT
        hspt1.[HSP_ACCOUNT_ID] [HAR]
       ,'HSP Transaction' [Source]
       ,CASE WHEN rshi.[IRB_APPROVAL_NUM] IS NULL THEN 'SOC' ELSE 'Study-Related' END [SOC Flag]
FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt1
INNER JOIN (SELECT [HAR] from Result0 where [SOC Flag] IS NULL) X ON hspt1.[HSP_ACCOUNT_ID]=X.[HAR]
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa WITH (NOLOCK) ON hspt1.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PAT_ENC_RSH] rshe WITH (NOLOCK) ON hspt1.[PAT_ENC_CSN_ID]=rshe.[PAT_ENC_CSN_ID]
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ORD_RESEARCH_CODE] rsho WITH (NOLOCK) ON hspt1.[ORDER_ID]=rsho.[ORDER_ID]
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rshi WITH (NOLOCK) ON COALESCE(hspt1.[RESEARCH_STUDY_ID], hspa.[RESEARCH_ID], rshe.[ENC_RESEARCH_ID], rsho.[RESEARCH_CODE_ID])=rshi.[RESEARCH_ID]
WHERE  rshi.[IRB_APPROVAL_NUM] IS NOT NULL)
,Result1 AS (
 SELECT DISTINCT r0.[HAR], COALESCE(r0.[Source] , hspt1.[Source]) [Source], COALESCE(r0.[SOC Flag], hspt1.[SOC Flag]) [SOC Flag] FROM Result0 r0
LEFT JOIN HspTran1 hspt1 ON r0.[HAR]=hspt1.[HAR]
)
, ScreenPeriod AS
(SELECT [MRN]
       ,[HAR]
       ,[Code]
       ,[EPIC Arm]
       ,CAST(COALESCE([Consented],DATEADD(day,-30,COALESCE([Enrolled - Active],GETDATE()))) AS DATE) [Consented]
       ,CAST(COALESCE([Enrolled - Active],DATEADD(day,30,COALESCE([Consented],GETDATE()))) AS DATE) [Enrolled - Active]
 FROM
      (SELECT pat.[PAT_MRN_ID] [MRN]
            ,hspa.[HSP_ACCOUNT_ID] [HAR]
            ,rsh.[IRB_APPROVAL_NUM] [Code]
            ,rsb.[BRANCH_NAME] [EPIC Arm]
            ,esc0.[NAME] [Status]
            ,MIN(CAST(eih.[HX_MOD_DTTM] AS DATE)) [Date]
        FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO_HX] eih WITH (NOLOCK)
        LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_ENROLL_STATUS] esc0 WITH (NOLOCK) ON eih.[HX_MOD_STATUS_C]=esc0.[ENROLL_STATUS_C]
        LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] ei WITH (NOLOCK) ON eih.[ENROLL_ID]=ei.[ENROLL_ID]
        LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON ei.[PAT_ID]=pat.[PAT_ID]
        INNER JOIN (
            select hspa.*
            from [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa
            INNER JOIN (SELECT [HAR] from Result1 where [SOC Flag] IS NULL)  X ON hspa.[HSP_ACCOUNT_ID]=X.[HAR]
        ) hspa ON pat.[PAT_ID]=hspa.[PAT_ID]
        LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsh WITH (NOLOCK) ON ei.[RESEARCH_STUDY_ID]=rsh.[RESEARCH_ID]
        LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_STUDY_BRANCHES] rsb WITH (NOLOCK) ON ei.[RESEARCH_STUDY_ID]=rsb.[RESEARCH_ID] AND ei.[STUDY_BRANCH_ID]=rsb.[BRANCH_ID]
        WHERE hspa.[HSP_ACCOUNT_ID] IS NOT NULL
        GROUP BY pat.[PAT_MRN_ID]
         ,hspa.[HSP_ACCOUNT_ID]
         ,rsh.[IRB_APPROVAL_NUM]
         ,rsb.[BRANCH_NAME]
         ,esc0.[NAME]) t
      PIVOT(
          MIN([Date])
          FOR [Status] IN (
              [Consented],
              [Enrolled - Active])
            ) AS pivot_table)
,ScreenPeriodDatesListed AS
(SELECT * FROM ScreenPeriod scp1
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[GenerateDateRange]('2017-01-01', GETDATE(), 1) Cal  ON cal.[DateValue] BETWEEN scp1.[Consented] AND scp1.[Enrolled - Active])
,HARinHSPTWithinScreenPeriod AS
(SELECT DISTINCT hspt1.[HSP_ACCOUNT_ID] [HAR], 'Screening Period' [Source], 'Study-Related' [SOC Flag]--, scp.*, hspt1.[SERVICE_DATE]
 FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt1
 INNER JOIN (SELECT [HAR] from Result1 where [SOC Flag] IS NULL)  X ON hspt1.[HSP_ACCOUNT_ID]=X.[HAR]
 INNER JOIN ScreenPeriodDatesListed scpdl ON hspt1.[HSP_ACCOUNT_ID]=scpdl.[HAR] AND CAST(hspt1.[SERVICE_DATE] AS DATE)=scpdl.[DateValue])
, Result2 AS (
 SELECT DISTINCT r1.[HAR], COALESCE(r1.[Source], hscp0.[Source]) [Source], COALESCE(r1.[SOC Flag], hscp0.[SOC Flag]) [SOC Flag] FROM Result1 r1
LEFT JOIN HARinHSPTWithinScreenPeriod hscp0 ON r1.[HAR]=hscp0.[HAR]
)
 ,ExtFiveDigit AS
(SELECT
        hspt.[HSP_ACCOUNT_ID]
       ,hspa.[PAT_ID]
       ,hnt.[NOTE_ID]
       ,[FI_DM_HIMS_ICD].[dbo].[udf_ExtractNumberFromString](hnt.[NOTE_TEXT]) [FiveDigit]
  FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt
  INNER JOIN (SELECT [HAR] from Result2 where [SOC Flag] IS NULL) X ON hspt.[HSP_ACCOUNT_ID]= X.[HAR]
  INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa ON hspt.[HSP_ACCOUNT_ID] = hspa.[HSP_ACCOUNT_ID]
  INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HNO_INFO] hno ON hspa.[PAT_ID] = hno.[PAT_ID] AND CAST(hspt.[SERVICE_DATE] AS DATE)=CAST(hno.[DATE_OF_SERVIC_DTTM] AS DATE)
  INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HNO_NOTE_TEXT] hnt ON hno.[NOTE_ID]=hnt.[NOTE_ID]
  )
,EFDList AS
(SELECT DISTINCT
      [HSP_ACCOUNT_ID]
     ,[PAT_ID]
     ,[NOTE_ID]
     ,value as IRB
FROM  ExtFiveDigit t1 CROSS APPLY STRING_SPLIT(REPLACE(t1.[FiveDigit], ' ', '' ), ','))
,EnrolInfo AS
(SELECT DISTINCT [PAT_ID], [IRB_APPROVAL_NUM] FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] eni
LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsh ON eni.[RESEARCH_STUDY_ID]=rsh.[RESEARCH_ID])
,ActualIRBsInNotes AS
(SELECT
      [HSP_ACCOUNT_ID]
     ,el.[PAT_ID]
     ,[NOTE_ID]
     ,[IRB]
FROM EFDList el
INNER JOIN EnrolInfo eni ON el.[PAT_ID]=eni.[PAT_ID] AND el.[IRB]=eni.[IRB_APPROVAL_NUM])
,Result3 AS
(SELECT DISTINCT [HSP_ACCOUNT_ID] [HAR], 'Notes for IRB '+[IRB] [Source], 'Study-Related' [SOC Flag] FROM ActualIRBsInNotes)
SELECT DISTINCT r2.[HAR], COALESCE(r2.[Source], r3.[Source], 'N/A') [Source], COALESCE(r2.[SOC Flag], r3.[SOC Flag], 'SOC') [SOC Flag] FROM Result2 r2
LEFT JOIN Result3 r3 ON r2.[HAR]=r3.[HAR]
       
       
             
     `)
     
 
 
     if(!recordset) {
       for (let i=0 ; i< result[i].length ; i++) {
         await sql.query(`UPDATE WQ1262 set [SOC Flag] =  'N/A'  where [Acct ID] IN (${HAR} )`)  
       }
     } else {
       for (let i=0 ; i< recordset.length ; i++) {
         await sql.query(`UPDATE WQ1262 set [SOC Flag] = ${recordset[i]['SOC Flag'] ? "'" +recordset[i]['SOC Flag'] + "'" : 'N/A' } where [Acct ID] IN ( '${recordset[i]['HAR']}')`)  
         
       }
     }
    
     

     await sql.query(`
     exec  [dbo].[POPULATE_WQ1262_Category_Column] 
     BEGIN
     exec  [dbo].[POPULATE_WQ1262_Ratio_Column]
     END
  
     `)
    
 
     }
    } catch(err) {

        console.log(err)
        return res.status(500).json({
            success: false,
            result: [],
            message: "Oops there is error",
            error: err,
          });
    }
}

endpoints.processTypes = async (req,res) => {
    try {


        const {recordset: result} = await sql.query(`SELECT DISTINCT([Acct Class]) from ${Model}`)

        return res.status(200).json({
          success: true,
          // result: recordset,
          result: result,
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




endpoints.updateColor = async (req,res) => {
    try {

        const First = req.admin.First;
        
        var {items, selectedRows, data, selectedRowID} = (req.body)

        let values = {Color: data.color, Status: data.text, ActionTimeStamp: utilController.getDateTime(), User: First}
      
        if(data.text == 'Review') {
            values['StartTimeStamp'] = null
            values['FinishTimeStamp'] = null
            values['Duration'] = null
        }

        let valuesQuery = "";
        for (key in values) {
            if(values[key] == null) {
                valuesQuery += (key == 'User' ? "[User]" : key) + "= NULL,";
            } else {
                valuesQuery += (key == 'User' ? "[User]" : key) + "='" + values[key] + "',";
            }
        }


        valuesQuery = valuesQuery.slice(0, -1);
        await sql.query(`update T1  set ${valuesQuery} from ${Model} T1 where ID IN (${selectedRows.map((id) => "'" + id  + "'")})`);

        // await sql.query(`update ${Model} set `)

        return res.status(200).json({
          success: true,
          result: [],
          message: "Success update color",
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

endpoints.columns = async (req,res) => {
    try {

       
        const {id} = req.query
       
        let {recordset: columns} = await sql.query(
          `
          SELECT * from ${ColumnModel} where EMPID = ${id}
          `
      );
  
  
        return res.status(200).json({
          success: true,
          result: columns,
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
       values.EMPID = req.admin.EMPID
            const {recordset: exists } = await sql.query(`SELECT * from ${ColumnModel} where EMPID = '${values.EMPID}'`)

            if (exists.length > 0) {

              // values.EMPID = +req.admin.EMPID;
              const { id } = req.params;
              let valuesQuery = "";
              for (key in values) {
          
                if (values[key] == 0) {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
          
                } else if (  values[key] == null || values[key] == "null" || values[key] == "") {
                  valuesQuery += "[" + key + "]= NULL" + ",";
                } else {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
                }
              }
          
              valuesQuery = valuesQuery.slice(0, -1);
            
              let updateQ = `update T1  set ${valuesQuery}from ${ColumnModel} T1 where EMPID = ${values.EMPID}`
              await sql.query(updateQ);
          
              return res.status(200).json({
                success: true,
                result: {},
                message: "we update this document by this id: " + req.params.id,
              });
            } else {
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
              
                const insertQuery = `insert into ${ColumnModel} ${columnsQ} values ${valuesQuery}`
            
                await sql.query(insertQuery);
            
                return res.status(200).json({
                    success: true,
                    result: {},
                    message: "we added document" ,
                  });
               
            }
    } catch (err) {
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

      const First = req.query.user;
      const managementAccess = req.admin.ManagementCard || req.admin.Nickname == 'Bernadette'
    
      const {recordset: result2} = await sql.query(`
      SELECT 
         [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
      `)
      let scrubIRBs = (result2.map((i) => i.IRB ))

      let {recordset: columns} = await sql.query(
        `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'WQ1262'
        `
    );

    columns.unshift({COLUMN_NAME: "Total"})
    columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'Total' || column['COLUMN_NAME'] == 'Code' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' || column['COLUMN_NAME'] == 'Acct Name' || column['COLUMN_NAME'] == 'Billing Status' ||  column['COLUMN_NAME'] == 'Acct Class' ||  column['COLUMN_NAME'] == 'Fin Class' || column['COLUMN_NAME'] == 'Message' || column['COLUMN_NAME'] == 'Line Count' )

    let queriesToExecute = []

    let result1 = {} 
    
      if (managementAccess  ) {
        //  Query the database for a list of all results
        queriesToExecute.push(await sql.query(`Select count(*) from ${Model} `))


        for(let i = 0 ;i < columns.length ;i++) {
            if(columns[i].COLUMN_NAME != "Total") {

                queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]), [Process Type], [Status] from ${Model} order by [${columns[i].COLUMN_NAME}] asc`))

                // queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]), [Process Type] from ${Model} `))
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
  
      } 
      
      else if (req.admin.SpecialAccess ) {
        //  Query the database for a list of all results
        queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))


        for(let i = 0 ;i < columns.length ;i++) {
            if(columns[i].COLUMN_NAME != "Total") {

                queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]), [Process Type], [Status] from ${Model} where  [Status] NOT IN ('Done') order by [${columns[i].COLUMN_NAME}] asc`))
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
  
      }
      else {
        
        queriesToExecute.push(await sql.query(`Select count(*) from ${Model} where UserAssigned IN (${First.split(",").map(f => "'" + f + "'")})`))

        for(let i = 0 ;i < columns.length ;i++) {
            if(columns[i].COLUMN_NAME != "Total") {

                queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]), [Process Type], [Status] from ${Model} where UserAssigned IN (${First.split(",").map(f => "'" + f + "'")}) and [Status] NOT IN ('Done') order by [${columns[i].COLUMN_NAME}] asc`))

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
        
      }

      return res.status(200).json({
        success: true,
        result: result1,
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

let splitArray = (array, parts) =>  {
    let res = [];
    for (let i = parts; i > 0; i--) {
        res.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return res;
  }


endpoints.updateUser = async (req, res) => {
    try {
        const {value } = req.body


        let values = {
            User: value.UserLogged,
            UserAssigned: value.UserAssigned,
            // 'Process Type': value['Process Type'],
            'Status': value['Status'],
            
        }


        let valuesQuery = "";
        for (key in values) {
            if (values[key] == null) {
                valuesQuery += "";

            } else if (key == "Status" && values[key] == 'Review' ) {
                valuesQuery +=  "(  Status = 'Review' or  Status IS NULL )  and ";
            }

            else {
              valuesQuery += "["  + key + "] ='" + values[key] + "' and ";
           } 
        }


        valuesQuery = valuesQuery.slice(0, -4);
s
        const {recordset: result } = await sql.query(`select * from ${Model} where ${valuesQuery} `)
       
        let res1 = result 
        const splitResult = (splitArray(res1, value.User.length))

        if(value.User.length > 1) {

            let counter = 0

            let promise = new Promise((resolve, reject) => {
              for (let i=0; i< splitResult.length -1; i++) {
                  
    
                splitResult[i+1].map((r,index) => {
                  if (  splitResult[i].findIndex(item => item['Patient MRN'] == r['patient MRN'] ) > -1) {
    
                      splitResult[i].push(r)  	
                      splitResult[i+1] = splitResult[i+1].filter(item => item != r)
                  }
    
                  counter  = counter + 1
                  if(counter == splitResult.length) {
                    resolve(true)
                  }
                })
              }
            })
            
            await promise 



            const timer = () => new Promise(res => setTimeout(res, 1500))
            for (var i = 0; i < splitResult.length; i++) {
                
               let MRN= splitResult[i].map((item) => item['Patient MRN']) 
               await sql.query(`update T1 set UserAssigned = '${value.User[i]}' from ${Model} T1 where  Status='${values.Status}' and  [Patient MRN] IN (${MRN.map(m => "'" + m + "'")})`)
              
            //    await sql.query(`update ${Model} set UserAssigned = '${value.User[i]}' where [Process Type] = '${values['Process Type']}' and  Status='${values.Status}' and  [Patient MRN] IN (${MRN.map(m => "'" + m + "'")})`)
              await timer();
            }
    

     
            return res.status(200).json({
                success: true,
                result:   splitResult ,
                message: "Successfully found all documents",
            });

    
        } else {

            for (var i= 0; i < value.User.length; i++) {
                
                let MRN= splitResult[i].map((item) => item['Patient MRN']) 
                
                await sql.query(`update T1 set UserAssigned = '${value.User[i]}' from ${Model} T1 where [Process Type] = '${values['Process Type']}' and  Status='${values.Status}' and  [Patient MRN] IN (${MRN.map(m => "'" + m + "'")})`)
             }


             
                  
            return res.status(200).json({
                success: true,
                result: splitResult ,
                message: "Successfully found all documents",
            });

     

        }


        

        
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

endpoints.updatetime = async (req, res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;

        const id = values.id;// please do not update this line
        const mrn = values['Patient MRN']
        const status = values['Status']
        const ProcessType  = values['Process Type']
        let Keys = values['keys']
        delete values['Status']
        delete values['Patient MRN']
        delete values['Process Type']
        delete values['keys']
        values['ActionTimeStamp'] = getDateTime()


        let valuesQuery = "";
        for (key in values) {
            if (values[key] == null) {
                valuesQuery += key + "=" + null + ",";

            } else if (key != 'id') {
                valuesQuery += key + "='" + values[key] + "',";
            }
        }

        valuesQuery = valuesQuery.slice(0, -1);

         
            
            let q = `update T1 set ${valuesQuery} from ${Model} T1 where ID IN (${Keys.join(',')}) and (Status IN ('Review', 'Pending', 'Misc', 'Deferred', '') or Status IS NUll) and UserAssigned IS NOT NULL and [Process Type] = '${ProcessType}'   `
           console.log(q)
            await sql.query(q);

            let d = `update T2 set [Duration] = DATEDIFF(MILLISECOND, StartTimeStamp, FinishTimeStamp) from ${Model} T2 where ID IN (${Keys.join(',')}) and (Status IN ('Review', 'Pending', 'Misc', 'Deferred', '') or Status IS NUll) and UserAssigned IS NOT NULL and [Process Type] = '${ProcessType}'   `
            console.log(d)
           
            await sql.query(d);
        

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



module.exports = endpoints;
