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
  Row,
  Col
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, ReloadOutlined, SettingOutlined } from "@ant-design/icons";
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
// import { filter } from "@antv/util";
import { getDate, getDay } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = getDate()

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}

      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const radius = 10;

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};

export default function DataTable({ config }) {

  const inputColorRef = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [EMPID, setUserID] = useState(1);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked } = config;

  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState('ALL');


  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  useEffect(() => {
  }, [users])

  function copy(id, textToCopy) {
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
      notification.success({ message: "MRN Copied!", duration: 3 })
      onCopied(id, textToCopy)
      onCopiedEvent(textToCopy)
      // handelDataTableLoad(1,  {'Patient MRN': textToCopy}, {})

      // handelDataTableLoad()
      // setSelectedRowKeys([id]);
    });
  }

  const onCopiedEvent = (textToCopy) => {
    handelDataTableLoad(1, { 'Patient MRN': [textToCopy] }, {})
    setInCopiedMode(true)
  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "First(Datetime)" || obj.dataIndex == "Last(Datetime)") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text ? text.split("T")[0]  + " " + (text.split("T")[1] ? text.split("T")[1].substr(0,8) : '')   : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Date") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text ? text.split("T")[0]  : ""}
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
          props: {
            style: {
              background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
              color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
            },
          },
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items, filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);

  const { current } = useSelector(selectAuth);

  const [loading, setLoading] = useState(true)
  const [dateTotal, setDateTotal] = useState([]);
  const [dataTableColumns1, setDataTableColumns1] = useState([]);

  
  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  useEffect(() => {

    if (items.length > 0) {
      // getItems(items)
      // setDataSource(items)

      let usersList = items.map((item) => item.BillerName);
      const usersLi = [...new Set(usersList)];
      const rowData = [];

      const columnsList = [
        {
          title: 'Date',
          width: 150,
          dataIndex: 'Date',
          key: 'Date',
          
        }
      ];

      let columnCount = 0;

      // usersLi.map((user, i) => {
      //   console.log(user)
      //   columnsList.push( {
      //     title: user,
      //     children: [
      //       {
      //         title: 'Duartion',
      //         dataIndex: 'Duration',
      //         key: 'Duration',
      //         width: 150,
      //       },
      //       {
      //         title: 'Between',
      //         dataIndex: 'Between',
      //         key: 'Between',
      //         width: 150,
      //       },
      //     ]
      //   },
      //  )  

      // })

      // usersLi.map((user, index) => {
      //   let data =  items.filter(item => item.BillerName == user)

      //   let date = data.map((data) => data.Date)
      //   let dateList = [...new Set(date)];

      //   let obj = {
      //     key:index+ 1,
      //     name: user,
      //   }

      //   dateList.map((date, i) => {

      //     let datalist = data.filter(d => d.Date == date )
          
      //     let totalDuration = 0;
      //     let totalBetween = 0;


      //     datalist.map(li => {

              
      //         let timeParts = li.Duration ? li.Duration.split(' ') : []
      //         let betweenParts = li.Between ?  li.Between.split(' ') : []

      //         for(let i = 0 ; i< betweenParts.length ; i++) {

      //           if(betweenParts[i].match(/s/g)) {
      //             totalBetween +=  +betweenParts[i].replace('s', '')
      //           }
                
      //           if(betweenParts[i].match(/m/g)) {
      //             totalBetween +=  +betweenParts[i].replace('m', '') * 60
      //           }

      //           if(betweenParts[i].match(/h/g)) {
      //             totalBetween +=  +betweenParts[i].replace('H', '') * 3600
      //           }
      //         }

      //         for(let i = 0 ; i< timeParts.length ; i++) {

      //           if(timeParts[i].match(/s/g)) {
      //             totalDuration +=  +timeParts[i].replace('s', '')
      //           }
                
      //           if(timeParts[i].match(/m/g)) {
      //             totalDuration +=  +timeParts[i].replace('m', '') * 60
      //           }

      //           if(timeParts[i].match(/h/g)) {
      //             totalDuration +=  +timeParts[i].replace('H', '') * 3600
      //           }
      //         } 


      //     })

          
      //     console.log(totalDuration)
      //     console.log(totalBetween)

      //     let fullDuration = ''
      //     let fullBetween = ''
      //     // _______________Duration_____________ //
      //     let hour = totalDuration /3600;
      //     fullDuration += parseInt(hour) + "H "

      //     let minutes =   +hour.toFixed(2).toString().split('.')[1] * 0.6
      //     fullDuration += parseInt(minutes) + "m "

      //     let second =  parseInt(+minutes.toFixed(2).toString().split('.')[1] * 0.6 );  
      //     fullDuration += parseInt(second) + "s "


      //     // _______________Between_____________ //
      //     let hour1 = totalBetween /3600;
      //     fullBetween += parseInt(hour1) + "H "

      //     let minutes1 =   +hour1.toFixed(2).toString().split('.')[1] * 0.6
      //     fullBetween += parseInt(minutes1) + "m "

      //     let second1 =  parseInt(+minutes1.toFixed(2).toString().split('.')[1] * 0.6 );  
      //     fullBetween += parseInt(second1) + "s "
          
      //     obj['column' + i] = {"Duration": fullDuration , "Date": date, "Between": fullBetween } 

      //     if(columnCount < i) {
      //       columnCount = i + 1
      //     }
  
      //   })



      //   rowData.push(obj)

      // }) 



      // for(let i=0; i< columnCount ; i++) {
      //   columnsList.push( {
      //     title: 'Column' + i + 1,
      //     dataIndex: 'column' + i,
      //     key: i + 1,
      //     width: 120,
          
      //   },
      //  )  
      // }

      // setDateTotal(rowData)
      // setDataTableColumns1(columnsList)
      
      if (inCopiedMode) {
        selectAllRows(items)
      }

    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {

    items = []
    setDataSource([])
  
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

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
    

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: JSON.stringify([]),
      sorter: JSON.stringify([])
    };

    dispatch(crud.list(entity, option));

  }

  useEffect(() => {

    loadTable()

  }, []);




  useEffect(() => {

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

  useEffect(() => {

    const listIds = items.map((x) => x.ID);
    setTableItemsList(listIds);

  }, [items]);


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
    const value = e.target.value;
    setProcess(value)
    handelDataTableLoad(1, { 'BillerName': value == "ALL" ? users.map((user) => user.name)  : [value] }, {})
  }


  
  // for(let i = 0 ; i <100 ; i++) {
  //   columns1.push( {
  //     title: 'Column' + i + 1,
  //     dataIndex: 'column' + i,
  //     key: i + 1,
  //     width: 120,
  //     render: (text, row) => (
  //       <div className="box-header">
  //           {console.log(row)}
  //         <div className="row-30">{row['column'+ i] ? row['column'+ i]['Date'] : "-" }</div>
  //         <div className="row-30">{row['column' + i] ? row['column' + i]['Duration']: "-"}</div>
  //         <div className="row-30">{row['column' + i] ? row['column' + i]['Between'] : "-"}</div>
  //       </div>
  //     ),
  //   },
  //  )
  // }

  // for (let i = 0 ;i < 5 ;i ++) {
  //   data1.push({
  //     key: i + 1,
  //     name: "anna" + i ,
  //     column0: {date: "2021-10-19", duration: "10s", betweeen: "20s"},
  //     column1: {date: "2021-10-24", duration: "1s", betweeen: "2s"},
  //     column2: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column3: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column4: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column5: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column6: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column7: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column8: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column9: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //     column10: {date: "2021-10-21", duration: "15s", betweeen: "24s"},
  //   });
  // }



  return (
    <div className="wq-daily-productivity">
      
      <Table
        columns={dataTableColumns1}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: 'calc(100vh - 16.3em)' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} >
              <Col style={{ width: "52%"}}>
                <div>Duration SUM of WQ5508 + WQ1075 Duration totals for that day</div>
                <div>Between SUM of WQ5508 + WQ1075 Duration totals for that day</div>
              </Col>
            </Row>
          )
        }
      />
    </div>
  );
}
