import React, { useState } from "react";
import {Row,Col,DatePicker,Form, Button
} from "antd";
const { RangePicker } = DatePicker;
export default function Header({ config }) {

  const {dataTableTitle, searchTable} = config
  const [form] = Form.useForm()
  const [date, setDate] = useState([])
  const onSubmit = () => {
    form.resetFields()
    searchTable(date)
  }

  const onChange = (e, d) => {
    setDate(d)
  }

  return (
    <Row gutter={[24,24]}>
            <Col span={12}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
            <Col span={12}  style={{textAlign :"end"}}>
                <Form  layout="horizontal"
      name="basic"
      form={form}
      onFinish={onSubmit}
      autoComplete="off">
        <div>
          <div className="display">
          <Form.Item
                    label="Denial Date"
                    name="Denial Date"
                  
                  >
                      <RangePicker  onChange={(e,d) => onChange(e,d)}/>
                  </Form.Item>
          </div>
          <div className="display ">
          <Form.Item>
                    <Button type="primary" className="ml-3" htmlType="submit">
                      Search
                    </Button>
                  </Form.Item>
          </div>
        </div>
         
         
         
                 
                
                </Form>
            </Col>
          </Row> 
  )
}
