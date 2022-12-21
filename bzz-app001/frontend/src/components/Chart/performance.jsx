import React, {useState, useEffect} from "react";
import {  Select, DatePicker } from "antd";
import moment from "moment";
import { request } from "@/request";
import { Column } from "@ant-design/charts";
import PageLoader from "../PageLoader";

export default function Performance({ className , style, }) {

  
const formatTime = (timer = 0) => {
  const getSeconds = `0${(timer % 60)}`.slice(-2)
  const minutes = `${Math.floor(timer / 60)}`
  const getMinutes = `0${minutes % 60}`.slice(-2)
  const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

  return (
      timer == "-" ?
        "-"
      :

      getHours + ":" + getMinutes + ":" + getSeconds
  )
}



const DemoColumn = () => {


  const [data, setData] = useState([]);
  
  const [user, setUser] = React.useState();
  const [date, setDate] = React.useState(moment());
  const [users, setUsers] = useState([]);
  const dateFormat = 'YYYY/MM/DD';


  useEffect(async () => {
    const [usersList] = await Promise.all([  request.list("emailuserfilter")]);
    let result = usersList.result.result1.filter(user => user.First != 'Admin').map((user) => ({First: user.FIRST_NAME, Last: user.LAST_NAME, EMPID: user.EMPID }))
    let result2 = usersList.result.result2;


    setUser(result[0].EMPID)
    setUsers(result)
    asyncFetch(result[0].EMPID, new Date(date).toISOString().split('T')[0]);




  }, []);

  const asyncFetch = async (EMPID, date) => {

      let columnData = [];
      let options = {
        filter: JSON.stringify({
          EMPID: EMPID,
          date: date ? date : new Date().toISOString().split("T")[0]
        }) 
      }
      const [emailLogger] = await Promise.all([ request.list("emailLogger1", options)]);

      let data = (emailLogger.result)

      let dates = ([...new Set(data.map(d => {
        return d['Start Timestamp'].split('T')[0]
      }))])

    
  
      let tableData = []
      dates.map((date) => {
         tableData.push({
           date: date,
           time:  +(data.filter((d) => d['Start Timestamp'].split('T')[0] == date.split('T')[0]).reduce((a,b) => {
            return ( +a +  +b['Duration in Seconds'])
          }, 0))
          })
       }) 

    
       tableData.map(d=> {
         columnData.push({
           name: "",
           value: d['time'],
           month: d['date']
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
    xAxis : { 
      label: {
        autoHide: true,
        autoRotate: false,
      },  
    },
    dodgePadding:1.8, 
    barWidthRatio: 0.8,
    seriesField: "name",
    label: {
      content: function content(item) { 
        return   (formatTime(item.value)) 
      },
    },
    legend: {
      selected: {
        '$ Amount Added': false,
        '$ Amount Removed': false
      },
    },
    slider: {
      start: 0.5,
      end: 0.99,
    },
    color: ["#0CC4E7", "#BE253A", "#04A151"],
  };

  const onChange = e => {
    setData([])
    setUser(e);  

    asyncFetch(e, date);
  };
  
  const onDateChange = (date, d) => {
    setData([])
    setDate(d);  
    asyncFetch(user, d);
  }


  return (
    <div>
      <div className=" performance-heading" >
        Email Logger Daily Total
      </div>
      <span style={{ color: "white", height: "20px", background: "white",zIndex: "100",width: "20px", marginTop: "7px", position: "absolute" }}>
        .
      </span>
      
      <div className="bar-chart-switcher-container" style={{ textAlign: "end", top: "12px", right: "10px", position: "absolute", zIndex: 1000}}>
              <Select className="shadow-1" value={user} style={{ width: "150px", textAlign:"left", marginRight: "10px" }} onChange={onChange}>
                  {
                    users.map((team, index) => {
                      return <Option key={team.EMPID} value={team.EMPID}>{team.First + " " + team.Last.substring(0,1)}</Option>
                    })
                  }
                </Select>
                {/* <DatePicker defaultValue={moment(date, dateFormat)} onChange={onDateChange} /> */}
      </div>
      <div style={{marginTop: "10px"}}>
      {
        data.length > 0 ? 
          <Column {...config} />
         : 
         <PageLoader/>
      }
      </div>
      
      {/*  */}
    </div>
    
  )
};


  return (
    <div className="whiteBox shadow" style={style}>
      <div  className="pad20 demo-chart-container" >
        
        <DemoColumn />
      </div>
    </div>
  );

}
