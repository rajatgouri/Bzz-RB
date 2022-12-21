const bcrypt = require("bcryptjs");
var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("JWT");
const cron  = require('node-cron')

delete endpoints["list"];
delete endpoints["update"];
const Model = "JWT";

const TeamMembersModel = "[COHTEAMS].[dbo].[COH_MasterStaff_PSoft]";

const progressModel1 = "WQ1075Progress";
const checkMarkModel1 = "WQ5508Checkmark";

const progressModel2 = "WQ5508Progress";
const checkMarkModel2 = "WQ1075Checkmark";


const progressModel3 = "WQ1262Progress";
const checkMarkModel3 = "WQ1262Checkmark";



const adminData = require('../data/admins.json')


// generating a hash
const generateHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

const sync = async () => {
  const {recordset: users} = await sql.query(`

SELECT * , B.[value] as SubSection_A   FROM (
  SELECT * FROM ${TeamMembersModel} t1
  CROSS APPLY STRING_SPLIT(REPLACE(t1.[Access], ' ', '' ), ',') 
  where [value] IN ('RB')
  ) as A
  CROSS APPLY STRING_SPLIT(REPLACE(A.[SubSection], ' ', '' ), ',') as B
  where B.[value] In ('PB','HB', 'RBB') or (FIRST_NAME IN ('Mary','Adrienne') and A.[Section] = 'AD')
  
  `)  
  for(let i = 0; i< users.length ; i++) {
    const {recordset: user} = await sql.query(`select * from ${Model} where EmpID = ${users[i].EMPID}`)
    
    
  const {recordset: admin} = await sql.query(`select * from ${Model} where Email = 'admin@coh.org' and First = 'Admin'`)

  

      
  const {recordset: Bernadette} = await sql.query(`select * from ${Model} where Email = 'bernadette@demo.com' `)

  if(Bernadette.length ==  0) {
    users.push(adminData[1])
  }

  if(users[i].EMAIL_ADDR == 'amlam@coh.org' ||  users[i].EMAIL_ADDR == 'bernadette@demo.com') {
    users[i]['SA_ManagementAccess'] = '1'
  }

  if(admin.length ==  0) {
    users.push(adminData[0])
  }


    if(user.length == 0) {

      if(users[i].EMPL_STATUS == 'T' || users[i].EMPL_STATUS == 'Archive') {
        continue
      }

       await sql.query(`Insert into ${Model} (
                        UID, 
                        EMPL_Status, 
                        EMPID, 
                        NAME, 
                        First, 
                        Last,
                        Middle, 
                        DEPTNAME, 
                        Section, 
                        SA_Section,
                        SubSection,
                        Name_Section_Old, 
                        PER_ORG, 
                        LoginName, 
                        SUPERVISOR_NAME, 
                        CMPNY_SENIORITY_DT, 
                        BUSINESS_TITLE, 
                        EFFDT, 
                        ORIG_HIRE_DT, 
                        HIRE_DT, 
                        TERMINATION_DT, 
                        SUPERVISOR_ID, 
                        DEPTID, 
                        JOBCODE, 
                        LOCATION, 
                        ROLE, 
                        JOBTITLE, 
                        WORK_PHONE, 
                        AdminAccess,
                        ManagementAccess,
                        AliasEmail, 
                        Contractor_Name,
                        ShowTimeAccountability, 
                        Email, 
                        Password, 
                        StartDay,
                        Nickname,
                        [SA_ManagementAccess]
                        ) 
                        values (
                          ${users[i].UID}, 
                          ${users[i].EMPL_STATUS ? `'${users[i].EMPL_STATUS}'`  :null},
                          ${users[i].EMPID? `'${users[i].EMPID}'` : null}, 
                          ${users[i].NAME ? `'${users[i].NAME}'` : null}, 
                          ${users[i].FIRST_NAME ? `'${users[i].FIRST_NAME}'`: null }, 
                          ${users[i].LAST_NAME ? `'${users[i].LAST_NAME}'` :null}, 
                          ${users[i].MIDDLE_NAME ? `'${users[i].MIDDLE_NAME}'` : null}, 
                          ${users[i].DEPTNAME?  `'${users[i].DEPTNAME}'`: null},
                          ${users[i].Section?  `'${users[i].Section}'` : `'RB'`},
                          ${users[i].Section?  `'${users[i].Section}'` : `'PB'`},
                          ${ (users[i].SubSection_A ? `'${users[i].SubSection_A}'` : `'PB'`)},
                          ${users[i].Name_Section_Old ? `'${users[i].Name_Section_Old}'` : null},
                          ${users[i].PER_ORG ? `'${users[i].PER_ORG}'`: null},
                          ${users[i].LoginName ? `'${users[i].LoginName}'` : null},
                          ${users[i].SUPERVISOR_NAME ? `'${users[i].SUPERVISOR_NAME}'` : null},
                          ${users[i].CMPNY_SENIORITY_DT ? `'${new Date(users[i].CMPNY_SENIORITY_DT).toISOString() }'` : null },
                          ${users[i].BUSINESS_TITLE ? `'${users[i].BUSINESS_TITLE}'` : null},
                          ${users[i].EFFDT ? `'${new Date(users[i].EFFDT).toISOString()}'` : null},
                          ${users[i].ORIG_HIRE_DT ? `'${new Date(users[i].ORIG_HIRE_DT ).toISOString()}'`: null },
                          ${users[i].HIRE_DT ? `'${new Date(users[i].HIRE_DT).toISOString()}'`  :null},
                          ${users[i].TERMINATION_DT ? `'${new Date(users[i].TERMINATION_DT).toISOString()}'` : null },
                          ${users[i].SUPERVISOR_ID ? `'${users[i].SUPERVISOR_ID}'` :  null},
                          ${users[i].DEPTID ? `'${users[i].DEPTID}'` :null},
                          ${users[i].JOBCODE ?  `'${users[i].JOBCODE }'`: null},
                          ${users[i].LOCATION ? `'${users[i].LOCATION}'` : null},
                          ${users[i].ROLE ? `'${users[i].ROLE}'`: null},
                          ${users[i].JOBTITLE ? ` '${users[i].JOBTITLE}'` : null},
                          ${users[i].WORK_PHONE ? `'${users[i].WORK_PHONE}'` : null },
                          ${users[i].AdminAccess ? `'${users[i].AdminAccess}'` : null },
                          ${users[i].ManagementAccess ? `'${users[i].ManagementAccess}'` : null },
                          ${users[i].AliasEmail ? `'${users[i].AliasEmail}'`: null},
                          ${users[i].Contractor_Name ? `'${users[i].Contractor_Name}'` : null },
                          ${users[i].ShowTimeAccountability ? `'${users[i].ShowTimeAccountability}'` : null},
                          ${users[i].EMAIL_ADDR ? `'${users[i].EMAIL_ADDR}'` : null},
                          '${users[i].ManagementCard == '0' || !users[i].ManagementCard  ?  generateHash( '123456') : generateHash( '654321') }',
                          'Mon',
                          ${users[i].FIRST_NAME ? `'${users[i].FIRST_NAME}'`: null },
                          ${users[i].SA_ManagementAccess ? `'${users[i].SA_ManagementAccess}'`: null }
                          
                          )
                    `)

                    if (users[i].SubSection_A == 'HB' || users[i].SubSection_A == 'RBB' ) {
                      await sql.query(`insert into ${progressModel3} (EMPID, First, Last, ChargesProcessed, ChargesToReview, AgingDays, Amount) values (${users[i].EMPID}, '${users[i].FIRST_NAME }', '${users[i].LAST_NAME}', 0, 0, NULL , NULL) `)
                      await sql.query(`insert into ${checkMarkModel3} (EMPID) values (${users[i].EMPID})`) 
                    }


                    if (users[i].SubSection_A == 'PB' || users[i].SubSection_A == 'RBB' ) {
                      await sql.query(`insert into ${progressModel1} (EMPID, First, Last, ChargesProcessed, ChargesToReview, AgingDays, Amount) values (${users[i].EMPID}, '${users[i].FIRST_NAME }', '${users[i].LAST_NAME}', 0, 0, NULL , NULL) `)
                      await sql.query(`insert into ${checkMarkModel1} (EMPID) values (${users[i].EMPID})`) 
                      await sql.query(`insert into ${progressModel2} (EMPID, First, Last, ChargesProcessed, ChargesToReview, AgingDays, Amount) values (${users[i].EMPID}, '${users[i].FIRST_NAME }', '${users[i].LAST_NAME}', 0, 0, NULL , NULL) `)
                      await sql.query(`insert into ${checkMarkModel2} (EMPID) values (${users[i].EMPID})`) 
                    }
                
    } 
    else {

      await sql.query(`update ${Model} set 
          EMPL_STATUS= ${users[i].EMPL_STATUS ? `'${users[i].EMPL_STATUS}'`  :null},
          NAME= ${users[i].NAME ? `'${users[i].NAME}'` : null},
          First = ${users[i].FIRST_NAME ? `'${users[i].FIRST_NAME}'`: null }, 
          Middle = ${users[i].MIDDLE_NAME ? `'${users[i].MIDDLE_NAME}'` : null}, 
          Last = ${users[i].LAST_NAME ? `'${users[i].LAST_NAME}'` :null}, 
          DEPTNAME = ${users[i].DEPTNAME?  `'${users[i].DEPTNAME}'`: null},
          Email = '${users[i].EMAIL_ADDR}',
          Section= ${users[i].Section?  `'${users[i].Section}'` : null},
          Name_Section_Old = ${users[i].Name_Section_Old ? `'${users[i].Name_Section_Old}'` : null},
          PER_ORG = ${users[i].PER_ORG ? `'${users[i].PER_ORG}'`: null},
          LoginName = ${users[i].LoginName ? `'${users[i].LoginName}'` : null},
          SUPERVISOR_NAME = ${users[i].SUPERVISOR_NAME ? `'${users[i].SUPERVISOR_NAME}'` : null},
          CMPNY_SENIORITY_DT = ${users[i].CMPNY_SENIORITY_DT ? `'${new Date(users[i].CMPNY_SENIORITY_DT).toISOString() }'` : null },
          BUSINESS_TITLE= ${users[i].BUSINESS_TITLE ? `'${users[i].BUSINESS_TITLE}'` : null},
          EFFDT = ${users[i].EFFDT ? `'${new Date(users[i].EFFDT).toISOString()}'` : null},
          ORIG_HIRE_DT = ${users[i].ORIG_HIRE_DT ? `'${new Date(users[i].ORIG_HIRE_DT ).toISOString()}'`: null },
          HIRE_DT = ${users[i].HIRE_DT ? `'${new Date(users[i].HIRE_DT).toISOString()}'`  :null},
          TERMINATION_DT = ${users[i].TERMINATION_DT ? `'${new Date(users[i].TERMINATION_DT).toISOString()}'` : null },
          SUPERVISOR_ID = ${users[i].SUPERVISOR_ID ? `'${users[i].SUPERVISOR_ID}'` :  null},
          DEPTID = ${users[i].DEPTID ? `'${users[i].DEPTID}'` :null},
          JOBCODE = ${users[i].JOBCODE ?  `'${users[i].JOBCODE }'`: null},
          LOCATION = ${users[i].LOCATION ? `'${users[i].LOCATION}'` : null},
          ROLE = ${users[i].ROLE ? `'${users[i].ROLE}'`: null},
          JOBTITLE = ${users[i].JOBTITLE ? ` '${users[i].JOBTITLE}'` : null},
          WORK_PHONE = ${users[i].WORK_PHONE ? `'${users[i].WORK_PHONE}'` : null },
          AdminAccess = ${users[i].AdminAccess ? `'${users[i].AdminAccess}'` : null },
          ManagementAccess = ${users[i].ManagementAccess ? `'${users[i].ManagementAccess}'` : null },
          AliasEmail = ${users[i].AliasEmail ? `'${users[i].AliasEmail}'`: null},
          Contractor_Name = ${users[i].Contractor_Name ? `'${users[i].Contractor_Name}'` : null },
          ShowTimeAccountability = ${users[i].ShowTimeAccountability ? `'${users[i].ShowTimeAccountability}'` : null} where EmpID = '${users[i].EMPID}' `)
    }

    
    await sql.query(`DELETE FROM JWT where [EMPL_STATUS] IN ('T','Archive') `)

    } 
}


exports.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    const { id } = req.params;

    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null" || values[key] === null || values[key] === "") {
        valuesQuery += "[" + key + "]= NULL" + ",";
      } else {
        valuesQuery += "[" + key + "]='" + values[key] + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);

    await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${id}`);

    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this id: " + req.params.id,
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

cron.schedule('0 10 * * * *', async () => {
  sync()
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});


cron.schedule('0 20 * * * *', async () => {
  sync()
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});



cron.schedule('0 30 * * * *', async () => {
  sync()
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});



cron.schedule('0 40 * * * *', async () => {
  sync()
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});


cron.schedule('0 50 * * * *', async () => {
  sync()
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});



setTimeout(async () => {
  sync()
}, 30000)




