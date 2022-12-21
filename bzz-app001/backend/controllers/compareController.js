const methods = require("./crudController");
const endpoints = methods.crudController("WQ1075");
var sql = require("mssql");
const utilController = require('./utilController');
const adminContoller = require('../controllers/adminController')
const path = require('path')
const fs = require('fs');

const { getDateTime } = require('./utilController');
const writeXlsxFile = require('write-excel-file/node')
const dir = path.join("./loader");
const XlsxPopulate = require('xlsx-populate');
const { resolve } = require("path");
const { exec } = require("child_process");

const moment = require('moment-timezone');

delete endpoints["list"];
const Model = "WQ1075";
const JWT = 'JWT'

function ExcelDateToJSDate(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = (utc_days * 86400 ) ;                                         
    var date_info = new Date((utc_value ) * 1000);
    return (date_info.toISOString().split('T')[0])
  }
  

//   setTimeout(() => {
//     XlsxPopulate.fromFileAsync('HB_2ND.xlsx', )
//     .then(async (workbook) => {
//         let rows = workbook.sheets()[0]._rows
//         rows = (rows.map((row, i) => row._cells.map((cell) => cell._value)))
//         let dataToProcess  =rows.filter((e, i) => i > 1)
//         XlsxPopulate.fromFileAsync('HB_IST.xlsx')
//         .then(async (workbook) => {
//             let rows1 = workbook.sheets()[0]._rows
//             rows1 = (rows1.map((row, i) => row._cells.map((cell) => cell._value)))
//            let entries =rows1.filter((e, i) => i > 1)
//             dataToProcess = dataToProcess.filter((arr, index, self) => {
//                 let i = entries.findIndex((t) =>  {
//                 //    console.log(new Date(t[1]).toISOString().split('T')[0])
//                 //    console.log(ExcelDateToJSDate(arr[2]))
//                     let match =  (
//                         t[1] == arr[1] &&
//                         t[2] == arr[2] &&
//                         t[3] == arr[3] &&
//                         t[4] == arr[4] &&
//                         t[5] == arr[5] &&
//                         t[6] == arr[6] &&
//                         t[7] == arr[7] &&
//                         t[11] == arr[11]

//                         )
//                         if(match) {
//                             return true
//                         } else {
//                             return false
//                         }
//                  })
//                 if( i> -1 ) {
//                      return false
//                  } else {
//                      return true
//                  }
//             }
//             )
  
//             console.log(dataToProcess.length)

//             dataToProcess = dataToProcess.map((d) => {
//                 return {
//                     'Acct ID': d[1],
//                     'Patient MRN': d[2],
//                     'Acct Class': d[3],
//                     'Billing Status': d[4],
//                     'Acct Name': d[5],
//                     'Disch Date': d[6],
//                     'Acct Bal': d[7],
//                     'Days Until Timely Filing': d[8],
//                     'Fin Class': d[9],
//                     'Name': d[10],
//                     'Code': d[11],
//                     'Line Count': d[12],
//                     'Message': d[13],
//                     'Days On Account WQ': d[14]
//                 }
//             })

//             const schema = [
               
//                 {
//                     column: 'Acct ID',
//                     type: String,
//                     value: wq => wq['Acct ID'] ? wq['Acct ID'].toString() : ''
//                 },
//                 {
//                     column: 'Patient MRN',
//                     type: String,
//                     value: wq => wq['Patient MRN'] ? wq['Patient MRN'].toString() : ''
//                 },
               
               
//                 {
//                     column: 'Acct Class',
//                     type: String,
//                     value: wq => wq['Acct Class'] ? wq['Acct Class'].toString() : ''
//                 },
               
//                 {
//                     column: 'Billing Status',
//                     type: String,
//                     value: wq => wq['Billing Status'] ? wq['Billing Status'].toString() : ''
//                 },
//                 {
//                     column: 'Acct Name',
//                     type: String,
//                     value: wq => wq['Acct Name'] ? wq['Acct Name'].toString() : ''
//                 },
//                 {
//                     column: 'Disch Date',
//                     type: String,
//                     value: wq => wq['Disch Date'] ? wq['Disch Date'].toString() : ''
//                 },
    
//                 {
//                     column: 'Acct Bal',
//                     type: String,
//                     value: wq => wq['Acct Bal'] ? wq['Acct Bal'].toString() : ''
//                 },
    
//                 {
//                     column: 'Days Until Timely Filing',
//                     type: String,
//                     value: wq => wq['Days Until Timely Filing'] ? wq['Days Until Timely Filing'].toString() : ''
//                 },
//                 {
//                     column: 'Fin Class',
//                     type: String,
//                     value: wq => wq['Fin Class'] ? wq['Fin Class'].toString() : ''
//                 },
//                 {
//                     column: 'Name',
//                     type: String,
//                     value: wq => wq['Name'] ? wq['Name'].toString() : ''
//                 },
//                 {
//                     column: 'Code',
//                     type: String,
//                     value: wq => wq['Code'] ? wq['Code'].toString() : ''
//                 },
//                 {
//                     column: 'Line Count',
//                     type: String,
//                     value: wq => wq['Line Count'] ? wq['Line Count'].toString() : ''
//                 },
//                 {
//                     column: 'Message',
//                     type: String,
//                     value: wq => wq['Message'] ? wq['Message'].toString() : ''
//                 },
//                 {
//                     column: 'Days On Account WQ',
//                     type: String,
//                     value: wq => wq['Days On Account WQ'] ? wq['Days On Account WQ'].toString() : ''
//                 }
//             ]

