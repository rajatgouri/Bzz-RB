

import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Dropdown,
  Input,
  Form,
  Badge,
  notification,
  Tabs,
  Radio,
  Divider,
  Row,
  Select,
  Col,
  Tooltip as TP
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, UnorderedListOutlined, ReloadOutlined, UploadOutlined, SettingOutlined, CloudDownloadOutlined, SortAscendingOutlined, FileExcelOutlined, SearchOutlined, DownCircleOutlined, BlockOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { selectListItems } from "@/redux/crud/selectors";
import { DollarTwoTone, EyeInvisibleFilled, ExclamationCircleTwoTone, StrikethroughOutlined } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import LiquidChart from "@/components/Chart/liquid";
import { selectAuth } from "@/redux/auth/selectors";
// import { filter } from "@antv/util";
import CheckerFlags from "../../assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import { getDate, getDay, renderCustomizedLabel } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Modals from "@/components/Modal";
import { DualAxes } from "@antv/g2plot";
import PageLoader from "@/components/PageLoader";
import Popover from '@/components/Popover'

import Cabinet from '@/assets/images/Cabinet.png'
import SheetJS from "@/components/SheetJS";
import { epic } from "@/redux/epic/actions";
import { crud } from "@/redux/crud/actions";
import NestedDataTable from "@/components/NestedDataTable";
import socket, { WQ1262Details,WQ1262ProcessEnded, WQ1262ProcessStarted } from "@/socket";
import Socket from "@/socket";






let alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const { Option } = Select

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


