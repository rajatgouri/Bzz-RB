const methods = require("./crudController");
const endpoints = methods.crudController("WQ1135");
const utilController = require('./utilController')
var sql = require("mssql");

delete endpoints["update"];
delete endpoints['list'];


let equalizer = (result) => {


  let data = [] // finalData
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
            if(items.length ==0) {
              break
            }

            var closest = items.reduce(function(prev, curr) {
              return (Math.abs(curr - goal) > Math.abs(prev - goal) ? curr : prev);
            });

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

endpoints.create = async (req, res) => {
  try {

    let { Distributions, Model, values } = (req.body)

    let valuesQuery = "";
    delete values['distributions']


    let values1 = {}

    // if (Model == 'wq5508') {
      values1 = {
        User: 'null',
        UserAssigned: values.UserAssigned,
        'Process Type': values['Process Type'],
        'Status': values['Status'],
        'Sess Amount': values['Sess Amount'],
        'Patient': values['Patient'],
        'Acct Name': values['Acct Name']
      }

      if (values['Gov Cov Flag']) {
        values1['Gov Cov Flag'] = values['Gov Cov Flag']
      }

 


    for (key in values1) {
      if (values1[key] == null) {
        valuesQuery += "";
      } else if (key == "Status") {
        let values = values1[key];

        if (values.indexOf('Review') > -1) {
          values.push('')
          vQ = values.map(v => ("'" + v + "'"))
          valuesQuery += values1[key] !== null ? "(" + key + " IN (" + vQ + ") or " : "";
          valuesQuery += 'Status IS NULL) and '

        } else {

          vQ = values.map(v => ("'" + v + "'"))
          if (values.length > 0) {
            valuesQuery += values1[key] !== null ? key + " IN (" + vQ + ") and " : "";
          }
        }

      } else if (key == "Process Type" && values1[key].length > 0) {

        valuesQuery += ` [${[key]}] IN  (${values1[key].map((m) => "'" + m + "'")})   and `;
      }

      else if (key == "Sess Amount") {

        let values = values1[key];

        if (values.split('-')[0] != "undefined" && values.split('-')[1] != "undefined") {
          valuesQuery += ` [Sess Amount] Between ${values.split('-')[0]} and ${values.split('-')[1]}    and `;
        }

      }
      else if (key == "Patient") {

        let values = values1[key];

        if (values.split('-')[0] != "undefined" && values.split('-')[1] != "undefined") {
          valuesQuery += `LOWER(LEFT(Patient, 1)) between '${values.split('-')[0].toLowerCase()}' and '${values.split('-')[1].toLowerCase()}' and `
        }

      }
      else if (key == "Acct Name") {

        let values = values1[key];

        if (values.split('-')[0] != "undefined" && values.split('-')[1] != "undefined") {
          valuesQuery += `LOWER(LEFT([Acct Name], 1)) between '${values.split('-')[0].toLowerCase()}' and '${values.split('-')[1].toLowerCase()}' and `
        }

      }
      else if ([key] == "Gov Cov Flag") {

        let values = values1[key];

        if (values.indexOf('') > -1) {
          vQ = values.map(v => ("'" + v + "'"))
          valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
          valuesQuery += `[${key}] IS NULL) and `

        } else {

          vQ = values.map(v => ("'" + v + "'"))
          if (values.length > 0) {
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ")) and " : "";
          }
        }

      } else if ([key] == "UserAssigned") {

        let values = values1[key];


        if (typeof values1[key] != 'string') {
          if (values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ("'" + v + "'"))
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
            valuesQuery += `[${key}] IS NULL) and `

          } else {
            vQ = values.map(v => ("'" + v + "'"))
            if (values.length > 0) {
              valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ")) and " : "";
            }
          }
        } else {

          let values = [values1[key]];
          vQ = values.map(v => ("'" + v + "'"))
          
          if (values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ("'" + v + "'"))
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
            valuesQuery += `[${key}] IS NULL) and `

          } else {
            vQ = values.map(v => ("'" + v + "'"))
            if (values.length > 0) {
              valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ")) and " : "";
            }
          }
        }

      } else if (values1[key] == "null") {
        valuesQuery += ` [${[key]}] IS NULL  and `;
      }
      else {
        valuesQuery += "[" + key + "] ='" + values1[key] + "' and ";
      }
    }


    valuesQuery = valuesQuery.slice(0, -4)
    var query = ''

    if (Model == 'WQ1262') {
       query = `select * from ${Model} where ${valuesQuery} Order By [Patient MRN] ASC`;
    } else  {
      query  = `
            
      SELECT * FROM ${Model} as A  left JOIN 
      (
      SELECT [Patient MRN] as PM ,count(*) as count from ${Model}  group by [Patient MRN] 
      ) as B
      on A.[Patient MRN] = B.[PM]
      where ${valuesQuery}
      order by [Count] desc
      `
    }
    let { recordset: result } = await sql.query(query)


    if (Distributions > 1) {
      
      if (result.length == 0) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Record",
        });

      }

      if (result.length < +Distributions) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Distribution",
        });

      }

      

      let splitResult = (splitArray(result, Distributions))


      let counter = 0
      let promise = new Promise((resolve, reject) => {
        for (let i = 0; i < splitResult.length - 1; i++) {

          splitResult[i + 1].map((r, index) => {
            if (splitResult[i].findIndex(item => item['Patient MRN'] == r['Patient MRN']) > -1) {
              splitResult[i].push(r)
              splitResult[i + 1] = splitResult[i + 1].filter(item => item != r)
            }

            counter = counter + 1
            if (counter == splitResult.length) {
              resolve(true)
            }
          })
        }
      })


      await promise

      
      let response = await equalizer(splitResult)


      return res.status(200).json({
        success: true,
        result:response,
        message: "Success",
      });

    } else {

      let { recordsets: result } = await sql.query(`select * from ${Model} where ${valuesQuery} Order By [Patient MRN] ASC`)


      if (result[0].length == 0) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Record",
        });

      }

      if (result[0].length < +Distributions) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Distribution",
        });

      }


      return res.status(200).json({
        success: true,
        result: result,
        message: "Success",
      });
    }


  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
};


