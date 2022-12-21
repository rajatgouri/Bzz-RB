
import React, { useState } from "react";

import LoggerDataTableModule2 from "@/modules/LoggerDataTableModule2";
import { Table, Input, Button, Space , Form, Row, Col } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

import PageLoggerDataTableModule from "@/modules/PageLoggerDataTableModule";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function () {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId]= useState("");
  const [reload, setReload] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedRow,setSelectedRow] = useState("");
  const [workProgress, setWorkProgress] = useState([]);
  const [firstActivityFilter, setFirstActivityFilter] = useState([])
  const [filters, setFilters] = useState([])
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;


  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = getDate()
  
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
    'UserName': ['ALL'],
  })

  const dispatch = useDispatch()


  React.useEffect(async () => {
    setUsers(mappedUser(usersList))
  }, [usersList])


  React.useEffect(async () => {

 

    const responseFilters = await request.list("wq5508filters");
    
    let obj = {}    

    let Status = ([...new Set(responseFilters.result.map((item)=> (item.Status)))].sort().map((value) => ({text: value, value:value})))
    let MRN = ([...new Set(responseFilters.result.map((item)=> (item.MRN)))].sort().map((value) => ({text: value, value:value})))

    obj = {
      MRN: MRN,
      Status: Status
    }


    setFilters(obj)

    setFirstActivityFilter([])

  }, [])


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

  const entity = "pagelogger";
  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }


  

  
  const onRowMarked = async (row, value) => {
    setReload(false)
    await dispatch(crud.update(entity, row.ID, {Error: value ? '0' : '1'}))
    setReload(true)
  }

  const openEditModal = (id) => {
    
    let row =  items.filter(item => item.ID == id)[0];

    setSelectedId(id);
    setModalType("EDIT");
    editForm.setFieldsValue({
      Notes: row.Notes
    })

    setModalTitle("Edit Notes");
    setOpenModal(true)
    onNotesAction(id, 'Edit Note')

  }


  const getFilterValue = (values) => {
    if(values.BillerName == "ALL") {
      values.BillerName = users.map(user => user.name) 
    }

    setFilteredValue(values)
  }


  const openAddModal = (id) => {
    let row =  items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
  }

  const getItems = (data) => {
    if ( firstActivityFilter.length == 0 ) {

      let firstActivityStatusList = data.map((d) => d.FirstActivityStatus);
      let elements = ([...new Set(firstActivityStatusList)]);
      setFirstActivityFilter(elements.map((el) => ({ text: el, value: el })))
  
    }
    setItems(data)
  } 

  const onEditItem = (value) => {
    onhandleSave({ID: selectedId, Notes: value.Notes? value.Notes.trim() : null})
    setOpenModal(false)
  }

  const onCopied = (id,mrn) => {
    dispatch(crud.create(loggerEntity, {IDWQ1075: id, UserName: current.name, Color : "", Status: "Copy MRN", DateTime: currentDate, MRN: mrn}))
  }

   // edit form
   const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >      
      <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
    </Form.Item>
    
    <Form.Item wrapperCol={{ offset: 18 }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        Update
      </Button>
    </Form.Item>
  </Form>
  )

  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
       <Col className="gutter-row" span={24}>
         {selectedRow.Notes}
       </Col>
   </Row>  
 )

  const panelTitle = "WQ 1075";
  const dataTableTitle = "Page Logger";
  const progressEntity = "wq1075progress";
  const workEntity = "wq1075Work";
  const showProcessFilters = true;

  const onWorkSaved = async (amount) => {
   
  }


  const dataTableColumns = [
  
  {
    title: "URL",
    dataIndex: "Url",
    width: 200,
    
  },
  {
    title: "Page",
    dataIndex: "Page",
    width: 200,
    
  },
  {
    title: "Status",
    dataIndex: "Status",
    width: 120,
    filters: [
      {text: "Visit", value: 'Visit'},
      {text: "Idle", value: 'Idle'},
      {text: "Login", value: 'Login'},
      {text: "Logout", value: 'Logout'},
      {text: "Active", value: 'Active'},
      {text: "Visit", value: 'Visit'},

    ],
    filteredValue: filteredValue['Status'] || null 
    
  },
  
    {
      title: "UserName",
      dataIndex: "UserName",
      width: 120,
      filters: users,
      filteredValue: filteredValue['UserName'] || null 
      
    },
    { title: "Date Time", dataIndex: "DateTime", width: 180, 
      sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DateTime").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DateTime")[0].order : null,
    },
    {
      title: "Duration",
      dataIndex: "Duration",
      width: 120
    },
    {
      title: "DiffInSeconds",
      dataIndex: "DiffInSeconds",
      width: 120
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
    onhandleSave,
    openEditModal,
    openAddModal,
    getItems,
    reload,
    progressEntity,
    onCopied,
    getFilterValue,
    workEntity,
    showProcessFilters,
    userList: users,
    onWorkSaved,
    onRowMarked
  };

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };
  {
  return users.length > 0 ? 
    <div>
     
     {/* <LoggerDataTableModule2 config={config} /> */}
     <PageLoggerDataTableModule config={config}></PageLoggerDataTableModule>   
    </div>
     : null 
  }  
}

