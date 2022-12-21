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
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import NestedDataTable from "@/components/NestedDataTable";
import Header from "./header";

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

// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());


export default  forwardRef(({config}) => {

  const [previousEntity, setPreviousEntity] = useState('');
  const [activeRowID, setActiveRowID]= useState('')


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

    if (obj.feature == "amount" ) {
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
                 : ''}
               

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

  var { pagination, items , filters, sorters , extra = {}} = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = visible => {
    setVisible( visible );
  };

  

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {

      let data = items.map((i, index) => {
        i.Key = index + 1
        i.ID = index+ 1
        return i
      })

        setDataSource(data)
        getItems(data)
  }, [items])

  const dispatch = useDispatch();


  const expandedRowRender = (record) => { 
    const columns = [
      { title: <span style={{marginLeft: "10px"}}>HCPC Code</span>, dataIndex: 'HCPC Code', key: 'HCPC Code' , width: 120, align: 'center',},
      { title: 'Proc Description', dataIndex: 'Proc Description', key: 'Proc Description' , width: 70, align: 'center'},
      { title: 'Quantity', dataIndex: 'Quantity', key: 'Quantity' , width: 130, align: 'center'},
      { title: 'Charge Amount', dataIndex: 'Charge Amount', key: 'Charge Amount' , width: 120,align: 'center'},
      { title: 'Charge File to', dataIndex: 'Charge File to', key: 'Charge File to' , width: 120,align: 'center'},
      { title: 'R or S', dataIndex: 'R or S', key: 'R or S' , width: 100,align: 'center'},
      { title: 'Biller Reviewed', dataIndex: 'Biller Reviewed', key: 'Biller Reviewed', width: 150 },
      { title: 'Misc2', dataIndex: 'Misc2', key: 'Misc2', width: 0 }

    ];


    return (
      <div className="nested-table">
          <NestedDataTable  dataTableColumns={columns} entity={entity} record={record}/>    

      </div>
    )
  }

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

    dispatch(crud.list1(entity, option));
    filters.sort = (filteredArray);


  };


  const searchTable = (values) => {
    if (!filters) {
      filters = {}
    }
    filters['Denial Date'] = values

    handelDataTableLoad(pagination, filters, sorters)
  }

  const loadTable = () => {
    
    let filters = {}


    
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

  const onExpandRow = () => {
    // setActiveRowID(record['Claim ID'])
  }

  const headerConfig = {
    dataTableTitle,
    searchTable
  }
  
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
         <Header config={headerConfig} />

<Table
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {   
            return "wq-rows"
        }}
        // rowClassName={setRowClassName}
        scroll={scroll}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        expandable={{
          expandedRowRender,
          onExpand: onExpandRow
        }}
      
      />
     
    </div>
  );
})
