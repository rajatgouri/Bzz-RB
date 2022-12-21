import React, { useState, useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { DashboardLayout } from "@/layout";
import {  Row, Col} from 'antd';
import AutomationAndBusiness from "../assets/images/Snag_ec11e6.png";
import ChargesDistribution from "../assets/images/Snag_132e80d.png";
import CriticalTrails1 from "../assets/images/critical-trails-1.png";
import CriticalTrails2 from "../assets/images/critical-trails.png";

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

export default function NLPRouting() {
  
  return (
    // <FullCalendarLayout style={styles}>
      // <h2 className="calendar-header">
      //   Algorithms and Rules
      // </h2>
    // </FullCalendarLayout>
    <DashboardLayout style={dashboardStyles}>
    <Row gutter={[24, 24]} style={{height: "100%"}}>
    <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
              {/* <h2 className="calendar-header">
                Predictive Billing
              </h2> */}
              <Row gutter={[12, 12]}> 
                <Col className="gutter-row" span={24} style={{height: "100%", display: "contents"}}>
                    {/* <img src={roadmap} height="100%" width="100%" style={{marginTop: "30px", marginBottom: "30px"}}></img> */}
                    
                    <h2 className="text-center centered calendar-header">Coming Soon ...</h2>
                
                </Col>
              </Row>
            </div>
          </div>
        </Col>
    
      </Row> 
    </DashboardLayout> 
  )

}
