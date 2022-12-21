const methods = require("./crudController");
const endpoints = methods.crudController("WQ1262Logger");
const utilController = require('./utilController');
const writeXlsxFile = require('write-excel-file/node')

var sql = require("mssql");

const Model = "WQ1262Logger";
delete endpoints["update"];
delete endpoints['list'];

endpoints.create = async (req, res) => {
    try {
        const values = req.body;
        values.UserName = req.admin.First;
        values.DateTime = utilController.getDateTime()
        values.EMPID = req.admin.EMPID


        if (typeof values.IDWQ1262 == 'number') {
            const columnsQ = "(" + Object.keys(values).toString() + ")"

            let valuesQuery = "";
            for (key in values) {
                if (values[key] === "null") {
                    valuesQuery += "NULL" + ",";
                } else {
                    valuesQuery += "'" + values[key] + "',";
                }
            }
            valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

            const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

            await sql.query(insertQuery);

            return res.status(200).json({
                success: true,
                result: {},
                message: "Success",
            });
        } else {
            const columnsQ = "(" + Object.keys(values).toString() + ")"

            let ids = values.IDWQ1262;


            for (let i = 0; i < ids.length; i++) {
                let valuesQuery = "";
                for (key in values) {
                    if (values[key] === "null") {
                        valuesQuery += "NULL" + ",";
                    } else if (key == 'IDWQ1262') {
                        valuesQuery += "'" + values[key][i] + "',";

                    } else {

                        valuesQuery += "'" + values[key] + "',";
                    }
                }
                valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


                const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
                await sql.query(insertQuery);

            }


            return res.status(200).json({
                success: true,
                result: {},
                message: "Success",
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


        const { recordset: result } = await sql.query(`select Distinct (MRN), Status from ${Model}`)

        return res.status(200).json({
            success: true,
            result: result,
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


endpoints.fullList = async (req, res,) => {
    try {


        const { recordset: result } = await sql.query(`select * from ${Model} where DateTime < CURRENT_TIMESTAMP and Datetime > DATEADD(Year, -1, CURRENT_TIMESTAMP)`)

        return res.status(200).json({
            success: true,
            result: result,
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

endpoints.list = async (req, res,) => {
    try {


        var page = req.query.page || 1;
        var filter = JSON.parse(req.query.filter);
        var sorter = JSON.parse(req.query.sorter);

        var top10 = false;

        let filterQuery = "";
        let sorterQuery = "";

        for (key in filter) {
            if (filter[key]) {

                switch (key) {
                    case "Status": {
                        let values = filter[key];

                        if (values.indexOf('') > -1) {
                            values.push('')
                            valueQuery = values.map(v => ("'" + v + "'"))
                            filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ") or " : "";
                            filterQuery += '[Status] IS NULL) and '

                        } else {

                            valueQuery = values.map(v => ("'" + v + "'"))
                            if (values.length > 0) {
                                filterQuery += +filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                            }
                        }

                        break
                    }
                    case "UserName": {
                        let values = filter[key];
                        valueQuery = values.map(v => {
                            return ("'" + v + "'")
                        })

                        if (valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                        }

                        break
                    }

                    case "MRN": {
                        let values = filter[key];
                        valueQuery = values.map(v => {
                            return ("'" + v + "'")
                        })

                        if (valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                        }

                        break
                    }


                    case "Process Type": {
                        let values = filter[key];

                        valueQuery = values.map(v => {
                            return ("'" + v + "'")
                        })

                        if (valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                        }


                        break
                    }
                    case "Notes": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery += key + " NOT IN ( '' )  and "
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "(" + key + " IN ( '' ) or Notes IS NULL) and ";
                        }
                        break;
                    }


                    case "Error": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery += key + " NOT IN ( '' )  and "
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "(" + key + " IN ( '' ) or Error IS NULL) and ";
                        }
                        break;
                    }


                    default: {
                        filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
                        break
                    }
                }
            }
        }

        filterQuery = filterQuery.slice(0, -4);

        if (sorter.filter.length == 1 && sorter.filter((sort) => sort.field == "DateTime").length == 0) {
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

        if (filterQuery || sorterQuery) {
            if (filterQuery) {
                query += "where " + filterQuery + " "
                totalQuery += "where " + filterQuery + " "
            }

            if (sorterQuery) {
                query += " ORDER BY " + sq + "  "
            }

            if (top10) {
                query += "OFFSET  0  ROWS FETCH NEXT 10 ROWS ONLY "
            }

        } else {
            query += " ORDER BY ID ASC OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
        }


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


endpoints.exports = async (req, res) => {
    try {
    
        const schema = [
            {
                column: 'IDWQ1262Logger',
                type: String,
                value: wq => wq['IDWQ1262Logger'] ? wq['IDWQ1262Logger'].toString() : ''
            },
            {
                column: 'IDWQ1262',
                type: String,
                value: wq => wq['IDWQ1262'] ? wq['IDWQ1262'].toString() : ''
            },
            {
                column: 'UserName',
                type: String,
                value: wq => wq['UserName'] ? wq['UserName'].toString() :  ''
            },
            {
                column: 'Color',
                type: String,
                value: wq => wq['Color'] ? wq['Color'].toString() : ''
            },
            {
                column: 'MRN',
                type: String,
                value: wq => wq.MRN ? wq.MRN.toString() : ''
            },
            
            {
                column: 'Status',
                type: String,
                value: wq => wq['Status'] ? wq['Status'].toString() : ''
            },
  
            {
                column: 'DateTime',
                type: String,
                value: wq => wq['DateTime'] ? wq['DateTime'].toString() : '' 
            },
               
          ]


          let {recordset: objects1} = await sql.query(`select * from ${Model}`)
          
          objects1 = objects1.map((o) => {

            return  {
                'IDWQ1262Logger': o['IDWQ1262Logger'] ? o['IDWQ1262Logger'] .toString() : '',
                'IDWQ1262': o['IDWQ1262'] ? o['IDWQ1262'] .toString() : '',
                'UserName': o['UserName'] ? o['UserName'] .toString() : '',
                'Color': o['Color'] ? o['Color'] .toString() : '',
                'MRN': o['MRN'] ? o['MRN'] .toString() : '',
                'Status': o['Status'] ? o['Status'] .toString() : '',
                'DateTime': o['DateTime'] ? o['DateTime'].toISOString().replace('.480Z', '').replace('.000Z', '') .toString() : '',
                
            }
          })

          
          let file = `WQ1262Logger_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '.').replace(/.480Z/g, '')}.xlsx`

          file = file.replace(/.0Z/g, '')

          let filename = `./public/WQ/` + file

          await writeXlsxFile(objects1, {
            schema: schema,
            filePath: filename
          })
          
          return res.status(200).json({
            success: true,
            result: {
                name: file,
                file:  'https://' +(process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file )
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
};

module.exports = endpoints;


