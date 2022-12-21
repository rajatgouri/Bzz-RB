import React, { useState, useEffect } from "react";
import { FullCalendarLayout, DashboardLayout } from "@/layout";
import Graph from "../assets/images/executive-graph.png";
import roadmap from "../assets/images/roadmap.png";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

import { DatePicker, Row, Col,  Checkbox,} from 'antd';
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;


const styles = {
  layout: {
    // backgroundImage : `url(${background})`,
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat"
    // overflow: "auto",
    // height: "100vh",
  } ,
  content:  {
    padding: "30px 40px",
    margin: "85px auto",
    width: "100%",
    maxWidth: "1090px",
    height: "78vh",
    // background: "white",
    // boxShadow: "1px 1px 6px 5px lightgrey",
    borderRadius: "5px",
    overflow: "auto"
  } 
}

const defaultCheckedList = [];
const plainOptions = ['WQ5508', 'WQ1075'];

export default function Milestone() {
  
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const data =[
    {
      date: "2021-05-09",
      value: 500
    },
    {
      date: "2021-05-10",
      value: 500
    },
    {
      date: "2021-05-11",
      value: 500
    },
    {
      date: "2021-05-12",
      value: 500
    },
    {
      date: "2021-05-13",
      value: 500
    },
    {
      date: "2021-05-14",
      value: 500
    },
    {
      date: "2021-05-15",
      value: 500
    },
    {
      date: "2021-05-16",
      value: 500
    },
    {
      date: "2021-05-17",
      value: 500
    },
    {
      date: "2021-05-18",
      value: 500
    },
    {
      date: "2021-05-19",
      value: 500
    },
    {
      date: "2021-05-20",
      value: 500
    },
    {
      date: "2021-05-21",
      value: 500
    },
    {
      date: "2021-05-22",
      value: 500
    },
    {
      date: "2021-05-23",
      value: 500
    },
    {
      date: "2021-05-24",
      value: 500
    },
    {
      date: "2021-05-25",
      value: 500
    },
    {
      date: "2021-05-26",
      value: 500
    },
    {
      date: "2021-05-27",
      value: 500
    },
    {
      date: "2021-05-28",
      value: 500
    }
  ]


  const onChange = list => {
    setCheckedList(list);
  };

  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
      "maxWidth": "1150px",
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
      <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
              style={{height: "100%"}}
            >
               <h3 className="calendar-header" >Milestones</h3>
              <Row gutter={[12, 12]} style={{height: "calc(100% - 100px)"}}> 
                <Col className="gutter-row center-graph" span={24} style={{height: "100%"}}>
                    <img src={Graph} height="300px" width="100%" style={{ marginBottom: "50px"}}></img>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        

      </Row> 
    </DashboardLayout>
  )



}
