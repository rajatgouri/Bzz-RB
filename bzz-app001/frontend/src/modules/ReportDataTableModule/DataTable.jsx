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

export default function LiveReport({ config }) {

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

  
    if (obj.dataIndex == "UserAssigned" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                textAlign:"center",
                color: (text == "Jannet" || text == "Anna Maria") ? "#35ad87" : "#000",
                fontWeight: 600
              },
            },
            children: (
              <div style={{fontWeight: row['color'],  fontStyle: row['style'] }}>
                {text}
              </div>
            )
          };
        },
      })
    } 
    

    if (obj.dataIndex == "Amount" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                textAlign:"center",
                color: (row['UserAssigned'] == "Jannet" ||row['UserAssigned'] == "Anna Maria") ? "#35ad87" : "#000",
                fontWeight: 600

              },
            },
            children: (
              <div >
                {parseFloat(text).toFixed(2)}
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
              textAlign: "center",
              color: (row['UserAssigned'] == "Jannet" || row['UserAssigned'] == "Anna Maria") ? "#35ad87" : "#000",

              // color: (text == "Jannet" || text == "Anna Maria") ? "#35ad87" : "#000"
            },
          },
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

   
      setDataSource(items)
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


  setInterval(() =>{
    loadTable()
  }, 900000)


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
    <div className="live-report">
      <div style={{ 'display': 'block', marginBottom: "15px" }}>
        <h2
          className="ant-page-header-heading-title"
          style={{  width: "68%", display: "inline-block" }}
        >
          {dataTableTitle}

        </h2>
        <div style={{ width: "30%", display: "inline-block", textAlign: "end" }}>
          <Button title="Export" style={{ marginLeft: "10px", marginTop: "2px" }} size="small" size="small" onClick={() => loadTable()}>
            <ReloadOutlined  />
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        rowKey="ID"
        scroll={{ y: '850px' }}
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
