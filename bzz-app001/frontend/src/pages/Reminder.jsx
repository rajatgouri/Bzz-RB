import FullPageLayout from "@/layout/FullPageLayout";
import React, { useState, useEffect, useRef } from "react";

import draftToHtml from 'draftjs-to-html';
import { Button } from "antd";
import { request } from "@/request";
import { notification } from "antd";
import { FullCalendarLayout } from "@/layout";
import Socket from "../socket";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import  config from  "@/components/Editor";
import PageLoader from "@/components/PageLoader";


const styles = {
  layout: {
    // backgroundImage : `url(${background})`,
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat"
    minWidth: "1000px",
    padding: "0px 100px"
  } ,
  content:  {
    padding: "30px 40px",
    margin: "85px auto",
    width: "100%",
    maxWidth: "1000px",
    height: "78vh",
    background: "white",
    boxShadow: "1px 1px 6px 5px lightgrey",
    borderRadius: "5px"
  } 
}

export default function Reminder() {
  // const [editMode, setEditMode] = useState(false);
  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const editor = useRef();

  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  const onSaveReminder = async () => {

    const resposne = await request.update('billingreminder', ID, {Reminder: value});
    notification.success({message: "Reminders updated successfully!",duration:3})
    Socket.emit('update-reminder')
  }

  const handleChange =(content) => {
    setValue(content)
  }
  

  useEffect(() => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      if(resposne.result[0].Reminder) {
          setID(resposne.result[0].ID)
          setValue(resposne.result[0].Reminder ?  resposne.result[0].Reminder : "Hello!")        
      } 

    })()
  }, [])

  return (
    <FullCalendarLayout style={styles}>
      <h3 className="calendar-header">Reminders</h3>
      {
        value ? 

      
      <div  style={{height: "100%"}}>
      <div style={{height: "calc(100% - 90px)"}}>
        
          <SunEditor  
          onChange={handleChange}
          getSunEditorInstance={getSunEditorInstance}
          setOptions={{ 
          font: config.font,
          buttonList: config.buttonList
        }} 
        defaultValue={value}
        /> 
         </div>
        <div className="text-right">
          <Button type="primary" onClick={onSaveReminder}>Save</Button>
        </div>
      </div>

      : 
        "Loading..."
}
    </FullCalendarLayout> 
  )

}
