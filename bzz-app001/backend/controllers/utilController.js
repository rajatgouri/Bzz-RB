const { promisify } = require("es6-promisify");
const { response } = require("express");
var sql = require("mssql");
const socket = require("../socket");
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ScrubIRBModel = 'Agenda';
var sqlConnection = require('../sql');
const { logo } = require("../Utils/logo");
const mailer = require("./mailController");
const cron = require('node-cron');

const DailyCheckmarkModal = "DailyCheckmark"
const PBKPIs = 'TotalPBKPIs'
const HBKPIs = 'TotalHBKPIs'



// KPI are recorded at 3:00 and reset at 3:10 


const timer = () => new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000))

exports.getDateTime = () => {

  var date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  var hours = (new Date(date).getHours())
  var minutes = (new Date(date).getMinutes())
  var seconds = (new Date(date).getSeconds())
  var offset = (new Date(date).getTimezoneOffset())

  var year = (new Date(date).getFullYear())
  var month = (new Date(date).getMonth())
  var currentDate = (new Date(date).getDate())

  var fullDate = year


  if (month < 9) {
    month = ('0' + (month + 1))
    fullDate += "-" + month

  } else {
    month = (month + 1)
    fullDate += "-" + month
  }

  if (hours < 10) {
    hours = ('0' + hours.toString())
  } else {
    hours = (hours)
  }

  if (minutes < 10) {
    minutes = ('0' + minutes)
  } else {
    minutes = (minutes)
  }

  if (seconds < 10) {
    seconds = ('0' + seconds)
  } else {
    seconds = (seconds)
  }


  if (currentDate < 10) {
    currentDate = ('-0' + currentDate)
    fullDate += currentDate
  } else {
    currentDate = ('-' + currentDate)
    fullDate += currentDate
  }

  return (fullDate + "T" + hours + ":" + minutes + ":" + seconds + "." + "480Z")

}




exports.checkmark = async (Model, EMPID, cb) => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 23 && minutes == 56) {
    let { recordset: arr } = await sql.query(
      `select * from ${Model} where EMPID = ${EMPID}`
    );

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].Total == null || arr[i].Total < 4) {  //0 < 4 || =null 

        let sum = (arr[i]['Mon'] ? arr[i]['Mon'] : 0) + (arr[i]['Tue'] ? arr[i]['Tue'] : 0) + (arr[i]['Wed'] ? arr[i]['Wed'] : 0) + (arr[i]['Thu'] ? arr[i]['Thu'] : 0) + (arr[i]['Fri'] ? arr[i]['Fri'] : 0) + (arr[i]['Sat'] ? arr[i]['Sat'] : 0) + (arr[i]['Sun'] ? arr[i]['Sun'] : 0);
        let updateQuery = `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week${(arr[i].Total == null || arr[i].Total == 0) ? 1 : (arr[i].Total + 1)}=${sum >= 5 ? 1 : 0}  where ID = ${arr[i].ID}`
        await sql.query(updateQuery);
      }

      if ((arr[i].Total + 1) == 4) {

        let { recordset: arr1 } = await sql.query(
          `select * from ${Model} where EMPID = ${EMPID}`
        );

        let sum = (arr1[i]['Week1'] ? arr1[i]['Week1'] : 0) + (arr1[i]['Week2'] ? arr1[i]['Week2'] : 0) + (arr1[i]['Week3'] ? arr1[i]['Week3'] : 0) + (arr1[i]['Week4'] ? arr1[i]['Week4'] : 0);
        let badge = 0
        if (sum == 4) {
          badge = 1
        }
        await sql.query(
          `update ${Model} set  Total = 4 , Badge=${badge}  where EMPID = ${arr1[i].EMPID}`
        );
      }

    }
    cb(true)
  }
}


exports.checkmark1 = async (Model, userModel, section = 'PB') => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date().toLocaleString("en-US", { weekday: 'short', timeZone: "America/Los_Angeles" })
  let dt = this.getDateTime().split('T')[0]


  const hours = (new Date(date).getHours())

  const minutes = (new Date(date).getMinutes())

  if (hours == 23 && minutes == 58) {

    const { recordset: result } = await sql.query(
      `select * from ${userModel} where  SubSection IN ('${section}', 'RBB')  and EMPL_STATUS NOT IN ('T', 'Archive')`
    );


    result.map(async (user) => {

      let EMPID = user.EMPID;
      let { recordset: arr } = await sql.query(
        `select * from ${Model} where EMPID = ${EMPID}`
      );

      let firstDay = user.StartDay;
      let lastDay = (days[days.indexOf(firstDay) + 4])




      if (day == (lastDay) && (arr.length > 0) && (arr[0].Date.toISOString().split('T')[0] != dt)) {

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].Total < 4 || arr[i].Total == null) {
            let updateQuery = ''

            if (arr[i].Total == 0 || arr[i].Total == null) {
              updateQuery = ` update ${Model} set  Mon= 0, Tue=0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0,  Total=1, [Date]='${dt}' where EMPID = '${arr[i].EMPID}'`
            } else {
              updateQuery = ` update ${Model} set  Mon= 0, Tue=0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0,  Total=${(arr[i].Total + 1)},[Date]='${dt}' where EMPID = '${arr[i].EMPID}'`
            }

            await sql.query(updateQuery);
          }

          if ((arr[i].Total + 1) == 4) {


            await sql.query(
              `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week1 = 0 , Week2= 0 , Week3 = 0, Week4 = 0, Total=0, [Date]='${dt}'  where EMPID = '${EMPID}' `
            );
          }
        }
      }

    })
  }
}


exports.BadgeDisappearAfter48Hours = async (Model, cb) => {
  // badge disappers code
  var date1 = new Date();
  var utcDate1 = new Date(date1.toUTCString());
  utcDate1.setHours(utcDate1.getHours() - 7);
  var usDate = new Date(utcDate1)

  const { recordset: arr } = await sql.query(
    `select * from ${Model}`
  );


  for (let i = 0; i < arr.length; i++) {
    if ((usDate - arr[i].ActionTimeStamp) > 0) {
      await sql.query(
        `update ${Model} set AdminAssignedBadge = ${null}, ActionTimeStamp = ${null} where ID = ${arr[i].ID}`
      );
    }
  }
}



exports.ResetDays = async (userModel, Model, section = 'PB') => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())
  const day = (new Date(date).getDay())
  const year = (new Date(date).getFullYear())

  if (day == 5 && hours == 23 && minutes == 55) {

    const { recordset: user } = await sql.query(
      `select * from ${userModel} where   and SubSection IN ('${section}', 'RBB')  and EMPL_STATUS NOT IN ('T', 'Archive')`
    );

    user.map(async (u) => {
      const { recordset } = await sql.query(
        `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0 where EMPID = ${u.EMPID}`
      );
    })
  }
}

exports.Absent = async (calendarModel, userModel, Model, cb) => {

  var date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  var hours = (new Date(date).getHours())
  var minutes = (new Date(date).getMinutes())

  var day = new Date().getDay()


  var year = (new Date(date).getFullYear())
  var month = (new Date(date).getMonth())
  var currentDate = (new Date(date).getDate())

  var fullDate = year


  if (month < 9) {
    month = ('0' + (month + 1))
    fullDate += "-" + month

  } else {
    month = (month + 1)
    fullDate += "-" + month
  }

  if (currentDate < 10) {
    currentDate = ('-0' + currentDate)
    fullDate += currentDate
  } else {
    currentDate = ('-' + currentDate)
    fullDate += currentDate
  }



  if (hours == 13 && minutes == 09) {
    const { recordset: result } = await sql.query(
      `SELECT * FROM  ${calendarModel} WHERE month(WhenPosted) = ${month} and year(WhenPosted)= ${year}`
    );


    let getTodayResults = (result.filter(res => res['WhenPosted'].toISOString().split("T")[0] == fullDate));


    getTodayResults.map(async (res) => {
      const { recordset: user } = await sql.query(
        `select * from ${userModel}  where EMPID = '${res.LoginNumber}'`
      );

      if (user[0]) {

        const EMPID = (user[0].EMPID)

        let firstDay = user[0].StartDay;
        let lastDay = (days[days.indexOf(firstDay) + 4])

        let workingDays = days.slice(days.indexOf(firstDay), days.indexOf(firstDay) + 5)

        if (workingDays.indexOf(days[day]) < 0) {
          return
        }

        let updateQuery = `update ${Model} set ${days[day]} = 1  where EMPID = ${EMPID}`
        await sql.query(updateQuery);

        if (days[day] == lastDay) {
          cb(EMPID)
        }
      }

    })
  }
}

