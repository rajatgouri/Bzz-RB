const methods = require("./crudController");
const endpoints = methods.crudController("${Model}");
var sql = require("mssql");
var sqlConnection = require('../sql')

const utilController = require('./utilController');
const adminContoller = require('../controllers/adminController')
const path = require('path')
const fs = require('fs');

const { getDateTime, fitToColumn } = require('./utilController');
const dir = path.join("./loader");
const XlsxPopulate = require('xlsx-populate');

const moment = require('moment-timezone');

const io = require('../socket')

delete endpoints["list"];
const Model = "WQ1075";
const JWT = 'JWT'
var XLSX = require("xlsx");
const mailer = require("./mailController");
const { logo } = require("../Utils/logo");


function ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = (utc_days * 86400);
    var date_info = new Date((utc_value) * 1000);
    return (date_info.toISOString().split('T')[0])
}



// setInterval(async () => {

//     await sql.query(`
    
//     update ${Model}
//     set [Gov Cov Flag] = 'No' where [Primary Coverage] IN (
//         select [PrimaryCoverage] from CoveragesGovernment
//         where Government = 0 and ${Model}.[Primary Coverage] = CoveragesGovernment.[PrimaryCoverage]
//      )
//     `)

//     await sql.query(`
    
//     update ${Model}
//     set [Gov Cov Flag] = 'Yes' where [Primary Coverage] IN (
//         select [PrimaryCoverage] from CoveragesGovernment
//         where Government = 1 and ${Model}.[Primary Coverage] = CoveragesGovernment.[PrimaryCoverage]
//      )
//     `)

//     await sql.query(`
    
//     update ${Model}
//     set [Gov Cov Flag] = 'Yes' where [Gov Cov Flag] IS NULL
//     `)
// }, 20000)

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


                var closest = Object.values(count).filter((item) => item  <= goal  )
          
                if(closest.length > 0) {
                  closest = closest.reduce(function(prev, curr) {
                    return (Math.abs(curr - goal) > Math.abs(prev - goal) ? curr : prev);
                  }); 
                } else {
                  closest = 1
                }
                
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
    //non gov data , 2

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

const insertEntry = async (users, values) => {
    values.UserAssigned = users.First
    values.UploadDateTime = getDateTime()
    const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"

    let valuesQuery = "";
    for (key in values) {
        if (values[key] === "null" || values[key] === undefined) {
            valuesQuery += "NULL" + ",";
        } else {
            valuesQuery += "'" + values[key] + "',";
        }
    }
    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";


    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
    // console.log(insertQuery)
    await sql.query(insertQuery)
}



const sendMail = async () => {

    mailer(
        ['mhurd@coh.org', 'jaing@coh.org', 'ferdgamboa@coh.org'],
        ['mdeksne@coh.org'],
        `
        New Coverage Found
        `,
        `
        <h2>Greetings</h2>

        <p> An Update occured in Government Coverage master list.<br>

         Please click on the below link and assist with flagging updates "True" or "False" accordingly. <br><br>
         
         <a href="https://10.30.142.17/coverage">https://10.30.142.17/coverage</a><br><br>
         
         </p>


         Thank you, <br><br><br>

        HIMS Business Solutions <br>
        Automated Notification <br><br>


         ${logo}

     
        
        `
    )

}



const timer = (time = 2000) => new Promise(res => setTimeout(res, time))


