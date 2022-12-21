
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
import DataTableModule from "@/modules/WQErrorDataTableModule";
import SortModal from '@/components/Sorter'


export default function WQError() {
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
  const [process, setProcess] = useState('WQ5508')
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

  const entity = "wq5508-error";
  const entity1 = "wq1262-error";


  const getSort = async() => {
    
      setDataColumns(dataTableColumns)
  
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

    let {result: data} = await request.list(process.toLowerCase() + "-error" + "-filters", {WQError: true})
 
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

  const panelTitle = "WQ Errors";
  const dataTableTitle = "WQ Errors";



  const dataTableColumns =  
  process == 'WQ5508' ? [
   
    {
      title: "Error", width: 70, dataIndex: "Error" ,
      type: "boolean",
      order: 4,
      filteredValue: filteredValue['Error'] || null
    },
    {
      title: "Notes", width: 80, dataIndex: "Notes", 
      ...getColumnSearchProps("Notes"),
      order: 5,
      feature: "Notes",
      filteredValue: filteredValue['Notes'] || null 
    },
    {
      title: "SA Error", width: 80, dataIndex: "SA Error", 
      filters: [
        {text: "Yes" , value: "Yes"},
        {text: "" , value: ""}

    ],
      order: 6,
      feature: "checkmark",

      filteredValue: filteredValue['SA Error'] || null 
    },
      { title: "Service", dataIndex: "Svc Date", feature: "date", width: 90, sorter: { multiple: 1}, 
      order: 7,
      ...getColumnSearchProps("Svc Date"),
      type: "date",

      filteredValue: filteredValue['Svc Date'] || null ,
  
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Svc Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Svc Date")[0].order : null, 
      },
      {
        title: "MRN",
        dataIndex: "Patient MRN",
        width: 100,
        order: 8,
      type: "search",

        ...getColumnSearchProps("Patient MRN"),
        filteredValue: filteredValue['Patient MRN'] || null ,
        sorter: { multiple: 9 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient MRN")[0].order : null
      },
      {
        title: "Status", width: 80, dataIndex: "Status",
        order: 9,
        type: "filter",
        filters: [
          { text: "Done", value: "Done" },
          { text: "Pending", value: "Pending" },
          { text: "Misc", value: "Misc" },
          { text: "Deferred", value: "Deferred" },
          { text: "Review", value: "Review" }
        ],
        filteredValue: filteredValue['Status'] || null 
      },
      {
        title: "Patient",
        dataIndex: "Patient",
        order: 10,
        type: "filter",
        width: 220,
        sorter: { multiple: 24},
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Patient")[0].order : null,
        // ...getColumnSearchProps("Patient"),
        filters: 
        filters['Patient'],
        filterSearch: true,
        filteredValue: filteredValue['Patient'] || null 
      },
      { title: "IRB",
        dataIndex: "Research IRB", 
        width: 80, 
        order: 11,
        type: "filter",
  
        // ...getColumnSearchProps("Research IRB"),
        filters: 
         filters['Research IRB'],
        sorter: { multiple: 4},
        filterSearch: true,
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Research IRB").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Research IRB")[0].order : null, 
        filteredValue: filteredValue['Research IRB'] || null 
      },
      { title: "CPT", 
        dataIndex: "CPT Codes", 
        width: 110, 
        order: 12,
        feature: "tooltip",
        type: "search",
        ...getColumnSearchProps("CPT Codes"),
        filteredValue: filteredValue['CPT Codes'] || null ,
        sorter: { multiple: 9 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT Codes").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT Codes")[0].order : null,
       filteredValue: filteredValue['CPT Codes'] || null 
      },
      { title: "Amount", dataIndex: "Sess Amount", width: 100, sorter: { multiple: 2},
      order: 13,
        type: "text",
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sess Amount").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Sess Amount")[0].order : null,
      },
      { title: "Coverage", 
        dataIndex: "Primary Coverage", 
        width: 350, 
        order: 14,
      type: "filter",
        filters: 
         filters['Primary Coverage'],
        filterSearch: true,
        filteredValue: filteredValue['Primary Coverage'] || null ,
        sorter: { multiple: 8 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Primary Coverage").length > 0) ? filteredValue.sort.filter((value) => value.field == "Primary Coverage")[0].order : null
      },
      { title: "Study Type", dataIndex: "Study Type", width: 130 ,
      order: 15,
      type: "filter",
      filters: 
       filters['Study Type'],
      filteredValue: filteredValue['Study Type'] || null ,
      filterSearch: true,
  
    },
    
    { title: "Study Status", dataIndex: "Study Status", width: 130 ,
    order: 16,
    type: "filter",
  
    filters: 
       filters['Study Status'],
       filterSearch: true,
       filteredValue: filteredValue['Study Status'] || null ,
       filterSearch: true,
    },
      {
        title: "Timely",
        width: 80,
        order: 17,
        type: "text",
  
        dataIndex: "Days Until Timely Filing",
      },
      { title: "Aging", width: 70, dataIndex: "Aging Days", sorter: { multiple: 3},
      order: 18,
      type: "text",
        // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Aging Days") ? filteredValue.sort.order : null,
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Aging Days").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Aging Days")[0].order : null,
      
      },
  
      { title: "Enrolled - Active", width: 140, dataIndex: "Enrolled - Active", sorter: { multiple: 4},
      order: 19,
      type: "text",
      feature: "date",
  
        // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Enrolled - Active") ? filteredValue.sort.order : null,
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Enrolled - Active").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Enrolled - Active")[0].order : null,
      
      },
  
      { title: "Consented", width: 110, dataIndex: "Consented", sorter: { multiple: 5},
      order: 20,
      type: "text",
        feature: "date",
        sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Consented").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Consented")[0].order : null,
      },
  
      { title: "IsScreening", width: 110, dataIndex: "IsScreening",
      type: "filter", 
      filters: [
        { text: "Y" , value: "Y" },
        { text: "N", value: "N" },
        { text: "" , value: "null" }
      ],
      order: 21,
  
      filteredValue: filteredValue['IsScreening'] || null
      },
  
      
      {
        title: "User Assigned", width: 130, dataIndex: "UserAssigned", filters: filters['User'],
        filteredValue: filteredValue['UserAssigned'] || null,
        filterSearch: true,
        order: 22,
        type: "filter"
  
  
      },
      
      { title: "User Logged", width: 120, dataIndex: "User" ,
      filters: filters['User'],
      filteredValue: filteredValue['User'] || null ,
      filterSearch: true,
      order: 24,
  
  
  
    },
      {
        title: "Start Time", dataIndex: "StartTimeStamp", width: 150, 
        sorter: { multiple: 5 },
        order: 25,
        feature: "datetime",
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
      },
      {
        title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
        order: 26,
        feature: "datetime",

  
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
      },
      {
        title: "Duration", dataIndex: "Duration", width: 100, 
        order: 27,
  
        ...getColumnSearchProps("Duration"),
        filteredValue: filteredValue['Duration'] || null
      },
  
      
        
       
    ] :
    [
  
      
      {
        title: "Error", width: 70, dataIndex: "Error" ,
       
        order: 4,
        filteredValue: filteredValue['Error'] || null
      },
      {
        title: "Notes", width: 80, dataIndex: "Notes", 
        ...getColumnSearchProps("Notes"),
        order: 5,
        feature: "Notes",
        filteredValue: filteredValue['Notes'] || null 
      },
      {
        title: "SA Error", width: 80, dataIndex: "SA Error", 
        filters: [
          {text: "Yes" , value: "Yes"},
          {text: "" , value: ""}
  
      ],
        order: 6,
        feature: "checkmark",
        filteredValue: filteredValue['SA Error'] || null 
      },
      {
        title: "Acct ID",
        dataIndex: "Acct ID",
        width: 120,
        order: 6,
        ...getColumnSearchProps("Acct ID"),
        filteredValue: filteredValue['Acct ID'] || null,
        sorter: { multiple: 9 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct ID")[0].order : null
      },
      {
        title: "MRN",
        dataIndex: "Patient MRN",
        width: 100,
        order: 7,
        ...getColumnSearchProps("Patient MRN"),
        filteredValue: filteredValue['Patient MRN'] || null,
        sorter: { multiple: 9 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient MRN")[0].order : null
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
        order: 7,
  
        filterSearch: true,
        filteredValue: filteredValue['Status'] || null
      },
      {
        title: "Line Ct.",
        dataIndex: "Line Count",
        width: 100,
        order: 8,
        filters:
       
          filters['Line Count'],
        filteredValue: filteredValue['Line Count'] || null,
        filterSearch: true,
        sorter: { multiple: 8 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Line Count").length > 0) ? filteredValue.sort.filter((value) => value.field == "Line Count")[0].order : null
      },
     
        {
          title: "Acct Class",
          dataIndex: "Acct Class",
          width: 140,
          order: 9,
  
          filters: 
          
            filters['Acct Class'],
          filteredValue: filteredValue['Acct Class'] || null,
          sorter: { multiple: 8 },
          filterSearch: true,
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Class").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Class")[0].order : null
        }
      ,
      
        {
          title: "Billing Status",
          dataIndex: "Billing Status",
          width: 170,
          order: 10,
          filters:
         
            filters['Billing Status'],
          filteredValue: filteredValue['Billing Status'] || null,
          sorter: { multiple: 8 },
          filterSearch: true,
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Billing Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Billing Status")[0].order : null
        }
      
      ,
      {
        title: "Acct Name",
        dataIndex: "Acct Name",
        width: 220,
        order: 11,
  
        sorter: { multiple: 24 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Name")[0].order : null,
        filters: 
          filters['Acct Name'],
          filterSearch: true,
  
        filteredValue: filteredValue['Acct Name'] || null
      },
      {
        title: "Disch Date", dataIndex: "Disch Date", width: 115,
        sorter: { multiple: 5 },
        order: 12,
        feature: "date",
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Disch Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Disch Date")[0].order : null,
      },
      {
        title: "Acct Bal", dataIndex: "Acct Bal", width: 95, sorter: { multiple: 2 },
        order: 13,
        feature: "amount",
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Bal").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Bal")[0].order : null,
      },
    
      {
        title: "Fin Class",
        dataIndex: "Fin Class",
        width: 150,
        order: 14,
        filters:
        
        
          filters['Fin Class'],
        filteredValue: filteredValue['Fin Class'] || null,
        sorter: { multiple: 8 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Fin Class").length > 0) ? filteredValue.sort.filter((value) => value.field == "Fin Class")[0].order : null
      },
      {
        title: "Study Status",
        dataIndex: "Study Status",
        width: 150,
        order: 15,
        filters:
        
          filters['Study Status'],
        sorter: { multiple: 4 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Study Status").length > 0) ? filteredValue.sort.filter((value) => value.field == "Study Status")[0].order : null,
        filteredValue: filteredValue['Study Status'] || null
      },
      {
        title: "Study Type",
        dataIndex: "Study Type",
        width: 120,
        order: 16,
        type: "filter",
        filters:
        
          filters['Study Type'],
        sorter: { multiple: 4 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Study Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Study Type")[0].order : null,
        filteredValue: filteredValue['Study Type'] || null
      },
      {
        title: "Name",
        dataIndex: "Name",
        width: 100,
        order: 17,
        filters:
      
          filters['Name'],
        sorter: { multiple: 4 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Name")[0].order : null,
        filteredValue: filteredValue['Name'] || null
      },
     
        {
          title: "Code",
          dataIndex: "Code",
          width: 85,
          order: 18 ,
          // ...getColumnSearchProps("Research IRB"),
          filters:
         
            filters['Code'],
          sorter: { multiple: 4 },
          filterSearch: true,
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Code").length > 0) ? filteredValue.sort.filter((value) => value.field == "Code")[0].order : null,
          filteredValue: filteredValue['Code'] || null
        }
        
  
     ,
      
      {
        title: "Message",
        dataIndex: "Message",
        width: 130,
        order: 19,
        filters:
        
          filters['Message'],
        filteredValue: filteredValue['Message'] || null,
        sorter: { multiple: 8 },
        filterSearch: true,
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Message").length > 0) ? filteredValue.sort.filter((value) => value.field == "Message")[0].order : null
      },
      {
        title: "Days U.T.F.",
        width: 120,
        order: 20,
        dataIndex: "Days Until Timely Filing",
        ...getColumnSearchProps("Days Until Timely Filing"),
        filteredValue: filteredValue['Days Until Timely Filing'] || null,
        sorter: { multiple: 9 },
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days Until Timely Filing").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days Until Timely Filing")[0].order : null
  
      },
     
        {
          title: "Days On WQ",
          dataIndex: "Days On Account WQ",
          width: 120,
          order: 21,
          sorter: { multiple: 8 },
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days On Account WQ").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days On Account WQ")[0].order : null
        }
      ,
      {
        title: "SOC Flag", width: 120, dataIndex: "SOC Flag",
        filters: [
          { text: "SOC", value: "SOC" },
          { text: "Study-Related", value: "Study-Related" },
          { text: "N/A", value: "N/A" },
  
        ],
        order: 22,
        
        filterSearch: true,
        filteredValue: filteredValue['SOC Flag'] || null
      },
     
      {
        title: "Category", width: 120, dataIndex: "Category",
        ...getColumnSearchProps("Category"),
        order: 23,
        
        filterSearch: true,
        filteredValue: filteredValue['Category'] || null,
        sorter: { multiple: 8 },
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Category").length > 0) ? filteredValue.sort.filter((value) => value.field == "Category")[0].order : null
  
      },
      {
        title: "SR/SOC Ratio", width: 150, dataIndex: "SR/SOC Ratio",
        ...getColumnSearchProps("SR/SOC Ratio"),
        order: 24,
        
        filterSearch: true,
        filteredValue: filteredValue['SR/SOC Ratio'] || null,
        sorter: { multiple: 8 },
          sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SR/SOC Ratio").length > 0) ? filteredValue.sort.filter((value) => value.field == "SR/SOC Ratio")[0].order : null
  
      },
      
      {
        title: "Upload Date Time", dataIndex: "UploadDateTime", width: 150,
        sorter: { multiple: 15 },
        order: 26,
        feature: "datetime",
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UploadDateTime").length > 0) ? filteredValue.sort.filter((value) => value.field == "UploadDateTime")[0].order : null,
      },
      {
        title: "User Assigned", width: 130, dataIndex: "UserAssigned", filters: filters['User'],
        filteredValue: filteredValue['UserAssigned'] || null,
        filterSearch: true,
        order: 27,
  
  
      },
  
      {
        title: "User Logged", width: 130, dataIndex: "User",
        filters:  filters['User'],
        filteredValue: filteredValue['User'] || null,
        filterSearch: true,
        order: 28,
  
  
  
      },
      {
        title: "Start Time", dataIndex: "StartTimeStamp", width: 150,
        sorter: { multiple: 5 },
        order: 29,
        feature: "datetime",
  
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
      },
      {
        title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
        order: 30,
        feature: "datetime",
  
        sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
      },
      {
        title: "Duration", dataIndex: "Duration", width: 100,
        ...getColumnSearchProps("Duration"),
        order: 31,
  
        filteredValue: filteredValue['Duration'] || null
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
      
    dispatch(crud.update(defaultProcess.current.toLowerCase(), selectedId, obj))
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
    let response = await (request.update(process, row.ID, obj))
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
      entity : entity1,
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
      
          <DataTableModule config={ process == 'WQ5508' ? config : config2} />

        
    </div>
     : null 
    } else {
    return ""
  }
}
