
import React, { useState, useRef } from "react";

import { Table, Input, Button, Space, Form, Radio,Row, Col, Select, DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

import { getDate, GetSortOrder } from "@/utils/helpers";
import { useEffect } from "react";
import DataTableModule from "@/modules/AuditErrorDataTableModule";
import SortModal from '@/components/Sorter'


export default function AuditError() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [openExport1Modal, setOpenExport1Modal] = useState(false)
  const [patient, setPatient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const [process, setProcess] = useState('PB')
  const [subProcess, setSubProcess] = useState('')

  const [dataIndex,setDataIndex] = useState('')
  
  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  var usDate = getDate()

  const defaultProcess = useRef();
  const defaultSubProcess = useRef();




  const currentDate = usDate

  const { current } = useSelector(selectAuth);

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

  const entity = "audit-error";

  const getSort = async() => {
    const [{result: result1}] = await Promise.all([await request.list(entity+"-columns", {id: current.EMPID, process: defaultProcess.current})]);
    if(result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns)
    } 
  
    setColumns(true)
  }

  useEffect(() => {
    getFilters(process)
    defaultProcess.current = process
    defaultSubProcess.current = null
    setColumns(false)
    getSort()
  }, [process])

  useEffect(() => {
    defaultSubProcess.current = subProcess
  }, [subProcess])

  

  useEffect(async() => {
    getSort()
  }, [])

  


  const onhandleSave = (data) => {

    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }

 
  

  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }

  const onRowMarked = async (row, value) => {
    setReload(false)
    await dispatch(crud.update(entity, row.ID, { Error: value ? '0' : '1' }))
    setReload(true)
  }



  const getFilters = async(process) => {

    let {result: data} = await request.list(entity + "-filters", {process})
 
      let filterObject = {}
      data.filters.map((d) => {
        let item3 = d.column 
        filterObject[item3] = ([...new Set(d.recordset.sort((a, b) => b[d.column] - a[d.column]))].map(item => ({ text: item[d.column], value: item[d.column] })))
      })

      setFilters(filterObject)

   

}


  const getFilterValue = (values) => {
    setFilteredValue(values)
  }


  const openAddModal = (id, dataIndex) => {
    let row = items.filter(item => item.ID == id)[0];
    row['view'] = row[dataIndex]
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View " + dataIndex);
    setOpenModal(true);
  }

  const panelTitle = "Audit Errors";
  const dataTableTitle = "Audit Errors";



  const dataTableColumns =  
  process == 'PB' ? [
   
    
    {
      title: "Charge Corrected", width: "110px", dataIndex: "Charge Corrected", filters: [
        { text: 'Yes', value: 'Yes' },
        { text: "", value:  ''},

      ],
      type: "filter",
      feature: 'checkbox',
      order: 1,

      filteredValue: filteredValue['Charge Corrected'] || null
    },
    {
      title: "Inquiry Sent", width: "100px", dataIndex: "Inquiry Sent", filters: [
        { text: 'Yes', value: 'Yes' },
        { text: "", value:  ''},

      ],
      type: "filter",
      feature: 'checkbox',
      order: 2,

      filteredValue: filteredValue['Inquiry Sent'] || null
    },
    {
      title: "Manager's Comment", width: "120px", dataIndex: "Manager Comment", ...getColumnSearchProps("Manager Comment"),
      type: "search",
      feature: 'Notes',
      order: 3,

      filteredValue: filteredValue['Manager Comment'] || null
    },
    {
      title: "Auditor's Notes", width: "100px", dataIndex: "Notes",  ...getColumnSearchProps("Notes"),
      type: "search",
      feature: 'Notes',
      order: 4,

      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "WQ",
      dataIndex: "WQ_NUM",
      width: "80px",
      type: "filter",
      order: 5,
      filters:
        filters['WQ_NUM'],
      filterSearch: true,
      filteredValue: filteredValue['WQ_NUM'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "WQ_NUM").length > 0) ? filteredValue.sort.filter((value) => value.field == "WQ_NUM")[0].order : null
    },
    {
      title: "Initial User",
      dataIndex: "REVIEWED_USER",
      width: "110px",
      STATUS: "filter",
      filters:
        filters['REVIEWED_USER'],
      filterSearch: true,
      order: 6,
      
      filteredValue: filteredValue['REVIEWED_USER'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "REVIEWED_USER").length > 0) ? filteredValue.sort.filter((value) => value.field == "REVIEWED_USER")[0].order : null
    },
    
    {
      title: "MRN",
      dataIndex: "PAT_MRN_ID",
      width: "110px",
      sorter: { multiple: 6 },
      feature: "copy",
      order: 7,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID")[0].order : null,
      ...getColumnSearchProps("PAT_MRN_ID"),
      filteredValue: filteredValue['PAT_MRN_ID'] || null,
      type: "search"
    },
    
    {
      title: "Rev IRB",
      dataIndex: "IRB Reviewed",
      width: "110px",
      STATUS: "filter",
      type: "filter",

      filters: filters["IRB Reviewed"],
    
      filterSearch: true,
      order: 8,
      feature: "copy",
      
      filteredValue: filteredValue['IRB Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "IRB Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "IRB Reviewed")[0].order : null
    },
    {
      title: "CPT",
      dataIndex: "CPT_CODE",
      width: "100px",
      sorter: { multiple: 13 },
      order: 9,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT_CODE").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT_CODE")[0].order : null,
      ...getColumnSearchProps("CPT_CODE"),
      filteredValue: filteredValue['CPT_CODE'] || null,
      type: "search"
    },
    {
      title: "DOS", dataIndex: "SERVICE_DATE", width: "120px",
      type: "date",
      sorter: { multiple: 11 },
      order: 10,

      ...getColumnSearchProps("SERVICE_DATE"),  
      filteredValue: filteredValue['SERVICE_DATE'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SERVICE_DATE").length > 0) ? filteredValue.sort.filter((value) => value.field == "SERVICE_DATE")[0].order : null,
    },
    { title: '', dataIndex: null, key: '', width: 0 , order : 11 }
    
    
    
  ] :
  [
   
    {
      title: "Account Corrected", width: "80px", dataIndex: "Account Corrected", filters: [
        { text: 'Yes', value: 'Yes' },
        { text: "", value:  ''},

      ],
      type: "filter",
      feature: 'checkbox',
      order: 1,

      filteredValue: filteredValue['Account Corrected'] || null
    },
    {
      title: "Inquiry Sent", width: "80px", dataIndex: "Inquiry Sent", filters: [
        { text: 'Yes', value: 'Yes' },
        { text: "", value:  ''},

      ],
      type: "filter",
      feature: 'checkbox',
      order: 2,

      filteredValue: filteredValue['Inquiry Sent'] || null
    },
    {
      title: "Manager's Comment", width: "100px", dataIndex: "Manager Comment", 
      ...getColumnSearchProps("Manager Comment"),
      type: "search",
      feature: 'Notes',
      order: 3,

      filteredValue: filteredValue['Manager Comment'] || null
    },
    {
      title: "Auditor's Notes", width: "80px", dataIndex: "Notes", 
      ...getColumnSearchProps("Notes"),
      type: "search",
      feature: 'Notes',
      order: 4,

      filteredValue: filteredValue['Notes'] || null
    },
   
   
    
    
    
    {
      title: "Initial User",
      dataIndex: "User Reviewed",
      width: "140px",
      STATUS: "filter",
      order: 5,

      filters:
        filters['User Reviewed'],
      filterSearch: true,
      
      filteredValue: filteredValue['User Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "User Reviewed")[0].order : null
    },
    
    {
      title: "HAR",
      dataIndex: "HAR",
      width: "120px",
      type: "filter",
      order: 6,
      feature: "copy",
      filters: filters['HAR'],  
        
      filterSearch: true,
      filteredValue: filteredValue['HAR'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR")[0].order : null
    },
    {
      title: "MRN",
      dataIndex: "MRN",
      width: "100px",
      type: "filter",
      order: 7,
      feature: "copy",

      filters: filters['MRN'],  
      filterSearch: true,
      filteredValue: filteredValue['MRN'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null
    },
    
   
    {
      title: "IRB",
      dataIndex: "IRB Reviewed",
      width: "100px",
      STATUS: "filter",
      filters: filters['IRB Reviewed'],
     
      filterSearch: true,
      order: 8,
      feature: "copy",
      
      filteredValue: filteredValue['IRB Reviewed'] || null,
      sorter: { multiple: 20 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "IRB Reviewed").length > 0) ? filteredValue.sort.filter((value) => value.field == "IRB Reviewed")[0].order : null
    },
    {
      title: "First DOS", dataIndex: "FirstServiceDate", width: "100px",
      type: "date",
      sorter: { multiple: 12},
      order: 9,

      ...getColumnSearchProps("FirstServiceDate"),  
      filteredValue: filteredValue['FirstServiceDate'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FirstServiceDate").length > 0) ? filteredValue.sort.filter((value) => value.field == "FirstServiceDate")[0].order : null,
    },
    {
      title: "Disch Date", dataIndex: "Discharge Date", width: "120px",
      type: "date",
      sorter: { multiple: 12},
      order: 10,

      ...getColumnSearchProps("Discharge Date"),  
      filteredValue: filteredValue['Discharge Date'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Discharge Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Discharge Date")[0].order : null,
    },
    
   
  
  ];





  const handleCancel = (e) => {
    setOpenModal(false)
    setSortModal(false)
    openEditModal(false)
    
  }

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };
  
  const onSort = async (data) => {

    setReload(false)
    var x = {}

    data.map((d, i ) =>  {
      if(d.dataIndex != null){
        x[d.dataIndex] =  i + 1

      }
    })
    x.EMPID = current.EMPID
    x.process = defaultProcess.current 
    await request.create(entity+ "-columns" , x)
    handleCancel()
    setTimeout(() => setReload(true), 1000)
    
    notification.success({message: "Please Refesh page!"})
    setColumns(false)
    getSort()

  }

  const openSortModal = () => {
    setSortModal(true)
  }
 
  const getItems = (data) => {
    setItems(data)
  }

  const onEditItem = (data) => {
    
    let obj ={}
    obj[dataIndex] = data.Notes
    obj['process'] = defaultProcess.current || 'PB'
    dispatch(crud.update(entity, selectedId, obj))
    notification.success({message: dataIndex + " updated successfully!"})
    handleCancel()
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }

  const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    id="notes-form"
    className="notes-form"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >      
      <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
    </Form.Item>
    
    <Form.Item  className="notes-form text-end" style={{marginBottom: "0px", marginTop: "10px"}}>
      <Button type="primary" htmlType="submit"  >
        Update
      </Button>
    </Form.Item>
  </Form>
  )

  const openEditModal = (id, dataIndex, title) => {
    
    if(!dataIndex) return 
    let row =  items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setDataIndex(dataIndex)
    setModalType("EDIT");
    let obj = {}
    obj['Notes'] = row[dataIndex]
    editForm.setFieldsValue(obj)

    setModalTitle("Edit " + title);
    setOpenModal(true)

  }

  const onChangeCheckbox = async(row, dataIndex,value , process) => {

    let obj = {}
    obj[dataIndex] = value ? 'Yes': ''
    obj['process'] = process
    let response = await (request.update(entity, row.ID, obj))
    if (response.success) {
      notification.success({message: "Item Updated Successfully!"})
    }
    setReload(false)
    setTimeout(() => {setReload(true)},500)
    
}


const viewModal = (
  <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

    <Col className="gutter-row" span={24} style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: selectedRow['view'] ? selectedRow['view'].replace('_', '') : '' }}>

    </Col>
  </Row>
)

  
  if(columns) {

    
    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i]? dataColumns[i].order : d.order
      return d
    })

    cols = cols.sort(GetSortOrder('order'))

    const sortModalConfig = {
      title: "Column Sort",
      openModal: sortModal,
      handleCancel,
      columns: cols,
      onSort:onSort
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
      showFooter: false,
      onhandleSave,
      openEditModal,
      openAddModal,
      getItems,
      reload,
      getFilterValue,
      userList: users,
      onWorkSaved: () => { },
      onRowMarked,
      confirmModal: () => { },
      AddIcon: true,
      deleteIcon: true,
      refresh: true,
      isLoading: isLoading,
      onChangeCheckbox,
      onChangeTab: (e) => {
        defaultProcess.current = e
        defaultSubProcess.current = null
        setSubProcess('')
        setProcess(e)
        getFilters(e)
      },
      onChangeSubTab: (e) => {
        defaultSubProcess.current = e
        setSubProcess(e)

      },
      openSortModal,
      defaultProcess: process,
      defaultSubProcess :  subProcess
    };
  
  
    const config2 = {
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
      showFooter: false,
      onhandleSave,
      openEditModal,
      openAddModal,
      getItems,
      reload,
      getFilterValue,
      userList: users,
      onWorkSaved: () => { },
      onRowMarked,
      confirmModal: () => { },
      AddIcon: true,
      deleteIcon: true,
      refresh: true,
      isLoading: isLoading,
      onChangeCheckbox,
      onChangeTab: (e) => {
        defaultProcess.current = e
        defaultSubProcess.current = null
        setSubProcess('')

        setProcess(e)
        setSubProcess('')
        getFilters(e)

      },
      onChangeSubTab: (e) => {
        defaultSubProcess.current = e
        setSubProcess(e)
      },
      openSortModal,
      defaultProcess: process,
      defaultSubProcess :  subProcess
    };
   

  
  return  columns  ? 
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
            modalType == "Find" ?
            userModal : null
          }
      </Modals>
      
      <SortModal config={sortModalConfig} ></SortModal>
          <DataTableModule config={ process == 'PB' ? config : config2} />

        
    </div>
     : null 
    } else {
    return ""
  }
}
