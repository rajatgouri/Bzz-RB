import React, { useRef, useState, useEffect } from "react";
import { Layout, Form, Breadcrumb, Statistic, Progress,Divider, Tag, Row, Col, Button, notification } from "antd";

import {TrophyTwoTone} from "@ant-design/icons";
import { Column, Liquid, Pie , Gauge} from "@ant-design/charts";
import { request } from "@/request";

import { DashboardLayout } from "@/layout";
import LiquidChart from "@/components/Chart/liquid";
// import ReactStars from "react-rating-stars-component";
import SealOfExellence from "../assets/images/seal-of-exellence.png";
import TopCard from "@/components/TopCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
import Socket from "../socket";

const barChartConfig = {
  width: 110,
  height: 110,
  style: {
    display: "inline-block",
    marginRight: "5px",
  }
}

const DemoGauge = ({percent}) => {

  var config = {
    percent: +percent / 100,
    type: 'meter',
    innerRadius: 0.75,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A',  '#FAAD14', '#30BF78' ],
    },
    
    indicator: {
      pointer: { style: { display: 'none' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    axis: {
      label: {
        formatter: function formatter(v) {
          return Number(v) * 100;
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '18px',
          lineHeight: '20px',
          color: "#000000",
          fontWeight: "600",
          marginTop: "15px"
        },
      },
    },
  };
  return <Gauge height={150} {...config} />;
};

const DemoColumn = () => {
  const data = [
    {
      name: "Beginning Total",
      month: "Sun Aug 18",
      value: 180900,
    },
    {
      name: "Beginning Total",
      month: "Mon Aug 19",
      value: 128800,
    },
    {
      name: "Beginning Total",
      month: "Tue Aug 20",
      value: 139300,
    },
    {
      name: "Beginning Total",
      month: "Wed Aug 21",
      value: 181400,
    },
    {
      name: "Beginning Total",
      month: "Thu Aug 22",
      value: 47000,
    },
    {
      name: "Beginning Total",
      month: "Fri Aug 23",
      value: 120300,
    },
    {
      name: "Beginning Total",
      month: "Sat Aug 24",
      value: 124000,
    },

    {
      name: "Amount Added",
      month: "Sun Aug 18",
      value: 122400,
    },
    {
      name: "Amount Added",
      month: "Mon Aug 19",
      value: 123200,
    },
    {
      name: "Amount Added",
      month: "Tue Aug 20",
      value: 84500,
    },
    {
      name: "Amount Added",
      month: "Wed Aug 21",
      value: 99700,
    },
    {
      name: "Amount Added",
      month: "Thu Aug 22",
      value: 52600,
    },
    {
      name: "Amount Added",
      month: "Fri Aug 23",
      value: 135500,
    },
    {
      name: "Amount Added",
      month: "Sat Aug 24",
      value: 137400,
    },

    {
      name: "Amount Removed",
      month: "Sun Aug 18",
      value: 92400,
    },
    {
      name: "Amount Removed",
      month: "Mon Aug 19",
      value: 152000,
    },
    {
      name: "Amount Removed",
      month: "Tue Aug 20",
      value: 144500,
    },
    {
      name: "Amount Removed",
      month: "Wed Aug 21",
      value: 59700,
    },
    {
      name: "Amount Removed",
      month: "Thu Aug 22",
      value: 72600,
    },
    {
      name: "Amount Removed",
      month: "Fri Aug 23",
      value: 115500,
    },
    {
      name: "Amount Removed",
      month: "Sat Aug 24",
      value: 127400,
    },
  ];
  var config = {
    data: data,
    isGroup: true,
    xField: "month",
    yField: "value",
    seriesField: "name",
    dodgePadding: 3,
    intervalPadding: 20,
    color: ["#0CC4E7", "#BE253A", "#04A151"],
  };
  return <Column {...config} />;
};




const DemoLiquid = () => {
  var config = {
    percent: 0.25,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: { length: 128 },
  };
  return <Liquid   {...config} />;
};
const DemoPie = () => {
  var data = [
    {
      type: "A+",
      value: 27,
    },
    {
      type: "A-",
      value: 25,
    },
    {
      type: "AB+",
      value: 18,
    },
    {
      type: "AB-",
      value: 15,
    },
    {
      type: "O+",
      value: 10,
    },
    {
      type: "O-",
      value: 5,
    },
  ];
  var config = {
    appendPadding: 10,
    data: data,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      type: "spider",
      labelHeight: 28,
      content: "{name}\n{percentage}",
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
  };
  return <Pie {...config} />;
};

const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function ManagementDashboard() {

  const [cardData, setCardData] = useState([])
  const [totalProductivity, setTotalProductivity] = useState(0);
  const [totalWQ1075Productivity, setTotalWQ1075Productivity] = useState(0);
  const [selectedID, setSelectedID] = useState(0); 
  const [openModal, setOpenModal] = useState(false);
  const [editForm] = Form.useForm();
  const [admins, setAdmins] = useState([])


  useEffect(() => {
    

    load()
  }, [])

  const load = () => {
    (async () => {

      
      const [wq5508Progress, wq1075Progress , feedbackProgress, wq5508WorkProgress, wq1075WorkProgress, adminlist] = await Promise.all([request.list("wq5508progress"), request.list("wq1075progress"), request.list("feedback"), request.list("wq5508Work"), request.list("wq1075Work"), request.list("admin")]);
 
     //  console.log(x)
     //   const wq5508Progress = await request.list("wq5508progress");
       
     //   const wq1075Progress = await request.list("wq1075progress");
     //   const feedbackProgress = await request.list("feedback");
     //   const workProgress = await request.list("work");
     let wq5508 = wq5508Progress.result;
     let wq1075 = wq1075Progress.result;
     let feedback = feedbackProgress.result; 
     let wq5508Work = wq5508WorkProgress.result; 
     let wq1075Work = wq1075WorkProgress.result; 
     let admin = adminlist.result;

 
 
     setAdmins(admin.filter(list => list.ManagementAccess == 1 && list.ID != 4 && list.ID != 7))

       let merged = [];
       let sumwq5508 = 0;
       let sumwq1075 = 0;
 
       for(let i=0; i<wq5508.length; i++) {
         sumwq5508 += +wq5508[i].ChargesProcessed;
         sumwq1075 += +wq1075[i].ChargesProcessed;
 
         merged.push({
           EMPID: wq5508[i].EMPID,
           wq5508: wq5508[i],
           wq1075: wq1075.filter(wq => wq.EMPID == wq5508[i].EMPID)[0],
           feedback: feedback.filter(f => f.EMPID == wq5508[i].EMPID)[0],
           wq5508Work: wq5508Work.filter(w => w.EMPID == wq5508[i].EMPID)[0],
           wq1075Work: wq1075Work.filter(w => w.EMPID == wq5508[i].EMPID)[0],
 
         });
       }
 
       setTotalWQ1075Productivity(((sumwq1075 / (wq1075.length * 100)) * 100).toFixed(2))
       setTotalProductivity(((sumwq5508 / (wq5508.length * 100)) * 100).toFixed(2))
         setCardData(merged)
 
     })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", {EMPID: id, Stars: rating});
    if(feedback.success) {
      notification.success({message: "Feedback given successfully!"})
    } 
  }

  const addNote = (id) => {

    setSelectedID(id)
    setOpenModal(true)
  }

  const handleCancel = () => {
    setOpenModal(false)
  }


  const modalConfig = {
    title: "Add a Note",
    openModal,
    handleCancel
  };

  const onEditItem = async (values) => {
    await request.update("wq5508Work", selectedID , {Notes: values.Notes ? values.Notes : "" });
    editForm.resetFields()
    setOpenModal(false)
  }

  return (
    <DashboardLayout style={dashboardStyles}>

{
        cardData.length > 0 ?
        <Row gutter={[20, 20]}style={{ width: "100%", display: "block", marginLeft: "0px" }}>
        <Col className="" style={{ width: "100%", textAlign: "left", padding: "0px"  }}>
              <div
                className="whiteBox shadow"
                style={{ color: "#595959", fontSize: 13 }}
              >

                <Row gutter={[24, 24]} className="texture">
                  {
                    admins && admins.map((admin) => {
                      return <Col style={{ width: "20%", height: "142px" }}>
                        <div
                          className="pad5 strong"
                          style={{ textAlign: "left" }}
                        >
                          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">

                            {admin.First}

                          </h3>

                          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
                            {
                              admin && admin.Avatar && admin.Avatar != "null" ?
                                <img src={admin.Avatar} className="user-avatar scale2"></img>
                                : null
                            }
                          </div>

                        </div>
                      </Col>
                    })
                  }

                  <Col  style={{ width: "260px", position: "absolute", right: "0px", display: "flex" ,height: "142px"}}>
                      <span  className="topbar-header">Management</span>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          : null
      }
      <div className="space30"></div>

      <Row gutter={[24, 24]}>
      {
          cardData.map(( data) => {
            return <TopCard
            EMPID={data.EMPID}
            feedback={data.feedback}
            WQ5508WorkDone={data.wq5508Work}
            WQ1075WorkDone={data.wq1075Work}
            title={data?.wq5508?.First}
            percent1={data?.wq5508?.ChargesProcessed}
            percent2={data?.wq1075?.ChargesProcessed}
            amountWQ1075= {data?.wq1075?.Amount ? JSON.parse(data.wq1075.Amount) : [] }
            amountWQ5508= {data?.wq5508?.Amount? JSON.parse(data.wq5508.Amount) : []}
            agingDaysWq1075={data?.wq1075?.AgingDays ? JSON.parse(data.wq1075.AgingDays) : [] }
            agingDaysWq5508={data?.wq5508?.AgingDays ? JSON.parse(data.wq5508.AgingDays) : [] }
            onRatingChanged={(id, rating) => ratingChanged(id ,rating)}
            showBadge={true}
            notes={(id) => addNote(id)}

            />
          })
        }
      </Row>
      <div className="space30"></div>
      <Row gutter={[24, 24]}>
        <Col className="gutter-row" style={{ width: "60%" }}>
          <div className="whiteBox shadow" style={{ height: "430px" }}>
            <div className="pad20">
              <DemoColumn />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "430px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              {/* <Progress type="dashboard" percent={totalWQ1075Productivity} width={148} /> */}

              <DemoGauge width={148} percent={totalWQ1075Productivity}/>
              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQ1075</h1>
              {/* <Statistic
                title="Activity"
                value={11.28}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              /> */}
            </div>
          </div>
        </Col>
        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "430px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              {/* <Progress type="dashboard" percent={totalProductivity} width={148} /> */}
              <DemoGauge width={148} percent={totalProductivity}/>

              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQ5508</h1>
              {/* <Statistic
                title="Activity"
                value={11.28}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              /> */}
            </div>
          </div>
        </Col>
      </Row>
      <div className="space30"></div>
      {/* <Row gutter={[24, 24]}>
        <Col className="gutter-row" span={12}>
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: "#22075e", marginBottom: 5 }}>
                Daily Average
              </h3>
              <Divider />
              <DemoLiquid />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" span={12}>
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: "#22075e", marginBottom: 5 }}>Charges</h3>
              <Divider />
              <DemoPie />
            </div>
          </div>
        </Col>
      </Row> */}


        <Modals config={modalConfig} >
          <Form
            name="basic"
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            onFinish={onEditItem}
            // onFinishFailed={onEditFailed}
            autoComplete="off"
            form={editForm}
          >
            <Form.Item
              label="Notes"
              name="Notes"
            >
              <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={2} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 18 }}>
              <Button type="primary" htmlType="submit" className="mr-3">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modals>
    </DashboardLayout>
  );
}
