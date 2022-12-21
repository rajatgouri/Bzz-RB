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
  Select,
  Col
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, CloudDownloadOutlined, EyeFilled, ReloadOutlined, SettingOutlined } from "@ant-design/icons";
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
import Modals from "@/components/Modal";



var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date(utcDate)

const { Option } = Select



export default function DataTable2({ config }) {

  const inputColorRef = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)

  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked } = config;

  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState('ALL');


  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  useEffect(() => {
    console.log(users)
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

    if (obj.dataIndex == "DateTime") {
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
                {text ? text.split("T")[0] + " " + (text.split("T")[1] ? text.split("T")[1].substr(0, 8) : '') : ""}
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

  // var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  // var { pagination, items, filters, sorters } = listResult;

  const [listResult, setListResult] = useState({
    pagination: {},
    filters: {},
    sorters: [],
    items: []
  });
  const [listIsLoading, setListIsLoading] = useState(true);
  var [pagination, setPagination] = useState({})
  var [items, setitems] = useState([])
  var [filters, setFilters] = useState({})
  var [sorters, setSorters] = useState([])


  const [dataSource, setDataSource] = useState([]);

  const { current } = useSelector(selectAuth);

  const [loading, setLoading] = useState(true)
  const [loading1, setLoading1] = useState(true)

  const [dateTotal, setDateTotal] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);


  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if (listResult.success) {
      setitems(listResult.result)
      setPagination({
        current: parseInt(listResult.pagination.page, 10),
        pageSize: 100,
        showSizeChanger: false,
        size: "small",
        total: parseInt(listResult.pagination.count, 10),
      })
      setSorters(listResult.sorters)
      setFilters(listResult.filters)

    }

  }, [listResult])

  const addDays = (date, days = 1) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const dateRange = (start, end, range = []) => {
    if (start > end) return range;
    const next = addDays(start, 1);
    return dateRange(next, end, [...range, start]);
  };


  const getServerSideData = async (entity, option) => {
    setListIsLoading(true)
    let response = (await request.list(entity, option))
    setListResult(response)

    setListIsLoading(false)
  }

  const getUppertabledata = async () => {

    const response = await request.list(entity + "full")

    setLoading1(false)
    let items = response.result


    let usersList = items.map((item) => item.UserName);
    const usersLi = [...new Set(usersList)];
    const rowData = []

    const columnsList = [
      {
        title: 'Full Name',
        width: 150,
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        render: (text, row) => (

          <div className="box-header">
            <div className="row-30 font-special" >{row.name}</div>
            <div className="row-30" style={{ fontWeight: "500" }}> Duration Total</div>
            <div className="row-30" style={{ fontWeight: "500" }}>Between Total</div>

          </div>
        ),
      }
    ];

    let columnCount = 0;

    let date = ([...new Set(items.map(item => item.Date))].sort())

    // if (date[date.length - 1]) {

      let endDate = (date[0].split('T')[0])
      let startDate = (getDate().split('T')[0])

      const range = dateRange(new Date(endDate), new Date(startDate));
      date = range.map(date => date.toISOString().slice(0, 10)).sort()

      usersLi.map((user, index) => {
        let data = items.filter(item => item.UserName == user)
        // let date = data.map((data) => data.Date)
        let dateList = [...new Set(date)];

        let obj = {
          key: index + 1,
          name: user,
        }

        dateList.map((date, i) => {


          let datalist = data.filter(d => {
            return d.Date.split('T')[0] == date
          })

          if(datalist.length > 0) {
            datalist.map(li => {
              obj['column' + i] = { "Duration": li.Duration, "Date": date, "Between": li.DiffInSeconds }
            })
          } else {
            obj['column' + i] = { "Duration": '-', "Date": date, "Between": '-' }

          }
          
        })

        rowData.push(obj)

      })


      for (let i = [...new Set(date)].length - 1; i >= 0; i--) {

        columnsList.push({
          title: 'Column' + i + 1,
          dataIndex: 'column' + i,
          key: i + 1,
          width: 120,
          render: (text, row) => {

            if (row['column' + i] ? row['column' + i]['Date'] : false) {
              return (
                <div className="box-header">
                  <div className="row-30" style={{ fontWeight: "700" }}>{row['column' + i] && row['column' + i]['Date'] ? row['column' + i]['Date'].toString().split("T")[0] : "-"}</div>
                  <div className="row-30" style={{ fontWeight: "500" }}>{row['column' + i] && row['column' + i]['Duration'] ? row['column' + i]['Duration'] : "-"}</div>
                  <div className="row-30" style={{ fontWeight: "500" }}>{row['column' + i] && row['column' + i]['Between'] ? row['column' + i]['Between'] : "-"}</div>
                </div>
              )
            }

          },
        },
        )
      }


      setDateTotal(rowData)
      setDateColumns(columnsList)
    // }
    if (inCopiedMode) {
      selectAllRows(items)
    }
  }

  useEffect(() => {

    if (items.length > 0) {
      getItems(items)
      setDataSource(items)
    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {


    setDataSource([])

    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }



    if (!filters.hasOwnProperty('UserName')) {
      filters['UserName'] = process == "ALL" ? users.map((user) => user.name) : [process]
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

    // dispatch(crud.list(entity, option));
    getServerSideData(entity, option)

  };


  const closeExportModal = () => {
    setOpenExportModal(false)
  }


  const loadTable = () => {

    let filterValue = JSON.stringify({ 'UserName': process == "ALL" ? users.map((user) => user.name) : [process] })

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filterValue,
      sorter: JSON.stringify([])
    };

    // dispatch(crud.list(entity, option));
    getServerSideData(entity, option)
  }

  useEffect(() => {

    loadTable()
    getUppertabledata()



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
    const value = e;
    setProcess(value)
    handelDataTableLoad(1, { 'UserName': value == "ALL" ? users.map((user) => user.name) : [value] }, {})
  }


  const closeConfirmModal = () => {
    setOpenExportModal(false)
  }

  const onExports = async () => {
    notification.success({message:"Downloading..."})
    let response = await request.list(entity + "-exports")
    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  const modalConfig6 = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };

  return (
    <div className="logger-table">
    
       <div style={{ 'display': 'block', marginBottom: "15px" }}>
        <h2
          className="ant-page-header-heading-title"
          style={{  width: "68%", display: "inline-block" }}
        >
          {dataTableTitle}

        </h2>
        <div style={{ width: "30%", display: "inline-block", textAlign: "end" }}>
          <Button title="Export" style={{ marginLeft: "10px", marginTop: "2px" }} size="small" size="small" >
            <CloudDownloadOutlined onClick={() => onExports()} />
          </Button>
        </div>
      </div>
      <div class="table-header">
        {
          <Table columns={dateColumns} loading={loading1 ? true : false} dataSource={dateTotal} pagination={false} scroll={{ x: 110, y: 80 }} />
        }
      </div>
      <Table
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: '220px' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]}>
              <Col style={{ width: "150px" }}>
                {
                  showProcessFilters ?
                    <div>
                      {
                        <Select value={process} style={{ width: "100%", textAlign: "left" }} className="box-shadow" placeholder="User Name" onChange={onProcessChanged}>
                          <Option key={100} value="ALL" >ALL</Option>
                          {
                            users.map((user, index) => {
                              return <Option key={index} value={user.name}>{user.name}</Option>
                            })
                          }
                        </Select>
                      }
                    </div>
                    : null
                }
              </Col>
            </Row>
          )
        }
      />

      <div className="confirm-modal">
        <Modals config={modalConfig6}>
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
