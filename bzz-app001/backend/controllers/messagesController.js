const methods = require("./crudController");
const endpoints = methods.crudController("[COHTEAMS].[dbo].[Messages]");
const {getDateTime} = require('./utilController');

var sql = require("mssql");

const Model = "[COHTEAMS].[dbo].[Messages]";
delete endpoints["update"];
delete endpoints['list'];

endpoints.create = async (req, res) => {
    try {
        const values = req.body;
        values.UploadDateTime = getDateTime()


        const columnsQ = "(" + Object.keys(values).toString() + ")"

            let valuesQuery = "";
            for (key in values) {
                if (values[key] === "null" || values[key] === null || values[key] === "") {
                valuesQuery += "NULL" + ",";
                } else {
                valuesQuery += "'" + values[key] + "',";
                }
            }
            valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


            const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
            await sql.query(insertQuery)

            return res.status(200).json({
                success: true,
                result: {},
                message: "Success",
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



endpoints.list = async (req, res,) => {
    try {


        var page = req.query.Page  || 0;
        var ChatID = req.query.Chat ;

        // console.log(`SELECT * FROM ${Model} Where [Chat] = '${ChatID}' ORDER BY UploadDateTime  OFFSET ${page}  ROWS FETCH NEXT  10 ROWS ONLY`)

       let {recordset} =  await  sql.query(`SELECT * FROM ${Model} Where [Chat] = '${ChatID}' ORDER BY UploadDateTime desc  OFFSET ${page}  ROWS FETCH NEXT  10 ROWS ONLY`)

        return res.status(200).json({
            success: true,
            result: recordset,
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


