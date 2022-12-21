

import React, { useRef, useState, useEffect } from "react";
import {  Divider, Tag, Row, Col, Button, notification, Radio, Select, DatePicker  } from "antd";

import { Column, Liquid, Line, Pie, Gauge,} from "@ant-design/charts";
import { request } from "@/request";

import { DashboardLayout } from "@/layout";
import Socket from "../../socket";
import CheckmarkCalendar from "@/components/Calendar";
const { RangePicker } = DatePicker;

import FlowchartSpeed from "@/components/FlowchartSpeed";
import DailyStartFinish from "@/components/DailyStartFinish";
import TotalProductivity  from "@/components/TotalProductivity";
import DemoColumn from "@/components/DemoColumn";
import DailyWQData from "@/components/DailyWQData";


const DemoColumn1 = () => {


  const [data, setData] = useState([]);
  const [value, setValue] = React.useState("1075");
  const [dates, setDates] = useState([])

  useEffect(() => {
    asyncFetch(value, dates);
  }, []);

  const asyncFetch = async (value, dates) => {

   

    let columnData = [];
    const [dailyProgress] = await Promise.all([request.list("dailyprogress", { id: value , dates: JSON.stringify(dates)})]);

    dailyProgress.result.map((d) => {

      columnData.push({
        name: "Count Removed",
        value: d['CHG_SESS_CNT_REMVD'],
        month: d['HX_DATE'].split('T')[0]
      })

      columnData.push({
        name: "Count Added",
        value: d['CHG_SESS_CNT_ADDED'],
        month: d['HX_DATE'].split('T')[0]
      })


      columnData.push({
        name: "EOD Count",
        value: d['CHG_SESS_CNT_EOD'],
        month: d['HX_DATE'].split('T')[0]
      })

    })

    setData(columnData.reverse())

  };
  var config = {
    data: data,
    isGroup: true,
    isStack: false,
    xField: "month",
    yField: "value",
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          size: 6,
          fontWeight: "bold"
        }
      },
    },
    yAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          size: 6,
          fontWeight: "bold"
        }
      },
    },
    dodgePadding: 1.8,
    barWidthRatio: 0.8,
    seriesField: "name",
    label: {
      content: function content(item) {
        return item.value
      },
    },
    legend: {
      selected: {
        'Count Added': false,
        'Count Removed': false
      },
    },
    slider: {
      start: 0,
      end: 1,
    },
    color: ["#0CC4E7", "#BE253A", "#04A151"],
  };

  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, dates);

  };

  const onChangeDatePicker = (date, dates) => {
    setData([])
    setDates(dates)
    asyncFetch(value, dates)

  }

  return (
    <div>
      <div className="bar-chart-switcher-container">
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'1075'}>1075</Radio>
          <Radio value={'5508'}>5508</Radio>
        </Radio.Group>
      </div>
      <div style={{height: "400px"}}>
      {
        data.length > 0 ?
          <Column {...config} />
          : "loading..."
      }
      </div>
      
      {/*  */}
      <div>
        <div className="start inline w-50">
          <RangePicker style={{marginTop: "-4px"}} onChange={onChangeDatePicker} />
        </div>
        <div className="end inline w-50">
          <span className="italic1 ft-12" >* Data Source: EPIC.</span>
      </div>
      </div>
    </div>

  )
};


const KPIEODCharges = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');

  let columnData = [];


  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].First)
      setUsers(usersList)
      asyncFetch(value, usersList[0].First);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", { user })]);
    let KPI = totalkpisyear

    KPI.result.map((d) => {


        columnData.push({
          name: "WQ1075",
          value: d['WQ1075EODCharges'],
          month: d['ActionTimeStamp'].split('T')[0]
        })

        columnData.push({
          name: "WQ5508",
          value: d['WQ5508EODCharges'],
          month: d['ActionTimeStamp'].split('T')[0]
        })

        columnData.push({
          name: "Total Charges",
          value: d['WQ1075EODCharges'] + d['WQ5508EODCharges'],
          month: d['ActionTimeStamp'].split('T')[0]
        })

      
    })

    setData(columnData.reverse())

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
       Daily EOD Claims
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-45px" }}>
        <Select style={{ width: "150px", zIndex: 1000, marginRight: "15px", textAlign: "left" }} className="shadow" value={user} onChange={(e) => {
          setUser(e)
          onChangeUser(e)
        }}>

          {
            users.filter((u) => u.First != 'Bernadette').map((user) => {
              return <Option value={user.First}>{user.First}</Option>
            })
          }

        </Select>
   

      </div>
  

