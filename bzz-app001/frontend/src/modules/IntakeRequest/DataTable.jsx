import React, {forwardRef, useContext, useCallback, useEffect, useState, useRef , useImperativeHandle } from "react";
import {
  Button,
  Table,  
  Radio,
  Popover,
  Select,
  Row,
  Col,
  DatePicker,
  Tooltip as TP
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import NestedDataTable from "@/components/NestedDataTable";
import Header from "./header";

import {
  EyeOutlined,
  EditOutlined,
  EyeFilled,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined,
  CopyOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { formatDate } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"

// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());

const colorCodes = {
  'Approved' : '#00ff7f54',
  'Declined': '#f4000054',
  'On Hold': '#e8f6025e',
  'TBD' :'#00b0ff59'
}


export default  forwardRef(({config}) => {

  const [previousEntity, setPreviousEntity] = useState('');
  const [activeRowID, setActiveRowID]= useState('')


  let { 
    entity, 
    dataTableColumns, 
    getItems = () => {}, 
    reload = true,  
    getFilterValue= () => {}, 
    dataTableTitle , 
    footer = () => {},
    openingModal = () => {},
    classname= '', 
    scroll = {y: 'calc(100vh - 20.5em)'} ,
    confirmModal = () => {}, 
    AddIcon = false,
    summary = () => {},
    onRowMarked= () => {},
    openEditModal = () => {},
    openAddModal= () => {},
    ref,
    setProcess= () => {},
    processKey,
    process,
    handleRowClick =  () => {},
    addModal = false,
    onChange = () => {}
  } = config;
  
  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  useImperativeHandle(ref, () => ({

    onProcessChanged (e, v)  {
      const value = e
      setProcess(value)
      let obj = {}
      obj[processKey] = [value]
      handelDataTableLoad(1, obj, {})
    }

  }));
  
  const newDataTableColumns = dataTableColumns.map((obj) => {

  
    if (obj.feature == "date") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
              }
            },
            children: (
              <div>
                {text ?
                  formatDate(text.toString().split('T')[0])
                  : null}
              </div>
            )
          };
        },
      })
    }


    if (obj.feature == "tooltip") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
              }
            },
            children: (
              <div>
                <TP placement="topLeft" title={text}>
                  {text && text.length > 55 ? text.substring(0, 55) + "..." : text}
                </TP>
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
            props: {
              style: {
                background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
              }
            },
            children: (
              <div style={{textAlign: "center"}}>
                <span className="actions" >
                    <span className="actions">
                      <Popover placement="rightTop" content={
                        <div>
                          <p  className="menu-option" onClick={() => openingModal(row, 'EDIT')}><span><EditOutlined /></span> Edit</p>
                          <p  className="menu-option" onClick={() => openingModal(row, 'DELETE')}><span><DeleteOutlined /></span> Delete</p>

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


    if (obj.feature == "amount" ) {
      return ({
        ...obj,
        props: {
          style: {
            background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
          }
        },
        render: (text, row) => {
          return {        
           
            children: (
              <div >

                 { text?   
                  "$" + new Intl.NumberFormat('en-US',  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(text)
                 : ''}
               

              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "datetime") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
              }
            },
            children: (
              <div>
                {text ?

                  text.split("T")[0].split('-')[1] + "/" +
                  text.split("T")[0].split('-')[2] + "/" +
                  text.split("T")[0].split('-')[0]

                  + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "select") {
      return ({
        ...obj,
        render: (text, row) => {
          let value = row[obj.dataIndex] ? row[obj.dataIndex].split(',') : []
          return {
            props: {
              style: {
                background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
              },
              className: row['Status'] ? row['Status'].replace(/ /g,"_").replace(/&/g,"_").replace(/\//g,"_") : ''
            },
            children: (
              <div>
                <Select  mode={obj.mode} className="w-100 transparent" defaultValue={value} onChange={(e) => onChange(e, obj.dataIndex, row['ID'])}>
                  { 
                   obj['options'] && obj['options'].map((o, i) => {
                     
                      return <Option key={o.value != "null"? o.value : ""} value={o.value  != "null" ? o.value : ""}>{o.text != "" ? o.text : ""}</Option>
                    })
                  }
                </Select>
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
          props: {
            style: {
              background: row['Status']  ? colorCodes[row['Status'] ] : '#fff',
            }
          },
          children:
            text ? text.replace(',', ', ') : '',
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems  );

  var { pagination, items , filters, sorters , extra = {}} = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = visible => {
    setVisible( visible );
  };

  

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {

     

        setDataSource(items)
        getItems(items)
  }, [items])

  const dispatch = useDispatch();




  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {    
   

    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

  
    filteredArray = (filteredArray.map((data) => {
      if(data.column) {
        delete data.column.filters  
      }
      return data
    }))

   

    setSorter(filteredArray)

    if (previousEntity == entity) {
      getFilterValue(filters);
    }




    let filteredObject = {}
    for (let f in filters) {
      let type = columns.filter((c) => c.dataIndex == f)[0].type 
      filteredObject[f] = {value: filters[f], type: type ? type : ''}
    }

    const option = {
      page: pagination.current || 1,
      filter: filteredObject || {},
      sorter: sorter ? (filteredArray) : [],
    };

    dispatch(crud.list1(entity, option));
    filters.sort = (filteredArray);


  };


  const searchTable = (values) => {
    if (!filters) {
      filters = {}
    }
    filters['Denial Date'] = values

    handelDataTableLoad(pagination, filters, sorters)
  }

  const loadTable = () => {
    
    let filters = {
      
    }

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filters || {},
      sorter: []
    };

    

    dispatch(crud.list1(entity, option));

    for (let i in filters) {
      filters[i] = filters[i].value
    }

      getFilterValue(filters);


  }

  useEffect(() => {

    loadTable()

  }, []);



  useEffect(() => {
   items = []
  },[entity])

  useEffect(() => {

 

    if (reload) {

      if (previousEntity == entity) {
        handelDataTableLoad(pagination, filters, sorters)
      } else {
        handelDataTableLoad(pagination, {}, {})
      }

      setVisible(false)

    } else {
      setLoading(true)
    }

  }, [reload])

  const openModal= () => {
    // setActiveRowID(record['Claim ID'])
    openingModal(null , 'ADD')
  }

  const headerConfig = {
    dataTableTitle,
    searchTable,
    openModal: openModal
  }
  
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

  return (
    <div className= {classname}>
         <Header config={headerConfig} />

<Table
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {   
            return "wq-rows"
        }}
        // rowClassName={setRowClassName}
        scroll={scroll}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
      
      
      />
     
    </div>
  );
})
