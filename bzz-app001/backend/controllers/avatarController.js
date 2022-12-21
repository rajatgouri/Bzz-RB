const methods = require("./crudController");
const endpoints = methods.crudController("");
const sqlConnection = require('../sql')
const {getSortOrder, GetSortOrder} = require('./utilController')


endpoints.tabs = async (req, res) => {
  const { folder="Avatars"} = req.query;

  try {
   
    const { recordset: result } = await sqlConnection.cloud(`tabs`, folder );

    return res.status(200).json({
      success: true,
      result: result.sort(GetSortOrder('name')),
      pagination: 1,
      message: "Successfully found  data  ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      error: err,
    });
  }
};


endpoints.photos = async (req, res) => {
  const { folder, file} = req.query;

  try {
   
    const { recordset: result } = await sqlConnection.cloud(`photos`, folder, file );



    return res.status(200).json({
      success: true,
      result: result,
      pagination: 1,
      message: "Successfully found  data  ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      error: err,
    });
  }
};

module.exports = endpoints;