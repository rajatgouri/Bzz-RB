import React, { useState } from "react";

import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import TrueKPIDataTableModule from "@/modules/TrueKPIDataTableModule";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function TruePBKPIDetails() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;
  
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




  const entity = "truepbkpidetails";

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }

  const getItems = (data) => {
    setItems(data)
  } 



  const panelTitle = "True PB KPi Details";
  const dataTableTitle = "True PB KPi Details";
  const showProcessFilters = true;

  const dataTableColumns = [
    
    {
      title: "User",
      dataIndex: "UserName",
      key: "UserName",
      width: 120,
      filters: users,
      filteredValue: filteredValue['UserName'] || null 
    },
    
    {
      title: "WQ",
      dataIndex: "WQ",
      key: "WQ",
      width: 100,
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
      filteredValue: filteredValue['WQ'] || null 

      
    },
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date"  ,
      width: 120,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date")[0].order : null,
    },

    {
      title: "Total Accounts",
      dataIndex: "Total Accounts",
      key: "Total Accounts"  ,
      width: 140,
      sorter: { multiple: 2 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Accounts").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Accounts")[0].order : null,
    },

    {
      title: "Total Claims",
      dataIndex: "Total Claims",
      key: "Total Claims"  ,
      width: 120,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Claims").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Claims")[0].order : null,
    },

    {
      title: "Total Charges/CPT Count",
      dataIndex: "Total Charges/CPT Count",
      key: "Total Charges/CPT Count"  ,
      width: 240,
      sorter: { multiple: 4 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "[Total Charges/CPT Count]").length > 0) ? filteredValue.sort.filter((value) => value.field == "[Total Charges/CPT Count]")[0].order : null,
    },

    {
      title: "Hourly Avg Accounts",
      dataIndex: "Hourly Avg Accounts",
      key: "Hourly Avg Accounts"  ,
      width: 240,
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "[Hourly Avg Accounts]").length > 0) ? filteredValue.sort.filter((value) => value.field == "[Hourly Avg Accounts]")[0].order : null,
    },

    {
      title: "Hourly Avg Claims",
      dataIndex: "Hourly Avg Claims",
      key: "Hourly Avg Claims"  ,
      width: 240,
      sorter: { multiple: 6 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "[Hourly Avg Claims]").length > 0) ? filteredValue.sort.filter((value) => value.field == "[Hourly Avg Claims]")[0].order : null,
    },


    {
      title: "Hourly Avg Charges/CPT Count",
      dataIndex: "Hourly Avg Charges/CPT Count",
      key: "Hourly Avg Charges/CPT Count"  ,
      width: 240,
      sorter: { multiple: 7 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "[Hourly Avg Charges/CPT Count]").length > 0) ? filteredValue.sort.filter((value) => value.field == "[Hourly Avg Charges/CPT Count]")[0].order : null,
    },

   
    
  ]

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
    userList: users,
    height: "500px",
    className: "TruePBKPIDetails"
  };

  {
  return dataTableColumns.length > 0 && users.length > 0 ? 
     <TrueKPIDataTableModule config={config} />
     : null 
  }  
}