{
        data.length > 0 ?
          <Column {...{
            data: data,
            height: 380,
            isGroup: true,
            isStack: false,
            xField: "month",
            yField: "value",
            xAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            dodgePadding: 1.8,
            barWidthRatio: 0.8,
            seriesField: "name",
            label: {
              content: function content(item) {
                return item.value 
              },
            },
            legend: {
              selected: {
                'Total Charges': true,
                'WQ5508': false,
                'WQ1075': false
              },
            },

            slider: {
              start: data.length > 60 ? 0.93 : 0.5,
              end: 1,
            },
            color: ["#0CC4E7", "#96ded1", "#add8e6"  ],
          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};


const AllKPIGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let KPI = totalkpisyear.result;

    let obj = {
      wq5508KPI: (KPI.map(res => ({
        value: res.WQ5508ChargesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (KPI.map(res => ({
        value: res.WQ1075ChargesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (KPI.map(res => ({
        value: res.WQ1075ChargesProcessed + res.WQ5508ChargesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }


    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Total Claims Processed
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};


const KPIAccountGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].First)
      setUsers(usersList)
      asyncFetch(value, usersList[0].First);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let items = totalkpisyear.result;

    let dates = items.map((item) => item['ActionTimeStamp'])
    dates = [...new Set(dates)]; 

    
    let entries = []
    let empIds =  usersList.map((u) => ({EMPID: u.EMPID, name: u.First}))

      dates.map((date, index) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        
        if (new Date(row[0]['ActionTimeStamp']).getDay() == 4) {
          
          let startDate = (date.split('T')[0])
          let lastDate = dates.slice(index, index + 6).reverse()[0].split('T')[0]

          let row1 = items.filter((item) => new Date(item['ActionTimeStamp']) >= new Date(lastDate) && new Date(item['ActionTimeStamp']) <= new Date(date) )
        
          empIds.map((e, i) => {
            let Obj = {}          
            let r1 = row1.filter((ro) => ro.User == e.name)
            Obj['ActionTimeStamp']=  startDate   
            Obj['WQ5508AccountsProcessed'] = Math.floor((r1.reduce((a,b) => a + b['WQ5508AccountsProcessed'],0))),
            Obj['WQ1075AccountsProcessed'] =Math.floor ((r1.reduce((a,b) => a + b['WQ1075AccountsProcessed'],0))) 
            Obj['User'] = e.name
            entries.push(Obj)
          })
        } 
      })


    let obj = {
      wq5508KPI: (entries.map(res => ({
        value: res.WQ5508AccountsProcessed/5 ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (entries.map(res => ({
        value: res.WQ1075AccountsProcessed /5 ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (entries.map(res => ({
        value: (res.WQ1075AccountsProcessed + res.WQ5508AccountsProcessed)/ 5,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Daily Account Averages per Week
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};


const KPIChargesGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].First)
      setUsers(usersList)
      asyncFetch(value, usersList[0].First);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let items = totalkpisyear.result;

    let dates = items.map((item) => item['ActionTimeStamp'])
    dates = [...new Set(dates)]; 

    
    let entries = []
    let empIds =  usersList.map((u) => ({EMPID: u.EMPID, name: u.First}))

      dates.map((date, index) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        
        if (new Date(row[0]['ActionTimeStamp']).getDay() == 4) {
          
          let startDate = (date.split('T')[0])
          let lastDate = dates.slice(index, index + 6).reverse()[0].split('T')[0]

          let row1 = items.filter((item) => new Date(item['ActionTimeStamp']) >= new Date(lastDate) && new Date(item['ActionTimeStamp']) <= new Date(date) )
        
          empIds.map((e, i) => {
            let Obj = {}          
            let r1 = row1.filter((ro) => ro.User == e.name)
            Obj['ActionTimeStamp']=  startDate   
            Obj['WQ5508ChargesProcessed'] = Math.floor((r1.reduce((a,b) => a + b['WQ5508ChargesProcessed'],0))),
            Obj['WQ1075ChargesProcessed'] =Math.floor ((r1.reduce((a,b) => a + b['WQ1075ChargesProcessed'],0))) 
            Obj['User'] = e.name
            entries.push(Obj)
          })
        } 
      })


    let obj = {
      wq5508KPI: (entries.map(res => ({
        value: res.WQ5508ChargesProcessed/5 ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (entries.map(res => ({
        value: res.WQ1075ChargesProcessed /5 ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (entries.map(res => ({
        value: (res.WQ1075ChargesProcessed + res.WQ5508ChargesProcessed)/ 5,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Daily Claims Averages per Week
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};


const KPIAccountGraphV1 = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].First)
      setUsers(usersList)
      asyncFetch(value, usersList[0].First);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let items = totalkpisyear.result;

    let dates = items.map((item) => item['ActionTimeStamp'])
    dates = [...new Set(dates)]; 

    
    let entries = []
    let empIds =  usersList.map((u) => ({EMPID: u.EMPID, name: u.First}))

      dates.map((date, index) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        
        if (new Date(row[0]['ActionTimeStamp']).getDay() == 4) {
          
          let startDate = (date.split('T')[0])
          let lastDate = dates.slice(index, index + 6).reverse()[0].split('T')[0]

          let row1 = items.filter((item) => new Date(item['ActionTimeStamp']) >= new Date(lastDate) && new Date(item['ActionTimeStamp']) <= new Date(date) )
          
          empIds.map((e, i) => {
            let Obj = {}          
            let r1 = row1.filter((ro) => ro.User == e.name)
            Obj['ActionTimeStamp']=  startDate   
            Obj['WQ5508AccountsProcessed'] = Math.floor((r1.reduce((a,b) => a + b['WQ5508AccountsProcessed'],0))),
            Obj['WQ1075AccountsProcessed'] =Math.floor ((r1.reduce((a,b) => a + b['WQ1075AccountsProcessed'],0))) 
            Obj['User'] = e.name
            entries.push(Obj)
          })
        } 
      })


    let obj = {
      wq5508KPI: (entries.map(res => ({
        value: res.WQ5508AccountsProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (entries.map(res => ({
        value: res.WQ1075AccountsProcessed ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (entries.map(res => ({
        value: (res.WQ1075AccountsProcessed + res.WQ5508AccountsProcessed),
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Weekly Accounts Processed Totals
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};

const KPIChargesGraphV1 = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].First)
      setUsers(usersList)
      asyncFetch(value, usersList[0].First);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let items = totalkpisyear.result;

    let dates = items.map((item) => item['ActionTimeStamp'])
    dates = [...new Set(dates)]; 

    
    let entries = []
    let empIds =  usersList.map((u) => ({EMPID: u.EMPID, name: u.First}))

      dates.map((date, index) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        
        if (new Date(row[0]['ActionTimeStamp']).getDay() == 4) {
          
          let startDate = (date.split('T')[0])
          let lastDate = dates.slice(index, index + 6).reverse()[0].split('T')[0]

          let row1 = items.filter((item) => new Date(item['ActionTimeStamp']) >= new Date(lastDate) && new Date(item['ActionTimeStamp']) <= new Date(date) )
         
          empIds.map((e, i) => {
            let Obj = {}          
            let r1 = row1.filter((ro) => ro.User == e.name)
            Obj['ActionTimeStamp']=  startDate   
            Obj['WQ5508ChargesProcessed'] = Math.floor((r1.reduce((a,b) => a + b['WQ5508ChargesProcessed'],0))),
            Obj['WQ1075ChargesProcessed'] =Math.floor ((r1.reduce((a,b) => a + b['WQ1075ChargesProcessed'],0))) 
            Obj['User'] = e.name
            entries.push(Obj)
          })
        } 
      })


    let obj = {
      wq5508KPI: (entries.map(res => ({
        value: res.WQ5508ChargesProcessed ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (entries.map(res => ({
        value: res.WQ1075ChargesProcessed ,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (entries.map(res => ({
        value: (res.WQ1075ChargesProcessed + res.WQ5508ChargesProcessed),
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Weekly Charges Processed Totals
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};

const AllKPIAmountGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let KPI = totalkpisyear.result;

    let obj = {
      wq5508KPI: (KPI.map(res => ({
        value: res.WQ5508AmountRemoved,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (KPI.map(res => ({
        value: res.WQ1075AmountRemoved,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (KPI.map(res => ({
        value: res.WQ1075AmountRemoved + res.WQ5508AmountRemoved,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }


    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
       Total $ Amount Processed
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: (datum.value > 1000000 ? parseFloat(datum.value / 1000000).toFixed(1) + "M" : ( (datum.value / 1000).toFixed(1)).toString().split('.')[1] == "0" ? (parseInt(datum.value / 1000))  +  "K" : (datum.value / 1000).toFixed(1)  + "K") };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};


const AllKPIAccountGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let KPI = totalkpisyear.result;

    let obj = {
      wq5508KPI: (KPI.map(res => ({
        value: res.WQ5508AccountsProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wq1075KPI: (KPI.map(res => ({
        value: res.L,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (KPI.map(res => ({
        value: res.WQ1075AccountsProcessed + res.WQ5508AccountsProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }


    if (value == '1075') {
      setData(obj.wq1075KPI.reverse())
    } else if (value == "5508") {
      setData(obj.wq5508KPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
       Total Accounts Processed
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'1075'}>WQ1075</Radio>
          <Radio value={'5508'}>WQ5508</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
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

  const [totalProductivity, setTotalProductivity] = useState(0);
  const [totalWQ1075Productivity, setTotalWQ1075Productivity] = useState(0);
  const [epicData, setEpicData] = useState([])
  const [usersList, setUsersList] = useState([])

  useEffect(() => {

    load()

  }, [])

  const load = () => {
    (async () => {

      const [wq5508Progress, wq1075Progress, dailyProgress] = await Promise.all([request.list("wq5508progress"), request.list("wq1075progress"), request.list("dailyprogress")]);

      let wq5508 = wq5508Progress.result;
      let wq1075 = wq1075Progress.result;
      setEpicData(dailyProgress.result)

      let sumwq5508 = 0;
      let sumwq1075 = 0;

      for (let i = 0; i < wq5508.length; i++) {
        sumwq5508 +=  wq5508 ? +wq5508[i].ChargesProcessed : 0;
        sumwq1075 += wq1075[i] ?  +wq1075[i].ChargesProcessed : 0;
      }

      setTotalWQ1075Productivity(((sumwq1075 / (wq1075.length * 100)) * 100).toFixed(2))
      setTotalProductivity(((sumwq5508 / (wq5508.length * 100)) * 100).toFixed(2))

      const response = await request.list("admin");
      setUsersList(response.result.filter((re) => re.ManagementAccess != 1))

    })()
  }


  return (
    <DashboardLayout style={dashboardStyles}>

      <Row gutter={[24, 24]}>
       

       
      
      <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" >
              <DemoColumn />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" >

              <DemoColumn1 />
            </div>
          </div>
        </Col>


      <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              <AllKPIGraph usersList={usersList} />
            </div>
          </div>
        </Col>


        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              {/* <KPIGraphAmounts usersList={usersList} /> */}

              <AllKPIAmountGraph usersList={usersList}> </AllKPIAmountGraph>
            </div>
          </div>
        </Col>


        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              {/* <KPIGraphAmounts usersList={usersList} /> */}

              <AllKPIAccountGraph usersList={usersList}> </AllKPIAccountGraph>
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              {/* <KPIGraphAmounts usersList={usersList} /> */}

              <KPIEODCharges usersList={usersList}> </KPIEODCharges>
            </div>
          </div>
        </Col>


        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >
              <KPIAccountGraphV1 usersList={usersList}/>
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >
              <KPIChargesGraphV1 usersList={usersList}/>
            </div>
          </div>
        </Col>
        
        
        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >
              <KPIAccountGraph usersList={usersList}> </KPIAccountGraph>
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >
              <KPIChargesGraph usersList={usersList}> </KPIChargesGraph>
            </div>
          </div>
        </Col>
        
       



        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "500px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              <TotalProductivity width={148} percent={totalWQ1075Productivity} />
              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQ1075</h1>

            </div>
          </div>
        </Col>
        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "500px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              {/* <Progress type="dashboard" percent={totalProductivity} width={148} /> */}
              <TotalProductivity width={148} percent={totalProductivity} />

              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQ5508</h1>
            
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "60%"}}>
          <div className="whiteBox shadow">
            <div className="pad20 demo-chart-container"  style={{  height: "500px"}}>

              <CheckmarkCalendar />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "100%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "8px" }} >
              <DailyStartFinish usersList={usersList} />
            </div>
          </div>
        </Col> 


        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "505px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "8px" }} >
              <FlowchartSpeed usersList={usersList} entity={'wq5508flowcharthistorical'} defaultValue={'Expedite'} Heading={'WQ5508 Speeds'} options={[
                {value: "Expedite", text: "Expedite"},
                {value: "Standard", text: "Standard"}

              ]}/>
            </div>
          </div>
        </Col> 
        

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "505px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "8px" }} >
              <FlowchartSpeed usersList={usersList} entity={'wq1075flowcharthistorical'} defaultValue={'Speed'} Heading={'WQ1075 Speeds'} options={[
                {value: "Speed", text: "Speed"},

              ]}/>
            </div>
          </div>
        </Col> 

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "505px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "8px" }} >
              <DailyWQData usersList={usersList} entity={'daily-wq-data'} defaultValue={'WQ5508'} Heading={'Daily Start/Finish Non-Compliance'} options={[
                {value: "WQ5508", text: "WQ5508"},
                {value: "WQ1075", text: "WQ1075"}
              ]}/>
            </div>
          </div>
        </Col> 

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "505px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "8px" }} >
              <DailyWQData usersList={usersList} entity={'entire-wq-data'} defaultValue={'WQ5508'} Heading={'Total Start/Finish Non-Compliance'} options={[
                {value: "WQ5508", text: "WQ5508"},
                {value: "WQ1075", text: "WQ1075"}
              ]}/>
            </div>
          </div>
        </Col> 

      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "30px" }}>
        


      </Row>

    </DashboardLayout>
  );
}