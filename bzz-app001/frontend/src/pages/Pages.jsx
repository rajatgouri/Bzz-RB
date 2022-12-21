import React, { useState, useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { DashboardLayout } from "@/layout";
import {  Row, Col} from 'antd';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4",
    "margin": "auto",
    "maxWidth": "1150px",
    "height": "0px"
  },
  section : {
    minHeight: "100vh", 
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function Pages() {
  
  return (
    
    <DashboardLayout style={dashboardStyles}>
    <Row gutter={[24, 24]} style={{height: "100%"}}>
      <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              style={{height: "100%"}}
              className="pad20"
            >
               <h3 className="calendar-header" style={{marginBottom: "0px"}}>Page</h3>
               <Row gutter={[12, 12]} style={{marginTop: "30px", height: "calc(100% - 90px)", display: "block"}}> 
                <Col className="gutter-row" span={24} >
                    <label className="label">Title</label>
                    <input name="title" className="input"></input>
                </Col>
                <Col className="gutter-row" span={24} style={{height: "calc(100% - 120px)"}}>
                  <SunEditor  setOptions={{
                      buttonList: [['font', 'align'], ['image']] 
			              }} />
                </Col>
              </Row>
          </div>
          </div>
        </Col>
    </Row> 
    </DashboardLayout> 
  )

}