exports.updateStudyStatusOfWQ1262 = async () => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())
  const day = (new Date(date).getDay())



  const { recordset: results } = await sql.query(
    `SELECT ID, [Acct ID], Code, [Patient MRN] FROM WQ1262 where [Study Status] IS NULL and [Status] = 'Review'`
  );

  for (let i = 0; i < results.length; i++) {
    let { recordset } = await sqlConnection.query(`
  SELECT TOP(1) * FROM
    (SELECT 
      hspa.[HSP_ACCOUNT_ID] [Acct ID]
     ,p.[PAT_MRN_ID] [MRN]
     ,rsi.[IRB_APPROVAL_NUM] [Code]
     ,est.[NAME] [STUDY_STATUS]  
     ,rst.[NAME] [STUDY_TYPE]
      FROM 
      [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] p    WITH (NOLOCK)        
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] eri WITH (NOLOCK) ON p.[PAT_ID]=eri.[PAT_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_ENROLL_STATUS] est WITH (NOLOCK) ON eri.[ENROLL_STATUS_C]=est.ENROLL_STATUS_C
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsi WITH (NOLOCK) ON eri.[RESEARCH_STUDY_ID]=rsi.[RESEARCH_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa WITH (NOLOCK) ON p.[PAT_ID]=hspa.[PAT_ID]
      LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_STUDY_TYPE] rst WITH (NOLOCK) ON rsi.[STUDY_TYPE_C]=rst.[STUDY_TYPE_C]
    ) as A
    where Code = '${results[i]['Code']}' and MRN = '${results[i]['Patient MRN']}' and [Acct ID] =  '${results[i]['Acct ID']}'
  `)

    if (recordset && recordset[0]) {
      await sql.query(`UPDATE WQ1262 set [Study Type] = ${recordset[0]['STUDY_TYPE'] ? "'" + recordset[0]['STUDY_TYPE'] + "'" : null},  [Study Status] = ${recordset[0]['STUDY_STATUS'] ? "'" + recordset[0]['STUDY_STATUS'] + "'" : null} where ID = '${results[i].ID}'`)

    }

  }



}



// var SOCs = []

// let splitArray = (array, parts) => {
//   let result = [];
//   for (let i = parts; i > 0; i--) {
//       result.push(array.splice(0, Math.ceil(array.length / i)));
//   }
//   return result;
// }

// const populateSOCs = async() => {

//   try {

//     if(SOCs.length <= 1) {
//       updateSOCFlagOfWQ1262()
//       this.updateStudyStatusOfWQ1262()
//       return
//     } 

//     let parts = SOCs.length/20
//     if (parts< 1) {
//       parts =1
//     }

//     let result = splitArray(SOCs, parts)

//     for (let i=0; i< result.length ; i++) {

//       let HAR =   result[i].map(r => r['Acct ID']).join(',') 


//       let {recordset} = await sqlConnection.query(`
//       USE [FI_DM_HIMS_ICD]
//       DECLARE @vHAR NVARCHAR(MAX) = '${HAR}'
//       ;WITH OGT AS
//       (SELECT X.[Value] [HAR], NULL [Source], NULL [SOC Flag] from  string_split(@vHAR, ',') X)
//       ,WQ62HARs AS
//       (SELECT DISTINCT  pat.[PAT_ID], pat.[PAT_MRN_ID] [MRN], wqi.[HSP_ACCOUNT_ID] [HAR]
//         FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCT_WQ_ITEMS] wqi
//         INNER JOIN string_split(@vHAR, ',') X ON wqi.[HSP_ACCOUNT_ID]=X.[Value]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa ON wqi.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON hspa.[PAT_ID]=pat.[PAT_ID]
//       WHERE wqi.[WORKQUEUE_ID]='1262')
//       ,HspTran1 AS
//       (SELECT DISTINCT
//               hspt1.[HSP_ACCOUNT_ID] [HAR]
//              ,'HSP Transaction' [Source]
//              ,CASE WHEN rshi.[IRB_APPROVAL_NUM] IS NULL THEN 'SOC' ELSE 'Study-Related' END [SOC Flag]
//       FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt1
//        INNER JOIN string_split(@vHAR, ',') X ON hspt1.[HSP_ACCOUNT_ID]=X.[Value]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa WITH (NOLOCK) ON hspt1.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PAT_ENC_RSH] rshe WITH (NOLOCK) ON hspt1.[PAT_ENC_CSN_ID]=rshe.[PAT_ENC_CSN_ID]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ORD_RESEARCH_CODE] rsho WITH (NOLOCK) ON hspt1.[ORDER_ID]=rsho.[ORDER_ID]
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rshi WITH (NOLOCK) ON COALESCE(hspt1.[RESEARCH_STUDY_ID], hspa.[RESEARCH_ID], rshe.[ENC_RESEARCH_ID], rsho.[RESEARCH_CODE_ID])=rshi.[RESEARCH_ID]
//       WHERE  rshi.[IRB_APPROVAL_NUM] IS NOT NULL)
//       ,
//       Result1 AS (
//        SELECT DISTINCT ogt.[HAR], hspt0.[Source] [Source], hspt0.[SOC Flag] [SOC Flag] FROM OGT ogt
//       LEFT JOIN HspTran1 hspt0 ON ogt.[HAR]=hspt0.[HAR]
//       )
//       , ScreenPeriod AS
//       (SELECT [MRN]
//              ,[HAR]
//              ,[Research IRB]
//              ,[EPIC Arm]
//              ,CAST(COALESCE([Consented],DATEADD(day,-30,COALESCE([Enrolled - Active],GETDATE()))) AS DATE) [Consented]
//              ,CAST(COALESCE([Enrolled - Active],DATEADD(day,30,COALESCE([Consented],GETDATE()))) AS DATE) [Enrolled - Active]
//        FROM
//             (SELECT pat.[PAT_MRN_ID] [MRN]
//                   ,hspa.[HSP_ACCOUNT_ID] [HAR]
//                   ,rsh.[IRB_APPROVAL_NUM] [Research IRB]
//                   ,rsb.[BRANCH_NAME] [EPIC Arm]
//                   ,esc0.[NAME] [Status]
//                   ,MIN(CAST(eih.[HX_MOD_DTTM] AS DATE)) [Date]
//               FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO_HX] eih WITH (NOLOCK)
//               LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_ENROLL_STATUS] esc0 WITH (NOLOCK) ON eih.[HX_MOD_STATUS_C]=esc0.[ENROLL_STATUS_C]
//               LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] ei WITH (NOLOCK) ON eih.[ENROLL_ID]=ei.[ENROLL_ID]
//               LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] pat WITH (NOLOCK) ON ei.[PAT_ID]=pat.[PAT_ID]
//               INNER JOIN (
//                   select hspa.*
//                   from [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa
//                   INNER JOIN (SELECT [HAR] from Result1 where [SOC Flag] IS NULL)  X ON hspa.[HSP_ACCOUNT_ID]=X.[HAR]
//               ) hspa ON pat.[PAT_ID]=hspa.[PAT_ID]
//               LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsh WITH (NOLOCK) ON ei.[RESEARCH_STUDY_ID]=rsh.[RESEARCH_ID]
//               LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_STUDY_BRANCHES] rsb WITH (NOLOCK) ON ei.[RESEARCH_STUDY_ID]=rsb.[RESEARCH_ID] AND ei.[STUDY_BRANCH_ID]=rsb.[BRANCH_ID]
//               WHERE hspa.[HSP_ACCOUNT_ID] IS NOT NULL
//               GROUP BY pat.[PAT_MRN_ID]
//                ,hspa.[HSP_ACCOUNT_ID]
//                ,rsh.[IRB_APPROVAL_NUM]
//                ,rsb.[BRANCH_NAME]
//                ,esc0.[NAME]) t
//             PIVOT(
//                 MIN([Date])
//                 FOR [Status] IN (
//                     [Consented],
//                     [Enrolled - Active])
//                   ) AS pivot_table)
//       ,ScreenPeriodDatesListed AS
//       (SELECT * FROM ScreenPeriod scp1
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[GenerateDateRange]('2017-01-01', GETDATE(), 1) Cal  ON cal.[DateValue] BETWEEN scp1.[Consented] AND scp1.[Enrolled - Active])
//       ,HARinHSPTWithinScreenPeriod AS
//       (SELECT DISTINCT hspt1.[HSP_ACCOUNT_ID] [HAR], 'Screening Period' [Source], 'Study-Related' [SOC Flag]--, scp.*, hspt1.[SERVICE_DATE]
//        FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt1
//        INNER JOIN (SELECT [HAR] from Result1 where [SOC Flag] IS NULL)  X ON hspt1.[HSP_ACCOUNT_ID]=X.[HAR]
//        INNER JOIN ScreenPeriodDatesListed scpdl ON hspt1.[HSP_ACCOUNT_ID]=scpdl.[HAR] AND CAST(hspt1.[SERVICE_DATE] AS DATE)=scpdl.[DateValue])
//       , Result2 AS (
//        SELECT DISTINCT r1.[HAR], COALESCE(r1.[Source], hscp0.[Source]) [Source], COALESCE(r1.[SOC Flag], hscp0.[SOC Flag]) [SOC Flag] FROM Result1 r1
//       LEFT JOIN HARinHSPTWithinScreenPeriod hscp0 ON r1.[HAR]=hscp0.[HAR]
//       )
//        ,ExtFiveDigit AS
//       (SELECT
//               hspt.[HSP_ACCOUNT_ID]
//              ,hspa.[PAT_ID]
//              ,hnt.[NOTE_ID]
//              ,[FI_DM_HIMS_ICD].[dbo].[udf_ExtractNumberFromString](hnt.[NOTE_TEXT]) [FiveDigit]
//         FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_TRANSACTIONS] hspt
//         INNER JOIN (SELECT [HAR] from Result2 where [SOC Flag] IS NULL) X ON hspt.[HSP_ACCOUNT_ID]= X.[HAR]
//         INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HSP_ACCOUNT] hspa ON hspt.[HSP_ACCOUNT_ID] = hspa.[HSP_ACCOUNT_ID]
//         INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HNO_INFO] hno ON hspa.[PAT_ID] = hno.[PAT_ID] AND CAST(hspt.[SERVICE_DATE] AS DATE)=CAST(hno.[DATE_OF_SERVIC_DTTM] AS DATE)
//         INNER JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_HNO_NOTE_TEXT] hnt ON hno.[NOTE_ID]=hnt.[NOTE_ID]
//         )
//       ,EFDList AS
//       (SELECT DISTINCT
//             [HSP_ACCOUNT_ID]
//            ,[PAT_ID]
//            ,[NOTE_ID]
//            ,value as IRB
//       FROM  ExtFiveDigit t1 CROSS APPLY STRING_SPLIT(REPLACE(t1.[FiveDigit], ' ', '' ), ','))
//       ,EnrolInfo AS
//       (SELECT DISTINCT [PAT_ID], [IRB_APPROVAL_NUM] FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_ENROLL_INFO] eni
//       LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsh ON eni.[RESEARCH_STUDY_ID]=rsh.[RESEARCH_ID])
//       ,ActualIRBsInNotes AS
//       (SELECT
//             [HSP_ACCOUNT_ID]
//            ,el.[PAT_ID]
//            ,[NOTE_ID]
//            ,[IRB]
//       FROM EFDList el
//       INNER JOIN EnrolInfo eni ON el.[PAT_ID]=eni.[PAT_ID] AND el.[IRB]=eni.[IRB_APPROVAL_NUM])
//       ,Result3 AS
//       (SELECT DISTINCT [HSP_ACCOUNT_ID] [HAR], 'Notes for IRB '+[IRB] [Source], 'Study-Related' [SOC Flag] FROM ActualIRBsInNotes)
//       SELECT DISTINCT r2.[HAR], COALESCE(r2.[Source], r3.[Source], 'N/A') [Source], COALESCE(r2.[SOC Flag], r3.[SOC Flag], 'SOC') [SOC Flag] FROM Result2 r2
//       LEFT JOIN Result3 r3 ON r2.[HAR]=r3.[HAR]



