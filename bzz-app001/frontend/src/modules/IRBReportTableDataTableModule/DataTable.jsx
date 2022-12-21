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
Tooltip
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { irb } from "@/redux/irb/actions";
// import { selectIrbsList } from "@/redux/irb/selectors";
import { CloseCircleTwoTone } from "@ant-design/icons";
import moment from 'moment';
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
  EllipsisOutlined,
  CopyOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { formatDate } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import { selectIrbsList } from "@/redux/irb/selectors";

// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());


export default  forwardRef(({config}) => {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');


 

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
    handleRowClick =  () => {},
    addModal = false
  } = config;
  




  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  useImperativeHandle(ref, () => ({

    onProcessChanged (e, v)  {
      const value = e
      setProcess(value)
      let obj = {}
      obj[processKey] = [value]
      handelDataTableLoad(1, obj, {})
    }

  }));
  
  const newDataTableColumns = dataTableColumns.map((obj) => {

   if (obj.dataIndex == "Notes") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
           
            children: (
              <div>
                { <EditOutlined onClick={() => openEditModal(row.ID)} /> }   {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
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

    if (obj.feature == "dollor") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                textAlign: "left",
                textTransform: "uppercase"
              },
            },
            children: (
              <div>
                $ {text}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Target IRB") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                textAlign: "left",
                textTransform: "uppercase"
              },
            },
            children: (
              <div>
                {text }
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

                  <Radio.Group size="small" className="custom-tripple-check"  defaultValue={text} buttonStyle="solid" onChange={(e) => {
                    onRowMarked('Correct', row, e.target.value)
                  }}>
                    <Radio.Button  value={1}>|</Radio.Button>
                    <Radio.Button  value={null}>|</Radio.Button>
                    <Radio.Button  value={0}>|</Radio.Button>
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
                {text} <CopyOutlined onClick={() => copy(row.ID, text, true, obj.title)} />
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



    if (obj.type == "datetime") {
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

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectIrbsList  );

  var { pagination, items , filters, sorters , extra = {}} = listResult;
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
        setDataSource(items)
        getItems(items)
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

    dispatch(irb.list1(entity, option));
    filters.sort = (filteredArray);


  };

  const loadTable = () => {
    
    let filters = {}

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filters,
      sorter: []
    };

    

    dispatch(irb.list1(entity, option));

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
            <Col span={6}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {/* {dataTableTitle} */}
              </h2>
              </div>
            </Col>
            <Col span={18}  style={{textAlign :"end"}}>
            
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
        onRow={handleRowClick}

      />
     
    </div>
  );
})