export default function DataTable({ config, onCollapsed }) {


  const inputColorRef = useRef(null);
  const [timer, setTimer] = useState(0)
  const countRef = useRef({
    current: null,
    play: false

  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [allSelectedRowsKeys, setAllSelectedRowsKeys] = useState([])
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
  const [clusterData, setClusteredData] = useState({})
  const [activeMRN, setActiveMRN] = useState('')
  const [startProcess, setStartProcess] = useState(false);
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)
  const [openDoneModal, setOpenDoneModal] = useState(false)

  const [openExcelModal, setOpenExcelModal] = useState(false)
  const [clear, setClear] = useState(false)
  const [acctID, setAcctID] = useState(0)
  const [DD, setDD] = useState(0)
  const copiedMode = useRef()


  const [openDistributionModal, setOpenDistributionModal] = useState(false)
  const [openEpicModal, setOpenEpicModal] = useState(false)
  const [epicList, setEpicList] = useState([]);
  const [distributionList, setDistributionsList] = useState()
  const [resetRow, setResetRow] = useState({})
  const [showPause, setShowPause] = useState(true)
  const [pause, setPause] = useState(false)
  const [defaultOpen, setDefaultOpen] = useState(false)

  const [currentProcess, setCurrentProcess]= useState({})
  const [endedProcess,setEndedProcess] = useState({})
  const currentProcesses = useRef()
  const [activeProcesses, setActiveProcesses]= useState([])

  currentProcesses.current = []


  useEffect(() => {
    copiedMode.current = inCopiedMode
  }, [inCopiedMode])

  const [tabs, setTabs] = useState([
    { name: 'ALL', value: 'ALL', disabled: false, show: true },
    { name: 'Outpatient', value: 'Outpatient', disabled: false, show: true },
    { name: 'RN', value: 'RN', disabled: false, show: true },
    { name: 'Do Not Scrub IRB', value: 'Do Not Scrub IRB', disabled: false, show: true },
    { name: 'Deferred', value: 'Deferred', disabled: false, show: true },
    { name: 'Pending', value: 'Pending', disabled: false, show: true },
    { name: 'Misc', value: 'Misc', disabled: false, show: true },
    { name: 'No Scrub-Perm', value: 'Perm', disabled: false, show: true },
    { name: 'No Scrub-Test', value: 'Test', disabled: false, show: true },
    { name: 'Expedite', value: 'SOCs', disabled: true, show: true },


  ])


  const [defaultTabs, setDefaultTabs] = useState([])

  const [openExport1Modal, setOpenExport1Modal] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [password, setPassword] = useState('Password1!')
  const [distributionForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [exportform] = Form.useForm();
  const [lastScroll, setLastScroll] = useState(0)
  var interval = ''
  const ref = useRef();


  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked, getFullList, updateTime, reset, openSortModal } = config;

  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState('');

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


  WQ1262ProcessStarted.subscribe(
    value => {
      setCurrentProcess(value)
      console.log(value)
    },
    err => console.log(err)
  )

  WQ1262ProcessEnded.subscribe(
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
      setShowPause(false)
      if (row['Status'] != 'Done') {
        updateTime([id], { StartTimeStamp: null, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Reset')
      }

      localStorage.removeItem('pause')
      setPause(false)
      Socket.emit("WQ1262-process-end", { id: row['Patient MRN'] })

      return
    } else if ((selectedRowID == id || selectedRowID == undefined)) {
      setShowPause(true)

      // setLastScroll()

        if (selectedRowKeys.length > 0) {
          // setActiveButton(selectedRowKeys[0])
          countRef.current = setInterval(() => {

            let value = (localStorage.getItem('pause'))
            if (value != 'true') {
              setTimer((timer) => timer + 1)
            }
          }, 1000)

          if(!inCopiedMode) {
           
            let body = document.getElementsByClassName('ant-table-body')[0]
            setLastScroll(body.scrollTop)
          }
         
          setSelectedRowID(id);
          let date = getCurrentDate();
          setStartTime(date);

          updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')
       
          // } else {
        //   //  setActiveButton(id)
        //   countRef.current = setInterval(() => {

        //     let value = (localStorage.getItem('pause'))
        //     if (value != 'true') {
        //       setTimer((timer) => timer + 1)
        //     }
        //   }, 1000)

        //   setSelectedRowID(id);
        //   let date = getCurrentDate();
        //   setStartTime(date);
        //   updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')
        // }
      } else {
        let date = getCurrentDate();
        setStartTime(date);
        updateTime([id], { StartTimeStamp: date, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Start')
      }

      setSelectedRowID(id);
      setActiveMRN(row['Patient MRN'])

      copy(id, row['Patient MRN'], false, row['Patient MRN'], row['Code']);
      Socket.emit("WQ1262-process-start", { id: row['Patient MRN'] })
      
    }

  }


  const handleReset = (id, row) => {
    setResetRow(row)
    Socket.emit("WQ1262-process-end", { id: row['Patient MRN'] })

    if (selectedRowID != id && selectedRowID == id) {
      return
    } else if (selectedRowID == id) {

      setOpenModal(true)
      setShowPause(true)
      setPause(false)
      localStorage.removeItem('pause')

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
    localStorage.removeItem('pause')
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

      updateTime([resetRow.ID], { StartTimeStamp: startTime, FinishTimeStamp: date, 'Patient MRN': resetRow['Patient MRN'], keys: (keys ? keys : selectedRowKeys), Duration: (timer * 1000).toString() }, () => {
        config.onHandleColorChange(keys ? keys : selectedRowKeys, d, selectedRowID)


      }, 'Stop', d)
    } else {
      config.onHandleColorChange(keys ? keys : selectedRowKeys, d, selectedRowID)

    }

    setTimeout(() => {
    }, 2000)


    setActiveButton(null)

    setColoredRow({ ...coloredRow, ...tmpObj });
    setActiveMRN(null)
    setSelectedRowID(null)
    setOpenModal(false)
    setSelectedRowKeys([]);
  };

  const load = async () => {
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: 'WhenPosted' })

    let fullDate = getDate().split('T')[0]

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




  function ColorListBox({ colorsList, show, modal = false }) {

    const onDefault = () => {
      config.getDefaultColors((colors) => {

        let x = (colorList.map((item, i) => {
          item['color'] = colors[i]['color']
          return item
        }))
        setColorList(x)
        onSaveColors(x)
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

    const onSelectColor = (index, color, all = false) => {


      let keys = []
      if (all && !modal) {

        let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
        let patientMRN = item['Patient MRN']
        let Duration = item['Duration']

        let Status = 'Review'
        if(filters['Process Type'][0] == 'Deferred' || filters['Process Type'][0] == 'Pending' || filters['Process Type'][0] == 'Misc'   ) {
          Status = filters['Process Type'][0]
        }

        keys = (items.filter(item => item.Status == Status  && item['Patient MRN'] == patientMRN)).map(item => item.ID)

        setMRNFilter(false)
        setInCopiedMode(true)

      } else if (all && modal) {

        let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
        let patientMRN = item['Patient MRN']
        let Duration = item['Duration']

        let Status = 'Review'
        if(filters['Process Type'][0] == 'Deferred' || filters['Process Type'][0] == 'Pending' || filters['Process Type'][0] == 'Misc'   ) {
          Status = filters['Process Type'][0]
        }

        keys = (items.filter(item => item.Status == Status && item['Patient MRN'] == patientMRN)).map(item => item.ID)


        setMRNFilter(false)
        setInCopiedMode(true)


      } else {
        keys = selectedRowKeys

      }

      handleColorChange(color, keys, all);
      makeSelectedHightlight(index)

      setColorIndex(index);
      setPickerColor(color);
      setStatus(colorList[index].text)

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
          <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: "bold" }} className="digital"> {element.total < 999 ? ('000' + element.total).substr(-3) : element.total}</div>
          <Button
            type="primary"
            shape="circle"
            style={{
              minWidth: "25px",
              width: "26px",
              height: "25px",
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
        Color3: colors[2].color,
        Color4: colors[3].color,
        // Color5: colors[4].color,
        Color6: "#FFFFFF",
        Category1: colors[0].text,
        Category2: colors[1].text,
        Category3: colors[2].text,
        Category4: colors[3].text,
        // Category5: colors[4].text,
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


    return (
      <>
        {
          show ?

            <div style={{ 'display': 'block', 'float': 'left' }}>
              <div>
                <h2
                  className="ant-page-header-heading-title"
                  style={{ fontSize: "36px", marginRight: "16px", width: "155px" }}
                >
                  {dataTableTitle}
                </h2>
              </div>
              <div style={{ marginTop: "-32px" }}>
                <div className="timer-container">
                  <div className="timer">
                    {
                      showClock ?
                        <p style={{ marginBottom: "3px" }}>{formatTime(timer)}</p>
                        : null
                    }
                  </div>
                </div>
              </div>
            </div>

            : null
        }




        {/* Done All and Pending All Logic */}
        <div style={{ display: "inline-block", position: "relative", width: modal ? "280px" : "265px", }} className="color-box">
          {colorsButton}
          <div className="">

            <div className="Inline-left">


              {
                !modal ?
                  <Dropdown
                    overlay={popUpContent}
                    trigger={["click"]}
                    visible={isDropDownBox}
                    // onVisibleChange={openColorBox}
                    onClick={handleDropDownClick}
                  >
                    <Button style={{ marginTop: "5px", height: "25px", marginLeft: "5px" }} icon={<SettingOutlined />} />
                  </Dropdown>
                  : null

              }





            </div>

            <div style={{ textAlign: "end" }} className="Inline-right">
              <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color" style={{ background: config.dataTableColorList.filter(li => li.text == 'Done')[0]['color'], marginLeft: "14px" }} onClick={() => onSelectColor(0, config.dataTableColorList.filter(li => li.text == 'Done')[0]['color'], true)}>Done All</Button>
              <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color ml-2" style={{ background: config.dataTableColorList.filter(li => li.text == 'Pending')[0]['color'] }} onClick={() => onSelectColor(1, config.dataTableColorList.filter(li => li.text == 'Pending')[0]['color'], true)}>Pending All</Button>
            </div>

          </div>

        </div>

      </>
    );
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
            <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: "bold" }} className="digital"> {('000' + element.total).substr(-3)}</div>
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
              <Button style={{ float: "left" }} type="link" onClick={() => onDefault(colorList)}>Reset to Default Colors</Button>
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
          Color3: colors[2].color,
          Color4: colors[3].color,
          Color5: colors[4].color,
          Color6: "#FFFFFF",
          Category1: colors[0].text,
          Category2: colors[1].text,
          Category3: colors[2].text,
          Category4: colors[3].text,
          Category5: colors[4].text,
          Category6: 'Review'
        }

        config.handleSaveColor(EMPID, data);
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


  function copy(id, textToCopy, filter, accountID = '', DD = '', message = 'MRN') {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    if (accountID && DD) {
      findEpicResults(accountID, DD)

    }


    return new Promise((res, rej) => {
      // here the magic happens

     
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
        notification.success({ message: message + " Copied!", duration: 3 })


      if (message == 'MRN') {
        onCopiedEvent(textToCopy, filter)

        if (filter) {
          setStartProcess(true)
          onCopied(id, textToCopy)

        } else {
          setStartProcess(false)


        }
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


  const findEpicResults = (accountID, D) => {
    if (acctID != accountID && DD != D) {
      dispatch(epic.list("epic-data-wq1262", { id: accountID, DD: D }));
      setAcctID(accountID)
      setDD(D)
      // onCollapsed(true)

    }

  }

  const onCopiedEvent = (textToCopy, filter) => {

    if (filter) {
      handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy] }, sorters)

    } else {
      if (current.managementAccess) {
        handelDataTableLoad(1, { ...filters, 'Patient MRN': [textToCopy], Status: filters['Status'] ?filters['Status'] : ['Review' ,'']  }, sorters)
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
                <EditOutlined onClick={() => openEditModal(row.ID)} />  {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "StartTimeStamp" || obj.dataIndex == "FinishTimeStamp" || obj.dataIndex == "UploadDateTime") {
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
                    <Button className="start-button-1" type={activeButton != row.ID ? "primary" : "danger"} title={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? "Currently in progress by another user" : ""} disabled={activeProcesses.includes(row['Patient MRN']) && activeButton != row.ID ? true : false} onClick={() => handleStart(row.ID, row)}>{activeButton == row.ID ? "RESET" : "START"}</Button>


                }
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "EPIC") {
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
              <div className="epic-button">
                <SearchOutlined onClick={() => findEpicResults(row['Acct ID'])} />
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "PLAY") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center",
              },
            },
            children: (
              <div className="start-button">
                {

                  (activeButton == row.ID && obj.title) ?

                    <Button type={showPause ? "primary" : "danger"} onClick={() => {

                      localStorage.setItem('pause', !pause)
                      setPause(!pause)
                      setShowPause(!showPause)
                    }

                    }>{showPause ? "Pause" : "Play"}</Button>

                    : null

                }
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "amount") {
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
              <div >

                {text ?
                  "$" + new Intl.NumberFormat('en-US', {
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

    if (obj.dataIndex == "Message") {
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
                {text && text.length > 25 ?
                  (
                    <TP title={text}>
                      {text.substring(0, 25)} ...

                    </TP>
                  )
                  :
                  text
                }
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
                {text ? <img src={RedDot} width="9px" onClick={() => onRowMarked(row, true)} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked(row, false)} />}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Patient MRN" || obj.dataIndex == "Acct ID") {
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
                {text} <CopyOutlined onClick={() => {
                  if(!inCopiedMode) {
           
                    let body = document.getElementsByClassName('ant-table-body')[0]
                    setLastScroll(body.scrollTop)
                  }
                copy(row.ID, text, true, row['Patient MRN'], row['Code'], obj.dataIndex == 'Acct ID' ? 'Account ID' : 'MRN',)}} disabled={activeProcesses.includes(row['Patient MRN'])}/>
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
  const [RN, setRN] = useState(false)
  const [PERM, setPERM] = useState(false)
  const [KPI, setKPI] = useState([])
  const [miniKPIs,  setMiniKPIs] = useState([])
  const page = useRef()


  const [SOCCount, setSOCCount] = useState(0)



  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if (config.dataTableColorList && items && items.length > 0 && colors) {
      let list = config.dataTableColorList

      list = list.map(li => {
        li.total = colors[li.text] && colors[li.text][0] ? colors[li.text][0]['count'] : 0
        return li
      })

      setColorList(list)
    }
  }, [config, items])


  useEffect(() => { 
    getPercentage(miniKPIs)
},[miniKPIs])

WQ1262Details.subscribe(
    value => setMiniKPIs(value.data),
    err => console.log(err)
  )

  socket.on('soc-count', (data) => {
    setSOCCount(data[0]['count'])
  })


  useEffect(() => {
    if (socket) {
      socket.emit('get-soc-count')
    }
  }, [socket])


  useEffect(() => {
    if (extra) {
      setRN(extra.RN && extra.RN[0] && extra.RN[0]['count'] > 0 ? true : false)
      setPERM(extra.PERM && extra.PERM[0] && extra.PERM[0]['count'] > 0 ? true : false)

    }
  }, [extra])

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

  const preparebarChartData = async (elements, items, dP, pP, amount, checkmark, sessAmount, totalProcess, todayDone) => {


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
      if (todayDone >= 49) {
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
      } else {
        setTimeout(() => {
          let body = document.getElementsByClassName('ant-table-body')[0]
          body.scrollTop = lastScroll
          setLastScroll(0)
        }, 3000)
       
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

    if(fullList.length ==0) return

    if (fullList) {

      let chargesProcessedCount = fullList.data.chargesReview[0]["count"] / (fullList.data.total[0]["count"] ? fullList.data.total[0]["count"] : 1)
      let chargesToReviewCount = fullList.data.chargesReviewCount[0]["count"]
      let list = fullList.data.notToReview
      let checkmark = fullList.data.chargesReview[0]["count"] / (fullList.data.total[0]["count"] ? fullList.data.total[0]["count"] : 1)

      setDonePercent(chargesToReviewCount)
      setProcessPercent(chargesProcessedCount)
      setKPI(fullList.data.kpi)

      const amount = list.map(li => li['Acct Bal']).sort((a, b) => b - a).slice(0, 5)
      const amountReview = list.map(li => li['Acct Bal']).sort((a, b) => b - a).slice(0, 10)

      const sessAmount = fullList.data.amount[0]['count'] ? parseInt(fullList.data.amount[0]['count']) : 0
      const sessAmountCount = fullList.data.charges[0]['count']

      setAmountTotal(sessAmount)
      setTotalProcess(sessAmountCount)

      setAmountList(amount)
      setAmountToReview(amountToReview)

      let agingDays = list.map(item => item['Days On Account WQ'])
      let elements = [...new Set(agingDays)];

      let today = fullList.data.today[0]['count']

      setChartData([])
      preparebarChartData(elements, agingDays, chargesToReviewCount, chargesProcessedCount, amountReview, checkmark, sessAmount, sessAmountCount, today)

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

    if (!current.managementAccess && current.name != 'Bernadette' && (!filters.hasOwnProperty('UserAssigned') || filters['UserAssigned'].length ==0)) {
      filters.UserAssigned = [current.name]
    }



    if (!current.managementAccess && !filters.hasOwnProperty('Status')) {
      filters.Status = ['Review']
    }


    if (!filters.hasOwnProperty('Process Type')) {
      filters['Process Type'] = [process]
    }


    let limit;

    if(!inCopiedMode && pagination.current) {
      page.current = pagination.current
    }

    let currentPage = pagination.current || 1
    if(!copiedMode.current && inCopiedMode ) {
      currentPage = page.current || 1
    }

    
    const option = {
      page: currentPage,
      filter: (filters),
      sorter: sorter ? (filteredArray) : ([]),
      limit: limit
    };

    dispatch(crud.list1(entity, option));
    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    (async () => {

      await request.list(entity + "-full-list");
      getFullList( filters)

    })()


  };



  const loadTable = (process) => {


    items = []
    setDataSource([])

    let filterValue
    let sortValue

     if (current.Nickname == 'Bernadette' || current.Nickname == 'Beth') {
      filterValue = { Status: ['Review'], 'Process Type': [process] }
    } else if (current.managementAccess) {
      filterValue = { UserAssigned: [], Status: ['Done', 'Pending', 'Misc', 'Deferred', 'Review'], 'Process Type': [process] }
    }  else {
      filterValue = { UserAssigned: [current.name], Status: ['Review'], 'Process Type': [process] }
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

      await request.list(entity + "-full-list");
      getFullList( filterValue)

    })()


  }

  useEffect(() => {

    loadTabs()


  }, []);


  const loadTabs = async () => {
    const { result } = await request.list(entity + "-tabs", { EMPID: current.EMPID })

    if (result && result.length > 0) {
      let t = (tabs.map(t => {
        t.show = (result[0][t.name] == 1 ? true : false)
        return t
      }))

      setTabs(t)

      let p =t.filter(t=> t.show == true)[0].name
      setProcess(p)
      loadTable(p)

      setDefaultTabs(t.map(t => {
        if (t.show) {
          return t.name
        }
      }))
    } else {
      setDefaultTabs(tabs.map(t => t.name))
      let p = tabs.filter(t=> t.show == true)[0].name
      setProcess(p)
      loadTable(p)


    }


  }

  // useEffect(() => {
  //   if (filters) {
  //     (async () => {
  //       await request.list(entity + "-full-list");
  //       getFullList( filters)
  //       // getPercentage(response.result)

  //     })()
  //   }
  // }, [items, filters])


  const onDistribution = async (value) => {


    if (value.distributions < 1) {
      return
    }

    if (typeof value['Process Type'] == 'string') {
      value["Process Type"] = [value['Process Type']]
    }

    if (typeof value['Status'] == 'string') {
      value["Status"] = [value['Status']]
    }

    if (typeof value['UserAssigned'] == 'string') {
      value["UserAssigned"] = [value['UserAssigned']]
    }


    value = {
      'Process Type': value['Process Type'],
      'UserAssigned': value['UserAssigned'] ? value['UserAssigned'] : "",
      'User': "",
      'Status': value['Status'],
      'distributions': value.distributions,
      'Acct Bal': value.Min + "-" + value.Max,
      'Acct Name': value.First + "-" + value.Last
    }


    setDistributionsList([])
    let response = await request.create('distributions', { Distributions: value.distributions, Model: entity, values: value })
    let result = (response.result)


    if (response.message == "Record") {
      notification.error({ message: "No charges found by selected criteria!" })
      setDistributionsList(null)
      return
    } else if (response.message == "Distribution") {
      notification.error({ message: "Distributions exceed the number of charges available!" })
      setDistributionsList(null)
      return
    }

    result = result.map((res) => {
      return ({
        userAssigned: "",
        result: res
      })
    })
    setDistributionsList(result);
  }

  const onAssignDestribution = async (value) => {
    let keys = Object.keys(value)
    let obj = keys.map((v, i) => {
      return {
        'UserAssigned': value['distributions-' + i],
        'Patient MRN': distributionList[i].result.map(re => re['Patient MRN']),
      }
    })


    let dup = (obj.map((o) => o['UserAssigned']).filter((item, index) => obj.map((o) => o['UserAssigned']).indexOf(item) !== index))

    if (dup.length > 0) {
      notification.error({ message: "Duplicate Entry!" })
      return
    }


    let filter = distributionForm.getFieldValue()
    delete filter['distributions']



    if (value.distributions < 1) {
      return
    }




    if (typeof filter['Status'] == 'string') {
      filter["Status"] = [filter['Status']]
    }

    if (typeof filter['UserAssigned'] == 'string') {
      filter["UserAssigned"] = [filter['UserAssigned']]
    }


    filter = {
      'Process Type': filter['Process Type'],
      'UserAssigned': filter['UserAssigned'] ? filter['UserAssigned'] : "",
      'User': filter['UserLogged'] ? filter['UserLogged'] : "",
      'Status': filter['Status'],
      'distributions': filter.distributions,
      'Sess Amount': filter.Min + "-" + filter.Max,
      'Acct Name': value.First + "-" + value.Last


    }



    if (filter.First && filter.Last) {
      filter['Patient'] = filter.First + "-" + filter.Last
    }


    let response = await request.create('distributions-assigned', { Obj: obj, filter: filter, Model: entity })

    if (response.success) {
      notification.success({ message: "Charges redistributed successfully!" })
    } else {
      notification.error({ message: "Something went wrong!" })
    }


    loadTable(process)
    handleCancel()
    distributionForm.resetFields()
    assignForm.resetFields()

    setDistributionsList(null)


  }

  const assignModalContent = (

    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onAssignDestribution}
      autoComplete="off"
      form={assignForm}
    >

      <div className="charges-list" >

        <Row gutters={[24, 24]}>

          <Col span={11}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <div className="distributions-list">
                    {
                      distribution.result[0] ?
                        <div>
                          <span className="bold"> {i + 1}.</span> {distribution.result[0]['Patient MRN']} -  {distribution.result[distribution.result.length - 1]['Patient MRN']}
                        </div>
                        : null
                    }
                  </div>
                )
              })
            }
          </Col>
          <Col span={3}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <div className="distributions-list">
                    {distribution.result.length}
                  </div>
                )
              })
            }
          </Col>
          <Col span={10} style={{ paddingRight: "15px" }}>
            {
              distributionList && distributionList.map((distribution, i) => {
                return (
                  <Form.Item
                    label=""
                    name={"distributions-" + i}
                    rules={[
                      {
                        required: true,
                        message: "please select user"
                      },
                    ]}
                  >

                    <Select style={{ width: "100%" }} >
                      {
                        users.map((user => {
                          return <Option key={user.EMPID} value={user.text}>{user.text}</Option>

                        }))
                      }

                    </Select>
                  </Form.Item>

                )
              })
            }

          </Col>
        </Row>
      </div>


      <Form.Item wrapperCol={{ offset: 20 }}>
        <Button type="primary" htmlType="submit" style={{ marginLeft: "55px", marginBlock: "15px" }}>
          Assign
        </Button>
      </Form.Item>
    </Form>



  )

  const assginDistribution = (

    <Row gutter={[24, 24]} style={{ rowGap: "0px", height: "100%", display: "block" }}>
      <Col span={24} style={{ paddingTop: "6px", paddingRight: "48px", marginBottom: "22px" }}>
        <Row >
          <Col span={11} >
            <h4>Distributions</h4>
          </Col>
          <Col span={3} style={{ padding: "0px 5px" }}>
            <h4>Total</h4>
          </Col>
          <Col span={10} style={{ padding: "0px 10px" }}>
            <h4>User Assigned</h4>
          </Col>
        </Row>
      </Col>

      <Col span={24} className="distribution-charges-container">
        {
          distributionList && distributionList.length > 0 ?
            assignModalContent
            :
            distributionList && distributionList.length == 0 ?
              <PageLoader />
              :
              <div style={{ textAlign: "center" }}>
                {/* <h6 style={{marginTop: "16%"}}>No Data, Please enter value greater than 1 !</h6> */}
              </div>
        }
      </Col>


    </Row>

  )


  const checkCategory = () => {
    let value = distributionForm.getFieldsValue();

    if (+value.Min >= +value.Max) {
      if (((value.Min == '' || !value.Min) && value.Max)) {
        setCategoryError('Min is required')

      } else if (value.Min && (value.Max == "" || !value.Max)) {
        setCategoryError('Max is required')

      } else if (value.Max || value.Min) {
        setCategoryError('Min must be smaller than Max')
      }
      else {
        setCategoryError('')
      }
      return
    } else if (+value.Min && +value.Max) {
      setCategoryError('')
      value['Category'] = value.Min + "-" + value.Max
    } else if (((value.Min == '' || !value.Min) && value.Max)) {
      setCategoryError('Min is required')

    } else if (value.Min && (value.Max == "" || !value.Max)) {
      setCategoryError('Max is required')

    } else {
      setCategoryError('')
    }
  }

  const checkNames = () => {
    let value = distributionForm.getFieldsValue();
    // if (+alphabets.indexOf(value.First ? value.First.toUpperCase(): null) >= +alphabets.indexOf(value.Last? value.Last.toUpperCase() : null)) {
    //   if (((value.First == '' || !value.First) && value.Last)) {
    //     setNamesError('First is required')

    //   } else if (value.First && (value.Last == "" || !value.Last)) {
    //     setNamesError('Last is required')

    //   } else if (value.Last || value.First) {
    //     setNamesError('First must be smaller than Last')
    //   }
    //   else {
    //     setNamesError('')
    //   }
    //   return
    // } else if (+alphabets.indexOf(value.First ? value.First.toUpperCase(): null) && +alphabets.indexOf(value.Last ? value.Last.toUpperCase() : null)) {
    //   setNamesError('')
    //   value['Names'] = value.First + "-" + value.Last
    // } else if (((value.First == '' || !value.First) && value.Last)) {
    //   setNamesError('First is required')

    // } else if (value.First && (value.Last == "" || !value.Last)) {
    //   setNamesError('Last is required')

    // } else {
    //   setNamesError('')
    // }
  }

  const distributionModal = (

    <Row gutter={[24, 24]} className="filter-distribuions">
      <Col span={24}>
        <Form
          name="basic"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          onFinish={onDistribution}
          autoComplete="off"
          form={distributionForm}

        >

          <Row gutter={[24, 24]} styele={{ rowGap: "0px" }}>

            <Col span={8}>
              <h4>Process Type <span style={{ color: "red" }}>*</span></h4>
              <Form.Item
                label="Process Type"
                name="Process Type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                {
                  <Select style={{ width: "100%" }} mode="multiple" >
                    <Option value="Outpatient">Outpatient</Option>

                    <Option value="RN">RN</Option>
                  </Select>

                }

              </Form.Item>

            </Col>
            <Col span={8}>
              <h4>Status <span style={{ color: "red" }}>*</span></h4>

              <Form.Item
                label="Status"
                name="Status"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >

                <Select style={{ width: "100%" }} mode="multiple">
                  <Option value="Review">Review</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Misc">Misc</Option>
                  <Option value="Deferred">Deferred</Option>
                </Select>
              </Form.Item>

            </Col>


            <Col span={8}>
              <h4>User Assigned</h4>

              <Form.Item
                label="User Assigned"
                name="UserAssigned"
              >
                <Select placeholder="Not Specified" style={{ width: "100%" }} mode="multiple">
                  <Option key={100} value={""}></Option>

                  {
                    users.map((user, index) => {
                      return <Option key={index} value={user.name}>{user.name}</Option>
                    })
                  }

                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <h4>$ Amount Bal Range</h4>

              <div style={{ width: "100%", border: "1px solid lightgrey" }}>
                <div className="w-50">
                  <Form.Item
                    label=""
                    name="Min"

                  >
                    <Input type="number" min={0} onKeyUp={checkCategory} />
                  </Form.Item>
                </div>
                <div className="w-50">
                  <Form.Item
                    label=""
                    name="Max"


                  >
                    <Input type="number" min={0} onKeyUp={checkCategory} />
                  </Form.Item>
                </div>

              </div>
              <span style={{ color: "red" }}>{categoryError}</span>

            </Col>

            <Col span={8}>
              <h4>A-Z Name Range</h4>

              <div style={{ width: "100%", border: "1px solid lightgrey" }}>
                <div className="w-50">
                  <Form.Item
                    label=""
                    name="First"

                  >
                    <Input type="" min={0} />
                  </Form.Item>
                </div>
                <div className="w-50">
                  <Form.Item
                    label=""
                    name="Last"

                  >
                    <Input type="text" min={0} />
                  </Form.Item>
                </div>

              </div>
              <span style={{ color: "red" }}>{namesError}</span>


            </Col>

            <Col span={8}>
              <h4>Number of Staff <span style={{ color: "red" }}>*</span></h4>
              <Form.Item
                label=""
                name="distributions"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input type="number" min={1} style={{ width: "100%" }} className="box-shadow" />
              </Form.Item>

            </Col>

            <Col span={24}>

              <Form.Item style={{ textAlign: "end" }}>
                <Button type="primary" htmlType="submit" className="WQ1262-distribution-button">
                  Distribute
                </Button>
              </Form.Item>
            </Col>


          </Row>


        </Form>
      </Col>

      <Col span={24}>

        {
          distributionList && distributionList.length > 0 ?
            <div>
              <Divider />
              {assginDistribution}
            </div>

            : null
        }
      </Col>

    </Row>

  )



  useEffect(() => {

    if (dataSource.length == 0) {
      return
    }

    if (reload && inCopiedMode) {

      if (!MRNFilter) {
        delete filters['Patient MRN']
        copiedMode.current = false
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
          console.log(e.target.nodeName)
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
          setMRNFilter(false)
          setInCopiedMode(true)
          setTimeout(() => setMRNFilter(false), 10)
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


  const expandedRowRender = (record) => {


    const columns = [
      { title: <span style={{ marginLeft: "10px" }}>Answer</span>, dataIndex: 'Answer', key: 'Answer', width: "80px", align: 'center', },
      { title: 'Incorrect', dataIndex: 'Incorrect', key: 'Incorrect', width: "80px", align: 'center' },
      { title: 'HAR', dataIndex: 'HAR', key: 'HAR', width: "80px", align: 'center' },
      { title: 'Svc Date', dataIndex: 'Svc Date', key: 'Svc Date', width: "120px", align: 'center' },
      { title: 'CPT Code', dataIndex: 'CPT Code', key: 'CPT Code', width: "100px", align: 'center' },
      { title: 'HCPCS Code', dataIndex: 'HCPCS Code', key: 'HCPCS Code', width: "150px", align: 'center' },
      { title: 'Rev Code', dataIndex: 'Rev Code', key: 'Rev Code', width: "120px", align: 'center' },
      { title: 'Procedure', dataIndex: 'Procedure', key: 'Procedure', width: "250px" },
      { title: 'Quantity', dataIndex: 'Quantity', key: 'Quantity', width: "80px" },
      { title: 'Amount', dataIndex: 'Amount', key: 'Amount', width: "80px" },
      { title: 'Post Date', dataIndex: 'Post Date', key: 'Post Date', width: "120px" },
      { title: '', dataIndex: 'Misc2', key: 'Misc2', width: 0 }

    ];


    return (
      <div className="nested-table">
        <NestedDataTable dataTableColumns={columns} entity={entity} record={record} />
      </div>
    )
  }

  const exportTable = async () => {
    notification.success({ message: "Downloading..." })
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
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
    let obj = {}
    if (value == "Pending" || value == 'Misc' || value == 'Deferred') {
      obj['Status'] = [value]
      obj['Process Type'] = ['Outpatient', 'RN']

    } else {
      obj['Process Type'] = [value]
    }
    handelDataTableLoad(1, obj, {})
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
  const uploadFile = async (e) => {
    setSelectedFile(e.target.files[0])
  }

  const getpercent = () => {
    let percent = 1
    interval = setInterval(() => {
      percent += 4
      setPercentage(percent)
      if (percent > 100) {
        setPercentage(99)
        loadTable(process)

        clearInterval(interval)
        notification.success({ message: "Data is uploaded successfully!" })
        setOpenDoneModal(true)
        setPercentage(0)
      }
    }, 3000)

  }

  const handleFileModal = () => {
    setOpenExport1Modal(true)
  }

  const handleFileUpoad = async () => {
    const formData = new FormData();



    if (!selectedFile) {
      console.log('error')
      notification.error({ message: 'Please select a file' })
      return
    }


    formData.append(
      "myFile",
      selectedFile,
      selectedFile.name
    );
    formData.append('password', password)

    closeExport1Modal()


    setLoading(true)

    let response = await request.create("upload-file-" + entity.toUpperCase(), formData)

    if (response.success) {
      getpercent()
      notification.success({ message: "Data is uploading..." })

    } else {
      setLoading(false)
    }

  }

  const handleCancel = () => {
    setOpenModal(false)
    setOpenDistributionModal(false)
    distributionForm.resetFields()
    assignForm.resetFields()
    setDistributionsList(null)
  }

  const handleClock = (value) => {
    setShowClock(value)
    localStorage.setItem('clock', JSON.stringify(value))
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
  }

  const closeExport1Modal = () => {
    setOpenExport1Modal(false)
    setSelectedFile({})
    exportform.resetFields()

  }


  const onExpandRow = (expanded, record) => {
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


  const modalConfig1 = {
    title: <span style={{ paddingLeft: "13px", fontWeight: 700 }}> {entity.toUpperCase() + " Assignments"} </span>,
    openModal: openDistributionModal,
    handleCancel,
    width: 800,
    minWidth: "800px"
  };

  const modalConfig6 = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };



  const modalConfig7 = {
    title: "Upload File",
    openModal: openExport1Modal,
    handleCancel: closeExport1Modal,
    width: 500
  };


  const closeConfirmModal = () => {
    setOpenExportModal(false)
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


  const populateSOC = async () => {
    await request.list('populate-soc')
    notification.success({ message: "Populating SOCs", duration: 3 })

  }

  const handleTabSelectionChange = async (values) => {

    let Obj = {}
    tabs.slice().map(t => {
      if (values.includes(t.name)) {
        Obj[t.name] = 1
      } else {
        Obj[t.name] = 0
      }

    })

    Obj.EMPID = current.EMPID
    await request.create(entity + '-tabs', Obj)
    loadTabs()

  }

  const populateNotes =async () => {
    request.list('populate-hbnotes' , {})
    notification.success({"message": "Populating HB Notes"})
  }


  return (
    <div className="wq-table pagination-mt-2">

      <div className="text-end mb-20">

        <div style={{ height: "" }}>

          <Popover

            defaultOpen={(v) => {
              setTimeout(() => {
                setDefaultOpen(v)
              }, 500)
            }}

            content={
              defaultOpen ?
                <div>
                  <div style={{ height: "350px", visibility: "hidden" }}>
                    <Select
                      className="mb-10 default-open-select"
                      mode="multiple"
                      allowClear
                      style={{ width: '200px' }}
                      defaultValue={defaultTabs}
                      defaultOpen={true}
                      placeholder="Choose Tabs to Show"
                      onChange={handleTabSelectionChange}
                    >
                      {
                        tabs.map(t => {
                          return <Option disabled={t.disabled} value={t.name}>{t.name}</Option>
                        })
                      }
                    </Select>



                  </div>

                </div>
                : null
            }>
            <Button className="ml-3" size="small" >
              <DownCircleOutlined />
            </Button>
          </Popover>


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

          {
            current.Nickname == 'Admin' ?
              <Button className="ml-3" size="small" onClick={populateSOC} key={`${uniqueId()}`}>
                <StrikethroughOutlined />
              </Button>
              : null
          }


          <Button className="ml-3" size="small" onClick={openExcel} key={`${uniqueId()}`}>
            <FileExcelOutlined />
          </Button>

          <Button className="ml-3" size="small" onClick={exportTable} key={`${uniqueId()}`}>
            <CloudDownloadOutlined />
          </Button>
          {
            current.managementAccess && entity == 'wq1075' ?

              <Button className="ml-3" size="small" onClick={handleFileModal} key={`${uniqueId()}`}>
                <UploadOutlined />
              </Button>

              : null
          }


          {
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
          }


          <Button className="ml-3" size="small" onClick={() => {
            resetClock()
            loadTable(process)
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
            <ColorListBox
              colorsList={colorList}
              show={true}
            /> : null
        }
        extra={[
          <div className="text-right flex ">
            {/* <div className="soc-counts digital"> 
            <TP title={'SOC Count'}>
               {SOCCount}

            </TP>
            </div> */}
            <div className="counter-container" >
              <div style={{ height: "84px" }}>
                <div>
                  <p className="amount-container digital">{
                    (parseInt(amountTotal)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                  <p className="general-label " >$ Amount Removed</p>
                </div>
                <div>
                  <p className="total-container digital">{totalProcess}</p>
                  <p className="general-label">Accounts Processed</p>
                </div>
              </div>
            </div>

            <div className="cabinet-container" >
              <div style={{ height: "84px" }}>
                <div style={{ position: "absolute" }}>
                  <p className="amount-container charges-container digital">{
                    (('0000' + donePercent).substr(-4)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                </div>
                <div style={{ position: "absolute" }}>
                  <img src={Cabinet} ></img>
                </div>
                <p className="general-label  charges">Accounts To Do</p>


              </div>
            </div>

            <ProgressChart percent={(processPercent * 100).toFixed(2)} text={"Work Done"} />

            {/* {
              amountList && amountList.length > 0 ? */}
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

                <p className="barchart-label">Days On WQ</p>
              </div>
            </div>

            <div className="user-members" style={{ minWidth: "90px", }}>
              <div style={{ height: "92px", width: "145px", padding: "5px 0px", overflowY: "auto", overflowX: "hidden" }} >
                {
                  KPI.map((k) => {
                    return <div className="mb-8 mr-3 text-shadow ft-10 d-block " >
                      <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
                        <Col span={14}>{k.Type} $</Col>
                        <Col span={10}> {k.Amount}</Col>

                        <Col span={14}>{k.Type} Ct</Col>
                        <Col span={10}> {
                          (parseInt(k.Cnt)).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}</Col>
                      </Row>
                    </div>
                  })
                }
              </div>

              <p className="general-label mt-4" style={{ marginRight: "-7px" }}>$ Amount and Volume KPIs</p>

            </div>



          </div>
        ]}

      ></PageHeader>

      <Table
        columns={columns}
        rowKey="ID"
        className="WQ"
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
        scroll={{ y: 'calc(100vh - 26.5em)' }}
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
              <Col style={{ width: "100%", marginTop: "10px" }}>
                {
                  showProcessFilters ?
                    <div>
                      {
                        <Radio.Group value={process} onChange={onProcessChanged}>

                          {
                            tabs.filter(t => t.show == true).map(t => {


                              return t.name == 'RN' || t.name == 'ALL'  ?
                                (
                                  <Radio.Button value={t.value} className="mr-5 box-shadow" >{t.name}
                                    {
                                      RN ?
                                        <span className="rn-exclamation-datatable">
                                          <ExclamationCircleTwoTone twoToneColor="#eb2f96" />
                                        </span>
                                        : null
                                    }

                                  </Radio.Button>
                                )
                                :

                                

                                t.name == 'No Scrub-Perm' ?
                                  (
                                    <Radio.Button value="Perm" className="mr-5 box-shadow" >No Scrub-Perm
                                      {
                                        PERM ?
                                          <span className="rn-exclamation-datatable">
                                            <ExclamationCircleTwoTone twoToneColor="#eb2f96" />
                                          </span>
                                          : null
                                      }
                                    </Radio.Button>
                                  )
                                  :
                                  <Radio.Button value={t.value} className=" mr-5 box-shadow" >{t.name}</Radio.Button>

                            })
                          }

                        </Radio.Group>
                      }

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
              <ColorListBox colorsList={colorList} show={false} modal={true} />
              : null

          }
        </div>
      </Modals>




      <div className="load-modal">
        <Modals config={modalConfig7}>

          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            // onFinish={handleFileUpoad}
            autoComplete="off"
            form={exportform}
            style={{
              width: "95%",
              margin: "auto"
            }}
            initialValues={{
              'password': 'Password1!',
            }}
          >


            <Form.Item
              label="File"
              name="file"

            >
              <Input type="file" className="file-upload" ref={ref} id="file" style={{ marginBottom: "-5px", marginTop: "10px" }} onChange={(e) => uploadFile(e)} />

            </Form.Item>


            <Form.Item
              label="Password"
              name="password"

            >
              <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="box-shadow" />
            </Form.Item>

            <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
              <Button type="primary" onClick={() => handleFileUpoad()}>Yes</Button>
              <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExport1Modal()}>No</Button>

            </div>
          </Form>
        </Modals>
      </div>

      {/* Number of split charges */}
      <div className="distribution-modal">
        <Modals config={modalConfig1}>
          {distributionModal}
        </Modals>
      </div>
      <div style={{ marginTop: "-30px" }}>
      </div>

      <div className="confirm-modal">
        <Modals config={modalConfig6}>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExportModal()}>No</Button>

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
          }} />
        </Modals>
      </div>
    </div>


  );
}