import { notification } from "antd";
import history from "@/utils/history";
import codeMessage from "./codeMessage";

const errorHandler = (error, emptyResult = null) => {
  const { response } = error;

  if (!response) {
    // notification.config({
    //   duration: 20,
    // });
    // notification.error({
    //   message: "No internet connection",
    //   description: "Cannot connect to the server, Check your internet network",
    // });
    return {
      success: false,
      result: emptyResult,
      message: "Cannot connect to the server, Check your internet network",
    };
  } else if (response && response.status) {
    const message = response.data && response.data.message;
    const errorText = message || codeMessage[response.status];
    const { status, data} = response;

    if(!error.response.data.jwtExpired) {
      notification.config({
        duration: 3,
      });
      notification.error({
        message: `Request error ${status}`,
        description: data.message,
      });
    }
    
   if (error.response.data.jwtExpired) {
      console.log(error.response.data.jwtExpired)
      if( error.response.data.jwtExpired) {
        // localStorage.clear()
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('x-auth-token');
        window.location.href = "/"
      }
    }
    return response.data;
  } else {
    // notification.config({
    //   duration: 20,
    // });
    // notification.error({
    //   message: "Unknown Error",
    //   description: "An unknown error occurred in the app, please try again. ",
    // });
    return {
      success: false,
      result: emptyResult,
      message: "An unknown error occurred in the app, please try again. ",
    };
  }
};

export default errorHandler;
