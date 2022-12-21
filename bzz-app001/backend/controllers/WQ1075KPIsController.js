const methods = require("./crudController");
const endpoints = methods.crudController("Answers_Historical");
var sql = require("mssql");

delete endpoints["list"];
const Model = "Answers_Historical";

endpoints.list = async (req, res) => {
    try {

        const {value} = req.query
      const query = `SELECT * FROM ${Model}   Order By [Review Date] desc`
      var { recordset: result } = await sql.query(query);

     result = result.map((data) => {

        return {
           name: value,
            answers: data['Smart App Answers'],
            value: data[value],
            date: data["Review Date"]
        }

     })

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
  

  endpoints.filters = async (req, res) => {
    try {

      const [{recordset: SmartAppAnswers}, {recordset: DayName}] = await Promise.all([
          await sql.query(`SELECT DISTINCT([Smart App Answers]) from ${Model} ORDER BY [Smart App Answers] ASC`),
          await sql.query(`SELECT DISTINCT([Day Name]) from ${Model} ORDER BY [Day Name] Asc`)

      ])  

     result = {
         'Smart App Answers': SmartAppAnswers,
         'Day Name': DayName
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
   

  
endpoints.table = async (req, res) => {
    try {
      const page = req.query.page || 1;
  
      const limit = parseInt(req.query.items) || 99;
      const skip = page * limit - limit;
      const order = req.query.order || "DESC";
  
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
  
      let filterQuery = "";
      for (key in filter) {
        if (filter[key]) {
  
          switch (key) {
            
            
            default: {
             
                let values = filter[key];
                values = [... new Set(values)]

     
                    valueQuery = values.map(v => ( "'" + v  + "'"))
                    if(values.length > 0) {
                        filterQuery +=  +filter[key] !== null ?  "[" +key + "] IN (" + valueQuery + ") and " : "" ;
                    }
            
                break
            }
          }
        }
      }
      filterQuery = filterQuery.slice(0, -4);
      
      let sorterQuery = "";
      sorter.map((sort) => {
        sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
    })
  
    
      let sq = sorterQuery.slice(0, -1)
  
  
      var query = `select  * from ${Model} `;
      var totalQuery = `select count(*) from ${Model} `;
  
      if(filterQuery || sorterQuery) {
        if(filterQuery ) {
            query += "where " + filterQuery + " "
            totalQuery += "where " + filterQuery + " "
        }  
        
        if (sorterQuery) {
            
            query += " ORDER BY " + sq +  " OFFSET "+ skip + " ROWS FETCH NEXT " +  limit + " ROWS ONLY"   
        } 


            } else {
                query +="ORDER BY  [Review Date] Desc OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
            }

  
  
      var recordset;
      var arr;
  
      const { recordset: result } = await sql.query(query);

      recordset = result;
      
      const { recordset: coun } = await sql.query(totalQuery);
      arr = coun
     
      const obj = arr[0];
      const count = obj[""];
  
      const pages = Math.ceil(count / limit);
      const pagination = { page, pages, count };


      return res.status(200).json({
        success: true,
        result: recordset,
        pagination,
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
