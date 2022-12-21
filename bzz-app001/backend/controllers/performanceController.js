const methods = require("./crudController");
var sql = require("mssql");
const { getDateTime} = require("./utilController");
const utilController = require("./utilController");

const endpoints = methods.crudController("WQ5508Progress");



delete endpoints["list"];
const WQ1ProgressModel = "WQ5508Progress";
const WQ2ProgressModel = "WQ1075Progress";
const WQ3ProgressModel = "WQ1262Progress";
const WQ1CheckmarkModel = "WQ1075Checkmark";
const WQ2CheckmarkModel = "WQ5508Checkmark";
const WQ3CheckmarkModel = "WQ1262Checkmark";
const WQFeedback = "Feedback"
const UserModel = "JWT"
const PBKPIs = 'TotalPBKPIs'
const HBKPIs = 'TotalHBKPIs'
const ProductivityLogKPIs = 'ProductivityLogKPIs'
const ProductivityLog = 'ProductivityLog'
const ScrubIRBMoDel = 'Agenda';




endpoints.PBlist = async (req, res,) => {
    try {

        const {recordset: result1} = await sql.query(`
        SELECT 
         [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
    `)
        var scrubIRBs = (result1.map((i) => i.IRB ))

        let result =  [{recordset: wq5508Progress} , {recordset: wq1075Progress, }, {recordset: feedbackProgress}, { recordset: adminlist},{ recordset: wq1075WorkProgress}, { recordset: wq5508WorkProgress}] = await Promise.all([
            await sql.query(`select * from ${WQ1ProgressModel}`),
            await sql.query(`select * from ${WQ2ProgressModel}`),
            await sql.query(`select * from ${WQFeedback}`),
            await sql.query(`SELECT * FROM ${UserModel} where  (SubSection IN ('PB','RBB') or [ManagementCard] = '1') and EMPL_STATUS NOT IN ('T')   order by First `),
            await sql.query(`SELECT * FROM ${WQ1CheckmarkModel} `),
            await sql.query(`SELECT * FROM ${WQ2CheckmarkModel} `),

        ])


        let queriesToExecute = []
        let EMPID = (adminlist).map(li => {
            if(! li.ManagementCard) {
               return  li.EMPID 
            } 
        }).filter(item => item != undefined)

      

        queriesToExecute.push(await sql.query(`select * from ${PBKPIs} where EMPID IN (${EMPID.map(id => "'" + id + "'")}) ORDER BY ActionTimeStamp DESC OFFSET  0  ROWS FETCH NEXT ${EMPID.length * 6 }  ROWS ONLY`))
        
        queriesToExecute.push(await sql.query(`
                        
        SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
        from JWT J WITH (NOLOCK)
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from WQ1075
        where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
        group BY [UserAssigned]
        ) x on j.Nickname = x.Userassigned
        where j.SubSection in ('PB','RBB')

        `))


        

        queriesToExecute.push(await sql.query(`
                        
        SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
        from JWT J WITH (NOLOCK)
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from WQ5508
        where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' ) 
        group BY [UserAssigned]
        ) x on j.Nickname = x.Userassigned
        where j.SubSection in ('PB','RBB')

    `))


    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
    from JWT J WITH (NOLOCK)
    left join (
    SELECT [UserAssigned], COUNT(1) Cnt
    from WQ1075
    where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
    and ([Research IRB]  NOT IN (
    SELECT 
            [value]  
            FROM Agenda t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
    ) or [Research IRB] IS NULL)
    group BY [UserAssigned]
    ) x on j.Nickname = x.Userassigned
    where j.SubSection in ('PB','RBB')

    `))


    
    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
    from JWT J WITH (NOLOCK)
    left join (
    SELECT [UserAssigned], COUNT(1) Cnt
    from WQ5508
    where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
    and ([Research IRB]  NOT IN (
    SELECT 
            [value]  
            FROM Agenda t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
    ) or [Research IRB] IS NULL)
    group BY [UserAssigned]
    ) x on j.Nickname = x.Userassigned
    where j.SubSection in ('PB','RBB')

    `))


    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
    from JWT J WITH (NOLOCK)
    left join (
    SELECT [UserAssigned], COUNT(1) Cnt
    from WQ1075
    where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
    and ([Research IRB]   IN (
    SELECT 
            [value]  
            FROM Agenda t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
    ) )
    group BY [UserAssigned]
    ) x on j.Nickname = x.Userassigned
    where j.SubSection in ('PB','RBB')

    `))


    
    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
    from JWT J WITH (NOLOCK)
    left join (
    SELECT [UserAssigned], COUNT(1) Cnt
    from WQ5508
    where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
    and ([Research IRB]   IN (
    SELECT 
            [value]  
            FROM Agenda t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
    ) )
    group BY [UserAssigned]
    ) x on j.Nickname = x.Userassigned
    where j.SubSection in ('PB','RBB')

    `))


    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ1075]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}'  and [UserAssigned] <> [User] ) 
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

    `))


    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ5508]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}'   and [UserAssigned] <> [User] ) 
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

    `))


    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ3177]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}'  )  
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

    `))
     
    queriesToExecute.push(await sql.query(`

    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[SA_WQAudit]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}'  ) 
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
    `
    ))

     

        result = {
            wq5508Progress,
            wq1075Progress,
            feedbackProgress,
            adminlist,
            wq1075WorkProgress,
            wq5508WorkProgress,
            kpi: (queriesToExecute[0]['recordset']),
            wq1075Charges: (queriesToExecute[1]['recordset']),
            wq5508Charges: (queriesToExecute[2]['recordset']),
            wq1075Workable: (queriesToExecute[3]['recordset']),
            wq5508Workable: (queriesToExecute[4]['recordset']),
            wq1075NonWorkable: (queriesToExecute[5]['recordset']),
            wq5508NonWorkable: (queriesToExecute[6]['recordset']),
            wq1075BonusProd: (queriesToExecute[7]['recordset']),
            wq5508BonusProd: (queriesToExecute[8]['recordset']),
            wq3177BonusProd: (queriesToExecute[9]['recordset']),
            wqPBAudit : (queriesToExecute[10]['recordset'])
            


        }

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


endpoints.HBlist = async (req, res) => {
    try {

        const {recordset: result1} = await sql.query(`
        SELECT 
         [value] as IRB 
        FROM ${ScrubIRBMoDel} t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
    `)
        var scrubIRBs = (result1.map((i) => i.IRB ))

        let result =  [{recordset: wq1Progress} , {recordset: feedbackProgress}, { recordset: adminlist}, { recordset: wq1WorkProgress}] = await Promise.all([
            await sql.query(`select * from ${WQ3ProgressModel}`),
            await sql.query(`select * from ${WQFeedback}`),
            await sql.query(`SELECT * FROM ${UserModel} where  (SubSection IN ('HB', 'RBB') or [ManagementCard] = '1')  and EMPL_STATUS NOT IN ('T')  or SpecialAccess = 1  order by First `),
            await sql.query(`SELECT * FROM ${WQ3CheckmarkModel} `),
        ])


        let queriesToExecute = []
        let queriesToExecuteforProductivityKPIs = []
        let queriesToExecuteforProductivityLog = []

        let EMPID = (adminlist).map(li => {
            if(! li.ManagementCard) {
               return  li.EMPID 
            } 
        }).filter(item => item != undefined)

      
        
        queriesToExecute.push(await sql.query(`select * from ${HBKPIs} where EMPID IN (${EMPID.map(id => "'" + id + "'")}) ORDER BY ActionTimeStamp DESC OFFSET  0  ROWS FETCH NEXT ${EMPID.length * 6 }  ROWS ONLY`))
        queriesToExecuteforProductivityKPIs.push(await sql.query(`select * from ${ProductivityLogKPIs} where EMPID IN (${EMPID.map(id => "'" + id + "'")}) ORDER BY Date DESC OFFSET  0  ROWS FETCH NEXT ${EMPID.length * 6 }  ROWS ONLY`))
        queriesToExecuteforProductivityLog.push(await sql.query(`
            SELECT SUM([Units]) as Units, SUM (Minutes) as Minutes, [EMPID]
            FROM ${ProductivityLog}
            where [DateTime] > '${getDateTime().split('T')[0]}' 
            GROUP BY EMPID, [EMPID]`
        ))


        queriesToExecute.push(await sql.query(`
                        
                        
                SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
                from JWT J WITH (NOLOCK)
                left join (
                SELECT [UserAssigned], COUNT(1) Cnt
                from WQ1262
                where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
                group BY [UserAssigned]
                ) x on j.Nickname = x.Userassigned
                where j.SubSection in ('HB','RBB')

    `))


        queriesToExecute.push(await sql.query(`
                            
        SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
        from JWT J WITH (NOLOCK)
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from WQ1262
        where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' ) 
        and ([Code]  NOT IN (
        SELECT 
                [value]  
                FROM Agenda t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [SCRUB STATUS] = '0'
        ) or [Code]  IS NULL)
        group BY [UserAssigned]
        ) x on j.Nickname = x.Userassigned
        where j.SubSection in ('HB','RBB')

        `))

        queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname, isnull(x.Cnt, 0) Cnt
    from JWT J WITH (NOLOCK)
    left join (
    SELECT [UserAssigned], COUNT(1) Cnt
    from WQ1262
    where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' or [Status] = 'Review' )  
    and ([Code]   IN (
    SELECT 
            [value]  
            FROM Agenda t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
    ) )
    group BY [UserAssigned]
    ) x on j.Nickname = x.Userassigned
    where j.SubSection in ('HB','RBB')

    `))

    queriesToExecute.push(await sql.query(`
                        
    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ1262]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}' and [UserAssigned] <> [User] )  
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('HB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

    `))


    queriesToExecute.push(await sql.query(`

    SELECT j.Nickname  , isnull(x.Cnt, 0) Cnt
      from JWT J WITH (NOLOCK)
      left join (
      SELECT [User], COUNT(1) Cnt
      from [HIMSRB].[dbo].[SA_HB_WQAudit]
      where ([ActionTimeStamp] >= '${utilController.getDateTime().split('T')[0]}'  ) 
      group BY [User]
      ) x on j.Nickname = x.[User] 
      where j.SubSection in ('HB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
    `
    ))

        result = {
            wq1Progress,
            feedbackProgress,
            adminlist,
            wq1WorkProgress,
            kpi: (queriesToExecute[0]['recordset']),
            Crb: (queriesToExecuteforProductivityKPIs[0]['recordset']),
            Logs: (queriesToExecuteforProductivityLog[0]['recordset']),
            wq1262Charges : (queriesToExecute[1]['recordset']),
            wq1262Workable : (queriesToExecute[2]['recordset']),
            wq1262NonWorkable : (queriesToExecute[3]['recordset']),
            wq1262BonusProd : (queriesToExecute[4]['recordset']),
            wqHBAudit : (queriesToExecute[5]['recordset'])


        }

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

 

module.exports = endpoints;