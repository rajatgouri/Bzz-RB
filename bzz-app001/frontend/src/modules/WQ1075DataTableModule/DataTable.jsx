

import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {Button, PageHeader ,Table, Checkbox,Dropdown, Input,Form,Badge,notification,Radio,Row,Col,Tooltip as TP} from "antd";
import { BarChart,Bar,XAxis,YAxis,Tooltip,LabelList} from "recharts";
import { CaretDownOutlined,CheckOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, ExclamationCircleTwoTone,UnorderedListOutlined, ReloadOutlined, UploadOutlined,  SettingOutlined, CloudDownloadOutlined , FileExcelOutlined,SortAscendingOutlined, ConsoleSqlOutlined, BlockOutlined} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import {  DollarTwoTone, EyeInvisibleFilled, } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import CheckerFlags from "../../assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import { getDate, getDay , renderCustomizedLabel} from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Modals from "@/components/Modal";
import Cabinet from '@/assets/images/Cabinet.png'
import NestedDataTable from "@/components/NestedDataTable";
import { epic } from "@/redux/epic/actions";
import Socket, { WQ1075Details, WQ1075ProcessEnded, WQ1075ProcessStarted } from "@/socket";
import SheetJS from "@/components/SheetJS";
import ColorListBox from "@/components/ColorlistBox";
import Export from "@/components/Export"
import ExportTable from "@/components/ExportTable";
import Distribution from "@/components/Distribution";
import Header from "./header";


Array.prototype.F = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

