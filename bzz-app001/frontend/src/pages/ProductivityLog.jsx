
import React, { useState } from "react";
import {  Input, Button, Space , Form, Row, Col, Select, Checkbox,DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined, SlackSquareOutlined,  EyeOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import {  selectUsersList } from "@/redux/user/selectors";
import { mappedUser } from "@/utils/helpers";
import ProductivityLogDataTableModule from "@/modules/ProductivityLogDataTableModule";

export default function ProductivityLog() {
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
  const [users, setUsers] = useState([])
  const [selectedIRB, setSelectedIRB] = useState(0);
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;
  

  const dispatch = useDispatch()


  React.useEffect(async () => {
    getFilters()

  }, [])


  const getFilters = async  () => {
    setUsers(mappedUser(usersList))
    let {result} = await request.list(entity + "-filters")
    let User = ([...new Set(result.map(({User})=> (User)))].sort()).map((value) => ({text: value, value:value}))
    
    let obj = {}
    obj['User'] = User

    setFilters(obj)
  }

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



  const entity = "productivity-log";

  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
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
      'Task Name': row['Task Name'],
      'Units': row['Units'],
      'Minutes': row['Minutes']

    })

    setModalTitle("Edit Notes");
    setOpenModal(true)

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
      await (request.update(entity, selectedId, value))
      notification.success({message: "Item Updated Successfully!"})
      
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
    
      let response = await request.create(entity, value)
      if(response.success) {
        editForm.resetFields()
        notification.success({message: "Item Added Successfully!"})
      } 
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

        <Form.Item
          style={{marginBottom: "15px !important"}}
          label="Task Name"
          name="Task Name"
          rules={[{ required: true, message: 'Please input Task Name!'}]}
        >
          
          <Input type="text" />
        </Form.Item>

      <Form.Item
          style={{marginBottom: "15px !important"}}
          label="Units"
          name="Units"
          rules={[{ required: true, message: 'Please input Units!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}
        >
          
          <Input type="text" />
        </Form.Item>
  
        <Form.Item
          style={{marginBottom: "15px !important"}}
          label="Minutes"
          name="Minutes"
          rules={[{ required: true, message: 'Please input Minutes!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}
        >
          
          <Input type="text" />
        </Form.Item>
       
    
    <div style={{textAlign: "end", }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        {modalType == "EDIT" ? "Update" : "Add"}
      </Button>
    </div>
    
  </Form>
  )

 
 
  const panelTitle = "";
  const dataTableTitle = "Productivity Log";
  
  const onWorkSaved = async (amount) => {}

  

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedIRB(record.IRB)
        setSelectedId(record.ID)
      },
    };
  }

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.ID)
      let data = items.filter(item => item.ID === selectedId)[0]
      editForm.setFieldsValue({
          'Task Name' : row['Task Name'],
          'Units': row['Units'],
          'Minutes': row['Minutes']
      })
      setModalTitle("Edit");
    } else {
      setModalTitle("Add");
      
      setModalType("ADD");

    }

      setOpenAddEditModal(true)
      
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setSelectedIRB(row['IRB'])
    setSelectedId(row['ID'])
    setModalTitle("Delete");
    setModalType("DELETE");
    setOpenModal(true);
  }

  const onDelete = async () => {

    setReload(false)
    await dispatch(crud.delete(entity, selectedRow['ID']))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>Delete  {selectedIRB ? selectedIRB : 0 } ?</p>
      <div className="text-right mb-1">
        <Button type="danger" onClick={onDelete}>Delete</Button>
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
      name="Notes"
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

  const open_Modal = (modal, type, row) => {row
    setModalType(type);
    
    if(type =='EDIT') {
      setSelectedId(row.ID);
      editForm.setFieldsValue({
        Notes: row.Notes
      })
  
      setModalTitle("Edit Notes");
      setOpenModal(true)
    } else {
      setSelectedRow(row);
      setModalTitle("View Notes");
      setOpenModal(true); 
    }
  }
 
 

  const dataTableColumns = [
   
    (
      (
        {
          title: "Action",
          dataIndex: "Action",
          width:  "50px",
          fixed: 'left'
        }
      )
    ),
    
   
    {
      title: "Task Name",
      dataIndex: "Task Name",
      key: "Task Name",
      width: "350px",
      type: "search",
      sorter: {multiple: 1},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Task Name").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Task Name")[0].order : null,
      ...getColumnSearchProps('Task Name'),
      filteredValue:filteredValue['Task Name'] || null,

    },
    {
      title: "Units",
      dataIndex: "Units",
      key: "Units",
      width: "50px",
      type: 'search',
      ...getColumnSearchProps('Units'),
      filteredValue:filteredValue['Units'] || null,
      sorter: {multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Units").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Units")[0].order : null,

    },
    {
      title: "Minutes",
      dataIndex: "Minutes",
      key: "Minutes",
      width: "50px", 
      type: "search",
      ...getColumnSearchProps('Minutes'),
      filteredValue:filteredValue['Minutes'] || null,
      sorter: {multiple: 3},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Minutes").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Minutes")[0].order : null,

    },
    {
      title: "Date Time",
      dataIndex: "DateTime",
      key: "DateTime",
      width: "120px",
      sorter: {multiple: 4},
      feature: "datetime",
      type: "datetime",
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DateTime").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DateTime")[0].order : null,
      ...getColumnSearchProps('DateTime'),
      filteredValue:filteredValue['DateTime'] || null,

    },
    {
      title: "User",
      dataIndex: "User",
      key: "User",
      filters: filters['User'],
      width: "100px",
      filteredValue:filteredValue['User'] || null,
      type: "filter",
      sorter: {multiple: 5},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User").length > 0) ?  filteredValue.sort.filter((value) => value.field == "User")[0].order : null,

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
    onChangeCheckbox,
    AddIcon:  true,
    handleRowClick,
    
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
      
     <ProductivityLogDataTableModule config={config} />

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
            modalType == "DELETE" ? 
            deleteModal : null
          }

      </Modals>   

       
    </div>
  }  
}
