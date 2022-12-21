
import React, { useState, useEffect, useRef } from "react";

import { Input, Button, Space, Form, Row, Col, Select, notification, DatePicker, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
let { request } = require('../request/index');
import { selectAuth } from "@/redux/auth/selectors";
import TextArea from "rc-textarea";
import moment from "moment";


import { getDate } from '@/utils/helpers'
import Modals from "@/components/Modal";
import IntakeRequestTableModule from "@/modules/IntakeRequest";
const dateFormat = 'YYYY/MM/DD';



export default function IntakeRequestTable({ page }) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(true);
  const [errors, setErrors] = useState({})

  const [selectedRow, setSelectedRow] = useState("");
  const [loaded, setLoaded] = useState(false)
  const [filters, setFilters] = useState({});
  const [hasFilters, setHasFilters] = useState(false);
  const [filtersBackup, setFiltersBackup] = useState({})
  const childRef = useRef();
  const [process, setProcess] = useState('5508')
  const [ETA, setETA] = useState()
  const [WBD, setWBD] = useState()
  const [dataTableTitle, setDataTableTitle] = useState('')

  const currentDate = getDate()

  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const { current } = useSelector(selectAuth);
  const [reset, setReset] = useState(false)
  const [filteredValue, setFilteredValue] = useState({
  })

  const dispatch = useDispatch()

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
            onClick={() => handleReset(clearFilters, dataIndex, confirm)}
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


  };

  const entity = "intake-request";

  useEffect(() => {
    getFilters()
  }, [items])

  useEffect(() => {
    setDataTableTitle("Intake Requests")
  }, [page])

  const getFilterValue = (values) => {

    setFilteredValue(values)
  }



  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setETA(null)
    setWBD(null)
  }

  const getFilters = async () => {

    let { result: data } = await request.list(entity + "-filters")

    let filterObject = {}
    data.map((d) => {
      let item3 = d.column
      if (item3 == 'Assignee') {
        d.recordset.push({ Assignee: "" })
      }
      filterObject[item3] = ([...new Set(d.recordset.sort((a, b) => b[d.column] - a[d.column]))].map(item => ({ text: item[d.column], value: item[d.column] })))
    })

    setFilters(filterObject)

  }


  const getItems = (data) => {
    setItems(data)
  }


  const onCopied = (id, mrn) => {
    dispatch(crud.create(loggerEntity, { IDWQ: id, UserName: current.name, Color: "", Status: "Copy MRN", DateTime: currentDate }))
  }






  const onRowMarked = async (type, row, value) => {
    setReload(false)
    let obj = {}
    obj = { Correct: (value) }
    await dispatch(crud.update(entity, row.ID, obj))
    setReload(true)
  }

  const onDateChanges = (entity, date) => {
    delete errors[entity]

    if (entity == 'ETA') {
      setETA(date)
    } else if (entity == "WBD") {
      setWBD(date)
    }
  }


  const onDelete = async () => {
    setReload(false)
    await request.delete(entity, selectedId)
    notification.success({ message: "Task Deleted successfully!" })
    handleCancel()
    setReload(true)

  }

  const deleteModal = (
    <div>
      <p>Delete  {selectedRow ? selectedRow['Task'] : 0} ?</p>
      <p>Do you want to delete this task?</p>

      <div className="text-right ">
        <Button type="danger" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )




  const openingModal = (row, type) => {

    setModalType(type);
    editForm.resetFields()

    if (type == 'EDIT') {
      setSelectedId(row.ID)
      setSelectedRow(row)

      editForm.setFieldsValue({
        Requester: row['Requester'],
        Task: row['Task'],
        'Task Description': row['Task Description'],
        'Assignee': row['Assignee'] ? row['Assignee'].split(',') : [],
        'Approved': row['Approved'],
        'Status': row['Status'],
        'Priority': row['Priority'],
        'Pain Point': row['Pain Point'],
        'Deliverable': row['Deliverable'],
        'Due Reason': row['Due Reason'],
        'Completed':row['Completed'],
        'ROI': row['ROI']

      })
      setETA(row['Due Date'])

      setWBD(row['Wish By Date'])


      setModalTitle("Edit Request");
    } else if (type == 'ADD') {
      setModalTitle("Add Request");

      setModalType("ADD");

    } else {

      setSelectedId(row.ID)
      setSelectedRow(row)
    }

    setOpenModal(true)

  }





  const onEditItem = async (values) => {
    values['Due Date'] = ETA
    values['Wish By Date'] = WBD

    values['Dept'] = 'RB'
    console.log(values)



    if (modalType == 'ADD') {
      setReload(false)
      await request.create(entity, values)
      notification.success({ message: "Request added successfully!" })
      setReload(true)


    } else {
      setReload(false)
      await request.update(entity, selectedId, values)
      notification.success({ message: "Request updated successfully!" })
      setReload(true)

    }
    handleCancel()
  }


  const onChange = async (value, dataIndex, ID) => {
    setReload(false)
    let obj = {}
    obj[dataIndex] = value
    await request.update(entity, ID, obj)
    setReload(true)
  }

  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

      <Col className="gutter-row" span={24}>
        {selectedRow.Notes}
      </Col>
    </Row>
  )





  const footer = () => {
    return (
      <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
        <Col style={{ width: "100%", height: "10px" }}>


        </Col>
      </Row>
    )
  }


  const panelTitle = "Form Fast";
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    width: "800px"
  };

  const dataTableColumns = [
    {
      title: "Action",
      dataIndex: "Action",
      width: "70px",
      fixed: 'left',
      type: "text"
    },
    {
      title: "Dept",
      dataIndex: "Dept",
      width: "80px",
      type: "search",
      align: "center",
      filters: filters['Dept'],
      filterSearch: true,
      filteredValue: filteredValue['Dept'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Dept").length > 0) ? filteredValue.sort.filter((value) => value.field == "Dept")[0].order : null
    },
    {
      title: "Stakeholder",
      dataIndex: "Requester",
      width: "130px",
      type: "filter",

      filters: filters['Requester'],
      filterSearch: true,
      filteredValue: filteredValue['Requester'] || null,
      sorter: { multiple: 2 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Requester").length > 0) ? filteredValue.sort.filter((value) => value.field == "Requester")[0].order : null
    },
    // {
    //   title: "Request Name",
    //   dataIndex: "Task",
    //   width: "140px",
    //   type: "search",
    //   ...getColumnSearchProps("Task"),

    //   filterSearch: true,
    //   filteredValue: filteredValue['Task'] || null,
    //   sorter: { multiple: 3 },
    //   sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Task").length > 0) ? filteredValue.sort.filter((value) => value.field == "Task")[0].order : null
    // },
    {
      title: "Business Need",
      dataIndex: "Task Description",
      width: "350px",
      type: "search",
      feature: "tooltip",
      ...getColumnSearchProps("Task Description"),

      filterSearch: true,
      filteredValue: filteredValue['Task Description'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Task Description").length > 0) ? filteredValue.sort.filter((value) => value.field == "Task Description")[0].order : null
    },
    {
      title: "Business Problem/Pain Point",
      dataIndex: "Pain Point",
      width: "350px",
      type: "search",
      feature: "tooltip",
      ...getColumnSearchProps("Pain Point"),

      filterSearch: true,
      filteredValue: filteredValue['Pain Point'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Pain Point").length > 0) ? filteredValue.sort.filter((value) => value.field == "Pain Point")[0].order : null
    },
    {
      title: "Deliverable",
      dataIndex: "Deliverable",
      width: "150px",
      type: "search",
      feature: "tooltip",
      ...getColumnSearchProps("Deliverable"),

      filterSearch: true,
      filteredValue: filteredValue['Deliverable'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Deliverable").length > 0) ? filteredValue.sort.filter((value) => value.field == "Deliverable")[0].order : null
    },
    {
      title: "ROI",
      dataIndex: "ROI",
      width: "350px",
      type: "search",
      feature: "tooltip",
      ...getColumnSearchProps("ROI"),

      filterSearch: true,
      filteredValue: filteredValue['ROI'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ROI").length > 0) ? filteredValue.sort.filter((value) => value.field == "ROI")[0].order : null
    },
    {
      title: "Wish-by Date",
      dataIndex: "Wish By Date",
      width: "140px",
      type: "date",
      feature: "date",
      filterSearch: true,
      ...getColumnSearchProps("Wish By Date"),
      filteredValue: filteredValue['Wish By Date'] || null,
      sorter: { multiple: 4 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Wish By Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Wish By Date")[0].order : null
    },
    {
      title: "Due Date",
      dataIndex: "Due Date",
      width: "120px",
      type: "date",
      feature: "date",
      filterSearch: true,
      ...getColumnSearchProps("Due Date"),
      filteredValue: filteredValue['Due Date'] || null,
      sorter: { multiple: 4 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Due Date")[0].order : null
    },
    {
      title: "Due Reason",
      dataIndex: "Due Reason",
      width: "150px",
      type: "search",
      feature: "tooltip",
      ...getColumnSearchProps("Due Reason"),

      filterSearch: true,
      filteredValue: filteredValue['Due Reason'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Due Reason").length > 0) ? filteredValue.sort.filter((value) => value.field == "Due Reason")[0].order : null
    },
    {
      title: "Priority",
      dataIndex: "Priority",
      width: "90px",
      type: "filter",
      feature: page == 'Governance' ? "select" : "text",

      filterSearch: true,
      options: [
        { text: 'Highest', value: 'Highest' },
        { text: 'High', value: 'High' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Low', value: 'Low' },
        { text: '', value: 'null' }

      ],
      filters: filters['Priority'],
      filteredValue: filteredValue['Priority'] || null,
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Priority").length > 0) ? filteredValue.sort.filter((value) => value.field == "Priority")[0].order : null
    },
    
    {
      title: "Assignee",
      dataIndex: "Assignee",
      width: "150px",
      type: "search",
      feature: page == 'Governance' ? "select" : "text",
      mode: "multiple",
      filterSearch: true,
      filters: filters['Assignee'],
      options: filters['Assignee'],
      filteredValue: filteredValue['Assignee'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Assignee").length > 0) ? filteredValue.sort.filter((value) => value.field == "Assignee")[0].order : null
    },

    {
      title: "Status",
      dataIndex: "Status",
      width: "90px",
      type: "filter",
      feature: page == 'Governance' ? "select" : "text",

      filterSearch: true,
      options: [
        { text: 'Approved', value: 'Approved' },
        { text: 'Declined', value: 'Declined' },
        { text: 'On Hold', value: 'On Hold' },
        { text: 'TBD', value: 'TBD' },
        { text: '', value: 'null' }

      ],
      filters: filters['Status'],
      filteredValue: filteredValue['Status'] || null,
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Status")[0].order : null
    },
    {
      title: "Completed",
      dataIndex: "Completed",
      width: "120px",
      type: "filter",
      feature:  "select" ,

      filterSearch: true,
      options: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
        { text: '', value: 'null' }

      ],
      filters: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
        { text: '', value: 'null' }
      ],
      filteredValue: filteredValue['Completed'] || null,
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Completed").length > 0) ? filteredValue.sort.filter((value) => value.field == "Completed")[0].order : null
    }





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
    dataTableColumns: dataTableColumns,
    dataTableColorList,
    getItems,
    reload,
    onCopied,
    getFilterValue,
    onRowMarked,
    reset,
    classname: 'denials',
    scroll: { y: 'calc(100vh - 19.3em)' },
    onChange,
    openingModal,
    footer: footer,
    ref: childRef,
    setProcess: (process) => setProcess(process),
    process: process
  };


  {
    return (
      <div>
        <IntakeRequestTableModule config={config} />

        <Modals config={modalConfig} >

          {
            modalType == "EDIT" || modalType == "ADD" ?
              <Form
                name="basic"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
                onFinish={(values) => onEditItem(values)}
                autoComplete="off"
                id="notes-form"
                className="notes-form"
                form={editForm}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                  }
                }}
              >
               
                <Row gutter={[24,24]}>
                  <Col span={12}>
                  <label className="mb-5 mt-15 d-block">Business Need: </label>
                  <Form.Item
                    label=""
                    name="Task Description"
                    class="mb-5 mt-5"
                  >
                    <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={5} />
                  </Form.Item>
                  </Col>
                  <Col span={12}>
                  <label className="mb-5 mt-15 d-block">Business Problem/Pain Point: </label>
                    <Form.Item
                      label=""
                      name="Pain Point"
                      class="mb-5 mt-5"
                    >
                    <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={5} />
                      
                    </Form.Item>
                  </Col>
                  
                </Row>
                 <Row gutter={[24,24]}>
                    <Col span={12}>
                    <label className="mb-5 mt-5 d-block">Deliverable: </label>
                    <Form.Item
                      label=""
                      name="Deliverable"
                      class="mb-5 mt-5"
                    >
                      <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={5} />
                    </Form.Item>
                    </Col>
                    <Col span={12}>

                    <label className="mb-5 mt-5 d-block">ROI: </label>
                    <Form.Item
                      label=""
                      name="ROI"
                      class="mb-5 mt-5"
                    >
                      <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={5} />
                    </Form.Item>
                    </Col>
                  </Row> 
              
                  
               

               


                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <label className="mb-5 mt-15 d-block"> Priority: </label>

                    <Form.Item
                      label=""
                      name="Priority"
                      class="mb-5 mt-5"
                    >
                      <Select>
                        <Option value="Highest">Highest</Option>
                        <Option value="High">High</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="Low">Low</Option>
                        <Option value=""></Option>

                      </Select>

                    </Form.Item>

                    <label className="mb-5 mt-15 d-block">Wish-by Date: </label>

                    <Form.Item
                      label=""
                      name="Wish By Date"
                      class="mb-5 mt-5"
                    >
                      {
                        WBD ?
                          <DatePicker style={{ width: "100%" }} defaultValue={moment(WBD, dateFormat)} onChange={(d, date) => onDateChanges('WBD', date)} />
                          :
                          <DatePicker style={{ width: "100%" }} onChange={(d, date) => onDateChanges('WBD', date)} />

                      }

                      <span className="ant-form-item-explain">{errors.WBD}</span>

                    </Form.Item>

                    <label className="mb-5 mt-15 d-block">Due Date: </label>

                  <Form.Item
                    label=""
                    name="Due Date"
                    class="mb-5 mt-5"
                  >
                    {
                      ETA ?
                        <DatePicker style={{ width: "100%" }} defaultValue={moment(ETA, dateFormat)} onChange={(d, date) => onDateChanges('ETA', date)} />
                        :
                        <DatePicker style={{ width: "100%" }} onChange={(d, date) => onDateChanges('ETA', date)} />

                    }

                    <span className="ant-form-item-explain">{errors.ETA}</span>

                  </Form.Item>

                  </Col>
                  <Col span={12}>
                  <label className="mb-5 mt-15 d-block">Due Reason: </label>

                  <Form.Item
                    label=""
                    name="Due Reason"
                    class="mb-5 mt-5"
                  >
                      <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={8} />
                    
                  </Form.Item>
                  </Col>
                </Row>

                <label className="mb-5 mt-5 d-block">Completed: </label>

                      <Form.Item
                        label=""
                        name="Completed"
                        class="mb-5 mt-5"

                      >
                        <Select >
                          <Option value="Yes">Yes</Option>
                          <Option value="No">No</Option>
                          <Option value=""></Option>

                        </Select>
                      </Form.Item>

              
                {
                  page == 'Governance' ?
                    <div>

                      <label className="mb-5 mt-15 d-block">Assignee: </label>

                      <Form.Item
                        label=""
                        name="Assignee"
                        class="mb-5 mt-5"
                      >
                        <Select mode="multiple">
                          {
                            filters['Assignee'] && filters['Assignee'].map(d => {
                              return <Option value={d.value}>{d.text}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div>
                    :
                    <div>


                      <Form.Item
                        label=""
                        name="Assignee"
                        style={{ height: "0px" }}
                      >

                      </Form.Item>
                    </div>

                }

                {
                  page == 'Governance' ?
                    <div>

                      <label className="mb-5 mt-5 d-block">Status: </label>

                      <Form.Item
                        label=""
                        name="Status"
                        class="mb-5 mt-5"

                      >
                        <Select >
                          <Option value="Approved">Approved</Option>
                          <Option value="Declined">Declined</Option>
                          <Option value="On Hold">On Hold</Option>
                          <Option value="TBD">TBD</Option>
                          <Option value=""></Option>

                        </Select>
                      </Form.Item>
                    </div>
                    :

                    null
                }



                <Form.Item wrapperCol={{ offset: 18 }} className="notes-form" style={{ marginTop: "5px", marginBottom: "0px", textAlign: "end" }}>
                  <Button type="primary" htmlType="submit" className="mr-3" >
                    {modalType == 'EDIT' ? 'Update' : 'Add'}
                  </Button>
                </Form.Item>
              </Form>
              : null
          }

          {
            modalType == "DELETE" ?
              deleteModal : null
          }

        </Modals>
      </div>
    )
  }
}
