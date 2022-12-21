
import React, { useState, useEffect } from "react";

import FixedDataTableModule from "@/modules/FixedDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col, Select, DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function MasterTaskList() {
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
  const [selectedRow,setSelectedRow] = useState({});
  const [workProgress, setWorkProgress] = useState([]);
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const dateFormat = 'YYYY/MM/DD';
  const [StartDate, set_StartDate] = useState();
  const [Mon, set_Mon] = useState();
  const [Tue, set_Tue] = useState();
  const [Wed, set_Wed] = useState();
  const [Thu, set_Thu] = useState();
  const [Fri, set_Fri] = useState();
  const [Sat, set_Sat] = useState();
  const [Sun, set_Sun] = useState();
  const [errors , setErrors] = useState({})
  const [hasErrors, setHasErrors] = useState(false) 
  const [hasFilters, setHasFiters] = useState(false)
  const [department, setDepartment] = useState([])
  var usDate = new Date().toISOString();
  const currentDate = getDate() 
  const {current} = useSelector(selectAuth);
  const dispatch = useDispatch();
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  
  useEffect(() => {
    setUsers(mappedUser(usersList))
  }, [usersList])


  React.useEffect(async () => {

    
    const filteredResult = await request.list("himsmastertasklist-filters");

    let Type = filteredResult.result['Type'].map(({Type})=> (Type)).sort().map((value) => ({text: value, value:value}))
    let Standard = filteredResult.result['Standard'].map(({Standard})=> (Standard)).sort().map((value) => ({text: value, value:value}))
    
    let Obj = {
      Type,
      Standard
    }

    setFilters(Obj)

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
    
    if(dataIndex == 'Patient MRN') {
      setReset(true)
      setTimeout(() => setReset(false), 1000)
    }
    
  };


  const entity = "himsmastertasklist";

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
    setOpenAddEditModal(false);
    set_Mon(null)
    set_Tue(null)
    set_Wed(null)
    set_Thu(null)
    set_Fri(null)
    set_Sat(null)
    set_Sun(null)
    setErrors({})
  }


    const getFilters = (data) => {
     
    }

  const getItems = (data) => {

    if ( filters.length ==0 ) {
      getFilters(data)
    } 

    setHasErrors(true)
    setItems(data)
  } 



  const onEditItem =async (value) => {



   
    if(modalType == "EDIT") {
      setReload(false)
      let response = await (request.update(entity, selectedId, value))
      notification.success({message: "Item Updated Successfully!"})
      
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
      let response = await request.create(entity, value)
      notification.success({message: "Item Added Successfully!"})
      setReload(true)
      handleCancel()

    }
  }

  const onDateChanges = (entity, date) => {
    delete errors[entity] 
    

    if(entity == 'Mon') {
      set_Mon(date)
    } else if (entity == "Tue") {
      set_Tue(date)
    } else if (entity == "Wed") {
      set_Wed(date)
    } else if (entity == "Thu") {
      set_Thu(date)
    } else if(entity == "Fri") {
      set_Fri(date)
    } else if(entity == "Sat") {
      set_Sat(date)
    } else if(entity == "Sun") {
      set_Sun(date)
    }
  }

 
   // edit form
   const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 6 }}
    wrapperCol={{ span: 18 }}
    onFinish={onEditItem}
    autoComplete="off"
    form={editForm}
  >

    <Row gutter={[24,24]}>
      

    <Col span={24}>
        <Form.Item
          label="Type"
          name="Type"
          rules={[{ required: true, message: 'Please input Type!'}]}
        >      
          <Select>
          {
              filters && filters['Type'] &&  filters['Type'].filter((value) => value.value != "").map((data) => {
              return  <Select.Option value={data.value}>{data.text}</Select.Option>
               })
             } 
          </Select>
        </Form.Item>  
       </Col> 

      <Col span={24}>
        <Form.Item
          label="Name"
          name="Name"
          rules={[{ required: true, message: 'Please input Name!'}]}
        >      
          <Input/>
        </Form.Item>  
       </Col> 
      
      <Col span={24}>
        <Form.Item
          label="Standard"
          name="Standard"
          rules={[{ required: true, message: 'Please Select Standard'}]}

        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="Active"
          name="Active"
          rules={[{ required: true, message: 'Please input Active!'}]}
        >      
          <Select>
            <Select.Option value={'Y'}>Y</Select.Option>
            <Select.Option value={'N'}>N</Select.Option>

          </Select>
        </Form.Item>  
       </Col> 

    </Row>

    
    <div style={{textAlign: "end", marginBottom: "10px"}}>
      <Button type="primary" htmlType="submit" className="mr-3">
        {modalType == "EDIT" ? "Update" : "Add"}
      </Button>
    </div>
    
  </Form>
  )

 
 
  const panelTitle = "";
  const dataTableTitle = "HIMS Master Task List";
  
  const onWorkSaved = async (amount) => {}

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.UID)


      editForm.setFieldsValue({
        Type: row.Task,
        Name: row.Name,
        Standard: row.Standard,
        Active: row.Active
      })
  
      setModalTitle("Edit Item");
    } else {
      setModalTitle("Add User");
      setModalType("ADD");

    }

      setOpenAddEditModal(true)
      
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setModalTitle("Delete User");
    setModalType("DELETE");
    setOpenModal(true);
  }

  const onDeleteUser = async () => {

    
    setReload(false)
    await dispatch(crud.delete(entity, selectedRow.UID))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>Delete Item{selectedRow['UID']} ?</p>
      <div className="text-right mb-2">
        <Button type="danger" onClick={onDeleteUser}>Delete</Button>
      </div>
    </div> 
  )
 
  const dataTableColumns = [
    {
      title: "Action",
      dataIndex: "Action",
      width: 80,
      fixed: 'left'
    },
    {
      title: "Task",
      dataIndex: "Task",
      key: "Task",
      width: 400,
      
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      width: 300,
      filters: filters['Type'],
      filteredValue:filteredValue['Type'] || null,
    },
    {
      title: "Standard",
      dataIndex: "Standard",
      key: "Standard",
      width: 150,
      filters: filters['Standard'],
      filteredValue:filteredValue['Standard'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Standard").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Standard")[0].order : null
    },
  
    {
      title: "Active",
      dataIndex: "Active",
      key: "Active",
      width: 150,
      filters: [
        {text: 'Y',  value: 'Y'},
        {text: 'N',  value: 'N'},
        {text: '',  value: ''}
      ],
      filteredValue:filteredValue['Active'] || null  
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
    showFooter: false,
    onhandleSave,
    openEditModal,
    openAddModal,
    getItems,
    reload,
    getFilterValue,
    userList: users,
    onWorkSaved,
    onRowMarked,
    openingModal,
    confirmModal,
    AddIcon: true
  };

  const addEditModalConfig = {
    title: modalTitle,
    openModal: openAddEditModal,
    handleCancel,
    
    
  };

  const deleteConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    
  };
  

  {
  return users.length > 0 ? 
    <div>
      
     <FixedDataTableModule config={config} />

     <Modals config={addEditModalConfig} >
          {
            modalType == "EDIT" ? 
            editModal : null
          }
          {
            modalType == "ADD" ? 
            editModal : null
          }
          
      </Modals>

      <Modals config={deleteConfig} >
          
          {
            modalType == "DELETE" ? 
            deleteModal : null
          }

      </Modals>   
    </div>
     : null 
  }  
}
