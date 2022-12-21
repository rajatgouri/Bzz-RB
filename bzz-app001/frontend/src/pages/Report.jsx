import React, { useState } from "react";

import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import LiveReport from "@/modules/ReportDataTableModule/DataTable";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function Report() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  const [dataTableColumns, setDataTableColumns]  = useState([
      
      
      {
        title: "UserAssigned",
        dataIndex: "UserAssigned",
        key: "UserAssigned",

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
        title: "Gov Coverages",
        dataIndex: "Gov Coverage",
        key: "Gov Coverage"  ,
        filters: [
          {
            text: 'Gov',
            value: 'Gov',
          },
          {
            text: 'Non-Gov',
            value: 'Non-Gov',
          },
        ],
        onFilter: (value, record) => record['Gov Coverage'].indexOf(value) === 0,
      },
      {
        title: "Count",
        dataIndex: "Count",
        sorter: (a, b) => a.Count - b.Count
      },
      {
        title: "Amount",
        dataIndex: "Amount",
        sorter: (a, b) => a.Amount - b.Amount

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
    setUsers(mappedUser(usersList))

  }, [usersList])



  const entity = "live-report";

  const getFilterValue = (values) => {
    setFilteredValue(values)

    dataTableColumns[0]['sortOrder'] = values.sort.filter((s) => s['field'] == "ActionTimeStamp")[0] ? values.sort.filter((s) => s['field'] == "ActionTimeStamp")[0]['order'] : null
    setDataTableColumns(dataTableColumns)


  }

  const getItems = (data) => {
    setItems(data)
  } 



  const panelTitle = "WQs Current Distribution";
  const dataTableTitle = "WQs Current Distribution";
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
    getFilterValue,
    showProcessFilters,
    userList: users
  };

  {
  return dataTableColumns.length > 0 && users.length > 0 ? 
     <LiveReport config={config} />
     : null 
  }  
}
