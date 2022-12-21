
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
import socket, { HBAuditData } from "@/socket";

const { Option } = Select;

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HBWQAudit() {
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
  const [loaded, setLoaded] = useState(false)
  const [filters, setFilters] = useState({});
  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  const childRef = useRef();
  const [process, setProcess] = useState('')
  const [subProcess, setSubProcess] = useState('null')
  const [subProcess2, setSubProcess2] = useState('null')
  const [KPIs, setKPIs] = useState([])

  const [load, setLoad] = useState(false)

  const currentDate = getDate()

  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const { current } = useSelector(selectAuth);
  const [currentUser, setCurrentUser] = useState();
  const [reset, setReset] = useState(false)
  const [filteredValue, setFilteredValue] = useState({
  })

  const dispatch = useDispatch()

  HBAuditData.subscribe(
    value => {
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

  const entity = "hbwqaudit";

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

    socket.emit('HB-Audit-data')

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
    obj = { Correct: (value) , 'Pending': null}
    await dispatch(crud.update(entity, row.ID, obj))
    socket.emit('HB-Audit-data')

    setReload(true)
  }


  const openEditModal = (id) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setModalType("EDIT"); let value = row['Notes'] ? row['Notes'] : `IRB: ${row['IRB Reviewed']} \nHAR # ${row['HAR'] ? row['HAR'] : ''} \nPT MRN: ${row['MRN'] ? row['MRN'] : ''} \nPT NAME: ${row['PAT_NAME'] ? row['PAT_NAME'] : ''} \nFIRST DOS: ${row['FirstServiceDate'] ? formatDate(row['FirstServiceDate']) : ''} \nINITIAL USER: ${row['User Reviewed'] ? row['User Reviewed'] : ''} \n _________________________________________________________ \n

    
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
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setModalType("DELETE");
    setModalTitle("Delete Notes");
    setOpenModal(true);
  }

  const onhandleSave = (data) => {

    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))

    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }

  const onEditItem = (value) => {
    onhandleSave({ ID: selectedId, Notes: value.Notes? value.Notes.trim() : null })
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
        <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={10}
          id="text-area"

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

  const onChangeCheckbox = async(row, dataIndex,value ) => {

    let obj = {}
    obj[dataIndex] = value ? 'Yes': ''

    let response = await (request.update(entity, row.ID, obj))
    if (response.success) {
      notification.success({message: "Item Updated Successfully!"})
    }

    setReload(false)
    setTimeout(() => {setReload(true)},500)

    
}

  const onProcessChanged = (e) => {

    if (childRef.current) {
      childRef.current.onProcessChanged(e.target.value, process)
    }
  }

  const onSubProcessChanged = (e) => {
    if (childRef.current) {
      childRef.current.onSubProcessChanged(e, subProcess)
    }
  }


   const onSubProcess2Changed = (e) => {
    if (childRef.current) {
      
      childRef.current.onSubProcess2Changed(e.target.value, subProcess2)
    }
  }


  const footer = () => {
    return (
      <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>

        <Col style={{ width: "100%", height: '30px' }}>

          <Radio.Group className="mr-3" value={subProcess} >

            <Radio.Button value="null" className="box-shadow" onClick={ () => onSubProcessChanged('null')} >Need Review</Radio.Button>
            <Radio.Button value="Yes" className="mr-3 box-shadow" onClick={ () => onSubProcessChanged('Yes')}>Completed </Radio.Button>
          </Radio.Group>

|

        <Radio.Group className="ml-10" value={subProcess2} onChange={onSubProcess2Changed}>

            <Radio.Button value="Yes" className="box-shadow" >Pending</Radio.Button>
          </Radio.Group>
        </Col>



      </Row>
    )
  }


  const panelTitle = "HB WQ Audit";
  const dataTableTitle = "HB WQ Audit";
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  const dataTableColumns = [



    {
      title: "HAR",
      dataIndex: "HAR",
      width: "120px",
      type: "filter",
      order: 2,
      feature: "copy",
      filters: filters['HAR'],

      filterSearch: true,
      filteredValue: filteredValue['HAR'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR")[0].order : null
    },


    {
      title: "Correct (Y/N)?", width: "100px", dataIndex: "Correct",
      filters:
        subProcess == 'null' ?
          [

            { text: <img src={WhiteDot} height="9px" />, value: 'null' }
          ] :
          [
            { text: <img src={RedDot} height="9px" />, value: 'No' },
            { text: <img src={GreenDot} height="9px" />, value: 'Yes' },
          ],
      type: 'filter',
      align: "center",
      filteredValue: filteredValue['Correct'] || null,
      order: 4,

    },
    {
      title: "Pending", width: "100px", dataIndex: "Pending", filters: [
        { text: 'Yes', value: 'Yes' },
        { text: "", value:  ''},

      ],
      type: "filter",
      feature: 'checkbox',
      order: 5,

      filteredValue: filteredValue['Pending'] || null
    },
    {
      title: "Notes", width: "120px", dataIndex: "Notes",
      ...getColumnSearchProps("Notes"),
      type: "search",
      feature: 'text',
      order: 6,

      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "Rev User",
      dataIndex: "User Reviewed",
      width: "140px",
      STATUS: "filter",
      order: 7,

      filters:
        filters['User Reviewed'],
      filterSearch: true,

      filteredValue: filteredValue['User Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "User Reviewed")[0].order : null
    },

  
    {
      title: "Rev IRB",
      dataIndex: "IRB Reviewed",
      width: "100px",
      STATUS: "filter",
      filters: filters['IRB Reviewed'],

      filterSearch: true,
      order: 9,
      feature: "copy",

      filteredValue: filteredValue['IRB Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "IRB Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "IRB Reviewed")[0].order : null
    },
    {
      title: "First DOS", dataIndex: "FirstServiceDate", width: "100px",
      type: "date",
      sorter: { multiple: 12 },
      order: 10,

      ...getColumnSearchProps("FirstServiceDate"),
      filteredValue: filteredValue['FirstServiceDate'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FirstServiceDate").length > 0) ? filteredValue.sort.filter((value) => value.field == "FirstServiceDate")[0].order : null,
    },
    {
      title: "Disch Date", dataIndex: "Discharge Date", width: "120px",
      type: "date",
      sorter: { multiple: 12 },
      order: 11,

      ...getColumnSearchProps("Discharge Date"),
      filteredValue: filteredValue['Discharge Date'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Discharge Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Discharge Date")[0].order : null,
    },
    {
      title: "Rev Date", dataIndex: "Review Date", width: "120px",
      type: "date",
      sorter: { multiple: 12 },
      order: 12,

      ...getColumnSearchProps("Review Date"),
      filteredValue: filteredValue['Review Date'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Review Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Review Date")[0].order : null,
    },
    {
      title: "MRN",
      dataIndex: "MRN",
      width: "100px",
      type: "filter",
      order: 13,
      feature: "copy",

      filters: filters['MRN'],
      filterSearch: true,
      filteredValue: filteredValue['MRN'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null
    },

    {
      title: "Transaction Count",
      dataIndex: "Transaction Count",
      width: "120px",
      STATUS: "search",

      filterSearch: true,
      order: 14,
      ...getColumnSearchProps("Transaction Count"),

      filteredValue: filteredValue['Transaction Count'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Transaction Count").length > 0) ? filteredValue.sort.filter((value) => value.field == "Transaction Count")[0].order : null
    },

    {
      title: "Amount", dataIndex: "Amount", width: "100px",
      type: "search",
      feature: "dollor",
      order: 15,

      sorter: { multiple: 12 },
      ...getColumnSearchProps("Amount"),
      filteredValue: filteredValue['Amount'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Amount")[0].order : null,
    },
    {
      title: "Uploaded", dataIndex: "UPLOADDATETIME", width: "120px",
      type: "date",
      feature: "datetime",
      order: 16,

      sorter: { multiple: 12 },
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
      setSubProcess: (process) => setSubProcess(process),
      setSubProcess2: (process) => setSubProcess2(process),

      subProcessKey: 'Correct',
      subProcessKey2: 'Pending',

      subProcess: subProcess,
      subProcess2: subProcess2,

      openSortModal: openSortModal,
      onChangeCheckbox,
      KPIs,
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
