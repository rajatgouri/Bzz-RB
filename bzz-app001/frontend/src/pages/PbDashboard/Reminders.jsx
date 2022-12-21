import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import Socket from "../../socket";


export default function Reminders() {
  const [reminders, setReminders] = useState("");  

  useEffect(() => {    

    Socket.on('updated-reminder', () => {
      loadReminder();
    });

    loadReminder();
  }, [])


  const loadReminder = () => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      if(resposne.result) {
        setReminders(resposne.result[0]?.Reminder)
      }
    })()
  }

  // const dashboardStyles = {
  //   content: {
  //     "boxShadow": "none",
  //     "padding": "35px",
  //     "width": "100%",
  //     "overflow": "auto",
  //     "background": "#eff1f4"
  //   },
  //   section : {
  //     minHeight: "100vh", 
  //     maxHeight: "100vh",
  //     minWidth: "1300px"
  //   }

  // }


  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
      "maxWidth": "1330px",
      "height" : "0px"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }
  }

  return (
    <DashboardLayout style={dashboardStyles}>
      
      <Row gutter={[24, 24]} style={{height: "100%"}}>
      <Col className="gutter-row" style={{width: "100%", height: "100%"}}>
          <div className="whiteBox shadow" style={{ height: "100%", overflow: "auto" }}>
            <div
              className="pad20"
            >
              <h3 className="calendar-header" style={{fontSize: '14px !important'}}>Reminders</h3>
              <div style={{marginTop: "-10px", textAlign: "left"}} className="reminders-container" dangerouslySetInnerHTML={{ __html: reminders }} >
              </div> 
            </div>
          </div>
        </Col>
       

        
      </Row>
      <div className="space30"></div>
      {/* <Row gutter={[24, 24]}>
        <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow">
            <div >
              
            </div>
            <CalendarBoard editable={false}/>
          </div>
        </Col>

      </Row> */}
    </DashboardLayout>
  );
}
