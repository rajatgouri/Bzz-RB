
import React, { useState } from "react";

import TableModule from "@/modules/TableModule";
import { Table, Input, Button, Space , Form, Row, Col, Select, Checkbox,DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined, SlackSquareOutlined,  EyeOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import { getDate } from "@/utils/helpers";

export default function Agenda() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId]= useState("");
  const [reload, setReload] = useState(true);
  const [selectedRow,setSelectedRow] = useState({});
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [column,setColumn] = useState('')
  const [iRBBudgetStatus, setIRBBudgetStatus] = useState([])
  
  const [errors , setErrors] = useState({})
 
  const currentDate = getDate() 
  
  const {current} = useSelector(selectAuth);
  

  const dispatch = useDispatch()


  React.useEffect(async () => {
    getFilters()

  }, [])


  const getFilters = async  () => {
    const filteredResult = await request.list("agenda-filters");
    const {result: irbStatus} = await request.list("billingirbbudgetstatus-status");


    let IRB = filteredResult.result['IRB'].map(({IRB})=> (IRB)).sort().map((value) => ({text: value, value:value}))
    let REVIEWER = filteredResult.result['REVIEWER'].map(({REVIEWER})=> (REVIEWER)).sort().map((value) => ({text: value, value:value}))
    let Status = filteredResult.result['Status'].map(({Status})=> (Status)).sort().map((value) => ({text: value, value:value}))
    let NoPCCStudy = filteredResult.result['No PCC Study'].map((d)=> d['No PCC Study']).sort().map((value) => ({text: value, value:value}))
    let DataCollection = filteredResult.result['Data Collection'].map((d)=> (d['Data Collection'])).sort().map((value) => ({text: value, value:value}))
    let CTSSStatus = filteredResult.result['CTSS Status'].map((d)=> (d['CTSS Status'])).map((value) => ({text: value, value:value}))
    let IRBBudgetStatus = filteredResult.result['IRB Budget Status'].map((d)=> (d['IRB Budget Status'])).map((value) => ({text: value, value:value}))
    
    // let Standard = filteredResult.result['Standard'].map(({Standard})=> (Standard)).sort().map((value) => ({text: value, value:value}))
    
    let Obj = {
      IRB,
      REVIEWER,
      Status,
      'No PCC Study': NoPCCStudy,
      'Data Collection': DataCollection,
      'CTSS Status': CTSSStatus,
      'IRB Budget Status': IRBBudgetStatus
    }

    setFilters(Obj)
    
    let status = irbStatus.map((d)=> (d['IRB Budget Status'])).map((value) => ({text: value, value:value}))
    setIRBBudgetStatus(status)
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 , zIndex: 1000}}>
        <Input
         
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
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
            onClick={(e) => handleSearch(selectedKeys, confirm, dataIndex, e)}
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

  const handleSearch = (selectedKeys, confirm, dataIndex, e) => {

    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, dataIndex, confirm) => {
    
    clearFilters();
    setSearchText("");
    handleSearch('', confirm, dataIndex)
    
   
    
  };



  const entity = "agenda";

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
   
  }


  const getItems = (data) => {
    setItems(data)
  } 



  const onEditItem =async (value) => {

   
    if(modalType == "EDIT") {
      setReload(false)
      value['Workaround'] = value['Workaround'] ? '1' : '0' 
      await (request.update(entity, selectedId, value))
      notification.success({message: "Item Updated Successfully!"})
      getFilters()
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
      value['Workaround'] = value['Workaround'] ? '1' : '0' 
      let response = await request.create(entity, value)
      notification.success({message: "Item Added Successfully!"})
      setReload(true)
      handleCancel()

    }
  }

 

 
   // edit form
   const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    onFinish={onEditItem}
    autoComplete="off"
    form={editForm}
  >

    <Row gutter={[24,24]} style={{rowGap: "0px" }}>
        

    <Col span={24}>
        <Form.Item
          label="IRB"
          name="IRB"
        >      
         <Input type="name"></Input>
        </Form.Item>  
       </Col> 

      <Col span={24}>
        <Form.Item
          label="SCRUB STATUS"
          name="SCRUB STATUS"
        >      
          <Select>
            <Option value={1}>Scrub</Option>
            <Option value={0}>Do Not Scrub</Option>

          </Select>
        </Form.Item>  
        
       </Col> 


       <Col span={24}>
        <Form.Item
          label="No Scrub-Perm"
          name="No Scrub-Perm"
        >      
          <Select>
            <Option value={'Perm'}>Perm</Option>
            <Option value={''}></Option>

          </Select>
        </Form.Item>  
        
       </Col> 

       <Col span={24}>
        <Form.Item
          label="No Scrub-Test"
          name="No Scrub-Test"
        >      
          <Select>
            <Option value={'Test'}>Test</Option>
            <Option value={''}></Option>


          </Select>
        </Form.Item>  
        
       </Col> 

       <Col span={24}>
        <Form.Item
          label="No PCC Study"
          name="No PCC Study"
        >      
          <Select>
            <Option value={''}></Option>
            <Option value={'No PCC Study'}>No PCC Study</Option>

          </Select>
        </Form.Item>  
        
       </Col> 

       <Col span={24}>
        <Form.Item
          label="Data Collection"
          name="Data Collection"
        >      
          <Select>
            <Option value={''}></Option>
            <Option value={'Data Collection'}>Data Collection</Option>

          </Select>
        </Form.Item>  
        
       </Col> 
      
      
      <Col span={24}>
        <Form.Item
          label="Reviewer"
          name="REVIEWER"

        >      
          <Select>
             <Option value={""}>{""}</Option>

            {
              filters && filters['REVIEWER'] && filters['REVIEWER'].filter((r) => r.value != null).map((r) => {
                return <Option value={r.text}>{r.text}</Option>
                
              })
            }
          </Select>
        </Form.Item>
      </Col>


 <Col span={24}>
        <Form.Item
          label="Status"
          name="Status"

        >      
          <Select >
             <Option value={""}>{""}</Option>

            {
              filters && filters['Status'] && filters['Status'].filter((r) => r.value != null).map((r) => {
                return <Option value={r.text}>{r.text}</Option>
                
              })
            }
          </Select>
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="IRB Budget Status"
          name="IRB Budget Status"

        >      
          <Select >
             <Option value={""}>{""}</Option>

            {
              iRBBudgetStatus && iRBBudgetStatus.map((r) => {
                return <Option value={r.text}>{r.text}</Option>
                
              })
            }
          </Select>
        </Form.Item>
      </Col>
      <Col span={24}>
      <Form.Item
        label="Workaround"
        name="Workaround"
        valuePropName="checked"
        
      >
        <Checkbox ></Checkbox>
      </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label={ <span >Agenda</span>}
          name="Agenda"

        >      

            <TextArea rows={5} className="text-area"> </TextArea>
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
  const dataTableTitle = "Data Control Center";
  
  const onWorkSaved = async (amount) => {}

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.ID)


      editForm.setFieldsValue({
        IRB: row.IRB,
        Agenda: row.Agenda,
        'SCRUB STATUS': row['SCRUB STATUS'],
        REVIEWER: row['REVIEWER'],
        'Workaround': row['Workaround'],
        Status: row.Status,
        'No PCC Study': row['No PCC Study'],
        'Data Collection': row['Data Collection'],
        'IRB Budget Status': row['IRB Budget Status'],
        'No Scrub-Perm': row['No Scrub-Perm'],
        'No Scrub-Test': row['No Scrub-Test']

      })
  
      setModalTitle("Edit Item");
    } else {
      setModalTitle("Add Agenda");
      editForm.setFieldsValue({ 
        'SCRUB STATUS': 1,
      })
  
      setModalType("ADD");

    }

      setOpenAddEditModal(true)
      
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setModalTitle("Delete Agenda");
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


  const notesModal = (
    <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={(values) => onEditItem(values)}
    autoComplete="off"
    id="notes-form"
    className="notes-form"
    form={editForm}
  >

    
    <Form.Item
      label=""
      name={column}
    >      
      <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
    </Form.Item>
    
    <Form.Item wrapperCol={{ offset: 18 }} className="notes-form" style={{marginTop: "10px" ,marginBottom: "0px", textAlign: "end"}}>
      <Button type="primary" htmlType="submit" className="mr-3" >
        Update
      </Button>
    </Form.Item>
  </Form>
  )


  const viewModal = (
    <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
       
       <Col className="gutter-row" span={24}>
         {selectedRow.Notes}
       </Col>
   </Row>  
 )


 const onChangeCheckbox = async(row, value) => {

      let response = await (request.update(entity, row.ID, {Workaround: value? "1" : "0"}))
      if (response.success) {
        notification.success({message: "Item Updated Successfully!"})
      }
      
 }

  const open_Modal = (modal, type, row, dataIndex) => {row
    setModalType(type);
    setColumn(dataIndex)    
    if(type =='EDIT') {
      setSelectedId(row.ID);  
      let obj = {}
      obj[dataIndex] = row[dataIndex]

      

      editForm.setFieldsValue(obj)
  
      setModalTitle("Edit " + dataIndex);
      setOpenModal(true)
    } else {
      setSelectedRow(row);
      setModalTitle("View Notes");
      setOpenModal(true); 
    }
  }
 
  const updateSelect = async (value, row, dataIndex) => {
    let obj = {}
    obj[dataIndex] = value
    await request.update(entity, row.ID , obj)
    getFilters()

  }

  const dataTableColumns = [
    (
      current.managementAccess  == 1?
      (
        {
          title: "Action",
          dataIndex: "Action",
          width:  "70px",
          fixed: 'left'
        }
      ): 
       {
         width: 0
       }
    )
    ,
    
    {
      title: "IRB",
      dataIndex: "IRB",
      key: "IRB",
      width: "100px",
      type: "irb",
      fixed: 'left',

      filters: filters['IRB'],
      filteredValue:filteredValue['IRB'] || null,
      filterSearch: true,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "IRB").length > 0) ?  filteredValue.sort.filter((value) => value.field == "IRB")[0].order : null
      
    },
    {
      title: "Workaround",
      dataIndex: "Workaround",
      key: "Workaround",
      type: "checkbox",
      width: "120px",
      fixed: 'left',

    filterSearch: true,
     
      filters:   [
        {text: 'Yes',  value: '1'},
        {text: 'No',  value: '0'},
      ],
      filteredValue:filteredValue['Workaround'] || null,
    },
    
    {
      title: "SCRUB STATUS/ No Scrub Fix",
      dataIndex: "SCRUB STATUS",
      key: "SCRUB STATUS",
      width: "150px",
      type: "select",
      fixed: 'left',

    filterSearch: true,
    options: [
      {text: 'Scrub',  value: 1},
      {text: 'Do Not Scrub',  value: 0},
    ],
      filters:   [
        {text: 'Scrub',  value: '1'},
        {text: 'Do Not Scrub',  value: '0'},
      ],
      filteredValue:filteredValue['SCRUB STATUS'] || null,
    },

    {
      title: "No Scrub-Perm",
      dataIndex: "No Scrub-Perm",
      key: "No Scrub-Perm",
      width: "130px",
      type: "select",
      fixed: 'left',

    filterSearch: true,
    options: [
        {text: 'Perm',  value: 'Perm'},
        {text: '',  value: ''},

    ],
      filters:   [
        {text: 'Perm',  value: 'Perm'},
        {text: '',  value: 'null'},

      ],
      filteredValue:filteredValue['No Scrub-Perm'] || null,
    },
    {
      title: "No Scrub-Test",
      dataIndex: "No Scrub-Test",
      key: "No Scrub-Test",
      width: "130px",
      type: "select",
      fixed: 'left',

    filterSearch: true,
    options: [
        {text: 'Test',  value: 'Test'},
        {text: '',  value: ''},

    ],
      filters:   [
        {text: 'Test',  value: 'Test'},
        {text: '',  value: 'null'},

      ],
      filteredValue:filteredValue['No Scrub-Test'] || null,
    },
    {
      title: "No PCC Study",
      dataIndex: "No PCC Study",
      key: "No PCC Study",
      width: "120px",
      type: "select",
    filterSearch: true,
    options: [
      {text: '',  value: ''},
      {text: 'No PCC Study',  value: 'No PCC Study'},
    ],
      filters:   filters['No PCC Study'],
      filteredValue:filteredValue['No PCC Study'] || null,
    },
    {
      title: "Data Collection",
      dataIndex: "Data Collection",
      key: "Data Collection",
      width: "150px",
      type: "select",
    filterSearch: true,
    options: [
      {text: '',  value: ''},
      {text: 'Data Collection',  value: 'Data Collection'},
    ],
      filters:   filters['Data Collection'],
      filteredValue:filteredValue['Data Collection'] || null,
    }, {
      title: "IRB Budget Status",
      dataIndex: "IRB Budget Status",
      key: "IRB Budget Status",
      width: 220,
      type: "select",
      options: iRBBudgetStatus,
      filterSearch: true,

      filters: filters['IRB Budget Status'],
      filteredValue:filteredValue['IRB Budget Status'] || null  
    },
    {
      title: "CTSS Status",
      dataIndex: "CTSS Status",
      key: "CTSS Status",
      width: 220,
      type: "pencil",
    filterSearch: true,

      filters: filters['CTSS Status'],
      filteredValue:filteredValue['CTSS Status'] || null  
    },
    {
      title: "CTSS Notes",
      dataIndex: "CTSS Notes",
      key: "CTSS Notes",
      width: 220,
      type: "pencil",
    filterSearch: true,

      filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value: 1 }
      ],
      filteredValue:filteredValue['CTSS Notes'] || null  
    },
    {
      title: "Agenda",
      dataIndex: "Agenda",
      key: "Agenda",
      width: 220,
      type: "tooltip",
      filterSearch: true,

      ...getColumnSearchProps('Agenda'),
      filteredValue:filteredValue['Agenda'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Agenda").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Agenda")[0].order : null
    },
  
    {
      title: "Notes",
      dataIndex: "Notes",
      key: "Notes",
      width: 220,
      type: "pencil",
    filterSearch: true,

      filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value: 1 }
      ],
      filteredValue:filteredValue['Notes'] || null  
    },
    
    {
      title: "REVIEWER",
      dataIndex: "REVIEWER",
      key: "REVIEWER",
      width: 120,
      type: "string",
      filters: filters['REVIEWER'],
    filterSearch: true,

      filteredValue:filteredValue['REVIEWER'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "REVIEWER").length > 0) ?  filteredValue.sort.filter((value) => value.field == "REVIEWER")[0].order : null
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      width: 70,
      type: "string",
    filterSearch: true,

      filters: filters['Status'],
      filteredValue:filteredValue['Status'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Status").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Status")[0].order : null
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
    showFooter: false,
    onhandleSave,
    openEditModal,
    openAddModal,
    getItems,
    reload,
    getFilterValue,
    onWorkSaved,
    onRowMarked,
    openingModal,
    confirmModal,
    open_Modal,
    updateSelect,
    onChangeCheckbox,
    AddIcon: current.managementAccess == 1 ? true : false,
    selectupdateSelect: updateSelect
  };

  const addEditModalConfig = {
    title: modalTitle,
    openModal: openAddEditModal,
    handleCancel,
  
  };

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    width: 400
    
  };
  

  {
  return  <div>
      
     <TableModule config={config} />

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

      <Modals config={modalConfig} >
          
          {
            modalType == "EDIT" ? 
            notesModal : null
          }
          {
            modalType == "View" ? 
            viewModal : null
          }

          {
            modalType == "DELETE" ? 
            viewModal : null
          }

      </Modals>   

       
    </div>
  }  
}
