import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Divider, Input, notification, Tooltip as TP } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import LiquidChart from "@/components/Chart/liquid";
import { request } from "@/request";
import { CheckOutlined, DollarTwoTone, CheckSquareTwoTone, ExclamationCircleTwoTone } from "@ant-design/icons";

import CheckImage from "../../assets/images/check.png";
import Halloween from "../../assets/images/halloween.png";
import logo from "../../assets/images/logo.png";
import { useSelector, useDispatch } from "react-redux";

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
import { selectAuth } from "@/redux/auth/selectors";

const DemoLine = ({ data, value }) => {
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

          <div ><span class="bold text-left"> Date: </span> <span class="text-right"> ${title}</span> </div> 
          <div ><span class="bold text-left">${value}: </span> <span class="text-right"> ${data[0] ? data[0].value : ""}<span> </div> 
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


export default function HBTopCard({ EMPID, kpi1, user, title, hasRN, KPI, percent1 = 0, wq1262count = 0, workable = 0, wq1262bonusprod = 0, nonworkable = 0, wqHBAudit = 0, percent3 = 0, CRB = {}, amountWQ1 = [], feedback = {}, WQ1WorkDone = {}, onRatingChanged, showBadge = false, notes, showCalendar }) {

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [badges, setBadges] = useState([
    { badge: StarBadge, index: 1, active: false, notes: "" },
    { badge: BearBadge, index: 2, active: false, notes: "" },
    { badge: RibbonBadge, index: 3, active: false, notes: "" },
    { badge: ThumbsupBadge, index: 4, active: false, notes: "" },
    { badge: PencilBadge, index: 5, active: false, notes: "" },
    { badge: FireworksBadge, index: 6, active: false, notes: "" }
  ])

  const [selectedBadge, setSelectedBadge] = useState({});
  const [WQ1Rating, setWQ1Rating] = useState(feedback.Stars);
  const [value, setValue] = useState(new Date());
  const [WQ1Work, setWQ1Work] = useState(WQ1WorkDone)
  const [WQ1WorkingDays, setWQ1WorkingDays] = useState([]);

  const [weeksWQ1, setWeeksWQ1] = useState([]);
  const [calendarCheckmark, setCalendarCheckmark] = useState([])
  const [calendar, setCalendar] = useState([])
  const [units, setUnits] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const { current } = useSelector(selectAuth);


  const disableTile = ({ date }) => {
    if ((user.StartDay == 'Sun' && date.getDay() == 5) || (user.StartDay != 'Sun' && date.getDay() == 0) || date.getDay() == 6 || calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)) {
      return true
    }

  }


  const tileContent = ({ date, view }) => {
    let entry = calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)
    if (entry) {
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
      { data: JSON.stringify({ EMPID: EMPID, date: (new Date().getFullYear()) }) });

    setCalendarCheckmark(response1.result)
  }

  const onDayClick = async (value, event) => {
    let date = (value.toISOString().split('T')[0])
    await request.create("dailycheckmark", {
      EMPID: EMPID, Date: date

    });
    getCheckmarkData()
  }

  useEffect(() => {

    (async () => {
      getCheckmarkData()
      const response = await request.list1("admin-one", {
        data: JSON.stringify({
          EMPID: EMPID
        })
      });
      let result = (response.result)[0];
      if (result) {

        let wdays = days.slice(days.indexOf(result.StartDay), days.indexOf(result.StartDay) + 5)
        setWQ1WorkingDays(wdays)

        // weeks
        let WQ1WeekList = [];


        for (let i = 1; i < 5; i++) {

          WQ1WeekList.push(WQ1Work['Week' + i])
        }

        setWeeksWQ1(WQ1WeekList)

        if (WQ1Work.AdminAssignedBadge) {
          let badgesList = badges;
          let selected = badges.filter(badge => badge.index == WQ1Work.AdminAssignedBadge)[0]

          if (selected) {
            badgesList[selected.index - 1].active = true
            badgesList[selected.index - 1].notes = WQ1Work.Notes

            setSelectedBadge(selected)

            setBadges([])
            setTimeout(() => setBadges([...badgesList]), 1000)


          }
        }

      }
    })()



  }, [WQ1Work, EMPID])


  useEffect(() => {
    setUnits(CRB.units)
    setMinutes(CRB.minutes)

  }, [CRB])

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
      response = await request.update("wq1Work", EMPID, { AdminAssignedBadge: badgeList[index - 1].index });
      notes(EMPID)

    } else {
      setSelectedBadge({})
      response = await request.update("wq1Work", EMPID, { AdminAssignedBadge: null });
    }


    setBadges(null)
    setTimeout(() => setBadges(badgeList), 0)
  }

  const ratingChanged = (newRating) => {
    setWQ1Rating(newRating)
    onRatingChanged(EMPID, newRating)
  };

  useEffect(async () => {
    let year = (new Date().getFullYear())

    // console.log(calendar)
    const { result: calendar } = await request.listinlineparams('billingcalendarstaff1', { year: year, date_column: "ReportDate", EMPID: user.EMPID })
    setCalendar(calendar)


  }, [user])

  const saveProductityLogs = async (value, entity) => {
    let obj = {}
    obj[entity] = value

    await request.create('productivity-log', obj)
  }

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


                  <TP title={selectedBadge.notes}>
                    <img src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px", left: "12px" }}></img>

                  </TP>

                </span>

                : null
            }
            {title}
            {
              WQ1Work.Badge ?
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

              <Col className="gutter-row" span={24} style={{ textAlign: "right" }}>
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQ1.map((week, index) => {
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


            <Col
              className="gutter-row top-card-right"
              span={12}
              style={{ paddingBottom: "5px" }}
            >
              <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>WQ1262</div>
              <div className="text-center">
                <img src={StarBadge} height="40" width="40" style={{ filter: wq1262bonusprod >= 1 && ((kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0) >= 1) ? 'hue-rotate(292grad) grayscale(0.4)' : "grayscale(100%)", opacity: wq1262bonusprod >= 1 && ((kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0) >= 1) ? '0.9' : "0.4" }} ></img>
              </div>
              {
                user.EMPID != '2' && user.EMPID != '238589' ?
                  <ProgressChart percent={(percent1)} height={80} width={60} customClassName={"liquid"} data={{ toDo: (kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0), count: wq1262count, workable: workable, nonworkable: nonworkable, bonusprod: wq1262bonusprod }} text={"Work Done"} />
                  : null
              }

              <div style={{ textAlign: "center" }}>


                <div className="cabinet-container" >

                  {
                    hasRN ?
                      <span className="RN-Exclamation">
                        <ExclamationCircleTwoTone twoToneColor="#eb2f96" />
                      </span>
                      : null
                  }

                  <div style={{ height: "110px", width: "110px", margin: "auto" }}>
                    <div style={{ position: "absolute" }}>
                      <p className="amount-container charges-container digital">{
                        (('0000' + percent3).substr(-4)).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      } </p>
                    </div>
                    <div style={{ position: "absolute" }}>
                      <img src={Cabinet} ></img>
                    </div>
                    <p className="general-label charges" >Accounts To Do</p>


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
                      <p className="general-label">Accounts Processed</p>
                    </div>
                  </div>
                </div>
              </div>

              {
                KPI.wq1 && KPI.wq1.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={KPI.wq1} value={'Accts'} />
                    </div>

                  </div>

                  : (
                    <div className="empty-aging-days-hb" style={{
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

              <p className="barchart-label" style={{ marginTop: "5px" }}>Accounts Processed</p>

              {
                KPI.wq1KPIAmount && KPI.wq1KPIAmount.length > 0 ?
                  <BarChart
                    width={barChartConfig.width}
                    height={barChartConfig.height}
                    data={KPI.wq1KPIAmount}
                    style={barChartConfig.style}
                  >
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="value" fill="#25b24a" >
                      <LabelList dataKey="value"
                        content={renderCustomizedLabel}


                      />
                    </Bar>
                  </BarChart>

                  : (
                    <div className="empty-aging-days-hb" style={{
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
                        amountWQ1 && amountWQ1.length == 0 ?
                          <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "40%", }}>
                            <img src={CheckerFlags} width="60" height="35"></img>
                          </div>
                          :
                          amountWQ1 && amountWQ1.map((amount) => {
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

            <Col
              className="gutter-row top-card-right"
              span={12}
              style={{ paddingBottom: "5px" }}
            >
              <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>{user.EMPID == '198610' ? 'WQ Audits' : 'Client Bucket'}</div>
              {
                user.EMPID != '2' && user.EMPID != '238589' ?

                  user.EMPID == '198610' ?

                    <div>

                      <div style={{ textAlign: "center" }}>
                        <div className="counter-container" >
                          <div style={{ height: "84px" }}>
                            <div>
                              <p className="amount-container digital  mt-30">
                                {wqHBAudit}
                              </p>
                              <p className="general-label mt-10">Accounts</p>
                            </div>

                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", marginTop: "85px", fontWeight: 600, marginBottom: "-20px" }}>{'Client Bucket'}</div>

                    </div>
                    :
                    <div>
                      <div className="gap"></div>

                    </div>

                  : null
              }

              <div className="gap2"></div>

              <div style={{ textAlign: "center" }}>
                <div className="counter-container" >
                  <div style={{ height: "84px" }}>
                    <div>
                      <p className="amount-container digital  mt-30">
                        {units}
                      </p>
                      <p className="general-label mt-10">Units</p>
                    </div>

                  </div>
                </div>
              </div>


              <div style={{ textAlign: "center", marginTop: "13px" }}>
                <div className="counter-container" >
                  <div style={{ height: "84px" }}>
                    <div>
                      <p className="amount-container digital mt-30">
                        {minutes}
                      </p>
                      <p className="general-label mt-10">Minutes</p>
                    </div>

                  </div>
                </div>
              </div>

              {
                CRB.unitsG && CRB.unitsG.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={CRB.unitsG} value={'Units'} />
                    </div>

                  </div>

                  : (
                    <div className="empty-aging-days-hb" style={{
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

              <p className="barchart-label" style={{ marginTop: "5px" }}>Units Processed</p>

              {
                CRB.minutesG && CRB.minutesG.length > 0 ?
                  <BarChart
                    width={barChartConfig.width}
                    height={barChartConfig.height}
                    data={CRB.minutesG}
                    style={barChartConfig.style}
                  >
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="value" fill="#25b24a" >
                      <LabelList dataKey="value"
                        content={renderCustomizedLabel}
                        // formatter={renderCustomizedLabel}
                        labelFormatter={function (value) {
                          return `Date: ${value}`;
                        }}
                      />
                    </Bar>
                  </BarChart>

                  : (
                    <div className="empty-aging-days-hb" style={{
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

              <p className="barchart-label" style={{ marginTop: "-15px" }}>Minutes Processed</p>




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
                        amountWQ1 && amountWQ1.length == 0 ?
                          <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "40%", }}>
                            <img src={CheckerFlags} width="60" height="35"></img>
                          </div>
                          :
                          amountWQ1 && amountWQ1.map((amount) => {
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

                  <Col className="gutter-row" span={24} style={{ textAlign: "right" }}>
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQ1WorkingDays.map(day => {
                            return WQ1Work[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
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


