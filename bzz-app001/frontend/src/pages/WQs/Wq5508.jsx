
import React, { useState } from "react";

import FullDataTableModule from "@/modules/FullDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col, Select, notification } from "antd";
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
import GreenDot from "assets/images/green-dot.png"
import  Socket  from "@/socket";
import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";
import { getDate, mappedUser } from "@/utils/helpers";
import {selectUsersList} from '@/redux/user/selectors'



const { Option } = Select;

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function Wq5508() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId]= useState("");
  const [reload, setReload] = useState(true);
  const [selectedRow,setSelectedRow] = useState("");
  const [loaded, setLoaded] = useState(false)
  const [filters, setFilters] = useState({});
  const [hasFilters, setHasFilters] = useState(false);
  const [filtersBackup, setFiltersBackup] = useState({})


  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;


  const currentDate = getDate()
  
  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const {current} = useSelector(selectAuth);
  const [currentUser, setCurrentUser] = useState();
  const [reset, setReset] = useState(false)
  const [filteredValue, setFilteredValue] = useState({
    UserAssigned: current.managementAccess ? [] :  [current.name],
    Status: current.managementAccess ? null :  ['Review'],
    'Sess Amount': null,
    'Process Type': ['Expedite'],
    'Notes': null,
    'Aging Days': null,
    'Svc Date': null,
    'Patient': null,
    'CPT Codes': null,
    'Primary Coverage': null,
    'Study Type': null,
    'Research IRB': null,
    sort: []

  })

  const dispatch = useDispatch()

  const defaultColors = [
    { text: "Done", color: "#BEE6BE" , selected: false},
    { text: "Pending", color: "#FAFA8C" ,selected: false},
    { text: "Misc", color: "#E1A0E1" , selected: false},
    { text: "Deferred", color: "#9EE6FF" , selected: false},
    { text: "Review", color: "#FFFFFF" , selected: false},
  ]

  const billingColorData = {
    EMPID: 1,
    User: "Admin",
    Color1: "#BEE6BE",
    Color2: "#FAFA8C",
    Color3: "#F0C878",
    Color4: "#E1A0E1",
    Color5: "#9EE6FF",
    Color6: "#FFFFFF",
    Category1: "Done",
    Category2: "Pending",
    Category4: "Misc",
    Category5: "Deferred",
    Category6: "Review",
  }

  const load = async () => {
    const [{result: result1}] = await Promise.all([ await request.list(entity+"-columns", {id: current.EMPID})  ]);

    if(result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns)
    } 

    setColumns(true)
  }

  const loadColors = async () => {
    const [{ result = [] }] = await Promise.all([await request.read('billingcolor', 1)]);


    if (result.length === 0) {
      await request.create('billingcolor', billingColorData);
      setLoaded(true)
      return setDataTableColorList(defaultColors)
    }

    setDataTableColorList([
      { text: result[0].Category1, color: result[0].Color1, selected: false },
      { text: result[0].Category2, color: result[0].Color2, selected: false },
      { text: result[0].Category4, color: result[0].Color4, selected: false },
      { text: result[0].Category5, color: result[0].Color5, selected: false },
      { text: result[0].Category6, color: result[0].Color6, selected: false },
    ])

  
  }

  React.useEffect(() => {

    load();
    loadColors()
    setUsers(mappedUser(usersList.filter((u) => (u.SubSection == 'PB' || u.SubSection == 'RBB') && u.First != 'Adrienne' )))


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

  const entity = "wq5508";
  const loggerEntity = "wq5508Logger";
  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const onNotesAction = (id, status) => {
    let item = items.filter((item) => item.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name, MRN: item['Patient MRN'],Status: status, DateTime: currentDate }))
  }


  const onHandleColorChange = async (selectedRows, data, selectedRowID)  => {
    
    if(selectedRows.length > 0) {
      setReload(false)
      await request.create(entity + "-color" , { items, selectedRows, data, selectedRowID})
      setReload(true)

      // await request.create(entity + "-logger", {items, selectedRows, data, selectedRowID} )
    const timer = () => new Promise(res => setTimeout(res, 100))
    for (var i = 0; i < selectedRows.length ; i++) {

      let item = items.filter((item) => item.ID == selectedRows[i])[0]
    
      await dispatch(crud.create(loggerEntity, {IDWQ5508: selectedRows[i], UserName: current.name, MRN: item['Patient MRN'] ,Color : data.color, Status: selectedRowID ?   "Finish -" + data.text1 : data.text, DateTime: currentDate}))
      
      if(i + 1 == selectedRows.length ) {
        setTimeout(() => {
          Socket.emit('update-wqs');
        }, 1500)
      }

      await timer(); 
    }
  }

  }


  const handleSaveColor = async(EMPID,data ) => {
    await request.update("billingcolorwq5508", EMPID, data);
    loadColors()
  }

  const getDefaultColors = (cb) => {
    cb(defaultColors)
  }

  const getPreviousColors = (cb) => {
    load()
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
    setSortModal(false)
  }

  const getFullList = async (data, scrubIrb, filter) => {
    

    if(data) {

    var scrubIRBs = data.scrubIRBs
    const username = data.username

    if(filter['Status'] == null || filter['Status'].length ==0) {
      filter['Status'] =  current.managementAccess ? ['Done'] : ['Review']
    }

    // if(username !== currentUser  && filter['Status'] != filters['Status']) {

        setCurrentUser(username)

        let filterObject = {}

        let {result} = await request.list1(entity + '-filters', filter)
        data = result.filters
        data.map((d) => {

        
        let item3 = d.column 
        
           filterObject[item3] = ([...new Set(d.recordset.sort((a,b) => b[d.column] - a[d.column]))].map(item => ({text: item[d.column], value: item[d.column]})))



       })

     
      setFilters(() =>  filterObject ) 

    // }


   

  }
    
  }


  const getItems = (data) => {

    
    setItems(data)
  } 

  const onEditItem = (value) => {
    onhandleSave({ID: selectedId, Notes: value.Notes? value.Notes.trim() : null})
    setOpenModal(false)
  }

  const onCopied = (id,mrn) => {
    dispatch(crud.create(loggerEntity, {IDWQ5508: id, UserName: current.name, Color : "", Status: "Copy MRN", DateTime: currentDate, MRN: mrn}))
  }

  const openFindModal = (dataSource) => {
    
    
    setModalType("Find");
    setModalTitle("Assign to");
    setOpenModal(true)
  }
  

  
  const onRowMarked = async (type, row, value) => {
    setReload(false)
    let obj = {}
    if(type == 'Error') {
      obj = {Error: (value ? '0' : '1')}
      if(!value) { openEditModal(row.ID) }
    } else {
      obj = {Correct: ( value  == null ?  null : value.toString()   )}
    }
    await dispatch(crud.update(entity, row.ID, obj))
    setReload(true)
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
    id="notes-form"
    className="notes-form"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >      
      <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
    </Form.Item>
    
    <Form.Item  className="notes-form text-end" style={{marginBottom: "0px", marginTop: "10px"}}>
      <Button type="primary" htmlType="submit"  >
        Update
      </Button>
    </Form.Item>
  </Form>
  )


  const onReplaceUser =  async (value) => {
    // setReload(false)
    
    // filteredValue['IDs'] =  (findModalDataSource.map(item => item.ID))
    // console.log(filteredValue)

    // delete filteredValue['sort']
    // // filteredValue.Status = ["Review"]
    // await request.post('wq1075-user', {user: value.User, filter: filteredValue} );
    // notification.success({ message: "User Assigned!", duration: 3 })
    // userForm.resetFields()
    // setOpenModal(false)
    // setReload(true)

    if(typeof value.User == 'string') {
      value.User = [value.User]
    }

    setOpenModal(false)
    setReload(false)
    await request.post('wq5508-user', {value});
    setReload(true)
    userForm.resetFields()
    notification.success({ message: "User assigned successully!", duration: 3 })

    }


  const userModal = (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onReplaceUser}
      // onFinishFailed={onEditFailed}
      autoComplete="off"
      form={userForm}
    >

      <Form.Item
        label="User"
        name="User"
        rules={[
          {
            required: true,
          },
        ]}
      >
          
          <Select style={{ width: "100%" }} mode="multiple" >
            {
              users.map((user, index) => {
                return <Option key={index} value={user.name}>{user.name}</Option>
              })
            }
          </Select>
      </Form.Item>


      <Form.Item
        label="Process Type"
        name="Process Type"
        rules={[
          {
            required: true,
          },
        ]}
      >

          <Select style={{ width: "100%" }}  >
            <Option value="Expedite">Expedite</Option>
            <Option value="Standard">Standard</Option>
          </Select>
      </Form.Item>

      <Form.Item
        label="Status"
        name="Status"
        rules={[
          {
            required: true,
          },
        ]}
      >

          <Select style={{ width: "100%" }}  >
        
            <Option value="Done">Done</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Misc">Misc</Option>
            <Option value="Deferred">Deferred</Option>
            <Option value="Review">Review</Option>
            
          </Select>
      </Form.Item>

      <Form.Item
        label="User Assigned"
        name="UserAssigned"
      >
          <Select style={{ width: "100%" }}  >
            {
              users.map((user, index) => {
                return <Option key={index} value={user.name}>{user.name}</Option>
              })
            }
            <Option key={100} value={""}>{""}</Option>

          </Select>
      </Form.Item>

      <Form.Item
        label="User Logged"
        name="UserLogged"
        
      >

          <Select style={{ width: "100%" }}  >
            {
              users.map((user, index) => {
                return <Option key={index} value={user.name}>{user.name}</Option>
              })
              
            }
            <Option key={100} value={""}>{""}</Option>
          </Select>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 19 }}>
        <Button type="primary" htmlType="submit" className="">
          Assign
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

  const panelTitle = "WQ 5508";
  const dataTableTitle = "WQ 5508";
  const progressEntity = "wq5508progress";
  const workEntity = "wq5508Work";
  const showProcessFilters = true;


  const onWorkSaved = async (amount) => {
    

    dispatch(crud.create(workEntity, {}));
  }

  

  const updateTime = async (id, value, cb, ent, entry) => {

    

    let item = items.filter((item) => item.ID == id)[0]

    value.id = id
    value['Process Type'] = item['Process Type'];
    let status = ''

    if(ent == 'Stop') {
      value.Status = entry.text1
      await request.create('wq5508-updatetime',  value)
    cb(true)

    } else {
      status = ent
    cb(true)

    }     


    if (status == "") {
      return 
    }
    
    
    if(typeof id == 'number') {
      let item = items.filter((item) => item.ID == id)[0]
      
      dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
    } else {
      let item = items.filter((item) => item.ID == id[0])[0]
      if(item) {
        dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate })) 
      }
    }
  }




  const dataTableColumns = [
    {
      title: "START", width: 100, dataIndex: "START" ,
      align: 'center',
      order: 1
    },
    // (
    //   filteredValue['Process Type'] == 'Standard' ?
    //     (
    //       {
      
    //         title: "Answer", width: 90, dataIndex: "Answer" , 
    //         order: 2
    //       }
    //     )
    //     : {
    //       dataIndex : "Answer", order: 2
    //     }
    // ),

    (
      filteredValue['Process Type'] == 'Standard'?
      (
   
      {
        title: "Answer", width: 90, dataIndex: "Answer" ,
        order:2,
        filters: [],
        filteredValue: filteredValue['Answer'] || null

      }
      ): 
       {
         dataIndex: "Answer", order: 2
       }
    ),
    (
      filteredValue['Process Type'] == 'Standard'?
      (
   
      {
        title: "Correct", width: 90, dataIndex: "Correct" ,
        filters: [
          { text: <img src={GreenDot} height="9px"/>, value: 1 },
          { text: <img src={RedDot} height="9px"/>, value: 0 },
          { text: <img src={WhiteDot} height="9px"/>, value: null }
  
        ],
        order:3,
        filteredValue: filteredValue['Correct'] || null
      }
      ): 
       {
         dataIndex: "Correct", order: 3
       }
    ),
    {
      title: "Error", width: 70, dataIndex: "Error" ,
      filters: [
        { text: <img src={RedDot} height="9px"/>, value: 0 },
        { text: <img src={WhiteDot} height="9px"/>, value: 1 }
      ],
      order: 4,
      filteredValue: filteredValue['Error'] || null
    },
    {
      title: "Notes", width: 80, dataIndex: "Notes", 
      ...getColumnSearchProps("Notes"),

      order: 5,
      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "FINISH", width: 100, dataIndex: "FINISH" ,
      align: 'center',
      order: 6,

    },
   
    { title: "Service", dataIndex: "Svc Date", width: 90, sorter: { multiple: 1}, 
    order: 7,

      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Svc Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Svc Date")[0].order : null, 
    },
    {
      title: "MRN",
      dataIndex: "Patient MRN",
      width: 100,
      order: 8,
      ...getColumnSearchProps("Patient MRN"),
      filteredValue: filteredValue['Patient MRN'] || null ,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient MRN")[0].order : null
    },
    {
      title: "Status", width: 80, dataIndex: "Status",
      order: 9,

      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Misc", value: "Misc" },
        { text: "Deferred", value: "Deferred" },
        { text: "Review", value: "Review" }
      ],
      filteredValue: filteredValue['Status'] || null 
    },
    {
      title: "Patient",
      dataIndex: "Patient",
      order: 10,

      width: 220,
      sorter: { multiple: 24},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Patient")[0].order : null,
      // ...getColumnSearchProps("Patient"),
      filters: 
      filters['Patient'],
      filterSearch: true,
      filteredValue: filteredValue['Patient'] || null 
    },
    { title: "IRB",
      dataIndex: "Research IRB", 
      width: 80, 
      order: 11,

      // ...getColumnSearchProps("Research IRB"),
      filters: 
       filters['Research IRB'],
      sorter: { multiple: 4},
      filterSearch: true,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Research IRB").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Research IRB")[0].order : null, 
      filteredValue: filteredValue['Research IRB'] || null 
    },
    { title: "CPT", 
      dataIndex: "CPT Codes", 
      width: 110, 
      order: 12,
      feature: "tooltip",
      ...getColumnSearchProps("CPT Codes"),
      filteredValue: filteredValue['CPT Codes'] || null ,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT Codes").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT Codes")[0].order : null,
     filteredValue: filteredValue['CPT Codes'] || null 
    },
    { title: "Amount", dataIndex: "Sess Amount", width: 100, sorter: { multiple: 2},
    order: 13,

      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sess Amount").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Sess Amount")[0].order : null,
    },
    { title: "Coverage", 
      dataIndex: "Primary Coverage", 
      width: 350, 
      order: 14,

      filters: 
       filters['Primary Coverage'],
      filterSearch: true,
      filteredValue: filteredValue['Primary Coverage'] || null ,
      sorter: { multiple: 8 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Primary Coverage").length > 0) ? filteredValue.sort.filter((value) => value.field == "Primary Coverage")[0].order : null
    },
    { title: "Study Type", dataIndex: "Study Type", width: 130 ,
    order: 15,

    filters: 
     filters['Study Type'],
    filteredValue: filteredValue['Study Type'] || null ,
    filterSearch: true,

  },
  
  { title: "Study Status", dataIndex: "Study Status", width: 130 ,
  order: 16,

  filters: 
     filters['Study Status'],
     filterSearch: true,
     filteredValue: filteredValue['Study Status'] || null ,
     filterSearch: true,
  },
    {
      title: "Timely",
      width: 80,
      order: 17,

      dataIndex: "Days Until Timely Filing",
    },
    { title: "Aging", width: 70, dataIndex: "Aging Days", sorter: { multiple: 3},
    order: 18,

      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Aging Days") ? filteredValue.sort.order : null,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Aging Days").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Aging Days")[0].order : null,
    
    },

    { title: "Enrolled - Active", width: 140, dataIndex: "Enrolled - Active", sorter: { multiple: 4},
    order: 19,

      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Enrolled - Active") ? filteredValue.sort.order : null,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Enrolled - Active").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Enrolled - Active")[0].order : null,
    
    },

    { title: "Consented", width: 110, dataIndex: "Consented", sorter: { multiple: 5},
    order: 20,
    
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Consented").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Consented")[0].order : null,
    },

    { title: "IsScreening", width: 110, dataIndex: "IsScreening", 
    filters: [
      { text: "Y" , value: "Y" },
      { text: "N", value: "N" },
      { text: "" , value: "null" }
    ],
    order: 21,

    filteredValue: filteredValue['IsScreening'] || null
    },

    
    {
      title: "User Assigned", width: 130, dataIndex: "UserAssigned", filters: users,
      filteredValue: filteredValue['UserAssigned'] || null,
      filterSearch: true,
      order: 22,


    },
    
    { title: "User Logged", width: 120, dataIndex: "User" ,
    filters: [...users, {text: "", value: "null"}],
    filteredValue: filteredValue['User'] || null ,
    filterSearch: true,
    order: 24,



  },
    {
      title: "Start Time", dataIndex: "StartTimeStamp", width: 150, 
      sorter: { multiple: 5 },
      order: 25,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
    },
    {
      title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
      order: 26,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
    },
    {
      title: "Duration", dataIndex: "Duration", width: 100, 
      order: 27,

      ...getColumnSearchProps("Duration"),
      filteredValue: filteredValue['Duration'] || null
    },

    (
      current.managementAccess  == 1?
      (
        {
          title: "Original User Assigned", width: 200, dataIndex: "OriginalUserAssigned",
          filteredValue: filteredValue['OriginalUserAssigned'] || null ,
          filters: users,
      order: 28,

        }
      ): 
       {
         dataIndex: "OriginalUserAssigned", order: 28
       }
    )
  ];

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
 

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };
  
  const onSort = async (data) => {

    setReload(false)
    var x = {}

    data.map((d, i ) =>  {
      x[d.dataIndex] =  i + 1
    })
    x.EMPID = current.EMPID
    await request.create(entity+ "-columns" , x)
    handleCancel()
    setTimeout(() => setReload(true), 1000)
    
    notification.success({message: "Please Refesh page!"})

  }

  const openSortModal = () => {
    setSortModal(true)
  }
 

  
  if(columns) {

    
    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i].order
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
      onhandleSave,
      onHandleColorChange,
      handleSaveColor,
      getDefaultColors,
      getPreviousColors,
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
      onRowMarked,
      getFullList,
      openFindModal,
      updateTime,
      reset,
      openSortModal: openSortModal

    };

  
  return  columns && users.length > 0 ? 
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
          {
            modalType == "Find" ?
            userModal : null
          }
      </Modals>
      
      <SortModal config={sortModalConfig} ></SortModal>
     <FullDataTableModule config={config} />
        
    </div>
     : null 
    } else {
    return ""
  }
}
