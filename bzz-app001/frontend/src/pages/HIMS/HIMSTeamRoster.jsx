




import React, { useEffect, useState } from "react";

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
import { getDate, mappedUser, GetSortOrder } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'
import SortModal from '@/components/Sorter'



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
  const [filteredValue, setFilteredValue] = useState({
    'Section': "RB"
  })
  const [filters, setFilters] = useState([])
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const dateFormat = 'YYYY/MM/DD';
  const [CMPNY_SENIORITY_DT, set_CMPNY_SENIORITY_DT] = useState();
  const [EFFDT, set_EFFDT] = useState();
  const [ORIG_HIRE_DT, set_ORIG_HIRE_DT] = useState();
  const [HIRE_DT, set_HIRE_DT] = useState();
  const [TERMINATION_DT, set_TERMINATION_DT] = useState();
  const [errors , setErrors] = useState({})
  const [hasErrors, setHasErrors] = useState(false) 
  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  const [contractors, setContractors] = useState([])
  
  const [department, setDepartment] = useState([])
  var usDate = getDate();
  const currentDate = usDate 
  
  const {current} = useSelector(selectAuth);
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  
  useEffect(() => {
    setUsers(mappedUser(usersList))
  }, [usersList])

  const dispatch = useDispatch()


  React.useEffect(async () => {

    
    const [response, department,{result: result1}, {result: result2}] = await Promise.all([await request.list("admin"),  await request.list("himsteamroster-department"),await request.list(entity+"-columns", {id: current.EMPID}), await request.list('himsteamroster-contractor') ]);

    let usersList = response.result.filter(res => res.ManagementCard == 0 || res.ManagementCard == null ).map((user) => ({id: user.EMPID, name: user.Nickname, text: user.Nickname , value: user.Nickname , status: 'success'}))
    setUsers(usersList)
    setContractors(result2)
    let sections = ([...new Set(department.result.map(({Section})=> (Section)))].sort())
    let Section = ([...new Set(department.result.map(({Section})=> (Section)))].sort()).map((value) => ({text: value, value:value}))
    let EMPID = ([...new Set(department.result.map(({EMPID})=> (EMPID)))].sort()).map((value) => ({text: value, value:value}))
    let empstatus = department.result.map(({EMPL_STATUS})=> (EMPL_STATUS))
    empstatus.push('T')
    let EMPL_STATUS = ([...new Set(empstatus)].sort()).map((value) => ({text: value, value:value}))

    let FIRST_NAME = ([...new Set(department.result.map(({FIRST_NAME})=> (FIRST_NAME) == null ?  "" : (FIRST_NAME).trim()))].sort()).map((value) => ({text: value, value:value}))
    let MIDDLE_NAME = ([...new Set(department.result.map(({MIDDLE_NAME})=> (MIDDLE_NAME) == null ?  "" : (MIDDLE_NAME).trim()))].sort()).map((value) => ({text: value, value:value}))
    // let MIDDLE_NAME = ([...new Set(department.result.map(({MIDDLE_NAME})=> (MIDDLE_NAME)))].sort()).map((value) => ({text: value, value:value}))
    let EMAIL_ADDR = ([...new Set(department.result.map(({EMAIL_ADDR})=> (EMAIL_ADDR) == null ?  "" : (EMAIL_ADDR).trim()))].sort()).map((value) => ({text: value, value:value}))
    let DEPTNAME = ([...new Set(department.result.map(({DEPTNAME})=> (DEPTNAME) == null ?  "" : (DEPTNAME).trim()))].sort()).map((value) => ({text: value, value:value}))
    let Name_Section = ([...new Set(department.result.map(({Name_Section})=> (Name_Section) == null ?  "" : (Name_Section).trim() ))].sort()).map((value) => ({text: value, value:value}))
    let LoginName = ([...new Set(department.result.map(({LoginName})=> (LoginName) == null ?  "" : (LoginName).trim()))].sort()).map((value) => ({text: value, value:value}))
    let SUPERVISOR_NAME = ([...new Set(department.result.map(({SUPERVISOR_NAME})=> (SUPERVISOR_NAME) == null ?  "" : (SUPERVISOR_NAME).trim()))].sort()).map((value) => ({text: value, value:value}))
    
    let PER_ORG = ([...new Set(department.result.map(({PER_ORG})=> (PER_ORG) == null ?  "" : (PER_ORG).trim()))].sort()).map((value) => ({text: value, value:value}))
    let BUSINESS_TITLE = ([...new Set(department.result.map(({BUSINESS_TITLE})=> (BUSINESS_TITLE) == null ?  "" : (BUSINESS_TITLE).trim()) )].sort()).map((value) => ({text: value, value:value}))
    let SUPERVISOR_ID = ([...new Set(department.result.map(({SUPERVISOR_ID})=> (SUPERVISOR_ID) == null ?  "" : (SUPERVISOR_ID).trim()))].sort()).map((value) => ({text: value, value:value}))
    let DEPTID = ([...new Set(department.result.map(({DEPTID})=> (DEPTID) == null ?  "" : (DEPTID).trim()))].sort()).map((value) => ({text: value, value:value}))
    let JOBCODE = ([...new Set(department.result.map(({JOBCODE})=> (JOBCODE) == null ?  "" : (JOBCODE).trim()))].sort()).map((value) => ({text: value, value:value}))
    let LOCATION = ([...new Set(department.result.map(({LOCATION})=> (LOCATION) == null ?  "" : (LOCATION).trim()))].sort()).map((value) => ({text: value, value:value}))
    let ROLE = ([...new Set(department.result.map(({ROLE})=> (ROLE) == null ?  "" : (ROLE).trim()))].sort()).map((value) => ({text: value, value:value}))
    let JOBTITLE = ([...new Set(department.result.map(({JOBTITLE})=> (JOBTITLE) == null ?  "" : (JOBTITLE).trim()))].sort()).map((value) => ({text: value, value:value}))
    let WORK_PHONE = ([...new Set(department.result.map(({WORK_PHONE})=> (WORK_PHONE) == null ?  "" : (WORK_PHONE).trim()))].sort()).map((value) => ({text: value, value:value}))
    let AliasEmail = ([...new Set(department.result.map(({AliasEmail})=> (AliasEmail)))].sort()).map((value) => ({text: value, value:value}))
    let Contractor_Name = ([...new Set(department.result.map(({Contractor_Name})=> (Contractor_Name)))].sort()).map((value) => ({text: value, value:value}))
    let CMPNY_SENIORITY_DT = ([...new Set(department.result.map(({CMPNY_SENIORITY_DT})=> (CMPNY_SENIORITY_DT) == null ?  "" : (CMPNY_SENIORITY_DT).trim()))].sort()).map((value) => ({text: value, value:value}))
    let EFFDT = ([...new Set(department.result.map(({EFFDT})=> (EFFDT) == null ?  "" : (EFFDT).trim()))].sort()).map((value) => ({text: value, value:value}))
    let ORIG_HIRE_DT = ([...new Set(department.result.map(({ORIG_HIRE_DT})=> (ORIG_HIRE_DT) == null ?  "" : (ORIG_HIRE_DT).trim()))].sort()).map((value) => ({text: value, value:value}))
    let HIRE_DT = ([...new Set(department.result.map(({HIRE_DT})=> (HIRE_DT)))].sort()).map((value) => ({text: value, value:value}))
    let TERMINATION_DT = ([...new Set(department.result.map(({TERMINATION_DT})=> (TERMINATION_DT)))].sort()).map((value) => ({text: value, value:value}))


    let Obj = {
      EMPID,
      EMPL_STATUS,
      FIRST_NAME,
      MIDDLE_NAME,
      EMAIL_ADDR,
      DEPTNAME,
      Name_Section,
      LoginName,
      SUPERVISOR_NAME,
      PER_ORG,
      BUSINESS_TITLE,
      Section,
      SUPERVISOR_ID,
      DEPTID,
      JOBCODE,
      LOCATION,
      ROLE,
      JOBTITLE,
      WORK_PHONE,
      AliasEmail,
      Contractor_Name,
      CMPNY_SENIORITY_DT,
      EFFDT,
      ORIG_HIRE_DT,
      HIRE_DT,
      TERMINATION_DT
    }


    let tempSection = []
    sections.map((section) => {
      let result = department.result.filter((dept) => dept.Section == section)[0]
      tempSection.push(result)
    })

    setDepartment(tempSection)


    if(result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns)
    } 

    setColumns(true)
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
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => {
     
      return record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : ""
    },
      
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

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const entity = "himsteamroster";

  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const onChangeSupervisor  = (v) => {
    let supervisor = contractors['supervisorName'].filter(c => c.SUPERVISOR_NAME == v)[0] 
    editForm.setFieldsValue({
      'SUPERVISOR_ID': supervisor.SUPERVISOR_ID
    })
  }

  const onChangeSupervisorWithEMPID = (v) => {
    let supervisor = contractors['supervisorName'].filter(c => c.SUPERVISOR_ID == v)[0] 
    editForm.setFieldsValue({
      'SUPERVISOR_NAME': supervisor.SUPERVISOR_NAME
    })
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
    set_TERMINATION_DT(null)
    set_EFFDT(null)
    set_CMPNY_SENIORITY_DT(null)
    set_HIRE_DT(null)
    set_ORIG_HIRE_DT(null)
    setErrors({})
    setSortModal(false)
  }


    const getFilters = (data) => {
      let EMPL_STATUS =[
        {text: "A", value: "A"},
        {text: "D", value: "D"},
        {text: "P", value: "P"},
        {text: "L", value: "L"},
        {text: "T", value: "T"},
        {text: "", value: ""},
        {text: "Archive", value: "Archive"}

      ];

      let jobcode = data.map((d) => d.JOBCODE ? d.JOBCODE : "")
      jobcode.push("")
      
      let deptId = data.map((d) => d.DEPTID ? d.DEPTID : "")
      deptId.push("")

      let role = data.map((d) => d.ROLE ? d.ROLE : "")
      role.push("")

      let perorg = data.map((d) => d.PER_ORG ? d.PER_ORG : "")
      perorg.push("")
      
      let supervisor = data.map((d) => d.SUPERVISOR_NAME ? d.SUPERVISOR_NAME.trim() : "")
      supervisor.push()

      let business = data.map((d) => d.BUSINESS_TITLE? d.BUSINESS_TITLE.trim() : "")
      business.push("")

      let location = data.map((d) => d.LOCATION ? d.LOCATION : "")
      location.push("")


      let JOBCODE = [...new Set(jobcode)].sort().reverse().map(value => ({text: value, value: value}));
      let DEPTID = [...new Set(deptId)].sort().reverse().map(value => ({text: value, value: value}));
      let ROLE = [...new Set(role)].sort().reverse().map(value => ({text: value, value: value}));
      let PER_ORG = [...new Set(perorg)].sort().reverse().map(value => ({text: value, value: value}));
      let SUPERVISOR_NAME = [...new Set(supervisor)].sort().reverse().map(value => ({text: value, value: value}));
      let BUSINESS_TITLE = [...new Set(business)].sort().reverse().map(value => ({text: value, value: value}));
      let LOCATION = [...new Set(location)].sort().reverse().map(value => ({text: value, value: value}));
      let ShowTimeAccountability = [...new Set(data.map((d) => d.ShowTimeAccountability))].sort().reverse().map(value => ({text: value, value: value}));
      let Section = [
        {text: "RI", value: "RI"},
        {text: "DS", value: "DS"},
        {text: "OS", value: "OS"},
        {text: "CD", value: "CD"},
        {text: "XT", value: "XT"},
        {text: "AD", value: "AD"},
        {text: "RC", value: "RC"},
      ];

      

      // setFilters({
      //   EMPL_STATUS,
      //   JOBCODE,
      //   DEPTID,
      //   ROLE,
      //   PER_ORG,
      //   SUPERVISOR_NAME,
      //   BUSINESS_TITLE,
      //   LOCATION,
      //   Section,
      //   ShowTimeAccountability
      // })
    }

  const getItems = (data) => {

    if ( filters.length ==0 ) {
      getFilters(data)
    } 

    setHasErrors(true)
    setItems(data)
  } 



  const onEditItem =async (value) => {


    value['CMPNY_SENIORITY_DT'] = CMPNY_SENIORITY_DT
    value['EFFDT'] = EFFDT
    value['ORIG_HIRE_DT'] = ORIG_HIRE_DT
    value['HIRE_DT'] = HIRE_DT
    value['TERMINATION_DT'] = TERMINATION_DT
    value['NAME'] = value['LAST_NAME'] + ", " + value['FIRST_NAME']  + " " + (value['MIDDLE_NAME'] ? value['MIDDLE_NAME'] : "")
    value['DEPTNAME'] = department.filter((dept) => dept.Section == value['Section'])[0].DEPTNAME
    value['Section'] = value['Section']
    value['SubSection'] = value['ManagementAccess'] == 'Y' ? "AD" : "PB"
   
    if(modalType == "EDIT") {
      setReload(false)
      let response = await (request.update(entity, selectedId, value))
      if (!response.success) {
        notification.error({message: "EMP  Already Exists!"})  
        setReload(true)
        return
      }
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
      let response = await request.create(entity, value)
      if (!response.success) {
        notification.error({message: "EMP  Already Exists!"})  
        setReload(true)
        return
      } 
      setReload(true)
      handleCancel()

    }
  }

  const onDateChanges = (entity, date) => {
    delete errors[entity] 
    
    if(entity == 'CMPNY_SENIORITY_DT') {
      set_CMPNY_SENIORITY_DT(date)
    } else if (entity == "EFFDT") {
      set_EFFDT(date)
    } else if (entity == "ORIG_HIRE_DT") {
      set_ORIG_HIRE_DT(date)
    } else if (entity == "HIRE_DT") {
      set_HIRE_DT(date)
    } else if(entity == "TERMINATION_DT") {
      set_TERMINATION_DT(date)
    }
  }

  const onCheckError =() => {
    
    if (!CMPNY_SENIORITY_DT || CMPNY_SENIORITY_DT == "") {
      errors['CMPNY_SENIORITY_DT'] = "Please select CMPNY SEN DT"
      setErrors(errors)
    }
    if(!EFFDT || EFFDT == "") {
      errors['EFFDT'] = "Please select EFFDT"
      setErrors(errors)
    }
    if(!ORIG_HIRE_DT || ORIG_HIRE_DT == "") {
      errors['ORIG_HIRE_DT'] = "Please select ORG HIRE DT"
      setErrors(errors)
    }
    if(!HIRE_DT || HIRE_DT == "") {
      errors['HIRE_DT'] = "Please select HIRE DT"
      setErrors(errors)
    }

    setHasErrors(false)
    setErrors(errors)
    setTimeout(() => setHasErrors(true))
        
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
      
      <Col span={6}>
        <Form.Item
          label="Emp ID"
          name="EMPID"
          rules={[{ required: true, message: 'Please input Employee ID!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}

        >      
          <Input disabled={modalType == "EDIT" ? true : false}/>
        </Form.Item>  
       </Col>

      <Col span={6}>
        <Form.Item
          label="Emp Status"
          name="EMPL_STATUS"
          rules={[{ required: true, message: 'Please input Emp Status!'}]}


        >      
          <Select>
             {
              filters && filters['EMPL_STATUS'] &&  filters['EMPL_STATUS'].filter((value) => value.value != "").map((status) => {
              return  <Select.Option value={status.value}>{status.text}</Select.Option>
               })
             } 
          </Select>
        </Form.Item>  
       </Col> 
      
      <Col span={6}>
        <Form.Item
          label="First"
          name="FIRST_NAME"
          rules={[{ required: true, message: 'Please input First Name!'}]}

        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Middle"
          name="MIDDLE_NAME"
          
        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Last"
          name="LAST_NAME"
          rules={[{ required: true, message: 'Please input Last Name!'}]}

        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="LoginName"
          name="LoginName"
          rules={[{ required: true, message: 'Please input Login Name!'}]}

        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Email"
          name="EMAIL_ADDR"
          rules={[{ required: true, message: 'Please input Email!'},  {pattern: new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g), message: "Please enter valid email"}]}


        > 
          <Input />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Password"
          name="Password"
          rules={modalType== "EDIT" ? [] : [{ required: true, message: 'Please input First Name!'}]}


        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Mngmt?"
          name="ManagementAccess"
          rules={[{ required: true, message: 'Please Select Management Access!'}]}

        >      
          <Select>
              <Select.Option value={"1"}>Y</Select.Option>
              <Select.Option value={"0"}>N</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Admin ? "
          name="AdminAccess"
          rules={[{ required: true, message: 'Please Select Admin Access!'}]}

        >      
          <Select>
              <Select.Option value={'1'}>Y</Select.Option>
              <Select.Option value={'0'}>N</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Section"
          name="Section"
          rules={[{ required: true, message: 'Please Select Department'}]}

        >      
          <Select>
            {
              filters && filters['Section'] &&  filters['Section'].filter((value) => value.value != "").map((status) => {
              return  <Select.Option value={status.value}>{status.text}</Select.Option>
               })
             } 
          </Select>
        </Form.Item>
      </Col>

{/* 
      <Col span={6}>
        <Form.Item
          label="Sub Section"
          name="SubSection"
          rules={[{ required: true, message: 'Please enter Sub section'}]}
        >      
          <Input/>
        </Form.Item>
      </Col> */}
      

      <Col span={6}>
        <Form.Item
          label="PER ORG"
          name="PER_ORG"

        >      
          <Select>
            {
              filters && filters['PER_ORG'] &&  filters['PER_ORG'].filter((value) => value.value != "").map((status) => {
              return  <Select.Option value={status.value}>{status.text}</Select.Option>
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Supervisor"
          name="SUPERVISOR_NAME"

        >      
          <Select onChange={onChangeSupervisor}>
            {
              filters && filters['SUPERVISOR_NAME'] &&  filters['SUPERVISOR_NAME'].filter((value) => value.value != "").map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Supervisor ID"
          name="SUPERVISOR_ID"

        >      
          <Select onChange={onChangeSupervisorWithEMPID}>
            {
              filters && filters['SUPERVISOR_ID'] &&  filters['SUPERVISOR_ID'].filter((value) => value.value != "").map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="CMP SEN DT"
          name="CMPNY_SENIORITY_DT"
          
        >      
          {
            CMPNY_SENIORITY_DT ? 
          <DatePicker style={{ width: "100%" }} defaultValue={moment(CMPNY_SENIORITY_DT, dateFormat)} onChange={(d, date) => onDateChanges('CMPNY_SENIORITY_DT', date)} />
            :
          <DatePicker style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('CMPNY_SENIORITY_DT', date)} />

          }
          
            <span className="ant-form-item-explain">{errors.CMPNY_SENIORITY_DT }</span>
          
        </Form.Item>
        
      </Col>

      <Col span={6}>
        <Form.Item
          label="EFFDT"
          name="EFFDT"

        >      
          {
             EFFDT ?
          <DatePicker style={{ width: "100%" }} defaultValue={moment(EFFDT, dateFormat)} onChange={(d, date) => onDateChanges('EFFDT', date)} />
            :
          <DatePicker style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('EFFDT', date)} />

          }
          <span className="ant-form-item-explain">{errors.EFFDT }</span>

        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="ORG HIRE DT"
          name="ORIG_HIRE_DT"

        >      
          {
            ORIG_HIRE_DT ?
            <DatePicker style={{ width: "100%" }} defaultValue={moment(ORIG_HIRE_DT, dateFormat)} onChange={(d, date) => onDateChanges('ORIG_HIRE_DT', date)} />
            :
          <DatePicker style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('ORIG_HIRE_DT', date)} />

          }
          <span className="ant-form-item-explain">{errors.ORIG_HIRE_DT }</span>

        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="HIRE DT"
          name="HIRE_DT"

        >      
        {
         HIRE_DT ? 
         <DatePicker style={{ width: "100%" }} defaultValue={moment(HIRE_DT, dateFormat)} onChange={(d, date) => onDateChanges('HIRE_DT', date)} />
          :
          <DatePicker style={{ width: "100%" }}  onChange={(d, date) => onDateChanges('HIRE_DT', date)} />
        }
          <span className="ant-form-item-explain">{errors.HIRE_DT }</span>

        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="TERM Date"
          name="TERMINATION_DT"

        >      
          {
            TERMINATION_DT ? 
          <DatePicker style={{ width: "100%" }} defaultValue={moment(TERMINATION_DT, dateFormat)} onChange={(d, date) => onDateChanges('TERMINATION_DT', date)} />
            :
          <DatePicker style={{ width: "100%" }} onChange={(d, date) => onDateChanges('TERMINATION_DT', date)} />  
          }

        </Form.Item>
      </Col>

    <Col span={6}>
      <Form.Item
          label="Business Title"
          name="BUSINESS_TITLE"

        >      
          <Select >
            {
              filters && filters['BUSINESS_TITLE'] &&  filters['BUSINESS_TITLE'].filter((value) => value.value != "").map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Job Code"
          name="JOBCODE"

        >      
          <Select >
            {
              filters && filters['JOBCODE'] &&  filters['JOBCODE'].map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Location"
          name="LOCATION"

        >      
          <Select >
            {
              filters && filters['LOCATION'] &&  filters['LOCATION'].map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Role"
          name="ROLE"

        >      
          <Select >
            {
              filters && filters['ROLE'] &&  filters['ROLE'].map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Job Title"
          name="JOBTITLE"

        >      
          <Input></Input>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Work Phone"
          name="WORK_PHONE"

        >      
          <Input></Input>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Contractor"
          name="Contractor_Name"
        >      
          <Input/>
        </Form.Item>
      </Col>
      
      <Col span={6}>
      <Form.Item
          label="Alias Email"
          name="AliasEmail"
        >      
          <Input/>
        </Form.Item>
      </Col>

      <Col span={6}>
      <Form.Item
          label="Show Time?"
          name="ShowTimeAccountability"
        >      
          <Select >
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

 
 
  const panelTitle = "The Hims Team";
  const dataTableTitle = "Master Staff List";
  
  const onWorkSaved = async (amount) => {}

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.EMPID)


      editForm.setFieldsValue({
        FIRST_NAME:row.FIRST_NAME,
        MIDDLE_NAME: row.MIDDLE_NAME,
        LAST_NAME: row.LAST_NAME,
        EMAIL_ADDR: row.EMAIL_ADDR,
        EMPL_STATUS: row.EMPL_STATUS,
        ManagementAccess: row.ManagementAccess == 'Y' ? 'Y' : 'N',
        AdminAccess: row.AdminAccess == 'Y' ? 'Y' : 'N',
        PER_ORG: row.PER_ORG,
        BUSINESS_TITLE: row.BUSINESS_TITLE,
        JOBCODE: row.JOBCODE,
        LOCATION: row.LOCATION,
        ROLE: row.ROLE,
        JOBTITLE: row.JOBTITLE,
        WORK_PHONE: row.WORK_PHONE,
        ShowTimeAccountability: row.ShowTimeAccountability,
        Contractor_Name: row.Contractor_Name ,
        LoginName: row.LoginName,
        Section: row.Section,
        // SubSection: row.SubSection,
        EMPID: row.EMPID,
        SUPERVISOR_NAME: row.SUPERVISOR_NAME,
        AliasEmail: row.AliasEmail,
        'SUPERVISOR_ID' :row['SUPERVISOR_ID']
      })
  
      set_CMPNY_SENIORITY_DT(row.CMPNY_SENIORITY_DT ? row.CMPNY_SENIORITY_DT.split('T')[0] : "")
      set_EFFDT(row.EFFDT ? row.EFFDT.split('T')[0] : "")
      set_ORIG_HIRE_DT(row.ORIG_HIRE_DT ? row.ORIG_HIRE_DT.split('T')[0]: "")
      set_HIRE_DT(row.HIRE_DT ? row.HIRE_DT.split('T')[0] : "")
      set_TERMINATION_DT(row.TERMINATION_DT ?  row.TERMINATION_DT.split('T')[0] : "")

      
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
    await dispatch(crud.delete(entity, selectedRow.EMPID))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>Delete User {selectedRow.EMAIL_ADDR} ?</p>
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
      fixed: 'left',
      order:1
    },
    {
      title: "Emp ID",
      dataIndex: "EMPID",
      key: "EMPID",
      width: 130,
      filters: filters['EMPID'],
      filterSearch: true,
      order:2,
      filteredValue:filteredValue['EMPID'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EMPID").length > 0) ?  filteredValue.sort.filter((value) => value.field == "EMPID")[0].order : null
    },
    {
      title: "Emp Status",
      dataIndex: "EMPL_STATUS",
      key: "EMPL_STATUS",
      width: 130,
      filters: filters['EMPL_STATUS'],
      filterSearch: true,
      order:3,
      filteredValue:filteredValue['EMPL_STATUS'] || null,
      sorter: { multiple: 3},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EMPL_STATUS").length > 0) ?  filteredValue.sort.filter((value) => value.field == "EMPL_STATUS")[0].order : null
    },
    {
      title: "First Name",
      dataIndex: "FIRST_NAME",
      key: "FIRST_NAME",
      width: 150,
      filters: filters['FIRST_NAME'],
      filterSearch: true,
      order:4,
      filteredValue:filteredValue['FIRST_NAME'] || null,
      sorter: { multiple: 4},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FIRST_NAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "FIRST_NAME")[0].order : null
    },
    {
      title: "Middle Name",
      dataIndex: "MIDDLE_NAME",
      key: "MIDDLE_NAME",
      width: 150,
      order:5,
      filters: filters['MIDDLE_NAME'],
      filterSearch: true,

      filteredValue:filteredValue['MIDDLE_NAME'] || null,
      sorter: { multiple: 5},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MIDDLE_NAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "MIDDLE_NAME")[0].order : null
    },
    {
      title: "Last Name",
      dataIndex: "LAST_NAME",
      key: "LAST_NAME",
      width: 150,
      order:6,
      ...getColumnSearchProps("LAST_NAME"),
      filteredValue:filteredValue['LAST_NAME'] || null,
      sorter: { multiple: 6},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "LAST_NAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "LAST_NAME")[0].order : null
    },
    {
      title: "Email",
      dataIndex: "EMAIL_ADDR",
      key: "EMAIL_ADDR",
      width: 160,
      filters: filters['EMAIL_ADDR'],
      filterSearch: true,
      order:7,
      filteredValue:filteredValue['EMAIL_ADDR'] || null,
      sorter: { multiple: 7},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EMAIL_ADDR").length > 0) ?  filteredValue.sort.filter((value) => value.field == "EMAIL_ADDR")[0].order : null
    },
    
    
    {
      title: "Section",
      dataIndex: "Section",
      key: "Section",
      width: 130,
      filters: filters['Section'],
      filterSearch: true,
      order:8,
      filteredValue:filteredValue['Section'] || null,
      sorter: { multiple: 8},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Section").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Section")[0].order : null

    },
    {
      title: "SA Section",
      dataIndex: "SA_Section",
      key: "SA_Section",
      width: 100,
      filters: [
        { text: "HIMS", value: 'HIMS' },
        { text: "RC", value: "RC" },
        { text: "", value: "null" }
      ],
      filterSearch: true,
      order:9,
      filteredValue:filteredValue['SA_Section'] || null,
    }, 
    {
      title: "Dept Name",
      dataIndex: "DEPTNAME",
      key: "DEPTNAME",
      width: 200,
      filters: filters['DEPTNAME'],
      filterSearch: true,
      order:10,
      filteredValue:filteredValue['DEPTNAME'] || null,
      sorter: { multiple: 9},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DEPTNAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DEPTNAME")[0].order : null
      
    },
    {
      title: "Name Section",
      dataIndex: "Name_Section",
      key: "Name_Section",
      width: 150,
      filters: filters['Name_Section'],
      filterSearch: true,
      order:11,
      filteredValue:filteredValue['Name_Section'] || null,
      sorter: { multiple: 10},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Name_Section").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Name_Section")[0].order : null
      
    },
    {
      title: "PER ORG",
      dataIndex: "PER_ORG",
      key: "PER_ORG",
      width: 120,
      filters: filters['PER_ORG'],
      filterSearch: true,
      order:12,
      filteredValue:filteredValue['PER_ORG'] || null,
      sorter: { multiple: 11},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PER_ORG").length > 0) ?  filteredValue.sort.filter((value) => value.field == "PER_ORG")[0].order : null
      
    },

    {
      title: "Login Name",
      dataIndex: "LoginName",
      key: "LoginName",
      width: 130,
      order:13,
      filters: filters['LoginName'],
      filterSearch: true,

      filteredValue:filteredValue['LoginName'] || null,
      sorter: { multiple: 12},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "LoginName").length > 0) ?  filteredValue.sort.filter((value) => value.field == "LoginName")[0].order : null
      
    },
    {
      title: "Supervisor Name",
      dataIndex: "SUPERVISOR_NAME",
      key: "SUPERVISOR_NAME",
      width: 180,
      filters: filters['SUPERVISOR_NAME'],
      filterSearch: true,
      order:14,
      filteredValue:filteredValue['SUPERVISOR_NAME'] || null,
      sorter: { multiple: 13},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SUPERVISOR_NAME").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SUPERVISOR_NAME")[0].order : null
      
    },
    {
      title: "CMPNY SENIORITY DT",
      dataIndex: "CMPNY_SENIORITY_DT",
      key: "CMPNY_SENIORITY_DT",
      width: 200,
      sorter: { multiple: 14},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CMPNY_SENIORITY_DT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "CMPNY_SENIORITY_DT")[0].order : null,
      ...getColumnSearchProps("CMPNY_SENIORITY_DT"),
      filteredValue:filteredValue['CMPNY_SENIORITY_DT'] || null,
      order:15
      
    },
    {
      title: "BUSINESS TITLE",
      dataIndex: "BUSINESS_TITLE",
      key: "BUSINESS_TITLE",
      width: 150,
      filters: filters['BUSINESS_TITLE'],
      filterSearch: true,
      order:16,
      filteredValue:filteredValue['BUSINESS_TITLE'] || null,
      sorter: { multiple: 14},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "BUSINESS_TITLE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "BUSINESS_TITLE")[0].order : null,

    },
    {
      title: "EFFDT",
      dataIndex: "EFFDT",
      key: "EFFDT",
      width: 150,
      sorter: { multiple: 15},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EFFDT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "EFFDT")[0].order : null,
      ...getColumnSearchProps("EFFDT"),
      filteredValue:filteredValue['EFFDT'] || null,
      order:17
    },
    {
      title: "ORIG HIRE DT",
      dataIndex: "ORIG_HIRE_DT",
      key: "ORIG_HIRE_DT",
      width: 150,
      sorter: { multiple: 16},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ORIG_HIRE_DT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "ORIG_HIRE_DT")[0].order : null,
      ...getColumnSearchProps("ORIG_HIRE_DT"),
      filteredValue:filteredValue['ORIG_HIRE_DT'] || null,
      order:18
    },
    {
      title: "HIRE DT",
      dataIndex: "HIRE_DT",
      key: "HIRE_DT",
      width: 130,
      sorter: { multiple: 17},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HIRE_DT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "HIRE_DT")[0].order : null,
      ...getColumnSearchProps("HIRE_DT"),
      filteredValue:filteredValue['HIRE_DT'] || null,
      order:19

    },
    {
      title: "TERMINATION DT",
      dataIndex: "TERMINATION_DT",
      key: "TERMINATION_DT",
      width: 180,
      sorter: { multiple: 18},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "TERMINATION_DT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "TERMINATION_DT")[0].order : null,
      ...getColumnSearchProps("TERMINATION_DT"),
      filteredValue:filteredValue['TERMINATION_DT'] || null,
      order:20
    },
    {
      title: "Supervisor ID",
      dataIndex: "SUPERVISOR_ID",
      key: "SUPERVISOR_ID",
      width: 150,
      sorter: { multiple: 19},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SUPERVISOR_ID").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SUPERVISOR_ID")[0].order : null,
      ...getColumnSearchProps("SUPERVISOR_ID"),
      filteredValue:filteredValue['SUPERVISOR_ID'] || null,
      order:21

    },
    {
      title: "DEPT ID",
      dataIndex: "DEPTID",
      key: "DEPTID",
      width: 130,
      filters: filters['DEPTID'],
      filterSearch: true,
      order:22,
      filteredValue:filteredValue['DEPTID'] || null,
      sorter: { multiple: 20},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DEPTID").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DEPTID")[0].order : null,
   

    },
    {
      title: "Job Code",
      dataIndex: "JOBCODE",
      key: "JOBCODE",
      width: 130,
      filters: filters['JOBCODE'],
      filterSearch: true,
      order:23,
      filteredValue:filteredValue['JOBCODE'] || null,
      sorter: { multiple: 21},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "JOBCODE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "JOBCODE")[0].order : null,

    },
    {
      title: "Location",
      dataIndex: "LOCATION",
      key: "LOCATION",
      width: 150,
      filters: filters['LOCATION'],
      filterSearch: true,
      order:24,
      filteredValue:filteredValue['LOCATION'] || null,
      sorter: { multiple: 22},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "LOCATION").length > 0) ?  filteredValue.sort.filter((value) => value.field == "LOCATION")[0].order : null,

    },
    {
      title: "Role",
      dataIndex: "ROLE",
      key: "ROLE",
      width: 250,
      filters: filters["ROLE"],
      filterSearch: true,
      order:25,
      filteredValue:filteredValue['ROLE'] || null,
      sorter: { multiple: 23},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ROLE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "ROLE")[0].order : null,

    },
    {
      title: "Job Title",
      dataIndex: "JOBTITLE",
      key: "JOBTITLE",
      width: 250,
      order:26,
      filters: filters["JOBTITLE"],
      filterSearch: true,

      filteredValue:filteredValue['JOBTITLE'] || null,
      sorter: { multiple: 23},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "JOBTITLE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "JOBTITLE")[0].order : null,

    },
    {
      title: "Work Phone",
      dataIndex: "WORK_PHONE",
      key: "WORK_PHONE",
      width: 150,
      filters: filters['WORK_PHONE'],
      filterSearch: true,
      order:28,
      filteredValue:filteredValue['WORK_PHONE'] || null,
      sorter: { multiple: 24},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "WORK_PHONE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "WORK_PHONE")[0].order : null
    },
    {
      title: "Alias Email",
      dataIndex: "AliasEmail",
      key: "AliasEmail",
      width: 150,
      filters: filters['AliasEmail'],
      filterSearch: true,
      order: 29,
      filteredValue:filteredValue['AliasEmail'] || null,
      sorter: { multiple: 25},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "AliasEmail").length > 0) ?  filteredValue.sort.filter((value) => value.field == "AliasEmail")[0].order : null
    },
    {
      title: "ShowTime",
      dataIndex: "ShowTimeAccountability",
      key: "ShowTimeAccountability",
      width: 120,
      filters: [
        {text:'Y' , value: 'Y'},
        {text:'N' , value: 'N'}

      ],
      filterSearch: true,
      order:30,
      filteredValue:filteredValue['ShowTimeAccountability'] || null,
      
    }  ,
    {
      title: "Password",
      dataIndex: "Password",
      width: 120,
      order:31
    },
    
    {
      title: "Management",
      dataIndex: "ManagementAccess",
      key: "ManagementAccess",
      width: 130,
      filters: [
        { text: "Y", value: '1' },
        { text: "N", value: "0" },
        { text: "", value: "null" }

      ],
      filterSearch: true,
      order:32,
      filteredValue:filteredValue['ManagementAccess'] || null,
    }, 
    {
      title: "Admin",
      dataIndex: "AdminAccess",
      key: "AdminAccess",
      width: 80,
      filters: [
        { text: "Y", value: '1' },
        { text: "N", value: "0" },
        { text: "", value: "null" }
      ],
      filterSearch: true,
      order:33,
      filteredValue:filteredValue['AdminAccess'] || null,
    }, 
    
    {
      title: "Contractor Name",
      dataIndex: "Contractor_Name",
      key: "Contractor_Name",
      width: 200,
      filters: filters['Contractor_Name'],
      filterSearch: true,
      order:34,
      filteredValue:filteredValue['Contractor_Name'] || null,
      sorter: { multiple: 25},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Contractor_Name").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Contractor_Name")[0].order : null
    },
    
  ];

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
 

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
  

  const openSortModal = () => {
    setSortModal(true)
  }

  const onSort = async (data) => {

    setReload(false)
    var x = {}

    data.map((d, i ) =>  {
        x[d.dataIndex] =  i

    })
    x.EMP = current.EMPID
    await request.create(entity+ "-columns" , x)
    handleCancel()
    setTimeout(() => setReload(true), 1000)
    
    notification.success({message: "Please Refesh page!"})

  }

  if(columns) {

    
    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i].order ? dataColumns[i].order : d.order
      return d
    })


    
    
    cols = cols.sort(GetSortOrder('order'))

    const sortModalConfig = {
      title: "Column Sort",
      openModal: sortModal,
      handleCancel,
      columns: cols,
      onSort:onSort
    };


    const config = {
      entity,
      panelTitle,
      dataTableTitle,
      ENTITY_NAME,
      CREATE_ENTITY,
      ADD_NEW_ENTITY,
      UPDATE_ENTITY,
      DATATABLE_TITLE,
      dataTableColumns: cols,
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
      AddIcon: true,
      openSortModal: openSortModal
    };


  return  columns ?
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

      <SortModal config={sortModalConfig} ></SortModal>
    </div>
   : null

}   else {
  return null
}
}

