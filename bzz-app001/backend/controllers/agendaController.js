var sql = require("mssql");
const { Promise } = require("xlsx-populate/lib/externals");
const methods = require("./crudController");
const endpoints = methods.crudController("Agenda");
const WordController = require('./wordController');
const utilController = require('./utilController')
const {getDateTime} = require('./utilController')

var XLSX = require("xlsx");


delete endpoints["list"];
delete endpoints["update"];
const Model = "Agenda";
const Logger_Model = "AgendaLogger";



endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;
    const order = req.query.order || "DESC";
    // const filter = req.query.filter || "New";

    var filter = JSON.parse(req.query.filter);
    var sorter = JSON.parse(req.query.sorter);


    let filterQuery = "";
    for (key in filter) {
      if (filter[key]) {

        switch (key) {
          case "IRB": {
            let values = filter[key];
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and" : "";
            break
          }
          case "Notes": {

            let values = filter[key];
            if (values.length < 2 && values[0] == 0) {
                filterQuery += "(Convert(varchar, " +key + ") NOT IN ( '' )) and " 
            } else if ((values.length < 2 && values[0] == 1)) {
                filterQuery += "(Convert(varchar, " +key + ") IN ( '' ) or (Convert(varchar, " +key + ") IS NULL  )) and " ;
            } 
            break;
          } 


          

          case "CTSS Notes": {

            let values = filter[key];
            if (values.length < 2 && values[0] == 0) {
                filterQuery += "(Convert(varchar, [" +key + "]) NOT IN ( '' )) and " 
            } else if ((values.length < 2 && values[0] == 1)) {
                filterQuery += "(Convert(varchar, [" +key + "]) IN ( '' ) or (Convert(varchar, [" +key + "]) IS NULL  )) and " ;
            } 
            break;
          } 

          case "Workaround": {

            let values = filter[key];
            if (values.length < 2 && values[0] == 1) {
                filterQuery += "(Convert(varchar, " +key + ") NOT IN ( '' )) and " 
            } else if ((values.length < 2 && values[0] == 0)) {
                filterQuery += "(Convert(varchar, " +key + ") IN ( '' ) or (Convert(varchar, " +key + ") IS NULL  )) and " ;
            } 
            break;
          } 

          case "REVIEWER" :
          case "No Scrub-Perm" :
          case "No Scrub-Test":

           {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1 || values.indexOf("null") > -1) {
                filterQuery +=  "(Convert(varchar,["+ key + "]) IN (" + valueQuery + ") or  Convert(varchar,["+ key + "]) IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }

         

          case "SCRUB STATUS" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf("null") > -1) {
                filterQuery +=  "(Convert(varchar,"+ "[" + key + "]) IN (" + valueQuery + ") or  Convert(varchar,["+ key + "]) IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar, ["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }

          case "Status" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,"+ key + ") IN (" + valueQuery + ") or  Convert(varchar,"+ key + ") IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,"+ key + ") IN (" + valueQuery + ") and " : "";

              }
            break
          }

          case "CTSS Status" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,["+ key + "]) IN (" + valueQuery + ") or  Convert(varchar,["+ key + "]) IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }

          case "IRB Budget Status" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,["+ key + "]) IN (" + valueQuery + ") or  Convert(varchar,["+ key + "]) IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }



          case "Data Collection" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,["+ key + "]) IN (" + valueQuery + ") or  Convert(varchar,["+ key + "]) IS NUll ) and " 

              } else {
                filterQuery += +filter[key] !== null ? "Convert(varchar,["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }

          case "No PCC Study" : {
            let values = filter[key];

              valueQuery = values.map(v => ("'" + v + "'"));

              if (values.indexOf(null) > -1) {
                filterQuery +=  "(Convert(varchar,"+ key + ") IN (" + valueQuery + ") or  Convert(varchar, ["+  key + "]) IS NUll ) and " 

              } else {
                filterQuery += + filter[key] !== null ? "Convert(varchar,["+ key + "]) IN (" + valueQuery + ") and " : "";

              }
            break
          }


          
          default: {
            filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
            break
          }
        }
      }
    }
    filterQuery = filterQuery.slice(0, -4);
    let sorterQuery = "";
    
    sorter.map((sort) => {
      sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })


    let sq = sorterQuery.slice(0, -1)
    var query = `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo,  * from ${Model}  `;
    var totalQuery = `select count(*) from ${Model}  `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += "where " + filterQuery + " "
        totalQuery += "where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " "
      } else {
        query += " ORDER BY ID" 
      }

    } else {
      query += "ORDER BY [IRB], [ID] DESC OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
    }


    var recordset;
    var arr;

    const { recordset: result } = await sql.query(query);
    recordset = result;
    const { recordset: coun } = await sql.query(totalQuery);
    arr = coun
   
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);
    const filters = filter;
    const sorters = sorter

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
     filter,
     sorter,
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

endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
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
  
    let updateQ = `update ${Model} set ${valuesQuery} where ID = ${id}`
    await sql.query(updateQ);

    logger({
      AgendaID : (id),
      UserName: req.admin.First,
      Status : 'Update',
      ActionTimeStamp: getDateTime()
    })


    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this id: " + req.params.id,
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


const logger = async (values) => {

  
  const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"

  let valuesQuery = "";
  for (key in values) {
    if (values[key] === "null" || values[key] === ""  || values[key] === null) {
      valuesQuery += "NULL" + ",";
    } else {
      valuesQuery += "'" + values[key] + "',";
    }
  }
  valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


  const insertQuery = `insert into ${Logger_Model} ${columnsQ} values ${valuesQuery}`
  await sql.query(insertQuery);
}

endpoints.create = async (req, res) => {
  try {
    const values = req.body;

    const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


    let valuesQuery = "";
    for (key in values) {
          if (values[key] === "null" || values[key] === null || values[key] === "") {
              valuesQuery += "NULL" + ",";
          } else {
              valuesQuery += "'" + values[key] + "',";
          }
      }
    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
  
    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

    await sql.query(insertQuery);

    let selectQuery = `SELECT ID from ${Model} ORDER BY ID Desc OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`
    let {recordset: result} = await sql.query(selectQuery);
    
    logger({
      AgendaID : (result[0].ID),
      UserName: req.admin.First,
      Status : 'Insert',
      ActionTimeStamp: getDateTime()
    })


    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
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




endpoints.filters = async (req, res) => {
  try {
    
   

    const [{recordset: IRB},{recordset: REVIEWER},{recordset: Status},{recordset: NoPCCStudy},{recordset: DataCollection},{recordset: CTSSStatus},{recordset: IRBBudgetStatus}] = await Promise.all([
      await sql.query(`SELECT DISTINCT(IRB) from ${Model}`),
      await sql.query(`SELECT DISTINCT(REVIEWER) from ${Model}`),
      await sql.query(`SELECT DISTINCT(Status) from ${Model}`),
      await sql.query(`SELECT DISTINCT([No PCC Study]) from ${Model}`),
      await sql.query(`SELECT DISTINCT([Data Collection]) from ${Model}`),
      await sql.query(`SELECT DISTINCT([CTSS Status]) from ${Model} order by [CTSS Status] desc` ),
      await sql.query(`SELECT DISTINCT([IRB Budget Status]) from ${Model} order by [IRB Budget Status] desc` ),




    ])


    let result = {
      IRB,
      REVIEWER,
      Status,
      'No PCC Study': NoPCCStudy,
      'Data Collection': DataCollection,
      'CTSS Status':CTSSStatus,
      'IRB Budget Status': IRBBudgetStatus
    }

    return res.status(200).json({
      success: true,
      result: result,
      message: "successfully Fetch filters"
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



endpoints.exports = async (req,res) => {
  try {

      const workbook = XLSX.utils.book_new();

      let { recordset: objects1 } = await sql.query(`select * from ${Model}`)
      var worksheet = XLSX.utils.json_to_sheet((objects1) );
      worksheet['!autofilter']={ref:"A1:J1"};
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      
    
      let file = `Agenda_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

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


module.exports = endpoints;
