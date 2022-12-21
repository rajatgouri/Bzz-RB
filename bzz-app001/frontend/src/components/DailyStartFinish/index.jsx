

import React, { useRef, useState, useEffect } from "react";
import {  Radio, Select, DatePicker  } from "antd";

import { Column} from "@ant-design/charts";
import { request } from "@/request";

const { RangePicker } = DatePicker;

export default function DailyStartFinish({}) {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [value, setValue] = React.useState("WQ1075Logger");
  const [user, setUser] = useState('');


  useEffect(async () => {
    const response = await request.list("compliance-user");
    setUser(response.result[0].FIRST_NAME)
    setUsers(response.result)
    asyncFetch(value, response.result[0].FIRST_NAME);

  }, []);

  const asyncFetch = async (value, user) => {

    if (!user || !value) {
      return
    }

    let columnData = [];
    const [dailyStartFinish] = await Promise.all([request.list("dailystartfinish", { id: value, user })]);

    dailyStartFinish.result.map((d) => {
      columnData.push({
        name: "Start",
        value: d['Start'],
        month: d['Date'].split('T')[0]
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

      <div>

      </div>
      <div className="bar-chart-switcher-container1">
        <Select style={{ width: "150px", zIndex: 1000, marginRight: "15px", textAlign: "left" }} className="shadow" value={user} onChange={(e) => {
          setUser(e)
          onChangeUser(e)
        }}>
          {
            users.map((user) => {
              return <Option value={user.FIRST_NAME}>{user.FIRST_NAME}</Option>
            })
          }

        </Select>
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'WQ1075Logger'}>WQ1075</Radio>
          <Radio value={'WQ5508Logger'}>WQ5508</Radio>
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
                return item.value
              },
            },
            legend: {
              selected: {
                'Start': true,
              },
            },

            slider: {
              start: data.length > 60 ? 0.93 : 0.5,
              end: 1,
            },
            color: ["#7e66e8", "#ffe5b4", "#ee7f1b", "#04A151"],
          }} />
          : "loading..."
      }

    </div>

  )
};