//     `)


//     if(i == result.length -1) {
//       console.log('last')
//       updateSOCFlagOfWQ1262()
//     }

//     if(!recordset) {
//       for (let i=0 ; i< result[i].length ; i++) {
//         await sql.query(`UPDATE WQ1262 set [SOC Flag] =  'N/A'  where [Acct ID] IN (${HAR} )`)  
//       }
//     } else {
//       for (let i=0 ; i< recordset.length ; i++) {
//         await sql.query(`UPDATE WQ1262 set [SOC Flag] = ${recordset[i]['SOC Flag'] ? "'" +recordset[i]['SOC Flag'] + "'" : 'N/A' } where [Acct ID] IN ( '${recordset[i]['HAR']}')`)  

//       }
//     }


//     await sql.query(`
//     exec  [dbo].[POPULATE_WQ1262_Category_Column] 
//     BEGIN
//     exec  [dbo].[POPULATE_WQ1262_Ratio_Column]
//     END

//     `)


//     }
//   }
//    catch (err) {
//     updateSOCFlagOfWQ1262()
//  }



// }


// const updateSOCFlagOfWQ1262 = async ( ) => {


//     const { recordset : results} = await sql.query(
//            `
//            SELECT [Acct ID],  [UserAssigned], CAST([UploadDateTime] as Date) FROM WQ1262
//            where ([SOC Flag] IS NULL ) 
//            GROUP BY [Acct ID], [UserAssigned], CAST([UploadDateTime] as Date)
//             order by  
//            case when [UserAssigned] IN ( 'Julie') then 1 else 2 end,
//            case when [UserAssigned] IN ( 'Anna') then 3 else 4 end,
//             [UserAssigned] ASC, CAST([UploadDateTime] as Date) DESC`

//     );

//     console.log('result is ,', results.length)
//     if (!results || results.length < 1) {

//       let interval = setInterval(async() => {
//         const { recordset : results1} = await sql.query(
//           `
//           SELECT [Acct ID],  [UserAssigned], CAST([UploadDateTime] as Date) FROM WQ1262
//           where ([SOC Flag] IS NULL ) 
//           or ([SOC Flag] = 'N/A' AND [UploadDateTime] < '${this.getDateTime().split('T')[0]}')
//           GROUP BY [Acct ID], [UserAssigned], CAST([UploadDateTime] as Date)
//            order by  
//           case when [UserAssigned] IN ( 'Julie') then 1 else 2 end,
//           case when [UserAssigned] IN ( 'Anna') then 3 else 4 end,
//            [UserAssigned] ASC, CAST([UploadDateTime] as Date) DESC`
//           );

//           console.log('checking for Socs')
//           if(results1.length > 0) {
//             updateSOCFlagOfWQ1262()
//             clearInterval(interval)
//           }
//       }, 50000)

//       return
//     }

//     SOCs = results.filter((r) => r['Acct ID'] != null && r['Acct ID'] != '' )
//     populateSOCs()


// }

// setTimeout(async() => {

//   updateSOCFlagOfWQ1262()
// }, 30000)




