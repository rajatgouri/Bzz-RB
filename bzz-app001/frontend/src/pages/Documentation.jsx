

import React, { useState, useEffect, useRef } from "react";
import { FullCalendarLayout, DashboardLayout } from "@/layout";
import roadmap1 from "../assets/images/roadmap1.png";
import {  Row, Col} from 'antd';
import { Button } from "antd";
import { request } from "@/request";
import { notification } from "antd";
import Socket from "../socket";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"

export default function Milestone() {
  
  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
      "maxWidth": "1150px"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }
  }


  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const [collapsed, setCollapsed] = useState(false)
  const editor = useRef();


  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  const onSaveReminder = async () => {

    const resposne = await request.update('billingreminder', ID, {Documentation: value});
    notification.success({message: "Documentation Updated Successfully!",duration:3})
    // Socket.emit('update-reminder')
  }

  const handleChange =(content) => {
    setValue(content)
  }
  

  useEffect(() => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      setID(resposne.result[0].ID)
      setValue(resposne.result[0].Documentation ?  resposne.result[0].Documentation : "Hello!")        

    })()
  }, [])

  const showEditor = () => {
    setCollapsed(!collapsed)
  }

  return (
    

    <DashboardLayout style={dashboardStyles}>
    <Row gutter={[24, 24]} style={{rowGap: "14px !important" }}>
      <Col className="gutter-row" span={24} style={{marginBottom: "15px"}}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
               {/* <h3 className="calendar-header" style={{marginBottom: "10px"}}>Management Services</h3> */}
              <Row gutter={[12, 12]} > 
                <Col className="gutter-row reminders-container" span={24}  dangerouslySetInnerHTML={{ __html: value }}>
                    {/* <img src={roadmap1} height="100%" width="100%" style={{ marginBottom: "50px"}}></img> */}
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={24} style={{height: "calc(100% - 90%)", textAlign: 'right',marginBottom: "15px"}}>
          <Button className="shadow" default onClick={showEditor}>{collapsed ? "Hide" : "Edit" } </Button>
        </Col>
        {
          collapsed ? 
        <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%", minHeight: "0px" }}>
            <div
              className="pad20"
            >
               {/* <h3 className="calendar-header" style={{marginBottom: "10px"}}>Management Services</h3> */}
              <Row gutter={[12, 12]} className="editor-box-container"> 
                
                  
                  <Col className="gutter-row" span={24} style={{height: "100%"}}>
                  {/* <img src={roadmap2} height="100%" width="100%" style={{marginTop: "30px", marginBottom: "30px"}}></img> */}
                  <div  style={{height: "100%"}}>
                    <div style={{height: "calc(100% - 30px)"}}>
                      {
                        value ? 
                        <SunEditor  
                        onChange={handleChange}
                        getSunEditorInstance={getSunEditorInstance}
                        setOptions={{ 
                        font: Config.font,
                        buttonList: Config.buttonList 
                      }} 
                      defaultValue={value}
                      /> : 
                      null
                      }
                      </div>
                       {
                         value ? 
                         <div className="text-right">
                            <Button type="primary" onClick={onSaveReminder}>Save</Button>
                          </div>
                          : null
                        } 
                      
                    </div>
              </Col>
               
              </Row>
            </div>
          </div>
        </Col>
        :
        null }

      </Row> 
    </DashboardLayout>
  )
}
