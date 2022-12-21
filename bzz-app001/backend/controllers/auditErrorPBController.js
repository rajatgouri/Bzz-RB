const methods = require("./crudController");
const endpoints = methods.crudController("SA_WQAudit");
var sql = require("mssql");
var sqlConnection = require('../sql')
const {getFilters} = require('../Utils/applyFilter');
const { getDateTime } = require("./utilController");
const utilController = require("./utilController");

var XLSX = require("xlsx");


delete endpoints["list"];
delete endpoints["update"];


const PbModel = "SA_WQAudit";
const PbColumnModel= 'SA_PB_AuditError_Columns'


const HbModel = "SA_HB_WQAudit";
const HbColumnModel= 'SA_HB_AuditError_Columns'

endpoints.list = async (req, res,) => {
    try {

       
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);

        let filterQuery = "";
        let sorterQuery = "";
     
        let process = filter['process']['value'][0]
        delete filter['process']
      filter['Correct'] = {value: ['No'] , type: 'filter'}
       
        
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


        if( sorter.filter.length ==1 && !filter['Correct'].value[0].includes('Yes') && sorter.filter((sort) => sort.field == "UPLOADDATETIME").length == 0) {
            
            sorter.push({
                field: "UPLOADDATETIME",
                order: "descend"  
            })      
        }

        if( sorter.filter.length ==1 && filter['Correct'].value[0].includes('Yes') && sorter.filter((sort) => sort.field == "ActionTimeStamp").length == 0) {
            
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

       
        var query = `SELECT * from ${process == 'PB' ? PbModel : HbModel} `;
        var totalQuery = `select count(*) from ${process == 'PB' ? PbModel : HbModel} `;

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


endpoints.filters = async (req, res) => {

    try {

        const First = req.query.user;
        const managementAccess = req.admin.ManagementCard

        const  {process} = (req.query)

        let { recordset: columns } = await sql.query(
            `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'${ process == 'PB'  ? PbModel: HbModel}'
        `
        );

        if(process == 'PB') {
          columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'WQ_NUM'  ||  column['COLUMN_NAME'] == 'REVIEWED_USER' || column['COLUMN_NAME']  == 'IRB Reviewed' )
        } else {
          columns = columns.filter((column) =>  column['COLUMN_NAME'] == 'User Reviewed' ||  column['COLUMN_NAME'] == 'MRN' ||   column['COLUMN_NAME'] == 'HAR' ||   column['COLUMN_NAME'] == 'IRB Reviewed')

        }

        let queriesToExecute = []

        let result1 = {}

            for (let i = 0; i < columns.length; i++) {
                    queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${process == 'PB' ? PbModel : HbModel}  Where [Correct] = 'No' `))
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



endpoints.update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      let process = req.body.process
      console.log(process)
      delete values['process']

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
      let q = (`update ${process == 'PB' ? PbModel: HbModel} set ${valuesQuery} where ID = ${id}`);
      
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


 




endpoints.columns = async (req,res) => {
    try {

       
        const {id, process} = req.query

        delete req.query.process
        let model = process == 'PB' ? PbColumnModel : HbColumnModel
        let {recordset: columns} = await sql.query(
          `
          SELECT * from ${model} where EMPID = ${id}
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
        let model = values.process == 'PB'? PbColumnModel : HbColumnModel
        delete values['process']
       values.EMPID = req.admin.EMPID
            const {recordset: exists } = await sql.query(`SELECT * from ${model} where EMPID = '${values.EMPID}'`)

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
            
              let updateQ = `update ${model} set ${valuesQuery} where EMPID = ${values.EMPID}`
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
              
                const insertQuery = `insert into ${model} ${columnsQ} values ${valuesQuery}`
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



const getObject = (obj) => {
  return obj.map((o) => {
       

      o['RSH_REV_DTTM']=  o['RSH_REV_DTTM'] ? new Date(o['RSH_REV_DTTM']).toISOString().split('.')[0].replace('T', ' ') : ''
      o['UPLOADDATETIME']=  o['UPLOADDATETIME'] ? new Date(o['UPLOADDATETIME']).toISOString().split('.')[0].replace('T', ' ') : ''

      return o
  })

}

endpoints.exports = async (req,res) => {
  try {

      const workbook = XLSX.utils.book_new();

      let { recordset: objects1 } = await sql.query(`select * from ${PbModel}`)
      var worksheet = XLSX.utils.json_to_sheet(await getObject(objects1) );
      worksheet['!autofilter']={ref:"A1:AI1"};
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PB');

      let { recordset: objects2 } = await sql.query(`select * from ${HbModel} `)
      var worksheet = XLSX.utils.json_to_sheet(await getObject(objects2) );
      worksheet['!autofilter']={ref:"A1:AF1"};
      XLSX.utils.book_append_sheet(workbook, worksheet, 'HB');

      
  
      let file = `SA_Audit_Errors_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

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

module.exports = endpoints