exports.addWeekDataToKPIs = async (userModel = 'JWT') => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())
  const day = (new Date(date).getDay())


  if (day == 6 && hours == 06 && minutes == 01) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementCard!= 1 and SubSection IN ('PB', 'RBB') and EMPL_STATUS NOT IN ('T', 'Archive')`
    );

    recordset.map(async (u) => {

      await sql.query(`
        
        INSERT INTO WeeklyPBKPIs 
        SELECT 
        ${u.EMPID},
        '${u.First}',
        SUM([WQ5508AmountRemoved]) as WQ5508AmountRemoved,
        SUM([WQ5508ChargesProcessed]) as WQ5508ChargesProcessed,
        SUM([WQ1075AmountRemoved]) as WQ1075AmountRemoved,
        SUM([WQ1075ChargesProcessed]) as WQ1075ChargesProcessed,
        SUM([WQ5508AccountsProcessed]) as WQ5508AccountsProcessed,
        SUM([WQ1075AccountsProcessed]) as WQ1075AccountsProcessed,
        SUM([WQ5508EODCharges]) as WQ5508EODCharges,
        SUM([WQ1075EODCharges]) as WQ1075EODCharges,
        CURRENT_TIMESTAMP as ActionTimeStamp
        from TotalPBKPIs where ActionTimeStamp  
        BETWEEN DATEADD(DAY, -7, GETDATE()) AND 
        DATEADD(DAY, 1, GETDATE()) AND 
        [User] = '${u.First}' 
        `)


    })
  }

}


exports.addDataToKPIs = async (userModel, progressModel1, progressModel2, progressModel3, WQ1 = 'WQ5508', WQ2 = 'WQ1075', WQ3 = 'WQ3177') => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 00 && minutes == 02) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where( ManagementCard!= 1 or ManagementCard IS NULL) and SubSection IN ('PB', 'RBB')`
    );

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

    let day = date1.getDay()
    date1 = date1.toISOString().split('T')[0]

    recordset.map(async (u) => {


      let workingDays = days.slice(days.indexOf(u.StartDay), days.indexOf(u.StartDay) + 5)


      if (workingDays.indexOf(days[day]) < 0) {
        return
      }


      const { recordset: result1 } = await sql.query(`
      SELECT 
      [value] as IRB 
  FROM ${ScrubIRBModel} t1
  CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
  where [SCRUB STATUS] = '0'
     `)
      let scrubIRBs = (result1.map((i) => i.IRB))

      const [{ recordset: wq1charges }, { recordset: wq1 }, { recordset: wq1EODCharges }, { recordset: wq2charges }, { recordset: wq2 }, { recordset: wq2EODCharges }, { recordset: wq3charges }, { recordset: wq3 }, { recordset: wq3EODCharges }, { recordset: wq1Assigned }, { recordset: wq2Assigned }, { recordset: wq3Assigned }, { recordset: wq1BP }, { recordset: wq2BP }, { recordset: wq3BP }, {recordset: WQ5508Audits}, {recordset: WQ1075Audits}, {recordset: PBAudits}] = await Promise.all([
        await sql.query(`SELECT 
          COUNT(*) as Charges,
          COUNT(DISTINCT([Patient MRN])) as Accounts
          FROM ${progressModel1}
          WHERE [User] = '${u.First}' AND 
          [Status] NOT IN ('Review') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        SUM ([Sess Amount]) as Amounts
        FROM ${progressModel1}
        WHERE [User] = '${u.First}' AND 
        [Status] IN ('Done') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),


        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${progressModel1}
        WHERE [UserAssigned] = '${u.First}' AND ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) AND
        [Status]  NOT IN ('Done') ` ),


        await sql.query(`SELECT 
          COUNT(*) as Charges,
          COUNT(DISTINCT([Patient MRN])) as Accounts
          FROM ${progressModel2}
          WHERE [User] = '${u.First}' AND 
          [Status] NOT IN ('Review') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        SUM ([Sess Amount]) as Amounts
        FROM ${progressModel2}
        WHERE [User] = '${u.First}' AND 
        [Status] IN ('Done') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        COUNT (*) as count
         FROM ${progressModel2}
        WHERE [UserAssigned] = '${u.First}' AND ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)  AND
        [Status]  NOT IN ('Done') ` ),




        await sql.query(`SELECT 
          COUNT(*) as Charges,
          COUNT(DISTINCT([Patient MRN])) as Accounts
          FROM ${progressModel3}
          WHERE [User] = '${u.First}' AND 
          [Status] NOT IN ('Review') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        SUM ([Amount Due]) as Amounts
        FROM ${progressModel3}
        WHERE [User] = '${u.First}' AND 
        [Status] IN ('Done') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        COUNT (*) as count
         FROM ${progressModel3}
        WHERE [UserAssigned] = '${u.First}' AND ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL)  AND
        [Status]  NOT IN ('Done') ` ),


        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ1}
        WHERE [UserAssigned] = '${u.Nickname}'  and
        ([Status] = 'Review' or
        [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ')`),

        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ2}
        WHERE [UserAssigned] = '${u.Nickname}'  and
        ([Status] = 'Review' or
        [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ') `),

        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ3}
        WHERE [UserAssigned] = '${u.Nickname}'  and
        ([Status] = 'Review' or
        [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ') `),

        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ1}
        WHERE [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ' and [UserAssigned] !='${u.Nickname}' 
        and [User] = '${u.Nickname}'`),

        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ2}
        WHERE [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ' and [UserAssigned] !='${u.Nickname}' 
        and [User] = '${u.Nickname}'`),


        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ3}
        WHERE [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ' and [UserAssigned] !='${u.Nickname}' 
        and [User] = '${u.Nickname}'`),


        await sql.query(`
          SELECT COUNT(*) as count
          FROM [SA_WQAudit]
          WHERE [ActionTimeStamp] > '${date1}' and [User] = '${u.Nickname}' and [WQ_NUM] = '5508'
        `),

        await sql.query(`
          SELECT COUNT(*) as count
          FROM [SA_WQAudit]
          WHERE [ActionTimeStamp] > '${date1}' and [User] = '${u.Nickname}' and [WQ_NUM] = '1075'
        `),

        await sql.query(`
        SELECT COUNT(*) as count
        FROM [SA_WQAudit]
        WHERE [ActionTimeStamp] > '${date1}' and [User] = '${u.Nickname}' 
      `)

      ])


      // if(wq1.length>0 && wq2.length>0) {

      let wq1Data = wq1[0]
      let wq1DataCharges = wq1charges[0]
      let wq1EODCharges1 = wq1EODCharges[0]

      let wq2Data = wq2[0]
      let wq2DataCharges = wq2charges[0]
      let wq2EODCharges1 = wq2EODCharges[0]


      let wq3Data = wq3[0]
      let wq3DataCharges = wq3charges[0]
      let wq3EODCharges1 = wq3EODCharges[0]

      let wq5508Audits = WQ5508Audits
      let wq1075Audits = WQ1075Audits
      let pbAudits = PBAudits


      let { recordset: entry } = await sql.query(`Select EMPID from ${PBKPIs} where EMPID = ${u.EMPID} and ActionTimeStamp In ('${date1}')`)
      if (entry.length > 0) {
        return
      }



      await sql.query(`Insert into ${PBKPIs} (EMPID, [User], WQ5508AmountRemoved,  WQ1075AmountRemoved, WQ3177AmountRemoved, WQ5508ChargesProcessed, WQ1075ChargesProcessed, WQ3177ChargesProcessed, WQ5508AccountsProcessed, WQ1075AccountsProcessed, WQ3177AccountsProcessed, WQ5508EODCharges, WQ1075EODCharges, WQ3177EODCharges, WQ5508Assigned, WQ1075Assigned, WQ3177Assigned, WQ5508BonusProductivity, WQ1075BonusProductivity, WQ3177BonusProductivity, [WQ5508Audits] , [WQ1075Audits] , [PBAudits] ,ActionTimeStamp) values 
        (
          '${u.EMPID}',
          '${u.First}',
          '${wq1Data && wq1Data['Amounts'] ? parseInt(wq1Data['Amounts']) : 0}',
          '${wq2Data && wq2Data['Amounts'] ? parseInt(wq2Data['Amounts']) : 0}',
          '${wq3Data && wq3Data['Amounts'] ? parseInt(wq3Data['Amounts']) : 0}',

          '${wq1DataCharges && wq1DataCharges['Charges'] ? wq1DataCharges['Charges'] : 0}',
          '${wq2DataCharges && wq2DataCharges['Charges'] ? wq2DataCharges['Charges'] : 0}',
          '${wq3DataCharges && wq3DataCharges['Charges'] ? wq3DataCharges['Charges'] : 0}',

          '${wq1DataCharges && wq1DataCharges['Accounts'] ? wq1DataCharges['Accounts'] : 0}',
          '${wq2DataCharges && wq2DataCharges['Accounts'] ? wq2DataCharges['Accounts'] : 0}',
          '${wq3DataCharges && wq3DataCharges['Accounts'] ? wq3DataCharges['Accounts'] : 0}',

          '${wq1EODCharges1 && wq1EODCharges1['count'] ? wq1EODCharges1['count'] : 0}',
          '${wq2EODCharges1 && wq2EODCharges1['count'] ? wq2EODCharges1['count'] : 0}',
          '${wq3EODCharges1 && wq3EODCharges1['count'] ? wq3EODCharges1['count'] : 0}',

          '${wq1Assigned && wq1Assigned[0]['count'] ? wq1Assigned[0]['count'] : 0}',
          '${wq2Assigned && wq2Assigned[0]['count'] ? wq2Assigned[0]['count'] : 0}',
          '${wq3Assigned && wq3Assigned[0]['count'] ? wq3Assigned[0]['count'] : 0}',

          '${wq1BP && wq1BP[0]['count'] ? wq1BP[0]['count'] : 0}',
          '${wq2BP && wq2BP[0]['count'] ? wq2BP[0]['count'] : 0}',
          '${wq3BP && wq3BP[0]['count'] ? wq3BP[0]['count'] : 0}',

          '${wq5508Audits && wq5508Audits[0]['count'] ? wq5508Audits[0]['count'] : 0}',
          '${wq1075Audits && wq1075Audits[0]['count'] ? wq1075Audits[0]['count'] : 0}',
          '${pbAudits && pbAudits[0]['count'] ? pbAudits[0]['count'] : 0}',

          '${date1}'  
        )`)




      // }


    })
  }

}


exports.addHBDataToKPIs = async (userModel, progressModel1, WQ1 = 'WQ1262') => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 00 && minutes == 02) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementCard!= 1 and SubSection IN ('HB', 'RBB')`
    );

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

    let day = date1.getDay()
    date1 = date1.toISOString().split('T')[0]

    recordset.map(async (u) => {

      let workingDays = days.slice(days.indexOf(u.StartDay), days.indexOf(u.StartDay) + 5)

      if (workingDays.indexOf(days[day]) < 0) {
        return
      }


      const [{ recordset: wq1charges }, { recordset: wq1 }, { recordset: wq1EODCharges }, { recordset: wq1Assigned }, { recordset: wq1BP }, { recordset: WQHBAudit }] = await Promise.all([
        await sql.query(`SELECT 
          COUNT(*) as Charges,
          COUNT(DISTINCT([Patient MRN])) as Accounts
          FROM ${progressModel1}
          WHERE [User] = '${u.First}' AND 
          [Status] NOT IN ('Review') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),

        await sql.query(`SELECT 
        SUM ([Acct Bal]) as Amounts
        FROM ${progressModel1}
        WHERE [User] = '${u.First}' AND 
        [Status] IN ('Done') AND [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} '`),


        await sql.query(`SELECT 
        COUNT (*) as count
         FROM ${progressModel1}
        WHERE [UserAssigned] = '${u.First}'  AND
        [Status]  NOT IN ('Done') ` ),


        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ1}
        WHERE [UserAssigned] = '${u.Nickname}'  and
        ([Status] = 'Review' or
        [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ') `),


        await sql.query(`
        SELECT 
        COUNT (*) as count
         FROM ${WQ1}
        WHERE [ActionTimeStamp] > '${date1} ' AND  [ActionTimeStamp] < '${this.getDateTime().split('T')[0]} ' and [UserAssigned] !='${u.Nickname}' 
        and [User] = '${u.Nickname}'`),

        await sql.query(
          `
          SELECT COUNT(*) as count from 
          [SA_HB_WQAudit] WHERE [ActionTimeStamp] > '${date1}'
          and [User] = '${u.Nickname}'
          `


        )

      ])


      if (wq1.length > 0) {

        let wq1Data = wq1[0]
        let wq1DataCharges = wq1charges[0]
        let wq1EODCharges1 = wq1EODCharges[0]
        let wqHBAudit = WQHBAudit


        let { recordset: entry } = await sql.query(`Select EMPID from ${HBKPIs} where EMPID = ${u.EMPID} and ActionTimeStamp In ('${date1}')`)
        if (entry.length > 0) {
          return
        }

        await sql.query(`Insert into ${HBKPIs} (EMPID, [User], WQ1262AmountRemoved, WQ1262ChargesProcessed, WQ1262AccountsProcessed, WQ1262EODCharges, WQ1262Assigned, WQ1262BonusProductivity, [HBAudits], ActionTimeStamp) values 
        (
          '${u.EMPID}',
          '${u.First}',
          '${wq1Data && wq1Data['Amounts'] ? parseInt(wq1Data['Amounts']) : 0}',
          '${wq1DataCharges && wq1DataCharges['Charges'] ? wq1DataCharges['Charges'] : 0}', 
          '${wq1DataCharges && wq1DataCharges['Accounts'] ? wq1DataCharges['Accounts'] : 0}',
          '${wq1EODCharges1 && wq1EODCharges1['count'] ? wq1EODCharges1['count'] : 0}',
          '${wq1Assigned && wq1Assigned[0]['count'] ? wq1Assigned[0]['count'] : 0}',
          '${wq1BP && wq1BP[0]['count'] ? wq1BP[0]['count'] : 0}',
          '${wqHBAudit && wqHBAudit[0]['count'] ? wqHBAudit[0]['count'] : 0}',


          '${date1}'  
        )`)




      }


    })
  }

}


exports.productivityLog = async (userModel) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 23 && minutes == 30) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementCard!= 1 and SubSection IN ( 'HB', 'RBB')`
    );

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

    let day = date1.getDay()
    date1 = date1.toISOString().split('T')[0]

    recordset.map(async (u) => {

      let workingDays = days.slice(days.indexOf(u.StartDay), days.indexOf(u.StartDay) + 5)

      if (workingDays.indexOf(days[day]) < 0) {
        return
      }


      const { recordset: data } = await sql.query(`
      SELECT SUM([Units]) as Units, SUM (Minutes) as Minutes
      FROM [HIMSRB].[dbo].[ProductivityLog]
      where [DateTime] > '${this.getDateTime().split('T')[0]}' and [EMPID] = '${u.EMPID}'
    `)

      if (data[0].Units == null && data[0].Minutes == null) {
        await sql.query(`INSERT INTO ProductivityLogKPIs ([EMPID], [User], [Date], [Units], [Minutes]) values ('${u.EMPID}', '${u.Nickname}' , '${this.getDateTime().split('T')[0]}', 0,0)`)
      } else {
        await sql.query(`INSERT INTO ProductivityLogKPIs ([EMPID], [User], [Date], [Units], [Minutes]) values ('${u.EMPID}', '${u.Nickname}' , '${this.getDateTime().split('T')[0]}', ${data[0].Units},${data[0].Minutes})`)

      }

    })
  }

}






exports.UpdateDailyData = async (progressModel) => {


  const update = async () => {

    await sql.query(
      `update ${progressModel} set  KPI = null `
    );

  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if (hours == 00 && minutes == 10) {
    update()
  }
}





const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);



exports.UpdateHBHoursData = async (progressModel, userModel, wqModel) => {



  const update = async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where  SubSection IN ('HB', 'RBB') and EMPL_STATUS NOT IN ('T', 'Archive')`
    );


    const { recordset: result1 } = await sql.query(`
    SELECT 
    [value] as IRB 
FROM ${ScrubIRBModel} t1
CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
where [SCRUB STATUS] = '0'
 `)
    let scrubIRBs = (result1.map((i) => i.IRB))

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);
    date1 = date1.toISOString().split('T')[0]

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {

      var [
        { recordset: chargesProcessedCount },
        { recordset: chargesReviewCount },
        { recordset: chargesReview },
        { recordset: notToReview },
        { recordset: total },
        { recordset: amount },
        { recordset: charges },
        { recordset: result }
      ] = await Promise.all([
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status IN ('Done') and  ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and ([ActionTimeStamp] >= '${this.getDateTime().split('T')[0]}'  ) `),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status  IN ('Review') and  ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
        await sql.query(`Select count(*) as count  from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Review')  and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}'`),
        await sql.query(`Select * from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Done') and  ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL)`),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and ([Code] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Code] IS NULL) and ([ActionTimeStamp] >= '${this.getDateTime().split('T')[0]}' or [Status] = 'Review' ) `),

          await sql.query(`Select ISNULL(SUM([Acct Bal]),0) as count  from ${wqModel} where [User] = '${u.First}' and  Status In ('Done') and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}'`),
          await sql.query(`Select count(*) as count from ${wqModel} where [User] = '${u.First}' and Status NOT In ('Review') and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]} '`)
         ,
        await sql.query(`SELECT ID from ${wqModel} where [Process Type] = 'RN' and  Status = 'Review' and UserAssigned = '${u.First}'`)
      ])

      let data = {
        chargesProcessedCount,
        chargesReviewCount,
        chargesReview,
        notToReview,
        total,
        amount,
        charges
      }


      chargesProcessedCount = data.chargesReview[0]["count"] == 0 ? 0 : (data.chargesReview[0]["count"] / (data.total[0]["count"] ? data.total[0]["count"] : 1))
      chargesToReviewCount = data.chargesReviewCount[0]["count"]


      list = data.notToReview

      amount = list.map(li => li['Acct Bal']).sort((a, b) => b - a).slice(0, 5)
      amountReview = list.map(li => li['Acct Bal']).sort((a, b) => b - a).slice(0, 10)

      let agingDays = list.map(item => item['Aging Days'])
      let elements = [...new Set(agingDays)];

      let d1 = elements.map((element => {
        return ({
          name: element,
          value: countOccurrences(agingDays, element)
        })
      }))

      const sortedData = d1.sort((a, b) => b.name - a.name).slice(0, 5)
      // let {recordset: result} = await sql.query(`SELECT ID from ${wqModel} where [Process Type] = 'RN' and  Status = 'Review' and UserAssigned = '${u.First}'`)

      let hasRN = 0

      if (result.length > 0) {
        hasRN = 1
      }

      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(chargesProcessedCount * 100).toFixed(2)}, ChargesToReview = ${chargesToReviewCount} , AgingDays = '${JSON.stringify(sortedData)}', Amount = '${JSON.stringify(amount.slice(0, 5))}' , HasRN = ${hasRN}  where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (minutes % 1 == 0) {
    update()
  }


}



exports.Update3177HoursData = async (progressModel, userModel, wqModel) => {



  const update = async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where  SubSection IN ('PB', 'RBB') and EMPL_STATUS NOT IN ('T', 'Archive')`
    );

    const { recordset: result1 } = await sql.query(`
    SELECT 
    [value] as IRB 
FROM ${ScrubIRBModel} t1
CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
where [SCRUB STATUS] = '0'
 `)
    let scrubIRBs = (result1.map((i) => i.IRB))

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);
    date1 = date1.toISOString().split('T')[0]

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {

      var [{ recordset: chargesProcessedCount }, { recordset: chargesReviewCount }, { recordset: chargesReview }, { recordset: notToReview }, { recordset: total }, { recordset: amount }, { recordset: charges }] = await Promise.all([
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status IN ('Done') and  ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL)`),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status  IN ('Review') and  ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL) `),
        await sql.query(`Select count(*) as count  from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Review') and  ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL) and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}'`),
        await sql.query(`Select * from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Done') and  ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL)`),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and ([IRB Research Study No] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [IRB Research Study No] IS NULL) and ([ActionTimeStamp] >= '${this.getDateTime().split('T')[0]}' or [Status] = 'Review' ) `),

          await sql.query(`Select SUM([Amount Due]) as count  from ${wqModel} where UserAssigned = '${u.First}'  and  Status In ('Done') and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]} '`)
          ,
       
          await sql.query(`Select count([Amount Due]) as count from ${wqModel} where UserAssigned = '${u.First}' and Status NOT In ('Review')  and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]} '`)
        
      ])

      let data = {
        chargesProcessedCount,
        chargesReviewCount,
        chargesReview,
        notToReview,
        total,
        amount,
        charges
      }


      chargesProcessedCount = data.chargesReview[0]["count"] == 0 ? 0 : (data.chargesReview[0]["count"] / (data.total[0]["count"] ? data.total[0]["count"] : 1))
      chargesToReviewCount = data.chargesReviewCount[0]["count"]
      list = data.notToReview

      amount = list.map(li => li['Amount Due']).sort((a, b) => b - a).slice(0, 5)
      amountReview = list.map(li => li['Amount Due']).sort((a, b) => b - a).slice(0, 10)

      // let agingDays = list.map(item => item['Aging Days'])
      // let elements = [...new Set(agingDays)];

      // let d1 = elements.map((element => {
      //   return ({
      //     name: element,
      //     value: countOccurrences(agingDays, element)
      //   })
      // }))

      // const sortedData = d1.sort((a, b) => b.name - a.name).slice(0, 5)
      const sortedData = []

      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(chargesProcessedCount * 100).toFixed(2)}, ChargesToReview = ${chargesToReviewCount} , AgingDays = '${JSON.stringify(sortedData)}', Amount = '${JSON.stringify(amount.slice(0, 5))}'  where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const minutes = (new Date(date).getMinutes())

  if (minutes % 1 == 0) {
    update()
  }


}


