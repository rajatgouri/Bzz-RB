var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("");
const sqlConnection = require('../sql')

delete endpoints["read"];
delete endpoints["update"];


function generateOTP() {
          
  // Declare a digits variable 
  // which stores all digits
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}



endpoints.read1262 = async (req, res) => {
  const { id, DD} = req.query;

  try {


   let {recordset: result1 = []} = sqlConnection.query(`
    
SELECT
HAR,
MRN,
[Review Date],
[Service Date],
IRB,
[User Reviewed],
TRIM(STRING_AGG(IIF(Notes IS NULL, '' , Notes) , ' ')) Notes,
TRIM(STRING_AGG(IIF([Note Order] IS NULL, '' , [Note Order]) , ' ')) [Note Order]
FROM [FI_DM_HIMS_ICD].[dbo].[SA_HBNotes]
WHERE [MRN] = '${id}'

GROUP BY HAR,
MRN,
[Review Date],
[Service Date],
IRB,
[User Reviewed]
order by [Review Date] desc
   `)

   console.log(result1)

   if( result1.length > 0) {
    return res.status(200).json({
      success: true,
      result: result1 || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
   }
   
    let { recordset: result } = await sqlConnection.query(
      `
      
      DECLARE @vMRN VARCHAR(102) = '${id}'


BEGIN TRY
drop table IF EXISTS #temp 


CREATE TABLE #temp(
	[ID] [bigint] NOT NULL,
	[HAR] [numeric](18, 0) NULL,
	[MRN] [varchar](102) NULL,
	[Service Date] [date] NULL,
	[Review Date] [datetime] NULL,
	[IRB] [varchar](30) NULL,
	[User Reviewed] [varchar](160) NULL,
	[Note Order] [int] NOT NULL,
	[Notes] [varchar](2000) NULL,
 CONSTRAINT [PK_Tempdata${generateOTP()}] PRIMARY KEY CLUSTERED 
(
	[ID] ASC,
	[Note Order] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]


INSERT INTO #temp
           ([ID]
           ,[HAR]
           ,[MRN]
           ,[Service Date]
           ,[Review Date]
           ,[IRB]
           ,[User Reviewed]
           ,[Note Order]
           ,[Notes])
  
SELECT Top(1000)
   DENSE_RANK() OVER(Order BY   hbcrh.[HSP_ACCOUNT_ID],
  pat.[PAT_MRN_ID],
 [FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]),
 CAST(hspt.[SERVICE_DATE] AS DATE),
 rsh.[IRB_APPROVAL_NUM],
 emp.[NAME]) AS ID,
   hbcrh.[HSP_ACCOUNT_ID] [HAR]
         ,pat.[PAT_MRN_ID] [MRN]
         ,CAST(hspt.[SERVICE_DATE] AS DATE) [Service Date]
         ,[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]) [Review Date]
         ,rsh.[IRB_APPROVAL_NUM] [IRB]
         ,emp.[NAME] [User Reviewed]
		 ,anp.[LINE] [Note Order]
         ,anp.[ACCT_NOTE_TEXT] [Notes] 
     FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hbcrh WITH (NOLOCK)
	 INNER JOIN (SELECT hspt0.[HSP_ACCOUNT_ID]
                      ,MIN(hspt0.[SERVICE_DATE]) [SERVICE_DATE]
                FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt0 WITH (NOLOCK)
                LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa0 WITH (NOLOCK) ON hspt0.[HSP_ACCOUNT_ID]=hspa0.[HSP_ACCOUNT_ID]
                INNER JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat0 WITH (NOLOCK) ON hspa0.[PAT_ID]=pat0.[PAT_ID]
                WHERE pat0.[PAT_MRN_ID]=@vMRN 
                GROUP BY hspt0.[HSP_ACCOUNT_ID]) hspt ON hbcrh.[HSP_ACCOUNT_ID]=hspt.[HSP_ACCOUNT_ID]
     LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa WITH (NOLOCK) ON hbcrh.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
     LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat WITH (NOLOCK) ON hspa.[PAT_ID]=pat.[PAT_ID]
     LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp WITH (NOLOCK) ON hbcrh.[RSH_REV_USER_ID]=emp.[USER_ID]
     LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK) ON hbcrh.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
     LEFT JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] anp WITH (NOLOCK) ON hbcrh.[RSH_REV_COMMENT_ID]=anp.[NOTE_ID]
  ORDER BY RSH_REV_DTTM DESC, anp.[LINE] , ID DESC


SELECT
  HAR,
  MRN,
 [Review Date],
 [Service Date],
 IRB,
 [User Reviewed],
 TRIM(STRING_AGG(IIF(Notes IS NULL, '' , Notes) , ' ')) Notes
 FROM #Temp
 GROUP BY HAR,
  MRN,
 [Review Date],
 [Service Date],
 IRB,
 [User Reviewed]
 order by [Review Date] desc  

 drop table IF EXISTS #temp 


 END TRY
 BEGIN CATCH 
 drop table IF EXISTS #temp 
 


 END CATCH

     
      `
    );




    return res.status(200).json({
      success: true,
      result: result || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
  } catch (err) {
    console.log(err)

    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM BillingColor WHERE UserID = ${id}`,
      error: err,
    });
  }
};



endpoints.read1075 = async (req, res) => {
  const { id, date} = req.query;

  try {

    let {recordset: result1 = []} = sqlConnection.query(`
    
    SELECT
    MRN, [Type],
    [Service Date],
    [IRB],
    [User Reviewed],
    [Review Date],
    [Review DateTime],
    TRIM(STRING_AGG(IIF([BILLERs_NOTES] IS NULL, '' , [BILLERs_NOTES]) , ' ')) [BILLERs_NOTES],
    TRIM(STRING_AGG(IIF([NOTE_LINE] IS NULL, '' , [NOTE_LINE]) , ' ')) [NOTE_LINE]
    FROM [FI_DM_HIMS_ICD].[dbo].[SA_PBNotes]
  where [MRN] = '${id}'
    GROUP BY [MRN], [Type],
    [Service Date],
    [IRB],
    [Review Date],
    [Review DateTime],
    [User Reviewed]
    order by [Review Date], [Review DateTime] desc 
   `)

   if(result1.length > 0) {
    return res.status(200).json({
      success: true,
      result: result1 || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
   }
   
    const { recordset: result } = await sqlConnection.query(
      `
      
      DECLARE @vMRN VARCHAR(102) = '${id}'
      DROP TABLE IF EXISTS #temp3
      CREATE TABLE #temp3(
      [ID] [bigint] NOT NULL,
      [Type] [varchar](MAX) NULL,
      [MRN] [varchar](MAX) NULL,
      [Service Date] [date] NULL,
      [IRB] [varchar](MAX) NULL,
      [User Reviewed] [varchar](MAX) NULL,
      [Review Date] [datetime] NULL,
      [Review DateTime] [datetime] NULL,
      [NOTE_LINE] [int] NOT NULL,
      [BILLERs_NOTES] [varchar](4000) NULL,
      CONSTRAINT [PK_Tempdata${generateOTP()}] PRIMARY KEY CLUSTERED 
      (
      [ID] ASC,
      [NOTE_LINE] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
      INSERT INTO #temp3
            ([ID]
          ,[Type]
            ,[MRN]
            ,[Service Date] 
            ,[IRB]
            ,[User Reviewed]
            ,[Review Date]
            ,[Review DateTime]
            ,[NOTE_LINE]
            ,[BILLERs_NOTES])
      SELECT
      TOP (1000)
       DENSE_RANK() OVER(Order BY   MRN,
       CAST( [Service Date] AS DATE),
       IRB,
      ([Review DateTime]),
      [User Reviewed]) AS ID,
      * FROM
      (SELECT DISTINCT 
            'PB Notes' [Type]
            ,PAT.[PAT_MRN_ID] [MRN]
            ,CAST(ETR.[SERVICE_DATE] AS DATE) [Service Date]
            ,RSH.[IRB_APPROVAL_NUM] [IRB]
            ,EMP.[NAME] [User Reviewed]
            ,CAST(ETRRSH.[RSH_REV_DTTM] AS DATE) [Review Date]
            ,FI_DM_HIMS_ICD.dbo.UTC_TO_LA_T(ETRRSH.[RSH_REV_DTTM]) [Review DateTime]
            ,HAN.[LINE] [Note Line]
            ,HAN.[ACCT_NOTE_TEXT] [Notes]
      FROM [Clarity_PRD_Report].[dbo].[ARPB_RSH_CHGREV_HX] ETRRSH
      LEFT JOIN [Clarity_PRD_Report].[dbo].[PRE_AR_CHG] ETR ON ETRRSH.[TX_ID]=ETR.[TX_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] PAT ON ETR.[PAT_ID]=PAT.[PAT_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] EMP ON ETRRSH.[RSH_REV_USER_ID] = EMP.[USER_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] RSH ON ETRRSH.[REV_RESEARCH_ID] = RSH.[RESEARCH_ID]
      INNER JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] HAN ON ETRRSH.[RSH_REV_COMMENT_ID] = HAN.[NOTE_ID]
      WHERE PAT.[PAT_MRN_ID]=@vMRN AND HAN.[ACCT_NOTE_TEXT] IS NOT NULL
      UNION ALL
      SELECT DISTINCT 
            'HB Notes' [Type]
            ,pat.[PAT_MRN_ID] [MRN] 
            ,CAST(hspt.[SERVICE_DATE] AS DATE) [Service Date]
            ,rsh.[IRB_APPROVAL_NUM] [IRB]
            ,emp.[NAME] [User Reviewed]
            ,CAST([RSH_REV_DTTM] AS DATE) [Review Date UTC]
            ,[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]) [Review DateTime]
            ,anp.[LINE] [Note Line]
            ,anp.[ACCT_NOTE_TEXT] [Notes]
        FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hbcrh
        LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa ON hbcrh.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat ON hspa.[PAT_ID]=pat.[PAT_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp ON hbcrh.[RSH_REV_USER_ID]=emp.[USER_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh ON hbcrh.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] anp ON hbcrh.[RSH_REV_COMMENT_ID]=anp.[NOTE_ID]
        INNER JOIN (SELECT hspt0.[HSP_ACCOUNT_ID] 
                         ,MIN(hspt0.[SERVICE_DATE]) [SERVICE_DATE] 
                   FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt0
                   LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa0 ON hspt0.[HSP_ACCOUNT_ID]=hspa0.[HSP_ACCOUNT_ID]
                   INNER JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat0 ON hspa0.[PAT_ID]=pat0.[PAT_ID]
                   WHERE pat0.[PAT_MRN_ID]=@vMRN
                   GROUP BY hspt0.[HSP_ACCOUNT_ID]) hspt ON hbcrh.[HSP_ACCOUNT_ID]=hspt.[HSP_ACCOUNT_ID]
       WHERE anp.[ACCT_NOTE_TEXT] IS NOT NULL) t
       
      ORDER BY [Service Date] DESC, [IRB], [Review Date] DESC, [User Reviewed], [Note Line]

      SELECT
      MRN, [Type],
      [Service Date],
      [IRB],
      [User Reviewed],
      [Review Date],
      [Review DateTime],
      TRIM(STRING_AGG(IIF([BILLERs_NOTES] IS NULL, '' , [BILLERs_NOTES]) , ' ')) [BILLERs_NOTES],
      TRIM(STRING_AGG(IIF([NOTE_LINE] IS NULL, '' , [NOTE_LINE]) , ' ')) [NOTE_LINE]
      FROM #temp3
      GROUP BY [MRN], [Type],
      [Service Date],
      [IRB],
      [Review Date],
      [Review DateTime],
      [User Reviewed]
      order by [Review Date], [Review DateTime] desc  
         
      DROP TABLE IF EXISTS #temp3

      `
    );


   

    return res.status(200).json({
      success: true,
      result: result || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM BillingColor WHERE UserID = ${id}`,
      error: err,
    });
  }
};


endpoints.read5508 = async (req, res) => {
  const { id, date} = req.query;

  try {

    let {recordset: result1 = []} = sqlConnection.query(`
    
    SELECT
    [Type],
    MRN,
    [Service Date],
    [IRB],
    [User Reviewed],
    [Review Date],
    [Review DateTime],
    TRIM(STRING_AGG(IIF([BILLERs_NOTES] IS NULL, '' , [BILLERs_NOTES]) , ' ')) [BILLERs_NOTES],
    TRIM(STRING_AGG(IIF([NOTE_LINE] IS NULL, '' , [NOTE_LINE]) , ' ')) [NOTE_LINE]
    FROM [FI_DM_HIMS_ICD].[dbo].[SA_PBNotes]
  where [MRN] = '${id}'
    GROUP BY [MRN], [Type],
    [Service Date],
    [IRB],
    [Review Date],
    [Review DateTime],
    [User Reviewed]
    order by [Review Date], [Review DateTime] desc 
   `)

   if(result1.length > 0) {
    return res.status(200).json({
      success: true,
      result: result1 || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
   }
   
    const { recordset: result } = await sqlConnection.query(
      `
      
      DECLARE @vMRN VARCHAR(102) = '${id}'
      DROP TABLE IF EXISTS #temp2
      CREATE TABLE #temp2(
      [ID] [bigint] NOT NULL,
      [Type] [varchar](MAX) NULL,
      [MRN] [varchar](MAX) NULL,
      [Service Date] [date] NULL,
      [IRB] [varchar](MAX) NULL,
      [User Reviewed] [varchar](MAX) NULL,
      [Review Date] [datetime] NULL,
      [Review DateTime] [datetime] NULL,
      [NOTE_LINE] [int] NOT NULL,
      [BILLERs_NOTES] [varchar](4000) NULL,
      CONSTRAINT [PK_Tempdata${generateOTP()}] PRIMARY KEY CLUSTERED 
      (
      [ID] ASC,
      [NOTE_LINE] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
      INSERT INTO #temp2
            ([ID]
          ,[Type]
            ,[MRN]
            ,[Service Date] 
            ,[IRB]
            ,[User Reviewed]
            ,[Review Date]
            ,[Review DateTime]
            ,[NOTE_LINE]
            ,[BILLERs_NOTES])
      SELECT
      TOP (1000)
       DENSE_RANK() OVER(Order BY   MRN,
       CAST( [Service Date] AS DATE),
       IRB,
      ([Review DateTime]),
      [User Reviewed]) AS ID,
      * FROM
      (SELECT DISTINCT 
            'PB Notes' [Type]
            ,PAT.[PAT_MRN_ID] [MRN]
            ,CAST(ETR.[SERVICE_DATE] AS DATE) [Service Date]
            ,RSH.[IRB_APPROVAL_NUM] [IRB]
            ,EMP.[NAME] [User Reviewed]
            ,CAST(ETRRSH.[RSH_REV_DTTM] AS DATE) [Review Date]
            ,FI_DM_HIMS_ICD.dbo.UTC_TO_LA_T(ETRRSH.[RSH_REV_DTTM]) [Review DateTime]
            ,HAN.[LINE] [Note Line]
            ,HAN.[ACCT_NOTE_TEXT] [Notes]
      FROM [Clarity_PRD_Report].[dbo].[ARPB_RSH_CHGREV_HX] ETRRSH
      LEFT JOIN [Clarity_PRD_Report].[dbo].[PRE_AR_CHG] ETR ON ETRRSH.[TX_ID]=ETR.[TX_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] PAT ON ETR.[PAT_ID]=PAT.[PAT_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] EMP ON ETRRSH.[RSH_REV_USER_ID] = EMP.[USER_ID]
      LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] RSH ON ETRRSH.[REV_RESEARCH_ID] = RSH.[RESEARCH_ID]
      INNER JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] HAN ON ETRRSH.[RSH_REV_COMMENT_ID] = HAN.[NOTE_ID]
      WHERE PAT.[PAT_MRN_ID]=@vMRN AND HAN.[ACCT_NOTE_TEXT] IS NOT NULL
      UNION ALL
      SELECT DISTINCT 
            'HB Notes' [Type]
            ,pat.[PAT_MRN_ID] [MRN] 
            ,CAST(hspt.[SERVICE_DATE] AS DATE) [Service Date]
            ,rsh.[IRB_APPROVAL_NUM] [IRB]
            ,emp.[NAME] [User Reviewed]
            ,CAST([RSH_REV_DTTM] AS DATE) [Review Date UTC]
            ,[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]) [Review DateTime]
            ,anp.[LINE] [Note Line]
            ,anp.[ACCT_NOTE_TEXT] [Notes]
        FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hbcrh
        LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa ON hbcrh.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat ON hspa.[PAT_ID]=pat.[PAT_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp ON hbcrh.[RSH_REV_USER_ID]=emp.[USER_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh ON hbcrh.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
        LEFT JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] anp ON hbcrh.[RSH_REV_COMMENT_ID]=anp.[NOTE_ID]
        INNER JOIN (SELECT hspt0.[HSP_ACCOUNT_ID] 
                         ,MIN(hspt0.[SERVICE_DATE]) [SERVICE_DATE] 
                   FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt0
                   LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa0 ON hspt0.[HSP_ACCOUNT_ID]=hspa0.[HSP_ACCOUNT_ID]
                   INNER JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat0 ON hspa0.[PAT_ID]=pat0.[PAT_ID]
                   WHERE pat0.[PAT_MRN_ID]=@vMRN
                   GROUP BY hspt0.[HSP_ACCOUNT_ID]) hspt ON hbcrh.[HSP_ACCOUNT_ID]=hspt.[HSP_ACCOUNT_ID]
       WHERE anp.[ACCT_NOTE_TEXT] IS NOT NULL) t
       
      ORDER BY [Service Date] DESC, [IRB], [Review Date] DESC, [User Reviewed], [Note Line]
      SELECT
      MRN, [Type],
      [Service Date],
      [IRB],
      [User Reviewed],
      [Review Date],
      [Review DateTime],
      TRIM(STRING_AGG(IIF([BILLERs_NOTES] IS NULL, '' , [BILLERs_NOTES]) , ' ')) [BILLERs_NOTES],
      TRIM(STRING_AGG(IIF([NOTE_LINE] IS NULL, '' , [NOTE_LINE]) , ' ')) [NOTE_LINE]
      FROM #temp2
      GROUP BY [MRN], [Type],
      [Service Date],
      [IRB],
      [Review Date],
      [Review DateTime],
      [User Reviewed]
      order by [Review Date], [Review DateTime] desc  
         
      DROP TABLE IF EXISTS #temp2
      

      `
    );


   

    return res.status(200).json({
      success: true,
      result: result || [],
      pagination: 1,
      message: "Successfully found epic data where EMPID  = ${id} ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM BillingColor WHERE UserID = ${id}`,
      error: err,
    });
  }
};


endpoints.populatePBnotes = async (req, res) => {
  try {

     res.status(200).json({
      success: true,
      result:  [],
      pagination: 1,
      message: "Successfully populated PBNotes ",
    });

    const  {recordset } =await sql.query(`
    SELECT DISTINCT [Patient MRN] from (
      SELECT DISTINCT [Patient MRN] FROM WQ1075  WHERE [Status] = 'Review'
      UNION ALL
      SELECT DISTINCT [Patient MRN] FROM WQ5508 WHERE [Status] = 'Review'
      ) as A
    `)


    let mrn = recordset.map(r => "'" + r['Patient MRN'] + "'")

    await sqlConnection.query(`
    
DELETE FROM [FI_DM_HIMS_ICD].[dbo].[SA_PBNotes]
INSERT INTO [FI_DM_HIMS_ICD].[dbo].[SA_PBNotes]
      ([ID]
    ,[Type]
      ,[MRN]
      ,[Service Date] 
      ,[IRB]
      ,[User Reviewed]
      ,[Review Date]
      ,[Review DateTime]
      ,[NOTE_LINE]
      ,[BILLERs_NOTES])
SELECT

 DENSE_RANK() OVER(Order BY   MRN,
 CAST( [Service Date] AS DATE),
 IRB,
([Review DateTime]),
[User Reviewed]) AS ID,
* FROM
(SELECT DISTINCT 
      'PB Notes' [Type]
      ,PAT.[PAT_MRN_ID] [MRN]
      ,CAST(ETR.[SERVICE_DATE] AS DATE) [Service Date]
      ,RSH.[IRB_APPROVAL_NUM] [IRB]
      ,EMP.[NAME] [User Reviewed]
      ,CAST(ETRRSH.[RSH_REV_DTTM] AS DATE) [Review Date]
      ,FI_DM_HIMS_ICD.dbo.UTC_TO_LA_T(ETRRSH.[RSH_REV_DTTM]) [Review DateTime]
      ,HAN.[LINE] [Note Line]
      ,HAN.[ACCT_NOTE_TEXT] [Notes]
FROM [Clarity_PRD_Report].[dbo].[ARPB_RSH_CHGREV_HX] ETRRSH
LEFT JOIN [Clarity_PRD_Report].[dbo].[PRE_AR_CHG] ETR ON ETRRSH.[TX_ID]=ETR.[TX_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] PAT ON ETR.[PAT_ID]=PAT.[PAT_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] EMP ON ETRRSH.[RSH_REV_USER_ID] = EMP.[USER_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] RSH ON ETRRSH.[REV_RESEARCH_ID] = RSH.[RESEARCH_ID]
INNER JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] HAN ON ETRRSH.[RSH_REV_COMMENT_ID] = HAN.[NOTE_ID]
WHERE PAT.[PAT_MRN_ID] IN (
${mrn}
) AND HAN.[ACCT_NOTE_TEXT] IS NOT NULL
UNION ALL
SELECT DISTINCT 
      'HB Notes' [Type]
      ,pat.[PAT_MRN_ID] [MRN] 
      ,CAST(hspt.[SERVICE_DATE] AS DATE) [Service Date]
      ,rsh.[IRB_APPROVAL_NUM] [IRB]
      ,emp.[NAME] [User Reviewed]
      ,CAST([RSH_REV_DTTM] AS DATE) [Review Date UTC]
      ,[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]) [Review DateTime]
      ,anp.[LINE] [Note Line]
      ,anp.[ACCT_NOTE_TEXT] [Notes]
  FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hbcrh
  LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa ON hbcrh.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat ON hspa.[PAT_ID]=pat.[PAT_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp ON hbcrh.[RSH_REV_USER_ID]=emp.[USER_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh ON hbcrh.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
  LEFT JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] anp ON hbcrh.[RSH_REV_COMMENT_ID]=anp.[NOTE_ID]
  INNER JOIN (SELECT hspt0.[HSP_ACCOUNT_ID] 
                   ,MIN(hspt0.[SERVICE_DATE]) [SERVICE_DATE] 
             FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt0
             LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa0 ON hspt0.[HSP_ACCOUNT_ID]=hspa0.[HSP_ACCOUNT_ID]
             INNER JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat0 ON hspa0.[PAT_ID]=pat0.[PAT_ID]
             WHERE pat0.[PAT_MRN_ID] IN (
              ${mrn}
              )
             GROUP BY hspt0.[HSP_ACCOUNT_ID]) hspt ON hbcrh.[HSP_ACCOUNT_ID]=hspt.[HSP_ACCOUNT_ID]
 WHERE anp.[ACCT_NOTE_TEXT] IS NOT NULL) t
ORDER BY [Service Date] DESC, [IRB], [Review Date] DESC, [User Reviewed], [Note Line]

    `)


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



endpoints.populateHBnotes = async (req, res) => {
  try {

     res.status(200).json({
      success: true,
      result:  [],
      pagination: 1,
      message: "Successfully populated HB Notes ",
    });

    const  {recordset } =await sql.query(`
      SELECT DISTINCT [Patient MRN] FROM WQ1262 WHERE [Status] = 'Review'
    `)


    let mrn = recordset.map(r => "'" + r['Patient MRN'] + "'")


    await sqlConnection.query (`
    DELETE FROM [FI_DM_HIMS_ICD].[dbo].[SA_HBNotes]
    INSERT INTO [FI_DM_HIMS_ICD].[dbo].[SA_HBNotes]
    ([ID]
    ,[HAR]
    ,[MRN]
    ,[Service Date]
    ,[Review Date]
    ,[IRB]
    ,[User Reviewed]
    ,[Note Order]
    ,[Notes])

SELECT 
DENSE_RANK() OVER(Order BY   hbcrh.[HSP_ACCOUNT_ID],
pat.[PAT_MRN_ID],
[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]),
CAST(hspt.[SERVICE_DATE] AS DATE),
rsh.[IRB_APPROVAL_NUM],
emp.[NAME]) AS ID,
hbcrh.[HSP_ACCOUNT_ID] [HAR]
  ,pat.[PAT_MRN_ID] [MRN]
  ,CAST(hspt.[SERVICE_DATE] AS DATE) [Service Date]
  ,[FI_DM_HIMS_ICD].[dbo].[UTC_TO_LA_T](hbcrh.[RSH_REV_DTTM]) [Review Date]
  ,rsh.[IRB_APPROVAL_NUM] [IRB]
  ,emp.[NAME] [User Reviewed]
,anp.[LINE] [Note Order]
  ,anp.[ACCT_NOTE_TEXT] [Notes] 
FROM [Clarity_PRD_Report].[dbo].[HSP_RSH_CHGREV_HX] hbcrh WITH (NOLOCK)
INNER JOIN (SELECT hspt0.[HSP_ACCOUNT_ID]
               ,MIN(hspt0.[SERVICE_DATE]) [SERVICE_DATE]
         FROM [Clarity_PRD_Report].[dbo].[HSP_TRANSACTIONS] hspt0 WITH (NOLOCK)
         LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa0 WITH (NOLOCK) ON hspt0.[HSP_ACCOUNT_ID]=hspa0.[HSP_ACCOUNT_ID]
         INNER JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat0 WITH (NOLOCK) ON hspa0.[PAT_ID]=pat0.[PAT_ID]
         WHERE pat0.[PAT_MRN_ID] IN (
 ${mrn}
)
         GROUP BY hspt0.[HSP_ACCOUNT_ID]) hspt ON hbcrh.[HSP_ACCOUNT_ID]=hspt.[HSP_ACCOUNT_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[HSP_ACCOUNT] hspa WITH (NOLOCK) ON hbcrh.[HSP_ACCOUNT_ID]=hspa.[HSP_ACCOUNT_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[PATIENT] pat WITH (NOLOCK) ON hspa.[PAT_ID]=pat.[PAT_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_EMP] emp WITH (NOLOCK) ON hbcrh.[RSH_REV_USER_ID]=emp.[USER_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[CLARITY_RSH] rsh WITH (NOLOCK) ON hbcrh.[REV_RESEARCH_ID]=rsh.[RESEARCH_ID]
LEFT JOIN [Clarity_PRD_Report].[dbo].[ACCT_NOTEPAD] anp WITH (NOLOCK) ON hbcrh.[RSH_REV_COMMENT_ID]=anp.[NOTE_ID]
ORDER BY RSH_REV_DTTM DESC, anp.[LINE] , ID DESC

    `)


  } catch (err) {
      return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });   
  }
}

module.exports = endpoints;