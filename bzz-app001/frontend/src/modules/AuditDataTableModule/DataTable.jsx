import React, {forwardRef, useContext, useCallback, useEffect, useState, useRef , useImperativeHandle } from "react";
import {
  Button,
  Table,  
  Radio,
  Popover,
  Select,
  Row,
  Col,
  DatePicker,
Tooltip,
notification,
Checkbox,

} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import DigitalBG from "../../assets/images/digital-background.png";

import {
  EyeOutlined,
  EditOutlined,
  EyeFilled,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined,
  CopyOutlined,
  CloseOutlined,
  CloudDownloadOutlined ,
  SortAscendingOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { formatDate, getDate } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Modals from "@/components/Modal";

// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());


export default  forwardRef(({config}) => {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [seletcedID, setSelectedID] = useState();
  const [startTime, setStartTime] = useState();

  let { 
    entity, 
    dataTableColumns, 
    getItems = () => {}, 
    reload = true,  
    getFilterValue= () => {}, 
    dataTableTitle , 
    footer = () => {},
    openingModal = () => {},
    classname= '', 
    scroll = {y: 'calc(100vh - 20.5em)'} ,
    confirmModal = () => {}, 
    AddIcon = false,
    summary = () => {},
    onRowMarked= () => {},
    openEditModal = () => {},
    openAddModal= () => {},
    ref,
    setProcess= () => {},
    processKey,
    process,
    setSubProcess= () => {},
    subProcessKey,
    subProcess,
    setSubProcess2= () => {},
    subProcessKey2,
    subProcess2,
    handleRowClick =  () => {},
    addModal = false,
    openSortModal = () => {},
    onChangeCheckbox  =() => {},
    KPIs = [],
    openDeleteModal = () => {},
    updateTime = () => {}
    
  } = config;
  




  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  


  useImperativeHandle(ref, () => ({

    onProcessChanged (e, v)  {
      const value = e
      setProcess(value)
      setSubProcess('null')
      let obj = {}
      obj[processKey] = [value]
      obj[subProcessKey] = ['null']
      obj[subProcessKey2] = ['null']


      handelDataTableLoad(1, obj, {})
    },

    onSubProcessChanged (e, v)  {
      const value = e
      setSubProcess(value)
      setSubProcess2('null')
      let obj = {}
      if(value == 'Yes') {
        obj[subProcessKey] = ['Yes' ,'No']
      } else {
        obj[subProcessKey] = [value]

      }
      obj[processKey] = [process]
      
      if(entity == 'hbwqaudit') {
        obj[subProcessKey2] = ['null']
      }
     
      handelDataTableLoad(1, obj, {})
    },

    onSubProcess2Changed (e, v)  {
      const value = e
      setSubProcess2(value)
      let obj = {}
     
      filters[subProcessKey2] = [value]

      handelDataTableLoad(1, {...filters}, {})
    }

  
  }
  
  
  ));
  

  
  
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
      onCopiedEvent(textToCopy, filter)

     

    });
  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

   if (obj.dataIndex == "Notes") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
           
            children: (
              <div>
                { <EditOutlined onClick={() => openEditModal(row.ID)} /> }   {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""} {text ? <CopyOutlined  style={{ marginLeft: "10px" }} onClick={() => copy(row.ID, text, obj.dataIndex)} /> : ""}   {text ? <DeleteOutlined  style={{ marginLeft: "10px" }} onClick={() => openDeleteModal(row.ID)} /> : ""} 
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "Notes") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            
            children: (
              <div>
               {row['Error'] ? <EditOutlined onClick={() => openEditModal(row.ID)} /> : null   }   {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
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
                  if(startTime) {
                    updateTime(row.ID, { StartTimeStamp: startTime, FinishTimeStamp: getDate(), Duration: (new Date(getDate()) - new Date(startTime)).toString() }, () => {})

                  }

                  setStartTime(null)
                  onChangeCheckbox(row, obj.dataIndex ,e.target.checked)
                } }/>
              </div>
            )
          };
        },
      })
    }
   

    if (obj.dataIndex == "Correct") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
               
                textAlign: "center"
              },
            },
            children: (
              <div style={{marginTop: "10px"}}>

                  <Radio.Group size="small" className={
                    text == 'Yes' ? 'custom-color-check-green':
                    text == 'No' ? 'custom-color-check-red' :
                    'custom-color-check-default'
                  }  defaultValue={text ? text : null} buttonStyle="solid" onChange={(e) => {
                    if(startTime) {
                      updateTime(row.ID, { StartTimeStamp: startTime, FinishTimeStamp: getDate(), Duration: (new Date(getDate()) - new Date(startTime)).toString() }, () => {})

                    }

                    setStartTime(null)
                    onRowMarked('Correct', row, e.target.value, process)
                  }}>

                    <Radio.Button  value={'Yes'}></Radio.Button>
                    <Radio.Button  value={null }></Radio.Button>
                    <Radio.Button  value={'No'}></Radio.Button>
                  </Radio.Group>
                {/* {text ? <img src={GreenDot} width="14px" height="9px" onClick={() => onRowMarked('Correct', row, false)} /> : <img src={WhiteDot} width="10px"  onClick={() => onRowMarked('Correct',row, true)} />} */}
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
                  {text} <CopyOutlined onClick={() => {
                    if(obj.dataIndex == 'PAT_MRN_ID' || obj.dataIndex == 'MRN') {
                      setSelectedID(row.ID)
                      setStartTime(getDate())
                    }
                      copy(row.ID, text, obj.title)
                  }} />
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

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems  );

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  const [dateValue, setDateValue] = useState(moment())
  const [tableColumns, setTableColumns] = useState([])
  const dateFormat = 'YYYY/MM/DD';
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = visible => {
    setVisible( visible );
  };

  
  const text = <div><span className="float-left">{addModal ? addModal.title : ""}</span><span className="float-right" onClick={() => handleVisibleChange(false)}><CloseOutlined/></span></div>;
  const content = addModal ?  addModal.content : "";
  

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {
    if(items.length > 0) {
      setDataSource(items)
      getItems(items)

      setRowBackgroundColor(items)
    } else {
      setDataSource([])
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
      }
      return data
    }))

    debugger

    delete filters['undefined']
    if ( !filters.hasOwnProperty(processKey) && entity == 'wqaudit') {
      filters[processKey] =  [process]
    } else if ( !filters.hasOwnProperty(subProcessKey) && entity == 'wqaudit') {
      filters[subProcessKey] =  [subProcess]
    }
    else  if ( !filters.hasOwnProperty(subProcessKey) && entity == 'hbwqaudit') {
      filters[subProcessKey] =  [subProcess]
    }   else  if ( (!filters.hasOwnProperty(subProcessKey2) || filters[subProcessKey2].length == 0) && entity == 'hbwqaudit') {
      filters[subProcessKey2] =  [subProcess2]
    } 

    setSorter(filteredArray)

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    let filteredObject = {}
    for (let f in filters) {
      let type = columns.filter((c) => c.dataIndex == f)[0].type 
      filteredObject[f] = {value: filters[f], type: type ? type : ''}
    }

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
    if(entity == 'wqaudit') {
      filters[processKey] = {value: [process] , type: 'filter'}
      filters[subProcessKey] = {value: [subProcess] , type: 'filter'}

    } else if (entity == 'hbwqaudit') {
      filters[subProcessKey] = {value: [subProcess] , type: 'filter'}
      filters[subProcessKey2] = {value: [subProcess2] , type: 'filter'}

    }
    
    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filters,
      sorter: []
    };

    

    dispatch(crud.list1(entity, option));

    for (let i in filters) {
      filters[i] = filters[i].value
    }

      getFilterValue(filters);

  }

  useEffect(() => {

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

      setVisible(false)

    } else {
      setLoading(true)
    }

  }, [reload])


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


  const onClickRow = (record, rowIndex) => {

    return {
      onClick: () => {
        setSelectedRowKeys([record.ID]);
        handleRowClick(record)

      },
      onMouseDown: (e) => {
      }

    };
  };

  const setRowBackgroundColor = (items) => {
    const tmpObj = {};
    items.map(({ ID, Color }) => {
      tmpObj[ID] = Color
    });

    setColoredRow({ ...coloredRow, ...tmpObj });
  }

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: coloredRow[record.ID] ? coloredRow[record.ID] : "",
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

  return (
    <div className= {classname}>
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

    {
      KPIs.length > 0 ? 
      <div className="inline">
        <div className="inline">
          <h4 className="sub-header">
            <span style={{fontSize: "20px", fontWeight: 700, marginRight: "7px"}}>Need Review</span> 
          </h4>
        </div>
      <div className="inline" style={{marginTop: "-10px"}}>
        <img src={DigitalBG} height="50" ></img>
        <div className="text-mini-digital">
          {KPIs[0]['Total']}
        </div>
      </div>
      <div className="inline">
          <h4 className="sub-header">
            <span style={{fontSize: "20px", fontWeight: 700, marginRight: "7px" , marginLeft: "15px"}}>Completed</span> 
          </h4>
        </div>
       <div className="inline" style={{marginTop: "-10px"}}>
       <img src={DigitalBG} height="50" ></img>
       <div className="text-mini-digital">
         {KPIs[0]['Done']}
       </div>
      </div>

     </div>
      : null
    }
            {
               entity !== 'wq-error-audit' ?
                <Button className="ml-3 mr-3" size="small" onClick={() => {
                  openSortModal()
                 }} key={`${uniqueId()}`}>
                   <SortAscendingOutlined />
                 </Button>
                 : null
              }
              {
                AddIcon ? 
                <Button onClick={() =>openingModal()}>
                  <IdcardOutlined/>
                </Button>
                :  null
              }

            {
              entity !== 'wq-error-audit' ?
              <Button className="ml-3" size="small" onClick={exportTable} key={`${uniqueId()}`}>
              <CloudDownloadOutlined />
            </Button> 
            :
            null
            }
                
        <Button className="ml-3" size="small" onClick={loadTable} key={`${uniqueId()}`}>
            <ReloadOutlined/>
          </Button>
            
          {
              addModal && addModal.icon ?
                <Popover placement="rightTop" title={text} visible={visible} onVisibleChange={handleVisibleChange} className="mr-3"  content={content} trigger="click">
                  <Button>
                    {addModal.type === 'image' ? 
                      <img src={addModal.icon} height={16} className="icon"></img>
                      : 
                      addModal.icon
                  } 
                    {/*  */}
                  </Button>
                </Popover>
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
        scroll={scroll}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
        summary={summary}
        footer={footer}
        onRow={onClickRow}
        rowSelection={rowSelection}
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
})