exports.UpdateHoursData = async (progressModel, userModel, wqModel) => {



  const update = async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where  SubSection IN ('PB', 'RBB') and EMPL_STATUS NOT IN ('T', 'Archive')`
    );

    const { recordset: result1 } = await sql.query(`
    SELECT 
    [value] as IRB 
FROM ${ScrubIRBModel} t1
CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
where [SCRUB STATUS] = '0'
 `)
    let scrubIRBs = (result1.map((i) => i.IRB))

    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);
    date1 = date1.toISOString().split('T')[0]

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {

      var [{ recordset: chargesProcessedCount }, { recordset: chargesReviewCount }, { recordset: chargesReview }, { recordset: notToReview }, { recordset: total }, { recordset: amount }, { recordset: charges }] = await Promise.all([
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status IN ('Done') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) and ([ActionTimeStamp] >= '${this.getDateTime().split('T')[0]}' )`),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and Status  IN ('Review') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)  `),
        await sql.query(`Select count(*) as count  from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Review') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}'`),
        await sql.query(`Select * from ${wqModel} where UserAssigned = '${u.First}' and Status NOT IN ('Done') and  ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL)`),
        await sql.query(`Select count(*) as count from ${wqModel} where UserAssigned = '${u.First}' and ([Research IRB] NOT IN (${scrubIRBs.map((irb) => "'" + irb + "'")}) or  [Research IRB] IS NULL) and ([ActionTimeStamp] >= '${this.getDateTime().split('T')[0]}' or [Status] = 'Review' ) `),
        await sql.query(`Select ISNULL(SUM([Sess Amount]),0) as count  from ${wqModel} where [User] = '${u.First}'  and  Status In ('Done') and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]} '`),
        await sql.query(`Select count(*) as count from ${wqModel} where [User] = '${u.First}' and Status NOT In ('Review')  and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}'`)
        
      ])

      let data = {
        chargesProcessedCount,
        chargesReviewCount,
        chargesReview,
        notToReview,
        total,
        amount,
        charges
      }


      chargesProcessedCount = data.chargesReview[0]["count"] == 0 ? 0 : (data.chargesReview[0]["count"] / (data.total[0]["count"] ? data.total[0]["count"] : 1))
      chargesToReviewCount = data.chargesReviewCount[0]["count"]
      list = data.notToReview

      amount = list.map(li => li['Sess Amount']).sort((a, b) => b - a).slice(0, 5)
      amountReview = list.map(li => li['Sess Amount']).sort((a, b) => b - a).slice(0, 10)

      let agingDays = list.map(item => item['Aging Days'])
      let elements = [...new Set(agingDays)];

      let d1 = elements.map((element => {
        return ({
          name: element,
          value: countOccurrences(agingDays, element)
        })
      }))

      const sortedData = d1.sort((a, b) => b.name - a.name).slice(0, 5)


     
      let KPI = JSON.stringify({totalProcess : data.charges[0]['count'] , sessAmount : data.amount[0]['count'].toFixed(2) })
      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(chargesProcessedCount * 100).toFixed(2)}, ChargesToReview = ${chargesToReviewCount} , AgingDays = '${JSON.stringify(sortedData)}', Amount = '${JSON.stringify(amount.slice(0, 5))}' , [KPI] = '${KPI}' where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const minutes = (new Date(date).getMinutes())

  if (minutes % 1 == 0) {
    update()
  }


}




