import React, { useCallback, useEffect, useState } from "react";

import { Column, } from "@ant-design/charts";
import { request } from "@/request";
import moment from "moment-timezone";
import {  Row, Col, Select } from "antd";

export default function WQ1075KPIsChart() {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState('Total Charges');

  let columnData = [];


  useEffect(async () => {
    asyncFetch(value);
  }, [value]);


  const asyncFetch = async (value, user) => {

    var [data] = await Promise.all([request.list("wq1075kpis", { value })]);
    let KPI = data

    KPI.result.map((d) => {
      columnData.push({
        name: d.answers,
        value: d['value'],
        month: d['date'].split('T')[0]
      })
    })

    setData(columnData.reverse())

  };


  const onChange = e => {
    setData([])
    setValue(e);
  };



  return (
    <div>

      <div style={{
        position: "absolute",
        marginTop: "-40px",
        fontWeight: "500"
      }}>
        WQ 1075 KPIs
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-45px" }}>
        <Select style={{ width: "150px", zIndex: 1000, marginRight: "15px", textAlign: "left" }} className="shadow" value={value} onChange={(e) => {
          setValue(e)
          onChange(e)
        }}>

          <Option value={'Total Charges'}>Total Charges</Option>
          <Option value={'Total Minutes'}>Total Minutes</Option>
          <Option value={'Total Cost'}>Total Cost</Option>

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
                autoRotate: true,
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                },
                formatter: (data, item) => {
                  let [yy, mm, dd] = data.split('-')
                  return moment(data).format('ddd') + ", " + mm + "/" + dd + "/" + yy
                },

              },


            },
            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
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
                'R': true,
                'S': true,
                'SOC': true
              },
            },

            slider: {
              start: data.length > 60 ? 0.98 : 0.5,
              end: 1,
            },
            color: ["#0CC4E7", "#96ded1", "#add8e6"],
          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
}
