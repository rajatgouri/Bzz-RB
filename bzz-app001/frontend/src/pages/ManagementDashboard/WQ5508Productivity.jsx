import React, { useState } from "react";

import ProductivityDataTableModule from "@/modules/ProductivityDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col } from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import  Socket  from "@/socket";
import { getDate } from "@/utils/helpers";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function Wq5508Productivity() {
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
  const [firstActivityFilter, setFirstActivityFilter] = useState([])

  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = getDate() 
  
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
    'BillerName': ['ALL'],
  })

  const dispatch = useDispatch()


  React.useEffect(async () => {

    const response = await request.list("admin");
    let usersList = response.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null ).map((user) => ({id: user.EMPID, name: user.First, text: user.First , value: user.First , status: 'success'}))

    setUsers(usersList)
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

  const entity = "wq5508productivity";
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

    if (firstActivityFilter.length == 0 ) {

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
  const dataTableTitle = "WQ 1075";
  const progressEntity = "wq1075progress";
  const workEntity = "wq1075Work";
  const showProcessFilters = true;

  const onWorkSaved = async (amount) => {
   
  }


  const dataTableColumns = [
    {
      title: "Biller",
      dataIndex: "BillerName",
      key: "BillerName",
      width: 120,
      filters: users,
      filteredValue: filteredValue['BillerName'] || null 
      
    },
    { title: "Date", dataIndex: "Date", width: 110, 
      key: "Date",
      sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Date")[0].order : null,
    },
    { title: "ID", 
    dataIndex: "ID", 
    width: 80, 
    key: "ID",
    ...getColumnSearchProps("ID"),
    filteredValue: filteredValue['ID'] || null 
  },
  {
    title: "Status", width: 120, dataIndex: "StatusQueue",
    key: "StatusQueue",
    ...getColumnSearchProps("StatusQueue"),
    filteredValue: filteredValue['StatusQueue'] || null 
  },
  {
    title: "First Activity", width: 140, dataIndex: "FirstActivityStatus",
    key: "FirstActivityStatus",
    filters: firstActivityFilter,
    filteredValue: filteredValue['FirstActivityStatus'] || null 
  },
  {
    title: "Last Activity ", width: 140, dataIndex: "LastActivityStatus",
    key: "LastActivityStatus",
    ...getColumnSearchProps("LastActivityStatus"),
    filteredValue: filteredValue['LastActivityStatus'] || null 
  },
    {
      title: "First (Datetime)", width: 150, dataIndex: "First(Datetime)",
      key: "First (Datetime)",
      sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "First(Datetime)").length > 0) ?  filteredValue.sort.filter((value) => value.field == "First(Datetime)")[0].order : null,
    },
    {
      title: "Last (Datetime)", width: 150, dataIndex: "Last(Datetime)",
      key: "Last(Datetime)",
      sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Last(Datetime)").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Last(Datetime)")[0].order : null,
    },
    {
      title: "Process Type", width: 140, dataIndex: "Process Type",
      key: "Process Type",
      filters: [
        { text: "Expedite", value: "Expedite" },
        { text: "Standard", value: "Standard" }
      ],
      filteredValue: filteredValue['Process Type'] || null 
    },
    {
      title: "Processed Correctly?", width: 180, dataIndex: "Processed Correctly?",
      key: "Processed Correctly?",
      filters: [
        { text: "False", value: "false" },
        { text: "True", value: "true" }
      ],
      filteredValue: filteredValue['Processed Correctly?'] || null 
    },
    {
      title: "Duration", width: 110, dataIndex: "Duration", 
      key: "Duration",
      ...getColumnSearchProps("Duration"),
      filteredValue: filteredValue['Duration'] || null 
    },

    {
      title: "Between", width: 110, dataIndex: "Between",
      key: "Between",
      ...getColumnSearchProps("Between"),
      filteredValue: filteredValue['Between'] || null 
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
      <Modals config={modalConfig} >
          {
            modalType == "EDIT" ? 
            editModal : null
          }
          {
            modalType == "VIEW" ? 
            viewModal : null
          }
      </Modals>
     <ProductivityDataTableModule config={config} />
        
    </div>
     : null 
  }  
}
