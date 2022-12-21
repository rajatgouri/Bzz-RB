import React from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import CalendarBoard from "../CalendarBoard";


export default function PBCalendar() {
  
  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }

  }

  return (
    <DashboardLayout style={dashboardStyles}>
      
      <Row gutter={[24, 24]}>
      
        <Col className="gutter-row" style={{width: "100%"}}>
          <div className="whiteBox shadow "  style={{  overflow: "auto"}}>
  
            <CalendarBoard editable={false}/>
          </div>
        </Col>  
      </Row>
      
    </DashboardLayout>
  );
}
