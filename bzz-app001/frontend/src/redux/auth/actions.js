import * as actionTypes from "./types";
import * as authService from "@/auth";
import storePersist from "@/redux/storePersist";
import history from "@/utils/history";
import { request } from "@/request";
import {getDay} from '@/utils/helpers';
import socket from "@/socket";
import { WindowsFilled } from "@ant-design/icons";

export const login = (loginAdminData) => async (dispatch) => {

  dispatch({
    type: actionTypes.LOADING_REQUEST,
    payload: { loading: true },
  });
  const data = await authService.login(loginAdminData);

  if (data.success === true) {

    const authValue = {
      current: data.result.admin,
      loading: false,
      isLoggedIn: true,
    };

    localStorage.setItem('SSO', data.result.token)
    socket.emit('setUserID', data.result.admin.EMPID)

    localStorage.setItem('loggedDay', getDay())

    tracker('/login', 'Login', data.result.admin.name, "Login")
    await request.create("/pageLogger", { Url: '', Page: '', Status: 'Working', UserName:  data.result.admin.name });

    storePersist.set("auth", authValue);
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: data.result.admin,
    });


    history.push("/");
  } else {
    dispatch({
      type: actionTypes.FAILED_REQUEST,
      payload: data,
    });
  }
};


export const ssoLogin = (loginAdminData) => async (dispatch) => {

  dispatch({
    type: actionTypes.LOADING_REQUEST,
    payload: { loading: true },
  });
  const data = await authService.ssoLogin(loginAdminData);

  if (data.success === true) {

    const authValue = {
      current: data.result.admin,
      loading: false,
      isLoggedIn: true,
    };

    localStorage.setItem('SSO', data.result.token)
    socket.emit('setUserID', data.result.admin.EMPID)

    localStorage.setItem('loggedDay', getDay())

    tracker('/login', 'Login', data.result.admin.name, "Login")
    await request.create("/pageLogger", { Url: '', Page: '', Status: 'Working', UserName:  data.result.admin.name });

    storePersist.set("auth", authValue);
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: data.result.admin,
    });

    history.push("/");
  } else {
    dispatch({
      type: actionTypes.FAILED_REQUEST,
      payload: data,
    });
  }
};




export const resetPassword = (values) => async (dispatch) => {
  console.log(values)
  dispatch({
    type: actionTypes.LOADING_REQUEST,
    payload: { loading: true },
  });
  const data = await authService.resetPassword(values);

  if (data.success === true) {

    history.push("/reset-password-done");
  } else {
    dispatch({
      type: actionTypes.FAILED_REQUEST,
      payload: data,
    });
  }
};


export const logout = () => async (dispatch) => {
  
  let user = JSON.parse(localStorage.getItem('auth'))
  socket.emit('disconnected', user.current.EMPID)

  tracker('/logout', 'Logout', user.current.name, "Logout")

  authService.logout();
  dispatch({
    type: actionTypes.LOGOUT_SUCCESS,
  });
  // history.push("/login");
  window.location.href = '/login'

};

const tracker = async (Url, Page, UserName, Status = "Visit") => {
  await request.create("/pageLogger", {Url, Page, Status, UserName});
} 