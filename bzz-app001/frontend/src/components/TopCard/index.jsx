import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Divider , Tooltip as TP} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import LiquidChart from "@/components/Chart/liquid";
let { request } = require('@/request')
import { CheckOutlined, DollarTwoTone, CheckSquareTwoTone } from "@ant-design/icons";
import CheckImage from "../../assets/images/check.png";
import Halloween from "../../assets/images/halloween.png";
import logo from "../../assets/images/logo.png";
import SantaBag from "../../assets/images/santa-gift-bag.png";
import ExternalPumpkin from "../../assets/images/external-pumpkin.png";
import CandyCaneBow from "../../assets/images/candy-cane-bow.png";
import CandyCane from "../../assets/images/candy-cane.png";
import Candy from "../../assets/images/candy.png";
import Candy1 from "../../assets/images/candy1.png";
import Autumn from "../../assets/images/autumn.png";
import SealOfExellence from "../../assets/images/seal-of-exellence.png";
import CheckerFlags from "../../assets/images/checker-flags.png";
import BearBadge from "../../assets/images/bear1.png";
import FireworksBadge from "../../assets/images/balloons1.png";
import PencilBadge from "../../assets/images/pencil1.png";
import StarBadge from "../../assets/images/star1.png";
import RibbonBadge from "../../assets/images/ribbon1.png";
import ThumbsupBadge from "../../assets/images/thumbs-up1.png";
import ProgressChart from "../Chart/progress";
import { getDate } from "@/utils/helpers";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment'
import { Line } from '@ant-design/charts';
import Cabinet from '@/assets/images/Cabinet.png'

function CustomTooltip({ payload, label, active }) {
  if (active) {
    return (
      <div className="custom-tooltip p-2 bg-white">
        <p className="label mb-0">Date:  {`${label}`}</p>
        <p className="label">value: {`${payload[0].value}`}</p>

      </div>
    );
  }

  return null;
}

const DemoLine = ({ data }) => {
  const config = {
    data,
    width: 110,
    height: 80,
    autoFit: false,
    padding: 'auto',
    xField: 'year',
    yField: 'value',
    renderer: "svg",
    legend: false,
    xAxis: {
      tickCount: 10,

      label: {
        style: {
          fontSize: 6
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fontSize: 6
        }
      }
    },
    point: {
      size: 3,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    tooltip: {
      customContent: (title, data) => {
        return `<div class='linechart-tooltip'>

          <div ><span class="bold text-left"> Date: </span> <span class="text-right"> ${title} </span></div> 
          <div ><span class="bold text-left">Claims:</span>  <span class="text-right"> ${data[0] ? data[0].value : ""} </span></div> 
        </div>`;
      }
    }
  };
  return <Line {...config} />;
};


const barChartConfig = {
  width: 115,
  height: 110,
  style: {
    display: "flex",
    margin: "auto",
    marginTop: "20px"

  }
}

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const radius = 10;
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value > 1000 ? (value / 1000).toFixed(1) + "K" : value}
      </text>
    </g>
  );
};


