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
import {CopyOutlined, EyeFilled, CloudDownloadOutlined } from "@ant-design/icons";
import { formatDate } from "@/utils/helpers";


let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import {
  SortAscendingOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
 
} from "@ant-design/icons";
import { getDate } from "@/utils/helpers";
// import { filter } from "@antv/util";
import uniqueId from "@/utils/uinqueId";
import Modals from "@/components/Modal";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = getDate()

const { Option } = Select


export default function DataTable({ config }) {

  let { entity, dataTableColumns, getItems, reload, getFilterValue, dataTableTitle,  onChangeCheckbox, openEditModal, openAddModal, openPdf, isLoading, refresh, openSortModal, onChangeTab = () => {}, onChangeSubTab = () =>{}, defaultProcess  , defaultSubProcess  } = config;


  const [process, setProcess] = useState();
  const [subProcess, setSubProcess] = useState();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)


  useEffect(() => {
    setProcess(defaultProcess)
    setSubProcess('')
    defaultSubProcess = ''
    loadTable()
    debugger
  }, [defaultProcess])

  useEffect(() => {
    setSubProcess(defaultSubProcess)
    loadTable()
  }, [defaultSubProcess])

  


  useEffect(() => {
    if (isLoading) {
      setLoading(isLoading)
    } else {
      loadTable()
    }
  }, [isLoading])

  function copy(id, textToCopy, title) {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
      notification.success({ message: title + " copied!", duration: 3 })

     

    });
  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

   
 
     if (obj.feature == "Notes") {
       return ({
         ...obj,
         render: (text, row) => {
           return {
             
             children: (
               <div className="">
                  <EditOutlined onClick={() => openEditModal(row.ID, obj.dataIndex, obj.title)} />    
                  <EyeFilled onClick={() => openAddModal(row.ID, obj.dataIndex)} style={{ marginLeft: "10px" , color: text ? "black" : "lightgrey" }} /> 
                  <CopyOutlined style={{ marginLeft: "10px",  color: text ? "black" : "lightgrey"}} onClick={() => copy(row.ID, text, obj.title)} />


               </div>
             )
           };
         },
       })
     }


     if (obj.feature == "checkbox" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div style={{textAlign : "center"}}>
                <Checkbox style={{marginLeft: "-10px"}}  defaultChecked={text == 'Yes' ? true : false} onChange={(e) => {
                 
                  onChangeCheckbox(row, obj.dataIndex ,e.target.checked)
                } }/>
              </div>
            )
          };
        },
      })
    }

     if (obj.dataIndex == "Error") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            
            children: (
              <div className="">
                 Yes

              </div>
            )
          };
        },
      })
    }
 
     if (obj.feature == "date") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
              }
            },
            children: (
              <div>
                {text ?
                  formatDate(text.toString().split('T')[0])
                  : null}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "datetime") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                {text ?


                  text.split("T")[0].split('-')[1] + "/" +
                  text.split("T")[0].split('-')[2] + "/" +
                  text.split("T")[0].split('-')[0]

                  + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    }
 
 
    
     if (obj.feature == "checkmark" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div style={{textAlign : "center"}}>
                <Checkbox style={{marginLeft: "-10px"}}  defaultChecked={text == 'Yes' ? true : false} onChange={(e) => onChangeCheckbox(row, obj.dataIndex ,e.target.checked, defaultProcess) }/>
              </div>
            )
          };
        },
      })
    }
    
 
     if (obj.feature == "copy" ) {
       return ({
         ...obj,
         render: (text, row) => {
           return {       
            
             children: (
               <div>
                 {text ? 
                 <div>
                   {text} <CopyOutlined onClick={() => copy(row.ID, text, obj.title)} />
                   </div>
                 : ""} 
               </div>
             )
           };
         },
       })
     }
 
     if (obj.feature == "center" ) {
       return ({
         ...obj,
         render: (text, row) => {
           return {       
            
             children: (
               <div style={{textAlign: "center"}}>
                 {text}
               </div>
             )
           };
         },
       })
     }
 
 
     if (obj.type == "tooltip") {
       return ({
         ...obj,
         render: (text, row) => {
           return {
            
             children: (
               <div>
                 <Tooltip placement="topLeft" title={text}>
                   {text && text.length > 25 ? text.substring(0, 25) + "..." : text}
                 </Tooltip>
               </div>
             )
           };
         },
       })
     }
 
     if (obj.type == "date") {
       return ({
         ...obj,
         render: (text, row) => {
           return {
            
             children: (
               <div>
                 {text ?
                   formatDate(text.toString().split('T')[0])
                   : null}
               </div>
             )
           };
         },
       })
     }
 
     if (obj.feature == "dollor" ) {
       return ({
         ...obj,
         
         render: (text, row) => {
           return {        
                 
             children: (
               <div >
 
                  { text?   
                   "$" + new Intl.NumberFormat('en-US',  {
                     minimumFractionDigits: 2,
                     maximumFractionDigits: 2,
                   }).format(text)
                  : 0}
                
 
               </div>
             )
           };
         },
       })
     }
 
 
 
     if (obj.feature == "datetime") {
       return ({
         ...obj,
         render: (text, row) => {
           return {
             children: (
               <div>
                 {text ?
 
 
                   text.split(" ")[0].split('-')[1] + "/" +
                   text.split(" ")[0].split('-')[2] + "/" +
                   text.split(" ")[0].split('-')[0]
 
                   + " " + text.split(" ")[1]?.substring(0, 8) : ""}
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
             text,
         };
       },
     })
   });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items, filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
 


  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {

    if (items.length > 0) {
      getItems(items)
      setDataSource(items)
    } else {
      setDataSource([])
    }
  }, [items])


  const formatTime1 = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div>
        <span >{getHours} </span> :  <span>{getMinutes}</span> : <span>{getSeconds}</span>

      </div>
    )
  }

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
      }
      return data
    }))


    delete filters['undefined']

   

    

    getFilterValue(filters);

    let filteredObject = {}
    for (let f in filters) {

      if(!filters[f]) {
        continue
      }
      let type = columns.filter((c) => c.dataIndex == f)[0].type 
      filteredObject[f] = {value: filters[f], type: type ? type : ''}
    }

    filteredObject.Error = {value: ['0'] , type: "boolean"}

    

    const option = {
      page: pagination.current || 1,
      filter: filteredObject || {},
      sorter: sorter ? (filteredArray) : [],
    };

    dispatch(crud.list1(entity, option));

   
    filters.sort = (filteredArray);

  };

  const loadTable = () => {
    
    let filters = {}
      
    filters.Error = {value: ['0'] , type: "boolean"}

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filters,
      sorter: []
    };

    

    dispatch(crud.list1(entity, option));

    
      getFilterValue(filters);
  }

  useEffect(() => {

    loadTable()


  }, []);



  useEffect(() => {
    items = []
  }, [entity])

  useEffect(() => {

    if (dataSource.length == 0) {
      return
    }

    if (reload) {

        loadTable(pagination, {}, {})

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


  const onProcessChanged = (e) => {
    dispatch(crud.resetState());
    onChangeTab(e)
  }

  const onSubProcessChanged = (e) => {
    onChangeSubTab(e.target.value)

  }


  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {
        setSelectedRowKeys([record.ID]);
      }
    };
  };

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: '#f1f1f1',
        },
      },
      // children: originNode,
    };
  };

  const onSelectChange = (selectedKeys, selectedRows) => {
    setSelectedRowKeys(selectedKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    hideSelectAll: true,
    columnWidth: 0,
    renderCell: handelColorRow,
    selectedRowKeys: selectedRowKeys,
  };


  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
  }

  const modalConfig = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };


  return (
    <div className={ "wq-fixed-table"}>
      <Row gutter={[24, 24]}>
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
        <Col span={12} style={{ textAlign: "end" }}>

          
      

          {
            refresh ?
              <Button size="small" style={{ marginLeft: "10px" }} onClick={() => loadTable()}>
                <ReloadOutlined />
              </Button>
              : null
          }

         

        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y:  'calc(100vh - 21em)' }}
        // scroll={{ x: 2000, y: 500 }}
        rowSelection={rowSelection}
        onRow={onClickRow}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        

        footer={
          () => (
            <Row gutter={[24, 24]} style={{ minHeight: "25px " }}>
              <Col style={{ width: "250px" }}>
                
                <Radio.Group style={{marginRight: "2px"}} value={process} >
                    <Radio.Button style={{ marginRight: "5px" }} value="WQ5508" className="box-shadow" onClick={() => onProcessChanged('WQ5508')}>WQ5508</Radio.Button>
                    <Radio.Button  style={{ marginRight: "5px" }} value={"WQ1262"} className="box-shadow" onClick={() => onProcessChanged('WQ1262')}>WQ1262</Radio.Button>
              </Radio.Group>


            

              </Col>
            </Row>
          )
        }
      />



<div className="confirm-modal">
        <Modals config={modalConfig}>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExportModal()}>No</Button>

          </div>
        </Modals>
      </div>

    </div>
  );
}
