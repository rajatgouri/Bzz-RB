
import React, { useState, useEffect , useRef} from "react";

import {  Input, Button, Space, Form, Row, Col, Select, notification, Radio } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
let { request } = require('../request/index');
import { selectAuth } from "@/redux/auth/selectors";

import { getDate } from '@/utils/helpers'
import DenialsTableModule from "@/modules/DenialsDataTableModule";



export default function DenialsTable() {
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
  const [hasFilters, setHasFilters] = useState(false);
  const [filtersBackup, setFiltersBackup] = useState({})
  const childRef = useRef();
  const [process, setProcess] = useState('5508')
  
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
            onClick={() => handleReset(clearFilters, dataIndex,  confirm)}
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

  const entity = "denials";
  
useEffect(() => {
  if(items.length > 0){
    getFilters()
  }
},[items])

  const getFilterValue = (values) => {
   

    setFilteredValue(values)
  }


 
  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
  }

  const getFilters = async() => {

      let {result: data} = await request.list(entity + "-filters")
    
        let filterObject = {}
        data.map((d) => {
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



  

  
  const onRowMarked = async (type, row, value) => {
    setReload(false)
    let obj = {}
    obj = {Correct: (value)}
    await dispatch(crud.update(entity, row.ID, obj))
    setReload(true)
  }

 
  const openEditModal = (id) => {
    
    let row =  items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setModalType("EDIT");
    editForm.setFieldsValue({
      Notes: row.Notes
    })

    setModalTitle("Edit Notes");
    setOpenModal(true)

  }

  const openAddModal = (id) => {
    let row =  items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }

  const onEditItem = (value) => {
    onhandleSave({ID: selectedId, Notes: value.Notes? value.Notes.trim() : null})
    setOpenModal(false)
  }


   // View Modal
   const viewModal = (
    <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
       
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


  const panelTitle = "IRB Report";
  const dataTableTitle = "Denials";
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  const dataTableColumns = [
   
    
    {
      title: "HAR",
      dataIndex: "HAR",
      width: "100px",
      type: "search",
      ...getColumnSearchProps("HAR"),  
      filterSearch: true,
      filteredValue: filteredValue['HAR'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR")[0].order : null
    },
    {
      title: "Claim ID",
      dataIndex: "Claim ID",
      width: "100px",
      type: "search",
      filterSearch: true,
      ...getColumnSearchProps("Claim ID"),  
      filteredValue: filteredValue['Claim ID'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim ID")[0].order : null
    },
    {
      title: "Denial Status",
      dataIndex: "Denial Status",
      width: "100px",
      type: "filter",
      
      filterSearch: true,
      filters: [
        {text: 'Denied', value: "Denied"},
        {text: 'Paid', value: "Paid"}
      ],
      filteredValue: filteredValue['Denial Status'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Denial Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Denial Status")[0].order : null
    },
    {
      title: "Denial Date",
      dataIndex: "Denial Date",
      width: "100px",
      type: "date",
      filterSearch: true,
      ...getColumnSearchProps("Denial Date"),  
      filteredValue: filteredValue['Denial Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Denial Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Denial Date")[0].order : null
    },
    {
      title: "From Service Date",
      dataIndex: "From Service Date",
      width: "130px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("From Service Date"),    
        
      filteredValue: filteredValue['From Service Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "From Service Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "From Service Date")[0].order : null
    },
    {
      title: "To Service Date",
      dataIndex: "To Service Date",
      width: "120px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("To Service Date"),    
        
      filteredValue: filteredValue['To Service Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "To Service Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "To Service Date")[0].order : null
    },
    {
      title: "Payor",
      dataIndex: "Payor",
      width: "100px",
      type: "filter",
      
      filterSearch: true,
      filters: filters['Payor'],
      filteredValue: filteredValue['Payor'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Payor").length > 0) ? filteredValue.sort.filter((value) => value.field == "Payor")[0].order : null
    },
    {
      title: "Plan",
      dataIndex: "Plan",
      width: "100px",
      type: "filter",
      
      filterSearch: true,
      filters: filters['Plan'],
      filteredValue: filteredValue['Plan'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Plan").length > 0) ? filteredValue.sort.filter((value) => value.field == "Plan")[0].order : null
    },
    {
      title: "NCT",
      dataIndex: "NCT",
      width: "100px",
      type: "search",
      filterSearch: true,
      ...getColumnSearchProps("NCT"),    
      filteredValue: filteredValue['NCT'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "NCT").length > 0) ? filteredValue.sort.filter((value) => value.field == "NCT")[0].order : null
    },
    {
      title: "Total Charge Amount",
      dataIndex: "Total Charge Amount",
      width: "150px",
      type: "search",
      feature: "amount",
      filterSearch: true,
      ...getColumnSearchProps("Total Charge Amount"),    
      filteredValue: filteredValue['Total Charge Amount'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Charge Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Charge Amount")[0].order : null
    },
    {
      title: "Total Amount Due",
      dataIndex: "Total Amount Due",
      width: "150px",
      type: "search",
      filterSearch: true,
      feature: "amount",

      ...getColumnSearchProps("Total Amount Due"),    
      filteredValue: filteredValue['Total Amount Due'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Amount Due").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Amount Due")[0].order : null
    },
    {
      title: "Total Amount Paid",
      dataIndex: "Total Amount Paid",
      width: "150px",
      type: "search",
      filterSearch: true,
      feature: "amount",

      ...getColumnSearchProps("Total Amount Paid"),    
      filteredValue: filteredValue['Total Amount Paid'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Amount Paid").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Amount Paid")[0].order : null
    },
    {
      title: "Total Non Covered Amount",
      dataIndex: "Total Non Covered Amount",
      width: "150px",
      type: "search",
      filterSearch: true,
      ...getColumnSearchProps("Total Non Covered Amount"),    
      filteredValue: filteredValue['Total Non Covered Amount'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Non Covered Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Non Covered Amount")[0].order : null
    },
    {
      title: "Total Adjusted Amount",
      dataIndex: "Total Adjusted Amount",
      width: "150px",
      type: "search",
      filterSearch: true,
      ...getColumnSearchProps("Total Adjusted Amount"),    
      filteredValue: filteredValue['Total Adjusted Amount'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Adjusted Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Adjusted Amount")[0].order : null
    },
   

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
    scroll:{y: 'calc(100vh - 19.3em)'},
    openEditModal,
    openAddModal,
    footer: footer,
    ref: childRef,
    setProcess : (process) => setProcess(process),
    process:process
  };

  
  {
    return (
      <div>

        
        <DenialsTableModule config={config} />

      </div>
    )
  }
}
