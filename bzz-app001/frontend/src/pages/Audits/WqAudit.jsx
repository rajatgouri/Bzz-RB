
import React, { useState, useEffect, useRef } from "react";

import { Table, Input, Button, Space, Form, Row, Col, Select, notification, Radio } from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import GreenDot from "assets/images/green-dot.png"
import { formatDate, getDate, GetSortOrder } from '@/utils/helpers'
import AuditTableModule from "@/modules/AuditDataTableModule";
import SortModal from '@/components/Sorter'
import socket, { PBAuditData } from "@/socket";

const { Option } = Select;

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WQAudit() {
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
  const [selectedRow, setSelectedRow] = useState("");
  const [filters, setFilters] = useState({});
 
  const childRef = useRef();
  const [process, setProcess] = useState('5508')
  const [subProcess, setSubProcess] = useState('null')
  const [KPIs, setKPIs] = useState([])



  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  const currentDate = getDate()

  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const { current } = useSelector(selectAuth);
  const [currentUser, setCurrentUser] = useState();
  const [reset, setReset] = useState(false)
  const [filteredValue, setFilteredValue] = useState({
  })

  const dispatch = useDispatch()



  PBAuditData.subscribe(
    value => {
      console.log(value)
      setKPIs(value)
    },
    err => console.log(err)
  )


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

    if (dataIndex == 'Patient MRN') {
      setReset(true)
      setTimeout(() => setReset(false), 1000)
    }

  };

  const entity = "wqaudit";

  useEffect(async () => {
    getFilters()

    const [{ result: result1 }] = await Promise.all([await request.list(entity + "-columns", { id: current.EMPID })]);
    if (result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c, i) => {
        c['order'] = result1[0][c.dataIndex]
        return c
      })])

    } else {
      setDataColumns(dataTableColumns)
    }

    setColumns(true)

    socket.emit('PB-Audit-data', {process: '5508'})
  }, [])

  const getFilterValue = (values) => {


    setFilteredValue(values)
  }


  

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setSortModal(false)
  }

  const getFilters = async () => {

    let { result: data } = await request.list(entity + "-filters")

    let filterObject = {}
    data.filters.map((d) => {
      let item3 = d.column
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






  const onRowMarked = async (type, row, value, process) => {
    setReload(false)
    let obj = {}
    obj = { Correct: (value) }
    await dispatch(crud.update(entity, row.ID, obj))
    socket.emit('PB-Audit-data', {process: process})

    setReload(true)
  }


  const openEditModal = (id) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row)
    setSelectedId(id);
    setModalType("EDIT");


    let value = row['Notes'] ? row['Notes'] : `IRB: ${row['IRB Reviewed']} \nPT MRN: ${row['PAT_MRN_ID']} \nPt NAME: ${row['PAT_NAME']} \nDOS: ${row['SERVICE_DATE'] ? formatDate(row['SERVICE_DATE']) : null} \nINITIAL USER: ${row['REVIEWED_USER']} \n_________________________________________________________ \n
`
    editForm.setFieldsValue({

      'Notes': value
    })

    setModalTitle("Auditor's Notes");
    setOpenModal(true)

    setTimeout(() => {
      document.getElementById('text-area').focus()
    }, 1500)

  }


  const openAddModal = (id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Auditor's Notes");
    setOpenModal(true);
  }

  const onhandleSave = (data) => {

    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))

    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }

  const onEditItem = (value) => {
    onhandleSave({ ID: selectedId, Notes: value.Notes? value.Notes.trim() : null  })
    setOpenModal(false)
  }


  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

      <Col className="gutter-row" span={24} style={{ whiteSpace: 'pre-line' , padding: "5px 35px"}} dangerouslySetInnerHTML={{ __html: selectedRow.Notes ? selectedRow.Notes.replace('_', '') : '' }}>


      </Col>
    </Row>
  )

  const onDeletNotes = (value) => {
    onhandleSave({ ID: selectedId, Notes: null })
    setOpenModal(false)
  }
  
  const deleteModal = (
    <Row gutter={[24, 24]} >

      <Col className="gutter-row" span={24} style={{ whiteSpace: 'pre-line' }} >
        <p>You are about to delete this note. Would you like to proceed</p>
        <div className="text-right">
          <Button type="primary" onClick={onDeletNotes}>Delete</Button>
        </div>
      </Col>
    </Row>
  )

  const editModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditItem}
      autoComplete="off"
      id="notes-form"
      className="notes-form"
      form={editForm}
    >



      <Form.Item
        label=""
        name="Notes"
      >
        <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={12} 
        id= "text-area"
          onFocus={function (e) {
            e.target.selectionStart = e.target.innerHTML.length
            e.target.scrollTop = e.target.innerHTML.length
          }}
        />
      </Form.Item>

      <Form.Item className="notes-form text-end" style={{ marginBottom: "0px", marginTop: "10px" }}>
        <Button type="primary" htmlType="submit"  >
          Update
        </Button>
      </Form.Item>
    </Form>
  )

  const onProcessChanged = (e) => {

    if (childRef.current) {
      childRef.current.onProcessChanged(e, process)
     

    }
  }

  const onSubProcessChanged = (e) => {
    if (childRef.current) {
      childRef.current.onSubProcessChanged(e.target.value, subProcess)
    }
  }

  const footer = () => {
    return (
      <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>

        <Col style={{ width: "100%" }}>

          <Radio.Group value={process} >
            <Radio.Button value="5508" className="box-shadow" onClick={() => onProcessChanged('5508')} >5508</Radio.Button>
            <Radio.Button value="1075" className=" ml-10 mr-4 box-shadow" onClick={() => onProcessChanged('1075')}>1075 </Radio.Button>
          </Radio.Group>
          {"  "} <span className="ml-2">|</span> {"  "}
          <Radio.Group className="ml-1" value={subProcess} onChange={onSubProcessChanged}>

            {/* <Radio.Button value="null" className="box-shadow" >Need Review</Radio.Button> */}
            <Radio.Button value="Yes" className="mr-3 box-shadow" >Completed </Radio.Button>
          </Radio.Group>

        </Col>



      </Row>
    )
  }

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setModalType("DELETE");
    setModalTitle("Delete Notes");
    setOpenModal(true);
  }

  const panelTitle = "WQ Audit";
  const dataTableTitle = "PB WQ Audit";
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  const dataTableColumns = [


    {
      title: "WQ",
      dataIndex: "WQ_NUM",
      width: "80px",
      type: "filter",
      order: 1,
      filters:
        filters['WQ_NUM'],
      filterSearch: true,
      filteredValue: filteredValue['WQ_NUM'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "WQ_NUM").length > 0) ? filteredValue.sort.filter((value) => value.field == "WQ_NUM")[0].order : null
    },
   
    {
      title: "Correct (Y/N)?", width: "100px", dataIndex: "Correct",
      filters: subProcess == 'null' ?
        [

          { text: <img src={WhiteDot} height="9px" />, value: 'null' }
        ] :
        [
          { text: <img src={RedDot} height="9px" />, value: 'No' },
          { text: <img src={GreenDot} height="9px" />, value: 'Yes' },
        ],
      order: 3,

      type: 'filter',
      align: "center",
      filteredValue: filteredValue['Correct'] || null
    },
    {
      title: "Notes", width: "120px", dataIndex: "Notes", ...getColumnSearchProps("Notes"),
      type: "search",
      feature: 'text',
      order: 4,

      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "Rev User",
      dataIndex: "REVIEWED_USER",
      width: "140px",
      STATUS: "filter",
      filters:
        filters['REVIEWED_USER'],
      filterSearch: true,
      order: 5,

      filteredValue: filteredValue['REVIEWED_USER'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "REVIEWED_USER").length > 0) ? filteredValue.sort.filter((value) => value.field == "REVIEWED_USER")[0].order : null
    },
    {
      title: "Rev Date", dataIndex: "REVIEW_DATE", width: "120px",
      type: "date",
      sorter: { multiple: 12 },
      order: 6,

      ...getColumnSearchProps("REVIEW_DATE"),
      filteredValue: filteredValue['REVIEW_DATE'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "REVIEW_DATE").length > 0) ? filteredValue.sort.filter((value) => value.field == "REVIEW_DATE")[0].order : null,
    },
    {
      title: "Patient MRN",
      dataIndex: "PAT_MRN_ID",
      width: "120px",
      sorter: { multiple: 6 },
      feature: "copy",
      order: 7,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID")[0].order : null,
      ...getColumnSearchProps("PAT_MRN_ID"),
      filteredValue: filteredValue['PAT_MRN_ID'] || null,
      type: "search"
    },
    {
      title: "Patient Name",
      dataIndex: "PAT_NAME",
      width: "150px",
      sorter: { multiple: 6 },
      order: 7,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_NAME").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_NAME")[0].order : null,
      ...getColumnSearchProps("PAT_NAME"),
      filteredValue: filteredValue['PAT_NAME'] || null,
      type: "search"
    },
    {
      title: "Rev IRB",
      dataIndex: "IRB Reviewed",
      width: "100px",
      STATUS: "filter",
      type: "filter",

      filters: filters["IRB Reviewed"],

      filterSearch: true,
      order: 9,
      feature: "copy",

      filteredValue: filteredValue['IRB Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "IRB Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "IRB Reviewed")[0].order : null
    },
    {
      title: "DOS", dataIndex: "SERVICE_DATE", width: "110px",
      type: "date",
      sorter: { multiple: 11 },
      order: 10,

      ...getColumnSearchProps("SERVICE_DATE"),
      filteredValue: filteredValue['SERVICE_DATE'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SERVICE_DATE").length > 0) ? filteredValue.sort.filter((value) => value.field == "SERVICE_DATE")[0].order : null,
    },
   
    {
      title: "QTY",
      dataIndex: "QTY",
      width: "80px",
      sorter: { multiple: 15 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "QTY").length > 0) ? filteredValue.sort.filter((value) => value.field == "QTY")[0].order : null,
      ...getColumnSearchProps("QTY"),
      filteredValue: filteredValue['QTY'] || null,
      type: "search",
      feature: "center",
      order: 13,

    },
    {
      title: "Amount",
      dataIndex: "AMOUNT",
      width: "80px",
      sorter: { multiple: 15 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "AMOUNT").length > 0) ? filteredValue.sort.filter((value) => value.field == "AMOUNT")[0].order : null,
      ...getColumnSearchProps("AMOUNT"),
      filteredValue: filteredValue['AMOUNT'] || null,
      type: "search",
      feature: "center",
      order: 13,

    },
    {
      title: "TX COUNT", dataIndex: "TX_COUNT", width: "110px",
      type: "search",
      feature: "text",
      sorter: { multiple: 12 },
      order: 19,

      ...getColumnSearchProps("TX_COUNT"),
      filteredValue: filteredValue['TX_COUNT'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "TX_COUNT").length > 0) ? filteredValue.sort.filter((value) => value.field == "TX_COUNT")[0].order : null,
    },
    {
      title: "Uploaded", dataIndex: "UPLOADDATETIME", width: "120px",
      type: "date",
      feature: "datetime",
      sorter: { multiple: 12 },
      order: 19,

      ...getColumnSearchProps("UPLOADDATETIME"),
      filteredValue: filteredValue['UPLOADDATETIME'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UPLOADDATETIME").length > 0) ? filteredValue.sort.filter((value) => value.field == "UPLOADDATETIME")[0].order : null,
    },

  ];

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";

  const updateTime = async(id, values, cb) => {
    setReload(false)
    await request.update(entity, id, values);
    setReload(true)
  }

  const openSortModal = () => {
    setSortModal(true)
  }

  const onSort = async (data) => {

    setReload(false)
    var x = {}

    data.map((d, i) => {
      x[d.dataIndex] = i + 1

    })
    x.EMPID = current.EMPID
    await request.create(entity + "-columns", x)
    handleCancel()
    setTimeout(() => setReload(true), 1000)

    notification.success({ message: "Please Refesh page!" })

  }

  if (columns) {


    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i].order ? dataColumns[i].order : d.order
      return d
    })




    cols = cols.sort(GetSortOrder('order'))

    const sortModalConfig = {
      title: "Column Sort",
      openModal: sortModal,
      handleCancel,
      columns: cols,
      onSort: onSort,
      type: 'Aud'
    };


    const config = {
      entity,
      panelTitle,
      dataTableTitle,
      ENTITY_NAME,
      CREATE_ENTITY,
      ADD_NEW_ENTITY,
      UPDATE_ENTITY,
      DATATABLE_TITLE,
      dataTableColumns: cols,
      dataTableColorList,
      getItems,
      reload,
      onCopied,
      getFilterValue,
      onRowMarked,
      reset,
      classname: 'wq-audit',
      scroll: { y: 'calc(100vh - 19.3em)' },
      openEditModal,
      openAddModal,
      footer: footer,
      ref: childRef,
      setProcess: (process) => {
        setProcess(process)
        socket.emit('PB-Audit-data', {process: process})
        
      },
      processKey: 'WQ_NUM',
      process: process,
      setSubProcess: (process) => setSubProcess(process),
      subProcessKey: 'Correct',
      subProcess: subProcess,
      openSortModal: openSortModal,
      KPIs: KPIs,
      openDeleteModal,
      updateTime
    };

    return columns ? (
      <div>

        <Modals config={modalConfig} >
          {
            modalType == "EDIT" ?
              editModal : null
          }
          {
            modalType == "VIEW" ?
              viewModal : null
          }
          {
            modalType == "DELETE" ?
              deleteModal : null
          }
          {
            modalType == "Find" ?
              userModal : null
          }

        </Modals>

        <SortModal config={sortModalConfig} ></SortModal>

        <AuditTableModule config={config} />

      </div>
    ) : null
  } else {
    return ""
  }
}