exports.UpdateOriginalUserAssigned = async (Model) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if (hours == 8 && minutes == 30) {
    await sql.query(`update ${Model} set OriginalUserAssigned = [UserAssigned] where   OriginalUserAssigned IS NULL and Status = 'Review'`);
  }
}

exports.GetSortOrder = (prop) => {
  return function (a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } else if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  }
}

exports.DailyCheckmark = async () => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if (hours == 23 && minutes == 50) {

    this.updatePageLoggerData()
    const [{ recordset: wq5508checkmark }, { recordset: wq1075checkmark }] = await Promise.all([
      await sql.query(
        `select * from WQ5508Checkmark`
      ),
      await sql.query(
        `select * from WQ1075Checkmark`
      )

    ])

    var currentDate = this.getDateTime().split('T')[0]

    let count = wq5508checkmark.length

    for (let i = 0; i < count; i++) {
      if (wq5508checkmark[i][days[day]] && wq1075checkmark[i][days[day]]) {
        sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${wq5508checkmark[i].EMPID}', '${currentDate}', 1)`);
      } else {
        const { recordset: user } = await sql.query(
          `select * from JWT where  EMPID = ${wq5508checkmark[i].EMPID}`
        );

        let firstDay = user[0].StartDay;

        let workingDays = days.slice(days.indexOf(firstDay), days.indexOf(firstDay) + 5)

        if (workingDays.indexOf(days[day]) < 0) {
          continue
        }

        sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${wq5508checkmark[i].EMPID}', '${currentDate}', 0)`);
      }

    }
  }


}



