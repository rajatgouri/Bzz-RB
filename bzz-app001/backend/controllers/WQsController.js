

var sql = require("mssql");
const methods = require("./crudController");
const { getDateTime } = require("./utilController");
const ScrubIRBMoDel = 'Agenda';
const DTModel = 'DataCollection'



exports.WQDailyData = async (req,res) => {

  try {

      var {processType:  model, user , dates} = req.query;
        var query = ''

        
        if (dates) {
          dates = (JSON.parse(dates).filter((d) => d != ''))
          
      }
        

      
        if (dates && dates.length > 0) {
          query =`
          


          SELECT j.Nickname  , x.[Date],  isnull(x.Cnt, 0) Cnt
          from JWT J WITH (NOLOCK)
          left join (
          SELECT [User],  CAST ([ActionTimeStamp] as Date) [Date] , COUNT(*) CNT
          from ${model}
          WHERE 
         [ActionTimeStamp] IS NOT NULL
          and [StartTimeStamp] IS NULL 
          and [User] = '${user}'

              and [Status] = 'Done'
              GROUP BY [User],  CAST ([ActionTimeStamp] as Date)
              ) x on j.Nickname = x.[User] 
              where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
			  and x.[Date] between FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as datetime),'yyyy-MM-dd')
        order by [Date] desc


          `

      } else {
          query = `
          SELECT j.Nickname  , x.[Date],  isnull(x.Cnt, 0) Cnt
          from JWT J WITH (NOLOCK)
          left join (
          SELECT [User],  CAST ([ActionTimeStamp] as Date) [Date] , COUNT(*) CNT
          from ${model}
          WHERE 
         [ActionTimeStamp] IS NOT NULL
          and [StartTimeStamp] IS NULL 
          and [User] = '${user}'

              and [Status] = 'Done'
              GROUP BY [User],  CAST ([ActionTimeStamp] as Date)
              ) x on j.Nickname = x.[User] 
              where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
			  and x.[Date] >= DATEADD(Month, -1, CAST(CURRENT_TIMESTAMP as Date))
        order by [Date] desc

          
           `;
      }
  

        let {recordset: result} = await sql.query(query)
  
      
       result =  (result.map(r => {
          return  {
            'User': r.Date ? r.Date.toISOString().split('T')[0] : 0,
            'value': r['Cnt']
          }
        }))
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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







exports.WQEntireData = async (req,res) => {

  try {

      var {processType:  model, user , dates} = req.query;
        var query = ''

        if (dates) {
            dates = (JSON.parse(dates).filter((d) => d != ''))
            
        }

       
            query = `
           
	  
            SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
            from JWT J WITH (NOLOCK)
            left join (
            SELECT [User] [User] , COUNT(*) CNT
            from ${model}
            WHERE 
             [ActionTimeStamp] IS NOT NULL and [StartTimeStamp] IS NULL and [Status] = 'Done' 
            GROUP BY [User]
            ) x on j.Nickname = x.[User] 
            where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
             `;
  

        let {recordset: result} = await sql.query(query)
  
       


       result =  (result.map(r => {
          return  {
            'User': r['Nickname'],
            'value': r['Cnt']
          }
        }))
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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


exports.getScrubs = async() => {
  
  const {recordset: result1} = await sql.query(`
  SELECT 
   [value] as IRB 
  FROM ${ScrubIRBMoDel} t1
  CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
  where [SCRUB STATUS] = '0'
`)
  return  (result1.map((i) => i.IRB ))
}

exports.WQ1075Filters  = async (filter, limitTop10)  => {

  try {

  let filterQuery = ""
  let sorterQuery = ""

  let scrubIRBs = await this.getScrubs()

  console.log(scrubIRBs)

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

             {
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
                    
                } else if (values[0] == 'Data Collections') {
                    filterQuery += `ID >= 0 and [Research IRB] IN (
                        SELECT CONVERT(VARCHAR, IRB) from ${DTModel}
                    ) and (([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")})) )  and ` ;
                    
                } else if (values[0] == 'Perm') {
                    filterQuery += `ID >= 0 and [Research IRB] IN ( SELECT 
                        [value] as IRB 
                        FROM ${ScrubIRBMoDel} t1
                        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                        where [No Scrub-Perm] = 'Perm') and `;
                    
                }  else if (values[0] == 'Test') {
                    filterQuery += `ID >= 0 and [Research IRB] IN ( SELECT 
                        [value] as IRB 
                        FROM ${ScrubIRBMoDel} t1
                        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                        where [No Scrub-Test] = 'Test') and `;
                    
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

           

             
      
            case "Notes":
            case "Error": {

                let values = filter[key];
                if (values.length < 2 && values[0] == 0) {
                    filterQuery += "["+ key + "] NOT IN ( '' )  and " 
                } else if ((values.length < 2 && values[0] == 1)) {
                    filterQuery += "(["+ key + "] IN ( '' ) or ["+key + "]  IS NULL) and " ;
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

return {
  filterQuery,
  sorterQuery
}

} catch (err) {
  console.log(err)
  return {
    filterQuery : "",
    sorterQuery : ""
  }
}

}