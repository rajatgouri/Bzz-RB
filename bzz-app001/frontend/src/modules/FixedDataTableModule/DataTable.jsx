import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Radio,
  Popover,
  Select,
  Row,
  Col,
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import {  } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import {
  SortAscendingOutlined,
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

const {Option} = Select


export default function DataTable({ config }) {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle , userList, showFooter = true, openingModal, confirmModal, AddIcon, openSortModal} = config;
  

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

    if (obj.dataIndex == "DateTime" ||  obj.dataIndex == "Mon" || obj.dataIndex == "Tue" || obj.dataIndex == "Wed" || obj.dataIndex == "Thu" || obj.dataIndex == "Fri" || obj.dataIndex == "Sat" || obj.dataIndex == "Sun" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div>
                {text ? (text.split("T")[1] ? text.split("T")[1].substr(0,8) : '')   : ""}
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
                          <p  className="menu-option" onClick={() => confirmModal(row)}><span><DeleteOutlined /></span> Delete</p>
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


    if (obj.dataIndex == "ManagementAccess" || obj.dataIndex == "AdminAccess" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
                {text  == '1' ? 'Y': 'N'} 
              </div>
            )
          };
        },
      })
    }

    
   

    if (obj.dataIndex == "DiffinSeconds" ) {
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


    if (obj.dataIndex == "CMPNY_SENIORITY_DT" ||  obj.dataIndex == "TERMINATION_DT" || obj.dataIndex == "HIRE_DT" || obj.dataIndex == "ORIG_HIRE_DT" || obj.dataIndex == "EFFDT" ) {
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

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems  );

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  const [dateValue, setDateValue] = useState(moment())
  const [tableColumns, setTableColumns] = useState([])
  const dateFormat = 'YYYY/MM/DD';


  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {

    if (items.length > 0) {
      getItems(items)

      
      
      if(entity == "pageLogger") {
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
                    // uI.DiffinSeconds = Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000
                    userItem[index + 1].DiffinSeconds = Math.abs( new Date(uI.DateTime) -  new Date(userItem[index + 1].DateTime) )/1000
  
                  }
                  return uI                     
                }
            }
              
          })
        })

        setDataSource(items)

      } else if (entity == "himsteamroster" || entity == "himsuserschedule" || entity == "himsmastertasklist" ) {
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
                  title: user.length > 10 ? user.split(' ')[1]     : user,
                  width: 150,
                  dataIndex: user ,
                  key: user       
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

    
    if(entity == "himsteamroster" || entity == "himsuserschedule" || entity == "himsmastertasklist")

    filteredArray = (filteredArray.map((data) => {
      delete data.column.filters  
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
    

    
    // if (!filters.hasOwnProperty('WeekEndingDate') && entity == "epic-productivity1") {
    //   filters['WeekEndingDate'] = filters['WeekEndingDate'] ? filters['WeekEndingDate']  : [dateValue]
    // }
    

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
      filterValue= { 'Section': ["RB"] }
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
    const value = e
    setProcess(value)
    if(entity == 'epic-productivity' || entity == 'epic-productivity1') {
      handelDataTableLoad(1, { 'SubSection': [value] }, {})

    } else {
      handelDataTableLoad(1, { 'UserName': value == "ALL" ? users.map((user) => user.name)  : [value] }, {})
    }
  }

  const onProcessChanged1 = (e) => {

    setProcess(e.target.value)
    handelDataTableLoad(1, { 'SubSection': [e.target.value] }, {})

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


  return (
    <div className= {entity == 'epic-productivity1' ? "wq-fixed-table epic-productivity1" : "wq-fixed-table"}>
          <Row gutter={[24,24]}>
            <Col span={12}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
            <Col span={12}  style={{textAlign :"end"}}>
            {
                entity== 'himsteamroster' ?
                <Button className="ml-3 mr-3" size="small" onClick={() => {
                  openSortModal()
                 }} key={`${uniqueId()}`}>
                   <SortAscendingOutlined />
                 </Button>
                 : null
              }
              {
                AddIcon ? 
                <Button size="small" onClick={() =>openingModal()}>
                  <IdcardOutlined/>
                </Button>
                :  null
              }

              {
                entity == 'epic-productivity' ?
                <DatePicker defaultValue={moment(dateValue, dateFormat)} onChange={(d, date) => onDateChange(date)}/> :
                null
              }
              
            </Col>
          </Row> 
          
      <Table
        columns={(entity == "epic-productivity" || entity == "epic-productivity1")  ?  tableColumns  : columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: entity == 'epic-productivity1' ? 'calc(100vh - 24.5em)'  : 'calc(100vh - 20.5em)' }}
        // scroll={{ x: 2000, y: 500 }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
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
                  {/* <Table.Summary.Cell index={0}>Total</Table.Summary.Cell> */}
                  {/* <Table.Summary.Cell index={1}>This is a summary content</Table.Summary.Cell> */}
                  <Table.Summary.Cell ><span style={{fontWeight: "bold"}}>Total</span></Table.Summary.Cell>

                  {
                    totals && totals.reverse().map((total) => {
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
              <Col style={{ width: "150px" }}>
                {
                    showFooter && entity == "pageLogger"  ? 
                          <div>
                            {
                              
                              <Select value={process} style={{ width: "100%", textAlign: "left" }} className="box-shadow"  placeholder="User Name" onChange={onProcessChanged}>
                                <Option key={100} value="ALL" >ALL</Option>
                                
                                {
                                  users.map((user, index) => {
                                  return <Option key={index} value={user.name}>{user.name}</Option>
                                  })
                                }
                              </Select>
                              // <Radio.Group value={process} onChange={onProcessChanged}>
                              //   {
                              //     users.map(user => {
                              //       return  <Radio.Button style={{marginRight: "5px"}} value={user.name} className="box-shadow">{user.name}</Radio.Button>

                              //     })
                              //   }
                                // <Radio.Button value="ALL" className="box-shadow">ALL</Radio.Button>
                              // </Radio.Group>
                            }
                      
                          </div>
                        
                    : null
                  }

                  {
                    showFooter &&  (entity == "epic-productivity"  ||  entity == "epic-productivity1")  ? 
                          <div>
                            {
                              <Radio.Group value={process} onChange={onProcessChanged1}>
                                  <Radio.Button style={{marginRight: "5px"}} value={"PB"} className="box-shadow">PB</Radio.Button>
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
    
    </div>
  );
}
