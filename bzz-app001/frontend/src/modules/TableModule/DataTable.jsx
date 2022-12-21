import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Radio,
  Popover,
  Select,
  Row,
  Col,
  DatePicker,
  Tooltip
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloudDownloadOutlined } from "@ant-design/icons";
import moment from 'moment';
import Modals from "@/components/Modal";
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import {
  EyeOutlined,
  EditOutlined,
  EyeFilled,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date()


const {Option} = Select


export default function DataTable({ config }) {

  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle , userList, updateSelect, openingModal, open_Modal, onChangeCheckbox,confirmModal, AddIcon, selectupdateSelect} = config;
  const { current } = useSelector(selectAuth);
  

  const newDataTableColumns = dataTableColumns.map((obj) => {


    if (obj.dataIndex == "Action" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div style={{textAlign: "center"}}>
                <span className="actions" >
                    <span className="actions">
                      <Popover placement="rightTop" content={
                        <div>
                          <p  className="menu-option" onClick={() => openingModal(row)}><span><EditOutlined /></span> Edit</p>
                        </div>
                      } trigger="click">
                        <EllipsisOutlined />
                      </Popover>
                    </span>
                  </span> 
              </div>
            )
          };
        },
      })
    }

    if (obj.type == "pencil") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            
            children: (
              <div>
                <div className="w-90  inline">
                  {text && text.length > 50 ? 
                  (
                  <Tooltip title={text}>
                    {text.substring(0,50)} ...
                    
                  </Tooltip>
                  )
                  :
                  text
                  }
                </div>
                <div className="w-10 text-end inline">
                  {
                    current.managementAccess ? 
                    <EditOutlined onClick={() => open_Modal('Notes', 'EDIT', row, obj.dataIndex)} /> 
                    : null
                  }
                </div>
                  
              </div>
            )
          };
        },
      })
    }

    

    if (obj.type == "select" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                <Select 
                  placeholder="Select"
                  defaultValue={(text)}
                  disabled={(current.adminAccess || current.managementAccess)? false : true} 
                  style={{ minWidth: "100%" , width: "100%"}}
                  onSelect={(value) => selectupdateSelect(value, row, obj.dataIndex)}
                >
                  {
                    obj.options.map(o => {
                      return <Select.Option value={o.value}>{o.text}</Select.Option>
                   
                    }) 
                  }
                </Select>
              </div>
            )
          };
        },
      })
    }


    if (obj.type == "checkbox" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div style={{textAlign : "center"}}>
                <Checkbox style={{marginLeft: "-10px"}} disabled={(current.managementAccess ||current.adminAccess)   ? false  : true} defaultChecked={text} onChange={(e) => onChangeCheckbox(row, e.target.checked) }/>
              </div>
            )
          };
        },
      })
    }

   
    if (obj.type == "irb" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
               {text && text.length > 8 ? 
                  <Tooltip title={text}>
                    {text && text.split(',')[0]} ... 
                    
                  </Tooltip>
                  :
                  text
                  }
              </div>
            )
          };
        },
      })
    }

    if (obj.type == "tooltip" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                {text && text.length > 50 ? 
                  <Tooltip title={text}>
                    {text.substring(0,50)} ... 
                    
                  </Tooltip>
                  :
                  text
                  }
              </div>
            )
          };
        },
      })
    }

    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems  );

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  const dateFormat = 'YYYY/MM/DD';
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  
  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

  useEffect(() => {

    if (items.length > 0) {
      getItems(items)
      setDataSource(items)
    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {    
  
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    
    filteredArray = (filteredArray.map((data) => {
      if(data.column) {
        delete data.column.filters  
        return data
      }
      
    }))


    


    const option = {
      page: pagination.current || 1,
      filter: JSON.stringify(filters) || JSON.stringify({}),
      sorter: sorter ? JSON.stringify(filteredArray) : JSON.stringify([])
    };

    filters.sort = (filteredArray);

    


    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list(entity, option));

  };

  const loadTable = () => {

    items = []
    setDataSource([])
    let filterValue = {};
    

    getFilterValue(filterValue);

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: JSON.stringify( filterValue),
      sorter: JSON.stringify([])
    };


    dispatch(crud.list(entity, option));

  }

  useEffect(() => {
    setDataSource([])
    loadTable() 

  }, []);



  useEffect(() => {
   items = []
  },[entity])

  useEffect(() => {

    if(dataSource.length == 0) {
      return 
    }

    if (reload) {

      if (previousEntity == entity) {
        handelDataTableLoad(pagination, filters, sorters)
      } else {
        handelDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])



  const columns = newDataTableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }




    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const closeExportModal = () => {
    setOpenExportModal(false)
  }


  const modalConfig = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };

  
  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  return (
    <div className= { "wq-fixed-table"}>
          <Row gutter={[24,24]}>
            <Col span={12}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
            <Col span={12}  style={{textAlign :"end"}}>

            <Button style={{  marginRight: "5px", }} size="small" onClick={exportTable} key={`${uniqueId()}`}>
                <CloudDownloadOutlined />
              </Button>
              {
                AddIcon ? 
                <Button size="small" onClick={() =>openingModal()}>
                  <IdcardOutlined/>
                </Button>
                :  null
              }
                

            </Col>
          </Row> 
          
      <Table
        columns={ columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        scroll={{ y:  'calc(100vh - 20.5em)' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}

        
        footer={
          () => (
            <Row gutter={[24, 24]} style={{minHeight: "25px "}}>
              <Col style={{ width: "150px" }}>
              

              </Col>
            </Row>
          )
        }
      />
    
    

    <div className="confirm-modal">
        <Modals config={modalConfig }>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeConfirmModal()}>No</Button>

          </div>
        </Modals>
      </div>
    </div>
  );
}
