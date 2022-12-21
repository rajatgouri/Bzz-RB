import React, {useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { crud } from "@/redux/crud/actions";
import CoverageModule from "@/modules/CoverageModule";
import { Switch, Input, Space, Button , Modal, Row, Col, Form} from "antd";
import {  SearchOutlined } from "@ant-design/icons";
import DataTableModule from "@/modules/DataTableModule";
import Highlighter from "react-highlight-words";
import TextArea from "rc-textarea";
import { notification } from "antd";
let { request } = require('../request/index');
import { selectAuth } from "@/redux/auth/selectors";


import { Select } from "antd";
import {
  EditOutlined,
  EyeOutlined
} from "@ant-design/icons";
import moment from "moment";

function valueType(value) {
  if (value == 0) {
    return 0;
  } else if (value == 1) {
    return 1;
  } else {
    return "";
  }
}

export default function CoverageGovernment() {
  const entity = "coverageGoverment";
  const loggerEntity = "coverageGovermentLogger";
  const dispatch = useDispatch();
  const [editForm] = Form.useForm();
  const {current} = useSelector(selectAuth);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [selectedID, setSelectedID] = useState(0);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [reload, setReload] = useState(false);
  const [filteredValue, setFilteredValue] = useState({})


  const [notes, setNotes] = useState("");
  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = new Date().toISOString();

  const currentDate = usDate 

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


  const updateGovernmentChange = (value, row) => {
    const { ID , PrimaryCoverage} = row;

    const fieldsValue = { Government: value , New : value == 'null' ? 1 : 0 } ;
    dispatch(crud.update(entity, ID[0], fieldsValue));
    request.create(loggerEntity, { CoverageID: ID, PrimaryCoverage : PrimaryCoverage, Status: value });

  };

  const getPrimaryCoverage = (id) => {
    return (items.filter(item => item.ID[0] == id))[0]
  }

  const onEdit = async(values) => {
    let data = (getPrimaryCoverage(selectedID));
    let response = await request.update(entity, selectedID, values);
    if(response.success) {
      setIsEditModalVisible(false)
      reloading()
      notification.success({message: "Sucessfully updated the Notes!", duration: 3})
      request.create(loggerEntity, { CoverageID: selectedID, PrimaryCoverage : data['PrimaryCoverage'], Status: 'Update Note' });
    }
  }

  const reloading = () => {
    setReload(true)
    setReload(false)
  }

  const onEditFailed = () => {
      notification.error({message: "Please enter IRB",  duration: 3})
  }

  const updateNewChange = (value, row) => {
    const { ID } = row;

    const fieldsValue = { New: value , LastUpdated: new Date()};
    
    dispatch(crud.update(entity, ID[0], fieldsValue));
  };

  const getItems  = (items) => {
    setItems(items)
  }

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedID(record.ID[0])
      },
    };
  }

  const openViewModal = (id) => {
    setIsViewModalVisible(true) 
    let data = items.filter(item => item.ID[0] === id)[0];
    setNotes(data.Notes)
  }

  const openEditModal = (id) => {
    let data = items.filter(item => item.ID[0] === id)[0]
    request.create(loggerEntity, { CoverageID: id, PrimaryCoverage : data['PrimaryCoverage'], Status: 'Edit Note' });

    editForm.setFieldsValue({Notes: data.Notes});
    setIsEditModalVisible(true);
  };


  const handleCancel = () => {
    setIsEditModalVisible(false);
    setIsViewModalVisible(false)
  };

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }

  const dataTableColumns = [
    {
      title: "No.",
      dataIndex: "SNo",
      key: "SNo",
      sorter: true,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SNo").length > 0) ?  filteredValue.sort.filter((value) => value.field == "SNo")[0].order : null,
      
      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "SNo") ? filteredValue.sort.order : null,
      render: (text, row) => {
        return {
          props: {
            style: {
              width: "60px",
            },
          },
          children: text
        };
      },
    },
    {
      title: "Government",
      dataIndex: "Government",
      key: "Government",
      filteredValue:filteredValue['Government'] || null,
      filters: [
        { text: "True", value: 1 },
        { text: "False", value: 0 },
        { text: "", value: null },
      ],
      // onFilter: (value, record) => record.Government === value,
      render: (text, row) => {
        return {
          props: {
            style: {
              width: "130px",
            },
          },
          children: (
            <Select
              placeholder="Select"
              defaultValue={() => valueType(text)}
              style={{ minWidth: "90px" }}
              onSelect={(value) => updateGovernmentChange(value, row)}
            >
              <Select.Option value={1}>True</Select.Option>
              <Select.Option value={0}>False</Select.Option>
              <Select.Option value="null">&nbsp;</Select.Option>
            </Select>
          ),
        };
      },
    },
    {
      title: "Primary Coverage",
      dataIndex: "PrimaryCoverage",
      key: "PrimaryCoverage",
      filteredValue:filteredValue['PrimaryCoverage'] || null,
      ...getColumnSearchProps("PrimaryCoverage")
    },
    {
      title: "Notes",
      dataIndex: "Notes",
      key: "Notes",
      width: 100,
      filteredValue:filteredValue['Notes'] || null,
      filters: [
        { text: <EyeOutlined/>, value: 0 },
        { text: "", value: 1 }
      ],
      // onFilter: (value, record) => {
        
      //   if(value == 0) {
      //     return record.Notes !== null 
      //   } else {
      //     return record.Notes == null 
      //   }
      // }, 
      render: (text, row) => <div >
        <span className="float-left"><EditOutlined onClick={() => openEditModal(row.ID[0])}/></span> 
        <span className="float-left " style={{marginLeft: "10px"}}>{text ?  <EyeOutlined onClick={() => openViewModal(row.ID[0])}/>  : ''  }</span> 
      </div>,
    },
    // {
    //   title: "New",
    //   dataIndex: "New",
    //   key: "New",
    //   filters: [
    //     { text: "True", value: true },
    //     { text: "False", value: false },
    //   ],
    //   onFilter: (value, record) => record.New === value,
    //   render: (text, row) => {
    //     return {
    //       props: {
    //         style: {
    //           width: "130px",
    //         },
    //       },
    //       children: (
    //         text == '0' ? "False" : "True"
    //       ),
    //     };
    //   },
    // },
    {
      title: "User",
      dataIndex: "First",
      key: "First",
      filters: [
        { text: "Anna Maria", value: "Anna Maria" },
        { text: "Ferdinand", value: "Ferdinand" },
        { text: "Jacqueline", value: "Jacqueline" },
        { text: "Jannet", value: "Jannet" },
        { text: "Mary", value: "Mary" },
        { text: "Suzanne", value: "Suzanne" },
        { text: "Test", value: "Test" },
      ],
      filteredValue:filteredValue['First'] || null,
      // onFilter: (value, record) => record.First === value,
      render: (text, row) => { 
        return {
          props: {
            style: {
              width: "130px",
            },
          },
          children: (
              text 
          ),
        }
      }
    },
    {
      title: "Entry Date",
      dataIndex: "LastUpdated",
      key: "LastUpdated",
      sorter: {multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "LastUpdated").length > 0) ?  filteredValue.sort.filter((value) => value.field == "LastUpdated")[0].order : null,
      render: (text, row) => { 
        return {
          children: text ? text.split('T')[0] + " " + text.split('T')[1].substring(0,5) : ""
        }
      }
    },
  ];

  const DATATABLE_TITLE = "Government Coverage";

  const config = {
    entity,
    DATATABLE_TITLE,
    dataTableColumns,
    addModal: {},
    handleRowClick,
    getItems,
    onAddItem: () => {},
    addModal: {},
    reload,
    getFilterValue
  };
  return (
    <div>
    <DataTableModule config={config} />
    <Modal
      maskClosable={false}
      centered
      title="View Notes"
      visible={isViewModalVisible}
      footer={null}
      onCancel={handleCancel}
      width={240}
    >
      <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
          <Col className="gutter-row" span={24}>
            {notes}
          </Col>
      </Row>
    </Modal>

    <Modal 
      maskClosable={false}
      centered
      title="Edit Notes" 
      visible={isEditModalVisible} 
      onCancel={handleCancel}
      footer={null}
      width={330}
      >
      <Form
        name="basic"
        labelCol={{ span: 0 }}
        onFinish={onEdit}
        onFinishFailed={onEditFailed}
        autoComplete="off"
        form={editForm}
      >
    
        <Form.Item
          style={{marginBottom: "15px !important"}}
          label=""
          name="Notes"
        >
          
          {/* <Input type="text" /> */}
          <TextArea type="text" style={{ width: "100%", border: "1px solid lightgrey", marginBottom: "-5px" }} rows={10}></TextArea>
        </Form.Item>

        <Form.Item labelAlign="right" wrapperCol={{ offset: 17 }}>
            <Button className="mr-3" type="primary" htmlType="submit">
                Update
            </Button>
        </Form.Item>
      </Form>
    </Modal>
    </div>
  )
}
