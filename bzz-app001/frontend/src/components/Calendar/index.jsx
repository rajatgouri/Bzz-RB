import React, { useState, useEffect } from "react";
import { Select, Row, Col,  } from "antd";

let { request } = require('@/request')
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment'

const {Option} = Select;

export default function CheckmarkCalendar() {
  
  const [value, setValue] = useState(new Date());
  const [users, setUsers] = useState([]);
  
  const [ calendarCheckmark, setCalendarCheckmark] = useState([])
  const [calendar, setCalendar] = useState([])

  const [EMPID, setEMPID] = useState("")

  const disableTile = ({ date }) => {
      
    if( (EMPID == '222719' && date.getDay() == 5) || (EMPID != '222719' && date.getDay() == 0) ||  date.getDay() == 6 || calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)) {
      return  true
    } 

    
    
  }

  const tileClassName = ({date, view})  => {
    if(calendarCheckmark.length > 0) {
      
      let grey = calendarCheckmark.find(x => x['Date'] ?  x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == null  : false )
      
      if(grey) {
        return 'grey-out'
      } 
    }
  }


  const tileContent  = ({date, view }) => {
    let entry = calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)
    if (entry ) {
      return entry.PayCode.substring(0, 3).toUpperCase()
    }

    
    if(calendarCheckmark.length > 0) {
      
      let tick = calendarCheckmark.find(x => x['Date'] ?  x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 1  : false )
      let cross = calendarCheckmark.find(x => x['Date'] ?  x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 0  : false )
      
      if(tick) {
        return <span style={{color: "green", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block"}}>✓</span>
      } 

      if(cross) {
        return <span style={{color: "red", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block"}}>X</span>
      }

    }
    
  }


  useEffect( async () => {

    const response = await request.list("compliance-user"); 
    setEMPID(response.result[0].EMPID)
    getCalendar(response.result[0].EMPID)
    setUsers(response.result)
  }, [])


  const getCalendar = async (EMPID) => {
      let year = (new Date().getFullYear())
      const { result: calendar } = await request.listinlineparams('billingcalendarstaff1', { year: year, date_column: "ReportDate", EmployeeID: EMPID })
      setCalendar(calendar)
  }

  const getCheckmarkData = async () => {
    const response1 = await request.list("compliance", { EMPID: EMPID, date: (new Date().getFullYear()) }); 
    setCalendarCheckmark(response1.result)

  } 

  const onDayClick = async (value, event) =>{
    let date = (value.toISOString().split('T')[0])
    let First = users.filter((user) => user.EMPID  == EMPID)[0].FIRST_NAME
    await request.create("compliance", { EMPID: EMPID, FIRST_NAME: First,  Date: date}); 
    getCheckmarkData()
  }

  useEffect(() => {
    (async () => {
      if(EMPID) {
        getCheckmarkData()
      }
    })()
  }, [ EMPID])


  return (
    <Col className="gutter-row" >
      <div
        className="compliance-calendar"
        style={{ color: "#595959", fontSize: 13 }}
      >
        <div
          className="pad5 "
          
        >
          <div className="font-special" style={{width: "50%", fontSize: "25px !important", display: "inline-block"}}>
              Compliance
          </div>   
          <div style={{width: "50%", display: "inline-block", textAlign: "end"}}>
          <Select style={{width: "150px", textAlign: "left"}} className="shadow" value={EMPID} onChange={(e) => {
            setEMPID(e)
            getCalendar(e)
          }}>
            {
              users.map((user) => {
                return  <Option value={user.EMPID}>{user.FIRST_NAME}</Option>
              })
            }

         </Select>
          </div>   
       
        </div>

        <div >
          <Row gutter={[24, 24]} style={{ padding: "0px 6px" }}>
            <Col className="gutter-row top-card-left" span={24} style={{ textAlign: "left", paddingBottom: "5px" }}>
              
                <Col span={24} style={{padding: "9px"}} inputRef={(ref) => {
                  this.calendar = ref

                }}>

                     <Calendar
                        calendarType="US"
                        next2Label={null}
						            prev2Label={null}
                        maxDate={new Date(`${new Date().getFullYear()}-12-31`)}
                        minDate={new Date(`${new Date().getFullYear()}-01-01`)}
                        tileDisabled={disableTile} 
                        tileContent={tileContent}
                        onClickDay={onDayClick}
                        tileClassName={tileClassName}
                        onViewChange={(e) => console.log(e)}
                        value={value}
                      />
                </Col>
            </Col>
            

          </Row>
        </div>
      </div>
    </Col>
  );
};


   