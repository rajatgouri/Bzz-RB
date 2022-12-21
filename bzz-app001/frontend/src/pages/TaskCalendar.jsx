import React from "react";
import { Badge, Calendar } from "antd";
import moment from 'moment';
import { FullCalendarLayout } from "@/layout";
import { returnStatement } from "@babel/types";
let {request} = require('../request/index')

const FILTERING_COLUMN = 'WhenPosted'

const data = [{
  date: '2021-08-25',
  type: "success",
  content: 'Dummy entry content Aug 25'
}]

const getListData = (value, data) => {
  const dayEvents = data.filter(x => {
    const eventDate = moment(x[FILTERING_COLUMN])
    if(eventDate.date() === value.date() && eventDate.month() === value.month() && eventDate.year() === value.year()){
      x.content = x.FirstName + ' ' + x.LastName
      x.type = "success"
      return x
    }
  })
  return dayEvents || []
}

function getMonthData(value) {
  if (value.month() === 8) {
    return 1394;
  }
}

function monthCellRender(value) {
  const num = getMonthData(value);
  return num ? (
    <div className="notes-month">
      <section>{num}</section>
      <span>Backlog number</span>
    </div>
  ) : null;
}

export default function TaskCalendar() {

  const [source, setSource] = React.useState([]);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())

  const dateCellRender = (value) => {
    const listData = getListData(value, source);
    return (
      <React.Fragment>
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
      </React.Fragment>
    );
  }

  const load = async () => {
    const {result = []} = await request.listinlineparams('billingcalendarstaff', {month, year, date_column: FILTERING_COLUMN})
   
    setSource(result.map(res => {
      res.ReportDate = res.ReportDate.split("T")[0]
      res.WhenPosted= res.WhenPosted.split("T")[0]
      return res
    }))
  }

  React.useEffect(() => {
      load();
  }, [month, year])


  return (
    <FullCalendarLayout>
      <div className="whiteBox shadow pad20">
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          onPanelChange={
            (e)=>{
              setMonth(e.month() + 1)
              setYear(e.year())
            }
          }
        />
      </div>
    </FullCalendarLayout>
  );
}