const loader = async (file, entity, password, cb) => {

    let rows = []
    let d = dir + `/WQ1075/${file}`

    try {



        XlsxPopulate.fromFileAsync(d, { password: password ? password : '' })
            .then(async (workbook) => {

                let rows = workbook.sheets()[0]._rows
                rows = (rows.map((row, i) => row._cells.map((cell) => cell._value)))
                cb(true)
                let count = +(rows.length / 1000).toString().split('.')[0]
                // const { recordset: entries } = await sql.query(`SELECT * FROM ${Model} where UploadDateTime  >= DATEADD(Week, -1, CURRENT_TIMESTAMP)`)

                let SvcDate1 = rows[1].findIndex((r) => r == 'Svc Date')
                let PatientMRN1 = rows[1].findIndex((r) => r == 'Patient MRN')
                let Patient1 = rows[1].findIndex((r) => r == 'Patient')
                let CPTCodes1 = rows[1].findIndex((r) => r == 'CPT Codes')
                let SessAmount1 = rows[1].findIndex((r) => r == 'Sess Amount')
                let PrimaryCoverage1 = rows[1].findIndex((r) => r == 'Primary Coverage')
                let StudyType1 = rows[1].findIndex((r) => r == 'Study Type')
                let DaysUntilTimelyFiling = rows[1].findIndex((r) => r == 'Days Until Timely Filing')
                let AgingDays = rows[1].findIndex((r) => r == 'Aging Days')
                let ResearchIRB = rows[1].findIndex((r) => r == 'Study Needing Rvw Code' || r == 'Research IRB')

                let updatesDatasetIDs = []
                let Data = []
                let emailSent = false

                var { recordset: users } = await sql.query(`SELECT * from ${JWT} where  SubSection = 'PB' `)

                var Coverages = []
                var { recordset: coverageList } = await sql.query(`Select * from CoveragesGovernment`)
                Coverages = coverageList

                const { recordset: exported } = await sql.query(`;WITH CTE1075
                AS 
                (
                SELECT top(1) [UploadDateTime] from WQ1075 order by [UploadDateTime] desc
                ),
                CTE5508 
                AS (
                SELECT top(1) [UploadDateTime] from WQ5508 order by [UploadDateTime] desc
                )
                
                SELECT * FROM (
                SELECT * FROM CTE1075
                UNION ALL
                SELECT * FROM CTE5508
                ) as A where [UploadDateTime] >= '${getDateTime().split('T')[0]}'
                
                `)

                if (exported.length == 0) {
                    await sql.query(`DELETE from ${Model} where [User] IS NULL`)
                    await sql.query(`
                    UPDATE ${Model} set [Status] = 'Done' where [Color] = '#BEE6BE' and [Status] = 'Review'
                    UPDATE ${Model} set [Status] = 'Pending' where [Color] = '#FAFA8C' and [Status] = 'Review'
                    UPDATE ${Model} set [Status] = 'Misc' where [Color] = '#E1A0E1' and [Status] = 'Review'
                    UPDATE ${Model} set [Status] = 'Deferred' where [Color] = '#9EE6FF' and [Status] = 'Review'
                    `)
                }

          

                let { recordset: StudyStatusData } = await sqlConnection.query(`
                SELECT 
                p.[PAT_MRN_ID] [Patient MRN]
               ,rsi.[IRB_APPROVAL_NUM] [Research IRB]
               ,rst.[NAME] [Study Type]
               ,est.[NAME] [Study Status]
                    
                FROM  [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] eri
                LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_ENROLL_STATUS] est WITH (NOLOCK)  ON eri.[ENROLL_STATUS_C]=est.[ENROLL_STATUS_C]
                LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsi  WITH (NOLOCK)      ON eri.[RESEARCH_STUDY_ID] =rsi.[RESEARCH_ID]
                LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_STUDY_TYPE] rst  WITH (NOLOCK)     ON rsi.[STUDY_TYPE_C]=rst.[STUDY_TYPE_C]
                LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] p     WITH (NOLOCK)         ON eri.[PAT_ID]=p.[PAT_ID]
				GROUP BY  p.[PAT_MRN_ID] ,rsi.[IRB_APPROVAL_NUM] ,rst.[NAME] ,est.[NAME] 
                `)


                let promise = new Promise(async (resolve, reject) => {
                    for (let i = 2; i <= rows.length; i++) {

                        if (!rows[i]) {
                            continue
                       }

                        let obj = ({
                            'Svc Date': rows[i][SvcDate1],
                            'Patient MRN': rows[i][PatientMRN1],
                            'Patient': rows[i][Patient1].replace(/'/g, "''"),
                            'CPT Codes': rows[i][CPTCodes1],
                            'Sess Amount': rows[i][SessAmount1],
                            'Primary Coverage': rows[i][PrimaryCoverage1],
                            'Study Type': rows[i][StudyType1],
                            'Days Until Timely Filing': rows[i][DaysUntilTimelyFiling],
                            'Aging Days': rows[i][AgingDays],
                            'Research IRB': rows[i][ResearchIRB],
                            'Process Type': rows[i][AgingDays] >= 60 ? '60 Days and Over' : 'Under 60 Days',
                        })


                        let coverage = Coverages.filter((coverage) => coverage['PrimaryCoverage'] == rows[i][PrimaryCoverage1])[0]
                        let StudyStatus = StudyStatusData.filter((ss) => ss['Patient MRN'] == rows[i][PatientMRN1] && ss['Research IRB'] == rows[i][ResearchIRB])[0]
                        if (StudyStatus && StudyStatus['Study Status']) {
                            obj['Study Status'] = StudyStatus['Study Status']
                        }


                        if (coverage) {
                            obj['Gov Cov Flag'] = coverage.Government ? 'Yes' : 'No'

                        } else {
                            obj['Gov Cov Flag'] = 'Yes'

                            if (rows[i][PrimaryCoverage1]) {
                                await sql.query(`INSERT INTO CoveragesGovernment ([PrimaryCoverage], [New], [LastUpdated]) values('${rows[i][PrimaryCoverage1]}','1', '${getDateTime()}')`)

                                Coverages.push({
                                    'PrimaryCoverage': rows[i][PrimaryCoverage1],
                                    'New': 1,
                                    'LastUpdated': new Date(),
                                    'Government': null
                                })

                                if (!emailSent && process.env.NODE_ENV != 'development') {
                                    sendMail()
                                    emailSent = true
                                }
                            }
                        }

                        if (exported.length == 0) {

                            console.log('First One')
                       
                        let { recordset: exist } = await sql.query(`
                        SELECT *  from ${Model} 
                        where [Patient MRN] = '${obj['Patient MRN']}'
                        and CAST ([Svc Date] as Date)   =  FORMAT(TRY_CAST('${obj['Svc Date']}' as date),'yyyy-MM-dd')
                        and [Patient] = '${obj['Patient']}'
                        and [CPT Codes] = '${obj['CPT Codes']}'
                        and [Sess Amount] = '${obj['Sess Amount']}'
                        and [Primary Coverage] = '${obj['Primary Coverage']}'
                        and [Study Type] = '${obj['Study Type']}'
                        and [Research IRB] = '${obj['Research IRB']}'
                        
                        `)


                        if (exist.length > 0) {
                            updatesDatasetIDs.push(exist[0].ID)

                        } else {
                            Data.push(obj)
                        }

                        if (i == rows.length - 1) {

                            setTimeout(() => {
                                resolve(Data)
                            }, 5000)
                        }

                    } else {

                        console.log('Second One')
                            
                        let { recordset: exist } = await sql.query(`
                        SELECT *  from ${Model} 
                        where [Patient MRN] = '${obj['Patient MRN']}'
                        and CAST ([Svc Date] as Date)   =  FORMAT(TRY_CAST('${obj['Svc Date']}' as date),'yyyy-MM-dd')
                        and [Patient] = '${obj['Patient']}'
                        and [CPT Codes] = '${obj['CPT Codes']}'
                        and [Sess Amount] = '${obj['Sess Amount']}'
                        and [Primary Coverage] = '${obj['Primary Coverage']}'
                        and [Study Type] = '${obj['Study Type']}'
                        and [Research IRB] = '${obj['Research IRB']}'
                        and [UploadDateTime] >= '${getDateTime().split('T')[0]}'
                        `)


                        if (exist.length == 0) {
                            Data.push(obj)
                        } 

                        if (i == rows.length - 1) {

                            setTimeout(() => {
                                resolve(Data)
                            }, 5000)
                        }

                    }
                    }
                })

                await promise

                let FinalData = []
                let dataToProcess = Data
                if (updatesDatasetIDs.length > 0) {
                    await sql.query(`UPDATE ${Model} set [Status] = 'Review' , [UploadDateTime] = '${getDateTime()}', [StartTimeStamp] = NULL, [FinishTimeStamp]= NULL, [Duration]= NULL where  ID IN (${updatesDatasetIDs.join(',')})`)
                }




                // Remove Dups by excel itself
                dataToProcess = dataToProcess.filter((arr, index, self) =>
                    index == self.findIndex((t) => {
                        return (
                            t['Svc Date'] == arr['Svc Date'] &&
                            t['Patient'] == arr['Patient'] &&
                            t['Patient MRN'] == arr['Patient MRN'] &&
                            t['Research IRB'] == arr['Research IRB'] &&
                            t['CPT Codes'] == arr['CPT Codes'] &&
                            t['Primary Coverage'] == arr['Primary Coverage'] &&
                            t['Sess Amount'] == arr['Sess Amount'] &&
                            t['Aging Days'] == arr['Aging Days'] &&
                            t['Days Unitil Timely filing'] == arr['Days Unitil Timely filing'] &&
                            t['Study Type'] == arr['Study Type'] &&
                            t['Study Status'] == arr['Study Status']
                        )
                    }))

                console.log('duplicate removed from excel...', dataToProcess.length)
                let filteredData = []
                await new Promise(async (resolve, reject) => {
                    if (dataToProcess.length > 0) {
                        for (let i = 0; i < dataToProcess.length; i++) {
                            let data = dataToProcess[i]
                            let { recordset: result } = await sql.query(`SELECT TOP(1) [UserAssigned] from ${Model} where [Patient MRN] = '${data['Patient MRN']}'  and [Status] = 'Review' and [User] IS NOT NULL ORDER BY [UploadDateTime] desc`)

                            if (result.length > 0) {

                                let mrn = {}
                                mrn.First = result[0].UserAssigned

                                FinalData.push({ mrn, data })
                                if (i == dataToProcess.length - 1) {
                                    resolve(true)
                                }

                            } else {
                                filteredData.push(data)

                                if (i == dataToProcess.length - 1) {
                                    resolve(true)
                                }
                            }


                        }

                      
                    } else {
                        resolve(true)
                    }
                })

                dataToProcess = filteredData


                Data = sorter(dataToProcess, 'Patient MRN')


                const unique = [...new Set(Data.map(item => item['Patient MRN']))];

                let GovMRNs = unique.map((u) => {
                    let item = Data.filter(d => d['Patient MRN'] == u && d['Gov Cov Flag'] == 'Yes').length > 0
                    if (item) {
                        return u
                    }
                })

                let nonGovData = Data.filter((d) => GovMRNs.findIndex((x) => x == d['Patient MRN']) == -1)
                let GovData = Data.filter((d) => GovMRNs.findIndex((x) => x == d['Patient MRN']) > -1)

              
               
                let nonGovUsers = users.filter((u) => u.WQ == 'Non-Gov')


                // Where NonGov Data is > 0
                if (nonGovData.length > 0) {
                    if (nonGovData.length < 2) {
                        let x = nonGovData

                        for (let i = 0; x.length; i++) {
                            let values = x[i]
                            FinalData.push({ mrn: nonGovUsers[i], data: values })
                        }
                    } else {
                        let x = await gettingSplittedResult(nonGovData, nonGovUsers.length)

                        for (let i = 0; i < x.length; i++) {
                            for (let j = 0; j < x[i].length; j++) {
                                let values = x[i][j]
                                //  insertEntry(users[i], values)
                                FinalData.push({ mrn: nonGovUsers[i], data: values })

                            }
                        }

                    }
                }


                let GovUsers = users.filter((u) => u.WQ == 'Gov')

                if (GovData.length > 0) {
                    if (GovData.length < 2) {
                        let x = GovData

                        for (let i = 0; x.length; i++) {
                            let values = x[i]
                            FinalData.push({ mrn: GovUsers[i], data: values })
                        }
                    } else {
                        let x = await gettingSplittedResult(GovData, GovUsers.length)

                        for (let i = 0; i < x.length; i++) {
                            for (let j = 0; j < x[i].length; j++) {
                                let values = x[i][j]
                                //  insertEntry(users[i], values)
                                FinalData.push({ mrn: GovUsers[i], data: values })

                            }
                        }

                    }
                }



               users =  users.filter(u => u.WQ != null)
                let p = new Promise(async (resolve, reject) => {

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
                            ${item['Svc Date'] ? "'" + item['Svc Date'] + "'" : null},
                            ${item['Patient'] ? "'" + item['Patient'].replace(/'/g, "''") + "'" : null},
                            ${item['Patient MRN'] ? "'" + item['Patient MRN'] + "'" : null},
                            ${item['Research IRB'] ? "'" + item['Research IRB'] + "'" : null},
                            ${item['CPT Codes'] ? "'" + item['CPT Codes'] + "'" : null},
                            ${item['Aging Days'] ? "'" + item['Aging Days'] + "'" : null},
                            ${item['Days Until Timely Filing'] ? "'" + item['Days Until Timely Filing'] + "'" : null},
                            ${item['Sess Amount'] > 0 ? item['Sess Amount'] : null},
                            ${item['Primary Coverage'] ? "'" + item['Primary Coverage'] + "'" : null},
                            ${item['Study Type'] ? "'" + item['Study Type'] + "'" : null} ,
                            ${item['Gov Cov Flag'] ? "'" + item['Gov Cov Flag'] + "'" : null},
                            ${item['UserAssigned'] ? "'" + item['UserAssigned'] + "'" : null},
                            ${item['UserAssigned'] ? "'" + item['UserAssigned'] + "'" : null},
                            ${item['Study Status'] ? "'" + item['Study Status'] + "'" : null},
                            '${item['Process Type']}',
                            'Review',
                            '${getDateTime()}'
                        ) ,`
                            }

                            valuesQuery = valuesQuery.slice(0, -1)

                            if (valuesQuery.length > 0) {

                                let x = (`
                        insert into ${Model}
                        (
                          [Svc Date],
                          [Patient] ,
                          [Patient MRN],
                          [Research IRB],
                          [CPT Codes],
                          [Aging Days],
                          [Days Until Timely Filing],
                          [Sess Amount],
                          [Primary Coverage],
                          [Study Type],
                          [Gov Cov Flag],
                          [UserAssigned],
                          [OriginalUserAssigned],
                          [Study Status],
                          [Process Type],
                          [Status],
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
                                if (j == users.length - 1) {
                                    resolve(true)
                                }

                            }
                        }
                    }
                })


                await p
                // Same User Assigned in Both Tables

              

                try {


                    if (exported.length == 0) {

                        await sql.query(`
                        IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TempUpdatedData]') AND type in (N'U'))
                        BEGIN
                            DROP TABLE TempUpdatedData 
                        END

                        exec  [dbo].[Update_Status_And_Date] 
                        BEGIN
                        exec  [dbo].[DELETE_DUPS]
                        END
                        BEGIN
                        exec [dbo].[Update_By_User_WQ1075]
                        END
                        BEGIN
                        exec [dbo].[Update_By_User_WQ5508]
                        END
                        
                        BEGIN
                        exec [dbo].[WQ1075_Equalizer_Gov_Scrubs]
                        END																						
                        BEGIN
                        exec [dbo].[WQ1075_Equalizer_Non_Gov_Scrubs]
                        END
                        
                        BEGIN 
                        exec [dbo].[WQ1075_Equalizer_Gov_Users]
                        END																						
                        BEGIN 
                        exec [dbo].[WQ1075_Equalizer_Non_Gov_Users]
                        END	
                        
                       
                        BEGIN
                        exec [dbo].[Update_WQ5508_From_WQ1075]
                        END
                      BEGIN
                      exec [dbo].[WQ1075_Answers]
                        END
                        BEGIN
                        exec [dbo].[Billing_GetTargetValues_ProdTracking]
                        END
                        `)
                    } else {


                        await sql.query(`
                        IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TempUpdatedData]') AND type in (N'U'))
                        BEGIN
                            DROP TABLE TempUpdatedData 
                        END
                        BEGIN
                        exec  [dbo].[DELETE_DUPS]
                        END
                      BEGIN
                        exec [dbo].[Update_By_User_WQ1075]
                        END
                        BEGIN
						exec [dbo].[WQ1075_Equalizer_Gov_Scrubs]
						END																						
						BEGIN
						exec [dbo].[WQ1075_Equalizer_Non_Gov_Scrubs]
						END
		
						BEGIN 
						exec [dbo].[WQ1075_Equalizer_Gov_Users]
						END																						
						BEGIN 
						exec [dbo].[WQ1075_Equalizer_Non_Gov_Users]
						END	
                       
                      BEGIN
                      exec [dbo].[WQ1075_Answers]
                        END
                        BEGIN
                        exec [dbo].[Billing_GetTargetValues_ProdTracking]
                        END
                     
                        `)
                    }

                   
                } catch (err) {
                    io.emit('update-loader', {})
                    await sql.query(`UPDATE ${Model} set [UploadDateTime] = '${getDateTime()}' where [Status] = 'Review'`)

                }
               

                // await sql.query(`
                //         exec  [dbo].[Update_Status_And_Date] 
                //         exec  [dbo].[DELETE_DUPS]
                //         exec [dbo].[Update_By_User_WQ1075]
                //         exec [dbo].[Update_By_User_WQ5508]
                //         exec [dbo].[WQ1075_Equalizer_Gov_Users]
                //         exec [dbo].[WQ1075_Equalizer_Non_Gov_Users]
                //         exec [dbo].[Update_WQ5508_From_WQ1075]
                //         UPDATE WQ1075 set [HasChild] = NULL
                //         DELETE FROM WQ1075Answers
                //         INSERT INTO WQ1075Answers( [CPT Code],[WQID], [Patient MRN], [Svc Date], [Research IRB])	
                //         Select	value, t1.[ID],  t1.[Patient MRN], t2.[Svc Date],t1.[Research IRB]
                //         FROM [HIMSRB].[dbo].[WQ1075] t1 left JOIN WQ1075Answers t2 ON t1.[ID] = t2.[WQID] 
                //         CROSS APPLY STRING_SPLIT(REPLACE(t1.[CPT Codes], ' ', '' ), ',')
                //         where t1.[HasChild] IS NULL
                //         exec [dbo].[Billing_GetTargetValues_ProdTracking]

                //         `)


                io.emit('update-loader', {})
                await sql.query(`UPDATE ${Model} set [UploadDateTime] = '${getDateTime()}' where [Status] = 'Review'`)



            }).catch(err => {
                console.log(err)
                console.log('error')
                  io.emit('update-loader', {})

                cb(false)
            });

    } catch (err) {
        console.log(err)
        io.emit('update-loader', {})
        cb(false)
    }

}



