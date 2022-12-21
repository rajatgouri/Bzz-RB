const methods = require("./crudController");
const endpoints = methods.crudController("[HIMS].[dbo].[IntakeRequest]");
var sql = require("mssql");

const modal = '[HIMS].[dbo].[IntakeRequest]'
delete endpoints["update"];
delete endpoints['list'];

const {getFilters} = require('../Utils/applyFilter');
const { getDateTime } = require("./utilController");
const mailer = require("./mailController");
const { logo } = require("../Utils/logo");




endpoints.list = async (req, res) => {
  try {
    const page = req.body.page || 1;

    const limit = parseInt(req.body.items) || 50;
    const skip = page * limit - limit;
    const order = req.body.order || "DESC";

    var filter = (req.body.filter);
    var sorter = (req.body.sorter);

    let filterQuery = "";
    
    const customSwitch = []
    for ( f in filter) {
        let {value, type} = filter[f]
        if (value && value.length > 0 ) {
            customSwitch.push({
                condition: f,
                value: value,
                type: type
            })
        }
        
    }
    filterQuery = await getFilters(filter, customSwitch)
    filterQuery = filterQuery.slice(0, -4);
    
    let sorterQuery = "";
    sorter.map((sort) => {
      let k = sort.field
     
      sorterQuery += `[${k}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
  })

  
    let sq = sorterQuery.slice(0, -1)


    var query = `
        SELECT * from ${modal}
        `;
     var totalQuery = `
    SELECT COUNT(*) from ${modal}
      

     `;

    if (filterQuery || sorterQuery) {
      if (filterQuery) {
        query += " where " + filterQuery + " "
        totalQuery += " where " + filterQuery + " "
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
      } else {
        query += ` ORDER BY  [UploadDateTime] Desc OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY"  
      }

    } else {
      query += `ORDER BY  [UploadDateTime] Desc  OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
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


endpoints.filters = async (req, res) => {

  try {

    const [ {recordset: Section}, {recordset: Requester}, {recordset: Assignee}, {recordset: Status}, {recordset: Priority}] = await Promise.all([
    
     await sql.query(`
        SELECT DISTINCT([Section]) as Dept FROM [COHTEAMS].[dbo].[COH_MasterStaff_PSoft]
    `),
    await sql.query(`
        SELECT DISTINCT([Requester]) FROM ${modal}
    `),
    await sql.query(`
    SELECT [Nickname] as Assignee from JWT where Nickname IN (
        'Mai',
        'Raj',
        'Aabid',
        'Jason'
        )
    `),
    await sql.query(`
    SELECT DISTINCT([Status]) from ${modal}
    `),
    await sql.query(`
    SELECT DISTINCT([Priority]) from ${modal}
    `)


    

    ])

    let obj = [
    { column: 'Dept', recordset: Section },
    { column: 'Requester', recordset: Requester },
    { column: 'Assignee', recordset: Assignee },
    { column: 'Status', recordset: Status },
    { column: 'Priority', recordset: Priority },


    ]

    
      return res.status(200).json({
          success: true,
          // result: recordset,
          result: obj,
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

endpoints.delete = async (req, res) => {
    let { id } = req.params;
  
    try {
  
      const deleteQuery = `Delete from ${modal} where ID= ${id}`;
      await sql.query(deleteQuery);
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });
  
    } catch (e) {
        console.log(e)
      return res
        .status(500)
        .json({ success: false, message: `Error in deleting the user where id = ${id}` });
    }
  };


endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      values.UploadDateTime = getDateTime()
      values.Requester = req.admin.Nickname
      let email = (req.admin.Email)


  const columnsQ = "(" + Object.keys(values).map((d)=> `[${d}]`).toString() + ")"

  
      let valuesQuery = "";
      for (key in values) {
            if (values[key] === "null" || values[key] == null || values[key] == "" ) {
                valuesQuery += "NULL" + ",";
            } else {
                valuesQuery += "'" + values[key].toString().replace(/'/g, "''") + "',";
            }
        }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
    
      const insertQuery = `insert into ${modal} ${columnsQ} values ${valuesQuery}`
  
      await sql.query(insertQuery);


        if (process.env.NODE_ENV != "development") {
      mailer(
        'abeauvois@coh.org',

        [email, 'jaing@coh.org', 'mdeksne@coh.org', 'apeerzade@coh.org'],
        
        `Intake Request Submitted!`,
        `
        <h2>Greetings ${req.admin.Nickname}!</h2>
        <p>Your intake request was submitted.<br><br>
        
        <a href="https://10.30.142.17:8010/governance">https://10.30.142.17:8010/governance</a><br><br>

        Thank you, <br><br><br>

        HIMS Business Solutions <br>
        Automated Notification <br><br>

        ${logo}

        `
      )
      }
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
  

  
endpoints.update = async (req, res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      const { id } = req.params;
      let valuesQuery = "";
      for (key in values) {
        if (values[key] === "null" || values[key] === "" || values[key] === null) {
          valuesQuery +=  "["+ key + "]= NULL" + ",";
        } else {
          valuesQuery += "[" + key + "]='" + values[key].toString().replace(/'/g, "''") + "',";
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
  
      await sql.query(`update ${modal} set ${valuesQuery}  where ID = '${id}'`);
  
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this id: " + req.params.id,
      });
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
  

