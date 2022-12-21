import React, { useRef, useState, useEffect } from "react";
import { Layout, Form, Breadcrumb, Statistic, Progress,Divider, Tag, Row, Col, Button, notification } from "antd";

import {TrophyTwoTone} from "@ant-design/icons";
import { Column, Liquid, Pie , Gauge} from "@ant-design/charts";
import { request } from "@/request";
import PageLoader from "@/components/PageLoader";

import { DashboardLayout } from "@/layout";
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
import Socket from "../../socket";
import { GetSortOrder } from "@/utils/helpers";

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

export default function PerformanceCards() {

  const [cardData, setCardData] = useState([])
  const [totalProductivity, setTotalProductivity] = useState(0);
  const [totalWQ1075Productivity, setTotalWQ1075Productivity] = useState(0);
  const [selectedID, setSelectedID] = useState(0); 
  const [openModal, setOpenModal] = useState(false);
  const [editForm] = Form.useForm();
  const [admins, setAdmins] = useState([])
  const [emoji, setEmoji] = useState('')


  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load()
    });

    load()
  }, [])


  const getCalendar = async (month, year, cb) => {
    
    
    cb(result)
  } 

  const load = () => {
    (async () => {
      let month = (new Date().getMonth() + 1)
      let year = (new Date().getFullYear())

      const performance = await request.list('performance-pb');

      let {wq5508Progress, wq1075Progress, feedbackProgress, adminlist, wq1075WorkProgress, wq5508WorkProgress, kpi,  wq1075Charges = [], wq5508Charges = [], wq1075Workable = [], wq5508Workable = [], wq1075NonWorkable = [], wq5508NonWorkable = [], wq1075BonusProd = [], wq5508BonusProd =[], wq3177BonusProd = [], wqPBAudit = []} = performance.result
      
     let wq5508 = wq5508Progress;
     let wq1075 = wq1075Progress;
     let feedback = feedbackProgress; 
     let wq5508Work = wq5508WorkProgress; 
     let wq1075Work = wq1075WorkProgress; 
     let admin = adminlist;


     setAdmins(admin.filter(list => list.ManagementCard == '1' && list.First != 'Admin'))
      let user = admin.filter(list => list.ManagementCard != '1').sort(GetSortOrder('Nickname'))
      let firstPart = user.filter((u) => u.SubSection != 'RBB')
      let secondPart = user.filter((u) => u.SubSection == 'RBB')

     user = firstPart.concat(secondPart)

       let merged = [];
 
       for(let i=0; i<user.length; i++) {
        let KPI = kpi.filter(k => k.EMPID == user[i].EMPID)
        let WQ1075C = wq1075Charges.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508C = wq5508Charges.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 

        let WQ1075W = wq1075Workable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508W = wq5508Workable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 

        let WQ1075NW = wq1075NonWorkable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508NW = wq5508NonWorkable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
      
        let WQ1075BP = wq1075BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508BP = wq5508BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt
        let WQ3177BP = wq3177BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt
        let WQPBAudit = wqPBAudit.filter(k => k.Nickname == user[i].Nickname)[0].Cnt



        let obj = {
          wq5508KPI: (KPI.map(res => ({
            value: res.WQ5508ChargesProcessed,
            year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
          }))).splice(0,5), 
          wq1075KPI: (KPI.map(res => ({
            value: res.WQ1075ChargesProcessed,
            year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
          }))).splice(0,5),
          wq5508KPIAmount: (KPI.map(res => ({
            value: res.WQ5508AmountRemoved,
            year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
          }))).splice(0,5),
          wq1075KPIAmount: (KPI.map(res => ({
            value: res.WQ1075AmountRemoved,
            year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
          }))).splice(0,5)
         }  
         
        merged.push({
           EMPID: user[i].EMPID,
           wq5508: wq5508.filter(wq => wq.EMPID == user[i].EMPID)[0],
           wq5508KPI: obj.wq5508KPI.reverse(),
          wq1075KPI: obj.wq1075KPI.reverse(),
          wq5508count: WQ5508C,
          wq1075count: WQ1075C,
          wq5508workable: WQ5508W,
          wq1075workable: WQ1075W,
          wq5508nonworkable: WQ5508NW,
          wq1075nonworkablet: WQ1075NW,
          wq1075bonusprod: WQ1075BP,
          wq5508bonusprod: WQ5508BP,
          wq3177bonusprod: WQ3177BP,
          wqPBAudit: WQPBAudit,

          wq5508KPIAmount: obj.wq5508KPIAmount.reverse(),
          wq1075KPIAmount: obj.wq1075KPIAmount.reverse(),
           user: user[i],
           wq1075: wq1075.filter(wq => wq.EMPID == user[i].EMPID)[0],
           feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
           wq5508Work: wq5508Work.filter(w => w.EMPID == user[i].EMPID)[0],
           wq1075Work: wq1075Work.filter(w => w.EMPID == user[i].EMPID)[0],
          //  calendar: calendar.filter(c => c.EmployeeID == admin.filter((user) => user.EMPID == wq5508[i].EMPID)[0].EMPID)
         });
       }
 
         setCardData(merged)
 
     })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", {EMPID: id, Stars: rating});
    if(feedback.success) {
      notification.success({message: "Feedback given successfully!"})
    } 
  }

  const addNote = (id, text) => {
    setEmoji(text)
    setSelectedID(id)
    setOpenModal(true)
  }

  const handleCancel = () => {
    setOpenModal(false)
    setEmoji('')
  }


  const modalConfig = {
    title: "Add a Note",
    openModal,
    handleCancel
  };

  const onEditItem = async (values) => {
    await request.update("wq5508Work", selectedID , {Notes: values.Notes ? values.Notes : "" });
    await request.create("achievements",  {Comment: values.Notes ? values.Notes : "", toWhom: selectedID, Emoji: emoji });

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

                            {admin.Nickname}

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
          cardData.length > 0 ?
          cardData.map(( data) => {

            return <TopCard
            EMPID={data.EMPID}
            user={data.user}
            KPI= {{
              wq1075 :data.wq1075KPI,
              wq5508 : data.wq5508KPI,
              wq5508KPIAmount: data.wq5508KPIAmount,
              wq1075KPIAmount: data.wq1075KPIAmount
            }}
            // calendar={data.calendar} 
            wq5508count= {data.wq5508count}
            wq1075count= {data.wq1075count}
            wq5508workable= {data.wq5508workable}
            wq1075workable= {data.wq1075workable}
            wq5508nonworkable= {data.wq5508nonworkable}
            wq1075nonworkable= {data.wq1075nonworkable}
            wq1075bonusprod={data.wq1075bonusprod}
            wq5508bonusprod={data.wq5508bonusprod}
            wq3177bonusprod={data.wq3177bonusprod}
            wqPBAudit={data.wqPBAudit}

            feedback={data.feedback}
            WQ5508WorkDone={data.wq5508Work}
            WQ1075WorkDone={data.wq1075Work}
            title={data?.wq5508?.First}
            showCalendar={true} 
            kpi1={data?.wq5508?.KPI}
            kpi2={data?.wq1075?.KPI}
            percent1={data?.wq5508?.ChargesProcessed}
            percent2={data?.wq1075?.ChargesProcessed}
            percent3={data?.wq5508?.ChargesToReview}
              percent4={data?.wq1075?.ChargesToReview}
            amountWQ1075= {data?.wq1075?.Amount ? JSON.parse(data.wq1075.Amount) : [] }
            amountWQ5508= {data?.wq5508?.Amount? JSON.parse(data.wq5508.Amount) : []}
            agingDaysWq1075={data?.wq1075?.AgingDays ? JSON.parse(data.wq1075.AgingDays) : [] }
            agingDaysWq5508={data?.wq5508?.AgingDays ? JSON.parse(data.wq5508.AgingDays) : [] }
            onRatingChanged={(id, rating) => ratingChanged(id ,rating)}
            showBadge={true}
            notes={(id, text) => addNote(id, text)}

            />
          })
          
          :
          <PageLoader />
        }
      </Row>
      <div className="space30"></div>
     
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
