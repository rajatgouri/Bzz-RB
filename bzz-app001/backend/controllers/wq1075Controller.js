

const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075");
var sql = require("mssql");
const utilController = require('./utilController');
const {getDateTime} = require('./utilController')
const {getFilters} = require('../Utils/filters')
const io = require('../socket');
const { getScrubs } = require("./WQsController");



delete endpoints["list"];
const Model = "WQ1075";
const ColumnModel = 'WQ1075Columns'
const ScrubIRBMoDel = 'Agenda';
const DTModel = 'DataCollection'


// setTimeout(async () => {
//   for (let i=0; i< 2000 ; i++) {
//     await sql.query(`update WQ1075 set [Patient MRN] = ${Math.floor(100000 + Math.random() * 900000)} where ID = ${i}`)
//   }
// }, 10000 )



io.get().then(i => {
    i.on('connection' , (socket) => {
        
        socket.on("WQ1075-process-start",(data)=>{
            i.sockets.emit('WQ1075-process-started',{
                id:data.id
            })
        })

        socket.on("WQ1075-process-end",(data)=>{
            i.sockets.emit('WQ1075-process-ended',{
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
        var limitTop10 = req.body.limit != "null" && req.body.limit != undefined  ?  req.body.limit : '0' 
        
        delete filter['sort'];


        const {recordset: result1} = await sql.query(`
        SELECT 
         [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
`)
        var scrubIRBs = (result1.map((i) => i.IRB ))

        var top10 = false;
        
        let filterQuery = "";
        let sorterQuery = "";

        // const customSwitch = []

        // for ( f in filter) {
        //     if (filter[f] && filter[f].length > 0 &&  f!= 'Process Type') {
        //         customSwitch.push({
        //             condition: f,
        //             fn: f
        //         })
        //     }
            
        // }
            
        // filterQuery = await getFilters(filter, customSwitch)

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
                    
                    

                    case "User" :
                    case "UserAssigned" :
                    case "Research IRB":
                    case "Study Type" :
                    case "Study Status" :
                    case "Primary Coverage" :
                    case "Patient" :


                     {
                        let values = filter[key];

                        if(values.indexOf('null') > -1 || values.indexOf(null) > -1 ) {
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
                    case "Process Type" : {
                        let values = filter[key];
                        
                        if (values[0] == 'Top 10 $ Amount' ) {
                            if(limitTop10 != 0) {
                                filterQuery += `ID >= 0 and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) ) and `;
                            }  else {
                                filterQuery += "ID < 0 and ";

                            }
                            sorterQuery += '[Sess Amount] DESC ,'
                                
                            top10 = true

                        } else if (values[0] == 'Top 10 Aging Days') {

                            if(limitTop10 != 0) {
                                filterQuery += `ID >= 0 and ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL )  and `;
                            }  else {
                                filterQuery += "ID < 0 and ";
                            }

                            sorterQuery += '[Aging Days] DESC ,'
                            top10 = true
                            
                        }  else if (values[0] == 'Do Not Scrub IRBs') {
                            filterQuery += `ID >= 0 and [Research IRB] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) and ` ;
                            sorterQuery += ''
                            
                        } else if (values[0] == 'Answers') {
                            filterQuery += `ID >= 0 and [Has Answer] = 1 and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL) )  and ` ;
                            sorterQuery += ''
                            
                        } else if (values[0] == 'Data Collections') {
                            filterQuery += `ID >= 0 and [Research IRB] IN (
                                SELECT CONVERT(VARCHAR, IRB) from ${DTModel}
                            ) and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})) )  and ` ;
                            sorterQuery += ''
                            
                        } else if (values[0] == 'Perm') {
                            filterQuery += `ID >= 0 and [Research IRB] IN ( SELECT 
                                [value] as IRB 
                                FROM ${ScrubIRBMoDel} t1
                                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                                where [No Scrub-Perm] = 'Perm') and `;
                            sorterQuery += ' '
                        }  else if (values[0] == 'Test') {
                            filterQuery += `ID >= 0 and [Research IRB] IN ( SELECT 
                                [value] as IRB 
                                FROM ${ScrubIRBMoDel} t1
                                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                                where [No Scrub-Test] = 'Test') and `;
                            sorterQuery += ' '
                        }


                        
                        
                        else if (values[0] == 'Non-Therapeutic') {

                            filterQuery += `ID >= 0 and [Study Type] = 'Non-Therapeutic' and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or [Research IRB] IS NULL )  ) and ` ;
                
                        }  else {
                            
                            valueQuery = values.map(v =>  {
                                return ( "'" + v + "'")
                            })
                            
                            if(valueQuery.length > 0 ) {
                                filterQuery += "[" +  key  + "] IN (" + valueQuery + `) and  (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL)  ) and `  ;
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
                            filterQuery +=  key + " NOT IN ( '' )  and " 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Error IS NULL) and " ;
                        } 
                        break;
                    } 

                    case "Correct" : {
                        let values = filter[key];
                        values = [... new Set(values)]


                        if(values.indexOf(null) > -1) {
                            valueQuery = values.map(v => ( "" + v  + ""))
                            filterQuery +=  +filter[key] !== null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                            filterQuery += `[${key}] IS NULL) and `

                        } else {
                            
                            valueQuery = values.map(v => ( "" + v  + ""))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                            }
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

        if( sorter.filter.length ==1  && sorter.filter((sort) => sort.field == "Sess Amount").length == 0) {
            sorter.push({
                field: "Sess Amount",
                order: "descend"  
            })      
        }
        
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
                    
                    query += " ORDER BY " + sq +  " OFFSET "+ skip + " ROWS FETCH NEXT " + (limitTop10 >0 ? limitTop10 : limit) + " ROWS ONLY"   
                } 


            } else {
                query +="ORDER BY  [Sess Amount] Desc OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
            }
        

            console.log(query)
            const { recordset: result } = await sql.query(query);
         
                recordset = result
            // }
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

        // Getting Pagination Object
        let colors = {}
        let PERM = {}


        if (managementAccess) {
            const [{recordset: Done}, {recordset: Pending}, {recordset: Defer}, {recordset: MiscI}, {recordset: MiscII} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")})  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")})  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Defer') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")})  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")})  `),
               (filter['Process Type'] && filter['Process Type'][0] ==  'Non-Therapeutic' ) ? 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Study Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `)
                : 
                (filter['Process Type'] && filter['Process Type'][0] ==  'Do Not Scrub IRBs' && scrubIRBs.length > 0 ) ? 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Research IRB] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) `)
                : 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                
            ])    


            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Defer'] = Defer;
            colors['Misc'] = MiscI;
            colors['Deferred'] = MiscII;
            colors['Review'] = Review;


            const [{recordset: hasPERM}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where  [Research IRB] IN ( SELECT 
                    [value] as IRB 
                    FROM ${ScrubIRBMoDel} t1
                    CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                    where [No Scrub-Perm] = 'Perm')  and  [Status] = 'Review'  `),
            ])  


            PERM  = hasPERM

        } else {


            const [{recordset: Done}, {recordset: Pending}, {recordset: Defer}, {recordset: MiscI}, {recordset: MiscII} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and UserAssigned IN ('${First}') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending') and UserAssigned IN ('${First}') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Defer') and UserAssigned IN ('${First}') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc') and UserAssigned IN ('${First}') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred') and UserAssigned IN ('${First}') and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                (filter['Process Type'] && filter['Process Type'][0] ==  'Non-Therapeutic') ? 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Study Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `)
                : 
                (filter['Process Type'] && filter['Process Type'][0] ==  'Do Not Scrub IRBs' && scrubIRBs.length > 0) ? 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Research IRB] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) `)
                : 
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('Review', '') or Status  IS NULL) and [Process Type] In (${filter['Process Type'].map((p) => "'" + p + "'")}) `),
                
            ])    

            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Defer'] = Defer;
            colors['Misc'] = MiscI;
            colors['Deferred'] = MiscII;
            colors['Review'] = Review;

            const [{recordset: hasPERM}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where [Research IRB] IN ( SELECT 
                    [value] as IRB 
                    FROM ${ScrubIRBMoDel} t1
                    CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                    where [No Scrub-Perm] = 'Perm')  and  [Status] = 'Review' and [UserAssigned] = '${First}' `),
            ])  


            PERM  = hasPERM

        }


        return res.status(200).json({
            success: true,
            result: recordset,
            pagination,
            filters,
            sorters,
            scrubIrb: scrubIRBs,
            colors,
            extra: {
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
        await sql.query(`update ${Model} set ${valuesQuery} where ID IN (${selectedRows.map((id) => "'" + id  + "'")})`);

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



let splitArray = (array, parts) =>  {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
  }

endpoints.updateUser = async (req, res) => {
    try {
        const {value } = req.body

        let values = {
            User: value.UserLogged,
            UserAssigned: value.UserAssigned,
            'Process Type': value['Process Type'],
            'Status': value['Status']
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



        let resultList = []

        const {recordset: result } = await sql.query(`select * from ${Model} where ${valuesQuery} `)

        
        resultList  = result
        let splitResult = (splitArray(result, value.User.length))


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
              
               await sql.query(`update ${Model} set UserAssigned = '${value.User[i]}' where [Process Type] = '${values['Process Type']}' and Status='${values.Status}' and [Patient MRN] IN (${MRN.map(m => "'" + m + "'")})`)
              await timer();
            }
    
            
     
            return res.status(200).json({
                success: true,
                result: Array.prototype.concat.apply([], splitResult) ,
                message: "Successfully found all documents",
            });

    
        } else {

            for (var i= 0; i < value.User.length; i++) {
                
                let MRN= splitResult[i].map((item) => item['Patient MRN']) 
                await sql.query(`update ${Model} set UserAssigned = '${value.User[i]}' where [Process Type] = '${values['Process Type']}' and  Status='${values.Status}' and [Patient MRN] IN (${MRN.map(m => "'" + m + "'")})`)
             }


                  
            return res.status(200).json({
                success: true,
                result: Array.prototype.concat.apply([], splitResult),
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

        const { recordset: result2 } = await sql.query(`
        
        SELECT 
    [value] as IRB 
FROM ${ScrubIRBMoDel} t1
CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
where [SCRUB STATUS] = '0'
        `)
        let scrubIRBs = (result2.map((i) => i.IRB))

        var date1 = new Date();
        date1.setDate(date1.getDate(getDateTime().split('T')[0]) - 1);
        date1 = date1.toISOString().split('T')[0]

        let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
        const hours = (new Date(date).getHours())


        if (managementAccess) {
            //  Query the database for a list of all results

            const [{ recordset: chargesProcessedCount }, { recordset: chargesReviewCount }, { recordset: chargesReview }, { recordset: notToReview },{ recordset: inReview }, { recordset: total }, { recordset: amount }, { recordset: charges }] = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)`),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Review') and  [Research IRB]  NOT IN  (${scrubIRBs.map((irb) => "'" + irb + "'")})`),
                await sql.query(`Select count(*) as count  from ${Model} where Status NOT IN ('Review') and  [Research IRB]  NOT IN  (${scrubIRBs.map((irb) => "'" + irb + "'")}) and ([ActionTimeStamp]> '${utilController.getDateTime().split('T')[0]}' )`),
                await sql.query(`Select * from ${Model} where Status NOT IN ('Done') and [Research IRB]  NOT IN  (${scrubIRBs.map((irb) => "'" + irb + "'")})`),
                await sql.query(`Select * from ${Model} where Status  IN ('Review') `),

                await sql.query(`Select count(*) as count from ${Model} where  [Research IRB]  NOT IN  (${scrubIRBs.map((irb) => "'" + irb + "'")}) and ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )`),

                
                    await sql.query(`Select SUM([Sess Amount]) as count  from ${Model} where Status In ('Done')  and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)
                ,
                
                    await sql.query(`Select count(*) as count from ${Model} where Status NOT In ('Review')  and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)
                    
            ])

            let data = {
                chargesProcessedCount,
                chargesReviewCount,
                chargesReview,
                notToReview,
                inReview,
                total,
                amount,
                charges
            }

            result1 = {
                data,
                username: First,
                scrubIRBs
            }



        } else {


            const [{ recordset: chargesProcessedCount }, { recordset: chargesReviewCount }, { recordset: chargesReview }, { recordset: notToReview }, { recordset: inReview }, { recordset: total }, { recordset: amount }, { recordset: charges }] = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and UserAssigned IN ('${First}') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)`),
                await sql.query(`Select count(*) as count from ${Model} where Status  IN ('Review') and UserAssigned  IN ('${First}') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) `),
                await sql.query(`Select count(*) as count from ${Model} where Status NOT IN ('Review') and [UserAssigned] IN ('${First}') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) and [ActionTimeStamp]> '${utilController.getDateTime().split('T')[0]}'`),
                // await sql.query(`Select * from ${Model} where Status NOT IN ('Review') and UserAssigned IN ('${First}')`),
                await sql.query(`Select * from ${Model} where Status NOT IN ('Done') and UserAssigned IN ('${First}') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)`),
                await sql.query(`Select * from ${Model} where Status  IN ('Review') and [UserAssigned] = '${First}' `),
                
                await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${First}') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) and ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )`),

                    await sql.query(`Select SUM([Sess Amount]) as count from ${Model} where Status In ('Done')  and [User] IN ('${First}') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)
                 ,
                
                    await sql.query(`Select count(*) as count from ${Model} where Status NOT In ('Review')  and [User] IN ('${First}') and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]} '`)
                 

            ])


            let data = {
                chargesProcessedCount,
                chargesReviewCount,
                chargesReview,
                notToReview,
                inReview,
                total,
                amount,
                charges
            }

            result1 = {
                data,
                username: First,
                scrubIRBs

            }

        }

        io.get().then(i => {
            i.to(req.admin.EMPID).emit('WQ1075-fulllist', {data: result1})
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


endpoints.getFilters = async (req,res) => {
    try {

        const values = req.body;
        delete values['sort']

        let scrubIRBs = await getScrubs()

        let valuesQuery = "";
        for (key in values) {
          if (values[key] === "null" || values[key] === null || values[key] === undefined || values[key].length == 0) {
            continue
          } else if (values[key] == 'Do Not Scrub IRBs')  {
            valuesQuery += ` [Research IRB] IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) and ` ;
           } else if (values[key] == 'Data Collections') {
            valuesQuery += ` [Research IRB] IN (
                SELECT CONVERT(VARCHAR, IRB) from ${DTModel}
            ) and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})) )  and ` ;
           } else if (values[key] == 'Answers') {
            valuesQuery += ` [Has Answer] = 1 and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL) )  and ` ;
           }  else if (values[key] == 'Perm') {
            valuesQuery += ` [Research IRB] IN ( SELECT 
                [value] as IRB 
                FROM ${ScrubIRBMoDel} t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [No Scrub-Perm] = 'Perm') and `;
           } else if (values[key] == 'Test') {
            valuesQuery += ` [Research IRB] IN ( SELECT 
                [value] as IRB 
                FROM ${ScrubIRBMoDel} t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [No Scrub-Test] = 'Test') and `;
           } else if (values[key] == 'Non-Therapeutic') {
            valuesQuery += ` [Study Type] = 'Non-Therapeutic' and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or [Research IRB] IS NULL )  ) and ` ;
            
           } else  if(values[key] == 'Top 10 $ Amount' || values[key] == 'Top 10 Aging Days'      ) {

            valuesQuery += ` ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL )  and `;
           } else if (values[key] == '60 Days and Over' ||  values[key] == 'Under 60 Days') {
            valuesQuery += ` [Process Type] = '${values[key]}' and ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})  or [Research IRB] IS NULL )  and `;

           }   else {
        
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
          WHERE TABLE_NAME = N'WQ1075'
          `
      );
  
      columns.unshift({COLUMN_NAME: "Total"})
      columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'Total' ||column['COLUMN_NAME'] == 'Patient' || column['COLUMN_NAME'] == 'Primary Coverage' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' ||  column['COLUMN_NAME'] == 'Research IRB' )
  
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


endpoints.filters = async (req, res) => {

    try {

      const First = req.admin.First;
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
        WHERE TABLE_NAME = N'WQ1075'
        `
    );

    columns.unshift({COLUMN_NAME: "Total"})
    columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'Total' ||column['COLUMN_NAME'] == 'Patient' || column['COLUMN_NAME'] == 'Primary Coverage' || column['COLUMN_NAME'] == 'Study Status' || column['COLUMN_NAME'] == 'Study Type' ||  column['COLUMN_NAME'] == 'Research IRB' )

    let queriesToExecute = []

    let result1 = {} 
    
      if (managementAccess ) {
        //  Query the database for a list of all results
        queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))


        for(let i = 0 ;i < columns.length ;i++) {
            if(columns[i].COLUMN_NAME != "Total") {
                queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]), [Process Type], [Status] from ${Model} order by [${columns[i].COLUMN_NAME}] asc`))
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


endpoints.updatetime = async (req, res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;

        const id = values.id;// please do not update this line
        const mrn = values['Patient MRN']
        const status = values['Status']
        let Keys = values['keys']
        const ProcessType  = values['Process Type']
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

          

            let q = `update ${Model} set ${valuesQuery} where ID IN (${Keys.join(',')}) and (Status IN ('Review', 'Pending', 'Misc', 'Deferred', '') or Status IS NUll) and UserAssigned IS NOT NULL and [Process Type] = '${ProcessType}'   `
            await sql.query(q);

            let d = `update ${Model} set [Duration] = DATEDIFF(MILLISECOND, StartTimeStamp, FinishTimeStamp) where ID IN (${Keys.join(',')}) and (Status IN ('Review', 'Pending', 'Misc', 'Deferred', '') or Status IS NUll) and UserAssigned IS NOT NULL and [Process Type] = '${ProcessType}'   `
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
            
              let updateQ = `update ${ColumnModel} set ${valuesQuery} where EMPID = ${values.EMPID}`
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


module.exports = endpoints;