var sql = require("mssql");

exports.list = async (Model, req, res, id_col = 'id', order = 'ASC') => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;

    //  Query the database for a list of all results
    const { recordset } = await sql.query(
      
        `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}
        ORDER BY ${id_col} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
      // `select * from ${Model}
      // ORDER BY ${id_col} ${order}`
    );

      //   `select * from ${Model}
      //   ORDER BY ${id_col} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from  ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
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
};

exports.update = async (Model, req, res, id_col = 'id') => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;

    
    const id = req['params']['id'];// please do not update this line
    let valuesQuery = "";
    for (key in values) {
      if(values[key] == null) {
        valuesQuery += (key == 'User' ? "[User]" :  "[" + key)  + "]= NULL,";
        
      } else {
        valuesQuery += (key == 'User' ? "[User]" : "[" + key)  + "]='" + values[key].replace(/'/g, "''") + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);
    await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);

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
};
// };
// exports.read = async (Model, req, res) => {
//   try {
//     // Find document by id
//     const result = await Model.findOne({ _id: req.params.id });
//     // If no results found, return document not found
//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         result: null,
//         message: "No document found by this id: " + req.params.id,
//       });
//     } else {
//       // Return success resposne
//       return res.status(200).json({
//         success: true,
//         result,
//         message: "we found this document by this id: " + req.params.id,
//       });
//     }
//   } catch (err) {
//     // Server Error
//     return res.status(500).json({
//       success: false,
//       result: null,
//       message: "Oops there is an Error",
//     });
//   }
// };

// /**
//  *  Creates a Single document by giving all necessary req.body fields
//  *  @param {object} req.body
//  *  @returns {string} Message
//  */

// exports.create = async (Model, req, res) => {
//   try {
//     // Creating a new document in the collection

//     const result = await new Model(req.body).save();
//     console.log(result);
//     // Returning successfull response
//     return res.status(200).json({
//       success: true,
//       result,
//       message: "Successfully Created the document in Model ",
//     });
//   } catch (err) {
//     // If err is thrown by Mongoose due to required validations
//     if (err.name == "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         result: null,
//         message: "Required fields are not supplied",
//       });
//     } else {
//       // Server Error
//       return res.status(500).json({
//         success: false,
//         result: null,
//         message: "Oops there is an Error",
//       });
//     }
//   }
// };

// /**
//  *  Delete a Single document
//  *  @param {string} req.params.id
//  *  @returns {string} Message response
//  */

// exports.delete = async (Model, req, res) => {
//   try {
//     // Find the document by id and delete it

//     // Find the document by id and delete it
//     const result = await Model.findOneAndDelete({ _id: req.params.id }).exec();
//     // If no results found, return document not found
//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         result: null,
//         message: "No document found by this id: " + req.params.id,
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         result,
//         message: "Successfully Deleted the document by id: " + req.params.id,
//       });
//     }
//   } catch {
//     return res.status(500).json({
//       success: false,
//       result: null,
//       message: "Oops there is an Error",
//     });
//   }
// };

// /**
//  *  Searching documents with specific properties
//  *  @param {Object} req.query
//  *  @returns {Array} List of Documents
//  */

// exports.search = async (Model, req, res) => {
//   if (req.query.q === undefined || req.query.q === "" || req.query.q === " ") {
//     return res
//       .status(202)
//       .json({
//         success: false,
//         result: [],
//         message: "No document found by this request",
//       })
//       .end();
//   }
//   const fieldsArray = req.query.fields.split(",");

//   const fields = { $or: [] };

//   for (const field of fieldsArray) {
//     fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, "i") } });
//   }

//   try {
//     let results = await Model.find(fields).sort({ name: "asc" }).limit(10);

//     if (results.length >= 1) {
//       return res.status(200).json({
//         success: true,
//         result: results,
//         message: "Successfully found all documents",
//       });
//     } else {
//       return res
//         .status(202)
//         .json({
//           success: false,
//           result: [],
//           message: "No document found by this request",
//         })
//         .end();
//     }
//   } catch {
//     return res.status(500).json({
//       success: false,
//       result: null,
//       message: "Oops there is an Error",
//     });
//   }
// };
