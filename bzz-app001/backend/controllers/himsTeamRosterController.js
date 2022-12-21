const methods = require("./crudController");
const endpoints = methods.crudController("[COHTEAMS].[dbo].[COH_MasterStaff_PSoft]");
var sql = require('mssql')
const sqlConnection = require('../sql')
const bcrypt = require("bcryptjs");
const { getDateTime } = require("./utilController");


const Model = "[COHTEAMS].[dbo].[COH_MasterStaff_PSoft]";
const Model2 = "[FI_DM_HIMS_ICD].[dbo].[COH_MasterStaff_PSoft]";
const ColumnModel = '[COHTEAMS].[dbo].[HIMS_MasterStaff_PSoft_Columns]'

const Model1 = "JWT"
delete endpoints["update"];
delete endpoints['list'];
delete endpoints['delete'];


const generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};
  

endpoints.delete = async (req, res) => {
    let { id } = req.params;

    try { 
        
      const deleteQuery = `update ${Model} set EMPL_STATUS = 'Archive'  where EMPID= ${id}`;
      const deleteQuery1 = `update ${Model1} set EMPL_STATUS = 'Archive'  where EMPID = ${id}`;
      const deleteQuery2 = `update ${Model}2 set EMPL_STATUS = 'Archive'  where EMPID = ${id}`;
    
      await sql.query(deleteQuery);
      await sql.query(deleteQuery1);

      if(process.env.NODE_ENV != "development") {
        await sqlConnection.query(deleteQuery2);

      }

  
      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });
  
    } catch (e) {
        console.log(e)
      return res
        .status(500)
        .json({ success: false, error: e, message: `Error in deleting the user where id = ${id}`});
    }
};

  
endpoints.list = async (req, res,) => {
  try {

      const ID = req.admin.EMPID;
      const First = req.admin.First;
      var page = req.query.page || 1;
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
          
      let filterQuery = "";
      let sorterQuery = "";

      if(!filter['EMPL_STATUS']) {
        filter['EMPL_STATUS'] = ["A","D","P","L"]
    }


    if(!filter['SA_Section']) {
        filter['SA_Section'] = ["HIMS"]
    }


    
  for (key in filter) {
      if(filter[key]) {

        switch (key) {
              
    
            case "EMPL_STATUS"  :
            case "AdminAccess"  :
            case "ManagementAccess":
            case "FIRST_NAME":
            case "MIDDLE_NAME":
            case "DEPTNAME" :     
            case "Section" :
            case "SA_Section" :
            case "Name_Section" :
            case "EMAIL_ADDR" :
            case "LoginName" : 
            case "LoginName" :
            case "SUPERVISOR_NAME" :
            case "SUPERVISOR_ID" :
            case "DEPTID" :   
            case "JOBCODE" :  
            case "JOBTITLE" : 
            case "AliasEmail" :
            case "Contractor_Name" :
            case "ShowTimeAccountability" :

            {
                let values = filter[key];
                if(values.indexOf('null') > -1) {
                    values.push('')
                    values.splice(values.indexOf(null), 1)
                    valueQuery = values.map(v => ( "'" + v  + "'"))
                    filterQuery +=  filter[key] != null ?  "([" + key + "] IN (" + valueQuery + ") or " : "" ;
                    filterQuery +=  '['+ key + '] IS NULL) and '

                } else {
                    
                    valueQuery = values.map(v => ( "'" + v  + "'"))
                    if(values.length > 0) {
                        filterQuery +=  +filter[key] !== null ?  "["+ key + "] IN (" + valueQuery + ") and " : "" ;
                    }
                }

                break
            }

            

            default: {
                
                filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key] + "%' and " : "" ;
                break
            } 
              }
          } 
      }

      filterQuery = filterQuery.slice(0, -4);
  
      sorter.map((sort) => {
          sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
      })


      let sq = sorterQuery.slice(0, -1)
       
      const limit = parseInt(req.query.items) || 100;
      const skip = page * limit - limit;

      var recordset;
      
          var query = `select  * from ${Model}  `;    
          var totalQuery = `select count(*) from ${Model}  `;    

          if(filterQuery || sorterQuery) {
              if(filterQuery ) {
                  query += " Where" + filterQuery + " "
                  totalQuery += " Where" + filterQuery + " "
              }  
              
              if (sorterQuery) {
                  query += " ORDER BY " + sq +  " "   
              } 

          } else {
              query +="ORDER BY ID ASC OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
          }
          
          const { recordset: result } = await sql.query(query);
          
          recordset = result
          const { recordset: coun } = await sql.query(totalQuery);
          arr = coun
       
      const obj = arr[0];
      var count = obj[""];

      const pages = Math.ceil(count / limit);

      // Getting Pagination Object
      const pagination = { page, pages, count };

      const filters = filter;
      const sorters = sorter
      // Getting Pagination Object

      return res.status(200).json({
          success: true,
          result: recordset,
          pagination,
          filters,
          sorters,
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

endpoints.department = async (req, res,) => {
    try {
  
            var recordset;
        
            var query = `select * from ${Model} `;    
            const { recordset: result } = await sql.query(query);
            
            recordset = result
            
        return res.status(200).json({
            success: true,
            result: recordset,
           
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


endpoints.create = async (req,res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;
        const {EMPID, EMAIL_ADDR} = req.body;

        let {recordsets: record} = await sql.query(`Select * from ${Model} where EMPID = ${EMPID} or EMAIL_ADDR = '${EMAIL_ADDR}'`);

        record = (record[0])

        if(record.length > 0) {
            return res.status(200).json({
                success: false,
                result: {},
                message: "Emp Already Exists ",
              });
        }

       
        if(values['Section'] == 'RB') {
            const jwt = {
                EmpID: values['EMPID'],
                EMPL_STATUS: values['EMPL_STATUS'],
                UID: Math.floor(100000 + Math.random() * 900000),
                First: values['FIRST_NAME'] ,
                Middle: values['MIDDLE_NAME'] ? values['MIDDLE_NAME'] : ""  ,
                Last: values['LAST_NAME'] ,
                LoginName: values['LoginName'] ,
                Email: values['EMAIL_ADDR'],
                StartDay: 'Mon',
                Password: values['Password'] ? generateHash(values['Password']):  record['Password'],
                ManagementAccess: values['ManagementAccess'] ,
                AdminAccess: values['AdminAccess'],
                NAME: values['NAME'],
                DEPTNAME: values['DEPTNAME'],
                Section: values['Section'],
                DEPTID: values['DEPTID'],
                AliasEmail: values['AliasEmail'],
                PER_ORG: values['PER_ORG'],
                LoginName: values['LoginName'],
                SUPERVISOR_NAME: values['SUPERVISOR_NAME'],
                SUPERVISOR_ID: values['SUPERVISOR_ID'],

                CMPNY_SENIORITY_DT: values['CMPNY_SENIORITY_DT'] ? values['CMPNY_SENIORITY_DT'] : "",
                BUSINESS_TITLE: values['BUSINESS_TITLE'],
                EFFDT: values['EFFDT'] ? values['EFFDT'] : "",
                ORIG_HIRE_DT: values['ORIG_HIRE_DT'] ? values['ORIG_HIRE_DT'] : "",
                HIRE_DT: values['HIRE_DT'] ? values['HIRE_DT'] : "",
                TERMINATION_DT: values['TERMINATION_DT'] ? values['TERMINATION_DT'] : "" ,
                JOBCODE: values['JOBCODE'],
                LOCATION: values['LOCATION'],
                ROLE: values['ROLE'],
                JOBTITLE: values['JOBTITLE'],
                WORK_PHONE: values['WORK_PHONE'],
                Contractor_Name: values['Contractor_Name'],
                ShowTimeAccountability: values['ShowTimeAccountability']
            }
    
            const columnsQ1 = "(" + Object.keys(jwt).toString() + ")"
    
            let valuesQuery = "";
            for (key in jwt) {
                if(jwt[key] == 0) {
                    valuesQuery += "'" + jwt[key] + "',";
                } else if ( jwt[key] == "" || jwt[key] == undefined ) {
                valuesQuery += " NULL" + ",";
              } else {
                valuesQuery += "'" + jwt[key] + "',";
              }
            }
            valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
          
            const insertQuery = `insert into ${Model1} ${columnsQ1} values ${valuesQuery}`
    
            await sql.query(insertQuery);
    
        }
        
        const hims = {
            EMPL_STATUS: values['EMPL_STATUS'],
            EMPID: values['EMPID'],
            FIRST_NAME: values['FIRST_NAME'] ,
            UID: Math.floor(100000 + Math.random() * 900000),
            MIDDLE_NAME: values['MIDDLE_NAME'] ? values['MIDDLE_NAME'] : "" ,
            EMAIL_ADDR: values['EMAIL_ADDR'],
            LAST_NAME: values['LAST_NAME'] ,
            AliasEmail: values['AliasEmail'],
            LoginName: values['LoginName'] ,
            ManagementAccess: values['ManagementAccess'],
            AdminAccess: values['AdminAccess'],
            NAME: values['NAME'],
            DEPTNAME: values['DEPTNAME'],
            DEPTID: values['DEPTID'],
            Section: values['Section'],
            PER_ORG: values['PER_ORG'],
            LoginName: values['LoginName'],
            SUPERVISOR_NAME: values['SUPERVISOR_NAME'],
            SUPERVISOR_ID: values['SUPERVISOR_ID'],

            CMPNY_SENIORITY_DT: values['CMPNY_SENIORITY_DT'],
            BUSINESS_TITLE: values['BUSINESS_TITLE'],
            EFFDT: values['EFFDT'] ,
            ORIG_HIRE_DT: values['ORIG_HIRE_DT'] ,
            HIRE_DT: values['HIRE_DT'] ,
            TERMINATION_DT: values['TERMINATION_DT'] ,
            JOBCODE: values['JOBCODE'],
            LOCATION: values['LOCATION'],
            ROLE: values['ROLE'],
            JOBTITLE: values['JOBTITLE'],
            WORK_PHONE: values['WORK_PHONE'],
            Contractor_Name: values['Contractor_Name'],
            ShowTimeAccountability:values['ShowTimeAccountability']
        }

       
        const columnsQ2 = "(" + Object.keys(hims).toString() + ")"

        let valuesQuery2 = "";
        for (key in hims) {

            if(hims[key] == 0) {
                valuesQuery2 += "'" + hims[key] + "',";
            } else if ( hims[key] == "" || hims[key] == undefined ) {
            valuesQuery2 += " NULL" + ",";
          } else {
            valuesQuery2 += "'" + hims[key] + "',";
          }
        
        }
        valuesQuery2 = "(" + valuesQuery2.slice(0, -1) + ")";
      
        const insertQuery2 = `insert into ${Model} ${columnsQ2} values ${valuesQuery2}`
        await sql.query(insertQuery2);

        if(process.env.NODE_ENV !="development") {
            const insertQuery3 = `insert into ${Model2} ${columnsQ2} values ${valuesQuery2}`
            await sqlConnection.query(insertQuery3);
        }
      

        return res.status(200).json({
          success: true,
          result: {},
          message: "Memeber Add Successfully!"
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



  endpoints.update = async (req,res) => {
        try {
            // Find document by id and updates with the required fields
            const values = req.body;
            const {EMPID, EMAIL_ADDR} = req.body;
            const id = req['params']['id'];// please do not update this line
            let valuesQuery = "";
            
            let {recordsets: record} = await sql.query(`Select * from ${Model1} where EMPID = ${id}`);

            record = (record[0][0])



            if(values['Section'] == 'RB') {

                const jwt = {
                    EMPID: values['EMPID'],
                    Email: values['EMAIL_ADDR'],
                    EMPL_STATUS: values['EMPL_STATUS'],
                    First: values['FIRST_NAME'] ,
                    Middle: values['MIDDLE_NAME'] ? values['MIDDLE_NAME'] : "" ,
                    Last: values['LAST_NAME'] ,
                    LoginName: values['LoginName'] ,
                    AliasEmail: values['AliasEmail'],
                    Password: values['Password'] ? generateHash(values['Password']):  record['Password'],
                    ManagementAccess: values['ManagementAccess'] ,
                    AdminAccess: values['AdminAccess']  ,
                    NAME: values['NAME'],
                    DEPTNAME: values['DEPTNAME'],
                    Section: values['Section'],
                    PER_ORG: values['PER_ORG'],
                    LoginName: values['LoginName'],
                    SUPERVISOR_NAME: values['SUPERVISOR_NAME'],
                    SUPERVISOR_ID: values['SUPERVISOR_ID'],

                    CMPNY_SENIORITY_DT: values['CMPNY_SENIORITY_DT'] ? values['CMPNY_SENIORITY_DT'] : null,
                    BUSINESS_TITLE: values['BUSINESS_TITLE'],
                    EFFDT: values['EFFDT'] ? values['EFFDT'] : null,
                    ORIG_HIRE_DT: values['ORIG_HIRE_DT'],
                    HIRE_DT: values['HIRE_DT'] ? values['HIRE_DT'] : null ,
                    TERMINATION_DT: values['TERMINATION_DT'] ? values['TERMINATION_DT'] : null,
                    JOBCODE: values['JOBCODE'],
                    LOCATION: values['LOCATION'],
                    ROLE: values['ROLE'],
                    JOBTITLE: values['JOBTITLE'],
                    WORK_PHONE: values['WORK_PHONE'],
                    Contractor_Name: values['Contractor_Name'],
                    ShowTimeAccountability:values['ShowTimeAccountability']
                }



            for (key in jwt) {
                
              
                
                if(jwt[key]) {
                    valuesQuery += key + "='" + jwt[key] + "',";
                } else if (jwt[key] == 0) {
                    valuesQuery += key + "='" + jwt[key] + "',";
                  } else { 
                       valuesQuery += key + "= NULL ,";
                    }
            }
  
            valuesQuery = valuesQuery.slice(0, -1);

            await sql.query(`update ${Model1} set ${valuesQuery} where EMPID = ${id}`);
            }
            const hims = {
                EMPID: values['EMPID'],
                EMAIL_ADDR: values['EMAIL_ADDR'],
                EMPL_STATUS: values['EMPL_STATUS'],
                FIRST_NAME: values['FIRST_NAME'] ,
                MIDDLE_NAME: values['MIDDLE_NAME']  ? values['MIDDLE_NAME']  : "",
                LAST_NAME: values['LAST_NAME'] ,
                LoginName: values['LoginName'] ,
                ManagementAccess: values['ManagementAccess'],
                AdminAccess: values['AdminAccess'] ,
                NAME: values['NAME'],
                DEPTNAME: values['DEPTNAME'],
                Section: values['Section'],
                PER_ORG: values['PER_ORG'],
                AliasEmail: values['AliasEmail'],
                LoginName: values['LoginName'],
                SUPERVISOR_NAME: values['SUPERVISOR_NAME'],
                SUPERVISOR_ID: values['SUPERVISOR_ID'],

                CMPNY_SENIORITY_DT: values['CMPNY_SENIORITY_DT'] ? values['CMPNY_SENIORITY_DT'] : null,
                BUSINESS_TITLE: values['BUSINESS_TITLE'] ? values['BUSINESS_TITLE'] : null,
                EFFDT: values['EFFDT'] ? values['EFFDT'] : null ,
                ORIG_HIRE_DT: values['ORIG_HIRE_DT'] ?  values['ORIG_HIRE_DT'] : null ,
                HIRE_DT: values['HIRE_DT']  ?  values['HIRE_DT']  : null,
                TERMINATION_DT: values['TERMINATION_DT'] ? values['TERMINATION_DT']  : null  ,
                JOBCODE: values['JOBCODE'],
                LOCATION: values['LOCATION'],
                ROLE: values['ROLE'],
                JOBTITLE: values['JOBTITLE'],
                WORK_PHONE: values['WORK_PHONE'],
                Contractor_Name: values['Contractor_Name'],
                ShowTimeAccountability:values['ShowTimeAccountability']
            }

            let valueQuery1 = "";
            for (key in hims) {
             
                if(hims[key]) {
                    valueQuery1 += key + "='" + hims[key] + "',";
                } else if (hims[key] == 0) {
                    valueQuery1 += key + "='" + hims[key] + "',";
                } else { 
                    valueQuery1 += key + "= NULL ,";
                }
            }
  
            valueQuery1 = valueQuery1.slice(0, -1);
            await sql.query(`update ${Model} set ${valueQuery1} where EMPID = ${id}`);
            if(process.env.NODE_ENV != "development") {
                await sqlConnection.query(`update ${Model} set ${valueQuery1} where EMPID = ${id}`);
            }

        
            return res.status(200).json({
              success: true,
              result: {},
              message: "we update this document by this id: " + id,
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



  endpoints.contactor = async (req, res,) => {
    try {
  
            var recordset;
        

            const [{recordset: contractor}, {recordset: supervisorName}, {recordset: jobTitle},  {recordset: jobCode}] = await Promise.all([
                await sql.query(`select DIstinct([Contractor_Name]) , SUPERVISOR_NAME, JOBTITLE, JOBCODE, EMPID  from ${Model} where PER_ORG = 'CWR' and EMPL_STATUS NOT IN ('T', 'Archive') `),
                await sql.query(`select Distinct([SUPERVISOR_NAME]), SUPERVISOR_ID from ${Model} where EMPL_STATUS NOT IN ('T', 'Archive')  `),
                await sql.query(`select Distinct([JOBTITLE]), EMPID from ${Model}  where EMPL_STATUS NOT IN ('T', 'Archive')`),
                await sql.query(`select Distinct([JOBCODE]), EMPID from ${Model} where EMPL_STATUS NOT IN ('T', 'Archive') `),

            ])


            recordset = {
                contractor,
                supervisorName,
                jobTitle,
                jobCode
            }
            
        return res.status(200).json({
            success: true,
            result: recordset,
           
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

endpoints.columns = async (req,res) => {
    try {

       
        const {id} = req.query
       
        let {recordset: columns} = await sql.query(
          `
          SELECT * from ${ColumnModel} where EMPID = ${id}
          `
      );
  
  
        return res.status(200).json({
          success: true,
          result: columns,
          message: "Successfully found all documents",
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          result: [],
          message: "Oops there is error",
          error: err,
        });
      }
}

endpoints.createC = async (req, res) => {
    try {
        const values = req.body;
       values.EMPID = req.admin.EMPID
            const {recordset: exists } = await sql.query(`SELECT * from ${ColumnModel} where EMP = '${values.EMPID}'`)

            if (exists.length > 0) {

              // values.EMPID = +req.admin.EMPID;
              const { id } = req.params;
              let valuesQuery = "";
              for (key in values) {
          
                if (values[key] == 0) {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
          
                } else if (  values[key] == null || values[key] == "null" || values[key] == "") {
                  valuesQuery += "[" + key + "]= NULL" + ",";
                } else {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
                }
              }
          
              valuesQuery = valuesQuery.slice(0, -1);
            
              let updateQ = `update T1  set ${valuesQuery}from ${ColumnModel} T1 where EMP = ${values.EMPID}`
              await sql.query(updateQ);
          
              return res.status(200).json({
                success: true,
                result: {},
                message: "we update this document by this id: " + req.params.id,
              });
            } else {
                const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


                let valuesQuery = "";
                for (key in values) {
                      if (values[key] === "null") {
                          valuesQuery += "NULL" + ",";
                      } else {
                          valuesQuery += "'" + values[key] + "',";
                      }
                  }
                valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
              
                const insertQuery = `insert into ${ColumnModel} ${columnsQ} values ${valuesQuery}`
            
                await sql.query(insertQuery);
            
                return res.status(200).json({
                    success: true,
                    result: {},
                    message: "we added document" ,
                  });
               
            }
    } catch (err) {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Oops there is an Error",
            error: err,
        });
    }
};


  module.exports = endpoints;
  

