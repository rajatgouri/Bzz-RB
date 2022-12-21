import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import Cabinet from '@/assets/images/Cabinet.png'
import CheckerFlags from "@/assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import { DollarTwoTone } from "@ant-design/icons";
import {  renderCustomizedLabel } from "@/utils/helpers";
import {Badge } from "antd";




export default function Header({ config }) {

  var { amountTotal, totalProcess,donePercent , processPercent,amountList,chartData, users} = config
  const [usersList, setUsersList] = useState([])

  const barChartConfig = {
    width: 115,
    height: 95,
    data: chartData,
    style: {
      display: "inline-block",
      marginRight: "5px",
      marginTop: "10px"
    }
  }

  useEffect(() => {
    let first = users.filter((u) => u.name == "Bernadette" || u.name == 'Heather')
    let second = users.filter((u) => u.name != "Bernadette" && u.name != 'Heather')
    users = second.concat(first)
    setUsersList(users)
    
  }, [users])
  
  return (
        <div className="text-right flex ">

          <div className="counter-container" >
            <div style={{ height: "84px" }}>
              <div>
                <p className="amount-container digital">{
                  (parseInt(amountTotal)).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                } </p>
                <p className="general-label">$ Amount Removed</p>
              </div>
              <div>
                <p className="total-container digital">{totalProcess}</p>
                <p className="general-label">Claims Processed</p>
              </div>
            </div>
          </div>

          <div className="cabinet-container" >
            <div style={{ height: "84px" }}>
              <div style={{ position: "absolute" }}>
                <p className="amount-container charges-container digital">{
                  (donePercent < 9999 ? ('0000' + donePercent).substr(-4) : donePercent).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                } </p>
              </div>
              <div style={{ position: "absolute" }}>
                <img src={Cabinet} ></img>
              </div>
              <p className="general-label charges">Claims To Do</p>


            </div>
          </div>

          <ProgressChart percent={(processPercent * 100).toFixed(2)} text={"Work Done"} />

          {/* {
    amountList && amountList.length > 0 ? */}
          <div className="amount" style={{ padding: "7px 5px 5px 9px", width: "85px" }}>
            <div style={{ height: "84px" }}>

              {
                amountList && amountList.length == 0 ?
                  <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", paddingTop: "40%" }}>
                    <img src={CheckerFlags} width="65" height="35"></img>

                  </div>
                  :
                  amountList && amountList.map((amount) => {
                    return <div style={{ fontSize: "10px", minWidth: "65px", lineHeight: "17px", fontWeight: "500" }}><DollarTwoTone twoToneColor="#52C41A" style={{ marginRight: "3px" }} /> {
                      (parseInt(amount)).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    }</div>
                  })
              }
            </div>
            <p className="general-label mt-4">Amount</p>

          </div>
          <div>

            <div className="chart-container">
              {
                chartData && chartData.length > 0 ?
                  <BarChart
                    width={barChartConfig.width}
                    height={barChartConfig.height}
                    data={chartData}
                    style={barChartConfig.style}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#78e0e1" minPointSize={5}>
                      <LabelList dataKey="value" content={renderCustomizedLabel} />
                    </Bar>
                  </BarChart>
                  :
                  (
                    <div className="empty-aging-days" style={{
                      padding: "5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "5px",
                      flexDirection: "column"
                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                        <img src={CheckerFlags} width="65" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label">Aging Days</p>
            </div>
          </div>

          <div className="user-members" style={{ minWidth: "90px" }}>
            <div style={{ height: "92px", minWidth: "103px", padding: "5px 0px", overflowY: "auto", overflowX: "hidden" }} >
              {
                usersList.map((user) => {
                  return <Badge className="mr-3 text-shadow fnt-10 d-block" status={user.status} text={user.name} />
                })
              }
            </div>

            <p className="general-label mt-4" style={{ marginRight: "-7px" }}>Attendance</p>

          </div>
        </div>
         
  );
}
