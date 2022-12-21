const methods = require("./crudController");
const endpoints = methods.crudController("SA_WQAudit");
var sql = require("mssql");
var sqlConnection = require('../sql')
const {getFilters} = require('../Utils/applyFilter');
const { getDateTime } = require("./utilController");
const utilController = require("./utilController");
const io = require('../socket')
var XLSX = require("xlsx");
delete endpoints["list"];
delete endpoints["update"];

const Model = "SA_WQAudit";
const ColumnModel= 'SA_WQAudit_Columns'
const Logger_Model = 'SA_WQAuditLogger'



io.get().then(i => {
  i.on('connection' , (socket) => {
      
      socket.on("PB-Audit-data", async (data)=>{

        console.log(data)
        const {recordset : result} = await sql.query(`
        SELECT  
        (
          SELECT COUNT(*) as [Total] FROM  ${Model} Where [Correct] IS NULL  and [WQ_Num] = '${data.process}'
          ) as [Total],
        (
            SELECT COUNT(*) as [Done] FROM ${Model} Where [Correct] IS NOT NULL and [WQ_Num] = '${data.process}' and CAST([ActionTimeStamp] as  Date) = '${getDateTime().split('T')[0]}'
        ) as [Done]
          
        `)


          socket.emit('on-PB-Audit-data',{
            result
          })
      })

    
  })
})


