import React, { useState , useEffect} from "react";
import { Badge, Calendar, Radio, Col, Row, Typography } from "antd";
import moment from 'moment';
import { FullCalendarLayout } from "@/layout";
import CalendarIcon from "../assets/images/calendar.PNG";
let { request } = require('../request/index')
import { CloseCircleTwoTone, CloseOutlined, ConsoleSqlOutlined, LeftSquareOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { Input, DatePicker, Space, Select, Form } from 'antd';
import { Popover, Button } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { notification } from "antd";
import { selectUsersList } from "@/redux/user/selectors";

const { Option } = Select;


const data = [{
  date: '2021-08-25',
  type: "success",
  content: 'Dummy entry content Aug 25'
}]

export default function CalendarBoard({ editable = true }) {

  const FILTERING_COLUMN = editable ? 'WhenPosted' : 'ReportDate'

  const [source, setSource] = React.useState([]);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(moment());
  const [dateError, setDateError] = useState(false);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState();
  const [billingTeam, setBillingTeam] = useState([])
  const dateFormat = 'YYYY/MM/DD';
  const [renderForm, setRenderForm] = useState(true);
  const [title, setTitle]  =useState('')


  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  

  const dispatch = useDispatch()
  const styles = {
    layout: (editable ? {} : {
      'backgroundColor': '#FFFFFF',
      'marginTop': '-30px'
    }),
    content: (editable ? {
      padding: "30px 40px",
      margin: "20px auto",
      width: "100%",
      maxWidth: "1090px",
    } : {
      padding: "5px 5px",
      margin: "20px auto",
      width: "100%",
      maxWidth: "1260px",
    }
    )
  }


  const getListData = (value, data) => {
    const dayEvents = data.filter(x => {
      const eventDate = moment(x[FILTERING_COLUMN])
      if (eventDate.date() === value.date() && eventDate.month() === value.month() && eventDate.year() === value.year()) {
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


  const dateCellRender = (value) => {
    const listData = getListData(value, source);
    return (
      <React.Fragment>
        <ul className="events">
          {listData.map((item, index) => (

            <li key={item.content} onClick={() => onClickCalendarItem(index, listData)}>
              {
                editable ?
                  (item.Status ? item.Status : item.FirstName + ", " + (item.PayCode.toLowerCase() === "sick" ? item.PayCode : item.PayCode.substring(0, 3).toUpperCase()))  
                  : item.FirstName + " " + item.LastName.substring(0,1)
              }
            </li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  const onClickCalendarItem = (index, data) => {
    setVisible(true)
    setTitle("Edit Entry");
    const personDetails = (data[index])
    setEditMode(true);
    setSelectedId(personDetails.ID);
    setDate(personDetails.WhenPosted.split('T')[0])

    setRenderForm(false)
    setTimeout(() => {
      setRenderForm(true)
      form.setFieldsValue({
        Name: personDetails.FirstName,
        Status: personDetails.PayCode,
      });
    }, 100)

  }

  const load = async () => {

   
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: FILTERING_COLUMN })
    setSource(result.map((res) => {
      res.ReportDate = res.ReportDate.split("T")[0]
      res.WhenPosted = res.WhenPosted.split("T")[0]
      return res
    }))
  }

  React.useEffect(() => {
    load();

    getBillingTeamList()
  }, [month, year])


  const getBillingTeamList = async () => {
    let { result = [] } = await request.list('admin-fulllist')
    result = result.filter(res => res.First.toLowerCase() != "Admin" && res.First.toLowerCase() != "jason")
    setBillingTeam(result)
  }


  const onFinish = async (values) => {
    setVisible(false)
      
      let empDetails = billingTeam.filter((team) => team.EMPID == values.Name)[0]


    if (editMode) {
      await dispatch(crud.update("billingcalendarstaff", selectedId, {  FirstName: empDetails.First, PayCode: values.Status, Status: empDetails.First + ", " + (values.Status.toLowerCase() === "sick" ? values.Status : values.Status.substring(0, 3).toUpperCase()), WhenPosted :  date}))
      notification.success({ message: "Successfully updated on Calendar", duration:3 })
      
    } else {
      let data = { "WhenPosted": date, "ReportDate": date, "Department": empDetails.DEPTNAME, "EmployeeID": empDetails.EMPID, "FirstName": empDetails.First, "LastName": empDetails.Last, "LoginName": empDetails.LoginName, "PayCode": values.Status, "Minutes": 480, "Hours": 8, "Status": empDetails.First +" " + empDetails.Last.substring(0,1)  + ", " + (values.Status.toLowerCase() === "sick" ? values.Status : values.Status.substring(0, 3).toUpperCase()) }
      await dispatch(crud.create("billingcalendarstaff", data))
      notification.success({ message: "Successfully added on Calendar",duration:3 })
    }

    form.resetFields();
    setEditMode(false)
    setSelectedId(null)
    setTitle("Create New Entry")
    load()
  };

  const onFinishFailed = (errorInfo) => {
    notification.error({ message: "Please enter all fields!", duration:3 })
  };


  const handleChange = (value) => {
    // console.log(`selected ${value}`);
  }

  const onDateChanges = (d, dateString) => {


    if(dateString !== "") {
      setDateError(false)
      form.setFieldsValue('Date', dateString)
      return setDate(dateString)
    } else {
      setDateError(true)
      setDate(date)
      form.setFieldsValue('Date', date)

    }
  }

  const onDeleteEntry = async () => {
    await dispatch(crud.delete("billingcalendarstaff", selectedId));
    notification.success({ message: "Successfully deleted from Calendar", duration:3 })
    resetForm()
    setVisible(false)
    load()
  }

  const text = <div><span className="float-left">{title ? title : ''}</span><span className="float-right" onClick={() => handleVisibleChange(false)}><CloseOutlined/></span></div>;
  const content = (

    <div>
      {
        renderForm ?
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            form={form}
          >
            <Form.Item
              label="Name"
              name="Name"
              labelAlign="left"
              rules={[{ required: true, message: 'Please input name!' }]}
            >
              <Select style={{ width: "100%" }} onChange={handleChange}>
                {
                  billingTeam.map((team, index) => {
                    return <Option key={index} value={team.EMPID}>{team.First + " " + team.Last.substring(0,1)}</Option>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label="Status"
              name="Status"
              labelAlign="left"
              rules={[{ required: true, message: 'Please input status!' }]}
            >
              <Input placeholder="Status" />
            </Form.Item>
            {
              !editMode ?
                <Form.Item
                label="Date"
                name="Date"
                labelAlign="left"
                rules={[{ required: true, message: 'Please input Date!' }]}

              >
                <DatePicker style={{ width: "100%" }} onChange={onDateChanges} />
              </Form.Item>
              : 
              <Row gutter={[24, 24]} className="mb-3">
                <Col className="gutter-row" span={7}>
                    <span><i className="text-danger">*</i> Date: </span>
                </Col>
                <Col className="gutter-row" span={17}>
                  <DatePicker style={{ width: "100%" }} defaultValue={moment(date, dateFormat)} onChange={onDateChanges} />
                    {
                      dateError ?
                      <div>
                        <span className="text-danger">Please input Date!</span>
                      </div>
                      : null
                    }
                </Col>
               </Row>   
            }
          
            <Form.Item className="text-right">
              {
                !editMode ?
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                  :
                  <div>
                    <Button style={{float: "left"}} type="danger" htmlType="button" onClick={() => onDeleteEntry()}>
                      Delete
                    </Button>
                    <Button style={{float: "right"}} type="primary" htmlType="submit" disabled={dateError}>
                      Update
                    </Button>
                    
                  </div>
              }
            </Form.Item>
          </Form>
          : null
      }

    </div>
  );

  const handleVisibleChange = visible => {
    if (!visible) {
      resetForm()
    }

    setVisible(visible)

  }



  const resetForm = () => {
    setSelectedId(null)
    setEditMode(false)
    form.resetFields()
    setDate(moment())
    setTitle("Create New Entry")
    setDateError(false)
  }

  return (
    <FullCalendarLayout style={styles}>
      {editable ? <div className="space30"></div> : null}
      <div className={editable ? "whiteBox shadow pad20" : "whiteBox pad20"}>
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          headerRender={({ value, type, onChange, onTypeChange }) => {
            const start = 0;
            const end = 12;
            const monthOptions = [];

            const current = value.clone();
            const localeData = value.localeData();
            const months = [];
            for (let i = 0; i < 12; i++) {
              current.month(i);
              months.push(localeData.monthsShort(current));
            }

            for (let index = start; index < end; index++) {
              monthOptions.push(
                <Select.Option className="month-item" key={`${index}`}>
                  {months[index]}
                </Select.Option>,
              );
            }
            const month = value.month();
            const year = value.year();
            const options = [];
            for (let i = year - 10; i < year + 10; i += 1) {
              options.push(
                <Select.Option key={i} value={i} className="year-item">
                  {i}
                </Select.Option>,
              );
            }
            return (
              <div style={{ padding: 8 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Typography.Title level={4} className="calendar-header">Team Calendar</Typography.Title>
                  </Col>
                  <Col span={12}>
                  <Row gutter={8} className="text-right justify-content-end">
                  <Col>
                    <Select
                      dropdownMatchSelectWidth={false}
                      className="my-year-select"
                      onChange={newYear => {
                        const now = value.clone().year(newYear);
                        onChange(now);
                      }}
                      value={String(year)}
                    >
                      {options}
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      dropdownMatchSelectWidth={false}
                      value={String(month)}
                      onChange={selectedMonth => {
                        const newValue = value.clone();
                        newValue.month(parseInt(selectedMonth, 10));
                        onChange(newValue);
                      }}
                    >
                      {monthOptions}
                    </Select>
                  </Col>
                  <Col>
                    <Button onClick={() => load()}>
                      <i className><ReloadOutlined /></i>
                    </Button>
                    {
                      editable ?
                        <i >
                          <Popover placement="leftTop" title={text} content={content} visible={visible} trigger="click" onVisibleChange={handleVisibleChange}>
                            <Button className="mr-3">
                              <img src={CalendarIcon} height="20" width="20" />
                            </Button>
                          </Popover>
                        </i>
                        : null
                    }
                  </Col>
                </Row>
                  </Col>  
                </Row>
                
              </div>
            );
          }}
          onPanelChange={
            (e) => {
              setMonth(e.month() + 1)
              setYear(e.year())
            }
          }
        />
      </div>
    </FullCalendarLayout>
  );
}
