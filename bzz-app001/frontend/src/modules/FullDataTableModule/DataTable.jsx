

import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import { Select, Button, PageHeader, Table, Checkbox, Dropdown, Input, Form, Badge, notification, Radio, Row, Col, Tooltip as TP } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, UnorderedListOutlined, ExclamationCircleTwoTone, ReloadOutlined, UploadOutlined, SettingOutlined, CloudDownloadOutlined, FileExcelOutlined, SortAscendingOutlined, ConsoleSqlOutlined, CodeSandboxCircleFilled, BlockOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { DollarTwoTone, EyeInvisibleFilled, } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
// import { filter } from "@antv/util";
import CheckerFlags from "../../assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import { getDate, getDay, renderCustomizedLabel } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Modals from "@/components/Modal";
import Cabinet from '@/assets/images/Cabinet.png'
import SheetJS from "@/components/SheetJS";
import ColorListBox from "@/components/ColorlistBox";
import Export from "@/components/Export"
import ExportTable from "@/components/ExportTable";
import Distribution from "@/components/Distribution";
import Header from "./header";
import { WQ5508Details , WQ5508ProcessEnded, WQ5508ProcessStarted } from "@/socket";
import Socket from "../../socket"
import { epic } from "@/redux/epic/actions";


const { Option } = Select

Array.prototype.F = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};