cron.schedule('1 5 8 * * 6', async () => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (process.env.NODE_ENV != "development") {

    try {
    await sqlConnection.query(`
    DECLARE @Startdate DATE=GETDATE()-8
    ;WITH PBWorkLog AS
    (SELECT
           wq.[WQ_NUM] AS [WQ_NUM]
           ,CASE crh.[RSH_REV_USER_ID] 
                 WHEN '201158' THEN 'Ferdinand' 
                 WHEN '202466' THEN 'Suzanne' 
                 WHEN '202674' THEN 'Anna Maria'
                 WHEN '201318' THEN 'Jannet'
                 WHEN '202875' Then 'Jacqueline'                             WHEN '215805' THEN 'Heather'                            WHEN '201497' THEN 'Beth'
            END [REVIEWED_USER]
           ,crh.[REVIEW_DATE]
           ,rsi.[IRB_APPROVAL_NUM] [REVIEWED_IRB]
           ,p.[PAT_MRN_ID]
           ,p.[PAT_NAME]
           ,CAST(t.[SERVICE_DATE] AS DATE) [SERVICE_DATE]
           ,SUM(t.[QTY]) [QTY]
           ,SUM(t.[AMOUNT]) [AMOUNT]
           ,COUNT(DISTINCT t.[TX_ID]) [TX_COUNT]     
    FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_PRE_AR_CHG] t
    INNER JOIN (SELECT DISTINCT [TAR_ID], COALESCE([WORKQUEUE_ID],[TRANSFER_TO_WQ_ID]) [WQ_NUM]
                FROM  [FI_DM_HIMS_ICD].[dbo].[CLARITY_PRE_AR_CHG_HX]
                WHERE [ACTIVITY_C] IN (1,3,5,7,8) AND [ACTIVITY_DATE]>=@Startdate
                  AND COALESCE([WORKQUEUE_ID],[TRANSFER_TO_WQ_ID]) IN ('1075','5508')) wq ON t.[TAR_ID]=wq.[TAR_ID]
    INNER JOIN (SELECT [TX_ID]
                      ,CAST(([RSH_REV_DTTM]) AS DATE) [REVIEW_DATE]
                      ,[RSH_REV_USER_ID]
                      ,[REV_RESEARCH_ID]
                      ,ROW_NUMBER() OVER (PARTITION BY  hbh.[TX_ID] ORDER BY LINE DESC) [RN]
                  FROM [FI_DM_HIMS_ICD].[dbo].[CLARITY_ARPB_RSH_CHGREV_HX] hbh
                  WHERE [RSH_REV_USER_ID] IN ('201158','202466', '202674', '201318', '202875', '201497','215805') 
                    AND CAST(([RSH_REV_DTTM]) AS DATE)>=@Startdate) crh  ON t.[TX_ID]=crh.[TX_ID] AND crh.[RN]=1
    LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_ZC_CHARGE_STATUS] cs             ON t.[CHARGE_STATUS_C]=cs.[CHARGE_STATUS_C]
    LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_CLARITY_RSH] rsi                 ON crh.[REV_RESEARCH_ID] =rsi.[RESEARCH_ID]
    LEFT JOIN [FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT] p                       ON t.[PAT_ID]=p.[PAT_ID]
    WHERE cs.[NAME]='Filed after Review' and [REVIEW_DATE]>=@Startdate
    GROUP BY wq.[WQ_NUM]
           ,crh.[RSH_REV_USER_ID] 
           ,crh.[REVIEW_DATE]
           ,p.[PAT_MRN_ID]
           ,p.[PAT_NAME]
           ,rsi.[IRB_APPROVAL_NUM]
           ,CAST(t.[SERVICE_DATE] AS DATE)
    HAVING SUM(t.[AMOUNT])>0)
    
    
    
     Insert into  [FI_DM_HIMS_ICD].[dbo].[SA_WQAudit] 
        (
        [WQ_NUM]
          ,[REVIEWED_USER]
          ,[REVIEW_DATE]
          ,[IRB Reviewed]
          ,[PAT_MRN_ID]
          ,[PAT_NAME]
          ,[SERVICE_DATE]
          ,[QTY]
          ,[AMOUNT]
          ,[TX_COUNT]
          ,[UploadDateTime]
            ) 
    SELECT [WQ_NUM]
          ,[REVIEWED_USER]
          ,[REVIEW_DATE]
          ,[REVIEWED_IRB]
          ,[PAT_MRN_ID]
          ,[PAT_NAME]
          ,[SERVICE_DATE]
          ,[QTY]
          ,[AMOUNT]
          ,[TX_COUNT]
        ,GETDATE() [UploadDateTime]
    
    FROM (SELECT * ,  ROW_NUMBER( ) OVER (PARTITION  BY [WQ_NUM], [REVIEWED_USER]  ORDER BY [REVIEW_DATE] DESC,NEWID()) [RANK]
              FROM
              (
              SELECT * FROM (
                      SELECT   *,ROW_NUMBER( ) OVER (PARTITION  BY [WQ_NUM], [REVIEWED_USER], [REVIEW_DATE] ORDER BY [REVIEW_DATE] DESC, NEWID()) [RA1]
                      FROM (SELECT * FROM PBWorkLog)C
                    )A
              WHERE [RA1]<=10)
              B) A
            WHERE [RANK]<=50
            ORDER BY [WQ_NUM], [REVIEWED_USER], [REVIEW_DATE] 
    

    `)

    const { recordset: result } = await sqlConnection.query(`SELECT  * from [FI_DM_HIMS_ICD].[dbo].[SA_WQAudit] WHERE [UploadDateTime] >= '${this.getDateTime().split('T')[0]}' order by [REVIEW_DATE] desc`)
    let valuesQuery = ''
    result.map((item) => {
      valuesQuery += `(
        ${item['WQ_NUM'] ? "'" + item['WQ_NUM'] + "'" : null},
        ${item['REVIEWED_USER'] ? "'" + item['REVIEWED_USER'] + "'" : null},
        ${item['REVIEW_DATE'] ? "'" + item['REVIEW_DATE'].split('T')[0] + "'" : null},
        ${item['PAT_MRN_ID'] ? "'" + item['PAT_MRN_ID'] + "'" : null},
        ${item['PAT_NAME'] ? "'" + item['PAT_NAME'].replace("'", "''") + "'" : null},
        ${item['IRB Reviewed'] ? "'" + item['IRB Reviewed'] + "'" : null},
        ${item['SERVICE_DATE'] ? "'" + item['SERVICE_DATE'].split('T')[0] + "'" : null},
        ${item['QTY'] ? "'" + item['QTY'] + "'" : null},
        ${item['AMOUNT'] ? "'" + item['AMOUNT'] + "'" : null},
        ${item['TX_COUNT'] ? "'" + item['TX_COUNT'] + "'" : null},
        '${this.getDateTime()}'
    ) ,`
    })


    valuesQuery = valuesQuery.slice(0, -1)

    let x = (`
              insert into SA_WQAudit
              (
            [WQ_NUM],
        [REVIEWED_USER],
        [REVIEW_DATE],
        [PAT_MRN_ID] ,
        [PAT_NAME],
        [IRB Reviewed],
        [SERVICE_DATE],
       
        [QTY],
        [AMOUNT],
       
        [TX_COUNT],
        [UPLOADDATETIME]
                
              ) values ${valuesQuery}
            `)

    await sql.query(x)


    mailer(
      ['mhurd@coh.org', 'arayos@coh.org'],

      ['jaing@coh.org', 'mdeksne@coh.org'],
      // ['mdeksne@coh.org'],
      // [],
      `PB WQ Audit Updated!`,
      `
              <h2>Greetings Beth!</h2>
              <p>PB WQ Audit table has been updated and ready for review.<br><br>
              <a href="https://10.30.142.17:8000/pbwqaudit">https://10.30.142.17:8000/pbwqaudit</a><br><br>

              Thank you, <br><br><br>

              HIMS Business Solutions <br>
              Automated Notification <br><br>

              ${logo}
      
              `
    )




    // HB AUdit

    await sqlConnection.query(`
      
    DECLARE @startdate DATE =GETDATE()-8
;WITH HBWorkLog AS
(SELECT 
       hspt1.[HSP_ACCOUNT_ID] [HAR]
      ,PAT.[PAT_MRN_ID] [MRN]
      ,MIN(CAST(hspt1.[SERVICE_DATE] AS DATE)) [First Service Date]
      ,CAST(hspa.[DISCH_DATE_TIME] AS DATE) [Discharge Date]
      ,CAST(hbhx.[Review Date] AS DATE) [Review Date]
      ,hbhx.[User Reviewed]
      ,hbhx.[IRB Reviewed]
      ,COUNT(DISTINCT hspt2.[TX_ID]) [Transaction Count]
      ,SUM(hspt1.[TX_AMOUNT]) [Amount]
      ,SUM(hspt1.[QUANTITY]) [Quantity]
  FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt1 
  LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS_2] hspt2 ON hspt1.[TX_ID]=hspt2.[TX_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa         ON hspt1.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat              ON hspa.[PAT_ID]=pat.[PAT_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rshi         ON hspt1.[RESEARCH_STUDY_ID]=rshi.RESEARCH_ID
  INNER JOIN (SELECT DISTINCT [HSP_ACCOUNT_ID] 
                FROM [Clarity_PRD_Report].[dbo].[HSP_ACCT_WQ_ITEMS]
               WHERE [WORKQUEUE_ID]='1262' 
                 AND [RELEASE_DATE] IS NOT NULL 
                 AND [ENTRY_DATE]>=@startdate) wqi                ON hspt1.[HSP_ACCOUNT_ID]=wqi.[HSP_ACCOUNT_ID]
  INNER JOIN (SELECT hsph.[HSP_ACCOUNT_ID] [HAR]
                   ,emp.[NAME] [User Reviewed]
                   ,RSH_REV_DTTM [Review Date]
                   ,rsh.[IRB_APPROVAL_NUM] [IRB Reviewed]
                   ,ROW_NUMBER() OVER (PARTITION BY  hsph.[HSP_ACCOUNT_ID] ORDER BY LINE DESC) [RN]
               FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hsph
               LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp ON hsph.[RSH_REV_USER_ID]=emp.[USER_ID]
               LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh ON hsph.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
               INNER JOIN (SELECT DISTINCT [HSP_ACCOUNT_ID] 
                             FROM [Clarity_PRD_Report].[dbo].[HSP_ACCT_WQ_ITEMS]
                            WHERE [WORKQUEUE_ID]='1262' 
                              AND [RELEASE_DATE] IS NOT NULL 
                              AND [ENTRY_DATE]>=@startdate) wqi ON hsph.[HSP_ACCOUNT_ID]=wqi.[HSP_ACCOUNT_ID]
               WHERE RSH_REV_DTTM>=@startdate
                 AND RSH_REV_USER_ID IN ('200380', '200759', '201762', '202178', '202552')) hbhx             ON hspt1.[HSP_ACCOUNT_ID]=hbhx.[HAR] AND hbhx.[RN]=1
  WHERE hspt1.[TX_TYPE_HA_C]=1
  GROUP BY hspt1.[HSP_ACCOUNT_ID]
      ,PAT.[PAT_MRN_ID]
      ,CAST(hspa.[DISCH_DATE_TIME] AS DATE) 
      ,CAST(hbhx.[Review Date] AS DATE)
      ,hbhx.[User Reviewed]
      ,hbhx.[IRB Reviewed]
  HAVING SUM(hspt1.[QUANTITY])>0)




  INSERT  INTO [FI_DM_HIMS_ICD].[dbo].[SA_HB_WQAudit]   (
                              
                 [HAR]
                 ,[MRN]
                 ,[FirstServiceDate]
                 ,[Discharge Date]
                 ,[Review Date]
                 ,[User Reviewed]
                 ,[IRB Reviewed]
                 ,[Transaction Count]
                 ,[Amount]
                 ,[Quantity]
                 ,[UploadDateTime]
                       )
  SELECT  [HAR]
         ,[MRN]
         ,[First Service Date]
         ,[Discharge Date]
         ,[Review Date]
         ,[User Reviewed]
         ,[IRB Reviewed]
         ,[Transaction Count]
         ,[Amount]
         ,[Quantity]
		 ,GetDate() [UploadDateTime]
FROM (SELECT * ,  ROW_NUMBER( ) OVER (PARTITION  BY [User Reviewed]  ORDER BY [Review Date] DESC,NEWID()) [RANK]
          FROM
          (
          SELECT * FROM (
                  SELECT   *,ROW_NUMBER( ) OVER (PARTITION  BY [User Reviewed], [Review Date] ORDER BY [Review Date] DESC, NEWID()) [RA1]
                  FROM (SELECT * FROM HBWorkLog)C
                )A
          WHERE [RA1]<=20)
          B) A
        WHERE [RANK]<=100
        ORDER BY [User Reviewed], [Review Date], [HAR]
    
        `)



    const { recordset: result1 } = await sqlConnection.query(`SELECT  * from [FI_DM_HIMS_ICD].[dbo].[SA_HB_WQAudit]  WHERE [UploadDateTime] >= '${this.getDateTime().split('T')[0]}'  order by [Review Date] desc`)
   
    let valuesQuery1 = ''
    result1.map((item) => {
      valuesQuery1 += `(
            ${item['HAR'] ? "'" + item['HAR'].toString() + "'" : null},
            ${item['MRN'] ? "'" + item['MRN'].toString() + "'" : null},
            ${item['FirstServiceDate'] ? "'" + item['FirstServiceDate'].split('T')[0] + "'" : null},
            ${item['Discharge Date'] ? "'" + item['Discharge Date'].split('T')[0] + "'" : null},
            ${item['Review Date'] ? "'" + item['Review Date'].split('T')[0] + "'" : null} ,
            ${item['User Reviewed'] ? "'" + item['User Reviewed'].toString() + "'" : null},
            ${item['IRB Reviewed'] ? "'" + item['IRB Reviewed'].toString() + "'" : null},
            ${item['Transaction Count'] ? "'" + item['Transaction Count'].toString() + "'" : null},
            ${item['Amount'] ? "'" + item['Amount'].toString() + "'" : null},
            ${item['Quantity'] ? "'" + item['Quantity'].toString() + "'" : null},
            '${this.getDateTime()}'
        ) ,`
    })


    valuesQuery1 = valuesQuery1.slice(0, -1)

    let y = (`
                  insert into SA_HB_WQAudit
                  (
                    [HAR]
             ,[MRN]
             ,[FirstServiceDate]
             ,[Discharge Date]
             ,[Review Date]
             ,[User Reviewed]
             ,[IRB Reviewed]
             ,[Transaction Count]
             ,[Amount]
             ,[Quantity],
                [UPLOADDATETIME]
                    
                  ) values ${valuesQuery1}
                `)

    await sql.query(y)


    mailer(
      ['mhurd@coh.org', 'mbittle@coh.org'],

      ['jaing@coh.org', 'mdeksne@coh.org'],
      // ['mdeksne@coh.org'],
      // [],
      `HB WQ Audit Updated!`,
      `
                  <h2>Greetings Beth!</h2>
                  <p>HB WQ Audit table has been updated and ready for review.<br><br>
                  <a href="https://10.30.142.17:8000/hbwqaudit">https://10.30.142.17:8000/hbwqaudit</a><br><br>
    
                  Thank you, <br><br><br>
    
                  HIMS Business Solutions <br>
                  Automated Notification <br><br>
    
                  ${logo}
          
                  `
    )
                  } catch (err ) {
                    console.log(err)
                  }
  }


}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});








