import React, { useState } from "react";

import FixedDataTableModule from "@/modules/FixedDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col } from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import {  selectUsersList } from "@/redux/user/selectors";
import { mappedUser } from "@/utils/helpers";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function EpicProductivity1() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;
  
  const [statusFilter, setStatusFilter] = useState([])

  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = usDate 
  
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
  })

  const dispatch = useDispatch()


  React.useEffect(async () => {

    setUsers(mappedUser(usersList))
  }, [usersList])

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
    
    if(dataIndex == 'Patient MRN') {
      setReset(true)
      setTimeout(() => setReset(false), 1000)
    }
    
  };

  const entity = "epic-productivity1";

  const getFilterValue = (values) => {

    setFilteredValue(values)
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
  }

  const getItems = (data) => {

    if ( data && data.length > 0 && items.length == 0 && statusFilter.length == 0 ) {

      let status = data.map((d) => d.Status);
      let elements = ([...new Set(status)]);
      setStatusFilter(elements.map((el) => ({ text: el, value: el })))
  
    }

    setItems(data)
  } 



  const panelTitle = "";
  const dataTableTitle = "RB- Epic Productivity";
  const showProcessFilters = true;


  const dataTableColumns = [
    {
      title: 'Week Ending Date',
      width: 150,
      dataIndex: 'WeekEndingDate',
      key: 'WeekEndingDate',
      // sorter: {multiple: 1},
      ...getColumnSearchProps("WeekEndingDate"),
      sorter: ((a,b) => new Date(a.WeekEndingDate) - new Date(b.WeekEndingDate))  ,
      // filteredValue: filteredValue['WeekEndingDate'] || null 
    }
  ];

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
    onhandleSave: () => {},
    openEditModal: () => {},
    openAddModal : () => {},
    getItems,
    reload,
    onCopied: () => {},
    getFilterValue,
    showProcessFilters,
    userList: [],
    onWorkSaved: () => {},
    onRowMarked: () => {}
  };

  {
  return users.length > 0 ? 
    <div>
      
     <FixedDataTableModule config={config} />
        
    </div>
     : null 
  }  
}
