

import React, { useRef, useState, useEffect } from "react";
import {  Radio, Select, DatePicker  } from "antd";

import { Column} from "@ant-design/charts";
import { request } from "@/request";

const { RangePicker } = DatePicker;

export default function DemoColumn () {


  const [data, setData] = useState([]);
  const [value, setValue] = React.useState("1075");
  const [dates, setDates] = useState([])


  useEffect(() => {
    asyncFetch(value, dates);
  }, []);

  const asyncFetch = async (value, dates) => {

    let columnData = [];
    const [dailyProgress] = await Promise.all([request.list("dailyprogress", { id: value , dates: JSON.stringify(dates) })]);

    dailyProgress.result.map((d) => {

      columnData.push({
        name: "$ Amount Removed",
        value: d['CHG_SESS_AMT_REMVD'],
        month: d['HX_DATE'].split('T')[0]
      })

      columnData.push({
        name: "$ Amount Added",
        value: d['CHG_SESS_AMT_ADDED'],
        month: d['HX_DATE'].split('T')[0]
      })


      columnData.push({
        name: "EOD $ Amount",
        value: d['CHG_SESS_AMT_EOD'],
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
          size: 10,
          fontWeight: "bold"
        }
      },
    },
    yAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          size: 10,
          fontWeight: "bold"
        }
      },
    },
    dodgePadding: 1.8,
    barWidthRatio: 0.8,
    seriesField: "name",
    label: {
      content: function content(item) {
        return item.value > 1000000 ? parseFloat(item.value / 1000000).toFixed(1) + "M" : parseInt(item.value / 1000) + "K"
      },
    },
    legend: {

      selected: {
        '$ Amount Added': false,
        '$ Amount Removed': false
      },
    },
    slider: {
      start: 0,
      end: 1,
    },
    color: ["#0CC4E7", "#BE253A", "#04A151"],
  };

  const onChange = (e) => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value,dates);
  };

  const onChangeDatePicker = (date, dates) => {
    setData([])
    setDates(dates)
    asyncFetch(value, dates)

  }

  return (
    <div >
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