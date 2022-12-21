const methods = require("./crudController");
const endpoints = methods.crudController("WQ5508");
const path = require('path')

var sql = require("mssql");
const utilController = require('./utilController');
const { getDateTime, fitToColumn } = require('./utilController');
const writeXlsxFile = require('write-excel-file/node')
const dir = path.join("./loader");
const XlsxPopulate = require('xlsx-populate');
const adminContoller = require('../controllers/adminController')
var XLSX = require("xlsx");



delete endpoints["list"];
const Model = "WQ5508";

const coveragesModel = 'CoveragesGovernment' 

let equalizer = (result) => {

    result.sort((a, b) => b.length - a.length )
  return new Promise((resolve, reject) => {
      
      for(let i=0; i< result.length -1 ; i++) {
                        
    

        let goal = result[i].length - result[i+1].length;
         
        if(goal <= 0) {
          if(i == result.length -2) {
            resolve(result)
          }

          continue
        }
         
        const count = {};


        for (const element of result[i]) {
          if (count[element['Patient MRN']]) {
            count[element['Patient MRN']] += 1;
          } else {
            count[element['Patient MRN']] = 1;
          }
        }

        
        while (result[i].length - result[i+1].length > 0) {
            let items = Object.values(count).filter((item) => item <= goal)
            

            var closest = items.reduce(function(prev, curr) {
              return (Math.abs(curr - goal) > Math.abs(prev - goal) ? curr : prev);
            });

            console.log
          let isDeleted = false          
          let calcId =  Object.keys(count).filter((item, index)  => {
                
            if (count[item] == closest ) {
              if(!isDeleted) {
                delete count[item]
                isDeleted = true
              }
              return true 
            }  

          })[0]

          
          result[i+1] = result[i+1].concat(result[i].filter(item => item['Patient MRN'] == calcId))
          result[i] = result[i].filter(item => item['Patient MRN'] != calcId)
      
        }
      

        if(i == result.length -2) {
          resolve(result)
        }
            
      }

  })
}

