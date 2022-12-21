
import React, { useState } from "react";
import {  Input, Button, Space , Form, notification, Row, Col} from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import MappingDataTableModule from "@/modules/MappingArmDataTableModule";
import Modals  from "@/components/Modal";
import TextArea from "rc-textarea";
import { request } from "@/request";


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function MappingArm() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedId, setSelectedId] = useState()
  const [subEntity, setSubEntity] = useState()

  const [form] = Form.useForm()
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

  const getFilterValue = (value) => {

  }

  const entity = "mapping-mca";
  const entity2 = "timepoint-mca";


  const getFilters = (data) => {
    
  }

  const getItems = (data) => {

    if ( filters.length ==0 ) {
      getFilters(data)
  
    } 

    setHasErrors(true)
    setItems(data)
  } 


  const openingModal = async (  row,type, tab) => {
    setModalType(type);
    setSubEntity(tab)

    let data = []
    if (tab == 'EPIC') {
      let {result} =await request.create(entity + "-"+ tab , {IRB: row['IRB'], Name: row['item']['TP_NAME']}, )
      data = result
    } else {
      let{result} =await request.create(entity + "-"+ tab , {IRB: row['IRB'], Name: row['item']['TIME_POINT']}, )
      data = result
    }

    if(type =='EDIT') {
      setSelectedId(row);

      form.setFieldsValue({
        Notes: data[0] ?data[0]['Notes'] :'' 
      })
  
      setModalTitle("Edit Notes");
      setOpenModal(true)
    } else {
      setSelectedId(data[0]);
      setModalTitle("View Notes");
      setOpenModal(true); 
    }
  }

 
 

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
   
  }

  const panelTitle = "";
  const dataTableTitle = "Mapping";
  


 
 
  const dataTableColumns = [
    {
      title: "Epic ARM",
      dataIndex: "item",
      width: "500px",
    },
    {
      title: "MCA ARM",
      dataIndex: "option",
      key: "option",
      width: "180px"
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "60px",

    }
    
  ];


  
 
  const dataTableColumns2 = [
    {
      title: "Epic Timepoints",
      dataIndex: "item",
      width: "300px",
    },
    {
      title: "MCA Timepoints",
      dataIndex: "option",
      key: "option",
      width: "500px"
    },
    {
      title: "MCA Column",
      dataIndex: "MCA Column",
      key: "MCA Column",
      width: "60px"
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: 'center',
      width: "50px",
      fixed: 'right'

    }
    
  ];


  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  const config = {
    entity,
    entity2,
    panelTitle,
    dataTableTitle,
    ENTITY_NAME,
    CREATE_ENTITY,
    ADD_NEW_ENTITY,
    UPDATE_ENTITY,
    DATATABLE_TITLE,
    dataTableColumns,
    dataTableColumns2,
    getItems,
    reload,
    getFilterValue,
    openModal: openingModal,
    
  };


  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    width: 400
    
  };

  const onEditItem = async(values) => {
    if (subEntity == 'epic') {
      await request.update(entity+"-"+ subEntity, selectedId.IRB, {Notes: values['Notes'], Name: selectedId.item['TP_NAME']})

    } else {
      await request.update(entity+"-"+ subEntity, selectedId.IRB, {Notes: values['Notes'], Name: selectedId.item['TIME_POINT']})

    }
    notification.success({message: "Notes Added Successfully!"})
    handleCancel()
  }
  
 
  {
  return (
    <div>

    <MappingDataTableModule config={config} />

    <Modals config={modalConfig} >
          
          {
            modalType == "EDIT" ? 
            <Form
                name="basic"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
                onFinish={(values) => onEditItem(values)}
                autoComplete="off"
                id="notes-form"
                className="notes-form"
                form={form}
              >
                <Form.Item
                  label=""
                  name="Notes"
                >      
                  <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
                </Form.Item>
                
                <Form.Item wrapperCol={{ offset: 18 }} className="notes-form" style={{marginTop: "10px" ,marginBottom: "0px", textAlign: "end"}}>
                  <Button type="primary" htmlType="submit" className="mr-3" >
                    Update
                  </Button>
                </Form.Item>
              </Form>
            
            
            : null
          }
          {
            modalType == "VIEW" ? 
            <Row gutter={[24,24]}>
              <Col span={24}>
               {
                 selectedId ?
                 selectedId['Notes'] 
                 : null
               }
              </Col>
            </Row>
            : null
          }

         

      </Modals>  

    </div>

  ) 
    
  }  
}