var officegen = require('officegen');
var docx = officegen ( 'docx' );
const fs = require('fs')
const sql = require('mssql');

const endpoints = {}



const getObject = (object) => {
    return new Promise((resolve, reject) => {
        let obj = []
        object.map((o, i) => {
           obj.push (Object.values(o))

           if (obj.length == object.length) {
               resolve(obj)
           }
        })
    })
}

// endpoints.create = async (Model) => {
//     try {


//         let {recordset: columns} = await sql.query(
//             `
//             SELECT COLUMN_NAME
//             FROM INFORMATION_SCHEMA.COLUMNS
//             WHERE TABLE_NAME = N'${Model}'
//             `
//         );

//         columns = columns.map((item) => {
//             return {
//                 val: item['COLUMN_NAME'],
//                 opts: {
//                     sz: '16',
//                     b:true,
//                     cellColWidth: 42,
//                     shd:
//                      {

//                         fill: "000000",
//                         themeFill: "text1",
//                         "themeFillTint": "80"
//                     },
//                 }
//             }
//         })
    
//         var table = [

//             columns,
            
//         ]
        
           
//         const {recordset: result} = await sql.query(`SELECT * from ${Model}`)

//         console.log(result)

//         let x = await  getObject(result)

//         table = table.concat(x)
//         console.log(table)
         
//         var tableStyle = {
//             tableColWidth: 20,
//             tableSize: 14,
//             tableAlign: "left",

//         }
         
//         docx.createTable (table, tableStyle);
//         console.log('hiiiiiiiiiiiiiiiiiiiiiiiiiiii')

//         var out = fs.createWriteStream ( 'out.docx' );
 
// docx.generate ( out );
// out.on ( 'close', function () {
//     console.log ( 'Finished to create the PPTX file!' );
// });
     
//     } catch (err) {
//      console.log(err)
//     }
//   };




  module.exports = endpoints