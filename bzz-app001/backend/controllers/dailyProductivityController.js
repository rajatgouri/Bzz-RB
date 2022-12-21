const methods = require("./crudController");
const endpoints = methods.crudController("WQ5508Productivity");
var sql = require("mssql");

delete endpoints["list"];
const Model1 = "WQ5508Productivity";
const Model2 = "WQ1075Productivity"

endpoints.list = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.First;
        const managementAccess = req.admin.ManagementCard
        var page = req.query.page || 1;
        var filter = JSON.parse(req.query.filter);
        var sorter = JSON.parse(req.query.sorter);
            
        
        let filterQuery = "";
        let sorterQuery = "";

        for (key in filter) {
            if(filter[key]) {

                switch (key) {
                    
                    

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
        
        var query = `SELECT CONCAT_WS('seperator',${Model1}.Date, ${Model2}.Date) as Date,
            CONCAT_WS('seperator', ${Model1}.BillerName, ${Model2}.BillerName) as BillerName,
            ${Model1}.Duration as Duration1 ,
            ${Model2}.Duration as Duration2,
            ${Model1}.[Between] as Between1,
            ${Model2}.[Between] as Between2
            FROM ${Model1} FULL JOIN ${Model2} on
            ${Model1}.BillerName = ${Model2}.BillerName and
            ${Model1}.Date = ${Model2}.Date `

        var totalQuery = `Select Count(*)
            FROM ${Model1} FULL JOIN ${Model2} on
            ${Model1}.BillerName = ${Model2}.BillerName and
            ${Model1}.Date = ${Model2}.Date `;    

        if(filterQuery || sorterQuery) {
            if(filterQuery ) {
                query += "where " + filterQuery + " "
                totalQuery += "where " + filterQuery + " "
            }  
            
            if (sorterQuery) {
                query += " ORDER BY " + sq +  " "   
            } 


        } else {
            query +="ORDER BY Date DESC OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
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

        let recordsetResult = recordset.map((record) =>  {
            record.Date = record['Date'].split('seperator')[0];
            record.BillerName = record['BillerName'].split('seperator')[0];
            return record
        })

        return res.status(200).json({
            success: true,
            result: recordsetResult,
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

module.exports = endpoints;
