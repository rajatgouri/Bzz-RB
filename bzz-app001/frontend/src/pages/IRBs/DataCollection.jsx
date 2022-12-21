
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
import {  selectUsersList } from "@/redux/user/selectors";
import { mappedUser } from "@/utils/helpers";
import IRBDataTableModule from "@/modules/IRBDataTableModule";

export default function DataCollection() {
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



  const entity = "irb";

  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    // dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
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
      await (request.update(entity, selectedId[0], value))
      notification.success({message: "Item Updated Successfully!"})
      
      setReload(true)
      handleCancel()


    } else {
      setReload(false)
    // await dispatch(crud.create("irb", values));
    // let response = await request.create(entity, values);

    
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
          label="IRB"
          name="IRB"
          rules={[{ required: true, message: 'Please input IRB!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}
        >
          
          <Input type="text" />
        </Form.Item>
  
        <Form.Item
          style={{marginBottom: "15px !important"}}
          label="Notes"
          name="Notes"
        >
          
          {/* <Input type="text" /> */}
          <TextArea type="text" style={{ width: "100%", border: "1px solid lightgrey", marginBottom: "-5px" }} rows={10}></TextArea>
        </Form.Item>
  
       
    
    <div style={{textAlign: "end", marginBottom: "10px"}}>
      <Button type="primary" htmlType="submit" className="mr-3">
        {modalType == "EDIT" ? "Update" : "Add"}
      </Button>
    </div>
    
  </Form>
  )

 
 
  const panelTitle = "";
  const dataTableTitle = "Data Collection";
  
  const onWorkSaved = async (amount) => {}


  const getIRB = (id) => {
    return items.filter(item => item.ID[0] === id)[0].IRB
  }

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedIRB(record.IRB)
        setSelectedId(record.ID[0])
      },
    };
  }

  const openingModal = (row) => {
    
    editForm.resetFields()

    if(row) {
      setModalType("EDIT");
      setSelectedId(row.ID)
      let data = items.filter(item => item.ID[0] === selectedId)[0]
      editForm.setFieldsValue({IRB: data.IRB, Notes: data.Notes, "IRB Status Comment" : data['IRB Status Comment']})

  
      setModalTitle("Edit IRB and/or Notes");
    } else {
      setModalTitle("Add IRB and/or Notes");
      
      setModalType("ADD");

    }

      setOpenAddEditModal(true)
      
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setSelectedIRB(row['IRB'])
    setSelectedId(row['ID'][0])
    setModalTitle("Delete IRB");
    setModalType("DELETE");
    setOpenModal(true);
  }

  const onDelete = async () => {
   
    setReload(false)
    await dispatch(crud.delete(entity, selectedRow['ID'][0]))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>Delete IRB {selectedIRB ? selectedIRB : 0 } ?</p>
      <div className="text-right mb-2">
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
 
  const updateSelect = async (value, row) => {
    await request.update(entity, row.ID , {'SCRUB STATUS': value})
  }

  const dataTableColumns = [
    // {
    //   title: "No.",
    //   dataIndex: "SNo",
    //   key: "SNo",
    //   width: 80,
    //   sorter: true,
      // sortOrder: ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SNo").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SNo")[0].order : null ,
    // },
    (
      (
        {
          title: "Action",
          dataIndex: "Action",
          width:  "80px",
          fixed: 'left'
        }
      )
    ),
    {
      title: "No.",
      dataIndex: "SNo",
      key: "SNo",
      width:  "80px",
      sortOrder: 'descend' ,
      sorter: (a, b) => a.SNo - b.SNo,
      sortOrder: ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SNo").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SNo")[0].order : null ,

    },
    {
      title: "IRB",
      dataIndex: "IRB",
      key: "IRB",
      width: "100px",
      ...getColumnSearchProps("IRB"),
      filteredValue:filteredValue['IRB'] || null,
      render: (value) => <div >
        <span className="float-left">{value}</span> 
      </div>,
    },
    {
      title: "Notes",
      dataIndex: "Notes",
      key: "Notes",
      width: "350px",
      filteredValue:filteredValue['Notes'] || null,
      filters: [
        { text: <EyeOutlined/>, value: 0 },
        { text: "", value: 1 }
      ],
      // onFilter: (value, record) => {
        
      //   if(value == 0) {
      //     return record.Notes !== null 
      //   } else {
      //     return record.Notes == null 
      //   }
      // }, 
      render: (text, row) => <div >
        <span className="float-left">{text ?  <EyeOutlined onClick={() => openViewModal(row.ID[0])}/> : ''  }</span> 
      </div>,
    },
    {
      title: "User",
      dataIndex: "First",
      key: "First",
      filters: users,
      width: "100px",
      // onFilter: (value, record) => record.First === value,
      filteredValue:filteredValue['First'] || null,

    },
    {
      title: "Modified Date",
      dataIndex: "LastUpdated",
      key: "LastUpdated",
      width: "120px",
      sorter: {multiple: 2},
      feature: "datetime",
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "LastUpdated").length > 0) ?  filteredValue.sort.filter((value) => value.field == "LastUpdated")[0].order : null,
      render: (text, row) => { 
        return {
          children: (
            <div>
               { moment(text).format('YYYY/MM/DD HH:mm')}
              <span className="float-right actions">
              <span className="actions">
                <Popover placement="rightTop" content={content}  trigger="click">
                    <EllipsisOutlined/>
                </Popover>
              </span>
            </span>
            </div>
            ),
        }
      }
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
      
     <IRBDataTableModule config={config} />

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
            deleteModal : null
          }

      </Modals>   

       
    </div>
  }  
}