//             console.log(dataToProcess)
//             await writeXlsxFile([dataToProcess], {
//                 schema: [schema],
//                 sheets: ['sheet'],
//                 filePath: 'file.xlsx'
//             })

//         //   dataToProcess.map(d => {
//         //         d = d.toString()  + "\n"
//         //         console.log(d)
//         //         fs.appendFile("file.txt", d, (err, res) => {
//         //             if(err) throw err
//         //             console.log(res)
//         //         })
//         //     })
//           })
//       })
//   }, 10000)



// setTimeout(() => {
//     XlsxPopulate.fromFileAsync('WW.xlsx', )
//     .then(async (workbook) => {
//         let rows = workbook.sheets()[0]._rows
//         rows = (rows.map((row, i) => row._cells.map((cell) => cell._value)))
//         let dataToProcess  =rows.filter((e, i) => i > 1)
//         XlsxPopulate.fromFileAsync('EE.xlsx')
//         .then(async (workbook) => {
//             let rows1 = workbook.sheets()[0]._rows
//             rows1 = (rows1.map((row, i) => row._cells.map((cell) => cell._value)))
//            let entries =rows1.filter((e, i) => i > 1)
//             dataToProcess = dataToProcess.filter((arr, index, self) => {
//                 let i = entries.findIndex((t) =>  {
//                 //    console.log(new Date(t[1]).toISOString().split('T')[0])
//                 //    console.log(ExcelDateToJSDate(arr[2]))
                   
//                     let match =  (
//                         ExcelDateToJSDate(t[2]) == ExcelDateToJSDate(arr[1]) &&
//                         t[3] == arr[2] &&
//                         t[4] == arr[3] &&
//                         t[5] == arr[4] &&
//                         t[6] == arr[5] &&
//                         t[7] == arr[6] &&
//                         t[8] == arr[7] &&
//                         t[9] == arr[8]

//                         )
//                         if(match) {
//                             return true
//                         } else {
//                             return false
//                         }
//                  })
//                 if( i> -1 ) {
//                      return false
//                  } else {
//                      return true
//                  }
//             }
//             )
  
//             console.log(dataToProcess.length)

//             // dataToProcess = dataToProcess.map((d) => {
//             //     return {
                      
//             //             'Svc Date' : ExcelDateToJSDate(d[1]),
//             //             'Patient MRN' : d[2],
//             //             'Patient' : d[3],
//             //             'CPT Codes' :  d[4],
//             //             'Sess Amount' : d[5],
//             //             'Primary Coverage' : d[6], 
//             //             'Research IRB' :   d[7],
//             //             'Study Type' : d[8],
//             //             'Days Until Timely Filing': d[9],
//             //             'Aging Days': d[10]

                   
//             //     }
//             // })

//             // const schema = [

            
//             //     {
//             //         column: 'Svc Date',
//             //         type: String,
//             //         value: wq => wq['Svc Date'] ? wq['Svc Date'].toString() : ''
//             //     },
    
//             //     {
//             //         column: 'Patient MRN',
//             //         type: String,
//             //         value: wq => wq['Patient MRN'] ? wq['Patient MRN'].toString() : ''
//             //     },
              
//             //     {
//             //         column: 'Patient',
//             //         type: String,
//             //         value: wq => wq['Patient'] ? wq['Patient'].toString() : ''
//             //     },
    
             
    
//             //     {
//             //         column: 'CPT Codes',
//             //         type: String,
//             //         value: wq => wq['CPT Codes'] ? wq['CPT Codes'].toString() : ''
//             //     },
//             //     {
//             //         column: 'Sess Amount',
//             //         type: String,
//             //         value: wq => wq['Sess Amount'] ? wq['Sess Amount'].toString() : ''
//             //     },
//             //     {
//             //         column: 'Primary Coverage',
//             //         type: String,
//             //         value: wq => wq['Primary Coverage'] ? wq['Primary Coverage'].toString() : ''
//             //     },
//             //     {
//             //         column: 'Research IRB',
//             //         type: String,
//             //         value: wq => wq['Research IRB'] ? wq['Research IRB'].toString() : ''
//             //     },
                   
//             //     {
//             //         column: 'Study Type',
//             //         type: String,
//             //         value: wq => wq['Study Type'] ? wq['Study Type'].toString() : ''
//             //     },
                
//             //     {
//             //         column: 'Days Until Timely Filing',
//             //         type: String,
//             //         value: wq => wq['Days Until Timely Filing'] ? wq['Days Until Timely Filing'].toString() : ''
//             //     },
//             //     {
//             //         column: 'Aging Days',
//             //         type: String,
//             //         value: wq => wq['Aging Days'] ? wq['Aging Days'].toString() : ''
//             //     },
                
//             // ]

//             // await writeXlsxFile([dataToProcess], {
//             //     schema: [schema],
//             //     sheets: ['sheet'],
//             //     filePath: 'file.xlsx'
//             // })

        
//           })
//       })
//   }, 10000)
  


module.exports = endpoints;
