

import React, {  useState, useRef} from "react";
import { Modal, Form, Button , Input, notification} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import Modals from "../Modal";
import uniqueId from "@/utils/uinqueId";

import { request } from "@/request";

export default function forwardRef({ entity, setLoading , show}) {
  const [selectedFile, setSelectedFile] = useState()
  const [openModal, setOpenModal] = useState(false)
  const [form] = Form.useForm();
  const [password, setPassword]= useState('Password1!')
  const ref = useRef();

  const uploadFile = async (e) => {
    setSelectedFile(e.target.files[0])
  }

  const closeExportModal = () => {
    setSelectedFile({})
    form.resetFields()
    closeModal()

  }

  
  

  const handleFileUpoad = async () => {
    const formData = new FormData();

    if(!selectedFile  ) {
      console.log('error')
      notification.error({message: 'Please select a file'})
      return 
    }

    formData.append(
      "myFile",
      selectedFile,
      selectedFile.name
    );
    formData.append('password', password)
    
    closeExportModal()
    setLoading(true)

    let response = await request.create("upload-file-" + entity.toUpperCase(), formData)

    if(response.success) {
      notification.success({ message: "Data is uploading..." })
    } else {
      setLoading(false)
      
    }
   
  }

  const open = () => {
    setOpenModal(true)
  }

  const closeModal = () => {
    setOpenModal(false)
  }

  const  config = {
    title: "Upload File",
    entity: entity,
    openModal: openModal,
    handleCancel:closeModal,
    setLoading: setLoading 
  };
 
  return (
    <>

      {
        show?
        <Button className="ml-3" size="small" onClick={open} key={`${uniqueId()}`}>
          <UploadOutlined />
        </Button> 
      : null
      }
      

      <Modals config={config}>
        <div className="load-modal">

          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            autoComplete="off"
            form={form}
            style={{
              width: "95%",
              margin: "auto"
            }}
            initialValues={{
              'password': 'Password1!',
            }}
          >
            <Form.Item label="File" name="file">
              <Input type="file" className="file-upload" ref={ref} id="file" style={{ marginBottom: "-5px", marginTop: "10px" }} onChange={(e) => uploadFile(e)} />
            </Form.Item>

            <Form.Item label="Password" name="password">
              <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="box-shadow" />
            </Form.Item>

            <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
              <Button type="primary" onClick={() => handleFileUpoad()}>Yes</Button>
              <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExportModal()}>No</Button>
            </div>
          </Form>
        </div>
      </Modals>
    </>
  );
}