const updateDailyComplainceTable = async (userModel) => {

  const { recordset } = await sql.query(
    `select * from ${userModel} where ManagementCard!= 1`
  );


  var date1 = new Date();
  date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

  let day = date1.getDay()
  date1 = date1.toISOString().split('T')[0]


  recordset.map(async (u) => {
    let user = u.First;

    const query = `

        SELECT Count(Status) as count , Convert(Date, DateTime) as DateTime, Status, UserName
        FROM [HIMSRB].[dbo].[WQ5508Logger] 
        where Status IN ('Start', 'Finish -Done', 'Finish', 'Finish -Pending', 'Finish -Misc', 'Finish -Deferred', 'Misc', 'Done', 'Pending', 'Deferred' ) AND UserName = '${user}' and DateTime  > '${date1} ' AND  [DateTime] < '${this.getDateTime().split('T')[0]} '
        group By Convert(Date, DateTime) , Status,  UserName
        order By Convert(Date, DateTime) desc

      `;

    var { recordset: WQ5508 } = await sql.query(query);

    const query1 = `

        SELECT Count(Status) as count , Convert(Date, DateTime) as DateTime, Status, UserName
        FROM [HIMSRB].[dbo].[WQ1075Logger] 
        where Status IN ('Start', 'Finish -Done', 'Finish', 'Finish -Pending', 'Finish -Misc', 'Finish -Deferred', 'Misc', 'Done', 'Pending', 'Deferred' ) AND UserName = '${user}' and DateTime  > '${date1} ' AND  [DateTime] < '${this.getDateTime().split('T')[0]} '
        group By Convert(Date, DateTime) , Status,  UserName
        order By Convert(Date, DateTime) desc

      `;


    var { recordset: WQ1075 } = await sql.query(query1);


    let combineWQ = WQ5508.concat(WQ1075)


    let dates = ([...new Set(combineWQ.map(d => {
      return d['DateTime'].toISOString().split('T')[0]
    }))])

    dates = (dates.filter((date) => new Date(date) > new Date('2021-11-24')))

    dates.map(async (date) => {
      let item = combineWQ.filter((data) => data.DateTime.toISOString().split('T')[0] == date)

      let startClicked = item.filter((i) => i.Status == 'Start')[0] ? item.filter((i) => i.Status == 'Start')[0]['count'] : 0
      if (startClicked > 0) {
        await sql.query(`insert into Compliance (FIRST_NAME, EMPID, Date, Checked) values ('${u.First}', '${u.EMPID}', '${date}' , 1 )`)

      }

    })

  })
}

exports.updatePageLoggerData = async () => {

  sql.query(`
  
UPDATE  [PageLogger]
SET  [DiffInSeconds]=T.[DiffInSeconds],
  [Duration]  = T.[Duration]
  FROM  [HIMSRB].[dbo].[PageLogger] B
INNER JOIN 	
 (
 SELECT U.[UserName]
    ,U.[DateTime]
    ,U.[Status]
    , ROW_NUMBER() OVER( PARTITION BY FORMAT(U.[DateTime],'dd/MM/yyyy'),[UserName] ORDER BY  [DateTime] ASC, [UserName]) AS [RANK],
   convert(varchar(5),DATEDIFF(s,[DateTime],Lag(U.[DateTime],1) OVER(PARTITION BY FORMAT(U.[DateTime],'dd/MM/yyyy'),[UserName] ORDER BY  [DateTime] DESC, [UserName]))/3600)+':'
  +convert(varchar(5),DATEDIFF(s,[DateTime],Lag(U.[DateTime],1) OVER(PARTITION BY FORMAT(U.[DateTime],'dd/MM/yyyy'),[UserName] ORDER BY  [DateTime] DESC, [UserName]))%3600/60)+
  ':'+convert(varchar(5),(DATEDIFF(s,[DateTime],Lag(U.[DateTime],1) OVER(PARTITION BY FORMAT(U.[DateTime],'dd/MM/yyyy'),[UserName] ORDER BY  [DateTime] DESC, [UserName]))%60)) as [Duration]
,convert(varchar(5), DATEDIFF(s,[DateTime],Lag(U.[DateTime],1) OVER(PARTITION BY FORMAT(U.[DateTime],'dd/MM/yyyy'),[UserName] ORDER BY  [DateTime] DESC, [UserName]))%60 )
 [DiffInSeconds]
FROM [HIMSRB].[dbo].[PageLogger] U
--WHERE  [Status] IN('Visit','Active','Idle') --and UserName IN('Anna Maria') and [DateTime] between '2021-10-11 11:03:25.000' and '2021-10-11 11:27:42.000'
--ORDER BY  [DateTime] ASC, [RANK] ASC
) T
ON
T.UserName= B.UserName
AND T.[DateTime]=B.[DateTime]
AND T.[Status] = B.[Status]
AND T.[RANK] =T.[RANK]



  `)
}

exports.UpdateCompliance = async (userModel) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 03 && minutes == 10) {
    updateDailyComplainceTable('JWT')
  }
}











exports.fitToColumn = (columnObject = {}) => {

  let obj = []
  let preObj = {
    'Account Number': 10,

  }

  columns = Object.keys(columnObject)
  for (let i in columns) {


    if (preObj[columns[i]]) {
      obj.push({ width: preObj[columns[i]] })

    } else {

      obj.push({ width: columns[i].length + 5 })

    }
  }

  return obj
}   