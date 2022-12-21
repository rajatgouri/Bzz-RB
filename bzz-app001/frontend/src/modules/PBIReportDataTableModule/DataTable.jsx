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

export default function PBIReport({ config }) {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableTitle, dataTableColumns, reload } = config;



  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])


  
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


    // if (previousEntity == entity) {
    //   getFilterValue(filters);
    // }

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

  
  const newDataTableColumns = dataTableColumns.map((obj, i) => {

  
    

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
    <div className="report-table">
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
        scroll={{ y: '325px' }}
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
