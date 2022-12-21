import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Select,
  Radio,
  Popover,
  Row,
  Col,
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone, SearchOutlined } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date()

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function DataTable({ config }) {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle , userList, showFooter = true, openingModal, confirmModal, AddIcon} = config;
  

  const [users, setUsers] = useState(userList);
  const [process, setProcess] = useState(() => {
    if(entity == "pageLogger") {
      return "ALL"
    } else if (entity == "epic-productivity" || entity == "epic-productivity1") {
      return 'PB' 
    }
  });

  

  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])

  const formatTime = (timer = 0) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
  
    return (
        timer == "-" ?
          "-"
        :

      <div>
        <span >{getHours} </span> :  <span>{getMinutes}</span> : <span>{getSeconds}</span> 
      </div>
    )
  }



  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "DateTime" || obj.dataIndex == "Start Timestamp" || obj.dataIndex == "Finish Timestamp"  ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div>
                {text ? text.split("T")[0]  + " " + (text.split("T")[1] ? text.split("T")[1].substr(0,8) : '')   : ""}
              </div>
            )
          };
        },
      })
    }

    

    if (obj.dataIndex == "Action" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div style={{textAlign: "center"}}>
                <span className="actions" >
                    <span className="actions">
                      <Popover placement="rightTop" content={
                        <div>
                          <p  className="menu-option" onClick={() => openingModal(row)}><span><EditOutlined /></span> Edit</p>
                          <p  className="menu-option" onClick={() => confirmModal(row)}><span><DeleteOutlined /></span> Archive</p>
                        </div>
                      } trigger="click">
                        <EllipsisOutlined />
                      </Popover>
                    </span>
                  </span> 
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "ManagementAccess" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
                {text } 
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "AdminAccess" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
                {text} 
              </div>
            )
          };
        },
      })
    }
   

    if (obj.dataIndex == "DiffinSeconds" || obj.dataIndex == "Duration in Seconds" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div>
                {formatTime(text) }
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "CMPNY_SENIORITY_DT" ||  obj.dataIndex == "TERMINATION_DT" || obj.dataIndex == "HIRE_DT" || obj.dataIndex == "ORIG_HIRE_DT" || obj.dataIndex == "EFFDT"  ) {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            
            children: (
              <div>
                {text ? text.split("T")[0] : ""}
              </div>
            )
          };
        },
      })
    }

    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  const [dateValue, setDateValue] = useState(moment())
  const [tableColumns, setTableColumns] = useState([])
  const dateFormat = 'YYYY/MM/DD';

  const [usersDropdown, setUserDropdown] = useState([])
  const [userFilter, setUserFilter] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [dateFilter, setDateFilter] = useState([])
  const [totalTime,setTotalTime] = useState([
    {
      date: "No Data",
      total: "Please Search!"
    }
  ])

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  
  

  useEffect(async () => {

    if (items.length > 0) {
      getItems(items)

      
      if(entity == "emailLogger") {

       
        if(items && items.length > 0) {

        const [usersList] = await Promise.all([  request.list("emailuserfilter")]);
        let result = usersList.result.result1.filter(user => user.First != 'Admin').map((item) => item['FIRST_NAME'])
        
       
        setUserDropdown(result)
        // setUserDropdown([...new Set( items.map((item) => item['FIRST_NAME']))])

        setDataSource(items)
        }
      } else if(entity == "pageLogger") {
        users.map((user) => { 

          let userItem = items.filter(item => (item.UserName == user.name)) 
          userItem.map((uI, index) => {
   
            if(!sorter[0]) {
              if (userItem[index + 1]) {
                if((Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000 ) > 28800) {
                  uI.DiffinSeconds = "-"
                } else {
                  uI.DiffinSeconds = Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000
                }
  
                return uI
  
                     
              }
            } else if( sorter[0].order == 'descend' ) {
              if (userItem[index + 1]) {
                if((Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000 ) > 28800) {
                  uI.DiffinSeconds = "-"
                } else {
                  uI.DiffinSeconds = Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000
                }
                return uI     
              }
            } else {
                if(userItem[index + 1]) {
                  if((Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000 ) > 28800) {
                    userItem[index + 1].DiffinSeconds = "-"
                  } else {
                    userItem[index + 1].DiffinSeconds = Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000
  
                  }
                  return uI                     
                }
            }
              
          })
        })

        setDataSource(items)

      } else if (entity == "himsteamroster") {
        setDataSource(items)

      } else if( entity == 'epic-productivity') {
        
        const columnsList = [
          {
            title: 'Week Ending Dates',
            width: 150,
            dataIndex: 'UserName',
            key: 'UserName',
            fixed: 'left'
            
          }
        ];

        const rowData = []

        if(items[0].WeekEndingDate ) {
          let usersList =  [...new Set(items.map((item) => item.UserName))];
        let dates = [...new Set(items.map((item) => item.WeekEndingDate.split('T')[0]))];


        for(let i=dates.length -1; i >=0 ; i--) {
          columnsList.push( {
            title: dates[i],
            dataIndex: dates[i],
            key: i + 1,
            width: 120
          },
         )  
        } 
        columnsList.push( {
          title: "Total",
          dataIndex: "Total",
          key: 5,
          width: 120,
          render: (text , row) => {
            return  Object.values(row).splice(1,4).reduce((a,b) => a+b)
          }
        },
       )       


       setTableColumns(columnsList)

        usersList.map((user, index) => {
           let data =  items.filter(item => item.UserName == user)

            let obj = {
              UserName: user
            }
            for(let i=data.length-1; i >= 0  ; i--) {
              let item = data[i].WeekEndingDate.split('T')[0]
              obj[item] = data[i].UnitsReviewed
            }  

            rowData.push(obj)


        })
        setDataSource(rowData)

  
        } 
      
      }
      else if (entity == 'epic-productivity1'){
        
        
        const columnsList = dataTableColumns

        const rowData = []

        if(items[0].WeekEndingDate ) {
          let usersList =  [...new Set(items.map((item) => item.UserName))];
          let dates = [...new Set(items.map((item) => item.WeekEndingDate.split('T')[0]))];


          setDateValue( dates.sort((a,b) => new Date(a) - new Date(b))[0])
          
          usersList.map((user, index) => {
              
              columnsList.push({
                  title: user.length > 20 ? user.substring(0,20) + "..." : user,
                  width: 150,
                  dataIndex: user ,
                  key: user,
                                  
              })

          })

          setTableColumns(columnsList)

          dates.map((date, i) => {
            let obj = {
              WeekEndingDate : date
            }

            let data =  items.filter(item => item.WeekEndingDate.split('T')[0] == date)

            // console.log(data)

            for(let i=0; i<data.length ; i++) {
              let item = data[i].UserName
              obj[item] = data[i].UnitsReviewed

            }
            
            rowData.push(obj)
          })
          
          setDataSource(rowData)
        } 
      }  
    
      if (inCopiedMode) {
        selectAllRows(items)
      }
    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {    
    items = []
    setDataSource([])
  
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    } 

    filteredArray = (filteredArray.map((data) => {
      if(data?.column?.dataIndex == "FIRST_NAME") {
        delete data.column.filters
      }
      
      return data
    }))


    filteredArray = (filteredArray.map((data) => {
      if(data?.column?.dataIndex == "Start Timestamp" || data?.column?.dataIndex == "Finish Timestamp" ) {
        delete data.column.filters
      }
      
      return data
    }))


    setSorter(filteredArray)
    

    if (!filters.hasOwnProperty('UserName') && entity == "pageLogger") {
      filters['UserName'] = process == "ALL" ? users.map((user) => user.name): [process]
    }

    if (!filters.hasOwnProperty('Section') && entity == "himsteamroster") {
      filters['Section'] = ["RB"]
    }
    
    if (!filters.hasOwnProperty('SubSection') && entity == "epic-productivity") {
      filters['SubSection'] = [process]
    }

    if (!filters.hasOwnProperty('WeekEndingDate') && entity == "epic-productivity") {
      filters['WeekEndingDate'] = filters['WeekEndingDate'] ? filters['WeekEndingDate']  : dateValue
    }
    

    if (!filters.hasOwnProperty('SubSection') && entity == "epic-productivity1") {
      filters['SubSection'] = [process]
    }


    const option = {
      page: pagination.current || 1,
      filter: JSON.stringify(filters) || JSON.stringify({}),
      sorter: sorter ? JSON.stringify(filteredArray) : JSON.stringify([])
    };

    filters.sort = (filteredArray);


    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list(entity, option));

  };

  const loadTable = () => {

    items = []
    setDataSource([])

    
    let filterValue = {};
    
    if(entity == "pageLogger") {
      filterValue= { 'UserName': process == "ALL" ? users.map((user) => user.name): [process] }
    } else if (entity == "himsteamroster") {
      filterValue= { 'Section': ["DS"] }
    } else if (entity == "epic-productivity" ) {
      filterValue= { 'SubSection': ["PB"], 'WeekEndingDate': dateValue }
    }  else if ( entity == "epic-productivity1" ) {
      filterValue= { 'SubSection': ["PB"] }
    }
     
    getFilterValue(filterValue);

    


    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: JSON.stringify( filterValue),
      sorter: JSON.stringify([])
    };


    dispatch(crud.list(entity, option));

  }

  useEffect(() => {

    loadTable()

  }, []);



  useEffect(() => {
   items = []
  },[entity])

  useEffect(() => {

    if(dataSource.length == 0) {
      return 
    }

    if (reload) {



      if (previousEntity == entity) {
        handelDataTableLoad(pagination, filters, sorters)
      } else {
        handelDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])



  const columns = newDataTableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }



    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });


  const onProcessChanged = (e) => {
    const value = e.target.value;
    setProcess(value)
    if(entity == 'epic-productivity' || entity == 'epic-productivity1') {
      handelDataTableLoad(1, { 'SubSection': [value] }, {})

    } else {
      handelDataTableLoad(1, { 'UserName': value == "ALL" ? users.map((user) => user.name)  : [value] }, {})
    }
  }

  const onDateChange = (date) => {
    setDateValue(date)
      handelDataTableLoad(1, {'WeekEndingDate': date}, {})
  }

  const fixedColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ];
  
  const fixedData = [];
  for (let i = 0; i < 5; i += 1) {
    fixedData.push({
      key: i,
      name: ['Light', 'Bamboo', 'Little'][i % 3],
      description: 'Everything that has a beginning, has an end.',
    });
  }

  const handleUserChange = (value) => {
    setUserFilter(value)
  }

  const onSelectDateFilter = (value) => {
    setFilterDate(value)
  }

  const getTotal = async() => {
    if(!userFilter && !filterDate) {
      return 
    }

    const response = await request.list('emailLogger-search', {filter: JSON.stringify({
      'FIRST_NAME': userFilter,
      'StartTime' : filterDate
    })})

    let data = (response.result.reverse())

    let dates = ([...new Set(data.map(d => {
      return d['Start Timestamp'].split('T')[0]
    }))])

    let tableData = []
    dates.map((date) => {
       tableData.push({
         date: date,
        total: (data.filter((d) => d['Start Timestamp'].split('T')[0] == date.split('T')[0]).reduce((a,b) => {
          return ( +a +  +b['Duration in Seconds'])
        }, 0)),
         time:  +(data.filter((d) => d['Start Timestamp'].split('T')[0] == date.split('T')[0]).reduce((a,b) => {
          return ( +a +  +b['Duration in Seconds'])
        }, 0))
        })
       }) 
      

       tableData = tableData.map((data)=> {
        // data.total = formatTime(data.total) 
      
        const getSeconds = `0${(data.total % 60)}`.slice(-2)
        const minutes = `${Math.floor(data.total / 60)}`
        const getMinutes = `0${minutes % 60}`.slice(-2)
        const getHours = `0${Math.floor(data.total / 3600)}`.slice(-2)
      
        data.total = getHours + ":" + getMinutes + ":" + getSeconds
        return data
       })

       setTotalTime(tableData)
  }

  return (
    <div className= {"wq-filter1-table"}>
          <Row gutter={[24,24]}>
         
            <Col  style={{width: "calc(100%)"}}>

            

              {
                entity == 'emailLogger' ?
                // <DatePicker defaultValue={moment(dateValue, dateFormat)} onChange={(d, date) => onDateChange(date)}/> :
                  <div>
                    <Row >
                  <Col span={14}>
                  </Col>
                  <Col span={4} style={{padding: "5px", }}>
                   
                    <Select  style={{ width: "100%", textAlign: "left" }} className="shadow-1"  placeholder="User Name" onChange={handleUserChange}>
                      {
                        usersDropdown && usersDropdown.map((user, index) => {
                         return <Option key={index} value={user}>{user}</Option>
                        })
                      }
                    </Select>
                  </Col>
                  <Col span={6} style={{padding: "5px"}}>
                    {/* <DatePicker style={{width: "100%"}} className="shadow-1" onChange={(d, date) => onSelectDateFilter(date)}/>  */}
                    <RangePicker 
                      style={{width: "calc(100% - 60px)"}} className="shadow-1"
                      onChange={(d, date) => onSelectDateFilter(date)}
                    />

                    <Button style={{marginLeft: "8px"}} className="shadow-1" onClick={getTotal}><SearchOutlined/></Button>

                  </Col>

                
                </Row>
                    <Row>
                    <Col span={24} style={{padding: "5px"}}>
                     <div className="shadow-1 "  style={{border: "1px solid lightgrey", height: "90px", marginBottom: "8px"  ,overflow: "auto", padding: "4px", fontWeight: 500, color: totalTime ? "black": "lightgrey" }}>
                          <table className="filtered-table">
                                <thead>

                                  <th style={{width: "130px", display: 'block'}}>  
                                    Date
                                  </th>
                                {
                                  totalTime && totalTime.map((data) => {
                                    return (
                                    
                                      <th>
                                      <span className="table-column">
                                      <span>
                                        {data.date}
                                      </span>
                                    </span>
                                    </th>
                                    ) 
                                  })
                                }     
                                </thead>

                                <tbody>
                                  <td style={{width: "100px"}}>
                                    Total Duration
                                  </td>
                                {
                                  totalTime && totalTime.map((data) => {
                                    return (
                                      <td>
                                      <span className="table-column">
                                      <span>
                                        {data.total}
                                      </span>
                                    </span>
                                    </td>
                                    ) 
                                  })
                                }     
                                  
                                </tbody>
                                    
                           </table>  
                          
                          
                          

                          
                    </div> 
                  </Col>       



                    </Row>
                  </div>  
                
                :
                null

                
                
              }


              
            </Col>
          </Row> 
          
      <Table
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y:  'calc(100vh - 27.7em)' }}
        // scroll={{ x: 2000, y: 500 }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
        summary={(pageData) => {

          let totals = []
          if(pageData.length > 0) {
            let data = pageData.slice()[0]
            let users = (Object.keys(data)).filter(user => user != "WeekEndingDate")
            users.map((user) => {
              let sum = pageData.map(data => (data[user] ? data[user] : 0 )).reduce((a,b) => a + b)
              totals.push(sum)
            })
          }

          return (
              entity == "epic-productivity1" ?
            (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell ><span style={{fontWeight: "bold"}}>Total</span></Table.Summary.Cell>
                  {
                    totals && totals.map((total) => {
                      return (
                        <Table.Summary.Cell> <span style={{fontWeight: 600}}>{ total} </span></Table.Summary.Cell>

                      )
                    })
                  }
                </Table.Summary.Row>
              </Table.Summary>
            )
            : (
              null
            )
          )
        }}
       
        footer={
          () => (
            <Row gutter={[24, 24]} style={{minHeight: "25px "}}>
              <Col style={{ width: "52%" }}>
                
                  {
                    showFooter &&  (entity == "epic-productivity"  ||  entity == "epic-productivity1")  ? 
                          <div>
                            {
                              <Radio.Group value={process} onChange={onProcessChanged}>
                                  <Radio.Button style={{marginRight: "5px"}} value="PB" className="box-shadow">PB</Radio.Button>

                                  <Radio.Button  value={"HB"} className="box-shadow">HB</Radio.Button>
                              </Radio.Group>
                            }
                          </div>
                    : null
                  }

              </Col>
            </Row>
          )
        }
      />
      {/* <Table
      columns={tableColumns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: 2000, y: 500 }}
      bordered
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>Summary</Table.Summary.Cell>
            <Table.Summary.Cell index={1}>This is a summary content</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    /> */}
    </div>
  );
}
