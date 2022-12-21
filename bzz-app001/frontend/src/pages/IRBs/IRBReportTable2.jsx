
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
import IRBReportDataTableModule from "@/modules/IRBReportTableDataTableModule";

const { Option } = Select;


export default function IRBreportTable() {
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

  const entity = "irb-report-table";
  
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
        data.map((d) => {
          let item3 = d.column 
          filterObject[item3] = ([...new Set(d.recordset.sort((a, b) => b[d.column] - a[d.column]))].map(item => ({ text: item[d.column], value: item[d.column] })))
        })

       console.log(filterObject)
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
      title: "MRN",
      dataIndex: "MRN",
      width: "100px",
      type: "search",
      ...getColumnSearchProps("MRN"),  
      filterSearch: true,
      filteredValue: filteredValue['MRN'] || null,
      sorter: { multiple: 3 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null
    },
    {
      title: "Last Name",
      dataIndex: "Last Name",
      width: "150px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Last Name"),  
      filteredValue: filteredValue['Last Name'] || null,

      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Last Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Last Name")[0].order : null
    },
    {
      title: "First Name",
      dataIndex: "First Name",
      width: "150px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("First Name"),  
      filteredValue: filteredValue['First Name'] || null,

      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "First Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "First Name")[0].order : null
    },
    {
      title: "Arm",
      dataIndex: "Arm",
      width: "100px",
      type: "filter",
      
      filterSearch: true,
      filters: filters['Arm'],
      filteredValue: filteredValue['Arm'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Arm").length > 0) ? filteredValue.sort.filter((value) => value.field == "Arm")[0].order : null
    },
    {
      title: "Location",
      dataIndex: "Location",
      width: "120px",
      type: "filter",
      
      filterSearch: true,
      filters: filters['Location'],  
      filteredValue: filteredValue['Location'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Location").length > 0) ? filteredValue.sort.filter((value) => value.field == "Location")[0].order : null
    },
  
    {
      title: "Sequence No",
      dataIndex: "Sequence No",
      width: "150px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Sequence No"),  
      filteredValue: filteredValue['Sequence No'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sequence No").length > 0) ? filteredValue.sort.filter((value) => value.field == "Sequence No")[0].order : null
    },
    {
      title: "Consented",
      dataIndex: "Consented",
      width: "150px",
      type: "filter",
      
      filterSearch: true,
      filters: filters['Consented'],  
      filteredValue: filteredValue['Consented'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Consented").length > 0) ? filteredValue.sort.filter((value) => value.field == "Consented")[0].order : null
    },
    {
      title: "Consented2",
      dataIndex: "Consented2",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("Consented2"),  
      filteredValue: filteredValue['Consented2'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Consented2").length > 0) ? filteredValue.sort.filter((value) => value.field == "Consented2")[0].order : null
    },
    {
      title: "On Study Date",
      dataIndex: "On Study Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("On Study Date"),    
      
      filteredValue: filteredValue['On Study Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "On Study Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "On Study Date")[0].order : null
    },
    {
      title: "On Treatment Date",
      dataIndex: "On Treatment Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("On Treatment Date"),    
  
      filteredValue: filteredValue['On Treatment Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "On Treatment Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "On Treatment Date")[0].order : null
    },
    {
      title: "Off Treatment Date",
      dataIndex: "Off Treatment Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("Off Treatment Date"),    
        
      filteredValue: filteredValue['Off Treatment Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Off Treatment Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Off Treatment Date")[0].order : null
    },
    
    {
      title: "Off Study Date",
      dataIndex: "Off Study Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("Off Study Date"),    
      
      filteredValue: filteredValue['Off Study Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Off Study Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Off Study Date")[0].order : null
    },
    {
      title: "Expired Date",
      dataIndex: "Expired Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("Expired Date"),    
  
      filteredValue: filteredValue['Expired Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Expired Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Expired Date")[0].order : null
    },
    {
      title: "Media Consent Linked in Epic",
      dataIndex: "Media Consent_Linked in Epic",
      width: "180px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Media Consent_Linked in Epic"),    
      filteredValue: filteredValue['Media Consent_Linked in Epic'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Media Consent_Linked in Epic").length > 0) ? filteredValue.sort.filter((value) => value.field == "Media Consent_Linked in Epic")[0].order : null
    },
    {
      title: "Sub Consent 02149 YES/NO",
      dataIndex: "Sub Consent 02149 YES/NO",
      width: "180px",
      type: "filter",
      filterSearch: true,
      filters: [
        { text: 'Y', value: 'Yes' },
        { text: 'N', value: 'No' }
      ],
      filteredValue: filteredValue['Sub Consent 02149 YES/NO'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sub Consent 02149 YES/NO ").length > 0) ? filteredValue.sort.filter((value) => value.field == "Sub Consent 02149 YES/NO ")[0].order : null
    },
    {
      title: "NCT No# _Claim Billed With",
      dataIndex: "NCT No# _Claim Billed With",
      width: "180px",
      type: "search",
      
      filterSearch: true,
      filters: filters['NCT No# _Claim Billed With'],  
      filteredValue: filteredValue['NCT No# _Claim Billed With'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "NCT No# _Claim Billed With").length > 0) ? filteredValue.sort.filter((value) => value.field == "NCT No# _Claim Billed With")[0].order : null
    },
    {
      title: "HAR",
      dataIndex: "HAR",
      width: "120px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("HAR"),    
      filteredValue: filteredValue['HAR'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR")[0].order : null
    },
    {
      title: "HAR EDW",
      dataIndex: "HAR EDW",
      width: "120px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("HAR EDW"),    
      filteredValue: filteredValue['HAR EDW'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR EDW").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR EDW")[0].order : null
    },
    {
      title: "Account Financial Class EDW",
      dataIndex: "Account Financial Class EDW",
      width: "180px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Account Financial Class EDW"),    
      filteredValue: filteredValue['Account Financial Class EDW'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Account Financial Class EDW").length > 0) ? filteredValue.sort.filter((value) => value.field == "Account Financial Class EDW")[0].order : null
    },
    {
      title: "Transplant Case?",
      dataIndex: "Transplant Case?",
      width: "150px",
      type: "filter",
      
      filterSearch: true,
      filters: [
        { text: 'Y', value: 'Yes' },
        { text: 'N', value: 'No' },
        { text: '', value: 'null' },

      ],
      filteredValue: filteredValue['Transplant Case?'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Transplant Case?").length > 0) ? filteredValue.sort.filter((value) => value.field == "Transplant Case?")[0].order : null
    },
    {
      title: "Procedure",
      dataIndex: "Procedure",
      width: "150px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("Procedure"),    
      filteredValue: filteredValue['Procedure'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Procedure").length > 0) ? filteredValue.sort.filter((value) => value.field == "Procedure")[0].order : null
    },
    {
      title: "DX",
      dataIndex: "DX",
      width: "100px",
      type: "search",
      
      filterSearch: true,
      ...getColumnSearchProps("DX"),    
      filteredValue: filteredValue['DX'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DX").length > 0) ? filteredValue.sort.filter((value) => value.field == "DX")[0].order : null
    },
    {
      title: "Stmt From Date",
      dataIndex: "Stmt From Date",
      width: "150px",
      type: "date",
      
      filterSearch: true,
      ...getColumnSearchProps("Stmt From Date"),    
      filteredValue: filteredValue['Stmt From Date'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Stmt From Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Stmt From Date")[0].order : null
    },
    
    {
      title: "Admission Date EDW",
      dataIndex: "Admission Date EDW",
      width: "150px",
      type: "datetime",
      
      filterSearch: true,
      ...getColumnSearchProps("Admission Date EDW"),    
      filteredValue: filteredValue['Admission Date EDW'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Admission Date EDW").length > 0) ? filteredValue.sort.filter((value) => value.field == "Admission Date EDW")[0].order : null
    },

    {
      title: "Discharge Date EDW",
      dataIndex: "Discharge Date EDW",
      width: "150px",
      type: "datetime",
      
      filterSearch: true,
      ...getColumnSearchProps("Discharge Date EDW"),    
      filteredValue: filteredValue['Discharge Date EDW'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Discharge Date EDW").length > 0) ? filteredValue.sort.filter((value) => value.field == "Discharge Date EDW")[0].order : null
    },
    
    {
      title: "Deseased YES/NO",
      dataIndex: "Deseased YES/NO",
      width: "150px",
      type: "filter",
      
      filterSearch: true,
      filters: [
        { text: 'Y', value: 'Yes' },
        { text: 'N', value: 'No' },
        { text: '', value: 'null' },

      ],   
      filteredValue: filteredValue['Deseased YES/NO'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Deseased YES/NO").length > 0) ? filteredValue.sort.filter((value) => value.field == "Deseased YES/NO")[0].order : null
    },
    {
      title: "Deceased YES/NO EDW",
      dataIndex: "Deceased YES/NO EDW",
      width: "150px",
      type: "filter",
      
   },
    {
      title: "Claim Payer Name",
      dataIndex: "Claim Payer Name",
      width: "150px",
      type: "filter",
      filterSearch: true,
      filters: filters['Claim Payer Name'] ,
      filteredValue: filteredValue['Claim Payer Name'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Payer Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim Payer Name")[0].order : null
    },
    {
      title: "Claim Paid",
      dataIndex: "Claim Paid",
      width: "150px",
      type: "search",
      feature: "dollor",
      filterSearch: true,
      ...getColumnSearchProps("Claim Paid"),    
      filteredValue: filteredValue['Claim Paid'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Paid").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim Paid")[0].order : null
    },
    {
      title: "Claim Paid EDW",
      dataIndex: "Claim Paid EDW",
      width: "150px",
      type: "search",
      feature: "dollor",
      filterSearch: true,
      ...getColumnSearchProps("Claim Paid"),    
      filteredValue: filteredValue['Claim Paid EDW'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Paid EDW").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim Paid EDW")[0].order : null
    },
    {
      title: "Alternate Payor",
      dataIndex: "Alternate Payor",
      width: "150px",
      type: "filter",
      
      filterSearch: true,
      filters: [
        { text: 'Y', value: 'Yes' },
        { text: 'N', value: 'No' },
        { text: '', value: 'null' },

      ],   
      filteredValue: filteredValue['Alternate Payor'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Alternate Payor").length > 0) ? filteredValue.sort.filter((value) => value.field == "Alternate Payor")[0].order : null
    },
    {
      title: "Note/Age",
      dataIndex: "Note/Age",
      width: "150px",
      type: "search",
      filterSearch: true,
      ...getColumnSearchProps("Note/Age"),    
      filteredValue: filteredValue['Note/Age'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Note/Age").length > 0) ? filteredValue.sort.filter((value) => value.field == "Note/Age")[0].order : null
    },
    {
      title: "DOB",
      dataIndex: "DOB",
      width: "150px",
      type: "date",
      filterSearch: true,
      ...getColumnSearchProps("DOB"),    
      filteredValue: filteredValue['DOB'] || null,
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOB").length > 0) ? filteredValue.sort.filter((value) => value.field == "DOB")[0].order : null
    },
    {
      title: "AgeEDW",
      dataIndex: "AgeEDW",
      width: "150px",
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
    classname: 'irb-report-table',
    scroll:{y: 'calc(100vh - 18.3em)'},
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

        
        <IRBReportDataTableModule config={config} />

      </div>
    )
  }
}
