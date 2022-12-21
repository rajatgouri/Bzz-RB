import React, {useState} from "react";
import { crud } from "@/redux/crud/actions";
import DataTableModule from "@/modules/DataTableModule";
import { Popover, Row, Col} from "antd";
import { useDispatch } from "react-redux";
import { notification } from "antd";

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
import {  Form , Input, Button} from 'antd';
import Modals from '../components/Modal';
let { request } = require('../request/index');


export default function Admin() {
  const entity = "admin";
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalType, setModalType] = useState("");
  const DATATABLE_TITLE = "Users"

  const dispatch = useDispatch()

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedUser(record)
      },
    };
  }

  const dataTableColumns = [
    { title: "First", dataIndex: "First" },
    { title: "Last", dataIndex: "Last" },
    { title: "Email", dataIndex: "Email" },
    { title: "Employee ID", dataIndex: "EmployeeID"},  
    { title: "Password", dataIndex: "Password" },
    {
      title: "",
      render: () => 
       <div >
        <span className="float-right actions">
          <span className="actions">
            <Popover placement="rightTop" content={content} trigger="click">
              <EllipsisOutlined />
            </Popover>
          </span>
        </span> 
       </div>
    },
  ];


  // Open view Modal

  const openViewModal = () => {
    setModalTitle("View User");
    setModalType("VIEW");
    setOpenModal(true);
  }

  // Open Delete Modal
  const openDeleteModal = () => {
    setModalTitle("Delete User");
    setModalType("DELETE");
    setOpenModal(true);
  }

  // open Edit Modal
  const openEditModal = () => {
    let user = items.filter(item => item.ID === selectedUser.ID)[0];
    setModalType("EDIT");
    editForm.setFieldsValue({
      IDEmployee: user.IDEmployee,
      First: user.First,
      Last: user.Last,
      Email: user.Email
    })

    setModalTitle("Edit User");
    setOpenModal(true)
  }

  const content = (
    <div>
      <p className="menu-option" onClick={openViewModal}><span><EyeOutlined /></span> Show</p>
      <p onClick={openEditModal} className="menu-option"><span><EditOutlined /></span> Edit</p>
      <p onClick={openDeleteModal} className="menu-option"><span><DeleteOutlined /></span> Delete</p>
    </div>
  );

  // delete User

  const onDeleteUser = async () => {
    await dispatch(crud.delete(entity, selectedUser.ID))
    notification.success({message: "Successfully deleted the User!", duration: 3 })
    reloading()
  }

  const deleteModal = (
    <div>
      <p>Deleting User {selectedUser.Email} ?</p>
      <div className="text-right mb-2">
        <Button type="danger" onClick={onDeleteUser}> Delete</Button>
      </div>
    </div> 
  )
  // delete User

  const getItems  = (items) => {
    setItems(items)
    
  }

  const reloading = () => {
    setReload(true)
    setReload(false)
  }

  const onAddItem = async(values) => {
    const response = await request.create(entity, values);
    if(response.success) {
      setOpenModal(false)
      reloading()
      notification.success({message: "User Added Successfully!", duration:3})
    } else {
      notification.error({message: response.message,duration:3})

    }
    
    // // await dispatch(crud.create("irb", values));
    // let response = await request.create("irb", values);

    // if(response.success) {
    //   setIsEditModalVisible(false)
    //   reloading()
    //   notification.success({message: "Successfully Added IRB!"});
    // } else {
    //   notification.error({message: response.message})
    // }
  }

  const onAddFailed = (errorInfo) => {
    // notification.error({message: "Please eneter the IRB!"});
  };



  // Add Modal
  const addModal = {
    icon: <IdcardOutlined/>,
    type: 'icon',
    title: "Add New User",
    content : (
      <div>
        <Form
        name="addForm"
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 15 }}
        onFinish={onAddItem}
        onFinishFailed={onAddFailed}
        autoComplete="off"
        form={addForm}
      >
        <Form.Item
          label="Employee ID"
          name="IDEmployee"
          rules={[{ required: true, message: 'Please input Employee ID!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}
        >      
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="First"
          name="First"
          rules={[{ required: true, message: 'Please input First Name!'}]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="Last"
          name="Last"
          rules={[{ required: true, message: 'Please input last Name!'}]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="Email"
          rules={[{ required: true, message: 'Please input Email !'}, {pattern: new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g), message: "Please enter valid email"}]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="Password"
          rules={[{ required: true, message: 'Please input Password!'}, {pattern: new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,10}$/), message: "Please enter valid password"}]}
        >
          
          <Input type="password" />
        </Form.Item>
  
        <Form.Item wrapperCol={{ offset: 18 }}>
          <Button type="primary" htmlType="submit" className="mr-3">
            Save
          </Button>
        </Form.Item>
      </Form>
      </div>
    )
  }

  // View Modal
  const viewModal = (
     <Row gutter={[24, 24]}>
        <Col className="gutter-row" span={8}>
          <span>Employee ID: </span>
        </Col>
        <Col className="gutter-row" span={16}>
          {selectedUser.IDEmployee}
        </Col>
        <Col className="gutter-row" span={8}>
          <span>First: </span>
        </Col>
        <Col className="gutter-row" span={16}>
          {selectedUser.First}
        </Col>
        <Col className="gutter-row" span={8}>
          <span>Last: </span>
        </Col>
        <Col className="gutter-row" span={16}>
          {selectedUser.Last}
        </Col>
        <Col className="gutter-row" span={8}>
          <span>Email: </span>
        </Col>
        <Col className="gutter-row" span={16}>
          {selectedUser.Email}
        </Col>
    </Row>  
  )

  const onEditItem = async (values) => {
    const response = await request.update(entity, selectedUser.ID, values);
    if(response.success) {
      setOpenModal(false)
      reloading()
      notification.success({message: "User Updated Successfullly!", duration:3})
    } else {
      notification.error({message: response.message, duration:3})
    }
  }

  // edit form
  const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label="Employee ID"
      name="IDEmployee"
      rules={[{ required: true, message: 'Please input Employee ID!'}, {pattern: new RegExp(/\d+/g), message: "Please enter Numbers"}]}
    >      
      <Input type="text" />
    </Form.Item>
    <Form.Item
      label="First"
      name="First"
      rules={[{ required: true, message: 'Please input First Name!'}]}
    >
      <Input type="text" />
    </Form.Item>
    <Form.Item
      label="Last"
      name="Last"
      rules={[{ required: true, message: 'Please input last Name!'}]}
    >
      <Input type="text" />
    </Form.Item>
    <Form.Item
      label="Email"
      name="Email"
      rules={[{ required: true, message: 'Please input Email !'}, {pattern: new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g), message: "Please enter valid email"}]}
    >
      <Input type="text" />
    </Form.Item>
    <Form.Item
      label="Password"
      name="Password"
      rules={[{pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/), message: "Please enter valid password"}]}
    >
      
      <Input type="password" />
      
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 8 }}>
    <div >
      <p style={{marginBottom: "0px", fontSize: "11.5px", color: "#1DA57A"}}>Minimum of 6 characters</p>
      <p style={{marginBottom: "0px", fontSize: "11.5px", color: "#1DA57A"}}>One uppercase letter</p>
      <p style={{marginBottom: "0px", fontSize: "11.5px", color: "#1DA57A"}}>One number</p>

    </div>
    </Form.Item>
      

    <Form.Item wrapperCol={{ offset: 18 }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        Update
      </Button>
    </Form.Item>
  </Form>
  )

  const getFilterValue = () => {}

  
  const config = {
    entity,
    DATATABLE_TITLE,
    dataTableColumns,
    handleRowClick,
    getItems,
    getFilterValue,
    onAddItem,
    addModal,
    reload
  };

  const handleCancel = () => {
    setModalTitle("")
    setOpenModal(false)
  }

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  return (
    <div>
      <Modals config={modalConfig} >
          {
            modalType == "EDIT" ? 
            editModal : null
          }
          {
            modalType == "DELETE" ? 
            deleteModal : null
          }
          {
            modalType == "VIEW" ? 
            viewModal : null
          }
      </Modals>
      <DataTableModule config={config} />
    </div>
  );
}
