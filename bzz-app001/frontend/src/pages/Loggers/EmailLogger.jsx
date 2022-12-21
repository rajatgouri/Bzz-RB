import React, { useState } from "react";

import FilterDataTableModule from "@/modules/FilterDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

import Performance from "@/components/Chart/performance";
import {  selectUsersList } from "@/redux/user/selectors";
import { mappedUser } from "@/utils/helpers";


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function EmailLogger() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId]= useState("");
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRow,setSelectedRow] = useState("");
  const [workProgress, setWorkProgress] = useState([]);
  const [statusFilter, setStatusFilter] = useState([])
  const [filters, setFilters] = useState({})
  const [hasFilters, setHasFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState([])
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = usDate 
  
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})

  const dispatch = useDispatch()

  const addDays = (date, days = 1) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  const dateRange = (start, end, range = []) => {
    if (start > end) return range;
    const next = addDays(start, 1);
    return dateRange(next, end, [...range, start]);
  };
  

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
    
   
  };

  const entity = "emailLogger";
  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const getItems = async (values) => {
 

    if(values.length > 0  && values[0]['Finish Timestamp'] && !hasFilters) {
      const [usersList1] = await Promise.all([  request.list("emailuserfilter")]);
    
      let endDate = (usersList1.result.result2[0]['Finish Timestamp'].split('T')[0])
      let startDate = (values[0]['Finish Timestamp'].split('T')[0])
    
      const range = dateRange(new Date(endDate), new Date(startDate));
      date = range.map(date => date.toISOString().slice(0, 10)).sort()

      setDateFilter(date.map(d => ({text: d, value: d})))
      let filterObject = {}

      let result = usersList1.result.result1.filter(user => user.First != 'Admin').map((item) => item['FIRST_NAME'])
     
      filterObject['FIRST_NAME'] = result.sort().map(item => ({text: item, value: item}))
      setFilters(filterObject)

      setHasFilters(true)
    }
  }

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }
  const panelTitle = "WQ 1075";
  const dataTableTitle = "Email Logger";
  const progressEntity = "";
  const showProcessFilters = true;

  const dataTableColumns = [
    { title: "No.", 
    dataIndex: "SNo", 
    width: 80 
  },
  {
    title: "UserName",
    dataIndex: "FIRST_NAME",
    width: 160,
    filters: filters['FIRST_NAME'],
    sorter: { multiple: 5}, 
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FIRST_NAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "FIRST_NAME")[0].order : null,
    filteredValue: filteredValue['FIRST_NAME'] || null 
    
  },
  {
    title: "Email",
    dataIndex: "Email",
    ...getColumnSearchProps("Email"), 
    width: 180,
  },
  {
    title: "Category",
    dataIndex: "Category",
    filters: [
      {text: "New Appointment", value: "New Appointment"},
      {text: "New Email", value: "New Email"},
      {text: "Repl/Forw", value: "Repl/Forw"},
      {text: "New Announcement", value: "New Announcement"},

    ],
    filteredValue: filteredValue['Category'] || null,
    width: 180,
  },
  { title: "Start Time Stamp", dataIndex: "Start Timestamp", width: 180, 
    sorter: { multiple: 1}, 
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Start Timestamp").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Start Timestamp")[0].order : null,
    filters: dateFilter,
    filteredValue: filteredValue['Start Timestamp'] || null,

  },
  { title: "Finish Time Stamp", dataIndex: "Finish Timestamp", width: 180, 
  sorter: { multiple: 2}, 
  sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Finish Timestamp").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Finish Timestamp")[0].order : null,
  filters: dateFilter,
    filteredValue: filteredValue['Finish Timestamp'] || null,
},

  {
    title: "Duration",
    dataIndex: "Duration in Seconds",
    width: 120
  },
  {
    title: "Subject",
    dataIndex: "Subject",
    ...getColumnSearchProps("Subject"), 
    width: 300,
  },
  {
    title: "Recipient",
    dataIndex: "Recipient",
    width: 300,
    ...getColumnSearchProps("Recipient"), 
  },
 
    
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
    dataTableColorList,
    onhandleSave : () => {},
    openEditModal: () => {},
    openAddModal: () => {},
    getItems,
    reload,
    onCopied: () => {},
    getFilterValue,
    showProcessFilters,
    userList: users,
    onWorkSaved: () => {},
    onRowMarked: () => {}
  };

  {
  return users.length > 0 ? 
    <div>
     {/* <FilterDataTableModule config={config} /> */}
     <div style={{padding: "35px 35px 0px 35px", minWidth: "1330px"}}>
     <Performance style={{height: '460px'}}/>

     </div>
     
      
     <FilterDataTableModule config={config} />
    </div>
     : null 
  }  
}
