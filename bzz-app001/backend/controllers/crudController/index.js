const crudMethods = require("./crudMethods");

exports.crudController = (modelName, id_col = 'id', order = 'ASC') => {
  let methods = {};
  methods.list = async (req, res) => {
    crudMethods.list(modelName, req, res, id_col, order);
  };
  methods.update = async (req, res) => {
    crudMethods.update(modelName, req, res, id_col);
  };
  // methods.create = async (req, res) => {
  //   crudMethods.create(modelName, req, res);
  // };

  // methods.read = async (req, res) => {
  //   crudMethods.read(modelName, req, res);
  // };
  // methods.delete = async (req, res) => {
  //   crudMethods.delete(modelName, req, res);
  // };

  // methods.search = async (req, res) => {
  //   crudMethods.search(modelName, req, res);
  // };

  return methods;
};