endpoints.upload = async (req, res) => {
    try {


        let entity = Model

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


const getObject = (obj) => {
    return obj.map((o) => {

        return {
            'Error': o['Error'] ? o['Error'].toString() : '',
            'Notes': o['Notes'] ? o['Notes'].toString().replace(/'/g, "''") : '',
            'Process Type': o['Process Type'] ? o['Process Type'].toString() : '',
            'Svc Date': o['Svc Date'] ? o['Svc Date'].toISOString().split('T')[0] : '',
            'Patient MRN': o['Patient MRN'] ? o['Patient MRN'].toString() : '',
            'Status': o['Status'] ? o['Status'].toString() : '',
            'Patient': o['Patient'] ? o['Patient'].toString() : '',
            'Research IRB': o['Research IRB'] ? o['Research IRB'].toString() : '',
            'CPT Codes': o['CPT Codes'] ? o['CPT Codes'].toString() : '',
            'Gov Cov Flag': o['Gov Cov Flag'] ? o['Gov Cov Flag'].toString() : '',
            'Sess Amount': o['Sess Amount'] ? o['Sess Amount'].toString() : '',
            'Primary Coverage': o['Primary Coverage'] ? o['Primary Coverage'].toString() : '',
            'Study Type': o['Study Type'] ? o['Study Type'].toString() : '',
            'Study Status': o['Study Status'] ? o['Study Status'].toString() : '',
            'Days Until Timely Filing': o['Days Until Timely Filing'] ? o['Days Until Timely Filing'].toString() : '',
            'Aging Days': o['Aging Days'] ? o['Aging Days'].toString() : '',
            'Color': o['Color'] ? o['Color'].toString() : '',
            'User': o['User'] ? o['User'].toString() : '',
            'UserAssigned': o['UserAssigned'] ? o['UserAssigned'].toString() : '',
            'ActionTimeStamp': o['ActionTimeStamp'] ? new Date(o['ActionTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'UploadDateTime': o['UploadDateTime'] ? new Date(o['UploadDateTime']).toISOString().split('.')[0].replace('T', ' ') : '',
            'StartTimeStamp': o['StartTimeStamp'] ? new Date(o['StartTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'FinishTimeStamp': o['FinishTimeStamp'] ? new Date(o['FinishTimeStamp']).toISOString().split('.')[0].replace('T', ' ') : '',
            'Duration': o['Duration'] ? o['Duration'].toString() : '',
        }
    })

}




endpoints.exports = async (req, res) => {
    try {

        const workbook = XLSX.utils.book_new();

        let { recordset: objects1 } = await sql.query(`select * from ${Model} where Status = 'Review'`)
        let data = await getObject(objects1)
        var worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!autofilter'] = { ref: "A1:Y1" };
        worksheet['!cols'] = fitToColumn(data[0])

        XLSX.utils.book_append_sheet(workbook, worksheet, 'All');


        let users = await adminContoller.getPbUsers()

        users = users.filter((u) => u.ManagementAccess != 1 && u.First !== "Bernadette")

        for (let i = 0; i < users.length; i++) {
            let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].First}' and Status  IN ('Review')`)
            let data = await getObject(objects1)
            const worksheet = XLSX.utils.json_to_sheet(data);
            worksheet['!autofilter'] = { ref: "A1:Y1" };
            worksheet['!cols'] = fitToColumn(data[0])

            XLSX.utils.book_append_sheet(workbook, worksheet, users[i].First);

        }


        let file = `${Model}_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

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