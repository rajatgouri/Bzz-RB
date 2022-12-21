
import React, { useState } from "react";

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
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import  Socket  from "@/socket";
import moment from 'moment';
import { set } from "@antv/util";
import { mappedUser , getDate } from "@/utils/helpers";
import {  selectUsersList } from "@/redux/user/selectors";


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
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;


  const currentDate = getDate()
  
  const {current} = useSelector(selectAuth);
  

  const dispatch = useDispatch()

  React.useEffect(async () => {
    setUsers(mappedUser(usersList))
  }, [usersList])


  React.useEffect(async () => {

   

    const filteredResult = await request.list("himsuserschedule-filters");

    let EmpID = filteredResult.result['EmpID'].map(({EmpID})=> (EmpID)).sort().map((value) => ({text: value, value:value}))
    let UserEmail = filteredResult.result['UserEmail'].map((res)=> (res['User Email'])).sort().map((value) => ({text: value, value:value}))
    let Section = filteredResult.result['Section'].map(({Section})=> (Section)).sort().map((value) => ({text: value, value:value}))
    let Status = filteredResult.result['Status'].map(({Status})=> (Status)).sort().map((value) => ({text: value, value:value}))
    let Mon = filteredResult.result['Mon'].map(({Mon})=> (Mon ? Mon.split('T')[0] : "" )).sort().map((value) => ({text: value, value:value}))
    let Tue = filteredResult.result['Tue'].map(({Tue})=> (Tue ? Tue.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))
    let Wed = filteredResult.result['Wed'].map(({Wed})=> (Wed ? Wed.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))
    let Thu = filteredResult.result['Thu'].map(({Thu})=> (Thu ? Thu.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))
    let Fri = filteredResult.result['Fri'].map(({Fri})=> (Fri? Fri.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))
    let Sat = filteredResult.result['Sat'].map(({Sat})=> (Sat ? Sat.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))
    let Sun = filteredResult.result['Sun'].map(({Sun})=> (Sun ? Sun.split('T')[0] : "")).sort().map((value) => ({text: value, value:value}))

    let Obj = {
      EmpID,
      'User Email': UserEmail,
      Section,
      Status,
      Mon,
      Tue,
      Wed,
      Thu,
      Fri,
      Sat,
      Sun
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


  const entity = "himsuserschedule";

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


    value['Mon'] = Mon
    value['Tue'] = Tue
    value['Wed'] = Wed
    value['Thu'] = Thu
    value['Fri'] = Fri
    value['Sat'] = Sat
    value['Sun'] = Sun

    
    value['User Email'] = value.Email

    delete value['Email']


   
    if(modalType == "EDIT") {
      setReload(false)
      let response = await (request.update(entity, selectedId, value))
      notification.success({message: "Emp Updated Successfully!"})
      
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
      let response = await request.create(entity, value)
      if(response.success) {
        notification.success({message: "Emp Added Successfully!"})
        setReload(true)
        handleCancel()
      } else {
        notification.error({message: "Emp Already Exists!"})
      }
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
    labelCol={{ span: 9 }}
    wrapperCol={{ span: 15 }}
    onFinish={onEditItem}
    autoComplete="off"
    form={editForm}
  >

    <Row gutter={[24,24]}>
      
      <Col span={8}>
        <Form.Item
          label="Emp ID"
          name="EmpID"
          rules={[{ required: true, message: 'Please input Employee ID!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}

        >      
          <Input disabled={modalType == "EDIT" ? true : false}/>
        </Form.Item>  
       </Col>

       <Col span={8}>
        <Form.Item
          label="Email"
          name="Email"
          rules={[{ required: true, message: 'Please input Email!'},  {pattern: new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g), message: "Please enter valid email"}]}
        >      
          <Input/>
        </Form.Item>  
       </Col> 

      <Col span={8}>
        <Form.Item
          label="Name & Section"
          name="Name & Section"
          rules={[{ required: true, message: 'Please input Name & Section!'}]}
        >      
          <Input/>
        </Form.Item>  
       </Col> 
      
      <Col span={8}>
        <Form.Item
          label="Section"
          name="Section"
          rules={[{ required: true, message: 'Please Select Section'}]}

        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Status"
          name="Status"
          rules={[{ required: true, message: 'Please input Status!'}]}


        >      
          <Select>
             {
              filters && filters['Status'] &&  filters['Status'].filter((value) => value.value != "").map((status) => {
              return  <Select.Option value={status.value}>{status.text}</Select.Option>
               })
             } 
          </Select>
        </Form.Item>  
       </Col> 

       <Col span={8}>
        <Form.Item
          label="Start Date"
          name="StartDate"
          
        >      
          {
            StartDate ? 
          <DatePicker  style={{ width: "100%" }} defaultValue={moment(StartDate, dateFormat)} onChange={(d, date) => onDateChanges('StartDate', date)} />
            :
          <DatePicker  style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('StartDate', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.StartDate }</span>
          
        </Form.Item>
        
      </Col>

      

      <Col span={8}>
        <Form.Item
          label="Mon"
          name="Mon"
          
        >      
          {
            Mon ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Mon, dateFormat)} onChange={(d, date) => onDateChanges('Mon', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Mon', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Mon }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={8}>
        <Form.Item
          label="Tue"
          name="Tue"
          
        >      
          {
            Tue ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Tue, dateFormat)} onChange={(d, date) => onDateChanges('Tue', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Tue', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Tue }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={8}>
        <Form.Item
          label="Wed"
          name="Wed"
          
        >      
          {
            Wed ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Wed, dateFormat)} onChange={(d, date) => onDateChanges('Wed', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Wed', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Wed }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={8}>
        <Form.Item
          label="Thu"
          name="Thu"
          
        >      
          {
            Thu ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Thu, dateFormat)} onChange={(d, date) => onDateChanges('Thu', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Thu', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Thu }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={8}>
        <Form.Item
          label="Fri"
          name="Fri"
          
        >      
          {
            Fri ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Fri, dateFormat)} onChange={(d, date) => onDateChanges('Fri', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Fri', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Fri }</span>
          
        </Form.Item>
        
      </Col>


      <Col span={8}>
        <Form.Item
          label="Sat"
          name="Sat"
          
        >      
          {
            Sat ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Sat, dateFormat)} onChange={(d, date) => onDateChanges('Sat', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Sat', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Sat }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={8}>
        <Form.Item
          label="Sun"
          name="Sun"
          
        >      
          {
            Sun ? 
          <DatePicker showTime style={{ width: "100%" }} defaultValue={moment(Sun, dateFormat)} onChange={(d, date) => onDateChanges('Sun', date)} />
            :
          <DatePicker showTime style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('Sun', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.Sun }</span>
          
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

 
 
  const panelTitle = "HIMS Calendar Schedule";
  const dataTableTitle = "HIMS Staff Schedule";
  
  const onWorkSaved = async (amount) => {}

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.EmpID)


      editForm.setFieldsValue({
        EmpID: row.EmpID,
        'Name & Section': row['Name & Section'],
        Section: row.Section,
        Status: row.Status,
        'Email': row['User Email']
      })
  
      set_Mon(row.StartDate ? row.StartDate.split('T')[0] : "")
      set_Mon(row.Mon ? row.Mon.split('T')[0] : "")
      set_Tue(row.Tue ? row.Tue.split('T')[0] : "")
      set_Wed(row.Wed ? row.Wed.split('T')[0] : "")
      set_Thu(row.Thu ? row.Thu.split('T')[0] : "")
      set_Fri(row.Fri ? row.Fri.split('T')[0] : "")
      set_Sat(row.Sat ? row.Sat.split('T')[0] : "")
      set_Sun(row.Sun ? row.Sun.split('T')[0] : "")
      set_StartDate(row.StartDate ? row.StartDate.split('T')[0] : "")

      
      
      setModalTitle("Edit User");
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
    await dispatch(crud.delete(entity, selectedRow.EmpID))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>Delete User {selectedRow['User Email']} ?</p>
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
    // {
    //   title: "Emp ID",
    //   dataIndex: "EmpID",
    //   key: "EmpID",
    //   width: 120,
    //   filters: filters['EmpID'],
    //   filteredValue:filteredValue['EmpID'] || null,
    //   sorter: { multiple: 2},
    //   sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EmpID").length > 0) ?  filteredValue.sort.filter((value) => value.field == "EmpID")[0].order : null
    // },
    {
      title: "Email",
      dataIndex: "User Email",
      key: "User Email",
      width: 200,
      filters: filters['User Email'],
      filteredValue:filteredValue['User Email'] || null,
      sorter: { multiple: 3},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User Email").length > 0) ?  filteredValue.sort.filter((value) => value.field == "User Email")[0].order : null
    },
    {
      title: "Name & Section",
      dataIndex: "Name & Section",
      key: "Name & Section",
      width: 200,
      filters: filters['Name & Section'],
      filteredValue:filteredValue['Name & Section'] || null,
    },
    
    {
      title: "Section",
      dataIndex: "Section",
      key: "Section",
      width: 100,
      filters: filters['Section'],
      filteredValue:filteredValue['Section'] || null,
      sorter: { multiple: 4},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Section").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Section")[0].order : null
    }, 
    {
      title: "Mon",
      dataIndex: "Mon",
      key: "Mon",
      width: 80,
      filters: filters['Mon'],
      filteredValue:filteredValue['Mon'] || null,
      sorter: { multiple: 5},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Mon").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Mon")[0].order : null
    },
    {
      title: "Tue",
      dataIndex: "Tue",
      key: "Tue",
      width: 80,
      filters: filters['Tue'],
      filteredValue:filteredValue['Tue'] || null,
      sorter: { multiple: 6},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Tue").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Tue")[0].order : null
    },
    {
      title: "Wed",
      dataIndex: "Wed",
      key: "Wed",
      width: 80,
      filters: filters['Wed'],
      filteredValue:filteredValue['Wed'] || null,
      sorter: { multiple: 7},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Wed").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Wed")[0].order : null
    },
    {
      title: "Thu",
      dataIndex: "Thu",
      key: "Thu",
      width: 80,
      filters: filters['Thu'],
      filteredValue:filteredValue['Thu'] || null,
      sorter: { multiple: 8},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Thu").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Thu")[0].order : null
    },
    {
      title: "Fri",
      dataIndex: "Fri",
      key: "Fri",
      width: 80,
      filters: filters['Fri'],
      filteredValue:filteredValue['Fri'] || null,
      sorter: { multiple: 8},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Fri").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Fri")[0].order : null
    },
    {
      title: "Sat",
      dataIndex: "Sat",
      key: "Sat",
      width: 80,
      filters: filters['Sat'],
      filteredValue:filteredValue['Sat'] || null,
      sorter: { multiple: 9},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sat").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Sat")[0].order : null
    },
    {
      title: "Sun",
      dataIndex: "Sun",
      key: "Sun",
      width: 80,
      filters: filters['Sun'],
      filteredValue:filteredValue['Sun'] || null,
      sorter: { multiple: 10},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sun").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Sun")[0].order : null
    },
    {
      title: "FlexMinutes",
      dataIndex: "FlexMinutes",
      key: "FlexMinutes",
      width: 100,
      sorter: { multiple: 10},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FlexMinutes").length > 0) ?  filteredValue.sort.filter((value) => value.field == "FlexMinutes")[0].order : null
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
    width: 1200,
    
    
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
