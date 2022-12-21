

var sql = require("mssql");
const methods = require("./crudController");
const { getDateTime } = require("./utilController");
const WQ5508FCHModal = '[HIMS].[dbo].[WQ5508FlowchartHistorical]'
const WQ1075FCHModal = '[HIMS].[dbo].[WQ1075FlowchartHistorical]'


exports.wq5508Flowchart = async (req,res) => {
  const query = `
  BEGIN TRY
  USE [HIMSRB]
  DECLARE @StartDate DATE = '${getDateTime().split('T')[0]}' 
  DECLARE @EndDate DATE = '${getDateTime().split('T')[0]}'
 
    
  DECLARE @Columns1 VARCHAR(MAX) = ''
  DECLARE @Columns2 VARCHAR(MAX) = ''
  DECLARE @Columns3 VARCHAR(MAX) = ''
  DECLARE @Columns4 VARCHAR(MAX) = ''
  DECLARE @Columns5 VARCHAR(MAX) = ''
  

select * into #tempusers
FROM JWT WHERE SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
order by Nickname


CREATE CLUSTERED INDEX TempIdx ON #tempusers
(     [Nickname] ASC
) WITH (SORT_IN_TEMPDB = ON)
  
  SELECT @Columns1 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Cnt ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Assigned''', ',') FROM #tempusers
  SELECT @Columns2 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Done ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Dones''', ',') FROM #tempusers
  SELECT @Columns3 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN DoNotScrubs ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-DoNotScrubs''', ',') FROM #tempusers
  SELECT @Columns4 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [UserName] = ''' + [Nickname] + ''' THEN DurationHrs ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-Time''', ',') FROM #tempusers
  SELECT @Columns5 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [Nickname] = ''' + [Nickname] + ''' THEN BonusProd ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-BP''', ',') FROM #tempusers
  
  drop table IF EXISTS #tempusers


   SELECT j.Nickname, isnull(x.Cnt, 0) Cnt into #Temp5508Assigned
        from JWT J
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ5508]
        where ([ActionTimeStamp] >= @StartDate or  [Status] = 'Review')  
        group BY [UserAssigned]
        ) x on j.Nickname = x.UserAssigned
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
  
    SELECT j.Nickname  , isnull(x.Cnt, 0) Done into #TempDone
        from JWT J
        left join (
        SELECT [User], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ5508]
        where ([ActionTimeStamp] >= @StartDate ) 
        group BY [User]
        ) x on j.Nickname = x.[User]
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
  
  
  SELECT j.Nickname  , isnull(x.Cnt, 0) DoNotScrubs into #Temp5508NotScrub
        from JWT J
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ5508]
        where ([Research IRB] IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [SCRUB STATUS] = '0'
        ) ) and ( [ActionTimeStamp] > @StartDate  or [Status] = 'Review') 
        group BY [UserAssigned]
        ) x on j.Nickname = x.UserAssigned
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth') 
  
  
  
  SELECT j.Nickname  , isnull(x.Cnt, 0) BonusProd into #Temp5508Bp
        from JWT J
        left join (
        SELECT [User], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ5508]
        where ([ActionTimeStamp] >= @StartDate and [UserAssigned] <> [User] ) 
        group BY [User]
        ) x on j.Nickname = x.[User] 
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
  
      ;WITH 
  CTEMRNDuration5508_Prod
  AS
  (
  SELECT [User] as [UserName], [Patient MRN] as MRN, [EntryDate] = @StartDate, CAST(ISNULL((CONVERT(Float, [Duration])/ 1000) , 0.00) as decimal(15,2))  as [DurationSecond] FROM WQ5508 where  [ActionTimeStamp] > @StartDate group by [Patient MRN], [User], Duration
  )
  
  SELECT [UserName],  [EntryDate],  dbo.STOM(SUM(DurationSecond)) DurationMin
  ,  dbo.STOH(SUM(DurationSecond)) DurationHrs into #Temp5508Prod
  FROM CTEMRNDuration5508_Prod
  GROUP BY  EntryDate, UserName
  
  
  
  
  
  SELECT TOP 1 CONVERT(DATE, [DateTime]) [Date], MRN, COUNT(1) - 1 Cnt INTO #TempCount
    FROM WQ5508Logger
    WHERE UserName IN (SELECT NickName from JWT where SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth'))
    GROUP BY CONVERT(DATE, [DateTime]), MRN
    ORDER BY CONVERT(DATE, [DateTime]) DESC
    ;WITH CTELoggerData5508
    AS
    (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime, W.[Process Type]
      FROM [HIMSRB].[dbo].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[dbo].[WQ5508] W ON L.IDWQ5508 = W.ID --AND W.[Process Type] = 'Expedite'
      WHERE  L.UserName IN (SELECT NickName from JWT where SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),
  
  
    CTEMRNWiseTime5508
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, [Process Type],MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData5508
      GROUP BY UserName, MRN, EntryDate, [Process Type]
    ),
    CTEMRNDuration5508
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      HIMSRB.dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin, [Process Type]
      FROM CTEMRNWiseTime5508
      where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal5508
    AS
    (
      SELECT x.UserName, [Process Type], SecondsAvg,
      HIMSRB.dbo.STOM(SecondsAvg) [MinutesAvg],
      HIMSRB.dbo.STOM(HIMSRB.dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName, [Process Type],
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ5508)) FROM CTELoggerData5508 d1 where d1.[UserName] = d4.[UserName] and d1.[Process Type] =  d4.[Process Type]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration5508 d4
        group by UserName, [Process Type]
      ) x
    )
    ,CTE1LoggerData5508
    AS
    (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ5508] W ON L.IDWQ5508 = W.ID
      INNER JOIN [HIMSRB].[DBO].[DataCollection] D ON CAST(W.[Research IRB] as varchar) = CAST(D.IRB as VARCHAR)
      WHERE  L.UserName IN (SELECT NickName from JWT where SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),
    CTE1MRNWiseTime5508
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTE1LoggerData5508
      GROUP BY UserName, MRN, EntryDate
    ),
    CTE1MRNDuration5508
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      HIMSRB.dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
      FROM CTE1MRNWiseTime5508
    )
     
    ,
    CTE1AverageTotal5508
    AS
    (
      SELECT x.UserName, SecondsAvg,
      HIMSRB.dbo.STOM(SecondsAvg) [MinutesAvg],
      HIMSRB.dbo.STOM(HIMSRB.dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ5508)) FROM CTE1LoggerData5508 a1 where a1.[UserName] = a2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTE1MRNDuration5508 a2
        group by UserName
      ) x
    )
    
    
  
    
    
    
    , CTELoggerData5508_1
    AS
      (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ5508] W ON L.IDWQ5508 = W.ID 
      WHERE L.UserName IN (SELECT NickName from JWT where SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
    W.[Process Type] = 'Standard' and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    )
  ,
    CTEMRNWiseTime5508_1
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData5508_1
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration5508_1
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    DATEDIFF(MilliSECOND, StartTime, EndTime) DurationMiliSecond,
     [HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime))  DurationMin
      FROM CTEMRNWiseTime5508_1
      where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal5508_1
    AS
    (
      SELECT x.UserName, SecondsAvg,
     [HIMSRB].dbo.STOM(SecondsAvg) [MinutesAvg],
     [HIMSRB].dbo.STOM(dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ5508)) FROM CTELoggerData5508_1 t1 where t1.[UserName] = t2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration5508_1 t2
        group by UserName
      ) x
    )
    
    
  
    ,
    CTEUserWiseAge
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal5508_1
    ),
  
  CTELoggerData5508_2
    AS
      (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ5508] W ON L.IDWQ5508 = W.ID 
      WHERE L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne','Heather', 'Bernadette') and
    W.[Process Type] = 'Expedite' and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    )
  ,
    CTEMRNWiseTime5508_2
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData5508_2
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration5508_2
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
     [HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime) - 0.8)  DurationMin
      FROM CTEMRNWiseTime5508_2
      where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal5508_2
    AS
    (
      SELECT x.UserName, SecondsAvg,
     [HIMSRB].dbo.STOM(SecondsAvg) [MinutesAvg],
     [HIMSRB].dbo.STOM(dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ5508)) FROM CTELoggerData5508_2 b1 where b1.[UserName] = b2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration5508_2 b2
        group by UserName
      ) x
    ),
    CTEUserWiseAge2
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal5508_2
    ),
  CTELoggerData5508_3
    AS
      (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ5508] W ON L.IDWQ5508 = W.ID 
      WHERE L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne','Heather', 'Bernadette') and
  W.[Research IRB]  IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    )
    and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),
    CTEMRNWiseTime5508_3
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData5508_3
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration5508_3
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
     [HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime) - 0.8) DurationMin
      FROM CTEMRNWiseTime5508_3
      where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal5508_3
    AS
    (
      SELECT x.UserName, SecondsAvg,
     [HIMSRB].dbo.STOM(SecondsAvg) [MinutesAvg],
     [HIMSRB].dbo.STOM(dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ5508)) FROM CTELoggerData5508_3 c1 where c1.[UserName] = c2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration5508_3 c2
        group by UserName
      ) x
    ),
    CTEUserWiseAge3
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal5508_3
    ),

  CTELoggerData5508_4
    AS
      (
     SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ5508Logger, L.IDWQ5508, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ5508Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ5508] W ON L.IDWQ5508 = W.ID 
      WHERE L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne','Heather', 'Bernadette') and
    W.[UserAssigned] <> W.[User] and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),
    CTEMRNWiseTime5508_4
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ5508) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData5508_4
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration5508_4
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
     [HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime) - 0.8) DurationMin
      FROM CTEMRNWiseTime5508_4
      where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal5508_4
    AS
    (
      SELECT x.UserName, SecondsAvg,
     [HIMSRB].dbo.STOM(SecondsAvg) [MinutesAvg],
     [HIMSRB].dbo.STOM(dbo.STOM(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) /  (SELECT (CASE WHEN COUNT(DISTINCT(IDWQ5508)) > 0 THEN COUNT(DISTINCT(IDWQ5508))   ELSE 1 END) FROM CTELoggerData5508_4 e1 where e1.[UserName] = e2.[UserName]) , 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration5508_4 e2
        group by UserName
      ) x
    ),
    CTEUserWiseAge4
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal5508_4
    )


  
,
  SummaryCTE 
  AS (
    
    SELECT  (
      SELECT COUNT(*) as Expedite from [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Expedite' and [Status] = 'Review'
    ) AS Expedite,
    (
      SELECT COUNT(*) as Expedite from [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Standard' and [Status] = 'Review'
    ) AS Standard,
    (
    SELECT Count(*)  AS Scrubs  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB] NOT IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) or [Research IRB]  IS NULL) and [Status] = 'Review'
    ) AS Scrubs,
   (
    SELECT Count(*)  AS DoNotScrubs FROM [HIMSRB].[dbo].[WQ5508]  where [Research IRB] IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) and [Status] = 'Review'
    ) AS DoNotScrubs,
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB] IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Perm] = 'Perm'
    ) ) and ([Status] = 'Review' )
    ) AS [Perms],
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Test] = 'Test'
    ) ) and ([Status] = 'Review' )
    ) AS [Test],
  (
      SELECT COUNT(*) as ExpediteTotal from [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Expedite' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS [ExpediteTotal],
    (
      SELECT COUNT(*) as ExpediteTotal from [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Standard' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS [StandardTotal],
    (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB] NOT IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) or [Research IRB]  IS NULL) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS ScrubsTotal,
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Perm] = 'Perm'
    ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS PermsTotal,
    
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Test] = 'Test' 
    ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS TestTotal,
   (
    SELECT Count(*)  AS DoNotScrubs FROM [HIMSRB].[dbo].[WQ5508]  where [Research IRB] IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS [DoNotScrubsTotal],
    (
      SELECT Count(*)  AS Scrubs FROM [HIMSRB].[dbo].[WQ5508]  where  ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
      ) AS [Total],
      (
        SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB] IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [SCRUB STATUS] = '0'
        ) or [Research IRB] IS NULL) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
        ) AS [DoNotScrubAmount],
    (
    SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ5508] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and [Status] = 'Review'
    ) as DataCollection,
   (
    SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ5508] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) as DataCollectionTotal,

  (
  SELECT COUNT(*)  AS Amount FROM (
    SELECT DISTINCT IDWQ5508 FROM CTELoggerData5508_4
    ) as A
    
  ) as [BP-Total],
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2))) AS Amount  FROM [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Expedite' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) as ExpediteAmount,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ5508] where [Process Type] = 'Standard' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) as StandardAmount,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ5508] where  ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) as TotalAmount,
    (
      SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
        SELECT
        [value]
            FROM [HIMSRB].[dbo].[Agenda] t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [No Scrub-Perm] = 'Perm'
      ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
      ) AS PermsAmountTotal,
      (
        SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [No Scrub-Perm] = 'Perm'
        ) ) and ([Status] = 'Review' )
        ) AS PermsAmount,
        (
          SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
            SELECT
            [value]
                FROM [HIMSRB].[dbo].[Agenda] t1
                CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                where [No Scrub-Test] = 'Test'
          ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
          ) AS TestAmountTotal,
          (
            SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   FROM [HIMSRB].[dbo].[WQ5508]  where ([Research IRB]  IN (
              SELECT
              [value]
                  FROM [HIMSRB].[dbo].[Agenda] t1
                  CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
                  where [No Scrub-Test] = 'Test'
            ) ) and ([Status] = 'Review' )
            ) AS TestAmount,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ5508] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) as DataCollectionAmount,
  (
  SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount FROM (
    SELECT DISTINCT IDWQ5508 FROM CTELoggerData5508_4
    ) as A
    Left Join WQ5508 B on A.IDWQ5508 = B.ID
  ) as [BP-Amount],

    (
    SELECT  [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal5508
      WHERE [Process Type] = 'Expedite'
    ) X
    ) as ExpediteSpeed,
    (
    SELECT  [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal5508
      WHERE [Process Type] = 'Standard'
    ) X
    ) as StandardSpeed,
  (
   SELECT  [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal5508_4
    
    ) X
  ) as [BP-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTE1AverageTotal5508
    ) X
    ) As DataCollectionSpeed,
  
    (
    SELECT [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) as NVARCHAR))
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal5508_1
    ) X
    ) TeamStandardAvg,
    (
    SELECT COUNT(*) from WQ5508  where ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
    ) IncomingWQ,
  (
    SELECT COUNT(*) from WQ5508  where [Research IRB] IS NULL and  ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
    ) MissingIRB,
    (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge
    ) [Anna Maria-Standard],
  (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge
    ) [Bernadette-Standard],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge
    ) [Ferdinand-Standard],
   (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge
    ) [Heather-Standard],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge
    ) [Jacqueline-Standard],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge
    ) [Jannet-Standard],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge
    ) [Suzanne-Standard],
   
    
  (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge2
    ) [Anna Maria-Expedite],
   (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge2
    ) [Bernadette-Expedite],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge2
    ) [Ferdinand-Expedite],
    (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge2
    ) [Heather-Expedite],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge2
    ) [Jacqueline-Expedite],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge2
    ) [Jannet-Expedite],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge2
    ) [Suzanne-Expedite],
  
   
   (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge3
    ) [Anna Maria-DC],

  (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge3
    ) [Bernadette-DC],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge3
    ) [Ferdinand-DC],
    (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge3
    ) [Heather-DC],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge3
    ) [Jacqueline-DC],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge3
    ) [Jannet-DC],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge3
    ) [Suzanne-DC],
  
    
  (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge4
    ) [Anna Maria-BPS],
   (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge4
    ) [Bernadette-BPS],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge4
    ) [Ferdinand-BPS],
  (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge4
    ) [Heather-BPS],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge4
    ) [Jacqueline-BPS],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge4
    ) [Jannet-BPS],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge4
    ) [Suzanne-BPS]
    
   
  )
   select * INTO #temp5508SumaryCTE from SummaryCTE s
   
  
   
  EXEC(N'SELECT ' + @Columns1 + ' into ##Temp5508Assigned FROM #Temp5508Assigned')
  EXEC(N'SELECT ' + @Columns2 + ' into ##TempDone FROM #TempDone')
  EXEC(N'SELECT ' + @Columns3 + ' into ##Temp5508NotScrub FROM #Temp5508NotScrub')
  EXEC(N'SELECT ' + @Columns4 + ' into ##Temp5508Prod FROM #Temp5508Prod')
  EXEC(N'SELECT ' + @Columns5 + ' into ##Temp5508Bp FROM #Temp5508Bp')
    
   select s.*, t.*, d.*, s1.*, p.*,s2.*,
   (SELECT Cnt FROM #TempCount) MostRecentDoneClaim, @StartDate as Date
   from #temp5508SumaryCTE s
   inner join ##Temp5508Assigned t on 1 =1 
   inner join ##TempDone d on 1 =1 
   inner join ##Temp5508NotScrub s1 on 1 =1 
   inner join ##Temp5508Prod p on 1 = 1
     inner join ##Temp5508BP s2 on 1 = 1
   
   drop table IF EXISTS #Temp5508Assigned
    drop table IF EXISTS #TempDone
    drop table IF EXISTS #Temp5508NotScrub
    drop table IF EXISTS #Temp5508Prod
    drop table IF EXISTS #Temp5508Bp
    drop table IF EXISTS #temp5508SumaryCTE

  drop table IF EXISTS #tempusers

  
    drop table IF EXISTS ##Temp5508Assigned
    drop table IF EXISTS ##TempDone
    drop table IF EXISTS ##Temp5508NotScrub
    drop table IF EXISTS #TempCount
    drop table IF EXISTS ##Temp5508Prod
    drop table IF EXISTS ##Temp5508Bp
    
    END TRY
    BEGIN CATCH
   drop table IF EXISTS #Temp5508Assigned
      drop table IF EXISTS #TempDone
      drop table IF EXISTS #Temp5508NotScrub
      drop table IF EXISTS #Temp5508Prod
      drop table IF EXISTS #Temp5508Bp
     drop table IF EXISTS #temp5508SumaryCTE

    
      drop table IF EXISTS ##Temp5508Assigned
      drop table IF EXISTS ##TempDone
      drop table IF EXISTS ##Temp5508NotScrub
      drop table IF EXISTS #TempCount
      drop table IF EXISTS ##Temp5508Prod
      drop table IF EXISTS ##Temp5508Bp
  drop table IF EXISTS #tempusers


  END CATCH 

  `
  let q = `
  ${query}
  
  `

  const {recordset: result} = await sql.query(q)
  
  try {
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 





exports.wq1075Flowchart = async (req,res) => {
  const query = `
  
  BEGIN TRY
  USE HIMSRB
  DECLARE @StartDate DATE = '${getDateTime().split('T')[0]}' 
  DECLARE @EndDate DATE = '${getDateTime().split('T')[0]}'
     
 
  DECLARE @Columns1 VARCHAR(MAX) = ''
  DECLARE @Columns2 VARCHAR(MAX) = ''
  DECLARE @Columns3 VARCHAR(MAX) = ''
DECLARE @Columns4 VARCHAR(MAX) = ''
DECLARE @Columns5 VARCHAR(MAX) = ''



select * into #tempusers
FROM JWT WHERE   SubSection IN ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
order by Nickname


CREATE CLUSTERED INDEX TempIdx ON #tempusers
(     [Nickname] ASC
) WITH (SORT_IN_TEMPDB = ON)

  SELECT @Columns1 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Cnt ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Assigned''', ',') FROM #tempusers
  SELECT @Columns2 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Done ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Dones''', ',') FROM #tempusers
  SELECT @Columns3 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN DoNotScrubs ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-DoNotScrubs''', ',') FROM #tempusers
SELECT @Columns4 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [UserName] = ''' + [Nickname] + ''' THEN DurationHrs ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-Time''', ',') FROM #tempusers
SELECT @Columns5 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [Nickname] = ''' + [Nickname] + ''' THEN BonusProd ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-BP''', ',') FROM #tempusers


DROP TABLE IF EXISTS #tempusers

   SELECT j.Nickname, isnull(x.Cnt, 0) Cnt into #Temp1075Assigned
        from JWT J
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ1075]
        where ([ActionTimeStamp] >= @StartDate or  [Status] = 'Review')  
        group BY [UserAssigned]
        ) x on j.Nickname = x.UserAssigned
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

    SELECT j.Nickname  , isnull(x.Cnt, 0) Done into #Temp1075Done
        from JWT J
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ1075]
        where ([ActionTimeStamp] >= @StartDate ) 
        group BY [UserAssigned]
        ) x on j.Nickname = x.UserAssigned
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')


 SELECT j.Nickname  , isnull(x.Cnt, 0) DoNotScrubs into #temp1075NotScrub
        from JWT J
        left join (
        SELECT [UserAssigned], COUNT(1) Cnt
        from [HIMSRB].[dbo].[WQ1075]
        where ([Research IRB] IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [SCRUB STATUS] = '0'
        ) ) and ( [ActionTimeStamp] > @StartDate  or [Status] = 'Review')
        group BY [UserAssigned]
        ) x on j.Nickname = x.UserAssigned
        where j.SubSection in ('PB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')


SELECT j.Nickname  , isnull(x.Cnt, 0) BonusProd into #Temp1075Bp
    from JWT J
    left join (
    SELECT [User], COUNT(1) Cnt
    from [HIMSRB].[dbo].[WQ1075]
    where ([ActionTimeStamp] >= @StartDate and [UserAssigned] <> [User] ) 
    group BY [User]
    ) x on j.Nickname = x.[User] 
    where j.SubSection in ('HB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

;WITH 
CTEMRNDuration1075_Prod
AS
(
SELECT [User] as [UserName], [Patient MRN] as MRN, [EntryDate] = @StartDate, CAST(ISNULL((CONVERT(Float, [Duration])/ 1000) , 0.00) as decimal(15,2))  as [DurationSecond] FROM WQ1075 where  [ActionTimeStamp] > @StartDate group by [Patient MRN], [User], Duration
)

SELECT [UserName],  [EntryDate],  dbo.STOM(SUM(DurationSecond)) DurationMin
,  dbo.STOH(SUM(DurationSecond)) DurationHrs into #Temp1075Prod
FROM CTEMRNDuration1075_Prod
GROUP BY  EntryDate, UserName

EXEC(N'SELECT ' + @Columns1 + ' into ##Temp1075Assigned FROM #Temp1075Assigned')
EXEC(N'SELECT ' + @Columns2 + ' into ##Temp1075Done FROM #Temp1075Done')
EXEC(N'SELECT ' + @Columns3 + ' into ##temp1075NotScrub FROM #temp1075NotScrub')
EXEC(N'SELECT ' + @Columns4 + ' into ##Temp1075Prod FROM #Temp1075Prod')
EXEC(N'SELECT ' + @Columns5 + ' into ##Temp1075Bp FROM #Temp1075Bp')


     SELECT TOP 1 CONVERT(DATE, [DateTime]) [Date], MRN, COUNT(1) - 1 Cnt INTO #TempCount
    FROM [HIMSRB].[dbo].[WQ1075Logger]
    WHERE UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne' , 'Heather', 'Bernadette')
    GROUP BY CONVERT(DATE, [DateTime]), MRN
    ORDER BY CONVERT(DATE, [DateTime]) DESC
    ;WITH CTELoggerData1075
    AS
    (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ1075Logger, L.IDWQ1075, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime, W.[Process Type]
      FROM [HIMSRB].[dbo].[WQ1075Logger] L
      INNER JOIN [HIMSRB].[dbo].[WQ1075] W ON L.IDWQ1075 = W.ID 
      WHERE  L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne', 'Heather', 'Bernadette') and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),


    CTEMRNWiseTime1075
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ1075) Claims, UserName, MRN, EntryDate, [Process Type],MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData1075
      GROUP BY UserName, MRN, EntryDate, [Process Type]
    ),
    CTEMRNDuration1075
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      HIMSRB.dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin, [Process Type]
      FROM CTEMRNWiseTime1075
      where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal1075
    AS
    (
      SELECT x.UserName, [Process Type], SecondsAvg,
      HIMSRB.dbo.MTOH(SecondsAvg) [MinutesAvg],
      HIMSRB.dbo.MTOH(HIMSRB.dbo.MTOH(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName, [Process Type],
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1075)) FROM CTELoggerData1075 a1 where a1.[UserName] = a2.[UserName] and a1.[Process Type] =  a2.[Process Type]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration1075 a2
        group by UserName, [Process Type]
      ) x
    )
    ,CTE1LoggerData1075
    AS
    (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ1075Logger, L.IDWQ1075, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ1075Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ1075] W ON L.IDWQ1075 = W.ID
      INNER JOIN [HIMSRB].[DBO].[DataCollection] D ON CAST(W.[Research IRB] as varchar) = CAST(D.IRB as VARCHAR)
      WHERE  L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne', 'Heather', 'Bernadette') and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    ),
    CTE1MRNWiseTime1075
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ1075) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTE1LoggerData1075
      GROUP BY UserName, MRN, EntryDate
    ),
    CTE1MRNDuration1075
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      HIMSRB.dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
      FROM CTE1MRNWiseTime1075
    ),
    CTE1AverageTotal1075
    AS
    (
      SELECT x.UserName, SecondsAvg,
      HIMSRB.dbo.MTOH(SecondsAvg) [MinutesAvg],
      HIMSRB.dbo.MTOH(HIMSRB.dbo.MTOH(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) /  (SELECT COUNT(DISTINCT(IDWQ1075)) FROM CTE1LoggerData1075 b1 where b1.[UserName] = b2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTE1MRNDuration1075 b2
        group by UserName
      ) x
    ), CTELoggerData1075_1
    AS
      (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ1075Logger, L.IDWQ1075, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ1075Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ1075] W ON L.IDWQ1075 = W.ID 
      WHERE L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne','Heather', 'Bernadette') and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    )
  ,
    CTEMRNWiseTime1075_1
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ1075) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData1075_1
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration1075_1
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
      FROM CTEMRNWiseTime1075_1
      where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal1075_1
    AS
    (
      SELECT x.UserName, SecondsAvg,
      dbo.MTOH(SecondsAvg) [MinutesAvg],
      dbo.MTOH(dbo.MTOH(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1075)) FROM CTELoggerData1075_1 c1 where c1.[UserName] = c2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration1075_1 c2
        group by UserName
      ) x
    ),
    CTEUserWiseAge
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal1075_1
    ),

  CTELoggerData1075_2
    AS
      (
      SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
      , L.IDWQ1075Logger, L.IDWQ1075, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
      , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
      , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
      FROM [HIMSRB].[DBO].[WQ1075Logger] L
      INNER JOIN [HIMSRB].[DBO].[WQ1075] W ON L.IDWQ1075 = W.ID 
      WHERE L.UserName IN ('Anna Maria', 'Ferdinand', 'Jacqueline', 'Jannet', 'Suzanne','Heather', 'Bernadette') and
    W.[Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and
      CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
      (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
    )



  ,
    CTEMRNWiseTime1075_2
    AS
    (
      SELECT MAX(Rno) Rno, COUNT(IDWQ1075) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
      FROM CTELoggerData1075_2
      GROUP BY UserName, MRN, EntryDate
    ),
    CTEMRNDuration1075_2
    AS
    (
      SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
      dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
      FROM CTEMRNWiseTime1075_2
      where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
    ),
    CTEAverageTotal1075_2
    AS
    (
      SELECT x.UserName, SecondsAvg,
      dbo.MTOH(SecondsAvg) [MinutesAvg],
      dbo.MTOH(dbo.MTOH(SecondsAvg)) [HoursAvg]
      FROM (
        SELECT UserName,
        SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
        CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
        CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1075)) FROM CTELoggerData1075_2 d1 where d1.[UserName] = d2.[UserName]), 2)
        ELSE 0.00 END SecondsAvg
        FROM CTEMRNDuration1075_2 d2
        group by UserName
      ) x
    ),
    CTEUserWiseAge2
    AS
    (
      SELECT
      ISNULL(SUM(CASE WHEN USERNAME = 'Anna Maria' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna Maria],
      ISNULL(SUM(CASE WHEN USERNAME = 'Ferdinand' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Ferdinand],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jacqueline' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jacqueline],
      ISNULL(SUM(CASE WHEN USERNAME = 'Jannet' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Jannet],
      ISNULL(SUM(CASE WHEN USERNAME = 'Suzanne' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Suzanne],
      ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
      ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]
  
      FROM CTEAverageTotal1075_2
    ),
SummaryCTE 
AS (
    SELECT  (
      SELECT COUNT(*) as [60DaysandOver] from [HIMSRB].[dbo].[WQ1075] where [Process Type] = '60 Days and Over' and [Status] = 'Review'
    ) AS [60DaysandOver],
    (
      SELECT COUNT(*) as [Under60Days] from [HIMSRB].[dbo].[WQ1075] where [Process Type] = 'Under 60 Days' and [Status] = 'Review'
    ) AS [Under60Days],
(
      SELECT COUNT(*) as [Under60Days] from [HIMSRB].[dbo].[WQ1075] where [Status] = 'Review'
    ) AS [Standard],
    (
    SELECT Count(*)  AS Scrubs  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB] NOT IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) or [Research IRB] IS NULL) and [Status] = 'Review'
    ) AS Scrubs,
  (
      SELECT COUNT(*) as [Answers] from [HIMSRB].[dbo].[WQ1075] where [Answer] IS NULL
    ) AS [Answers],
   (
    SELECT Count(*)  AS DoNotScrubs FROM [HIMSRB].[dbo].[WQ1075]  where [Research IRB] IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) and [Status] = 'Review'
    ) AS DoNotScrubs,
   (
  SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Perm] = 'Perm'
  ) ) and ([Status] = 'Review' )
  ) AS Perms,
 (
  SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Test] = 'Test'
  ) ) and ([Status] = 'Review' )
  ) AS Test,
  
  (
      SELECT COUNT(*) as [60DaysandOverTotal] from [HIMSRB].[dbo].[WQ1075] where [Process Type] = '60 Days and Over' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) AS [60DaysandOverTotal],
    (
      SELECT COUNT(*) as [Under60DaysTotal] from [HIMSRB].[dbo].[WQ1075] where [Process Type] = 'Under 60 Days' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) AS [Under60DaysTotal],

    (
    SELECT Count(*)  AS ScrubTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB] NOT IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) or [Research IRB] IS NULL) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) AS ScrubTotal,
   (
  SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Perm] = 'Perm'
  ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
  ) AS PermsTotal,
 (
  SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Test] = 'Test'
  ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
  ) AS TestTotal,
   (
    SELECT Count(*)  AS DoNotScrubsTotal FROM [HIMSRB].[dbo].[WQ1075]  where [Research IRB] IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [SCRUB STATUS] = '0'
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) AS [DoNotScrubsTotal],
    (
      SELECT Count(*)  AS Scrubs FROM [HIMSRB].[dbo].[WQ1075]  where  ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
      ) AS [Total],
     
(
        SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB] IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [SCRUB STATUS] = '0'
        ) or [Research IRB] IS NULL) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
        ) AS [DoNotScrubsAmount],
    (
    SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1075] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and [Status] = 'Review'
    ) as DataCollection,
   (
    SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1075] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) as DataCollectionTotal,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2))) AS Amount  FROM [HIMSRB].[dbo].[WQ1075] where [Process Type] = 'Under 60 Days' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) as Under60DaysAmount,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ1075] where [Process Type] = '60 Days and Over' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) as [60DaysandOverAmount],
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ1075] where  ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) as TotalAmount, 
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS Amount  FROM [HIMSRB].[dbo].[WQ1075] where [Research IRB] IN (
    SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
    ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
    ) as DataCollectionAmount,
    (
      SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
        SELECT
        [value]
            FROM [HIMSRB].[dbo].[Agenda] t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [No Scrub-Perm] = 'Perm'
      ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
      ) AS PermsAmountTotal,
     (
      SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
        SELECT
        [value]
            FROM [HIMSRB].[dbo].[Agenda] t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [No Scrub-Test] = 'Test'
      ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)  
      ) AS TestAmountTotal,
      (
        SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))   AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [No Scrub-Perm] = 'Perm'
        ) ) and ([Status] = 'Review' )
        ) AS PermsAmount,
       (
        SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Sess Amount]), 0.00) as decimal(15,2)))  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1075]  where ([Research IRB]  IN (
          SELECT
          [value]
              FROM [HIMSRB].[dbo].[Agenda] t1
              CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
              where [No Scrub-Test] = 'Test'
        ) ) and ([Status] = 'Review' )
        ) AS TestAmount,
  (
    SELECT  HIMSRB.dbo.[HMS](CAST(ISNULL( HIMSRB.dbo.MTOH(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal1075
    ) X
    ) as [TotalSandardSpeed],
    (
    SELECT  HIMSRB.dbo.[HMS]( CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal1075
      WHERE [Process Type] = '60 Days and Over'
    ) X
    ) as [60DaysandOverSpeed],
    (
    SELECT   HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal1075
      WHERE [Process Type] = 'Under 60 Days'
    ) X
    ) as [Under60DaysSpeed],
    (
    SELECT  HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTE1AverageTotal1075
    ) X
    ) As DataCollectionSpeed,
    (
    SELECT  HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))
    FROM (
      SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
      CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
      FROM CTEAverageTotal1075_1
    ) X
    ) TeamStandardAvg,
    (
    SELECT COUNT(*) from WQ1075  where ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
    ) IncomingWQ,
  (
    SELECT COUNT(*) from WQ1075  where [Research IRB] IS NULL and  ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
    ) MissingIRB,

    (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge
    ) [Anna Maria-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge
    ) [Bernadette-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge
    ) [Ferdinand-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge
    ) [Heather-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge
    ) [Jacqueline-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge
    ) [Jannet-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge
    ) [Suzanne-Speed],
  
  
  (
    SELECT [HIMSRB].dbo.[HMS]([Anna Maria]) FROM CTEUserWiseAge2
    ) [Anna Maria-DC-Speed],
   (
    SELECT [HIMSRB].dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge2
    ) [Bernadette-DC-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Ferdinand]) FROM CTEUserWiseAge2
    ) [Ferdinand-DC-Speed],
  (
    SELECT [HIMSRB].dbo.[HMS]([Heather]) FROM CTEUserWiseAge2
    ) [Heather-DC-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jacqueline]) FROM CTEUserWiseAge2
    ) [Jacqueline-DC-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Jannet]) FROM CTEUserWiseAge2
    ) [Jannet-DC-Speed],
    (
    SELECT [HIMSRB].dbo.[HMS]([Suzanne]) FROM CTEUserWiseAge2
    ) [Suzanne-DC-Speed]
    
   
   )

   select s.*, t.*, d.*, s1.*,p.*, s2.*,
   (SELECT Cnt FROM #TempCount) MostRecentDoneClaim, @StartDate as Date
   from SummaryCTE s
   inner join ##Temp1075Assigned t on 1 =1 
   inner join ##Temp1075Done d on 1 =1 
   inner join ##temp1075NotScrub s1 on 1 =1 
inner join ##Temp1075Prod p on 1 = 1
 inner join ##Temp1075BP s2 on 1 = 1


   
drop table IF EXISTS #Temp1075Assigned
drop table IF EXISTS #Temp1075Done
drop table IF EXISTS #temp1075NotScrub
drop table IF EXISTS #Temp1075Prod
drop table IF EXISTS #Temp1075Bp

drop table IF EXISTS ##Temp1075Assigned
drop table IF EXISTS ##Temp1075Done
drop table IF EXISTS ##temp1075NotScrub
drop table IF EXISTS #TempCount
drop table IF EXISTS ##Temp1075Prod
drop table IF EXISTS ##Temp1075Bp

drop table IF EXISTS #tempusers


END TRY
BEGIN CATCH
 
drop table IF EXISTS #Temp1075Assigned
drop table IF EXISTS #Temp1075Done
drop table IF EXISTS #temp1075NotScrub
drop table IF EXISTS #Temp1075Prod
drop table IF EXISTS #Temp1075Bp

drop table IF EXISTS ##Temp1075Assigned
drop table IF EXISTS ##Temp1075Done
drop table IF EXISTS ##temp1075NotScrub
drop table IF EXISTS #TempCount
drop table IF EXISTS ##Temp1075Prod
drop table IF EXISTS ##Temp1075Bp

drop table IF EXISTS #tempusers


END CATCH
  `
  let q = `
  ${query}
  
  `

  const {recordset: result} = await sql.query(q)
  
  try {
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 




exports.wq1262Flowchart = async (req,res) => {
  const query = `
   
  
   
     
   
BEGIN TRY
USE HIMSRB
DECLARE @StartDate DATE = '${getDateTime().split('T')[0]}' 
DECLARE @EndDate DATE = '${getDateTime().split('T')[0]}'





DECLARE @Columns1 VARCHAR(MAX) = ''
DECLARE @Columns2 VARCHAR(MAX) = ''
DECLARE @Columns3 VARCHAR(MAX) = ''
DECLARE @Columns4 VARCHAR(MAX) = ''
DECLARE @Columns5 VARCHAR(MAX) = ''


select * into #tempusers
FROM JWT WHERE SubSection IN ('HB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')
order by Nickname


  CREATE CLUSTERED INDEX TempIdx ON #tempusers
(     [Nickname] ASC
) WITH (SORT_IN_TEMPDB = ON)


SELECT @Columns1 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Cnt ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Assigned''', ',') FROM #tempusers
SELECT @Columns2 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN Done ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-Dones''', ',') FROM #tempusers
SELECT @Columns3 = STRING_AGG('CAST(SUM(CASE WHEN NickName = ''' + [Nickname] + ''' THEN DoNotScrubs ELSE 0 END) AS VARCHAR)  ''' + [Nickname] + '-DoNotScrubs''', ',') FROM #tempusers
SELECT @Columns4 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [UserName] = ''' + [Nickname] + ''' THEN DurationHrs ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-Time''', ',') FROM #tempusers
SELECT @Columns5 = STRING_AGG('ISNULL(CAST(SUM(CASE WHEN [Nickname] = ''' + [Nickname] + ''' THEN BonusProd ELSE 0 END) AS VARCHAR), 0.00)  ''' + [Nickname] + '-BP''', ',') FROM #tempusers

DROP TABLE IF EXISTS #tempusers

 SELECT j.Nickname, isnull(x.Cnt, 0) Cnt into #Temp1262Assigned
      from JWT J
      left join (
      SELECT [UserAssigned], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ1262]
      where ([ActionTimeStamp] >= @StartDate or  [Status] = 'Review')  
      group BY [UserAssigned]
      ) x on j.Nickname = x.UserAssigned
      where j.SubSection in ('HB', 'RBB')

	 

  SELECT j.Nickname  , isnull(x.Cnt, 0) Done into #Temp1262Done
      from JWT J
      left join (
      SELECT [UserAssigned], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ1262]
      where ([ActionTimeStamp] >= @StartDate ) 
      group BY [UserAssigned]
      ) x on j.Nickname = x.UserAssigned
      where j.SubSection in ('HB', 'RBB')


SELECT j.Nickname  , isnull(x.Cnt, 0) DoNotScrubs into #temp1262NotScrub
      from JWT J
      left join (
      SELECT [UserAssigned], COUNT(1) Cnt
      from [HIMSRB].[dbo].[WQ1262]
      where ([Code]  IN (
        SELECT
        [value]
            FROM [HIMSRB].[dbo].[Agenda] t1
            CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
            where [SCRUB STATUS] = '0'
      ) ) and ( [ActionTimeStamp] > @StartDate)
      group BY [UserAssigned]
      ) x on j.Nickname = x.UserAssigned
      where j.SubSection in ('HB', 'RBB')

SELECT j.Nickname  , isnull(x.Cnt, 0) BonusProd into #Temp1262Bp
  from JWT J
  left join (
  SELECT [User], COUNT(1) Cnt
  from [HIMSRB].[dbo].[WQ1262]
  where ([ActionTimeStamp] >= @StartDate and [UserAssigned] <> [User] ) 
  group BY [User]
  ) x on j.Nickname = x.[User] 
  where j.SubSection in ('HB', 'RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')

   ;WITH 
CTEMRNDuration1262_Prod
AS
(
SELECT [User] as [UserName], [Patient MRN] as MRN, [EntryDate] = @StartDate, CAST(ISNULL((CONVERT(Float, [Duration])/ 1000) , 0.00) as decimal(15,2))  as [DurationSecond] FROM WQ1262 where  [ActionTimeStamp] > @StartDate group by [Patient MRN], [User], Duration
)

SELECT [UserName],  [EntryDate],  dbo.STOM(SUM(DurationSecond)) DurationMin
,  dbo.STOH(SUM(DurationSecond)) DurationHrs into #Temp1262Prod
FROM CTEMRNDuration1262_Prod
GROUP BY  EntryDate, UserName



 SELECT TOP 1 CONVERT(DATE, [DateTime]) [Date], MRN, COUNT(1) - 1 Cnt INTO #TempCount
  FROM WQ1262Logger
  WHERE UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth'))
  GROUP BY CONVERT(DATE, [DateTime]), MRN
  ORDER BY CONVERT(DATE, [DateTime]) DESC
  ;WITH CTELoggerData1262
  AS
  (
    SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime, W.[Process Type]
    FROM [HIMSRB].[dbo].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[dbo].[WQ1262] W ON L.IDWQ1262 = W.ID 
    WHERE  L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  ),


  CTEMRNWiseTime1262
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, [Process Type],MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTELoggerData1262
    GROUP BY UserName, MRN, EntryDate, [Process Type]
  ),
  CTEMRNDuration1262
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    HIMSRB.dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin, [Process Type]
    FROM CTEMRNWiseTime1262
    where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
  ),
  CTEAverageTotal1262
  AS
  (
    SELECT x.UserName, [Process Type], SecondsAvg,
    HIMSRB.dbo.MTOH(SecondsAvg) [MinutesAvg],
    HIMSRB.dbo.MTOH(HIMSRB.dbo.MTOH(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName, [Process Type],
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) /  (SELECT COUNT(DISTINCT(IDWQ1262)) FROM CTELoggerData1262 a1 where a1.[UserName] = a2.[UserName] and a1.[Process Type] =  a2.[Process Type]), 2)
      ELSE 0.00 END SecondsAvg
      FROM CTEMRNDuration1262 a2
      group by UserName, [Process Type]
    ) x
  )
  ,CTE1LoggerData1262
  AS
  (
    SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
    FROM [HIMSRB].[DBO].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[DBO].[WQ1262] W ON L.IDWQ1262 = W.ID
    INNER JOIN [HIMSRB].[DBO].[DataCollection] D ON CAST(W.[Code] as varchar) = CAST(D.IRB as VARCHAR)
    WHERE  L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  ),
  CTE1MRNWiseTime1262
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTE1LoggerData1262
    GROUP BY UserName, MRN, EntryDate
  ),
  CTE1MRNDuration1262
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    HIMSRB.dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
    FROM CTE1MRNWiseTime1262
  ),
  CTE1AverageTotal1262
  AS
  (
    SELECT x.UserName, SecondsAvg,
    HIMSRB.dbo.MTOH(SecondsAvg) [MinutesAvg],
    HIMSRB.dbo.MTOH(HIMSRB.dbo.MTOH(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName,
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1262)) FROM CTE1LoggerData1262 b1 where b1.[UserName] = b2.[UserName]), 2)
      ELSE 0.00 END SecondsAvg
      FROM CTE1MRNDuration1262 b2
      group by UserName
    ) x
  ), CTELoggerData1262_1
  AS
    (
    SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
    FROM [HIMSRB].[DBO].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[DBO].[WQ1262] W ON L.IDWQ1262 = W.ID 
    WHERE L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
  W.[Process Type] = 'RN' and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  )
,
  CTEMRNWiseTime1262_1
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTELoggerData1262_1
    GROUP BY UserName, MRN, EntryDate
  ),
  CTEMRNDuration1262_1
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
    FROM CTEMRNWiseTime1262_1
    where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
  ),
  CTEAverageTotal1262_1
  AS
  (
    SELECT x.UserName, SecondsAvg,
    dbo.MTOH(SecondsAvg) [MinutesAvg],
    dbo.MTOH(dbo.MTOH(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName,
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1262)) FROM CTELoggerData1262_1 c1 where c1.[UserName] = c2.[UserName]), 2)
      ELSE 0.00 END SecondsAvg
      FROM CTEMRNDuration1262_1 c2
      group by UserName
    ) x
  ),
  CTEUserWiseAge
  AS
  (
    SELECT
    ISNULL(SUM(CASE WHEN USERNAME = 'Monika' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Monika],
    ISNULL(SUM(CASE WHEN USERNAME = 'Amy' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Amy],
    ISNULL(SUM(CASE WHEN USERNAME = 'Karen' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Karen],
    ISNULL(SUM(CASE WHEN USERNAME = 'Anna' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna],
    ISNULL(SUM(CASE WHEN USERNAME = 'Julie' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Julie],
    ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
    ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]

    FROM CTEAverageTotal1262_1
  ),

CTELoggerData1262_2
  AS
    (
    SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
    FROM [HIMSRB].[DBO].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[DBO].[WQ1262] W ON L.IDWQ1262 = W.ID 
    WHERE L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
  W.[Process Type] = 'Outpatient' and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  )
,
  CTEMRNWiseTime1262_2
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTELoggerData1262_2
    GROUP BY UserName, MRN, EntryDate
  ),
  CTEMRNDuration1262_2
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
    FROM CTEMRNWiseTime1262_2
    where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
  ),
  CTEAverageTotal1262_2
  AS
  (
    SELECT x.UserName, SecondsAvg,
    dbo.MTOH(SecondsAvg) [MinutesAvg],
    dbo.MTOH(dbo.MTOH(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName,
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1262)) FROM CTELoggerData1262_2 d1 where d1.[UserName] = d2.[UserName]), 2)
      ELSE 0.00 END SecondsAvg
      FROM CTEMRNDuration1262_2 d2
      group by UserName
    ) x
  ),
  CTEUserWiseAge2
  AS
  (
    SELECT
     ISNULL(SUM(CASE WHEN USERNAME = 'Monika' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Monika],
    ISNULL(SUM(CASE WHEN USERNAME = 'Amy' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Amy],
    ISNULL(SUM(CASE WHEN USERNAME = 'Karen' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Karen],
    ISNULL(SUM(CASE WHEN USERNAME = 'Anna' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna],
    ISNULL(SUM(CASE WHEN USERNAME = 'Julie' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Julie],
    ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
    ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]

    FROM CTEAverageTotal1262_2
  ),

CTELoggerData1262_3
  AS
    (
    SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
    FROM [HIMSRB].[DBO].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[DBO].[WQ1262] W ON L.IDWQ1262 = W.ID 
    WHERE L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) 
  and W.[Code] IN (
  SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
  ) and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  ),
  CTEMRNWiseTime1262_3
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTELoggerData1262_3
    GROUP BY UserName, MRN, EntryDate
  ),
  CTEMRNDuration1262_3
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
    dbo.MTOH(DATEDIFF(SECOND, StartTime, EndTime)) DurationMin
    FROM CTEMRNWiseTime1262_3
    where (DATEDIFF(SECOND, StartTime, EndTime)) > 0
  ),
  CTEAverageTotal1262_3
  AS
  (
    SELECT x.UserName, SecondsAvg,
    dbo.MTOH(SecondsAvg) [MinutesAvg],
    dbo.MTOH(dbo.MTOH(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName,
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) / (SELECT COUNT(DISTINCT(IDWQ1262)) FROM CTELoggerData1262_3 e1 where e1.[UserName] = e2.[UserName]), 2)
      ELSE 0.00 END SecondsAvg
      FROM CTEMRNDuration1262_3 e2
      group by UserName
    ) x
  ),
  CTEUserWiseAge3
  AS
  (
    SELECT
     ISNULL(SUM(CASE WHEN USERNAME = 'Monika' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Monika],
    ISNULL(SUM(CASE WHEN USERNAME = 'Amy' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Amy],
    ISNULL(SUM(CASE WHEN USERNAME = 'Karen' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Karen],
    ISNULL(SUM(CASE WHEN USERNAME = 'Anna' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna],
    ISNULL(SUM(CASE WHEN USERNAME = 'Julie' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Julie],
    ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
    ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]

    FROM CTEAverageTotal1262_3
  ),
CTELoggerData1262_4
  AS
    (
   SELECT ROW_NUMBER() OVER (PARTITION BY L.MRN, CONVERT(DATE, L.[DateTime]), L.[STATUS] ORDER BY MRN) Rno
    , L.IDWQ1262Logger, L.IDWQ1262, L.UserName, L.Color, L.MRN, L.[Status], CONVERT(DATE, L.DateTime) EntryDate
    , CASE WHEN L.[Status] = 'Start' THEN DateTime ELSE NULL END StartTime
    , CASE WHEN L.[Status] LIKE '%Finish%' THEN DateTime ELSE NULL END EndTime
    FROM [HIMSRB].[DBO].[WQ1262Logger] L
    INNER JOIN [HIMSRB].[DBO].[WQ1262] W ON L.IDWQ1262 = W.ID 
    WHERE L.UserName IN (SELECT Nickname from JWT WHERE [SubSection] IN ('HB','RBB') and [Nickname] NOT IN ('Adrienne', 'Beth')) and
  W.[UserAssigned] <> W.[User] and
    CONVERT(DATE, L.DateTime) >= @StartDate AND CONVERT(DATE, L.DateTime) <= @EndDate AND
    (L.[Status] LIKE '%Finish%' OR L.[Status] = 'Start')
  ),
  CTEMRNWiseTime1262_4
  AS
  (
    SELECT MAX(Rno) Rno, COUNT(IDWQ1262) Claims, UserName, MRN, EntryDate, MAX(StartTime) StartTime, MAX(EndTime) EndTime
    FROM CTELoggerData1262_4
    GROUP BY UserName, MRN, EntryDate
  ),
  CTEMRNDuration1262_4
  AS
  (
    SELECT UserName, MRN, Claims, EntryDate, StartTime, EndTime, DATEDIFF(SECOND, StartTime, EndTime) DurationSecond,
   [HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime) - 0.8) DurationMin
    FROM CTEMRNWiseTime1262_4
    where[HIMSRB].dbo.STOM(DATEDIFF(SECOND, StartTime, EndTime)) > 0
  ),
  CTEAverageTotal1262_4
  AS
  (
    SELECT x.UserName, SecondsAvg,
   [HIMSRB].dbo.STOM(SecondsAvg) [MinutesAvg],
   [HIMSRB].dbo.STOM(dbo.STOM(SecondsAvg)) [HoursAvg]
    FROM (
      SELECT UserName,
      SUM(ISNULL(DurationSecond, 0)) Seconds, SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) SecondsCnt,
      CASE WHEN SUM(CASE WHEN ISNULL(DurationSecond, 0) > 0 THEN 1 ELSE 0 END) > 0 THEN
      CONVERT(NUMERIC(18, 2), SUM(ISNULL(DurationSecond, 0)) /  (SELECT (CASE WHEN COUNT(DISTINCT(IDWQ1262)) > 0 THEN COUNT(DISTINCT(IDWQ1262))   ELSE 1 END) FROM CTELoggerData1262_4 e1 where e1.[UserName] = e2.[UserName]) , 2)
      ELSE 0.00 END SecondsAvg
      FROM CTEMRNDuration1262_4 e2
      group by UserName
    ) x
  ),
  CTEUserWiseAge4
  AS
  (
    SELECT
    ISNULL(SUM(CASE WHEN USERNAME = 'Monika' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Monika],
    ISNULL(SUM(CASE WHEN USERNAME = 'Amy' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Amy],
    ISNULL(SUM(CASE WHEN USERNAME = 'Karen' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Karen],
    ISNULL(SUM(CASE WHEN USERNAME = 'Anna' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Anna],
    ISNULL(SUM(CASE WHEN USERNAME = 'Julie' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Julie],
    ISNULL(SUM(CASE WHEN USERNAME = 'Heather' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Heather],
    ISNULL(SUM(CASE WHEN USERNAME = 'Bernadette' THEN [MinutesAvg] ELSE 0.00 END), 0.00) [Bernadette]

    FROM CTEAverageTotal1262_4
  ),
  RatioReview
  AS (
   SELECT [Acct ID], [SOC Flag],  [Category], COUNT(*) as Cnt FROM WQ1262  where [Status] = 'Review'
   GROUP BY [Acct ID], [SOC Flag],[Category]
  ),
  RatioReviewTotal
  AS (
   SELECT [Acct ID], [SOC Flag],  [Category], COUNT(*) as Cnt FROM WQ1262  where ([Status] = 'Review' or [ActionTimeStamp] >  @StartDate)
   GROUP BY [Acct ID], [SOC Flag],[Category]
  ),
SummaryCTE
AS (


  SELECT  (
    SELECT COUNT(*) as Outpatient from [HIMSRB].[dbo].[WQ1262] where [Process Type] = 'Outpatient' and [Status] = 'Review'
  ) AS [Outpatient],
  (
    SELECT COUNT(*) as [RN] from [HIMSRB].[dbo].[WQ1262] where [Process Type] = 'RN' and [Status] = 'Review'
  ) AS [RN],
 (
    SELECT COUNT(*) as SOCs from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'SOC' and ([Status] = 'Review' )
  ) AS [SOCs],
  (
    select COUNT(*)
                from WQ1262
                where [Acct ID] in (
                select x.[Acct ID]
                from (
                select [Acct ID], [SOC Flag]
                from WQ1262
                group by [Acct ID], [SOC Flag]
                ) x
                group by x.[Acct ID]
                having COUNT(1) = 1
                )
                and [Soc Flag] = 'SOC' and [Status] = 'Review'
  ) AS [Pure SOCs],
(
    SELECT COUNT(*) as [Study Related] from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'Study-Related' and ([Status] = 'Review' )
  ) AS [Study Related],
  (
    SELECT COUNT(*) as [N/A] from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'N/A' and ([Status] = 'Review')
  ) AS [N/A],
  (
   SELECT  CONVERT(VARCHAR,COALESCE(SUM([Study-Related]),0)) + '/' +CONVERT(VARCHAR,COALESCE(SUM([SOC]),0)) [Ratio]
	FROM [RatioReview]
	PIVOT 
	( 
	SUM(Cnt) FOR [SOC Flag] IN ([Study-Related], [SOC]) 
	) AS PivotTable
  ) as [RatioReview],
  (
   SELECT  CONVERT(VARCHAR,COALESCE(SUM([Study-Related]),0)) + '/' +CONVERT(VARCHAR,COALESCE(SUM([SOC]),0)) [Ratio]
	FROM [RatioReviewTotal]
	PIVOT 
	( 
	SUM(Cnt) FOR [SOC Flag] IN ([Study-Related], [SOC]) 
	) AS PivotTable
  ) as [RatioReviewTotal],
  (
  SELECT Count(*)  AS DoNotScrub  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code] NOT IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
  ) or [Code]  IS NULL) and [Status] = 'Review'
  ) AS DoNotScrubs,
 (
  SELECT Count(*)  AS Scrubs FROM [HIMSRB].[dbo].[WQ1262]  where [Code] IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
  ) and [Status] = 'Review'
  ) AS Scrubs,
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Perm] = 'Perm'
    ) ) and ([Status] = 'Review' )
    ) AS Perms,
	 (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Test] = 'Test'
    ) ) and ([Status] = 'Review')
    ) AS Test,

(
    SELECT COUNT(*) as OutpatientTotal from [HIMSRB].[dbo].[WQ1262] where [Process Type] = 'Outpatient' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [OutpatientTotal],
  (
    SELECT COUNT(*) as RNTotal from [HIMSRB].[dbo].[WQ1262] where [Process Type] = 'RN' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [RNTotal],
(
    SELECT COUNT(*) as SOCs from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'SOC' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [SOCsTotal],
   (
    select COUNT(*)
                from WQ1262
                where [Acct ID] in (
                select x.[Acct ID]
                from (
                select [Acct ID], [SOC Flag]
                from WQ1262
                group by [Acct ID], [SOC Flag]
                ) x
                group by x.[Acct ID]
                having COUNT(1) = 1
                )
                and [Soc Flag] = 'SOC' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [Pure SOCs Total],
(
    SELECT COUNT(*) as [Study Related] from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'Study-Related' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [StudyRelatedTotal],
(
SELECT COUNT(*)  AS Amount FROM (
  SELECT DISTINCT IDWQ1262 FROM CTELoggerData1262_4
  ) as A
  
) as [BP-Total],

(
 SELECT COUNT(*) from WQ1262 WHERE [SOC Flag] = 'N/A' and ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [N/A-15],
(
    SELECT COUNT(*) as [N/A] from [HIMSRB].[dbo].[WQ1262] where [SOC Flag] = 'N/A' and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [N/A-Total],
  (
  SELECT Count(*)  AS ScrubTotal  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code] NOT IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0' 
  ) or [Code] IS NULL) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS ScrubsTotal,
   (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Perm] = 'Perm'
    ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS PermsTotal,
	 (
    SELECT Count(*)  AS ScrubsTotal  FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Test] = 'Test'
    ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate)
    ) AS TestTotal,
 (
  SELECT Count(*)  AS DoNotScrubsTotal FROM [HIMSRB].[dbo].[WQ1262]  where [Code] IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [SCRUB STATUS] = '0'
  ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS [DoNotScrubsTotal], 
  (
    SELECT Count(*)  AS Total FROM [HIMSRB].[dbo].[WQ1262]  where  ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
    ) AS [Total],
	(
 SELECT COUNT(*) from WQ1262 WHERE ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [Accounts-15],
(
 SELECT COUNT(*) from WQ1262 WHERE ( [SOC Flag] = 'SOC' and  Error = '1') and ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [Errors-15],
(
 SELECT COUNT(*) from WQ1262 WHERE  [SOC Flag] = 'SOC' and Error = '0' and ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [No Errors-15],
(
 SELECT COUNT(*) from WQ1262 WHERE [SOC Flag] = 'SOC' and ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [SOC-15],
(
 SELECT COUNT(*) from WQ1262 WHERE [SOC Flag] = 'Study-Related' and ([Status] = 'Review' OR [UploadDateTime] > '2022-08-15'  OR [ActionTimeStamp] > '2022-08-15')
) as [Study-Related-15],
    (
      SELECT  '$ ' +CAST(CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2)) as VARCHAR )  AS AmountTotal FROM [HIMSRB].[dbo].[WQ1262]  where   ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
      ) AS [AmountTotal],
   (
      SELECT  '$ ' +CAST(CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2)) as VARCHAR )  AS AmountTotal FROM [HIMSRB].[dbo].[WQ1262]  where   ([Status] = 'Review' and [Process Type] = 'RN')
      ) AS [Amount-RN],
   (
      SELECT  '$ ' +CAST(CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2)) as VARCHAR )  AS AmountTotal FROM [HIMSRB].[dbo].[WQ1262]  where   ([Status] = 'Review' and [Process Type] = 'Outpatient')
      ) AS [Amount-Outpatient],
  (
SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2)))  AS Amount FROM (
  SELECT DISTINCT IDWQ1262 FROM CTELoggerData1262_4
  ) as A
  Left Join WQ1262 B on A.IDWQ1262 = B.ID
) as [BP-Amount],

(
  SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2))) FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Perm] = 'Perm'
  ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS PermsAmountTotal,
 (
  SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2))) FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
    SELECT
    [value]
        FROM [HIMSRB].[dbo].[Agenda] t1
        CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
        where [No Scrub-Test] = 'Test'
  ) ) and ([Status] = 'Review' or [ActionTimeStamp] > @StartDate) 
  ) AS TestAmountTotal,
  (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2))) FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Perm] = 'Perm'
    ) ) and ([Status] = 'Review' )
    ) AS PermsAmount,
   (
    SELECT '$ '+CONVERT(NVARCHAR(MAX), CAST(ISNULL(SUM([Acct Bal]), 0.00) as decimal(15,2))) FROM [HIMSRB].[dbo].[WQ1262]  where ([Code]  IN (
      SELECT
      [value]
          FROM [HIMSRB].[dbo].[Agenda] t1
          CROSS APPLY STRING_SPLIT(REPLACE(t1.[IRB], ' ', '' ), ',')
          where [No Scrub-Test] = 'Test'
    ) ) and ([Status] = 'Review' )
    ) AS TestAmount,
   
  (
  SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1262] where [Code] IN (
  SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
  ) and [Status] = 'Review'
  ) as DataCollection,
(
  SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1262] where [Code] IN (
  SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
  ) and [Status] = 'Review' and [Process Type] = 'RN'
  ) as [DataCollection-RN],
(
  SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1262] where [Code] IN (
  SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
  ) and [Status] = 'Review' and [Process Type] = 'Outpatient'
  ) as [DataCollection-Outpatient],
 (
  SELECT COUNT(*) FROM [HIMSRB].[dbo].[WQ1262] where [Code] IN (
  SELECT cast(IRB as varchar) from [HIMSRB].[dbo].[DataCollection]
  ) and ([Status] = 'Review' or [ActionTimeStamp] >= @StartDate)
  ) as DataCollectionTotal,
  (
  SELECT  HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
  FROM (
    SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
    CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
    FROM CTEAverageTotal1262
    WHERE [Process Type] = 'Outpatient'
  ) X
  ) as OutpatientSpeed,
(
 SELECT  [HIMSRB].dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.STOM(SecondsAvg),0.00) As NVARCHAR))  [MinuteAvg]
  FROM (
    SELECT  SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
    CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
    FROM CTEAverageTotal1262_4
  
  ) X
) as [BP-Speed],
  (
  SELECT  HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
  FROM (
    SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
    CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
    FROM CTEAverageTotal1262
    WHERE [Process Type] = 'RN'
  ) X
  ) as RNSpeed,
  (
  SELECT HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))  [MinuteAvg]
  FROM (
    SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
    CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
    FROM CTE1AverageTotal1262
  ) X
  ) As DataCollectionSpeed,
  (
  SELECT HIMSRB.dbo.[HMS](CAST(ISNULL(   HIMSRB.dbo.MTOH(SecondsAvg),0.00) as NVARCHAR))
  FROM (
    SELECT SUM(SecondsAvg) TotalSecs, SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE 0 END) SecCount,
    CONVERT(NUMERIC(18, 2), SUM(SecondsAvg) / SUM(CASE WHEN ISNULL(SecondsAvg, 0) > 0 THEN 1 ELSE null END)) SecondsAvg
    FROM CTEAverageTotal1262_1
  ) X
  ) TeamStandardAvg,
  (
  SELECT COUNT(*) from WQ1262  where ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
  ) IncomingWQ,

	(
  SELECT COUNT(*) from WQ1262  where [Code] IS NULL and  ([Status]='Review'  or [ActionTimeStamp]>  @StartDate)	
  ) MissingIRB,

  (
  SELECT HIMSRB.dbo.[HMS]([Amy]) FROM CTEUserWiseAge
  ) [Amy-RN],
  (
  SELECT HIMSRB.dbo.[HMS]([Anna]) FROM CTEUserWiseAge
  ) [Anna-RN],
  (
  SELECT HIMSRB.dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge
  ) [Bernadette-RN],
   (
  SELECT HIMSRB.dbo.[HMS]([Heather]) FROM CTEUserWiseAge
  ) [Heather-RN],
  (
  SELECT HIMSRB.dbo.[HMS]([Julie]) FROM CTEUserWiseAge
  ) [Julie-RN],
   (
  SELECT HIMSRB.dbo.[HMS]([Karen]) FROM CTEUserWiseAge
  ) [Karen-RN],
  (
  SELECT HIMSRB.dbo.[HMS]([Monika]) FROM CTEUserWiseAge
  ) [Monika-RN],
  
  (
  SELECT HIMSRB.dbo.[HMS]([Amy]) FROM CTEUserWiseAge2
  ) [Amy-Outpatient],
  
  (
  SELECT HIMSRB.dbo.[HMS]([Anna]) FROM CTEUserWiseAge2
  ) [Anna-Outpatient],
 
  (
  SELECT HIMSRB.dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge2
  ) [Bernadette-Outpatient],
  (
  SELECT HIMSRB.dbo.[HMS]([Heather]) FROM CTEUserWiseAge2
  ) [Heather-Outpatient],
   (
  SELECT HIMSRB.dbo.[HMS]([Julie]) FROM CTEUserWiseAge2
  ) [Julie-Outpatient],
  (
  SELECT HIMSRB.dbo.[HMS]([Karen]) FROM CTEUserWiseAge2
  ) [Karen-Outpatient],
  (
  SELECT HIMSRB.dbo.[HMS]([Monika]) FROM CTEUserWiseAge2
  ) [Monika-Outpatient],
  (
  SELECT HIMSRB.dbo.[HMS]([Amy]) FROM CTEUserWiseAge3
  ) [Amy-DC],
   (
  SELECT HIMSRB.dbo.[HMS]([Anna]) FROM CTEUserWiseAge3
  ) [Anna-DC],
  
  (
  SELECT HIMSRB.dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge3
  ) [Bernadette-DC],
  (
  SELECT HIMSRB.dbo.[HMS]([Heather]) FROM CTEUserWiseAge3
  ) [Heather-DC],
  
  (
  SELECT HIMSRB.dbo.[HMS]([Julie]) FROM CTEUserWiseAge3
  ) [Julie-DC],
  (
  SELECT HIMSRB.dbo.[HMS]([Karen]) FROM CTEUserWiseAge3
  ) [Karen-DC],
 
(
  SELECT HIMSRB.dbo.[HMS]([Monika]) FROM CTEUserWiseAge3
  ) [Monika-DC],
 (
  SELECT HIMSRB.dbo.[HMS]([Amy]) FROM CTEUserWiseAge4
  ) [Amy-BPS],
  
  (
  SELECT HIMSRB.dbo.[HMS]([Anna]) FROM CTEUserWiseAge4
  ) [Anna-BPS],
  (
  SELECT HIMSRB.dbo.[HMS]([Bernadette]) FROM CTEUserWiseAge4
  ) [Bernadette-BPS],
  (
  SELECT HIMSRB.dbo.[HMS]([Heather]) FROM CTEUserWiseAge4
  ) [Heather-BPS],
  (
  SELECT HIMSRB.dbo.[HMS]([Julie]) FROM CTEUserWiseAge4
  ) [Julie-BPS],
  (
  SELECT HIMSRB.dbo.[HMS]([Karen]) FROM CTEUserWiseAge4
  ) [Karen-BPS],
(
  SELECT HIMSRB.dbo.[HMS]([Monika]) FROM CTEUserWiseAge4
  ) [Monika-BPS]
  
  
  
  
  
)

 select * INTO #Temp1262SumaryCTE from SummaryCTE s


EXEC(N'SELECT ' + @Columns1 + ' into ##Temp1262Assigned FROM #Temp1262Assigned')
EXEC(N'SELECT ' + @Columns2 + ' into ##Temp1262Done FROM #Temp1262Done')
EXEC(N'SELECT ' + @Columns3 + ' into ##temp1262NotScrub FROM #temp1262NotScrub')
EXEC(N'SELECT ' + @Columns4 + ' into ##Temp1262Prod FROM #Temp1262Prod')
EXEC(N'SELECT ' + @Columns5 + ' into ##Temp1262Bp FROM #Temp1262Bp')

   select s.*, t.*, d.*, s1.*,p.*, s2.*,
 (SELECT Cnt FROM #TempCount) MostRecentDoneClaim, @StartDate as [Date]
 from #Temp1262SumaryCTE s
 inner join ##Temp1262Assigned t on 1 =1 
 inner join ##Temp1262Done d on 1 =1 
 inner join ##temp1262NotScrub s1 on 1 =1 
inner join ##Temp1262Prod p on 1 = 1
inner join ##Temp1262BP s2 on 1 = 1


drop table IF EXISTS #Temp1262Assigned
drop table IF EXISTS #Temp1262Done
drop table IF EXISTS #temp1262NotScrub
drop table IF EXISTS #Temp1262Prod
drop table IF EXISTS #Temp1262Bp




drop table IF EXISTS #Temp1262SumaryCTE

drop table IF EXISTS ##Temp1262Assigned
drop table IF EXISTS ##Temp1262Done
drop table IF EXISTS ##temp1262NotScrub
drop table IF EXISTS #TempCount
drop table IF EXISTS ##Temp1262Prod
drop table IF EXISTS ##Temp1262Bp

drop table IF EXISTS #tempusers


END TRY 
BEGIN CATCH 

drop table IF EXISTS #Temp1262Assigned
drop table IF EXISTS #Temp1262Done
drop table IF EXISTS #temp1262NotScrub
drop table IF EXISTS #Temp1262Prod
drop table IF EXISTS #Temp1262Bp
drop table IF EXISTS #Temp1262SumaryCTE

drop table IF EXISTS ##Temp1262Assigned
drop table IF EXISTS ##Temp1262Done
drop table IF EXISTS ##temp1262NotScrub
drop table IF EXISTS #TempCount
drop table IF EXISTS ##Temp1262Prod
drop table IF EXISTS ##Temp1262Bp


drop table IF EXISTS #tempusers
END CATCH
    
  `
  let q = `
  ${query}
  `

  const {recordset: result} = await sql.query(q)
  
  try {
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 




exports.WQ5508FlowchartSpeed = async (req,res) => {

  try {

      var {processType, user , dates} = req.query;
        var query = ''

        if (dates) {
            dates = (JSON.parse(dates).filter((d) => d != ''))
            
        }

        if (dates && dates.length > 0) {
            query =`select * from ${WQ5508FCHModal} where  CAST ([Date] as Date) between FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as datetime),'yyyy-MM-dd')   Order By [Date] DESC `

        } else {
            query = `select * from ${WQ5508FCHModal} where  [Date] > DATEADD(YEAR, -1, [Date]) Order By Date DESC `;
        }
  

        let {recordset: result} = await sql.query(query)
  
       


       result =  (result.map(r => {
          return  {
            'Date': r.Date.toISOString().split('T')[0],
            'value': r[user +'-' + processType]
          }
        }))
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 




exports.WQ1075FlowchartSpeed = async (req,res) => {

  try {

      var {processType, user , dates} = req.query;
        var query = ''

        if (dates) {
            dates = (JSON.parse(dates).filter((d) => d != ''))
            
        }

        if (dates && dates.length > 0) {
            query =`select * from ${WQ1075FCHModal} where  CAST ([Date] as Date) between FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as datetime),'yyyy-MM-dd')   Order By [Date] DESC `

        } else {
            query = `select * from ${WQ1075FCHModal} where  [Date] > DATEADD(YEAR, -1, [Date]) Order By Date DESC `;
        }
  

        let {recordset: result} = await sql.query(query)
  
       


       result =  (result.map(r => {
          return  {
            'Date': r.Date.toISOString().split('T')[0],
            'value': r[user +'-' + processType]
          }
        }))
   
    return res.status(200).json({
      success: true,
      result: result,
      message: "Query Executed successfully!",
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
} 