export default function TopCard({ EMPID, kpi1, kpi2, user, title, KPI, percent1 = 0, percent2 = 0,  percent3 = 0, percent4 = 0, wq1075count = 0, wq5508count = 0, wq1075workable = 0, wq5508workable = 0, wq1075nonworkable = 0, wq5508nonworkable = 0, wq1075bonusprod = 0 , wq5508bonusprod = 0, wq3177bonusprod = 0, wqPBAudit=0, agingDaysWq1075, agingDaysWq5508, amountWQ5508 = [], amountWQ1075 = [], feedback = {}, WQ5508WorkDone = {}, WQ1075WorkDone = {}, onRatingChanged, showBadge = false, notes, showCalendar }) {

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [badges, setBadges] = useState([
    { badge: StarBadge, index: 1, active: false, notes: "" , text: "Star"},
    { badge: BearBadge, index: 2, active: false, notes: "" , text: "Bear"},
    { badge: RibbonBadge, index: 3, active: false, notes: "" , text: "Ribbon"},
    { badge: ThumbsupBadge, index: 4, active: false, notes: "" , text: "Thumbsup"},
    { badge: PencilBadge, index: 5, active: false, notes: "" , text: "Pencil"},
    { badge: FireworksBadge, index: 6, active: false, notes: "" , text: "Firework"}
  ])

  const [selectedBadge, setSelectedBadge] = useState({});
  const [WQ5508Rating, setWQ5508Rating] = useState(feedback.Stars);
  const [value, setValue] = useState(new Date());

  const [WQ5508Work, setWQ5508Work] = useState(WQ5508WorkDone)
  const [WQ1075Work, setWQ1075Work] = useState(WQ1075WorkDone)

  const [WQ5508WorkingDays, setWQ5508WorkingDays] = useState([]);
  const [WQ1075WorkingDays, setWQ1075WorkingDays] = useState([]);

  const [weeksWQ5508, setWeeksWQ5508] = useState([]);
  const [weeksWQ1075, setWeeksWQ1075] = useState([]);
  const [calendarCheckmark, setCalendarCheckmark] = useState([])
  const [calendar, setCalendar] = useState([])

  const disableTile = ({ date }) => {


    if ((user.StartDay == 'Sun' && date.getDay() == 5) || (user.StartDay != 'Sun' && date.getDay() == 0) || date.getDay() == 6 || calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)) {
      return true
    }

  }


  const tileContent = ({ date, view }) => {
    let entry = calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)
    if (entry ) {
      return entry.PayCode.substring(0, 3).toUpperCase()
    }

    if (calendarCheckmark.length > 0) {

      let tick = calendarCheckmark.find(x => x['Date'] ? x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 1 : false)
      let cross = calendarCheckmark.find(x => x['Date'] ? x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 0 : false)

      if (tick) {
        return <span style={{ color: "green", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block" }}>✓</span>
      }

      if (cross) {
        return <span style={{ color: "red", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block" }}>X</span>
      }

    }

  }


  const getCheckmarkData = async () => {
    const response1 = await request.list1("dailycheckmark", 
    { data: JSON.stringify({ EMPID: EMPID, date: (new Date().getFullYear()) })});
    
    setCalendarCheckmark(response1.result)
  }

  const onDayClick = async (value, event) => {
    let date = (value.toISOString().split('T')[0])
    await request.create("dailycheckmark", {
       EMPID :   EMPID, Date: date 
    
  });
    getCheckmarkData()
  }

  useEffect(() => {

    (async () => {
      getCheckmarkData()
      const response = await request.list1("admin-one", { data: JSON.stringify({
        EMPID: EMPID
      }) });
      let result = (response.result)[0];
      if (result) {

        let wdays = days.slice(days.indexOf(result.StartDay), days.indexOf(result.StartDay) + 5)
        setWQ5508WorkingDays(wdays)
        setWQ1075WorkingDays(wdays)

        // weeks
        let WQ5508WeekList = [];
        let WQ1075WeekList = [];


        for (let i = 1; i < 5; i++) {

          WQ5508WeekList.push(WQ5508Work['Week' + i])
          WQ1075WeekList.push(WQ1075Work['Week' + i])
        }

        setWeeksWQ5508(WQ5508WeekList)
        setWeeksWQ1075(WQ1075WeekList)

        if (WQ5508Work.AdminAssignedBadge) {
          let badgesList = badges;
          let selected = badges.filter(badge => badge.index == WQ5508Work.AdminAssignedBadge)[0]

          if (selected) {
            badgesList[selected.index - 1].active = true
            badgesList[selected.index - 1].notes = WQ5508Work.Notes

            setSelectedBadge(selected)

            setBadges([])
            setTimeout(() => setBadges([...badgesList]), 1000)


          }
        }

      }
    })()


  }, [WQ5508Work, WQ1075Work, EMPID])


  useEffect(() => {
  }, [KPI])

  const onChange = (date) => {
    setValue(date)
  }

  const onBageAssigned = async (index) => {

    // let badgeIndex = badges.findIndex(badge => badge.index = index);
    let badgeList = badges;

    badgeList.map((badge) => {
      if (badge.index != index) {
        badge.active = false
      }
    })

    badgeList[index - 1].active = !badgeList[index - 1].active;

    let response;
    if (badgeList[index - 1].active) {
      setSelectedBadge(badgeList[index - 1])
      response = await request.update("wq5508Work", EMPID, { AdminAssignedBadge: badgeList[index - 1].index });
      notes(EMPID, badgeList[index - 1].text)

    } else {
      setSelectedBadge({})
      response = await request.update("wq5508Work", EMPID, { AdminAssignedBadge: null });
    }


    setBadges(null)
    setTimeout(() => setBadges(badgeList), 0)
  }

  const ratingChanged = (newRating) => {
    setWQ5508Rating(newRating)
    onRatingChanged(EMPID, newRating)
  };

  useEffect(async () => {
    let year = (new Date().getFullYear())

    // console.log(calendar)
    const { result: calendar } = await request.listinlineparams('billingcalendarstaff1', { year: year, date_column: "ReportDate", EMPID: user.EMPID })
    setCalendar(calendar)


  }, [user])

  return (
    <Col className="gutter-row topcard" >
      <div
        className="whiteBox shadow"
        style={{ color: "#595959", fontSize: 13 }}
      >
        <div
          className="pad5 strong"
          style={{ textAlign: "left", justifyContent: "center" }}
        >
          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">
            {
              selectedBadge.badge ?
                <span >
                  {/* <p data-tip={} style={{ display: "contents" }}>
                  </p> */}
                  <TP title ={selectedBadge.notes}>
                  <img  src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px", left: "12px" }}></img>


                  </TP>
                  {/* <img   src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px" , left: "12px" }}></img> */}

                  {/* <p data-tip="hello world">T</p> */}
                </span>

                : null
            }
            {title}
            {
              WQ5508Work.Badge ?
                <img height="30" width="23" className="scale3" src={SealOfExellence} style={{ marginLeft: "10px" }}></img>
                : null
            }
          </h3>

          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
            {
              user ?

                user.Avatar && user.Avatar != "null" ?
                  <img src={user.Avatar} style={{ filter: user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
                  :
                  <img src={logo} style={{ borderRadius: "0px", filter: user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
                : null
            }
          </div>
          <div className="badges">
            <Row gutter={[0, 0]}>
              <Col className="gutter-row" span={12} >
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQ1075.map(week => {
                        return <img src={Autumn} className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginRight: "5px" }} />
                      })
                    }
                    {/* <img src={ExternalPumpkin}  height="18" width="18" style={{ filter: "grayscale(100%)",  marginRight: "5px"}}/>
                    <img src={ExternalPumpkin}  height="18" width="18" style={{ filter: "grayscale(100%)", marginRight: "5px"}}/>
                    <img src={ExternalPumpkin}  height="18" width="18" style={{ filter: "grayscale(100%)", marginRight: "5px"}}/> */}
                  </span>
                </div>
              </Col>
              <Col className="gutter-row" span={12} style={{ textAlign: "right" }}>
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQ5508.map((week, index) => {
                        return <img src={Autumn} key={index} className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginLeft: "5px" }} />
                      })
                    }
                  </span>
                </div>

              </Col>
            </Row>
          </div>
        </div>

        <Divider style={{ padding: 0, margin: 0, borderColor: "#dbdbdb" }}></Divider>
        <div >
          <Row gutter={[0, 0]} style={{ padding: "0px 6px" }}>
            <Col className="gutter-row top-card-left" span={12} style={{ textAlign: "left", paddingBottom: "5px" }}>
              <div className="text-center">
                <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>WQ1075</div>

                    <div className="text-center">
                      <img src={StarBadge} height="40" width="40" style={{filter:  wq1075bonusprod >= 1  && ((kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0) >= 1)? 'hue-rotate(292grad) grayscale(0.4)':  "grayscale(100%)" , opacity:  wq1075bonusprod >= 1  && ((kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0) >= 1)? '0.9':  "0.4" }}></img>
                    </div>
                    {
                      user.SpecialAccess !=  1 ?
                        <ProgressChart percent={(percent2)} height={80} width={60} customClassName={"liquid"} data={{toDo: (kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0), count: wq1075count, workable: wq1075workable, nonworkable: wq1075nonworkable , bonusprod :wq1075bonusprod , bonusprod3177: wq3177bonusprod, wqAudit: wqPBAudit, SubSection: "PB" , user: user}} text={"Work Done"} />
                      : null
                    }

                   

          <div style={{textAlign: "center"}}>


          <div className="cabinet-container" >
              <div style={{ height: "110px", width: "110px", margin: "auto" }}>
                  <div style={{position: "absolute"}}>
                    <p className="amount-container charges-container digital">{
                      (('0000' + percent4).substr(-4)).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    } </p>
                  </div>
                   <div style={{position: "absolute"}}>
                    <img src={Cabinet} ></img>  
                    </div>   
                  <p className="general-label charges" >Claims To Do</p>


              </div>
            </div>
            </div>


                <div style={{ textAlign: "center" }}>
                  <div className="counter-container" >
                    <div style={{ height: "84px" }}>
                      <div>
                        <p className="amount-container digital">
                          {
                            (parseInt(kpi2 ? JSON.parse(kpi2)['sessAmount'] : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                          }
                        </p>
                        <p className="general-label">$ Amount Removed</p>
                      </div>
                      <div>
                        <p className="total-container digital">{kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0}</p>
                        <p className="general-label">Claims Processed</p>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  KPI.wq1075 && KPI.wq1075.length > 0 ?
                    
                    <div style={{ textAlign: "left !important", marginTop: "20px" }}>
                      <div >
                        <DemoLine data={KPI.wq1075} />
                      </div>

                    </div>
                    : (
                      <div className="empty-aging-days-pb" style={{
                        padding: "5px",
                        width: "92px",
                        margin: "auto",
                        display: "flex",
                        marginTop: "20px",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="60" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label" style={{ marginTop: "5px" }}>Claims Processed</p>


                {
                  KPI.wq1075KPIAmount && KPI.wq1075KPIAmount.length > 0 ?
                    <BarChart
                      width={barChartConfig.width}
                      height={barChartConfig.height}
                      data={KPI.wq1075KPIAmount}
                      style={barChartConfig.style}
                    >
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                      <Tooltip content={CustomTooltip}/>
                      <Bar dataKey="value" fill="#25b24a" minPointSize={5}>
                        <LabelList dataKey="value" content={renderCustomizedLabel} />
                      </Bar>
                    </BarChart>

                    : (
                      <div className="empty-aging-days-pb" style={{
                        padding: "5px",
                        width: "92px",
                        margin: "auto",
                        display: "flex",
                        marginTop: "20px",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="60" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label" style={{ marginTop: "-15px" }}>$ Amount Processed</p>
                



                {
                  showCalendar ?
                    <div>
                      <div className="user-members" style={{
                        padding: "5px",
                        width: "92px",
                        margin: "auto",
                        display: "flex",
                        marginTop: "20px",
                        flexDirection: "column",
                        overflow: "hidden"
                      }}>
                        {
                          amountWQ1075 && amountWQ1075.length == 0 ?
                            <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "40%", }}>
                              <img src={CheckerFlags} width="60" height="35" ></img>
                            </div>
                            :
                            amountWQ1075 && amountWQ1075.slice(0, 5).map((amount) => {
                              return <div style={{ fontSize: "10px", minWidth: "65px", lineHeight: "21px", fontWeight: "500", paddingLeft: "8px" }}><DollarTwoTone twoToneColor="#52C41A" style={{ marginRight: "3px" }} /> {
                                (parseInt(amount)).toLocaleString('en-US', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })
                              }</div>
                            })
                        }
                      </div>
                      <p className="barchart-label" style={{ marginTop: "5px" }}>Top $ Amount</p>
                    </div>
                    : null
                }

              </div>
            </Col>


            <Col
              className="gutter-row top-card-right"
              span={12}
              style={{ paddingBottom: "5px" }}
            >
              <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>WQ5508</div>
              <div className="text-center">
                {
                  <img src={StarBadge} height="40" width="40" style={{filter: (wq5508bonusprod >= 1  && (kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0) >= 1) ? 'hue-rotate(292grad) grayscale(0.4)':  "grayscale(100%)",  opacity: (wq5508bonusprod >= 1  && (kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0) >= 1) ? '0.9':  "0.4",  }}></img>
                }
              </div>
              {
                user.SpecialAccess != 1 ? 
                <ProgressChart percent={(percent1)} height={80} width={60} customClassName={"liquid"} data={{toDo: (kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0), count: wq5508count, workable: wq5508workable, nonworkable: wq5508nonworkable , bonusprod :wq5508bonusprod , SubSection : 'PB', user: user}} text={"Work Done"} />
                :  null
              }

<div style={{textAlign: "center"}}> 


           <div className="cabinet-container" >
              <div style={{ height: "110px", width: "110px", margin: "auto" }}>
                  <div style={{position: "absolute"}}>
                    <p className="amount-container charges-container digital">{
                      (('0000' + percent3).substr(-4)).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    } </p>
                  </div>
                   <div style={{position: "absolute"}}>
                    <img src={Cabinet} ></img>  
                    </div>   
                  <p className="general-label charges" >Claims To Do</p>


              </div>
            </div>
</div>

              
              <div style={{ textAlign: "center" }}>
                <div className="counter-container" >
                  <div style={{ height: "84px" }}>
                    <div>
                      <p className="amount-container digital">
                        {
                          (parseInt(kpi1 ? JSON.parse(kpi1)['sessAmount'] : 0)).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        }
                      </p>
                      <p className="general-label">$ Amount Removed</p>
                    </div>
                    <div>
                      <p className="total-container digital">{kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0}</p>
                      <p className="general-label">Claims Processed</p>
                    </div>
                  </div>
                </div>
              </div>

              {
                KPI.wq5508 && KPI.wq5508.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={KPI.wq5508} />
                    </div>

                  </div>

                  : (
                    <div className="empty-aging-days-pb" style={{
                      padding: " 5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "20px",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "5px" }}>Claims Processed</p>

              {
                KPI.wq5508KPIAmount && KPI.wq5508KPIAmount.length > 0 ?
                  <BarChart
                    width={barChartConfig.width}
                    height={barChartConfig.height}
                    data={KPI.wq5508KPIAmount}
                    style={barChartConfig.style}
                  >
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                    <Tooltip content={CustomTooltip}/>
                    <Bar dataKey="value" fill="#25b24a" >
                      <LabelList dataKey="value" content={renderCustomizedLabel} />
                    </Bar>
                  </BarChart>

                  : (
                    <div className="empty-aging-days-pb" style={{
                      padding: " 5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "20px",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "-15px" }}>$ Amount Processed</p>
              



              {
                showCalendar ?
                  <div>
                    <div className="user-members" style={{
                      padding: " 5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "20px",
                      flexDirection: "column"
                    }}>
                      {
                        amountWQ5508 && amountWQ5508.length == 0 ?
                          <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "40%", }}>
                            <img src={CheckerFlags} width="60" height="35"></img>
                          </div>
                          :
                          amountWQ5508 && amountWQ5508.map((amount) => {
                            return <div style={{ fontSize: "10px", minWidth: "65px", lineHeight: "21px", fontWeight: "500", paddingLeft: "8px" }}><DollarTwoTone twoToneColor="#52C41A" style={{ marginRight: "3px" }} /> {
                              (parseInt(amount)).toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })
                            }</div>
                          })
                      }
                    </div>
                    <p className="barchart-label" style={{ marginTop: "5px" }}>Top $ Amount</p>
                  </div>
                  : null
              }
            </Col>

            <div
              className="pad5 strong"
              style={{ textAlign: "left", justifyContent: "center", width: "100%", padding: "0px 0px 10px", marginBottom: "10px" }}
            >
              <div className="badges text-center">
                <Row gutter={[0, 0]}>
                  <Col className="gutter-row" span={12} >
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQ1075WorkingDays.map(day => {
                            return WQ1075Work[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
                          })
                        }

                      </span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={12} style={{ textAlign: "right" }}>
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQ5508WorkingDays.map(day => {
                            return WQ5508Work[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
                          })
                        }
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {
              showCalendar && calendar ?
                <Col span={24} style={{ padding: "9px" }} inputRef={(ref) => {
                  this.calendar = ref

                }}>

                  <Calendar
                    calendarType="US"
                    next2Label={null}
                    prev2Label={null}
                    maxDate={new Date(`${new Date().getFullYear()}-12-31`)}
                    onDrillUp={() => console.log('y')}
                    minDate={new Date(`${new Date().getFullYear()}-01-01`)}
                    tileDisabled={disableTile}
                    tileContent={tileContent}
                    onClickDay={onDayClick}
                    onViewChange={(e) => console.log(e)}
                    value={value}
                  />
                </Col>
                : null
            }

            {
              showBadge ?
                <Col span={24} style={{ display: "flex", marginBottom: "15px", marginTop: "10px", textAlign: "center" }} >
                  {
                    badges && badges.length > 0 && badges.map((badge, index) => {
                      if (badge.active) {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{}} />

                      } else {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{ filter: !badge.active ? "grayscale(100%)" : "", opacity: !badge.active ? "0.35" : "" }} />

                      }
                    })
                  }
                </Col>
                : null
            }
          </Row>
        </div>
      </div>
    </Col>
  );
};


