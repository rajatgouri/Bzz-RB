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
  Row,
  Select,
  Col
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, ReloadOutlined, SettingOutlined } from "@ant-design/icons";
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
// import { filter } from "@antv/util";
import { getDate, getDay } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date(utcDate)

const {Option} = Select

export default function KPIDataTable({ config }) {

  const inputColorRef = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [EMPID, setUserID] = useState(1);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked } = config;

  const [process, setProcess] = useState('ALL');


  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

  useEffect(() => {
  }, [userList])

  function copy(id, textToCopy) {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
      notification.success({ message: "MRN Copied!", duration: 3 })
      onCopied(id, textToCopy)
      onCopiedEvent(textToCopy)
    });
  }

  const onCopiedEvent = (textToCopy) => {
    handelDataTableLoad(1, { 'Patient MRN': [textToCopy] }, {})
    setInCopiedMode(true)
  }

  const newDataTableColumns = dataTableColumns.map((obj, i) => {

  
      
    if (obj.dataIndex == "ActionTimeStamp" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div style={{fontWeight: row['color'],  fontStyle: row['style'] }}>
                {row["ActionTimeStamp"] ? row["ActionTimeStamp"].split("T")[0]  : ""}
              </div>
            )
          };
        },
      })
    } 
    
    if (obj.dataIndex == "WQ") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div style={{fontWeight: row['color'], fontStyle: row['style'] }}>
                <div>
                  WQ5508
                </div>
                <div>
                  WQ1075
                </div>
                <div>
                  WQ3177
                </div>
              </div>
            )
          };
        },
      })
    }
    
    

    if (userList && userList.length > 0 && obj.dataIndex ==  userList.filter((user) => user.name == obj.dataIndex)[0] . name) {
      return ({
        ...obj,
      
        children:  
          obj.children.map(c => {
          return {
            title: c.title,
            dataIndex: c.dataIndex,
            width: 110,
            render: (text, row)=>  {
        
              return (
                <div>
                  {

                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Charges' ?
                      <div style={{fontWeight: row['color'],fontStyle: row['style'] }}>
                        
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Charges'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Charges'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Charges'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Charges'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                      <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Charges'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Charges'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        
                      </div>
                      : 

                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Accounts' ?
                      <div style={{fontWeight: row['color'], fontStyle: row['style'] }}>
                       
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Accounts'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Accounts'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Accounts'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Accounts'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Accounts'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Accounts'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        
                      </div>
                     
                      : 
                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Amount' ?
                      
                      <div style={{fontWeight: row['color'], fontStyle: row['style'] }}>

                      <div>{
                        (parseInt(row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Amount'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) +  '-WQ5508Amount'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Amount'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Amount'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                         <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Amount'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Amount'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                       
                      </div>
                      :
                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Assigned' ?
                      
                      <div style={{fontWeight: row['color'], fontStyle: row['style'] }}>

                      <div>{
                        (parseInt(row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508Assigned'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) +  '-WQ5508Assigned'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Assigned'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075Assigned'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                         <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Assigned'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177Assigned'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                       
                      </div>
                      :
                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508BonusProd' ?
                      
                      <div style={{fontWeight: row['color'], fontStyle: row['style'] }}>

                      <div>{
                        (parseInt(row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ5508BonusProd'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) +  '-WQ5508BonusProd'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075BonusProd'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ1075BonusProd'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                         <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177BonusProd'] ? row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQ3177BonusProd'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                       
                      </div>
                      :
                      null
                  }
                  
                 </div>
               
              )
            }
          }
        }),
        
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

  // var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  // var { pagination, items, filters, sorters } = listResult;
  
  const [listResult, setListResult] = useState({
    pagination: {},
    filters: {},
    sorters: [],
    items: []
  });
  const [listIsLoading , setListIsLoading ] = useState(true);
  var  [pagination, setPagination] = useState({})
  var  [items, setitems] = useState([])
  var  [filters, setFilters] = useState({})
  var  [sorters, setSorters] = useState([])
  const [dataSource, setDataSource] = useState([]);

  
  const { current } = useSelector(selectAuth);
  const [users, setUsers] = useState(userList)


  const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  
  useEffect(() => {
    if(listResult.success) {
      setitems(listResult.result)
      setPagination({
        current: parseInt(listResult.pagination.page, 10),
        pageSize: 100,
        showSizeChanger: false,
        size:"small",
        total: parseInt(listResult.pagination.count, 10),
      })
      setSorters(listResult.sorters)
      setFilters(listResult.filters) 
  
    }   
     
  }, [listResult])

  const getServerSideData = async(entity, option) => {
    setListIsLoading(true)
    let response = (await request.list(entity, option))
    setListResult(response)

    setListIsLoading(false)
  }
  
  
  useEffect(() => {

    if (items.length > 0) {

    let dates = items.map((item) => item['ActionTimeStamp'])
    dates = [...new Set(dates)]; 

    
    let entries = []
    let empIds =  users.map((u) => ({EMPID: u.EMPID, name: u.name}))

      dates.map((date, index) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        let Obj = {}
        
        if (new Date(row[0]['ActionTimeStamp']).getDay() == 4) {
          
          let startDate = (date.split('T')[0])
          let lastDate = dates.slice(index, index + 6).reverse()[0].split('T')[0]


          let row1 = items.filter((item) => new Date(item['ActionTimeStamp']) >= new Date(lastDate) && new Date(item['ActionTimeStamp']) <= new Date(date) )


          empIds.map((e, i) => {
          
            let r1 = row1.filter((ro) => ro.EMPID == e.EMPID)
            
            Obj['ActionTimeStamp']=  startDate + "-" + lastDate  
            Obj[ i + '-WQ5508Charges'] = (r1.reduce((a,b) => a + b['WQ5508ChargesProcessed'],0))
            Obj[ i +'-WQ1075Charges'] = (r1.reduce((a,b) => a + b['WQ1075ChargesProcessed'],0)),
            Obj[ i +'-WQ3177Charges'] = (r1.reduce((a,b) => a + b['WQ3177ChargesProcessed'],0)),

            Obj[ i + '-WQ5508Accounts'] = (r1.reduce((a,b) => a + b['WQ5508AccountsProcessed'],0))
            Obj[ i +'-WQ1075Accounts'] = (r1.reduce((a,b) => a + b['WQ1075AccountsProcessed'],0))
            Obj[ i +'-WQ3177Accounts'] = (r1.reduce((a,b) => a + b['WQ3177AccountsProcessed'],0))

            Obj[ i + '-WQ5508Amount'] = (r1.reduce((a,b) => a + b['WQ5508AmountRemoved'],0))
            Obj[ i + '-WQ1075Amount'] = (r1.reduce((a,b) => a + b['WQ1075AmountRemoved'],0)) 
            Obj[ i + '-WQ3177Amount'] = (r1.reduce((a,b) => a + b['WQ3177AmountRemoved'],0)) 

            Obj[ i + '-WQ5508Assigned'] = (r1.reduce((a,b) => a + b['WQ5508Assigned'],0))
            Obj[ i + '-WQ1075Assigned'] = (r1.reduce((a,b) => a + b['WQ1075Assigned'],0)) 
            Obj[ i + '-WQ3177Assigned'] = (r1.reduce((a,b) => a + b['WQ3177Assigned'],0)) 

            Obj[ i + '-WQ5508BonusProd'] = (r1.reduce((a,b) => a + b['WQ5508BonusProductivity'],0))
            Obj[ i + '-WQ1075BonusProd'] = (r1.reduce((a,b) => a + b['WQ1075BonusProductivity'],0)) 
            Obj[ i + '-WQ3177BonusProd'] = (r1.reduce((a,b) => a + b['WQ3177BonusProductivity'],0)) 

            Obj['color'] = '600'
            Obj['style'] = 'italic'
          })
  
           entries.push(Obj)
  
        } 





        Obj = {}
        empIds.map((e, i) => {
         
          let r = row.filter((ro) => ro.EMPID == e.EMPID)[0] 

          r = r ? r : {}

          Obj['ActionTimeStamp']=  Obj['ActionTimeStamp'] ?  Obj['ActionTimeStamp'] : r['ActionTimeStamp']  
          Obj[ i + '-WQ5508Charges'] = r['WQ5508ChargesProcessed']
          Obj[ i +'-WQ1075Charges'] = r['WQ1075ChargesProcessed'],
          Obj[ i +'-WQ3177Charges'] = r['WQ3177ChargesProcessed'],

          Obj[ i + '-WQ5508Accounts'] = r['WQ5508AccountsProcessed']
          Obj[ i +'-WQ1075Accounts'] = r['WQ1075AccountsProcessed']
          Obj[ i +'-WQ3177Accounts'] = r['WQ3177AccountsProcessed']

          Obj[ i + '-WQ5508Amount'] = r['WQ5508AmountRemoved']
          Obj[ i + '-WQ1075Amount'] = r['WQ1075AmountRemoved']
          Obj[ i + '-WQ3177Amount'] = r['WQ3177AmountRemoved']


          Obj[ i + '-WQ5508Assigned'] = r['WQ5508Assigned']
          Obj[ i + '-WQ1075Assigned'] = r['WQ1075Assigned']
          Obj[ i + '-WQ3177Assigned'] = r['WQ3177Assigned']


          Obj[ i + '-WQ5508BonusProd'] = r['WQ5508BonusProductivity']
          Obj[ i + '-WQ1075BonusProd'] = r['WQ1075BonusProductivity']
          Obj[ i + '-WQ3177BonusProd'] = r['WQ3177BonusProductivity']

          Obj['color'] = '400'
          Obj['style'] = 'normal'
        })


        entries.push(Obj)

      })  


      setDataSource(entries)
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

    const option = {
      page: pagination.current || 1,
      filter: JSON.stringify(filters) || JSON.stringify({}),
      sorter: sorter ? JSON.stringify(filteredArray) : JSON.stringify([])
    };

    filters.sort = (filteredArray);


    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    // dispatch(crud.list(entity, option));
    getServerSideData(entity, option)
    

  };

  const loadTable = () => {

    items = []
    setDataSource([])
    
    let filterValue = JSON.stringify({})

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filterValue,
      sorter: JSON.stringify([])
    };

    // dispatch(crud.list(entity, option));
    getServerSideData(entity, option)


  }

  useEffect(() => {


      loadTable() 

  }, []);




  useEffect(() => {

    if(dataSource.length == 0) {
      return
    }

    if (reload) {
      handelDataTableLoad(pagination, filters, sorters)
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



  return (
    <div className="kpi-table">
      
      <Table
        columns={columns}
        rowKey="ID"
        scroll={{ y: '450px' }}
        dataSource={dataSource}
        pagination={{ defaultPageSize: 100, pageSizeOptions: [], size: "small"}}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
            </Row>
          )
        }
      />
    </div>
  );
}
