import React, { useState } from "react";

import FullDataTableModule from "@/modules/FullDataTableModule";
import { Table, Input, Button, Space, Form, Row, Col } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import { getDate } from "@/utils/helpers";

export default function Wq5508() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const { current } = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
    'Process Type': ['Over']
  })

  const defaultColors = [
    { text: "Done", color: "#BEE6BE", selected: false },
    { text: "Pending", color: "#FAFA8C", selected: false },
    { text: "Misc", color: "#E1A0E1", selected: false },
    { text: "Deferred", color: "#AAAAB4", selected: false },
    { text: "Review", color: "#FFFFFF", selected: false },
  ]

  const dispatch = useDispatch()

  const billingColorData = {
    EMPID: 1,
    User: "Admin",
    Color1: "#BEE6BE",
    Color2: "#FAFA8C",
    Color3: "#F0C878",
    Color4: "#E1A0E1",
    Color5: "#AAAAB4",
    Color6: "#FFFFFF",
    Category1: "Done",
    Category2: "Pending",
    Category4: "Misc",
    Category5: "Deferred",
    Category6: "Review",
  }

  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = getDate() 
  
  const load = async () => {
    const { result = [] } = await request.read('billingcolorwq1518', 1);
    if (result.length === 0) {
      await request.create('billingcolorwq1518', billingColorData);
      return setDataTableColorList(defaultColors)
    }

    setDataTableColorList([
      { text: result[0].Category1, color: result[0].Color1, selected: false },
      { text: result[0].Category2, color: result[0].Color2, selected: false },
      { text: result[0].Category3, color: result[0].Color3, selected: false },
      { text: result[0].Category4, color: result[0].Color4, selected: false },
      { text: result[0].Category5, color: result[0].Color5, selected: false },
      { text: result[0].Category6, color: result[0].Color6, selected: false },
    ])
  }

  React.useEffect(() => {
    load();
  }, [])

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
            onClick={() => handleReset(clearFilters)}
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
    onFilter: (value, record) => {

      return record[dataIndex]
        ? record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
        : ""
    },
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

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");

  };

  const entity = "wq1518";
  // const loggerEntity = "wq5508Logger";
  const onhandleSave = (data) => {
    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))
    setReload(!reload)
    onNotesAction(data.ID, 'Update Note')

  }

  const onHandleColorChange = (selectedRows, data) => {
    selectedRows.map((id) => {
      dispatch(crud.update(entity, id, { Color: data.color, Status: data.text, ActionTimeStamp: currentDate, User: current.name }))
      // dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name, Color: data.color, Status: data.text, DateTime: currentDate }))
    })
    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }

  const onCopied = (id, mrn) => {
    // dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name,  Status: "Copy MRN", DateTime: currentDate, MRN: mrn }))
  }

  const onNotesAction = (id, status) => {
    // dispatch(crud.create(loggerEntity, { IDWQ5508: id, UserName: current.name,  Status: status, DateTime: currentDate }))
  }


  const getDefaultColors = (cb) => {
    cb(defaultColors)
  }

  const getPreviousColors = (cb) => {
    load()
  }

  const handleSaveColor = (EMPID, data) => {
    request.update("billingcolor", EMPID, data);
  }

  const getFilterValue = (values) => {
    setFilteredValue(values)
    
  }

  const openEditModal = (id) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setModalType("EDIT");
    editForm.setFieldsValue({
      Notes: row.Notes
    })

    setModalTitle("Edit Notes");
    setOpenModal(true)

    onNotesAction(id, 'Edit Note')
  }

  const openAddModal = (id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row)

    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true)
  }

  const handleCancel = () => {
    setModalTitle("")
    setOpenModal(false)
  }

  const getItems = (data) => {
    setItems(data)
  }

  const onEditItem = (value) => {
    onhandleSave({ ID: selectedId, Notes: value.Notes? value.Notes.trim() : null })
    setOpenModal(false)
  }

  // edit form
  const editModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditItem}
      // onFinishFailed={onEditFailed}
      autoComplete="off"
      form={editForm}
    >
      <Form.Item
        label="Notes"
        name="Notes"
      >
        <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={10} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }}>
        <Button type="primary" htmlType="submit" className="mr-3">
          Update
        </Button>
      </Form.Item>
    </Form>
  )

  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{ marginBottom: "10px", marginBottom: "50px" }}>

      <Col className="gutter-row" span={24}>
        {selectedRow.Notes}
      </Col>
    </Row>
  )

  const panelTitle = "WQ 1518";
  const dataTableTitle = "WQ 1518";
  const progressEntity = "wq1518progress";
  const workEntity = "wq1518Work";
  const showProcessFilters = true;


  const onWorkSaved = () => {

  
  }


    const userList = [
      { name: "Michelle", status: "success" },
      { name: "Gloria", status: "success" },
      { name: "Christina", status: "success" },
      { name: "Amanda", status: "success" },
      { name: "Lydia", status: "success" },
      // { name: "Terri", status: "success" },
      // { name: "Carol", status: "success" }
    ]

  const dataTableColumns = [
    {
      title: "Notes", width: 80, dataIndex: "Notes", filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value: 1 }
      ],
      filteredValue: filteredValue['Notes'] || null 
    },
    // { title: "Process",  width: 110, dataIndex: "Process Type", 
    //   filters: [
    //     { text: 'Expedite', value: 'Expedite' },
    //     { text: 'Standard', value: 'Standard' }
    //   ],
    //    filteredValue: filteredValue['Process Type'] || null ,
       
    // },
    
    {
      title: "Coder", width: 150, dataIndex: "Coder", filters: [
        { text: "Michelle", value: "Michelle" },
        { text: "Gloria", value: "Gloria" },
        { text: "Christina", value: "Christina" },
        { text: "Amanda", value: "Amanda" },
        { text: "Lydia", value: "Lydia" },
        { text: "Terri", value: "Terri" },
        { text: "Carol", value: "Carol" }
      ],
      filteredValue: filteredValue['Coder'] || null 
    },
    {
      title: "HAR",
      dataIndex: "HAR",
      width: 110,
      ...getColumnSearchProps("HAR"),
      filteredValue: filteredValue['HAR'] || null 

    },
    {
      title: "Name",
      dataIndex: "Name",
      width: 220,
      ...getColumnSearchProps("Name"),
      filteredValue: filteredValue['Name'] || null 
    },
    { title: "Disch Date", dataIndex: "Disch Date", width: 200, sorter: {multiple: 1},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Disch Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Disch Date")[0].order : null,

    // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Disch Date") ? filteredValue.sort.order : null,
  },

    // { title: "CPT", 
    //   dataIndex: "CPT Codes", 
    //   width: 110, 
    //   ...getColumnSearchProps("CPT Codes"),
    //   filteredValue: filteredValue['CPT Codes'] || null 
    // },
    { title: "Acct Bal", dataIndex: "Acct Bal", width: 100, sorter: {multiple: 2},
      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Acct Bal") ? filteredValue.sort.order : null,
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Bal").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Acct Bal")[0].order : null,

    },
    { title: "Min Days End Date", dataIndex: "Min Days End Date", width: 300, sorter: {multiple: 3},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Min Days End Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Min Days End Date")[0].order : null,

    // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Min Days End Date") ? filteredValue.sort.order : null,
  },
    {
      title: "Status", width: 80, dataIndex: "Status",
      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Misc", value: "Misc" },
        { text: "Deferred", value: "Deferred" },
        { text: "Review", value: "Review" }
      ],
      filteredValue: filteredValue['Status'] || null 

    },
    { title: "User Logged", width: 150, dataIndex: "User" },

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
    dataTableColorList,
    onhandleSave,
    onHandleColorChange,
    handleSaveColor,
    getDefaultColors,
    getPreviousColors,
    openEditModal,
    openAddModal,
    getItems,
    reload,
    progressEntity,
    onCopied,
    getFilterValue,
    workEntity,
    showProcessFilters,
    userList,
    onWorkSaved
  };
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };
  {
    return dataTableColorList.length > 0 ?
      <div>
        <FullDataTableModule config={config} />
        <Modals config={modalConfig} >
          {
            modalType == "EDIT" ?
              editModal : null
          }
          {
            modalType == "VIEW" ?
              viewModal : null
          }
        </Modals>
      </div>

      : null
  }
}
