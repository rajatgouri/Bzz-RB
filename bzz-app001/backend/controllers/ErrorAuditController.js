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


const PBModel = "SA_WQAudit";
const HBModel = "SA_HB_WQAudit";


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

       

        sorter.map((sort) => {
            sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
        })


        let sq = sorterQuery.slice(0, -1)

        const limit = parseInt(req.body.items) || 100;
        const skip = page * limit - limit;

        var recordset;

       
        var query = `
        SELECT [Research IRB] ,  [Section], WQ , SUM([Incorrect Count])  [Incorrect Count] from  (
            SELECT [IRB Reviewed] as [Research IRB], [Incorrect Count] , 'HB' as Section , '1262'as  WQ FROM SA_HB_WQAudit WHERE [IRB Reviewed] IS NOT NULL and [Incorrect Count] IS NOT NULL
            UNION ALL
            SELECT [IRB Reviewed] as [Research IRB], [Incorrect Count] , 'PB' as Section, WQ_NUM as WQ  FROM SA_WQAudit WHERE [IRB Reviewed] IS NOT NULL and [Incorrect Count] IS NOT NULL
            ) as A
			GROUP BY [Research IRB] ,  [Section], WQ



        `;
        var totalQuery = `
        SELECT COUNT(*) from (
            SELECT [Research IRB] ,  [Section], WQ , SUM([Incorrect Count])  [Incorrect Count] from  (
                       SELECT [IRB Reviewed] as [Research IRB], [Incorrect Count] , 'HB' as Section , '1262'as  WQ FROM SA_HB_WQAudit WHERE [IRB Reviewed] IS NOT NULL and [Incorrect Count] IS NOT NULL
                       UNION ALL
                       SELECT [IRB Reviewed] as [Research IRB], [Incorrect Count] , 'PB' as Section, WQ_NUM as WQ  FROM SA_WQAudit WHERE [IRB Reviewed] IS NOT NULL and [Incorrect Count] IS NOT NULL
                       ) as A
                       GROUP BY [Research IRB] ,  [Section], WQ
           
                       ) as B
           
        `;

        if (filterQuery || sorterQuery) {
            if (filterQuery) {
                query += "WHERE  " + filterQuery + " "
                totalQuery += "WHERE  " + filterQuery + " "
            }

            if (sorterQuery) {
                query += " ORDER BY " + sq + " OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY"
            }

           
        } else {
            query += "ORDER BY [Research IRB] Desc OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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




endpoints.update = async (req,res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;

      const id = req['params']['id'];// please do not update this line

     
      let valuesQuery = "";
      for (key in values) {
        if(values[key] == null) {
          valuesQuery +=  "["+ key  + "]= NULL,";
          
        } else {
          valuesQuery +=  "["+ key  + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }

      if(values['Correct'] == 0) {
        valuesQuery += ` [Incorrect Count] = (IIF([Incorrect Count] IS NOT NULL, [Incorrect Count] , 0) + 1 )  ,`
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
      let q = (`update ${Model} set ${valuesQuery} where ID = ${id}`);
      
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

module.exports = endpoints