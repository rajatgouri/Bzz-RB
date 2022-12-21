import axios from "axios";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "@/config/serverApiConfig";
import { token as tokenCookies } from "@/auth";
import errorHandler from "./errorHandler";
import successHandler from "./successHandler";

const headersInstance = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  headers: {
    ...headersInstance,
  },
});

const request = {
  create: async (entity, jsonData) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.post(entity + "/create", jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  read: async (entity, id) => {
    console.log(localStorage.getItem('x-auth-token'))
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.get(entity + "/read/" + id);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  update: async (entity, id, jsonData) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.patch(
        entity + "/update/" + id,
        jsonData
      );
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  delete: async (entity, id, option = {}) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.delete(entity + "/delete/" + id);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  filter: async (entity, option = {}) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      let filter = option.filter ? "filter=" + option.filter : "";
      let equal = option.equal ? "&equal=" + option.equal : "";
      let query = `?${filter}${equal}`;

      const response = await axiosInstance.get(entity + "/filter" + query);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  search: async (entity, source, option = {}) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      let query = "";
      if (option !== {}) {
        let fields = option.fields ? "fields=" + option.fields : "";
        let question = option.question ? "&q=" + option.question : "";
        query = `?${fields}${question}`;
      }
      // headersInstance.cancelToken = source.token;
      const response = await axiosInstance.get(entity + "/search" + query, {
        cancelToken: source.token,
      });

      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  list1: async (entity, option = {}) => {
    console.log("🚀 ~ file: request.js ~ line 107 ~ list: ~ option", option);
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };

    try {
    
      
      const response = await axiosInstance.post(entity + "/list1" , option);


      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },


  list: async (entity, option = {}) => {
    console.log("🚀 ~ file: request.js ~ line 107 ~ list: ~ option", option);
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };

    try {
      // let query = "";
      // if (option !== {}) {
      //   let page = option.page ? "page=" + option.page : "";
      //   let items = option.items ? "&items=" + option.items : "";
      //   query = `?${page}${items}`;
      // }

      let query = "?";
      for (var key in option) {
        query += key + "=" + option[key] + "&";
        console.log("🚀  Option : ", key, " : ", option[key]);
      }
      query = query.slice(0, -1);
      console.log("🚀 ~ file: request.js ~ line 124 ~ list: ~ query", query);

      const response = await axiosInstance.get(entity + "/list" + query);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  listinlineparams: async (entity, option = {}) => {
    console.log("🚀 ~ file: request.js ~ line 107 ~ list: ~ option", option);
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };

    try {

      let suffix = "/";
      for (let key in option) {
        suffix += option[key] + "/";
      }

      const response = await axiosInstance.get(entity + "/list" + suffix);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },

  post: async (entityUrl, jsonData, option = {}) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.post(entityUrl, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  get: async (entityUrl) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.get(entityUrl);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  patch: async (entityUrl, jsonData) => {
    axiosInstance.defaults.headers = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };
    try {
      const response = await axiosInstance.patch(entityUrl, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
  source: () => {
    // const CancelToken = await axiosInstance.CancelToken;

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return source;
  },
};
export default request;
