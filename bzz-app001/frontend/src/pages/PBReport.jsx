import React, { useState } from "react";

import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import PBIReport from "@/modules/PBIReportDataTableModule/DataTable";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function PBReport() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})
  const [dataTableColumns, setDataTableColumns]  = useState([
      
      
      {
        title: "User ",
        dataIndex: "User Name",
        key: "User Name",

      },
      
      {
        title: "WQ",
        dataIndex: "WQ",
        key: "WQ",
        width: "100",
        filters: [
          {
            text: 'WQ1075',
            value: '1075',
          },
          {
            text: 'WQ5508',
            value: '5508',
          },
        ],
        onFilter: (value, record) => record['WQ'].indexOf(value) === 0,
        
      },

      {
        title: "Process Type",
        dataIndex: "Process Type",
        key: "Process Type",
        width: "160"
       
      },
      {
        title: "Accounts",
        dataIndex: "Accounts",
        key: "Accounts"  ,
        sorter: (a, b) => a.Accounts - b.Accounts
        
      },
      {
        title: "Claims",
        dataIndex: "Claims",
        sorter: (a, b) => a.Claims - b.Claims
      },
      {
        title: "Charges",
        dataIndex: "Charges",
        sorter: (a, b) => a.Charges - b.Charges

      },
      {
        title: "Minutes",
        dataIndex: "Minutes",
        sorter: (a, b) => a.Minutes - b.Minutes

      },
      {
        title: "Minutes per Account",
        dataIndex: "Minutes per Account",
        sorter: (a, b) => a['Minutes per Account'] - b['Minutes per Account'],
        width: 180
      },
      {
        title: "Minutes per Charge",
        dataIndex: "Minutes per Charge",
        sorter: (a, b) => a['Minutes per Charge'] - b['Minutes per Charge'],
        width: 180

      },
      {
        title: "Minutes per Claim",
        dataIndex: "Minutes per Claim",
        sorter: (a, b) => a['Minutes per Claim'] - b['Minutes per Claim'],
        width: 180

      },
      
      
  ])
  const dispatch = useDispatch()


  
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          // ref={(node) => {
          //   searchInput = node;
          // }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={(e) => {
           
            if (e.code == 'Enter') {
              e.preventDefault()
              e.stopPropagation();
              return
            }
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex,  confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    // onFilter: (value, record) => {
     
    //   return record[dataIndex]
    //     ? record[dataIndex]
    //         .toString()
    //         .toLowerCase()
    //         .includes(value.toLowerCase())
    //     : ""
    // },
      
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {

    
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, dataIndex, confirm) => {
    
    clearFilters();
    setSearchText("");
    handleSearch('', confirm, dataIndex)
    
   
    
  };

  React.useEffect(async () => {

  }, [])




  const entity = "pb-report";

 

  const getItems = (data) => {
    setItems(data)
  } 



  const panelTitle = "PB Report";
  const dataTableTitle = "PB Report";
  const showProcessFilters = true;


  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  const config = {
    entity,
    panelTitle,
    dataTableTitle,
    ENTITY_NAME,
    CREATE_ENTITY,
    ADD_NEW_ENTITY,
    UPDATE_ENTITY,
    DATATABLE_TITLE,
    dataTableColumns,
    getItems,
    reload,
    showProcessFilters,
    userList: users
  };

  {
  return dataTableColumns.length > 0  ? 
     <PBIReport config={config} />
     : null 
  }  
}
