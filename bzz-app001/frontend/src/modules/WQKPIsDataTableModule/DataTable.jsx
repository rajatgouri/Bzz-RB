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
import { useSelector, useDispatch } from "react-redux";

import moment from 'moment';
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('@/request/index')
import { selectAuth } from "@/redux/auth/selectors";


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date(utcDate)

const {Option} = Select

export default function DataTable({ config }) {

  const [coloredRow, setColoredRow] = useState({});
 
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns,  reload,  getFilterValue, userList,className, scroll , getItems } = config;


  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

  

 

  const newDataTableColumns = dataTableColumns.map((obj, i) => {

  
      
    if (obj.dataIndex == "Review Date" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
           
            children: (
              <div style={{fontWeight: row['color'],  fontStyle: row['style'] }}>
                {row["Review Date"] ? row["Review Date"].split("T")[0]  : ""}
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
            text,
        };
      },
    })


    
  });

 
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

    getItems(items)
    setDataSource(items)

  }, [items])


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
    <div className={className}>
      
      <Table
        columns={columns}
        rowKey="ID"
        scroll={scroll}
        dataSource={dataSource}
        pagination={pagination}
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