export default function DataTable({ config , onCollapsed}) {

  const inputColorRef = useRef(null);
  const [timer, setTimer] = useState(0)
  const countRef = useRef(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [allSelectedRowsKeys, setAllSelectedRowsKeys] = useState([])
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [colorList, setColorList] = useState([]);
  const [EMPID, setUserID] = useState(1);
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
  const [activeMRN, setActiveMRN] = useState('')
  const [startProcess, setStartProcess] = useState(false);
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)
  const [openDoneModal, setOpenDoneModal] = useState(false)
  const [openDistributionModal, setOpenDistributionModal] = useState(false)
  const [resetRow, setResetRow] = useState({})
  const [activeRowID, setActiveRowID]= useState('')
  const [selectedMRN, setSelectedMRN] = useState(0)
  const [selectedDate, setSelectedDate] = useState(0)

  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity,  onCopied, getFilterValue, showProcessFilters, userList, onRowMarked, getFullList,  updateTime, reset, openSortModal } = config;
  const [users, setUsers] = useState(userList)
  const [currentProcess, setCurrentProcess]= useState({})
  const [endedProcess,setEndedProcess] = useState({})
  const currentProcesses = useRef()
  const [activeProcesses, setActiveProcesses]= useState([])

  const [process, setProcess] = useState(entity == "wq1075" ? '60 Days and Over' : 'Expedite');
  
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


  WQ1075ProcessStarted.subscribe(
    value => {
      setCurrentProcess(value)
      console.log(value)
    },
    err => console.log(err)
  )

  WQ1075ProcessEnded.subscribe(
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
      setActiveMRN(row['Patient MRN'])
      if (row['Status'] != 'Done') {
        updateTime([id], { StartTimeStamp: null, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Reset')
      }
      Socket.emit("WQ1075-process-end", { id: row['Patient MRN'] })

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
      setActiveMRN(row['Patient MRN'])
      copy(id, row['Patient MRN'], row['Svc Date'] ,false);
      Socket.emit("WQ1075-process-start", { id: row['Patient MRN'] })


    }

  }


  const handleReset = (id, row) => {
    setResetRow(row)
    Socket.emit("WQ1075-process-end", { id: row['Patient MRN'] })

    if (selectedRowID != id && selectedRowID == id) {
      return
    } else if (selectedRowID == id) {

      setOpenModal(true)
     
    }

  }

  const formatTime = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div className="timer-box-container">
        <span className="time-box">{getHours}</span> <span className="time-box">{getMinutes}</span>  <span className="time-box">{getSeconds}</span>

      </div>
    )
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
        config.onHandleColorChange( keys , d, selectedRowID)
       }, 'Stop', d)
    } else {
      config.onHandleColorChange( keys , d, selectedRowID)

    }

  


    setActiveButton(null)

    setColoredRow({ ...coloredRow, ...tmpObj });
    setActiveMRN(null)
    setSelectedRowID(null)
    setOpenModal(false)
    setSelectedRowKeys([]);
  };

  const load = async () => {
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: 'WhenPosted' })

   var fullDate = getDate().split('T')[0]
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

  const updateColorList = (list) => {
    setColorList(list)
  }

  const handleSaveColor = (EMPID, data) => {
    config.handleSaveColor(EMPID, data);
    config.getPreviousColors()
  }
  // function ColorListBox({ colorsList, show, modal = false }) {

  //   const onDefault = () => {
  //     config.getDefaultColors((colors) => {
  //       let x = (colorList.map((item, i) => {
  //         item['color'] = colors[i]['color']
  //         return item
  //     }))
  //     setColorList(x)
  //     onSaveColors(x)
  //     })
  //   }

  //   const onChangeColorPicker = (e) => {
  //     if (colorList[colorIndex].color !== '#FFFFFF') {
  //       setPickerColor(e.target.value)
  //       if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return

  //       colorList[colorIndex].color = e.target.value;
  //       setColorList(colorList)
  //     }
  //   };

  //   const onSelectColor = (index, color, all = false) => {

  //     let keys = []
  //     if (all && !modal) {

  //       let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
  //       let patientMRN = item['Patient MRN']
  //       let Duration = item['Duration']

       

  //       if (entity == 'wq1075' && filters && (filters['Process Type'] == "Top 10 $ Amount" || filters['Process Type'] == 'Top 10 Aging Days')) {
  //         keys = dataSource.map(d => d.ID)

  //       } else {
  //         keys = (items.filter(item => item.Status == 'Review'  && item['Patient MRN'] == patientMRN)).map(item => item.ID)
  //       }

  //       setMRNFilter(false)
  //       setInCopiedMode(true)

  //     } else if (all && modal) {

  //       let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
  //       let patientMRN = item['Patient MRN']
  //       let Duration = item['Duration']


  //       if (entity == 'wq1075' && filters && (filters['Process Type'] == "Top 10 $ Amount" || filters['Process Type'] == 'Top 10 Aging Days')) {
  //         keys = dataSource.map(d => d.ID)
  //       } else {
  //         keys = (items.filter(item => item.Status == 'Review' && item['Patient MRN'] == patientMRN)).map(item => item.ID)
  //       }

  //       setMRNFilter(false)
  //       setInCopiedMode(true)


  //     } else {
  //       keys = selectedRowKeys

  //     }

  //     handleColorChange(color, keys, all);
  //     makeSelectedHightlight(index)

  //     setColorIndex(index);
  //     setPickerColor(color);
  //     setStatus(colorList[index].text)

  //   }

  //   const makeSelectedHightlight = (index) => {
  //     let list = colorList;
  //     for (let i = 0; i < colorList.length; i++) {
  //       list[i].selected = false
  //     }
  //     list[index].selected = true;
  //   }

  //   const colorsButton = colorsList.map((element, index) => {
  //     let borderStyleColor = "lightgrey"
  //     return (
  //       <div className="colorPicker" key={uniqueId()}>
  //         <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight:  "bold"  }} className="digital"> {element.total < 999 ? ('000' + element.total).substr(-3) : element.total}</div>
  //         <Button
  //           type="primary"
  //           shape="circle"
  //           style={{
  //             minWidth: "25px",
  //             width: "26px",
  //             height: "25px",
  //             background: element.color,
  //             borderColor: element.selected ? '#000000' : borderStyleColor,
  //             margin: "auto",
  //             marginBottom: "5px",
  //             display: element.text == "Review" ? "block" : "inline-block"

  //           }}
  //           onClick={(e) => {
  //             onSelectColor(index, element.color)
  //           }}
  //         >
  //           &nbsp;
  //         </Button>
  //         <span >{element.text}</span>
  //       </div>
  //     );
  //   });




  //   const onCloseColor = () => {
  //     // config.getPreviousColors()
  //     setColorIndex(null)
  //     setPickerColor("#FFFFFF")
  //     setStatus("Done")
  //     setDropDownBox(!isDropDownBox)
  //   }

  //   const onSaveColors = (colors) => {

  //     const data = {
  //       Color1: colors[0].color,
  //       Color2: colors[1].color,
  //       Color4: colors[2].color,
  //       Color5: colors[3].color,
  //       Color6: "#FFFFFF",
  //       Category1: colors[0].text,
  //       Category2: colors[1].text,
  //       Category4: colors[2].text,
  //       Category5: colors[3].text,
  //       Category6: 'Review'
  //     }

  //     config.handleSaveColor(EMPID, data);
  //     // config.getPreviousColors()
  //     onCloseColor()

  //   }

  //   const handleDropDownClick = () => {
  //     if (selectedRowID) {
  //       return
  //     }

  //     setDropDownBox(!isDropDownBox);
  //   };

  //   const popUpContent = (
  //     <div className="dropDownBox">
  //       <div >
  //         <span className="float-left"></span>
  //         <span className="float-right padding-right padding-top" >
  //           <CloseOutlined onClick={() => onCloseColor()} />
  //         </span>
  //       </div>

  //       <div className="pad20" style={{ width: "300px", height: "180px", marginTop: "20px" }}>
  //         <div >{colorsButton}</div>
  //         <div >

  //           <input
  //             type="color"
  //             autoFocus
  //             ref={inputColorRef}
  //             value={pickerColor}
  //             onChange={onChangeColorPicker}
  //             style={{
  //               width: "94%",
  //               marginBottom: '18px',
  //               marginTop: '5px',
  //               float: "left",
  //               marginLeft: "10px"
  //             }}
  //           />
  //           <Button style={{ float: "left" }} type="link" onClick={() => onDefault()}>Reset to Default Colors</Button>
  //           <Button style={{ float: "right", marginRight: "12px" }} type="primary" className="mb-1" onClick={() => onSaveColors(colorList)}>Save</Button>
  //         </div>

  //       </div>
  //     </div>
  //   );


  //   return (
  //     <>
  //       {
  //         show ?

  //           <div style={{ 'display': 'block', 'float': 'left' }}>
  //             <div>
  //               <h2
  //                 className="ant-page-header-heading-title"
  //                 style={{ fontSize: "36px", marginRight: "16px", width: "155px" }}
  //               >
  //                 {dataTableTitle}
  //               </h2>
  //             </div>
  //             <div style={{ marginTop: "-32px" }}>
  //               <div className="timer-container">
  //                 <div className="timer">
  //                   {
  //                     showClock ?
  //                       <p style={{ marginBottom: "3px" }}>{formatTime(timer)}</p>
  //                       : null
  //                   }
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           : null
  //       }




  //       {/* Done All and Pending All Logic */}
  //       <div style={{ display: "inline-block", position: "relative", width: modal ? "280px" : "265px", }} className="color-box">
  //         {colorsButton}
  //         <div className="">

  //         <div className="Inline-left">

          
         
  //           {
  //             !modal ? 
  //             <Dropdown
  //             overlay={popUpContent}
  //             trigger={["click"]}
  //             visible={isDropDownBox}
  //             // onVisibleChange={openColorBox}
  //             onClick={handleDropDownClick}
  //           >
  //             <Button style={{ marginTop: "5px", height: "25px" ,marginLeft: "5px" }} icon={<SettingOutlined />} />
  //           </Dropdown>
  //           : null

  //           }



       
          
  //         </div>
  //         <div style={{ textAlign: "end" }} className="Inline-right-1">
  //           <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color" style={{ background: config.dataTableColorList.filter(li => li.text == 'Done')[0]['color'], marginLeft: "14px" }} onClick={() => onSelectColor(0, config.dataTableColorList.filter(li => li.text == 'Done')[0]['color'], true)}>Done All</Button>
  //           <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color ml-2" style={{ background: config.dataTableColorList.filter(li => li.text == 'Pending')[0]['color'] }} onClick={() => onSelectColor(1, config.dataTableColorList.filter(li => li.text == 'Pending')[0]['color'], true)}>Pending All</Button>  
  //         </div>
  //         </div>

  //       </div>

  //     </>
  //   );
  // }


  const closeDoneModal = () => {
    setOpenDoneModal(false)
  }

  const modalConfig8 = {
    title: "Success",
    openModal: openDoneModal,
    handleCancel: closeDoneModal,
    width: 500
  };


  function MakeNewColor({ colorsList }) {

    if (colorList.length > 0) {

      const onDefault = () => {
        config.getDefaultColors((colors) => {
          setColorList(colors)
          onSaveColors(colors)
        })
      }

      const onChangeColorPicker = (e) => {
        if (colorList[colorIndex].color !== '#FFFFFF') {
          setPickerColor(e.target.value)
          if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return

          colorList[colorIndex].color = e.target.value;
          setColorList(colorList)
        }
      };

      const onSelectColor = (index, color) => {

        setColorIndex(index);
        setPickerColor(color);
        setStatus(colorList[index].text)
        handleColorChange(color);
        makeSelectedHightlight(index)
      }

      const makeSelectedHightlight = (index) => {
        let list = colorList;
        for (let i = 0; i < colorList.length; i++) {
          list[i].selected = false
        }
        list[index].selected = true;
      }

      const colorsButton = colorsList.map((element, index) => {
        let borderStyleColor = "lightgrey"
        return (
          <div className="colorPicker" key={uniqueId()}>
            <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: "bold"  }} className="digital"> {('000' + element.total).substr(-3)}</div>
            <Button
              type="circle"
              style={{
                background: element.color,
                borderColor: element.selected ? '#000000' : borderStyleColor,
                margin: "auto",
                marginBottom: "5px",
                display: element.text == "Review" ? "block" : "inline-block"

              }}
              onClick={(e) => {
                onSelectColor(index, element.color)
              }}
            >
              &nbsp;
            </Button>
            <span >{element.text}</span>
          </div>
        );
      });

      const popUpContent = (
        <div className="dropDownBox">
          <div >
            <span className="float-left"></span>
            <span className="float-right padding-right padding-top" >
              <CloseOutlined onClick={() => onCloseColor()} />
            </span>
          </div>

          <div className="pad20" style={{ width: "300px", height: "180px", marginTop: "20px" }}>
            <div >{colorsButton}</div>
            <div >

              <input
                type="color"
                autoFocus
                ref={inputColorRef}
                value={pickerColor}
                onChange={onChangeColorPicker}
                style={{
                  width: "94%",
                  marginBottom: '18px',
                  marginTop: '5px',
                  float: "left",
                  marginLeft: "10px"
                }}
              />
              <Button style={{ float: "left" }} type="link" onClick={() => onDefault()}>Reset to Default Colors</Button>
              <Button style={{ float: "right", marginRight: "12px" }} type="primary" className="mb-1" onClick={() => onSaveColors(colorList)}>Save</Button>
            </div>

          </div>
        </div>
      );


      const onCloseColor = () => {
        // config.getPreviousColors()
        setColorIndex(null)
        setPickerColor("#FFFFFF")
        setStatus("Done")
        setDropDownBox(!isDropDownBox)
      }

      const onSaveColors = (colors) => {

       
        const data = {
          Color1: colors[0].color,
          Color2: colors[1].color,
          Color4: colors[2].color,
          Color5: colors[3].color,
          Color6: "#FFFFFF",
          Category1: colors[0].text,
          Category2: colors[1].text,
          Category4: colors[2].text,
          Category5: colors[3].text,
          Category6: 'Review'
        }

        config.handleSaveColor(EMPID, data);
        // config.getPreviousColors()
        onCloseColor()

      }

      const handleDropDownClick = () => {
        if (selectedRowID) {
          return
        }

        setDropDownBox(!isDropDownBox);
      };

      return (
        <>
          <div >

            <Dropdown
              overlay={popUpContent}
              trigger={["click"]}
              visible={isDropDownBox}
              // onVisibleChange={openColorBox}
              onClick={handleDropDownClick}
            >
              <Button style={{ marginTop: "5px", height: "25px" }} icon={<SettingOutlined />} />
            </Dropdown>
          </div>

        </>
      );
    }
  }


  function copy(id, textToCopy, date= '',   filter) {
    
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
        dispatch(epic.list("epic-data-wq1075",  {id: textToCopy, date: date}));
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
        handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy], Status: filters['Status'] ?filters['Status'] : ['Review' ,'']}, sorters)
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
               {row['Error'] ? <EditOutlined onClick={() => openEditModal(row.ID)} /> : null   }   {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
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
                    // <Button type={activeButton != row.ID ? "primary" : "danger"} onClick={() => handleStart(row.ID, row)}>{activeButton == row.ID ? "RESET" : "START"}</Button>
                    // <Button type={activeButton != row.ID ? "primary" : "danger"} title={currentProcesses.current.includes(row['Patient MRN']) && activeButton != row.ID ? "Currently in progress by another user" : ""} disabled={currentProcesses.current.includes(row['Patient MRN']) && activeButton != row.ID ? true : false} onClick={() => handleStart(row.ID, row)}>{activeButton == row.ID ? "RESET" : "START"}</Button>
                    <Button className="start-button-1" type={activeButton != row.ID ? "primary" : "danger"} title={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? "Currently in progress by another user" : ""} disabled={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? true : false} onClick={() => handleStart(row.ID, row)}>{activeButton == row.ID ? "RESET" : "START"}</Button>


                }
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "tooltip" ) {
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
                  {text && text.length > 25 ? text.substring(0,25) + "..." : text}
                  </TP>
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
                   row["Status"] == 'Done'?
                    null :
                    <Button className="checker-background" onClick={() => handleReset(row.ID, row)}>      </Button>

                }
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "Svc Date" || obj.dataIndex == "Disch Date" || obj.dataIndex == "Min Days End Date") {
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
                {text ? 
                 text.split("T")[0].split('-')[1] + "-" + 
                 text.split("T")[0].split('-')[2] + "-" + 
                 text.split("T")[0].split('-')[0] 
                : ""}
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
                {text ? <img src={RedDot} width="9px" onClick={() => onRowMarked('Error',row, true)} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked('Error', row, false)} />}
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
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
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
                {text} <CopyOutlined onClick={() => copy(row.ID, text, row['Svc Date'], true)}  disabled={activeProcesses.includes(row['Patient MRN'])}/>
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
             text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items, filters, sorters, colors, scrubIrb , extra} = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [donePercent, setDonePercent] = useState(0);
  const [processPercent, setProcessPercent] = useState(0);
  const { current } = useSelector(selectAuth);
  const [selectedID, setSelectedID] = useState(0);
  const [user, setUser] = useState({});
  const [amountToReview, setAmountToReview] = useState([])
  const [loading, setLoading] = useState(true)
  const [MRNFilter, setMRNFilter] = useState(false)
  const [showClock, setShowClock] = useState(false)
  const [totalProcess, setTotalProcess] = useState(0)
  const [amountTotal, setAmountTotal] = useState(0)
  const [categoryError, setCategoryError] = useState("")
  const [namesError, setNamesError] = useState("")

  const [openExcelModal, setOpenExcelModal] = useState(false)
  const [clear, setClear] = useState(false)
  const [PERM, setPERM] = useState(false)
  const [miniKPIs,  setMiniKPIs] = useState([])



  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if(extra) {
      setPERM(extra.PERM[0] && extra.PERM[0]['count'] > 0 ? true: false)

    }
  }, [extra])


  useEffect(() => { 
    getPercentage(miniKPIs)
},[miniKPIs])


