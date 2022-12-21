

import React, { useRef, useState, useEffect } from "react";
import {  Radio, Select, DatePicker  } from "antd";

import { Column} from "@ant-design/charts";
import { request } from "@/request";

const { RangePicker } = DatePicker;

export default function DailyWQData({entity, defaultValue, options, usersList= [], Heading=''}) {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [value, setValue] = React.useState(defaultValue);
  const [user, setUser] = useState('');
  const [dates, setDates] = useState([])


  useEffect(async () => {
   
    if(usersList.length > 0) {
      let u = usersList.filter((u) => u.ManagementCard != 1)
      setUsers(u)
      setUser(u[0].Nickname)
      asyncFetch(value, u[0].Nickname, dates);
    }
   

  }, [usersList]);

  const asyncFetch = async (value, user, dates) => {

    if ( !value) {
      return
    }

    let columnData = [];
    const [data] = await Promise.all([request.list(entity, { processType : value ,user, dates: JSON.stringify(dates)})]);

    data.result.map((d) => {
      columnData.push({
        name: value,
        value: d['value'],
        month: d['User']
      })


      
    })

    setData(columnData.reverse())

  };

  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user, dates);
  };


  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e, dates);
  };

  const onChangeDatePicker = (date, dates) => {
    setData([])
    setDates(dates)
    asyncFetch(value, user, dates)

  }

  return (
    <div>

      <div>
    {Heading}
      </div>
      <div className="bar-chart-switcher-container1">
        {
          entity == 'daily-wq-data' ?
      <Select style={{ width: "150px", zIndex: 1000, marginRight: "15px", textAlign: "left" }} className="shadow" value={user} onChange={(e) => {
          setUser(e)
          onChangeUser(e)
        }}>
          {
            users.map((user) => {
              return <Option value={user.Nickname}>{user.Nickname}</Option>
            })
          }

        </Select> 
        : null
        }
       
        <Radio.Group onChange={onChange} value={value}>
          {
            options.map((o) =>{
              return <Radio value={o.value}>{o.text}</Radio>

            })
          }
        </Radio.Group>
      </div>
      {
        data.length > 0 ?

          <Column {...{
            data: data,
            height: 420,
            isGroup: true,
            isStack: false,
            xField: "month",
            yField: "value",
            xAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
                  style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              },
            },
            yAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
                  style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              },
            },
            dodgePadding: 1.8,
            barWidthRatio: 0.8,
            seriesField: "name",
            label: {
              content: function content(item) {
                return item.value > 1000 ? parseInt(item.value / 1000) + " K" : item.value
              },
            },
            
            slider: entity == 'daily-wq-data' ?{
              start: data.length > 60 ? 0.93 : 0.5,
              end: 1,
            }:  null,
           
            color: ["#7e66e8", "#ffe5b4", "#ee7f1b", "#04A151"],
          }} />

          
          : "loading..."
      }

      {
        entity == 'daily-wq-data' ?
        <div className="start inline ">
        <RangePicker style={{marginTop: "-4px" , position: "absolute", bottom: "6px", left: "7px"}} onChange={onChangeDatePicker} />
      </div>
      : null
      }
     

    </div>

  )
}