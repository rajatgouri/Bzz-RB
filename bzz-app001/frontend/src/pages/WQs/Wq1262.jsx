
import React, { useState , useRef} from "react";

import WQ1262DataTableModule from '@/modules/WQ1262DataTableModule'
import { Table, Input, Button, Space, Form, Row, Col, Select, notification } from "antd";
import Highlighter from "react-highlight-words";
import { ConsoleSqlOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import { getDate } from '@/utils/helpers'
import Socket from "@/socket";
import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";

const { Option } = Select;

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Wq1262() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [sortModal, setSortModal] = useState(false);

  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(true);
  const [selectedRow, setSelectedRow] = useState("");
  const [loaded, setLoaded] = useState(false)
  const [filters, setFilters] = useState({});
  const [hasFilters, setHasFilters] = useState(false);
  const [filtersBackup, setFiltersBackup] = useState({})
  const childRef = useRef()

  const currentDate = getDate()

  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const { current } = useSelector(selectAuth);
  const [currentUser, setCurrentUser] = useState();
  const [reset, setReset] = useState(false)
  const [processTypes, setProcessTypes] = useState([])
  const [showPlayPause, setShowPlayPause] = useState(false)
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])

  const [filteredValue, setFilteredValue] = useState({
    UserAssigned: current.managementAccess ? [] : [current.name],
    Status: current.managementAccess ? null : ['Review'],
    'Sess Amount': null,
    'Process Type': ['Outpatient'],
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
    { text: "Done", color: "#BEE6BE", selected: false },
    { text: "Pending", color: "#FAFA8C", selected: false },
    { text: "Deferred", color: "#9EE6FF", selected: false },
    { text: "Misc", color: "#E1A0E1", selected: false },
    // { text: "Deferred", color: "#AAAAB4", selected: false },
    { text: "Review", color: "#FFFFFF", selected: false },
  ]

  const billingColorData = {
    EMPID: 1,
    User: "Admin",
    Color1: "#BEE6BE",
    Color2: "#FAFA8C",
    Color3: "#9EE6FF",
    Color4: "#E1A0E1",
    // Color5: "#AAAAB4",
    Color6: "#FFFFFF",
    Category1: "Done",
    Category2: "Pending",
    Category3: "Deferred",
    Category4: "Misc",
    // Category5: "Deferred",
    Category6: "Review",
  }

  const load = async () => {
    const [{ result = [] }, {result: result1}] = await Promise.all([await request.read('billingcolor1262', 1),await request.list(entity+"-columns", {id: current.EMPID}) ]);

    if (result.length === 0) {
      await request.create('billingcolor1262', billingColorData);
      setLoaded(true)
      return setDataTableColorList(defaultColors)
    }

    

    setDataTableColorList([
      { text: result[0].Category1, color: result[0].Color1, selected: false },
      { text: result[0].Category2, color: result[0].Color2, selected: false },
      { text: result[0].Category3, color: result[0].Color3, selected: false },
      { text: result[0].Category4, color: result[0].Color4, selected: false },
      // { text: result[0].Category5, color: result[0].Color5, selected: false },
      { text: result[0].Category6, color: result[0].Color6, selected: false },
    ])

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

 

  React.useEffect(() => {

    load();

    (async () => {

      const response = await request.list("admin", { section: 'HB' });
      let usersList = response.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null).map((user) => ({ EMPID: user.EMPID, name: user.First, text: user.First, value: user.First, status: 'success' }))
      setUsers(usersList.filter(u => u.First != 'Adrienne'))
    })()


   

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
  const entity = "wq1262";
  const loggerEntity = "wq1262Logger";
  const onhandleSave = (data) => {

    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }


  const onNotesAction = (id, status) => {
    let item = items.filter((item) => item.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQ1262: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }


  const onHandleColorChange = async (selectedRows, data, selectedRowID) => {

    if (selectedRows.length > 0) {
      setReload(false)
      await request.create(entity + "-color", { items, selectedRows, data, selectedRowID })
      setReload(true)

      const timer = () => new Promise(res => setTimeout(res, 100))
      for (var i = 0; i < selectedRows.length; i++) {

        let item = items.filter((item) => item.ID == selectedRows[i])[0]

        await dispatch(crud.create(loggerEntity, { IDWQ1262: selectedRows[i], UserName: current.name, MRN: item['Patient MRN'], Color: data.color, Status: selectedRowID ? "Finish -" + data.text1 : data.text, DateTime: currentDate }))

        if (i + 1 == selectedRows.length) {
          setTimeout(() => {
            Socket.emit('update-hb-wqs');
          }, 1500)
        }

        await timer();
      }
    }

  }


  const handleSaveColor = (EMPID, data) => {
    request.update("billingcolorwq1262", EMPID, data);
  }

  const getDefaultColors = (cb) => {
    cb(defaultColors)
  }

  const getPreviousColors = (cb) => {
    load()
  }
  

  const openEditModal = (id) => {

    let row = items.filter(item => item.ID == id)[0];
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
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setSortModal(false);

  }

  const getFullList = async ( filter) => {



      if(filter['Status'] == null || filter['Status'].length ==0) {
        filter['Status'] = current.managementAccess ? ['Done'] : ['Review']
      }


        let {result} = await request.list1(entity + '-filters', filter)
        let data = result.filters


        let filterObject = {}
        data.map((d) => {

          let item1 = d.column
          
         

         
          filterObject[item1] = ([...new Set(
            ( d.recordset.sort((a, b) => b[d.column] - a[d.column]).filter((item, i, arr) =>  {
              return (arr.findIndex((a) => {
                return a[d.column] == item[d.column]
              })) ==i
            }))
          )].map(item => ({ text: item[d.column], value: item[d.column] })))

        })


        setFilters(filterObject)
       


  }


  const getItems = (data) => {
    setItems(data)
  }

  const onEditItem = (value) => {
    onhandleSave({ ID: selectedId, Notes: value.Notes? value.Notes.trim() : null })
    setOpenModal(false)
  }

  const onCopied = (id, mrn) => {
    dispatch(crud.create(loggerEntity, { IDWQ1262: id, UserName: current.name, Color: "", Status: "Copy MRN", DateTime: currentDate, MRN: mrn }))
  }

  const openFindModal = (dataSource) => {


    setModalType("Find");
    setModalTitle("Assign to");
    setOpenModal(true)
  }



  const onRowMarked = async (row, value) => {
    setReload(false)
    await dispatch(crud.update(entity, row.ID, { Error: value ? '0' : '1' }))
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
      form={editForm}
    >
      <Form.Item
        label=""
        name="Notes"
      >
        <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={10} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }} style={{ marginBottom: "-10px" }}>
        <Button type="primary" htmlType="submit" className="mr-3" >
          Update
        </Button>
      </Form.Item>
    </Form>
  )


  const onReplaceUser = async (value) => {

    if (typeof value.User == 'string') {
      value.User = [value.User]
    }

    setOpenModal(false)
    setReload(false)
    await request.post('wq1262-user', { value });
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
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

      <Col className="gutter-row" span={24}>
        {selectedRow.Notes}
      </Col>
    </Row>
  )

  const panelTitle = "WQ 1262";
  const dataTableTitle = "WQ 1262";
  const progressEntity = "wq1262progress";
  const workEntity = "wq1262Work";
  const showProcessFilters = true;


  const onWorkSaved = async (amount) => {
    var date = new Date();
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours());
    var usDate = new Date().toISOString();
    let day = (new Date().getDay())
    let obj = {}
    obj[days[day]] = 1;
    dispatch(crud.create(workEntity, obj));
  }


  const updateTime = async (id, value, cb, ent, entry) => {


    let item = items.filter((item) => item.ID == id)[0]

    value.id = id
    value['Process Type'] = item['Process Type'];


    if (ent == 'Stop') {
      value.Status = entry.text1
      setShowPlayPause(false)
      await request.create('wq1262-updatetime', value)
      cb(true)

    } else {
      cb(true)  
    }


    let status = ''

    if (ent == 'Start') {
      status = 'Start'
      setTimeout(() => setShowPlayPause(true), 3000)
    } else if (ent == 'Reset') {
      status = 'Reset'
      setShowPlayPause(false)

    } else if (status == "") {
      setShowPlayPause(false)
      return
    }

    if (typeof id == 'number') {
      let item = items.filter((item) => item.ID == id)[0]

      dispatch(crud.create(loggerEntity, { IDWQ1262: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
    } else {
      let item = items.filter((item) => item.ID == id[0])[0]
      if (item) {
        dispatch(crud.create(loggerEntity, { IDWQ1262: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
      }
    }
  }



  
  const dataTableColumns =  [
  
    {
      title: "START", width: 100, dataIndex: "START",
      align: 'center',
      order: 1
    },

    (
      showPlayPause  ? 
      {
        title: "Play/Pause", width: 100, dataIndex: "PLAY",
        align: 'center',
        order: 2

      }:
      {
        title: "",
        dataIndex: "PLAY",
        order: 2

      }
    ),
    {
      title: "Error", width: 70, dataIndex: "Error",
      filters: [
        { text: <img src={RedDot} height="9px" />, value: 0 },
        { text: <img src={WhiteDot} height="9px" />, value: 1 }
      ],
      order: 3,
      filteredValue: filteredValue['Error'] || null
    },
    {
      title: "Notes", width: 75, dataIndex: "Notes",
      ...getColumnSearchProps("Notes"),

      order: 4,
      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "FINISH", width: 100, dataIndex: "FINISH",
      align: 'center',
      order: 5

    },

    {
      title: "Acct ID",
      dataIndex: "Acct ID",
      width: 120,
      order: 6,
      ...getColumnSearchProps("Acct ID"),
      filteredValue: filteredValue['Acct ID'] || null,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct ID")[0].order : null
    },
    {
      title: "MRN",
      dataIndex: "Patient MRN",
      width: 100,
      order: 7,
      ...getColumnSearchProps("Patient MRN"),
      filteredValue: filteredValue['Patient MRN'] || null,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient MRN")[0].order : null
    },
    {
      title: "Line Ct.",
      dataIndex: "Line Count",
      width: 100,
      order: 8,
      filters:
     
        filters['Line Count'],
      filteredValue: filteredValue['Line Count'] || null,
      filterSearch: true,
      sorter: { multiple: 8 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Line Count").length > 0) ? filteredValue.sort.filter((value) => value.field == "Line Count")[0].order : null
    },
   
      {
        title: "Acct Class",
        dataIndex: "Acct Class",
        width: 140,
        order: 9,

        filters: 
        
          filters['Acct Class'],
        filteredValue: filteredValue['Acct Class'] || null,
        sorter: { multiple: 8 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Class").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Class")[0].order : null
      }
    ,
    
      {
        title: "Billing Status",
        dataIndex: "Billing Status",
        width: 170,
        order: 10,
        filters:
       
          filters['Billing Status'],
        filteredValue: filteredValue['Billing Status'] || null,
        sorter: { multiple: 8 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Billing Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Billing Status")[0].order : null
      }
    
    ,
    {
      title: "Acct Name",
      dataIndex: "Acct Name",
      width: 220,
      order: 11,

      sorter: { multiple: 24 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Name")[0].order : null,
      filters: 
        filters['Acct Name'],
        filterSearch: true,

      filteredValue: filteredValue['Acct Name'] || null
    },
    {
      title: "Disch Date", dataIndex: "Disch Date", width: 115,
      sorter: { multiple: 5 },
      order: 12,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Disch Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Disch Date")[0].order : null,
    },
    {
      title: "Acct Bal", dataIndex: "Acct Bal", width: 95, sorter: { multiple: 2 },
      order: 13,
      feature: "amount",
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Bal").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Bal")[0].order : null,
    },
  
    {
      title: "Fin Class",
      dataIndex: "Fin Class",
      width: 150,
      order: 14,
      filters:
      
      
        filters['Fin Class'],
      filteredValue: filteredValue['Fin Class'] || null,
      sorter: { multiple: 8 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Fin Class").length > 0) ? filteredValue.sort.filter((value) => value.field == "Fin Class")[0].order : null
    },
    {
      title: "Study Status",
      dataIndex: "Study Status",
      width: 150,
      order: 15,
      filters:
      
        filters['Study Status'],
      sorter: { multiple: 4 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Study Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Study Status")[0].order : null,
      filteredValue: filteredValue['Study Status'] || null
    },
    {
      title: "Study Type",
      dataIndex: "Study Type",
      width: 120,
      order: 16,
      type: "filter",
      filters:
      
        filters['Study Type'],
      sorter: { multiple: 4 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Study Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Study Type")[0].order : null,
      filteredValue: filteredValue['Study Type'] || null
    },
    {
      title: "Name",
      dataIndex: "Name",
      width: 100,
      order: 17,
      filters:
    
        filters['Name'],
      sorter: { multiple: 4 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Name")[0].order : null,
      filteredValue: filteredValue['Name'] || null
    },
   
      {
        title: "Code",
        dataIndex: "Code",
        width: 85,
        order: 18 ,
        // ...getColumnSearchProps("Research IRB"),
        filters:
       
          filters['Code'],
        sorter: { multiple: 4 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Code").length > 0) ? filteredValue.sort.filter((value) => value.field == "Code")[0].order : null,
        filteredValue: filteredValue['Code'] || null
      }
      

   ,
    
    {
      title: "Message",
      dataIndex: "Message",
      width: 130,
      order: 19,
      filters:
      
        filters['Message'],
      filteredValue: filteredValue['Message'] || null,
      sorter: { multiple: 8 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Message").length > 0) ? filteredValue.sort.filter((value) => value.field == "Message")[0].order : null
    },
    {
      title: "Days U.T.F.",
      width: 120,
      order: 20,
      dataIndex: "Days Until Timely Filing",
      ...getColumnSearchProps("Days Until Timely Filing"),
      filteredValue: filteredValue['Days Until Timely Filing'] || null,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days Until Timely Filing").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days Until Timely Filing")[0].order : null

    },
   
      {
        title: "Days On WQ",
        dataIndex: "Days On Account WQ",
        width: 120,
        order: 21,
        sorter: { multiple: 8 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days On Account WQ").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days On Account WQ")[0].order : null
      }
    ,
    {
      title: "SOC Flag", width: 120, dataIndex: "SOC Flag",
      filters: [
        { text: "SOC", value: "SOC" },
        { text: "Study-Related", value: "Study-Related" },
        { text: "N/A", value: "N/A" },

      ],
      order: 22,
      
      filterSearch: true,
      filteredValue: filteredValue['SOC Flag'] || null
    },
   
    {
      title: "Category", width: 120, dataIndex: "Category",
      ...getColumnSearchProps("Category"),
      order: 23,
      
      filterSearch: true,
      filteredValue: filteredValue['Category'] || null,
      sorter: { multiple: 8 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Category").length > 0) ? filteredValue.sort.filter((value) => value.field == "Category")[0].order : null

    },
    {
      title: "SR/SOC Ratio", width: 150, dataIndex: "SR/SOC Ratio",
      ...getColumnSearchProps("SR/SOC Ratio"),
      order: 24,
      
      filterSearch: true,
      filteredValue: filteredValue['SR/SOC Ratio'] || null,
      sorter: { multiple: 8 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SR/SOC Ratio").length > 0) ? filteredValue.sort.filter((value) => value.field == "SR/SOC Ratio")[0].order : null

    },
    {
      title: "Status", width: 80, dataIndex: "Status",
      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Misc", value: "Misc" },
        { text: "Deferred", value: "Deferred" },
        { text: "Review", value: "Review" }
      ],
      order: 25,

      filterSearch: true,
      filteredValue: filteredValue['Status'] || null
    },
    {
      title: "Upload Date Time", dataIndex: "UploadDateTime", width: 150,
      sorter: { multiple: 15 },
      order: 26,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UploadDateTime").length > 0) ? filteredValue.sort.filter((value) => value.field == "UploadDateTime")[0].order : null,
    },
    {
      title: "User Assigned", width: 130, dataIndex: "UserAssigned", filters: users,
      filteredValue: filteredValue['UserAssigned'] || null,
      filterSearch: true,
      order: 27,


    },

    {
      title: "User Logged", width: 130, dataIndex: "User",
      filters: [...users, { text: "", value: "null" }],
      filteredValue: filteredValue['User'] || null,
      filterSearch: true,
      order: 28,



    },
    {
      title: "Start Time", dataIndex: "StartTimeStamp", width: 150,
      sorter: { multiple: 5 },
      order: 29,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
    },
    {
      title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
      order: 30,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
    },
    {
      title: "Duration", dataIndex: "Duration", width: 100,
      ...getColumnSearchProps("Duration"),
      order: 31,

      filteredValue: filteredValue['Duration'] || null
    },

    (
      current.managementAccess  == 1?
      (
        {
          title: "Original User Assigned", width: 200, dataIndex: "OriginalUserAssigned",
          filteredValue: filteredValue['OriginalUserAssigned'] || null ,
          filters: users,
          order: 32,

        }
      ): 
       {dataIndex: 'OriginalUserAssigned', order: 32, width: "0px"}
    )
  ];

  const openSortModal = () => {
    setSortModal(true)
  }
 

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";

  

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
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
      processTypes,
      openSortModal: openSortModal
    };
    

    return  columns &&  users.length > 0 ?
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

      <SortModal config={sortModalConfig} >
        
      </SortModal>


      <WQ1262DataTableModule config={config} />

    </div>
    : null
  } else {
    return ""
  }
  
   
  
}
