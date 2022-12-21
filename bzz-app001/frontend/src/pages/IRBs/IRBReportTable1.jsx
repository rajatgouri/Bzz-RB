
import React, { useState, useEffect , useRef} from "react";

import { Table, Input, Button, Space, Form, Row, Col, Select, notification, Radio } from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

import { getDate } from '@/utils/helpers'
import AuditTableModule from "@/modules/AuditDataTableModule";
import IRBReportTableModule from "@/modules/IRBReportDataTableModule";

const { Option } = Select;


export default function IRBreport() {
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
  const [currentUser, setCurrentUser] = useState();
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
    
   
  };

  const entity = "irb-report";
  
useEffect(() => {
  getFilters()
},[])

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
  const dataTableTitle = "IRB Report";
  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  const dataTableColumns = [
   
    
    {
      title: "File Name",
      dataIndex: "Name",
      width: "400px",
      type: "search",
      ...getColumnSearchProps("Name"),  
      filterSearch: true,
      filteredValue: filteredValue['Name'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Name")[0].order : null
    },
    {
      title: "5 Digits No.",
      dataIndex: "Digits",
      width: "150px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Digits"),  
      filteredValue: filteredValue['Digits'] || null,

      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Digits").length > 0) ? filteredValue.sort.filter((value) => value.field == "Digits")[0].order : null
    },
    {
      title: "Match 02149", width: "100px", dataIndex: "Match" ,
      filters: [
        { text: 'Y', value: 'Y' },
        { text: 'N', value: 'N' }
      ],
      type: 'filter',
      
      filteredValue: filteredValue['Match'] || null
    },
    {
      title: "Location", width: "100px", dataIndex: "Location" ,      
       type: "none"
    },
    {
      title: "Medicare Match", width: "100px", dataIndex: "Medicare Match" ,
      filters: [
        { text: 'Y', value: 'Y' },
        { text: 'N', value: 'N' }
      ],
      type: 'boolean',
      
      filteredValue: filteredValue['Medicare Match'] || null
    },
    {
      title: "Target IRB", width: "150px", dataIndex: "Target IRB" ,
      ...getColumnSearchProps("Target IRB"),  
      type: 'search',
      align: "left",
      filteredValue: filteredValue['Target IRB'] || null
    },
    {
      title: "More Than Once", dataIndex: "More Than Once" ,
      filters: [
        { text: 'Y', value: 'Y' },
        { text: 'N', value: 'N' }
      ],
      type: 'filter',
      width: "120px",
      
      filteredValue: filteredValue['More Than Once'] || null
    },  
      {
        title: "Form Type", width: "200px", dataIndex: "Form Type" ,
        ...getColumnSearchProps("Form Type"),  
        type: 'search',
        width: "120px",
        filteredValue: filteredValue['Form Type'] || null
      },
      {
        title: "Accuracy", width: "200px", dataIndex: "Accuracy" ,
        width: "80px",
        type: 'none',
        
      },
      {
        title: "Confidence", width: "200px", dataIndex: "Confidence" ,
        width: "100px",

        type: 'none',
        
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
    classname: 'irb-report',
    scroll:{y: 'calc(100vh - 20.3em)'},
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
        
        <IRBReportTableModule config={config} />

      </div>
    )
  }
}
