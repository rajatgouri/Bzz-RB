const methods = require("./crudController");
const endpoints = methods.crudController("WQ1262");
const path = require('path')

var sql = require("mssql");
const utilController = require('./utilController');
const { getDateTime, fitToColumn } = require('./utilController');
const writeXlsxFile = require('write-excel-file/node')
const dir = path.join("./loader");
const XlsxPopulate = require('xlsx-populate');
var XLSX = require("xlsx");

const adminContoller = require('../controllers/adminController')

const JWT = 'JWT'

delete endpoints["list"];
const Model = "WQ1262";



let equalizer = (result) => {

    result.sort((a, b) => b.length - a.length)
    return new Promise((resolve, reject) => {

        for (let i = 0; i < result.length - 1; i++) {



            let goal = result[i].length - result[i + 1].length;

            if (goal <= 0) {
                if (i == result.length - 2) {
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


            while (result[i].length - result[i + 1].length > 0) {
                let items = Object.values(count).filter((item) => item <= goal)


                var closest = items.reduce(function (prev, curr) {
                    return (Math.abs(curr - goal) > Math.abs(prev - goal) ? curr : prev);
                });

                console.log
                let isDeleted = false
                let calcId = Object.keys(count).filter((item, index) => {

                    if (count[item] == closest) {
                        if (!isDeleted) {
                            delete count[item]
                            isDeleted = true
                        }
                        return true
                    }

                })[0]


                result[i + 1] = result[i + 1].concat(result[i].filter(item => item['Patient MRN'] == calcId))
                result[i] = result[i].filter(item => item['Patient MRN'] != calcId)

            }


            if (i == result.length - 2) {
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

const gettingSplittedResult = (result, Distributions) => {

    let splitResult = (splitArray(result, Distributions))

    let counter = 0
    return new Promise((resolve, reject) => {
        for (let i = 0; i < splitResult.length - 1; i++) {

            splitResult[i + 1].map(async (r, index) => {
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
    return array.sort((a, b) => {
        if (a[value] < b[value]) {
            return -1;
        }
        if (a[value] > b[value]) {
            return 1;
        }
        return 0;
    })

})

const timer = () => new Promise(res => setTimeout(res, 10000))


// const loader =  async (file, entity, password, cb) => {


//     let rows = []
//     let  d =  dir + `/WQ1262/${file}`

//     XlsxPopulate.fromFileAsync(d,  { password: password? password: '' })
//     .then(async (workbook) => {

//         let rows = workbook.sheets()[0]._rows

//         rows = (rows.map((row, i) => row._cells.map((cell) =>  cell._value )))
//         cb(true)




//         let AcctID = rows[1].findIndex((r) => r == 'Acct ID')
//         let PatientMRN1 = rows[1].findIndex((r) => r == 'Patient MRN')
//         let AcctClass = rows[1].findIndex((r) => r == 'Acct Class')
//         let BillingStatus = rows[1].findIndex((r) => r == 'Billing Status')
//         let AcctName = rows[1].findIndex((r) => r == 'Acct Name')
//         let DischDate = rows[1].findIndex((r) => r == 'Disch Date')
//         let AcctBal = rows[1].findIndex((r) => r == 'Acct Bal')
//         let DaysUntilTimelyfiling = rows[1].findIndex((r) => r == 'Days Until Timely filing')
//         let FinClass = rows[1].findIndex((r) => r == 'Fin Class')
//         let Name = rows[1].findIndex((r) => r == 'Name')
//         let Code = rows[1].findIndex((r) => r == 'Code')
//         let LineCount = rows[1].findIndex((r) => r == 'Line Count')
//         let Message = rows[1].findIndex((r) => r == 'Message')
//         let DaysOnAccountWQ = rows[1].findIndex((r) => r == 'Days On Account WQ')





//         let counter = 0
//         let counter2 = 0
//         let Data = []
//         let promise = new Promise(async(resolve, reject) => {
//             for(let i=2; i<rows.length ; i++) {

//                 if(!rows[i]) {
//                     continue
//                 }


//                 let obj = ({
//                     'Acct ID': rows[i][AcctID],
//                     'Patient MRN': rows[i][PatientMRN1],
//                     'Acct Class': rows[i][AcctClass],
//                     'Billing Status' : rows[i][BillingStatus],
//                     'Acct Name': rows[i][AcctName],
//                     'Disch Date': rows[i][DischDate],
//                     'Acct Bal': rows[i][AcctBal],
//                     'Fin Class': rows[i][FinClass],
//                     'Name': rows[i][Name],
//                     'Code': rows[i][Code],
//                     'Days Until Timely filing': rows[i][DaysUntilTimelyfiling],
//                     'Line Count': rows[i][LineCount],
//                     'Message': rows[i][Message],
//                     'Days On Account WQ': rows[i][DaysOnAccountWQ],

//                 })



//                 Data.push(obj)
//                 console.log(obj)

//                 console.log((`
//                 INSERT INTO WQ1262 
//                 ([Acct ID], [Patient MRN], [Acct Class], [Billing Status], [Acct Name], [Disch Date], [Acct Bal], [Fin Class], [Name], [Code], [Days Until Timely filing], [Line Count], [Message], [Days on ACcount WQ]) 
//                 values (

//                     ${obj['Acct ID'] ? obj['Acct ID'] :  null},
//                     ${obj['Patient MRN'] ? "'" + obj['Patient MRN'] + "'" :  null},
//                     ${obj['Acct Class'] ? "'" + obj['Acct Class'] + "'" :  null},
//                     ${obj['Billing Status'] ? "'" + obj['Billing Status'] + "'" :  null},
//                     ${obj['Acct Name'] ? "'" + obj['Acct Name'] + "'" :  null},
//                     ${obj['Disch Date'] ? "'" + new Date(obj['Disch Date']).toISOString().split('T')[0] + "'" :  null},
//                     ${obj['Acct Bal'] ? "'" + obj['Acct Bal'] + "'" :  null},
//                     ${obj['Fin Class'] ? "'" + obj['Fin Class'].replace(/'/g, "''") + "'" :  null},
//                     ${obj['Name'] ? "'" + obj['Name'] + "'" :  null},
//                     ${obj['Code'] ? "'" + obj['Code'] + "'" :  null},
//                     ${obj['Days Until Timely Filing'] ? "'" + obj['Days Until Timely Filing'] + "'" :  null},
//                     ${obj['Line Count'] ? "'" + obj['Line Count'] + "'" :  null},
//                     ${obj['Message'] ? "'" + obj['Message'] + "'" :  null},
//                     ${obj['Days On Account WQ'] ? "'" + obj['Days On Account WQ'] + "'" :  null}
//                 )
//                 `))


//                 await sql.query(`
//                 INSERT INTO WQ1262 
//                 ([Acct ID], [Patient MRN], [Acct Class], [Billing Status], [Acct Name], [Disch Date], [Acct Bal], [Fin Class], [Name], [Code], [Days Until Timely filing], [Line Count], [Message], [Days on ACcount WQ]) 
//                 values (

//                     ${obj['Acct ID'] ? obj['Acct ID'] :  null},
//                     ${obj['Patient MRN'] ? "'" + obj['Patient MRN'] + "'" :  null},
//                     ${obj['Acct Class'] ? "'" + obj['Acct Class'] + "'" :  null},
//                     ${obj['Billing Status'] ? "'" + obj['Billing Status'] + "'" :  null},
//                     ${obj['Acct Name'] ? "'" + obj['Acct Name'] + "'" :  null},
//                     ${obj['Disch Date'] ? "'" + new Date(obj['Disch Date']).toISOString().split('T')[0] + "'" :  null},
//                     ${obj['Acct Bal'] ? "'" + obj['Acct Bal'] + "'" :  null},
//                     ${obj['Fin Class'] ? "'" + obj['Fin Class'] + "'" :  null},
//                     ${obj['Name'] ? "'" + obj['Name'] + "'" :  null},
//                     ${obj['Code'] ? "'" + obj['Code'] + "'" :  null},
//                     ${obj['Days Until Timely Filing'] ? "'" + obj['Days Until Timely Filing'] + "'" :  null},
//                     ${obj['Line Count'] ? "'" + obj['Line Count'] + "'" :  null},
//                     ${obj['Message'] ? "'" + obj['Message'] + "'" :  null},
//                     ${obj['Days On Account WQ'] ? "'" + obj['Days On Account WQ'] + "'" :  null}
//                 )
//                 `)
//                 if(i == rows.length -1){
//                     resolve(Data)
//                 }

//             }
//         })

//         await promise




//     }).catch(err => {
//       console.log(err)
//       console.log('error')
//       cb(false)
//     })
//     ;

//   }.


const loader = async (file, entity, password, cb) => {

    let rows = []
    let d = dir + `/WQ1262/${file}`

    try {
        XlsxPopulate.fromFileAsync(d, { password: password ? password : '' })
            .then(async (workbook) => {

                let rows = workbook.sheets()[0]._rows
                rows = (rows.map((row, i) => row._cells.map((cell) => cell._value)))
                cb(true)

                console.log(rows.length)
                let count = +(rows.length / 1000).toString().split('.')[0]
                const { recordset: entries } = await sql.query(`SELECT * FROM ${Model} where UploadDateTime  >= DATEADD(Week, -1, CURRENT_TIMESTAMP)`)

                let AcctID = rows[1].findIndex((r) => r == 'Acct ID')
                let PatientMRN = rows[1].findIndex((r) => r == 'Patient MRN')
                let AcctClass = rows[1].findIndex((r) => r == 'Acct Class')
                let BillingStatus = rows[1].findIndex((r) => r == 'Billing Status')
                let AcctName = rows[1].findIndex((r) => r == 'Acct Name')
                let AcctBal = rows[1].findIndex((r) => r == 'Acct Bal')
                let DischDate = rows[1].findIndex((r) => r == 'Disch Date')
                let DaysUntilTimelyfiling = rows[1].findIndex((r) => r == 'Days Until Timely Filing')
                let FinClass = rows[1].findIndex((r) => r == 'Fin Class')
                let Name = rows[1].findIndex((r) => r == 'Name')
                let Code = rows[1].findIndex((r) => r == 'Code')
                let LineCount = rows[1].findIndex((r) => r == 'Line Count')
                let Message = rows[1].findIndex((r) => r == 'Message')
                let DaysOnAccountWQ = rows[1].findIndex((r) => r == 'Days On Account WQ')


                let counter = 0
                let counter2 = 0
                let Data = []

                const { recordset: users } = await sql.query(`SELECT * from ${JWT} where ManagementAccess != 1 and SubSection = 'HB' and First NOT IN ('Bernadette') ORDER BY First asc`)
                let Distributions = (users.length)

                let promise = new Promise(async (resolve, reject) => {
                    for (let i = 2; i <= rows.length; i++) {

                        if (!rows[i]) {
                            continue
                        }

                        let obj = ({
                            'Acct ID': rows[i][AcctID],
                            'Patient MRN': rows[i][PatientMRN],
                            'Acct Class': rows[i][AcctClass],
                            'Billing Status': rows[i][BillingStatus],
                            'Acct Name': rows[i][AcctName],
                            'Acct Bal': rows[i][AcctBal],
                            'Disch Date': rows[i][DischDate],
                            'Days Until Timely filing': rows[i][DaysUntilTimelyfiling],
                            'Fin Class': rows[i][FinClass],
                            'Name': rows[i][Name],
                            'Code': rows[i][Code],
                            'Line Count': rows[i][LineCount],
                            'Message': rows[i][Message],
                            'Days On Account WQ': rows[i][DaysOnAccountWQ]


                        })

                        Data.push(obj)
                        if (i == rows.length - 1) {
                            resolve(Data)
                        }

                    }
                })

                await promise
                let entID = [];

                let FinalData = []
                let Dates = []
                let dataToProcess = Data
                // let dataToProcess = Data.map((d) => {
                //     if(d['Code'] == undefined) {
                //         d['Code'] = null
                //     }
                //     if(d['Acct Name'] == undefined) {
                //         d['Acct Name'] = null
                //     }

                //     if(d['Acct ID'] == undefined) {
                //         d['Acct ID'] = null
                //     }

                //     if(d['Acct Name'] != undefined) {
                //         d['Acct Name'] = d['Acct Name'].replace(/''/, "'")
                //     }

                //     if(d['Patient MRN'] == undefined) {
                //         d['Patient MRN'] = null
                //     }


                //     if(d['Acct Class'] == undefined) {
                //         d['Acct Class'] = null
                //     }
                //     if(d['Billing Status'] == undefined) {
                //         d['Billing Status'] = null
                //     }

                //     if(d['Acct Bal'] == undefined  ) {
                //         d['Acct Bal'] = null
                //     }





                //     return d

                // })

                // dataToProcess = dataToProcess.filter((arr, index, self) => {
                //     let i = entries.findIndex((t) =>  {


                //         if(arr['Acct ID'] == 3001181716 && t['Acct ID'] == 3001181716) {
                //             console.log('hi')
                //         }

                //         if(t['Acct Bal'] == null) {
                //             t['Acct Bal'] = 0
                //         }



                //         let match =  (
                //             (new Date(t['Disch Date']).toISOString().split('T')[0] == new Date(arr['Disch Date']).toISOString().split('T')[0])  &&
                //             t['Acct ID'] == arr['Acct ID'] &&
                //             t['Patient MRN'] == arr['Patient MRN'] &&
                //             t['Acct Class'] == arr['Acct Class'] &&  
                //             t['Acct Name'] == arr['Acct Name'] && 
                //             (t['Acct Bal']  == arr['Acct Bal']  ) &&
                //             t['Fin Class'] == arr['Fin Class'] &&
                //             t['Billing Status'] == arr['Billing Status'] 

                //             )

                //             if(match) {
                //                 if(t.ID) {
                //                     entID.push(t.ID)
                //                 } 
                //                 return true
                //             } else {
                //                 return false
                //             }
                //      })
                //     if( i> -1 ) {

                //          return false
                //      } else {
                //          return true
                //      }
                // }

                // )


                // console.log(dataToProcess.length)
                // console.log(entID.length)


                // if(entID.length> 0) {
                //     let parts = entID.length/300
                //     let result = splitArray(entID, parts)
                //     for(let i=0; i< result.length ;i++) {

                //         await sql.query(`update ${Model} set Status = 'Review', UploadDateTime = '${getDateTime()}' where ID IN (${result[i].join(',')})`)
                //         await timer()
                //     }
                // }

                dataToProcess = dataToProcess.filter((arr, index, self) =>
                    index === self.findIndex((t) => {
                        return (
                            t['Disch Date'] == arr['Disch Date'] &&
                            t['Acct ID'] == arr['Acct ID'] &&
                            t['Patient MRN'] == arr['Patient MRN'] &&
                            t['Acct Class'] == arr['Acct Class'] &&
                            t['Billing Status'] == arr['Billing Status'] &&
                            t['Acct Name'] == arr['Acct Name'] &&
                            t['Acct Bal'] == arr['Acct Bal'] &&
                            t['Aging Days'] == arr['Aging Days'] &&
                            t['Fin Class'] == arr['Fin Class'] &&
                            t['Code'] == arr['Code'] &&
                            t['Line Count'] == arr['Line Count']


                        )
                    }))





                if (dataToProcess.length > 0) {

                    dataToProcess = dataToProcess.filter((data) => {
                        let MRN = entries.filter((ent) => ent['Patient MRN'] == data['Patient MRN'])

                        if (MRN.length > 0) {
                            // let UserAssigned = ent.UserAssigned
                            let mrn = MRN[0]
                            mrn.First = MRN[0].UserAssigned
                            // insertEntry(mrn, data)
                            FinalData.push({ mrn, data })

                            return false
                        } else {
                            return true
                        }
                    })

                }


                
                Data = sorter(dataToProcess, 'Patient MRN')
                let RNsList = ['Inpatient', 'Observation', 'Hospital Outpatient Surgery']

                let RN = Data.filter((charge) => RNsList.includes(charge['Acct Class']))
                let Outpatient = Data.filter((charge) => !RNsList.includes(charge['Acct Class'])).sort((a, b) => a['Acct Name'] < b['Acct Name'] ? -1 : 1)


              


                if (Data.length > 0) {
                    RN.filter((item) => {
                        return (item['Acct Name'] &&
                            (item['Acct Name'][0].toLowerCase() == 'a' ||
                                item['Acct Name'][0].toLowerCase() == 'b' ||
                                item['Acct Name'][0].toLowerCase() == 'c' ||
                                item['Acct Name'][0].toLowerCase() == 'd' ||
                                item['Acct Name'][0].toLowerCase() == 'e' ||
                                item['Acct Name'][0].toLowerCase() == 'f' ||
                                item['Acct Name'][0].toLowerCase() == 'g' ||
                                item['Acct Name'][0].toLowerCase() == 'h'
                            ))
                    }).map((item) => {
                        FinalData.push({
                            mrn: users.filter((u) => u.First == 'Monika')[0],
                            data: item,
                        })
                    })


                    RN.filter((item) => {
                        return (item['Acct Name'] &&
                            (
                                item['Acct Name'][0].toLowerCase() == 'i' ||
                                item['Acct Name'][0].toLowerCase() == 'j' ||
                                item['Acct Name'][0].toLowerCase() == 'k' ||
                                item['Acct Name'][0].toLowerCase() == 'l' ||
                                item['Acct Name'][0].toLowerCase() == 'm' ||
                                item['Acct Name'][0].toLowerCase() == 'n' ||
                                item['Acct Name'][0].toLowerCase() == 'o' ||
                                item['Acct Name'][0].toLowerCase() == 'p' ||
                                item['Acct Name'][0].toLowerCase() == 'q'

                            ))
                    }).map((item) => {
                        FinalData.push({
                            mrn: users.filter((u) => u.First == 'Amy')[0],
                            data: item,
                        })
                    })



                    RN.filter((item) => {
                        return (item['Acct Name'] &&
                            (
                                item['Acct Name'][0].toLowerCase() == 'r' ||
                                item['Acct Name'][0].toLowerCase() == 's' ||
                                item['Acct Name'][0].toLowerCase() == 't' ||
                                item['Acct Name'][0].toLowerCase() == 'u' ||
                                item['Acct Name'][0].toLowerCase() == 'v' ||
                                item['Acct Name'][0].toLowerCase() == 'w' ||
                                item['Acct Name'][0].toLowerCase() == 'x' ||
                                item['Acct Name'][0].toLowerCase() == 'y' ||
                                item['Acct Name'][0].toLowerCase() == 'z'

                            ))
                    }).map((item) => {
                        FinalData.push({
                            mrn: users.filter((u) => u.First == 'Karen')[0],
                            data: item,
                        })
                    })

                }




                if (Outpatient.length > 0) {
                    if (Outpatient.length < Distributions) {
                        let x = Outpatient

                        for (let i = 0; x.length; i++) {
                            let values = x[i]
                            //  insertEntry(users[i], values)
                            FinalData.push({ mrn: users[i], data: values })

                        }
                    } else {
                        let x = await gettingSplittedResult(Outpatient, Distributions)

                        for (let i = 0; i < x.length; i++) {
                            for (let j = 0; j < x[i].length; j++) {
                                let values = x[i][j]
                                //  insertEntry(users[i], values)
                                FinalData.push({ mrn: users[i], data: values })


                            }
                        }

                    }
                }




                for (let j = 0; j < users.length; j++) {

                    let u = users[j]
                    let data = FinalData.filter((d) => d.mrn.First == u.First)

                    let parts = data.length / 500
                    let result = splitArray(data, parts)

                    for (let k = 0; k < result.length; k++) {


                        let valuesQuery = ''
                        for (let i = 0; i < result[k].length; i++) {
                            let item = result[k][i].data
                            item.UserAssigned = u.First
                            item.UploadDateTime = getDateTime()
                            valuesQuery += `(
                        ${item['Acct ID'] ? "'" + item['Acct ID'] + "'" : null},
                        ${item['Acct Class'] ? "'" + item['Acct Class'] + "'" : null},
                        ${item['Acct Name'] ? "'" + item['Acct Name'].replace("'", "''") + "'" : null},
                        ${item['Acct Bal'] ? "'" + item['Acct Bal'] + "'" : null},
                        ${item['Billing Status'] ? "'" + item['Billing Status'].replace("'", "''") + "'" : null},
                        ${item['Code'] ? "'" + item['Code'] + "'" : null},
                        ${item['Days Until Timely filing'] ? "'" + item['Days Until Timely filing'] + "'" : null},
                        ${item['Disch Date'] ? "'" + item['Disch Date'] + "'" : null},
                        ${item['Fin Class'] ? "'" + item['Fin Class'].replace("'", "''") + "'" : null},
                        ${item['Line Count'] > 0 ? item['Line Count'] : null} ,
                        ${item['Name'] ? "'" + item['Name'].replace("'", "''") + "'" : null},
                        ${item['Patient MRN'] ? "'" + item['Patient MRN'] + "'" : null},
                        ${item['Message'] ? "'" + item['Message'] + "'" : null},
                        ${item['Days On Account WQ'] > 0 ? "'" + item['Days On Account WQ'] + "'" : null},
                        ${item['UserAssigned'] ? "'" + item['UserAssigned'] + "'" : null},
                        'Review',
                        '#FFFFFF',
                        CURRENT_TIMESTAMP
                    ) ,`
                        }

                        valuesQuery = valuesQuery.slice(0, -1)

                        if (valuesQuery.length > 0) {

                            let x = (`
                    insert into ${Model}
                    (
                      [Acct ID],
                      [Acct Class] ,
                      [Acct Name],
                      [Acct Bal],
                      [Billing Status],
                      [Code],
                      [Days Until Timely filing],
                      [Disch Date],
                      [Fin Class],
                      [Line Count],
                      [Name],
                      [Patient MRN],
                      [Message],
                      [Days On Account WQ],
                      [UserAssigned],
                      [Status],
                      [Color],
                      [UploadDateTime]
                      
                    ) values ${valuesQuery}
                  `)

                            async function ins() {
                                try {
                                    await sql.query(x)
                                } catch (err) {
                                    console.log(err)
                                }
                            }

                            ins()
                            await timer(5000)

                        }
                    }
                }

                let  {recordset: dups} = await sql.query(`
                SELECT  t1.[ID] as IDT1, t2.[ID] as IDT2
                FROM WQ1262 as t1
                INNER JOIN WQ1262 as t2
                ON t1.[Acct ID] = t2.[Acct ID] AND
                    t1.[Acct Bal] = t2.[Acct Bal] AND
                    t1.[Acct Name] = t2.[Acct Name] AND
                    t1.[Disch Date] = t2.[Disch Date]
                where t1.[ID] < t2.[ID]  and (t1.[Status] = 'Review' or t2.[Status] = 'Review')
                `) 
    
    
    
                if (dups.length > 0) {
                    await sql.query(`
                    Update ${Model} set Status = 'Review' where ID IN  (${dups.map(v => ( v.IDT1 ))})
                `)
    
                    
                    await sql.query(`
                        DELETE ${Model} where ID IN  (${dups.map(v => ( v.IDT2 ))})
                    `)
                }

                // users.map(async (u) => {
                //    let data =  FinalData.filter((d) => d.mrn.First == u.First)

                //     let valuesQuery = ''

                //     for(let i=0; i< data.length ;i++) {
                //         let item  = data[i].data
                //         item.UserAssigned = u.First
                //         item.UploadDateTime = getDateTime()
                //         valuesQuery += `(
                //             ${item['Acct ID'] ? "'" + item['Acct ID'] +"'"  : null },
                //             ${item['Acct Class'] ? "'" + item['Acct Class'] + "'" : null },
                //             ${item['Acct Name']  ? "'" + item['Acct Name'].replace("'", "''") + "'" : null},
                //             ${item['Acct Bal']  ?  "'" + item['Acct Bal'] + "'" : null },
                //             ${item['Billing Status'] ?  "'" + item['Billing Status'].replace("'", "''") + "'" : null },
                //             ${item['Code'] ?  "'" + item['Code'] + "'" : null },
                //             ${item['Days Until Timely filing'] ?  "'" + item['Days Until Timely filing'] + "'" : null },
                //             ${item['Disch Date']  ? "'" + item['Disch Date']  +  "'" : null },
                //             ${item['Fin Class'] ?  "'" +  item['Fin Class'].replace("'", "''") + "'"  : null },
                //             ${item['Line Count']>0  ?  item['Line Count']  : null} ,
                //             ${item['Name']  ? "'" + item['Name'].replace("'", "''") + "'" : null },
                //             ${item['Patient MRN']  ? "'" + item['Patient MRN']  + "'" : null},
                //             ${item['Message']  ? "'" + item['Message']  + "'" : null},

                //             ${item['Days On Account WQ']  > 0 ? "'" + item['Days On Account WQ']  + "'" : null},
                //             ${item['UserAssigned']  ? "'" + item['UserAssigned']  + "'" : null},
                //             'Review',
                //             '#FFFFFF',
                //             '${getDateTime()}'
                //         ) ,`
                //     }

                //     valuesQuery = valuesQuery.slice(0, -1)

                //     if (valuesQuery.length > 0) {


                //         let x = (`
                    //     insert into ${Model}
                    //     (
                    //       [Acct ID],
                    //       [Acct Class] ,
                    //       [Acct Name],
                    //       [Acct Bal],
                    //       [Billing Status],
                    //       [Code],
                    //       [Days Until Timely filing],
                    //       [Disch Date],
                    //       [Fin Class],
                    //       [Line Count],
                    //       [Name],
                    //       [Patient MRN],
                    //       [Message],
                    //       [Days On Account WQ],
                    //       [UserAssigned],
                    //       [Status],
                    //       [Color],
                    //       [UploadDateTime]

                    //     ) values ${valuesQuery}
                    //   `)


                //         async  function ins() {
                //             try {
                //                 await sql.query(x)      
                //                 await timer()

                //             } catch (err) {
                //                 ins()    

                //                 console.log(err)
                //             }
                //         }

                //         ins()

                //       }


                // })


            }).catch(err => {
                console.log(err)
                console.log('error')
                cb(false)
            });

    } catch (err) {
        console.log(err)
        cb(false)
    }

}


const getObject = (obj) => {
    return obj.map((o) => {

        let x = {

            'Error': o['Error'] ? o['Error'].toString() : '',
            'Notes': o['Notes'] ? o['Notes'].toString().replace().replace(/'/g, "''") : '',
            'Acct ID': o['Acct ID'] ? o['Acct ID'].toString() : '',
            'Patient MRN': o['Patient MRN'] ? o['Patient MRN'].toString() : '',
            'Acct Class': o['Acct Class'] ? o['Acct Class'].toString() : '',
            'Billing Status': o['Billing Status'] ? o['Billing Status'].toString() : '',
            'Acct Name': o['Acct Name'] ? o['Acct Name'].toString() : '',
            'Disch Date': o['Disch Date'] ? o['Disch Date'].toISOString().split('T')[0] : '',
            'Acct Bal': o['Acct Bal'] ? o['Acct Bal'].toString() : '',
            'Days Until Timely filing': o['Days Until Timely filing'] ? o['Days Until Timely filing'].toString() : '',
            'Fin Class': o['Fin Class'] ? o['Fin Class'].toString() : '',
            'Name': o['Name'] ? o['Name'].toString().replace(/'/g, "''") : '',
            'Code': o['Code'] ? o['Code'].toString() : '',
            'Line Count': o['Line Count'] ? o['Line Count'].toString().replace(/'/g, "''") : '',
            'Message': o['Message'] ? o['Message'].toString().replace(/'/g, "''") : '',
            'Days On Account WQ': o['Days On Account WQ'] ? o['Days On Account WQ'].toString().replace(/'/g, "''") : '',
            'Status': o['Status'] ? o['Status'].toString() : '',
            'Color': o['Color'] ? o['Color'].toString() : '',
            'User': o['User'] ? o['User'].toString().replace(/'/g, "''") : '',
            'UserAssigned': o['UserAssigned'] ? o['UserAssigned'].toString().replace(/'/g, "''") : '',
            'ActionTimeStamp': o['ActionTimeStamp'] ? new Date(o['ActionTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'UploadDateTime': o['UploadDateTime'] ? new Date(o['UploadDateTime']).toISOString().split('.')[0].replace('T', ' ') : '',
            'StartTimeStamp': o['StartTimeStamp'] ? new Date(o['StartTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'FinishTimeStamp': o['FinishTimeStamp'] ? new Date(o['FinishTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'Duration': o['Duration'] ? o['Duration'].toString() : '',
        }

        return x
    })

}



endpoints.exports = async (req,res) => {
    try {

        const workbook = XLSX.utils.book_new();

        let { recordset: objects1 } = await sql.query(`select * from ${Model} where Status = 'Review'`)
        let data  = await getObject(objects1)
        var worksheet = XLSX.utils.json_to_sheet(data );
        worksheet['!autofilter']={ref:"A1:Y1"};
        worksheet['!cols'] = fitToColumn(data[0])

        XLSX.utils.book_append_sheet(workbook, worksheet, 'All');

     

        
        let users = await adminContoller.getHbUsers()

        users = users.filter((u) => u.ManagementAccess != 1 && u.First !== "Bernadette")

        for (let i = 0; i < users.length; i++) {
            let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].First}' and Status  IN ('Review')`)
            let data  = await getObject(objects1)
            const worksheet = XLSX.utils.json_to_sheet(await getObject(objects1));
            worksheet['!autofilter']={ref:"A1:Y1"};
            worksheet['!cols'] = fitToColumn(data[0])

            XLSX.utils.book_append_sheet(workbook, worksheet, users[i].First);

        }


        let file = `WQ1262_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

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
//                 column: 'Acct ID',
//                 type: String,
//                 value: wq => wq['Acct ID'] ? wq['Acct ID'].toString() : ''
//             },
//             {
//                 column: 'Patient MRN',
//                 type: String,
//                 value: wq => wq['Patient MRN'] ? wq['Patient MRN'].toString() : ''
//             },
//             {
//                 column: 'Acct Class',
//                 type: String,
//                 value: wq => wq['Acct Class'] ? wq['Acct Class'].toString() : ''
//             },
//             {
//                 column: 'Billing Status',
//                 type: String,
//                 value: wq => wq['Billing Status'] ? wq['Billing Status'].toString() : ''
//             },
//             {
//                 column: 'Acct Name',
//                 type: String,
//                 value: wq => wq['Acct Name'] ? wq['Acct Name'].toString() : ''
//             },
//             {
//                 column: 'Disch Date',
//                 type: String,
//                 value: wq => wq['Disch Date'] ? wq['Disch Date'].toString() : ''
//             },
//             {
//                 column: 'Acct Bal',
//                 type: String,
//                 value: wq => wq['Acct Bal'] ? wq['Acct Bal'].toString() : ''
//             },
//             {
//                 column: 'Days Until Timely filing',
//                 type: String,
//                 value: wq => wq['Days Until Timely filing'] ? wq['Days Until Timely filing'].toString() : ''
//             },
//             {
//                 column: 'Fin Class',
//                 type: String,
//                 value: wq => wq['Fin Class'] ? wq['Fin Class'].toString() : ''
//             },
//             {
//                 column: 'Name',
//                 type: String,
//                 value: wq => wq['Name'] ? wq['Name'].toString() : ''
//             },
//             {
//                 column: 'Code',
//                 type: String,
//                 value: wq => wq['Code'] ? wq['Code'].toString() : ''
//             },
//             {
//                 column: 'Line Count',
//                 type: String,
//                 value: wq => wq['Line Count'] ? wq['Line Count'].toString() : ''
//             },
//             {
//                 column: 'Message',
//                 type: String,
//                 value: wq => wq['Message'] ? wq['Message'].toString() : ''
//             },
//             {
//                 column: 'Days On Account WQ',
//                 type: String,
//                 value: wq => wq['Days On Account WQ'] ? wq['Days On Account WQ'].toString() : ''
//             },
//             {
//                 column: 'Status',
//                 type: String,
//                 value: wq => wq['Status'] ? wq['Status'].toString() : ''
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
//         let { recordset: objects1 } = await sql.query(`select * from ${Model} where Status = 'Review'`)
//         objects.push(await getObject(objects1))
//         sheets.push('All')
//         schemas.push(schema)

        // let users = await adminContoller.getHbUsers()

        // users = users.filter((u) => u.ManagementAccess != 1 && u.First !== "Bernadette")

        // for (let i = 0; i < users.length; i++) {
        //     let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].First}' and Status NOT IN ('Done')`)
        //     objects.push(await getObject(objects1))
        //     sheets.push(users[i].First)
        //     schemas.push(schema)

        // }


        // let file = `WQ1262_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

        // let filename = `./public/WQ/` + file

        // await writeXlsxFile(objects, {
        //     schema: schemas,
        //     sheets: sheets,
        //     filePath: filename
        // })

        // return res.status(200).json({
        //     success: true,
        //     result: {
        //         name: file,
        //         file: 'https://' + (process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file)
        //     },
        //     message: "Successfully exports",
        // });






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

      

        let entity = 'WQ1262'


        loader(req.file.filename, entity, req.body.password, cb => {
            if (cb) {
                return res.status(200).json({
                    success: true,
                    result: [],
                    message: "Successfully upload files",
                });
            } else {
                return res.status(500).json({
                    success: false,
                    result: [],
                    message: "Wrong Password!",
                });
            }
        })




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



