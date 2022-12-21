import React, { useEffect, useState, Suspense } from "react";
import { Router as RouterHistory } from "react-router-dom";
import { Provider } from "react-redux";
import Router from "@/router";
import history from "@/utils/history";
import store from "@/redux/store";
import { request } from "@/request";
import { useSelector, useDispatch} from "react-redux";
import idleTimer from "idle-timer"
import { getDate , getDay} from "@/utils/helpers";
import { useBeforeunload } from 'react-beforeunload';

import useNetwork from "@/hooks/useNetwork";
import Socket from "../socket";
import Chat from "@/components/Chat";
import socket from "../socket";

function App() {
  const { isOnline: isNetwork } = useNetwork();
  const [isAuth, setIsAuth] = useState(false)
  const [path, setPath] = useState('')
  const [status, setStatus] = useState('')


  
  setInterval(() => {
    autoLogout()

    if(localStorage.getItem('auth')) {
      Socket.emit('setUserID', JSON.parse(localStorage.getItem('auth')).current.EMPID)
    } 
        
  }, 600000)

  setInterval(() => {
    if(localStorage.getItem('auth')) {
      setIsAuth(true)
    } else {
      setIsAuth(false)
    }
        
  }, 10000)

  

  useEffect(() => {
    // tracker()
  }, [history])

  const autoLogout = () => {
    if(localStorage.getItem('loggedDay') != getDay()) {
      // localStorage.clear()
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('x-auth-token');
      localStorage.setItem('loggedDay', getDay())
      window.location.href = "/login"
   }
  }



  useEffect(() => {

    autoLogout()
    

    
    if(localStorage.getItem('auth')) {
      Socket.emit('setUserID', JSON.parse(localStorage.getItem('auth')).current.EMPID)
    } 
        

  }, [])




  // tracking //
  history.listen(async (location, action) => {
    setPath(location.pathname)
  });


  useEffect(() => {
    tracker()
  },[path])

  useEffect(() => {
    if(status) {
      tracker(status)
    }
  },[status])

  var done = true;
  const tracker = async (Status = "Visit") => {

    let Url = location.pathname
    let Page = location.pathname.replace(/-/g, " ").substring(1) !== "" ?  location.pathname.replace(/-/g, " ").substring(1): "Pb team dashboard"   
    const UserName = localStorage.getItem('auth') ?  JSON.parse(localStorage.getItem('auth')).current.name : "";
    const EMPID = localStorage.getItem('auth') ?  JSON.parse(localStorage.getItem('auth')).current.EMPID : "";
    
    if(Url.trim() != "/" && UserName != "" && done) {
        if(Url.trim() != "/" && UserName != "" ) {
          // await request.create("/pageLogger", {Url, Page, Status, UserName});
          socket.emit('page-logger', {Url, Page, Status, UserName, EMPID})
          done = !done
        } 
       
        setTimeout(() => {
          done = true
        }, 2000)
    }  
  }


  
  const callbackFn =  () => {
    console.log("You're idle!");
    setStatus("Idle")
  }

  
  const activeCallbackFn =  () => {
    console.log("You're active!");
    setStatus("Active")

  }


  idleTimer({
    // function to fire after idle
    callback: callbackFn,
    // function to fire when active
    activeCallback: activeCallbackFn,
    // Amount of time in milliseconds before becoming idle. default 60000
    idleTime: 1000 * 60  * 5
  })

  return (
    <div>
    <RouterHistory history={history}>
      <Provider store={store}>
        <Router />

        {
          isAuth ?
          <Chat/>
          : null
        }
   

      </Provider>

    </RouterHistory>
  </div>
  );
}

export default App;
