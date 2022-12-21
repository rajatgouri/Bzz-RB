import React, { useState } from "react";

import KPIDataTableModule from "@/modules/KPIDataTableModule";
import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function KPI() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})
  const [dataTableColumns, setDataTableColumns]  = useState([])
  const dispatch = useDispatch()
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;


  
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

    let u = mappedUser(usersList)
    setUsers(u)
    let columns = []
    columns.push({
      title: "Date",
      dataIndex: "ActionTimeStamp",
      width: 120,
      fixed: true,

      sorter: ((a, b) =>  new Date(a['ActionTimeStamp'] - new Date(b['ActionTimeStamp'] ))),
    })

    columns.push({
      title: "WQ",
      dataIndex: "WQ",
      width: 100,
      fixed: true,

         
    })

    u.map((user, i ) => {
      columns.push({
        title:  user.name,
        width: 300,
        dataIndex:  user.name,
        key: user.name,
        children: [
          {
            title: 'Claims',
            dataIndex:  i + '-WQ5508Charges',
            key: 'a',
            width: 100,
          },
          {
            title: 'Amount',
            dataIndex: i + '-WQ5508Amount',
            key: i ,
            width: 100,
          },
          {
            title: 'Accounts',
            dataIndex: i + '-WQ5508Accounts',
            key: 'b' ,
            width: 100,
          },
          {
            title: 'Assigned',
            dataIndex: i + '-WQ5508Assigned',
            key: 'c' ,
            width: 100,
          },
          {
            title: 'Bonus Prod',
            dataIndex: i + '-WQ5508BonusProd',
            key: 'd' ,
            width: 100,
          },
        ],       
      })

    })
    
    setDataTableColumns(columns)
  }, [usersList])



  
  const entity = "totalpbkpis";

  const getFilterValue = (values) => {
    setFilteredValue(values)

    dataTableColumns[0]['sortOrder'] = values.sort.filter((s) => s['field'] == "ActionTimeStamp")[0] ? values.sort.filter((s) => s['field'] == "ActionTimeStamp")[0]['order'] : null
    setDataTableColumns(dataTableColumns)

  }

  const getItems = (data) => {
    setItems(data)
  } 


  const panelTitle = "KPI";
  const dataTableTitle = "KPIs";
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
     <KPIDataTableModule config={config} />
     : null 
  }  
}