let splitArray = (array, parts) => {
    let result = [];
    for (let i = parts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
}

const gettingSplittedResult  = (result, Distributions) => {
    
    let splitResult = (splitArray(result, Distributions))

      let counter = 0
      return new Promise((resolve, reject) => {
        for (let i = 0; i < splitResult.length - 1; i++) {

          splitResult[i + 1].map(async(r, index) => {
            if (splitResult[i].findIndex(item => item['Patient MRN'] == r['Patient MRN']) > -1) {
              splitResult[i].push(r)
              splitResult[i + 1] = splitResult[i + 1].filter(item => item != r)
            }

            counter = counter + 1
            if (counter == splitResult.length) {
                let res = await equalizer(splitResult)
                resolve(res)
            }
          })
        }
      })


      
}


const sorter = ((array, value) => {
    return  array.sort((a, b) => {
        if (a[value] < b[value]) {    
            return -1;    
          }    
          if (a[value] > b[value]) {    
            return 1;    
          }    
          return 0;  
    })

})

const loader =  async (file, entity, password, cb) => {
  

    let rows = []
    let  d =  dir + `/WQ5508/${file}`
  
    XlsxPopulate.fromFileAsync(d,  { password: password? password: '' })
    .then(async (workbook) => {
    
        let rows = workbook.sheets()[0]._rows
    
        rows = (rows.map((row, i) => row._cells.map((cell) =>  cell._value )))
        cb(true)
    
        let count = +(rows.length / 1000).toString().split('.')[0]
        const timer = () => new Promise(res => setTimeout(res, 3000))
    
        let { recordset: entries } = await sql.query(`select * from ${Model}`)

        let cov_query =  `select Government, PrimaryCoverage from CoveragesGovernment `
        let {recordset: r2} = await sql.query(cov_query)

    
        let SvcDate1 = rows[1].findIndex((r) => r == 'Svc Date')
        let PatientMRN1 = rows[1].findIndex((r) => r == 'Patient MRN')
        let Patient1 = rows[1].findIndex((r) => r == 'Patient')
        let CPTCodes1 = rows[1].findIndex((r) => r == 'CPT Codes')
        let SessAmount1 = rows[1].findIndex((r) => r == 'Sess Amount')
        let PrimaryCoverage1 = rows[1].findIndex((r) => r == 'Primary Coverage')
        let StudyType1 = rows[1].findIndex((r) => r == 'Study Type')
        let DaysUntilTimelyFiling = rows[1].findIndex((r) => r == 'Days Until Timely Filing')
        let AgingDays = rows[1].findIndex((r) => r == 'Aging Days')
        let ResearchIRB = rows[1].findIndex((r) => r == 'Study Needing Rvw Code')

        
        let counter = 0
        let counter2 = 0
        let Data = []
        let promise = new Promise((resolve, reject) => {
            for(let i=0; i<rows.length ; i++) {

                if(!rows[i]) {
                    continue
                }


                let obj = ({
                    'Svc Date': rows[i][SvcDate1],
                    'Patient MRN': rows[i][PatientMRN1],
                    'Patient': rows[i][Patient1],
                    'CPT Codes' : rows[i][CPTCodes1],
                    'Sess Amount': rows[i][SessAmount1],
                    'Primary Coverage': rows[i][PrimaryCoverage1],
                    'Study Type': rows[i][StudyType1],
                    'Days Until Timely Filing': rows[i][DaysUntilTimelyFiling],
                    'Aging Days': rows[i][AgingDays],
                    'Research IRB': rows[i][ResearchIRB],
                    'Gov Cov Flag': 'Yes'
                })

                let govCovFlagResult = r2.filter((r) => r['PrimaryCoverage'] == rows[i][PrimaryCoverage1])
                if(govCovFlagResult.length > 0) {
                  if (govCovFlagResult[0].Government) {
                        obj['Gov Cov Flag'] = 'Yes'
                    } else {
                        obj['Gov Cov Flag'] = 'No'
                    }
                } else {
                    obj['Gov Cov Flag'] = 'Yes'
                }
               

                Data.push(obj)
                if(i == rows.length -1){
                    resolve(Data)
                }

            }
        })

        await promise

        let gov = Data.filter((d) => d['Gov Cov Flag'] == 'Yes')   // ferdinand , suzanne, jacqueline
        let nonGov = Data.filter((d) => d['Gov Cov Flag'] == 'No')  // anna , jannet

        nonGov = sorter(nonGov, 'Patient MRN')
        gov = sorter(gov, 'Patient MRN')

        let x = await gettingSplittedResult(nonGov, 2)
        let y = await gettingSplittedResult(gov, 3)

       
      
    }).catch(err => {
      console.log(err)
      console.log('error')
      cb(false)
    })
    ;

  }


  const getObject = (obj) => {
    return  obj.map((o) => {
 
         return {
                        
            'Error': o['Error'] ? o['Error'].toString() : '',
            'Notes': o['Notes'] ? o['Notes'].toString().replace().replace(/'/g, "''") : '',
            'Process Type': o['Process Type'] ? o['Process Type'].toString() : '',
            'Svc Date': o['Svc Date'] ? o['Svc Date'].toISOString().split('T')[0] : '',
            'Patient MRN': o['Patient MRN'] ? o['Patient MRN'].toString() : '',
            'Status': o['Status'] ? o['Status'].toString() : '',
            'Patient': o['Patient'] ? o['Patient'].toString().replace(/'/g, "''") : '',
            'Research IRB': o['Research IRB'] ? o['Research IRB'].toString() : '',
            'CPT Codes': o['CPT Codes'] ? o['CPT Codes'].toString() : '',
            'Valid IRB Found in Provider Notes': o['Valid IRB Found in Provider Notes'] ? o['Valid IRB Found in Provider Notes'].toString() : '',
            'Gov Cov Flag': o['Gov Cov Flag'] ? o['Gov Cov Flag'].toString() : '',
            'Sess Amount': o['Sess Amount'] ? o['Sess Amount'].toString() : '',
            'Primary Coverage': o['Primary Coverage'] ? o['Primary Coverage'].toString().replace(/'/g, "''") : '',
            'Study Type': o['Study Type'] ? o['Study Type'].toString().replace(/'/g, "''") : '',
            'Study Status': o['Study Status'] ? o['Study Status'].toString().replace(/'/g, "''") : '',
            'Days Until Timely Filing': o['Days Until Timely Filing'] ? o['Days Until Timely Filing'].toString() : '',
            'Aging Days': o['Aging Days'] ? o['Aging Days'].toString() : '',
            'Consented': o['Consented'] ? o['Consented'].toISOString().split('T')[0] : '',
            'Enrolled - Active': o['Enrolled - Active'] ? o['Enrolled - Active'].toISOString().split('T')[0] : '',
            'IsScreening': o['IsScreening'] ? o['IsScreening'].toString() : '',
            'User': o['User'] ? o['User'].toString().replace(/'/g, "''") : '',
            'UserAssigned': o['UserAssigned'] ? o['UserAssigned'].toString().replace(/'/g, "''") : '',
            'ActionTimeStamp': o['ActionTimeStamp'] ? new Date(o['ActionTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'UploadDateTime': o['UploadDateTime'] ? new Date(o['UploadDateTime']).toISOString().split('.')[0].replace('T', ' ') : '',
            'StartTimeStamp': o['StartTimeStamp'] ? new Date(o['StartTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'FinishTimeStamp': o['FinishTimeStamp'] ? new Date(o['FinishTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'Duration': o['Duration'] ? o['Duration'].toString() : '',
         }
     })
 
 }



 endpoints.exports = async (req,res) => {
    try {

        const workbook = XLSX.utils.book_new();

        let { recordset: objects1 } = await sql.query(`select * from ${Model} where Status = 'Review'`)
        let data  = await getObject(objects1)
        var worksheet = XLSX.utils.json_to_sheet( data);
        worksheet['!autofilter']={ref:"A1:AA1"};
        worksheet['!cols'] = fitToColumn(data[0])

        XLSX.utils.book_append_sheet(workbook, worksheet, 'All');

        
        let users = await adminContoller.getPbUsers()

        users = users.filter((u) => u.ManagementAccess != 1 && u.First !== "Bernadette")

        for (let i = 0; i < users.length; i++) {
            let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].First}' and Status  IN ('Review')`)
            let data = await getObject(objects1)
            const worksheet = XLSX.utils.json_to_sheet(data);
            worksheet['!autofilter']={ref:"A1:AA1"};
            worksheet['!cols'] = fitToColumn(data[0])

            XLSX.utils.book_append_sheet(workbook, worksheet, users[i].First);

        }


        let file = `WQ5508_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

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
// endpoints.exports = async (req, res) => {
//     try {

//         const schema = [

//             {
//                 column: 'Error',
//                 type: String,
//                 value: wq => wq['Error'] ? wq['Error'].toString() : ''
//             },
//             {
//                 column: 'Notes',
//                 type: String,
//                 value: wq => wq['Notes'] ? wq['Notes'].toString() : ''
//             },
//             {
//                 column: 'Process Type',
//                 type: String,
//                 value: wq => wq['Process Type'] ? wq['Process Type'].toString() : ''
//             },
//             {
//                 column: 'Svc Date',
//                 type: String,
//                 value: wq => wq['Svc Date'] ? wq['Svc Date'].toString() : ''
//             },

//             {
//                 column: 'Patient MRN',
//                 type: String,
//                 value: wq => wq['Patient MRN'] ? wq['Patient MRN'].toString() : ''
//             },
//             {
//                 column: 'Status',
//                 type: String,
//                 value: wq => wq['Status'] ? wq['Status'].toString() : ''
//             },
//             {
//                 column: 'Patient',
//                 type: String,
//                 value: wq => wq['Patient'] ? wq['Patient'].toString() : ''
//             },

//             {
//                 column: 'Research IRB',
//                 type: String,
//                 value: wq => wq['Research IRB'] ? wq['Research IRB'].toString() : ''
//             },

//             {
//                 column: 'CPT Codes',
//                 type: String,
//                 value: wq => wq['CPT Codes'] ? wq['CPT Codes'].toString() : ''
//             },
//             {
//                 column: 'Valid IRB Found in Provider Notes',
//                 type: String,
//                 value: wq => wq['Valid IRB Found in Provider Notes'] ? wq['Valid IRB Found in Provider Notes'].toString() : ''
//             },
//             {
//                 column: 'Gov Cov Flag',
//                 type: String,
//                 value: wq => wq['Gov Cov Flag'] ? wq['Gov Cov Flag'].toString() : ''
//             },
//             {
//                 column: 'Sess Amount',
//                 type: String,
//                 value: wq => wq['Sess Amount'] ? wq['Sess Amount'].toString() : ''
//             },
//             {
//                 column: 'Primary Coverage',
//                 type: String,
//                 value: wq => wq['Primary Coverage'] ? wq['Primary Coverage'].toString() : ''
//             },
//             {
//                 column: 'Study Type',
//                 type: String,
//                 value: wq => wq['Study Type'] ? wq['Study Type'].toString() : ''
//             },
//             {
//                 column: 'Study Status',
//                 type: String,
//                 value: wq => wq['Study Status'] ? wq['Study Status'].toString() : ''
//             },
//             {
//                 column: 'Days Until Timely Filing',
//                 type: String,
//                 value: wq => wq['Days Until Timely Filing'] ? wq['Days Until Timely Filing'].toString() : ''
//             },
//             {
//                 column: 'Aging Days',
//                 type: String,
//                 value: wq => wq['Aging Days'] ? wq['Aging Days'].toString() : ''
//             },
//             {
//                 column: 'Color',
//                 type: String,
//                 value: wq => wq['Color'] ? wq['Color'].toString() : ''
//             },
//             {
//                 column: 'User',
//                 type: String,
//                 value: wq => wq['User'] ? wq['User'].toString() : ''
//             },
//             {
//                 column: 'UserAssigned',
//                 type: String,
//                 value: wq => wq['UserAssigned'] ? wq['UserAssigned'].toString() : ''
//             },
           
//             {
//                 column: 'ActionTimeStamp',
//                 type: String,
//                 value: wq => wq['ActionTimeStamp'] ? wq['ActionTimeStamp'].toString() : ''
//             },
//             {
//                 column: 'UploadDateTime',
//                 type: String,
//                 value: wq => wq['UploadDateTime'] ? wq['UploadDateTime'].toString() : ''
//             },
//             {
//                 column: 'StartTimeStamp',
//                 type: String,
//                 value: wq => wq['StartTimeStamp'] ? wq['StartTimeStamp'].toString() : ''
//             },
//             {
//                 column: 'FinishTimeStamp',
//                 type: String,
//                 value: wq => wq['FinishTimeStamp'] ? wq['FinishTimeStamp'].toString() : ''
//             },
//             {
//                 column: 'Duration',
//                 type: String,
//                 value: wq => wq['Duration'] ? wq['Duration'].toString() : ''
//             }
//         ]

//         let objects = []
//         let sheets = []
//         let schemas = []
//         let { recordset: objects1 } = await sql.query(`select * from ${Model}  where Status IN ('Review')`)
//         objects.push(await getObject(objects1))
//         sheets.push('All')
//         schemas.push(schema)

//         let users = await adminContoller.getPbUsers()

//         users = users.filter((u) => u.ManagementAccess != 1 && u.First !== "Bernadette")

//         for(let i=0; i< users.length; i++) {
//             let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].First}' and Status IN ('Review')`)
//             objects.push(await getObject(objects1))
//             sheets.push(users[i].First)
//             schemas.push(schema)

//         }

       
//             let file = `WQ5508_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

//             let filename = `./public/WQ/` + file

//             console.log(sheets.length)
//             await writeXlsxFile(objects, {
//                 schema: schemas,
//                 sheets: sheets,
//                 filePath: filename
//             })

//             return res.status(200).json({
//                 success: true,
//                 result: {
//                     name: file,
//                     file: 'https://' + (process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file)
//                 },
//                 message: "Successfully exports",
//             });

       


           

//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({
//             success: false,
//             result: [],
//             message: "Oops there is error",
//             error: err,
//         });
//     }
// };



endpoints.upload = async (req, res) => {
    try {

     

        let entity = 'WQ5508'
       

        loader(req.file.filename, entity, req.body.password, cb => {
            console.log('yes')
        })

        return res.status(200).json({
            success: true,
            result: [],
            message: "Successfully upload files",
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