endpoints.assign = async (req, res) => {
  try {

    let { Obj, filter, Model } = (req.body)


    let counter = 0

    let values1 = {}

    // if (Model == 'wq5508') {
      values1 = {
        User: "null",
        UserAssigned: filter.UserAssigned,
        'Process Type': filter['Process Type'],
        'Status': filter['Status'],
        'Sess Amount': filter['Sess Amount'],
        'Acct Name': filter['Acct Name'],
        'Patient': filter['Patient']
      }

      if (filter['Gov Cov Flag']) {
        values1['Gov Cov Flag'] = filter['Gov Cov Flag']
      }

    // } else {
    //   values1 = {
    //     User: filter.UserLogged,
    //     UserAssigned: filter.UserAssigned,
    //     'Process Type': filter['Process Type'],
    //     'Sess Amount': filter['Sess Amount'],
    //     'Status': filter['Status']
    //   }
    // }


    let valuesQuery = ""

    for (key in values1) {  
      if (values1[key] == null) {
        valuesQuery += "";
      } else if (key == "Status") {
        let values = values1[key];

        if (values.indexOf('Review') > -1) {
          values.push('')
          vQ = values.map(v => ("'" + v + "'"))
          valuesQuery += values1[key] !== null ? "(" + key + " IN (" + vQ + ") or " : "";
          valuesQuery += 'Status IS NULL) and '

        } else {

          vQ = values.map(v => ("'" + v + "'"))
          if (values.length > 0) {
            valuesQuery += values1[key] !== null ? key + " IN (" + vQ + ") and " : "";
          }
        }

      } else if (key == "Process Type" && values1[key].length > 0) {

        valuesQuery += ` [${[key]}] IN  (${values1[key].map((m) => "'" + m + "'")})   and `;
      }
      else if ([key] == "Gov Cov Flag") {

        let values = values1[key];

        if (values.indexOf('') > -1) {
          vQ = values.map(v => ("'" + v + "'"))
          valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
          valuesQuery += `[${key}] IS NULL) and `

        } else {

          vQ = values.map(v => ("'" + v + "'"))
          if (values.length > 0) {
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + "))  and " : "";
          }
        }

      }
      else if (key == "Patient") {

        let values = values1[key];

        if (values.split('-')[0] != "undefined" && values.split('-')[1] != "undefined") {
          valuesQuery += `LOWER(LEFT(Patient, 1)) between '${values.split('-')[0].toLowerCase()}' and '${values.split('-')[1].toLowerCase()}' and `
        }

      }
      else if (key == "Acct Name") {

        let values = values1[key];

        if (values.split('-')[0] != "undefined" && values.split('-')[1] != "undefined") {
          valuesQuery += `LOWER(LEFT([Acct Name], 1)) between '${values.split('-')[0].toLowerCase()}' and '${values.split('-')[1].toLowerCase()}' and `
        }

      }
      else if (key == "Sess Amount") {

        let values = values1[key];


        if (values.split('-')[0] != "undefined" && values.split('-')[0] != "undefined") {
          valuesQuery += ` [Sess Amount] Between ${values.split('-')[0]} and ${values.split('-')[1]}    and `;
        }

      }
      else if ([key] == "UserAssigned") {

        let values = values1[key];
        if (typeof values1[key] != 'string') {
          if (values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ("'" + v + "'"))
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
            valuesQuery += `[${key}] IS NULL) and `

          } else {
            vQ = values.map(v => ("'" + v + "'"))
            if (values.length > 0) {
              valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ")) and " : "";
            }
          }
        } else {

          let values = [values1[key]];
          vQ = values.map(v => ("'" + v + "'"))
          
          if (values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ("'" + v + "'"))
            valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ") or " : "";
            valuesQuery += `[${key}] IS NULL) and `

          } else {
            vQ = values.map(v => ("'" + v + "'"))
            if (values.length > 0) {
              valuesQuery += values1[key] !== null ? "([" + key + "] IN (" + vQ + ")) and " : "";
            }
          }
        }
      }
      else if (values1[key] == "null") {
        valuesQuery += ` [${[key]}] IS NULL  and `;
      }
      else {
        valuesQuery += "[" + key + "] ='" + values1[key] + "' and ";
      }
    }


    let promise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < Obj.length; i++) {
        let updateQuery = `update ${Model} set [UserAssigned] = '${Obj[i]['UserAssigned']}' where  ${valuesQuery}  [Patient MRN] IN (${Obj[i]['Patient MRN'].map(h => "'" + h + "'")})  `
        await sql.query(updateQuery)
        counter = counter + 1
        if (counter == Obj.length) {
          resolve(true)
        }
      }
    })


    await promise

    return res.status(200).json({
      success: true,
      result: [],
      message: "Success",
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
};

module.exports = endpoints;


