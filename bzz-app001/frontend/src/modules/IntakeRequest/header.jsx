import React, { useState } from "react";
import {Row,Col,DatePicker,Form, Button
} from "antd";
import { IdcardOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
export default function Header({ config }) {

  const {dataTableTitle, openModal} = config
  const [form] = Form.useForm()
  const [date, setDate] = useState([])
 

  return (
    <Row gutter={[24,24]}>
            <Col span={16}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
            <Col span={8}  style={{textAlign :"end"}}>
            <Button size="small" onClick={() =>openModal()}>
                  <IdcardOutlined/>
                </Button>
            </Col>
          </Row> 
  )
}
