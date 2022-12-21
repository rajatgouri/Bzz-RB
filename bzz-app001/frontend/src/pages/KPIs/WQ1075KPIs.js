

import React, { useState, useEffect } from "react";
import {  Row, Col } from "antd";

import { DashboardLayout } from "@/layout";
import  WQ1075KPIsChart  from "@/components/WQ1075KPIs";
import WQ1075KPIsTable from '@/modules/WQKPIsDataTableModule'
import { useSelector } from "react-redux";
import { request } from "@/request";


const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function WQ1075KPIs() {

  const [usersList, setUsersList] = useState([])


  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] =useState([])


  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          
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

  const entity = "wq1075kpis-table";

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }

  const getItems = (data) => {
    setItems(data)
  } 

  useEffect(() => {
    (async () => {
      let {result} = await request.list(entity+ "-filters")
      let SmartAppAnswers  = result['Smart App Answers'].sort().map((value) => ({text: value['Smart App Answers'], value: value['Smart App Answers']}))
      let  DayName = result['Day Name'].sort().map((value) => ({text: value['Day Name'], value:value['Day Name']}))
  
      setFilters ({
        SmartAppAnswers,
        DayName
      })
    })()
  }, [])


  const panelTitle = "KPI";
  const dataTableTitle = "KPIs";
  const showProcessFilters = true;



  const dataTableColumns = [
    
    { title: "Review Date", dataIndex: "Review Date", width: 20, sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Review Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Review Date")[0].order : null,
    },
    {
      title: "Smart App Answers", width: 20, dataIndex: "Smart App Answers",
      filters: filters['SmartAppAnswers'],
      filteredValue: filteredValue['Smart App Answers'] || null 

    },
    {
      title: "Day Name", width: 20, dataIndex: "Day Name",
      filters: [
        {text: "Sunday", value: "Sunday" },
        {text: "Monday", value: "Monday" },
        {text: "Tuesday", value: "Tuesday" },
        {text: "Wednesday", value: "Wednesday" },
        {text: "Thrusday", value: "Thrusday" },
        {text: "Friday", value: "Friday" },
        {text: "Saturday", value: "Saturday" }

      ],
      filteredValue: filteredValue['Day Name'] || null 

    },
    { title: "Total Charges", dataIndex: "Total Charges", width: 20, sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Charges").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Total Charges")[0].order : null,
    },
    { title: "Total Minutes", dataIndex: "Total Minutes", width: 20, sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Minutes").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Total Minutes")[0].order : null,
    },
    { title: "Total Cost", dataIndex: "Total Cost", width: 20, sorter: { multiple: 1}, 
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Cost").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Total Cost")[0].order : null,
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
    dataTableColumns,
    getItems,
    reload,
    getFilterValue,
    showProcessFilters,
    userList: users,
    scroll: {y: "450px"},
    className:"kpi-table"
  };



  return (
    <DashboardLayout style={dashboardStyles}>
      <Row gutter={[24, 24]}>

        <Col className="gutter-row" style={{ width: "100%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >
              <WQ1075KPIsChart usersList={usersList}> </WQ1075KPIsChart>
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "100%" }}>
          <div className="whiteBox shadow" style={{ height: "520px" }}>
            <div className="pad20 " >
              <h2 className="font-cinzel">WQ 1075 KPIs</h2>
              <WQ1075KPIsTable config={config}/>
            </div>
          </div>
        </Col>


      </Row>

    </DashboardLayout>
  );
}