export default function DataTable({ config }) {

  const [timer, setTimer] = useState(0)
  const countRef = useRef(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [allSelectedRowsKeys, setAllSelectedRowsKeys] = useState([])
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [colorList, setColorList] = useState([]);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  const [startTime, setStartTime] = useState()
  const [selectedRowID, setSelectedRowID] = useState();
  const [activeButton, setActiveButton] = useState();
  const [openModal, setOpenModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [startProcess, setStartProcess] = useState(false);
  const [openDoneModal, setOpenDoneModal] = useState(false)
  const [resetRow, setResetRow] = useState({})

  const [openExcelModal, setOpenExcelModal] = useState(false)
  const [clear, setClear] = useState(false)

  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked, getFullList, openFindModal, updateTime, logger, reset, openSortModal } = config;

  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState(entity == "wq1075" ? '60 Days and Over' : 'Expedite');
  const [currentProcess, setCurrentProcess]= useState({})
  const [activeProcesses, setActiveProcesses]= useState([])

  const [endedProcess,setEndedProcess] = useState({})
  const currentProcesses = useRef()
  const copiedMode = useRef()

  currentProcesses.current = []

  const getCurrentDate = () => {
    return getDate()
  }

  const resetClock = () => {
    setActiveButton(null)
    clearInterval(countRef.current)
    setSelectedRowID(null)
    setStartTime(null)
    setTimer(0)
  }



  useEffect(() => {
    copiedMode.current = inCopiedMode 
  }, [inCopiedMode])


  // socket.on("wq5508-process-start", (data) => {

  //   // setcurrentProcesses(prevIds=>{
  //   //   if(!prevIds.includes(data.id)) return [...prevIds,data.id]
  //   //   return [...prevIds]
  //   // })
  //   // let acIds = localStorage.getItem('WQ5508_Active')
  //   // console.log(acIds)
  //   // if(acIds){
  //   //   let acIdsArray = acIds.split(",")
  //   //   if (!acIdsArray.includes(String(data.id))){
  //   //     acIdsArray.push(data.id)
  //   //     localStorage.setItem('WQ5508_Active',acIdsArray.toString())
  //   //   }
  //   // }else{
  //   //   let acIdsArray = [data.id]
  //   //   localStorage.setItem('WQ5508_Active',acIdsArray.toString())
  //   // }


  // })




  // socket.on("wq5508-end", (data) => {
  //   // let updatedIds = currentProcesses.filter(id=>id!=data.id)
  //   // setcurrentProcesses(updatedIds)
  //   // let acIds = localStorage.getItem('WQ5508_Active')
  //   // if(acIds){
  //   //   let acIdsArray = acIds.split(",")
  //   //   if (acIdsArray.includes(String(data.id))){
  //   //     let upIds = acIdsArray.filter(id=>id!=data.id)
  //   //     localStorage.setItem('WQ5508_Active',upIds.toString())
  //   //   }
  //   // }
  // })

  WQ5508ProcessStarted.subscribe(
    value => {
      setCurrentProcess(value)
    },
    err => console.log(err)
  )

  WQ5508ProcessEnded.subscribe(
    value => {
      setEndedProcess(value)
    },
    err => console.log(err)
  )

  useEffect(() => {
      let processes =  currentProcesses.current.slice()
      if (!processes.includes(currentProcess.id)) {
        processes.push(currentProcess.id)
        currentProcesses.current = processes
        setActiveProcesses(currentProcesses.current)
        
       }
   
  }, [currentProcess])

  useEffect(() => {
    let updatedProcesses = currentProcesses.current.filter(id=> id != endedProcess.id)
      currentProcesses.current = (updatedProcesses)
      setActiveProcesses(updatedProcesses)

  }, [endedProcess])

  const handleStart = async (id, row) => {
    if (selectedRowID != null && selectedRowID == id) {
      setActiveButton(null)
      clearInterval(countRef.current)
      setSelectedRowID(null)
      setStartTime(null)
      setTimer(0)
      if (row['Status'] != 'Done') {
        updateTime([id], { StartTimeStamp: null, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Reset')
      }

      Socket.emit("WQ5508-process-end", { id: row['Patient MRN'] })
      return
    } else if ((selectedRowID == id || selectedRowID == undefined)) {


      if (row['Duration'] == null) {

        if (selectedRowKeys.length > 0) {
          // setActiveButton(selectedRowKeys[0])
          countRef.current = setInterval(() => {
            setTimer((timer) => timer + 1)
          }, 1000)
          setSelectedRowID(id);
          let date = getCurrentDate();
          setStartTime(date);

          updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')

        } else {
          //  setActiveButton(id)
          countRef.current = setInterval(() => {
            setTimer((timer) => timer + 1)
          }, 1000)
          setSelectedRowID(id);
          let date = getCurrentDate();
          setStartTime(date);
          updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')
        }
      } else {
        let date = getCurrentDate();
        setStartTime(date);
        updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')
      }

      setSelectedRowID(id);
      copy(id, row['Patient MRN'],row['Svc Date'] , false);
      Socket.emit("WQ5508-process-start", { id: row['Patient MRN'] })

    }

  }


  const handleReset = (id, row) => {
    setResetRow(row)
    Socket.emit("WQ5508-process-end", { id: row['Patient MRN'] })
    if (selectedRowID != id && selectedRowID == id) {
      return
    } else if (selectedRowID == id) {

      setOpenModal(true)

    }

  }



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



  useEffect(() => {
    setPreviousEntity(entity)
    let clock = localStorage.getItem('clock')
    setShowClock(JSON.parse(clock))
  }, [entity])
  /***************/
  const handleColorChange = (color, keys, all) => {
    const tmpObj = {};

    selectedRowKeys.map((x) => {
      tmpObj[x] = color;
    });


    clearInterval(countRef.current)
    setSelectedRowID(null)
    setActiveButton(null)
    setStartTime(null)
    setTimer(0)


    let data = colorList.filter(list => list.color == color)[0]
    let d = data

    if (all) {
      d.text1 = data.text + " All"
    } else {
      d.text1 = data.text
    }

    if (openModal) {
      let date = getCurrentDate();
      updateTime([resetRow.ID], { StartTimeStamp: startTime, FinishTimeStamp: date, 'Patient MRN': resetRow['Patient MRN'], keys: keys, Duration: (new Date(date) - new Date(startTime)).toString() }, () => {
        config.onHandleColorChange(keys, d, selectedRowID)
      }, 'Stop', d)
    } else {
      config.onHandleColorChange(keys, d, selectedRowID)

    }




    setActiveButton(null)

    setColoredRow({ ...coloredRow, ...tmpObj });
    setSelectedRowID(null)
    setOpenModal(false)
    setSelectedRowKeys([]);
  };

  const load = async () => {
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: 'WhenPosted' })



    let fullDate = (getDate().split('T')[0])

    let getTodayResults = (result.filter(res => res['WhenPosted'].split("T")[0] == fullDate));

    const foundOnCalendar = getTodayResults.map(c => {
      return users.findIndex((el) => {
        return el.EMPID == c.LoginNumber
      })
    })

    for (let i = 0; i < foundOnCalendar.length; i++) {
      if (foundOnCalendar[i] >= 0) {
        let userList = users;

        userList[foundOnCalendar[i]].status = 'error'
        setUsers(userList)
      }
    }
  }

  React.useEffect(() => {
    load();

  }, [month, year])



  const mrnFilterAndCopied = () => {
    setMRNFilter(false)
    setInCopiedMode(true)
  }

  const closeDoneModal = () => {
    setOpenDoneModal(false)
  }

  const modalConfig8 = {
    title: "Success",
    openModal: openDoneModal,
    handleCancel: closeDoneModal,
    width: 500
  };





  function copy(id, textToCopy, date= '',  filter) {
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
      onCopiedEvent(textToCopy, filter)

      if(textToCopy) {
      
        if (selectedMRN != textToCopy && date != selectedDate) {
          dispatch(epic.list("epic-data-wq5508",  {id: textToCopy, date: date}));
          // onCollapsed(true)
          setSelectedMRN(textToCopy)
          setSelectedDate(date)
    
        }
      }

      if (filter) {
        setStartProcess(true)
        onCopied(id, textToCopy)

      } else {
        setStartProcess(false)

      }

    });
  }

  useEffect(async () => {
    if (reset) {
      resetClock()
      if (current.managementAccess) {
        delete filters['Patient MRN']
        handelDataTableLoad(pagination = 1, filters, sorters)
      }
    }
  }, [reset])




  const onCopiedEvent = (textToCopy, filter) => {

    if (filter) {
      handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy] }, sorters)

    } else {
      if (current.name == 'Admin') {
        handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy], Status: filters['Status'] ? filters['Status'] : ['Review', ''] }, sorters)
      } else {
        handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy] }, sorters)
      }
    }

    setInCopiedMode(true)
  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "Notes") {
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
                {row['Error'] ? <EditOutlined onClick={() => openEditModal(row.ID)} /> : null}   {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "StartTimeStamp" || obj.dataIndex == "FinishTimeStamp") {
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
                {text ? text.split("T")[0] + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "tooltip") {
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
                <TP placement="topLeft" title={text}>
                  {text && text.length > 25 ? text.substring(0, 25) + "..." : text}
                </TP>
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "START") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div className="start-button">
                {
                  row["Status"] == 'Done' ?
                    <div style={{ height: "45px" }}></div> :
                    
                    <Button className="start-button-1" type={activeButton != row.ID ? "primary" : "danger"} title={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? "Currently in progress by another user" : ""} disabled={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? true : false} onClick={() => handleStart(row.ID, row)}>{activeButton == row.ID ? "RESET" : "START"}</Button>

                }
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Duration") {
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
                {text ? formatTime1(+text / 1000) : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "FINISH") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {
                  row["Status"] == 'Done' ?
                    null :
                    <Button className="checker-background" onClick={() => handleReset(row.ID, row)}>      </Button>

                }
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "Svc Date" || obj.dataIndex == "Disch Date" || obj.dataIndex == "Min Days End Date" || obj.dataIndex == "Consented" || obj.dataIndex == "Enrolled - Active") {
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
                {text ? text.split("T")[0] : ""}
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
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {text ? <img src={RedDot} width="9px" onClick={() => onRowMarked('Error', row, true)} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked('Error', row, false)} />}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Correct" && process == 'Standard') {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div style={{ marginTop: "10px" }}>

                <Radio.Group size="small" className="custom-tripple-check" defaultValue={text} buttonStyle="solid" onChange={(e) => {
                  onRowMarked('Correct', row, e.target.value)
                }}>
                  <Radio.Button value={1}>|</Radio.Button>
                  <Radio.Button value={null}>|</Radio.Button>
                  <Radio.Button value={0}>|</Radio.Button>
                </Radio.Group>
                {/* {text ? <img src={GreenDot} width="14px" height="9px" onClick={() => onRowMarked('Correct', row, false)} /> : <img src={WhiteDot} width="10px"  onClick={() => onRowMarked('Correct',row, true)} />} */}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Patient MRN") {
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
                {text} <CopyOutlined onClick={() => copy(row.ID, text, row['Svc Date'] , true)}  disabled={activeProcesses.includes(row['Patient MRN'])}/>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "OriginalUserAssigned") {
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

                {
                  current.managementAccess == 1 ?

                    text :

                    null}
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
  var { pagination, items, filters, sorters, colors, scrubIrb, extra } = listResult;


  const [dataSource, setDataSource] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [donePercent, setDonePercent] = useState(0);
  const [processPercent, setProcessPercent] = useState(0);
  const { current } = useSelector(selectAuth);
  const [amountToReview, setAmountToReview] = useState([])
  const [loading, setLoading] = useState(true)
  const [MRNFilter, setMRNFilter] = useState(false)
  const [showClock, setShowClock] = useState(false)
  const [totalProcess, setTotalProcess] = useState(0)
  const [amountTotal, setAmountTotal] = useState(0)
  const [PERM, setPERM] = useState(false)
  const [miniKPIs, setMiniKPIs] = useState([])
  const [selectedMRN, setSelectedMRN] = useState(0)
  const [selectedDate, setSelectedDate] = useState(0)



  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if (config.dataTableColorList && items && items.length > 0 && colors) {
      let list = config.dataTableColorList
      if (filters && filters['Process Type'] && filters['Process Type'][0] && (filters['Process Type'][0] == "Top 10 Aging Days" || filters['Process Type'][0] == "Top 10 $ Amount")) {
        list = list.map(li => {
          if (li.text == "Review") {
            li.total = items.filter(item => item.Status === li.text || item.Status === null || item.Status === "").length
            return li
          }
          li.total = items.filter(item => item.Status === li.text).length
          return li
        })
      } else {
        list = list.map(li => {

          li.total = colors[li.text] && colors[li.text][0] ? colors[li.text][0]['count'] : 0
          return li
        })
      }

      setColorList(list)
    }
  }, [config, items])


  useEffect(() => {
    getPercentage(miniKPIs)
  }, [miniKPIs])



  WQ5508Details.subscribe(
    value => setMiniKPIs(value.data),
    err => console.log(err)
  )

 



  useEffect(() => {

    if (config.dataTableColorList && items && items.length == 0) {

      let list = config.dataTableColorList
      list = list.map(li => {
        li.total = 0
        return li
      })

      setColorList([...list])
    }
  }, [config])


  const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

  const preparebarChartData = async (elements, items, dP, pP, amount, checkmark, sessAmount, totalProcess) => {


    let data = elements.map((element => {
      return ({
        name: element,
        value: countOccurrences(items, element)
      })
    }))

    const sortedData = data.sort((a, b) => b.name - a.name).slice(0, 5)
    setChartData(sortedData)

    if (!current.managementAccess || current.adminAccess) {

      // // saving work
      if (checkmark == 1) {
        onWorkSaved()
      }

      // saving progress
      dispatch(crud.create(progressEntity, { ChargesProcessed: (pP * 100).toFixed(2), ChargesToReview: dP, AgingDays: JSON.stringify(sortedData), KPI: JSON.stringify({ sessAmount, totalProcess }), Amount: JSON.stringify(amount.slice(0, 5)) }));
    }

  }



  // set Default color to each row //
  const setRowBackgroundColor = (items) => {
    const tmpObj = {};
    items.map(({ ID, Color }) => {
      tmpObj[ID] = Color
    });

    setColoredRow({ ...coloredRow, ...tmpObj });
  }

  useEffect(() => {

    if (items.length > 0) {
      setRowBackgroundColor(items)
      getItems(items)
      setDataSource(items)
      if (selectedRowID) {
        let index = items.findIndex((item) => item.ID == selectedRowID)
        console.log(items.move(index, 0))

        setSelectedRowKeys([selectedRowID])
      }


      if (inCopiedMode) {

        selectAllRows(items)
      }
    } else {
      setDataSource([])
      getItems(items)

    }
  }, [items])


  Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };

  const selectAllRows = (items) => {

    let ids = items.map((item) => item.ID);
    setAllSelectedRowsKeys(ids)

    if (!startProcess) {

      let index = items.findIndex((item) => item.ID == selectedRowID)
      let id = items.map((item) => item.ID).filter((i) => i == selectedRowID)[0];
      setSelectedRowKeys([id]);
      setActiveButton([id]);
      setSelectedRowID(id);
      console.log(items.move(index, 0))

    }

  }

  const getPercentage = (fullList = []) => {

    if (fullList.length == 0) return

    if (fullList) {

      let chargesProcessedCount = fullList.data.chargesReview[0]["count"] / (fullList.data.total[0]["count"] ? fullList.data.total[0]["count"] : 1)


      let chargesToReviewCount = fullList.data.chargesReviewCount[0]["count"]
      let list = fullList.data.notToReview
      let inReview = fullList.data.inReview
      let checkmark = fullList.data.chargesReview[0]["count"] / (fullList.data.total[0]["count"] ? fullList.data.total[0]["count"] : 1)

      setDonePercent(chargesToReviewCount)
      setProcessPercent(chargesProcessedCount)

      const amount = inReview.map(li => li['Sess Amount']).sort((a, b) => b - a).slice(0, 5)
      const amountReview = list.map(li => li['Sess Amount']).sort((a, b) => b - a).slice(0, 10)

      const sessAmount = fullList.data.amount[0]['count'] ? parseInt(fullList.data.amount[0]['count']) : 0
      const sessAmountCount = fullList.data.charges[0]['count']

      setAmountTotal(sessAmount)
      setTotalProcess(sessAmountCount)

      setAmountList(amount)
      setAmountToReview(amountToReview)

      let agingDays = inReview.map(item => item['Aging Days'])
      let elements = [...new Set(agingDays)];

      setChartData([])
      preparebarChartData(elements, agingDays, chargesToReviewCount, chargesProcessedCount, amountReview, checkmark, sessAmount, sessAmountCount)

    }
  }

  useEffect(() => {
    if (extra) {
      setPERM(extra.PERM[0] && extra.PERM[0]['count'] > 0 ? true : false)

    }
  }, [extra])

  const dispatch = useDispatch();


  const handelDataTableLoad = async (pagination, filters = {}, sorter = {}, copied) => {

    setSelectedRowKeys([])

    if (inCopiedMode && !filters['Patient MRN']) {
      setInCopiedMode(false)
    }

    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    filteredArray = (filteredArray.map((data) => {
      if (data?.column?.dataIndex == "Research IRB" || data?.column?.dataIndex == "Primary Coverage" || data?.column?.dataIndex == "Patient MRN") {
        delete data.column.filters
      }

      return data
    }))

    if (!current.managementAccess && current.name != 'Bernadette' && !filters.hasOwnProperty('UserAssigned')) {
      filters.UserAssigned = [current.name]
    }

    if (current.name != 'Admin' && !filters.hasOwnProperty('Status')) {
      filters.Status = ['Review']
    }

    if (!filters.hasOwnProperty('Process Type')) {
      filters['Process Type'] = [process]
    }

    let limit;





    const option = {
      page: pagination.current || 1,
      filter: (filters) || ({}),
      sorter: sorter ? (filteredArray) : ([]),
      limit: limit
    };

    dispatch(crud.list1(entity, option));
    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    (async () => {
      // const responseForFilterQuery = await request.list(entity + "-filters", { user: filters['UserAssigned'] });
      await request.list(entity + "-full-list");
      getFullList([], scrubIrb, filters)
    })()

   
  };

  const loadTable = () => {

    let filterValue
    let sortValue

    if (current.Nickname == 'Admin') {
      filterValue = { UserAssigned: [], 'Process Type': ['Expedite'] , Status: ['Done', 'Pending', 'Misc', 'Deferred', 'Review'], }
    } else if (current.Nickname == 'Bernadette' || current.Nickname == 'Beth') {
      filterValue = { UserAssigned: [], 'Process Type': ['Expedite'], 'Status': ['Review'] }
    } else {
      filterValue = { UserAssigned: [current.name], Status: ['Review'], 'Process Type': ['Expedite'] }
    }

    sortValue = []



    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: (filterValue),
      sorter: (sortValue)
    };

    filterValue.sort = sortValue
    getFilterValue(filterValue)

    dispatch(crud.list1(entity, option));

    (async () => {
      // const responseForFilterQuery = await request.list(entity + "-filters", { user: filters['UserAssigned'] });
      await request.list(entity + "-full-list");
      getFullList([], scrubIrb, filterValue)
    })()
  }

  useEffect(() => {
    items = []
    setDataSource([])
    loadTable()

    // let acIds = localStorage.getItem('WQ5508_Active')
    // if (acIds) {
    //   setcurrentProcesses(acIds.split(","))
    // }

  }, []);

  useEffect(() => {

    if (dataSource.length == 0) {
      return
    }

    if (reload && inCopiedMode) {

      if (!MRNFilter) {
        delete filters['Patient MRN']       
      }

      setInCopiedMode(false)

      if (previousEntity == entity) {
        handelDataTableLoad(pagination, filters, sorters)
      }

    } else if (reload) {

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
    if (showModal) setShowModal(false)




  }, [items]);


 

  const [firstRow, setFirstRow] = useState();

  const [onSelect, setSelect] = useState(false);
  const onClickRow = (record, rowIndex) => {
    return {

      onMouseDown: (e) => {
        setFirstRow(rowIndex);
        setSelectedRowKeys([record.ID]);

        if (inCopiedMode) {
          setMRNFilter(true)
          setTimeout(() => setMRNFilter(true), 10)
        } else {

          setMRNFilter(false)
          setTimeout(() => setMRNFilter(false), 10)
        }

        setSelect(true);

      },
      onMouseEnter: () => {
        if (onSelect) {
          let tableList = []

          if (tableItemsList.length > 100) {

            tableList = (tableItemsList.filter(list => {
              return (tableItemsList.indexOf(list) < (pagination.current * 100) && tableItemsList.indexOf(list) > ((pagination.current - 1) * 100) - 1)
            }))

            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          } else {
            tableList = tableItemsList
            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          }
        }


      },
      onMouseUp: (e) => {
        setSelect(false);

        if (dataSource.length == 1) {

          if (e.target.nodeName == 'LABEL' || e.target.nodeName == 'SPAN' || e.target.nodeName == 'IMG' || e.target.nodeName == 'path' || e.target.nodeName == 'svg') {
          
            setMRNFilter(true)
            setInCopiedMode(true)
            setTimeout(() => setMRNFilter(true), 10)
          } else {
            setMRNFilter(false)
            setInCopiedMode(true)
            setTimeout(() => setMRNFilter(false), 10)
          }



        } else if (dataSource.length == selectedRowKeys.length) {
          if (e.target.nodeName == 'BUTTON') {
            setMRNFilter(false)
            setInCopiedMode(true)
            setTimeout(() => setMRNFilter(false), 10)
          }

        }


      },
      onDoubleClick: () => {
        if (!inCopiedMode) {
          setOpenModal(true)
          setResetRow(record)
          let date = getCurrentDate();
          setStartTime(date);
        }

      }

    };
  };


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

  const handleSave = (row) => {
    const newData = [...items];
    const index = newData.findIndex((item) => row.ID === item.ID);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData)
    onhandleSave(row)

    setTimeout(() => handelDataTableLoad({}), 2000)
  }


  useEffect(() => {

    let interval;
    document.getElementById('scroller').addEventListener('mouseenter', () => {
      let body = document.getElementsByClassName('ant-table-body')[0]
      interval = setInterval(() => {
        body.scrollTop = body.scrollTop + 50
      }, 100)
    })

    document.getElementById('scroller').addEventListener('mouseleave', () => {
      clearInterval(interval)
    })
  }, [])

  const onProcessChanged = (e) => {
    const value = e.target.value;
    setProcess(value)
    setActiveButton(null)
    setSelectedRowID(null)
    setInCopiedMode(false)
    handelDataTableLoad(1, { 'Process Type': [value] }, {})
  }

  const barChartConfig = {
    width: 115,
    height: 95,
    data: chartData,
    style: {
      display: "inline-block",
      marginRight: "5px",
      marginTop: "10px"
    }
  }
  const [selectedFile, setSelectedFile] = useState()


  const handleCancel = () => {
    setOpenModal(false)

  }

  const handleClock = (value) => {
    setShowClock(value)
    localStorage.setItem('clock', JSON.stringify(value))
  }


  const modalConfig = {
    title: "",
    openModal,
    handleCancel,
    width: 320,
    style: {
      padding: "10px 10px "
    }
  };


  const openExcel = () => {
    setOpenExcelModal(true)
  }

  const closeExcel = () => {
    setOpenExcelModal(false)
    setClear(!clear)
  }


  const modalConfig9 = {
    title: "Excel viewer",
    openModal: openExcelModal,
    handleCancel: closeExcel,
    width: 1200
  };



  const updateColorList = (list) => {
    setColorList(list)
  }

  const handleSaveColor = (EMPID, data) => {
    config.handleSaveColor(EMPID, data);
    config.getPreviousColors()
  }

  const populateNotes =async () => {
    request.list('populate-pbnotes' , {})
    notification.success({"message": "Populating PB Notes"})
  }

  return (
    <div className="wq-table">
      <div className="text-end mb-20">

        <div style={{ display: "inline" }}>

    {
      current.managementAccess ? 
      <Button className="ml-3" size="small" title="Populate Notes" onClick={() => {
            populateNotes()
          }} key={`${uniqueId()}`}>
            <BlockOutlined />
          </Button>
          : null
    }
        
          
          <Button className="ml-3" size="small" onClick={() => {
            openSortModal()
          }} key={`${uniqueId()}`}>
            <SortAscendingOutlined />
          </Button>

          {
            !showClock ?
              <Button className="ml-3" size="small" style={{ marginTop: "5px", height: "25px", marginLeft: "5px" }} key={`${uniqueId()}`}>
                <EyeFilled onClick={() => handleClock(true)} />
              </Button>
              :

              <Button className="ml-3" size="small" style={{ marginTop: "5px", height: "25px", marginLeft: "5px" }} key={`${uniqueId()}`}>
                <EyeInvisibleFilled onClick={() => handleClock(false)} />
              </Button>

          }

          <Button className="ml-3" size="small" onClick={openExcel} key={`${uniqueId()}`}>
            <FileExcelOutlined />
          </Button>

          <ExportTable config={{ entity: entity }} />
          <Export entity={entity} setLoading={setLoading} show={current.managementAccess} />


          {/* {
                current.managementAccess ?
                  <Button className="ml-3" style={{ display: "inline" }} size="small" 
                    onClick={() => {
                      setOpenDistributionModal(true)
                      distributionForm ? distributionForm.resetFields() : ""
                    }}
                    key={`${uniqueId()}`}>
                    <UnorderedListOutlined />
                  </Button>
                  : null
              } */}

          <Distribution entity={entity} show={current.managementAccess} users={users} loadTable={loadTable} />

          <Button className="ml-3" size="small" onClick={() => {
            resetClock()
            loadTable()
          }} key={`${uniqueId()}`}>
            <ReloadOutlined />
          </Button>
        </div>
      </div>
      <PageHeader
        style={{
          "padding": "0px",
          "marginTop": "-17px",
          "marginBottom": "0px"
        }}
        ghost={false}
        tags={

          colorList.length > 0 ?
            <div>
              {/* <ColorListBox
              colorsList={colorList}
              show={true}
            />  */}
              <ColorListBox

                entity={entity}
                dataTableTitle={dataTableTitle}
                items={items}
                selectedRowKeys={selectedRowKeys}
                mrnFilterAndCopied={mrnFilterAndCopied}
                colorsList={colorList}
                selectedRowID={selectedRowID}
                updateColorList={updateColorList}
                show={true}
                modal={false}
                handleSaveColor={handleSaveColor}
                handleColorChange={handleColorChange}
                filters={filters}
                setColorList={setColorList}
                showClock={showClock}
                timer={timer}
                getDefaultColors={config.getDefaultColors}
              />

            </div>
            : null
        }
        extra={[
          <Header config={{
            amountTotal: amountTotal,
            totalProcess: totalProcess,
            donePercent: donePercent,
            processPercent: processPercent,
            amountList: amountList,
            chartData: chartData,
            users: users

          }} />

        ]}

      ></PageHeader>
      <Table
        columns={columns}
        rowKey="ID"
        className="WQ WQ5508"
        rowSelection={rowSelection}
        onRow={onClickRow}
        rowClassName={(record, index) => {
          if (record.ID == selectedRowID) {
            return 'wq-rows'
          } else if (selectedRowID) {
            return 'wq-rows blur-background'
          } else {
            return "wq-rows"
          }
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: 'calc(100vh - 24.1em)' }}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
              <Col style={{ "width": "100%" }}>
                <div className="text-center scroller-container" >
                  <Button type="text" id="scroller">
                    <CaretDownOutlined />
                  </Button>
                </div>
              </Col>
              <Col style={{ width: "100%", marginTop: "10px" }}>

                <div>

                  <Radio.Group value={process} onChange={onProcessChanged}>
                    <Radio.Button value="Expedite" className="box-shadow" >Expedite</Radio.Button>
                    <Radio.Button value="Standard" className="mr-3 box-shadow" >Standard</Radio.Button>
                    <Radio.Button value="Do Not Scrub IRBs" className="mr-3 box-shadow" >Do Not Scrub IRBs</Radio.Button>
                    <Radio.Button value="Perm" className="mr-3 box-shadow" >No Scrub-Perm
                      {
                        PERM ?
                          <span className="rn-exclamation-datatable">
                            <ExclamationCircleTwoTone twoToneColor="#eb2f96" />
                          </span>
                          : null
                      }
                    </Radio.Button>
                    <Radio.Button value="Test" className="mr-3 box-shadow" >No Scrub-Test</Radio.Button>

                  </Radio.Group>
                </div>
              </Col>

              <Col span={4}></Col>

            </Row>
          )
        }
      />
      <Modals config={modalConfig}>
        <div className="color-box-container">
          {
            colorList.length > 0 ?
              // <ColorListBox colorsList={colorList} show={false} modal={true} />
              <ColorListBox

                entity={entity}
                dataTableTitle={dataTableTitle}
                items={items}
                selectedRowKeys={selectedRowKeys}
                mrnFilterAndCopied={mrnFilterAndCopied}
                colorsList={colorList}
                selectedRowID={selectedRowID}
                updateColorList={updateColorList}
                show={false}
                modal={true}
                handleSaveColor={handleSaveColor}
                handleColorChange={handleColorChange}
                setColorList={setColorList}
                showClock={showClock}
                timer={timer}
                filters={filters}
                getDefaultColors={config.getDefaultColors}
              />
              : null

          }
        </div>
      </Modals>



      <div className="done-modal">
        <Modals config={modalConfig8}>
          <h4>Data upload completed successfully!</h4>

          <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
            <Button type="primary" onClick={() => closeDoneModal()}>Close</Button>
          </div>
        </Modals>
      </div>


      <div className="excel-modal">
        <Modals config={modalConfig9}>
          <SheetJS config={{
            clear
          }} />
        </Modals>
      </div>
    </div>


  );
}
