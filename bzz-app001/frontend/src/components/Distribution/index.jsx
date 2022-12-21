import React, { useEffect, useState } from "react";
import { Select, Button, notification, Form, Row, Col, Divider , Input} from "antd";
import PageLoader from "@/components/PageLoader";

import { UnorderedListOutlined } from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import Modals from "../Modal";
import { request } from "@/request";
const {Option} = Select;


export default function Distribution({ entity, show, users , loadTable}) {
  const [openModal, setOpenModal] = useState(false);
  const [distributionList, setDistributionsList] = useState();
  const [categoryError, setCategoryError] = useState("");
  const [namesError, setNamesError] = useState("")

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();


  const closeModal = () => {
    setOpenModal(false)
  }

  const modalConfig = {
    openModal: openModal,
    handleCancel: closeModal,
    title: <span style={{ paddingLeft: "13px", fontWeight: 700 }}> {entity.toUpperCase() + " Assignments"} </span>,
    width: 800,
    minWidth: "800px"
  };


  const open = () => {
    {
      setOpenModal(true)
      form ? form.resetFields() : ""
    }
  }


  const checkCategory = () => {
    let value = form.getFieldsValue();

    if (+value.Min >= +value.Max) {
      if (((value.Min == '' || !value.Min) && value.Max)) {
        setCategoryError('Min is required')

      } else if (value.Min && (value.Max == "" || !value.Max)) {
        setCategoryError('Max is required')

      } else if (value.Max || value.Min) {
        setCategoryError('Min must be smaller than Max')
      }
      else {
        setCategoryError('')
      }
      return
    } else if (+value.Min && +value.Max) {
      setCategoryError('')
      value['Category'] = value.Min + "-" + value.Max
    } else if (((value.Min == '' || !value.Min) && value.Max)) {
      setCategoryError('Min is required')

    } else if (value.Min && (value.Max == "" || !value.Max)) {
      setCategoryError('Max is required')

    } else {
      setCategoryError('')
    }
  }

  const onDistribution = async (value) => {


    if (value.distributions < 1)   return
    if (typeof value['Process Type'] == 'string') value["Process Type"] = [value['Process Type']]
    if (typeof value['Status'] == 'string')   value["Status"] = [value['Status']]
    if (typeof value['UserAssigned'] == 'string')  value["UserAssigned"] = [value['UserAssigned']]
  
    value = {
      'Process Type': value['Process Type'],
      'UserAssigned': value['UserAssigned'] ? value['UserAssigned'] : "",
      'User': "",
      'Status': value['Status'],
      'distributions': value.distributions,
      'Gov Cov Flag': value.GovCovFlag,
      'Sess Amount': value.Min + "-" + value.Max,
      'Patient': value.First + "-" + value.Last

    }
    
    setDistributionsList([])
    let response = await request.create('distributions', { Distributions: value.distributions, Model: entity, values: value })
    let result = (response.result)

    if (response.message == "Record") {
      notification.error({ message: "No charges found by selected criteria!" })
      setDistributionsList(null)
      return
    } else if (response.message == "Distribution") {
      notification.error({ message: "Distributions exceed the number of charges available!" })
      setDistributionsList(null)
      return
    }

    result = result.map((res) => {
      return ({
        userAssigned: "",
        result: res
      })
    })
    setDistributionsList(result);
  }

  const onAssignDestribution = async (value) => {
    let keys = Object.keys(value)
    let obj = keys.map((v, i) => {
      return {
        'UserAssigned': value['distributions-' + i],
        'Patient MRN': distributionList[i].result.map(re => re['Patient MRN']),
      }
    })


    let dup = (obj.map((o) => o['UserAssigned']).filter((item, index) => obj.map((o) => o['UserAssigned']).indexOf(item) !== index))

    if (dup.length > 0) {
      notification.error({ message: "Duplicate Entry!" })
      return
    }

    let filter = form.getFieldValue()
    delete filter['distributions']

    if (value.distributions < 1) return
    if (typeof filter['Process Type'] == 'string') filter["Process Type"] = [filter['Process Type']]
    if (typeof filter['Status'] == 'string')   filter["Status"] = [filter['Status']]
    if (typeof filter['UserAssigned'] == 'string')  filter["UserAssigned"] = [filter['UserAssigned']]
  
    filter = {
      'Process Type': filter['Process Type'],
      'UserAssigned': filter['UserAssigned'] ? filter['UserAssigned'] : "",
      'User': filter['UserLogged'] ? filter['UserLogged'] : "",
      'Status': filter['Status'],
      'distributions': filter.distributions,
      'Gov Cov Flag': filter.GovCovFlag,
      'Sess Amount': filter.Min + "-" + filter.Max,

    }
  
    if(filter.First && filter.Last) filter['Patient'] =  filter.First + "-" + filter.Last
  
    let response = await request.create('distributions-assigned', { Obj: obj, filter: filter, Model: entity })

    if (response.success) {
      notification.success({ message: "Charges redistributed successfully!" })
    } else {
      notification.error({ message: "Something went wrong!" })
    }


    loadTable()
    closeModal()
    form.resetFields()
    assignForm.resetFields()
    setDistributionsList(null)

  }



  const assignModalContent = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onAssignDestribution}
      autoComplete="off"
      form={assignForm}
    >

      <div className="charges-list" >

        <Row gutters={[24, 24]}>

          <Col span={11}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <div className="distributions-list">
                    {
                      distribution.result[0] ?
                        <div>
                          <span className="bold"> {i + 1}.</span> {distribution.result[0]['Patient MRN']} -  {distribution.result[distribution.result.length - 1]['Patient MRN']}
                        </div>
                        : null
                    }
                  </div>
                )
              })
            }
          </Col>
          <Col span={3}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <div className="distributions-list">
                    {distribution.result.length}
                  </div>
                )
              })
            }
          </Col>
          <Col span={10} style={{ paddingRight: "15px" }}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <Form.Item
                    label=""
                    name={"distributions-" + i}
                    rules={[
                      {
                        required: true,
                        message: "please select user"
                      },
                    ]}
                  >

                    <Select style={{ width: "100%" }} >
                      {
                        users && users.map((user => {
                          return <Option key={user.EMPID} value={user.text}>{user.text}</Option>

                        }))
                      }

                    </Select>
                  </Form.Item>

                )
              })
            }

          </Col>
        </Row>
      </div>


      <Form.Item wrapperCol={{ offset: 20 }}>
        <Button type="primary" htmlType="submit" style={{ marginLeft: "55px", marginBlock: "15px" }}>
          Assign
        </Button>
      </Form.Item>
    </Form>



  )

  const assginDistribution = (

    <Row gutter={[24, 24]} style={{ rowGap: "0px", height: "100%", display: "block" }}>
      <Col span={24} style={{ paddingTop: "6px", paddingRight: "48px", marginBottom: "22px" }}>
        <Row >
          <Col span={11} >
            <h4>Distributions</h4>
          </Col>
          <Col span={3} style={{ padding: "0px 5px" }}>
            <h4>Total</h4>
          </Col>
          <Col span={10} style={{ padding: "0px 10px" }}>
            <h4>User Assigned</h4>
          </Col>
        </Row>
      </Col>

      <Col span={24} className="distribution-charges-container">
        {
          distributionList && distributionList.length > 0 ?
            assignModalContent
            :
            distributionList && distributionList.length == 0 ?
              <PageLoader />
              :
              null
        }
      </Col>
    </Row>
  )


  return (
    <>
      {
        show ?
          <Button className="ml-3" style={{ display: "inline" }} size="small"
            onClick={open}
            key={`${uniqueId()}`}>
            <UnorderedListOutlined />
          </Button>
          : null
      }

      <Modals config={modalConfig}>
        <Row gutter={[24, 24]} className="filter-distribuions">
          <Col span={24}>
            <Form
              name="basic"
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 24 }}
              onFinish={onDistribution}
              autoComplete="off"
              form={form}
            >

              <Row gutter={[24, 24]} styele={{ rowGap: "0px" }}>
                <Col span={8}>
                  <h4>Process Type <span style={{ color: "red" }}>*</span></h4>
                  <Form.Item
                    label="Process Type"
                    name="Process Type"
                    rules={[{required: true}]}
                  >
                    {
                      entity == "wq5508" ?
                        <Select style={{ width: "100%" }} mode="multiple" >
                          <Option value="Expedite">Expedite</Option>
                          <Option value="Standard">Standard</Option>
                        </Select>
                        :
                        <Select style={{ width: "100%" }} mode="multiple" >
                          <Option value="60 Days and Over">60 Days and Over</Option>
                          <Option value="Under 60 Days">Under 60 Days</Option>
                        </Select>
                    }

                  </Form.Item>

                </Col>
                <Col span={8}>
                  <h4>Status <span style={{ color: "red" }}>*</span></h4>

                  <Form.Item
                    label="Status"
                    name="Status"
                    rules={[ {required: true}]}
                  >

                    <Select style={{ width: "100%" }} mode="multiple">
                      <Option value="Review">Review</Option>
                      <Option value="Pending">Pending</Option>
                      <Option value="Misc">Misc</Option>
                      <Option value="Deferred">Deferred</Option>
                    </Select>
                  </Form.Item>

                </Col>
                <Col span={8}>
                  <h4>Government Coverages (Y/N) ?</h4>
                  <Form.Item
                    label="Gov Cov Flag"
                    name="GovCovFlag"
                  >
                    <Select placeholder={"Both in Yes and No"} style={{ width: "100%" }} mode="multiple">
                      <Option value=""></Option>
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <h4>User Assigned</h4>

                  <Form.Item
                    label="User Assigned"
                    name="UserAssigned"
                  >
                    <Select placeholder="Not Specified" style={{ width: "100%" }} mode="multiple">
                      <Option key={100} value={""}></Option>

                      {
                        users && users.map((user, index) => {
                          return <Option key={index} value={user.name}>{user.name}</Option>
                        })
                      }

                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <h4>$ Amount Range</h4>

                  <div style={{ width: "100%", border: "1px solid lightgrey" }}>
                    <div className="w-50">
                      <Form.Item
                        label=""
                        name="Min"
                      >
                        <Input type="number" min={0} onKeyUp={checkCategory} />
                      </Form.Item>
                    </div>
                    <div className="w-50">
                      <Form.Item
                        label=""
                        name="Max"
                      >
                        <Input type="number" min={0} onKeyUp={checkCategory} />
                      </Form.Item>
                    </div>

                  </div>
                  <span style={{ color: "red" }}>{categoryError}</span>

                </Col>

                <Col span={8}>
                  <h4>A-Z Name Range</h4>

                  <div style={{ width: "100%", border: "1px solid lightgrey" }}>
                    <div className="w-50">
                      <Form.Item
                        label=""
                        name="First"
                      >
                        <Input type="" min={0} />
                      </Form.Item>
                    </div>
                    <div className="w-50">
                      <Form.Item
                        label=""
                        name="Last"

                      >
                        <Input type="text" min={0} />
                      </Form.Item>
                    </div>

                  </div>
                  <span style={{ color: "red" }}>{namesError}</span>


                </Col>

                <Col span={8}>
                  <h4>Number of Staff <span style={{ color: "red" }}>*</span></h4>
                  <Form.Item
                    label=""
                    name="distributions"
                    rules={[ {required: true}]}
                  >
                    <Input type="number" min={1} style={{ width: "100%" }} className="box-shadow" />
                  </Form.Item>
                </Col>

                <Col span={16}>
                  <Form.Item style={{ textAlign: "end" }}>
                    <Button type="primary" htmlType="submit" className="WQ5508-distribution-button">
                      Distribute
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>

          <Col span={24}>

            {
              distributionList && distributionList.length > 0 ?
                <div>
                  <Divider />
                  {assginDistribution}
                </div>

                : null
            }
          </Col>
        </Row>
      </Modals>
    </>
  );
}
