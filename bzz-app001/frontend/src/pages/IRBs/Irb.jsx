import React, { useState } from "react";
import { Switch, Input, Space, Button, Popover, Modal, Form, Row, Col } from "antd";
import { EllipsisOutlined, SearchOutlined } from "@ant-design/icons";
import DataTableModule from "@/modules/DataTableModule";
import Highlighter from "react-highlight-words";
import { notification } from "antd";
import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import IrbIcon from "assets/images/add-irb-icon.png";
let { request } = require('@/request/index');

import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import moment from "moment";
import TextArea from "rc-textarea";
import { getDate } from "@/utils/helpers";


export default function Irb() {
  const entity = "irb"; // entity api name , don't change it
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [selectedIRB, setSelectedIRB] = useState(0);
  const [editForm] = Form.useForm();
  const dispatch = useDispatch();
  const [addIcon, setAddIcon] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [notes, setNotes] = useState("");
  const [filteredValue, setFilteredValue] = useState({
    sort: [{
      field: "SNo",
     order: "descend" 
    }] 
  })

  const [reload, setReload] = useState(false);

  const [addForm] = Form.useForm();

  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = getDate() 
  
  const showEditModal = () => {
    let data = items.filter(item => item.ID[0] === selectedIRB)[0]
    editForm.setFieldsValue({IRB: data.IRB, Notes: data.Notes})
    setIsEditModalVisible(true);
  };


  const getIRB = (id) => {
    return items.filter(item => item.ID[0] === id)[0].IRB
  }

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setShowDeleteModal(false);
    setIsViewModalVisible(false);
  };

  const onAddItem = async(values) => {
    values.LastUpdated = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    // await dispatch(crud.create("irb", values));
    let response = await request.create("irb", values);

    if(response.success) {
      setIsEditModalVisible(false)
      reloading()
      addForm.resetFields()
      notification.success({message: "Successfully Added IRB!", duration: 3});
    } 
  }


  const onAddFailed = (errorInfo) => {
    notification.error({message: "Please eneter the IRB!", duration: 3});
  };


  const addModal = {
    icon: IrbIcon,
    title: "Add New Entry",
    type: 'image',
    content : (
        <Form
        name="basic"
        style={{marginTop: "6px !important"}}
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 19 }}
        onFinish={onAddItem}
        onFinishFailed={onAddFailed}
        autoComplete="off"
        form={addForm}
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
  
        <Form.Item wrapperCol={{ offset: 16 }} style={{marginBottom: "6px !important"}}>
          <Button type="primary" htmlType="submit" className="mr-3">
            Save
          </Button>
        </Form.Item>
      </Form>
    )
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
    
   
    
  };

  const content = (
    <div>
      <p onClick={showEditModal} className="menu-option"><span><EditOutlined /></span> Edit</p>
      <p onClick={() => setShowDeleteModal(true)} className="menu-option"><span><DeleteOutlined /></span> Delete</p>

    </div>
  );

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedIRB(record.ID[0])
      },
    };
  }

  const openViewModal = (id) => {
      setIsViewModalVisible(true) 
      let data = items.filter(item => item.ID[0] === id)[0];
      setNotes(data.Notes)
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
    {
      title: "No.",
      dataIndex: "SNo",
      key: "SNo",
      sortOrder: 'descend' ,
      sorter: (a, b) => a.SNo - b.SNo,
      sortOrder: ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SNo").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SNo")[0].order : null ,

    },
    {
      title: "IRB",
      dataIndex: "IRB",
      key: "IRB",
      width: 350,
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
      width: 100,
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
      filters: [
        { text: "Anna Maria", value: "Anna Maria" },
        { text: "Ferdinand", value: "Ferdinand" },
        { text: "Jacqueline", value: "Jacqueline" },
        { text: "Jannet", value: "Jannet" },
        { text: "Mary", value: "Mary" },
        { text: "Suzanne", value: "Suzanne" },
        { text: "Test", value: "Test" },

      ],
      // onFilter: (value, record) => record.First === value,
      filteredValue:filteredValue['First'] || null,

    },
    {
      title: "Modified Date",
      dataIndex: "LastUpdated",
      key: "LastUpdated",
      width: 230,
      sorter: {multiple: 2},
      
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

  const onEdit = async(values) => {
    let response = await request.update("irb", selectedIRB, {IRB: values.IRB, Notes: values.Notes, LastUpdated: currentDate});
    if(response.success) {
      setIsEditModalVisible(false)
      reloading()
      notification.success({message: "Sucessfully updated the IRB!", duration: 3})
    } 
    
  }

  const onEditFailed = () => {
      notification.error({message: "Please enter IRB",  duration: 3})
  }

  const getItems  = (items) => {
    setItems(items)
  }

  const reloading = () => {
    setReload(true)
    setReload(false)
  }

  const onDeleteIRB = async () => {
    await dispatch(crud.delete("irb", selectedIRB))
    notification.success({message: "Successfully deleted IRB!",  duration: 3})
    setShowDeleteModal(false)
    setSelectedIRB(0)
    reloading()
  } 

  const getFilterValue = (values) => {
    // if(!values.sort.column) {
      // values.sort = [{
      //   column: "SNo",
      //   order: "descend"
      // }] 
    // }


      
      if(values.sort && values.sort.filter((value) =>  value.column == "SNo").length == 0 ) {
        values.sort.push({
          column: "SNo",
          order: "descend"
        })
      }
  
      setFilteredValue(values)
    
  }

  const DATATABLE_TITLE = "Data Collection";

  const config = {
    entity,
    DATATABLE_TITLE,
    dataTableColumns,
    handleRowClick,
    getItems,
    onAddItem,
    addModal,
    reload,
    getFilterValue
  };
  return <>
    <DataTableModule config={config} />;
    <Modal 
      maskClosable={false}
      centered
      title="Edit IRB and/or Notes" 
      visible={isEditModalVisible} 
      onCancel={handleCancel}
      footer={null}
      width={330}
      >
      <Form
        name="basic"
        labelCol={{ span: 5 }}
        onFinish={onEdit}
        onFinishFailed={onEditFailed}
        autoComplete="off"
        form={editForm}
      >
        <Form.Item
          label="IRB"
          name="IRB"
          labelAlign="left"
          rules={[{ required: true, message: 'Please input irb!' }]}
        >
          <Input type="text" ></Input>
        </Form.Item>

        <Form.Item
          style={{marginBottom: "15px !important"}}
          label={<span style={{marginLeft: "10px"}}> Notes</span>}
          name="Notes"
          
        >
          
          {/* <Input type="text" /> */}
          <TextArea type="text" style={{ width: "100%", border: "1px solid lightgrey", marginBottom: "-5px" }} rows={10}></TextArea>
        </Form.Item>

        <Form.Item labelAlign="right" wrapperCol={{ offset: 17 }}>
            <Button className="mr-3" type="primary" htmlType="submit">
                Update
            </Button>
        </Form.Item>
      </Form>
    </Modal>

    <Modal
      maskClosable={false}
      centered
      title="View Notes"
      visible={isViewModalVisible}
      footer={null}
      onCancel={handleCancel}
      width={240}
    >
      <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
          <Col className="gutter-row" span={24}>
            {notes}
          </Col>
      </Row>
    </Modal>

    <Modal
      maskClosable={false}
      centered
      title="Delete Entry"
      visible={showDeleteModal}
      footer={null}
      onCancel={handleCancel}
      width={240}

    >
      <p>Deleting IRB {selectedIRB ?  getIRB(selectedIRB): ""} ?</p>
      <div className="text-right">
        <Button type="danger" className="mb-10" onClick={() => onDeleteIRB()}> Delete</Button>
      </div>
    </Modal>
  </>
}