endpoints.list = async (req, res,) => {
    try {

       
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);

        let filterQuery = "";
        let sorterQuery = "";
     
       
        
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


        if( sorter.length == 0 && !filter['Correct'].value[0].includes('Yes') && sorter.filter((sort) => sort.field == "UPLOADDATETIME").length == 0) {
            
            sorter.push({
                field: "UPLOADDATETIME",
                order: "descend"  
            })      
        }

        if( sorter.length ==0 && filter['Correct'].value[0].includes('Yes') && sorter.filter((sort) => sort.field == "ActionTimeStamp").length == 0) {
            
          sorter.push({
              field: "ActionTimeStamp",
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

       
        var query = `SELECT * from ${Model} `;
        var totalQuery = `select count(*) from ${Model} `;

        if (filterQuery || sorterQuery) {
            if (filterQuery) {
                query += "WHERE  " + filterQuery + " "
                totalQuery += "WHERE  " + filterQuery + " "
            }

            if (sorterQuery) {
                query += " ORDER BY " + sq + " OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY"
            }

           
        } else {
            query += "ORDER BY [UPLOADDATETIME] Desc OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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


endpoints.filters = async (req, res) => {

    try {

        const First = req.query.user;
        const managementAccess = req.admin.ManagementCard

        let { recordset: columns } = await sql.query(
            `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'${Model}'
        `
        );

        columns = columns.filter((column) => column['COLUMN_NAME'] == 'BILLER_ANSWER' || column['COLUMN_NAME'] == 'WQ_NUM'  || column['COLUMN_NAME'] == 'IRB_APPROVAL_NUM' || column['COLUMN_NAME'] == 'DATA_COLL_IRB_FLAG' || column['COLUMN_NAME'] == 'COVERAGE' || column['COLUMN_NAME'] == 'COVERAGE_TYPE' || column['COLUMN_NAME'] == 'STUDY_TYPE' || column['COLUMN_NAME'] == 'STUDY_STATUS' || column['COLUMN_NAME'] == 'REVIEWED_USER' || column['COLUMN_NAME']  == 'IRB_APPROVAL_NUM' || column['COLUMN_NAME']  == 'IRB Reviewed' )

        let queriesToExecute = []

        let result1 = {}

            for (let i = 0; i < columns.length; i++) {
                    queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} `))
            }

            const filterResult = await Promise.all(queriesToExecute)
            let filters = (filterResult.map((result, index) => ({ column: columns[index].COLUMN_NAME, recordset: result.recordset })))

            result1 = {
                filters,
                username: First,
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


const logger = async (values) => {
    try {

        const columnsQ = "(" + Object.keys(values).toString() + ")"
    
        let valuesQuery = "";
        for (key in values) {
              if (values[key] === "null" || values[key] === null ||  values[key] == undefined || values[key] == 'undefined') {
                  valuesQuery += "NULL" + ",";
              } else {
                  valuesQuery += "'" + values[key] + "',";
              }
          }
        valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
      
        const insertQuery = `insert into ${Logger_Model} ${columnsQ} values ${valuesQuery}`
  
        await sql.query(insertQuery);
    
        
      } catch (err) {
        console.log(err)
       
      }
}




endpoints.KPI = async (req, res,) => {
  try {
      var result = {
          KPI : [],
          Total: 0
      }
    
      let [{recordset: kpi}, {recordset: total}] = await Promise.all([
          await sql.query(`
          SELECT COUNT([Correct]) from SA_WQAudit where [Correct] = 'Yes'
          UNION ALL   
          SELECT COUNT([Correct]) from SA_WQAudit where [Correct] = 'No'
          `),
          await sql.query(`SELECT COUNT(*) as count from SA_WQAudit`),

         
      ])


      result.KPI =  kpi
      result.Total = total
     
      let obj = {
          KPI: {

            correct: result.KPI[0][""],
            incorrect: result.KPI[1][""],
            total: result.KPI[1][""] + result.KPI[0][""],
              data: [
                  {
                      type: 'Correct' ,
                      value: +(result.KPI[0][""] / (result.KPI[1][""] + result.KPI[0][""]) * 100).toFixed(2),
                      count: result.KPI[0][""],
                      color: '#C5E0B4'
                  },
                  {
                    type: 'Incorrect' ,
                    value: +(result.KPI[1][""] / (result.KPI[1][""] + result.KPI[0][""]) * 100).toFixed(2),
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

// endpoints.kpi = async (req, res) => {
//     try {
        

//         await sql.query(`SELECT COUNT([Correct]) from SA_WQAudit where [Correct] = 1
//                         UNION ALL   
//                         SELECT COUNT([Correct]) from SA_WQAudit where [Correct] = 0`);
                
       
//         return res.status(200).json({
//           success: true,
//           result: {},
//           message: "Successfully get Data!",
//         });
  
//       } catch (err) {
    
//         console.log(err)
//         return res.status(500).json({
//           success: false,
//           result: null,
//           message: "Oops there is an Error",
//           error: err,
//         });
//       }
// }


endpoints.update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      values['ActionTimeStamp'] = getDateTime()
      values['User'] = req.admin.Nickname

      const id = req['params']['id'];// please do not update this line

     
      let valuesQuery = "";
      for (key in values) {
        if(values[key] == null || values[key] == 'null' || values[key] == '' || undefined) {
          valuesQuery +=  "["+ key  + "]= NULL,";
          
        } else {
          valuesQuery +=  "["+ key  + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }

      if(values['Correct'] == 'No') {
        valuesQuery += ` [Incorrect Count] = (IIF([Incorrect Count] IS NOT NULL, [Incorrect Count] , 0) + 1 )  ,`
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
      let q = (`update ${Model} set ${valuesQuery} where ID = ${id}`);
      
      await sql.query(q);
      console.log(q)
  
      logger({
        AuditID: id,
        Correct: values.Correct,
        UserName: req.admin.First,
        ActionTimeStamp: getDateTime()

      })
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


  const getObject = (obj) => {
    return obj.map((o) => {
          delete o['Charge Corrected']
          delete o['Inquiry Sent']
          delete o['Manager Comment']

        o['RSH_REV_DTTM']=  o['RSH_REV_DTTM'] ? new Date(o['RSH_REV_DTTM']).toISOString().split('.')[0].replace('T', ' ') : ''
        o['UPLOADDATETIME']=  o['UPLOADDATETIME'] ? new Date(o['UPLOADDATETIME']).toISOString().split('.')[0].replace('T', ' ') : ''

        return o
    })

}

  endpoints.exports = async (req,res) => {
    try {

        const workbook = XLSX.utils.book_new();

        let { recordset: objects1 } = await sql.query(`select * from ${Model} where WQ_Num = '5508'`)
        var worksheet = XLSX.utils.json_to_sheet(await getObject(objects1) );
        worksheet['!autofilter']={ref:"A1:AF1"};
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WQ5508');

        let { recordset: objects2 } = await sql.query(`select * from ${Model} where WQ_Num = '1075'`)
        var worksheet = XLSX.utils.json_to_sheet(await getObject(objects2) );
        worksheet['!autofilter']={ref:"A1:AF1"};
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WQ1075');

        
        


        let file = `${Model}_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

        let filename = `./public/WQ/` + file

        XLSX.writeFile(workbook, filename);
        
        return res.status(200).json({
            success: true,
            result: {
                name: file,
                file: 'https://' + (process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file)
            },
            message: "Successfully exports",
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

module.exports = endpoints