WQ1075Details.subscribe(
    value => setMiniKPIs(value.data),
    err => console.log(err)
  )

  useEffect(() => {
    if (config.dataTableColorList && items && items.length > 0 && colors) {
      let list = config.dataTableColorList
      if (filters  && filters['Process Type'] && filters['Process Type'][0] && (filters['Process Type'][0] == "Top 10 Aging Days" || filters['Process Type'][0] == "Top 10 $ Amount")) {
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
          
          li.total = colors[li.text][0]['count']
          return li
        })
      }

      setColorList(list)

      
    }

  }, [config, items])


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

    // get aging days
    if (workEntity == "wq1075Work" && localStorage.getItem('day') != getDay()) {
      localStorage.setItem('day', getDay());
      await request.update("wq1075Work", current.EMPID, { Amount: JSON.stringify(amount), AgingDaysCount: 10, AmountCount: 10 });
    }

    if (!current.managementAccess || current.adminAccess) {

     

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
      getItems(items)
      setDataSource(items)
      setRowBackgroundColor(items)
      if (selectedRowID) {
        let index = items.findIndex((item) => item.ID == selectedRowID )
         console.log(items.move(index,0))

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


  Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

  const selectAllRows = (items) => {

    let ids = items.map((item) => item.ID);
    setAllSelectedRowsKeys(ids)

    if (!startProcess) {

      let index = items.findIndex((item) => item.ID == selectedRowID )
      let id = items.map((item) => item.ID).filter((i) => i == selectedRowID)[0];
      setSelectedRowKeys([id]);
      setActiveButton([id]);
      setSelectedRowID(id);
      console.log(items.move(index,0))

    }

  }

  const getPercentage = (fullList = []) => {

    if(fullList.length ==0) return 

    if (fullList) {

      
      let chargesProcessedCount = fullList.data.chargesReview[0]["count"]  / (fullList.data.total[0]["count"] ? fullList.data.total[0]["count"] : 1) 
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

      let agingDays = list.map(item => item['Aging Days'])
      let elements = [...new Set(agingDays)];
      setChartData([])
      preparebarChartData(elements, agingDays, chargesToReviewCount, chargesProcessedCount, amountReview, checkmark, sessAmount, sessAmountCount)

    }
  }


  const dispatch = useDispatch();


  const handelDataTableLoad = async (pagination, filters = {}, sorter = {}, copied) => {
    
    setSelectedRowKeys([])
    if (inCopiedMode && !filters['Patient MRN']) {
      setInCopiedMode(false)
      setActiveMRN(null)
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

    if (!current.managementAccess && current.name != 'Bernadette' && !filters.hasOwnProperty('UserAssigned') ) {
      filters.UserAssigned = [current.name]
    }

    if (current.name != 'Admin'  && !filters.hasOwnProperty('Status') ) {
      filters.Status = ['Review']
    }

    if (!filters.hasOwnProperty('Process Type')) {
      filters['Process Type'] = [process]
    }

    let limit;

    if (entity == "wq1075" && filters['Process Type'] == "Top 10 $ Amount") {

      if (!current.managementAccess) {
        const response = await request.list("wq1075Work");
        const result = response.result.filter(res => res.EMPID == current.EMPID)[0]
        limit = result.AmountCount
      } else {
        limit = 10
      }

    }


    if (entity == "wq1075" && filters['Process Type'] == "Top 10 Aging Days") {

      if (!current.managementAccess) {
        const response = await request.list("wq1075Work");
        const result = response.result.filter(res => res.EMPID == current.EMPID)[0]
        limit = result.AgingDaysCount
      } else {
        limit = 10
      }
    }


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
      const responseForFilterQuery = await request.list(entity + "-filters", { user: filters['UserAssigned'] });
      await request.list(entity + "-full-list");
      getFullList(responseForFilterQuery.result, scrubIrb, filters)
    })()
  };

  const loadTable = () => {

    let filterValue = {}
    debugger
    let sortValue
    if (current.Nickname  == 'Bernadette' || current.Nickname =='Beth') {
      filterValue = {  Status: ['Review'], 'Process Type': ['60 Days and Over'] }
    } else  if (current.managementAccess) {
        filterValue = { UserAssigned: [], Status: ['Done', 'Pending', 'Misc', 'Deferred', 'Review'], 'Process Type': ['60 Days and Over'] }
      }  else {
        filterValue = { UserAssigned: [current.name], Status: ['Review'], 'Process Type': ['60 Days and Over'] }
      }

      sortValue = []
    console.log(filterValue)


    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: (filterValue),
      sorter: (sortValue)
    };


    filterValue.sort = sortValue
    getFilterValue(filterValue)

    dispatch(crud.list1(entity, option));

    (async () => {

      await request.list(entity + "-full-list");
      getFullList([], scrubIrb, filterValue)

    })()

  }

  useEffect(() => {

    items = []
    setDataSource([])
    loadTable()
  }, []);



  useEffect(() => {
    Socket.on('update-loader', () => {
        loadTable()
    });

  }, [])

  useEffect(() => {

    if (dataSource.length == 0) {
      return
    }

    if (reload && inCopiedMode) {

      if (!MRNFilter) {
        delete filters['Patient MRN']
        // if (current.managementAccess) {
        //   delete filters['Status']
        // }
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

    if (showModal) {
      setShowModal(false)
    }


  }, [items]);



  const [firstRow, setFirstRow] = useState();

  const [onSelect, setSelect] = useState(false);
  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {
        setSelectedID(record.ID)

      },
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
          if(e.target.nodeName == 'BUTTON') {
            setMRNFilter(false)
            setInCopiedMode(true)
            setTimeout(() => setMRNFilter(false), 10)
          }
         
        }


      },
      onDoubleClick: () => {
        if(!inCopiedMode) {
          setOpenModal(true)
          setResetRow(record)
          let date = getCurrentDate();
          setStartTime(date);
        }
        
      }

    };
  };

  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
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

 
  

  
  const handleCancel = () => {
    setOpenModal(false)
  }

  const handleClock = (value) => {
    setShowClock(value)
    localStorage.setItem('clock', JSON.stringify(value))
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
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

  const modalConfig6 = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };

  const closeConfirmModal = () => {
    setOpenExportModal(false)
  }

  const expandedRowRender = (record) => { 
    const columns = [
      { title: <span style={{marginLeft: "10px"}}>Answer</span>, dataIndex: 'Answer', key: 'Answer' , width: 120, align: 'center',},
      { title: 'Incorrect', dataIndex: 'Incorrect', key: 'Incorrect' , width: 70, align: 'center'},
      { title: 'Svc Date', dataIndex: 'Svc Date', key: 'Svc Date' , width: 130, align: 'center'},
      { title: 'Patient MRN', dataIndex: 'Patient MRN', key: 'Patient MRN' , width: 120,align: 'center'},
      { title: 'Research IRB', dataIndex: 'Research IRB', key: 'Research IRB' , width: 120,align: 'center'},
      { title: 'CPT Code', dataIndex: 'CPT Code', key: 'CPT Code' , width: 100,align: 'center'},
      { title: 'Time Point', dataIndex: 'Time_Point', key: 'Time_Point', width: 150 },
      { title: 'Has Matched Study', dataIndex: 'HasMatchedStudy', key: 'HasMatchedStudy' , width: 180},
      { title: 'Has Matched CPT Value', dataIndex: 'HasMatchedCPTValue', key: 'HasMatchedCPTValue' , width: 180},
      { title: 'Study File Name', dataIndex: 'StudyFileName', key: 'StudyFileName', width: 150 },
      { title: 'Misc1', dataIndex: 'Misc1', key: 'Misc1' , width: 150},
      { title: 'Misc2', dataIndex: 'Misc2', key: 'Misc2', width: 0 }

    ];


    return (
      <div className="nested-table">
          <NestedDataTable  dataTableColumns={columns} entity={entity} record={record}/>    

      </div>
    )
  }

  const onExpandRow = (expanded, record) => {
    setActiveRowID(record.ID)

    
  }


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

  const populateNotes =async () => {
    request.list('populate-pbnotes' , {})
    notification.success({"message": "Populating PB Notes"})
  }


  return (
    <div className="wq-table wq1075">

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
        !showClock  ? 
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

        <ExportTable config={{entity: entity}}/>
        <Export entity={entity} setLoading={setLoading} show={current.managementAccess}/> 
        <Distribution entity={entity} show={current.managementAccess} users={users} loadTable={loadTable}/>

        
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

                setColorList={setColorList}
                showClock={showClock}
                timer={timer}
                getDefaultColors={config.getDefaultColors}
                filters={filters}
                dataSource={dataSource}
              />

            </div>
            : null
        }
        extra={[
          <Header config = {{
            amountTotal: amountTotal,
            totalProcess: totalProcess,
            donePercent: donePercent,
            processPercent: processPercent, 
            amountList: amountList,
            chartData: chartData,
            users: users

          }}/>
         
        ]}

      ></PageHeader>
      {/* <PageHeader
        style={{
          "padding": "0px",
          "marginTop": "-17px",
          "marginBottom": "0px"
        }}
        ghost={false}
        tags={

          colorList.length > 0 ?
          <div>
            <ColorListBox
              colorsList={colorList}
              show={true}
            /> 
          </div>
            : null
        }
        extra={[
          <div className="text-right flex ">

            <div className="counter-container" >
              <div style={{ height: "84px" }}>
                <div>
                  <p className="amount-container digital">{
                    (parseInt(amountTotal)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                  <p className="general-label">$ Amount Removed</p>
                </div>
                <div>
                  <p className="total-container digital">{totalProcess}</p>
                  <p className="general-label">Claims Processed</p>
                </div>
              </div>
            </div>

            <div className="cabinet-container" >
              <div style={{ height: "84px" }}>
                <div style={{ position: "absolute" }}>
                  <p className="amount-container charges-container digital">{
                    ( donePercent < 9999 ? ('0000' + donePercent).substr(-4): donePercent).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                </div>
                <div style={{ position: "absolute" }}>
                  <img src={Cabinet} ></img>
                </div>
                <p className="general-label charges">Claims To Do</p>


              </div>
            </div>

            <ProgressChart percent={(processPercent * 100).toFixed(2)} text={"Work Done"} />

            <div className="amount" style={{ padding: "7px 5px 5px 9px", width: "85px" }}>
              <div style={{ height: "84px" }}>

                {
                  amountList && amountList.length == 0 ?
                    <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", paddingTop: "40%" }}>
                      <img src={CheckerFlags} width="65" height="35"></img>

                    </div>
                    :
                    amountList && amountList.map((amount) => {
                      return <div style={{ fontSize: "10px", minWidth: "65px", lineHeight: "17px", fontWeight: "500" }}><DollarTwoTone twoToneColor="#52C41A" style={{ marginRight: "3px" }} /> {
                        (parseInt(amount)).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      }</div>
                    })
                }
              </div>
              <p className="general-label mt-4">Amount</p>

            </div>


            <div>

              <div className="chart-container">
                {
                  chartData && chartData.length > 0 ?
                    <BarChart
                      width={barChartConfig.width}
                      height={barChartConfig.height}
                      data={chartData}
                      style={barChartConfig.style}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#78e0e1" minPointSize={5}>
                        <LabelList dataKey="value" content={renderCustomizedLabel} />
                      </Bar>
                    </BarChart>
                    :
                    (
                      <div className="empty-aging-days" style={{
                        padding: "5px",
                        width: "92px",
                        margin: "auto",
                        display: "flex",
                        marginTop: "5px",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="65" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label ">Aging Days</p>
              </div>
            </div>

            <div className="user-members" style={{ minWidth: "90px",  }}>
              <div style={{ height: "92px", minWidth: "103px", padding: "5px 0px", overflowY: "auto", overflowX: "hidden" }} >
                {
                  users.map((user) => {
                    return <Badge className="mr-3 text-shadow fnt-10 d-block" status={user.status} text={user.name} />
                  })
                }
              </div>

              <p className="general-label mt-4" style={{ marginRight: "-7px" }}>Attendance</p>

            </div>


         
          </div>
        ]}
        
      ></PageHeader> */}
      <Table
        columns={columns}
        rowKey="ID"
        className="WQ WQ1075"
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
        scroll={{ y: 'calc(100vh - 25.1em)' }}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        expandable={{
          expandedRowRender,
          onExpand: onExpandRow
        }}
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
              <Col style={{ width: "75%", display: "table", maxWidth: "1000px", marginTop: "2px" }}>
                {
                  showProcessFilters ?
                    <div>
                  
                          <Radio.Group value={process} onChange={onProcessChanged}>
                            <Radio.Button value="60 Days and Over" className="box-shadow mr-4" >60 Days and Over</Radio.Button>
                            <Radio.Button value="Top 10 $ Amount" className="mr-4 mb-4 box-shadow" >$ Amount (Top 10) </Radio.Button>
                            <Radio.Button value="Top 10 Aging Days" className="mr-4 mb-4 box-shadow" >Aging Days (Top 10)</Radio.Button>
                            <Radio.Button value="Non-Therapeutic" className="mr-4 mb-4 box-shadow" >Non-Therapeutic</Radio.Button>
                            <Radio.Button value="Under 60 Days" className="mr-4 mb-4 box-shadow" >Under 60 Days</Radio.Button>
                            <Radio.Button value="Do Not Scrub IRBs" className="mr-4 mb-4 box-shadow" >Do Not Scrub IRBs</Radio.Button>
                            <Radio.Button value="Answers" className="mr-4 mb-4 box-shadow" >Answers</Radio.Button>
                            <Radio.Button value="Data Collections" className="mr-4 mb-4 box-shadow" >Data Collections</Radio.Button>
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
                    : null
                }
              </Col>

              <Col span={4}>

              </Col>

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
                getDefaultColors={config.getDefaultColors}
                filters={filters}
                dataSource={dataSource}


              />
              : null

          }
        </div>
      </Modals>

      <div style={{ marginTop: "-30px" }}>
      </div>

      <div className="confirm-modal">
        <Modals config={modalConfig6}>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeConfirmModal()}>No</Button>

          </div>
        </Modals>
      </div>

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
            }}/>
        </Modals>
      </div>
    </div>


  );
}