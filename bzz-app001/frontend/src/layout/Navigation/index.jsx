// import React, { useState, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
// import { request } from "@/request";
// import { useSelector, useDispatch } from "react-redux";
// import logo from "../../assets/images/logo.png";
// import { user } from '@/redux/user/actions'
// import Modals from "@/components/Modal";

// import {
// SettingOutlined,
//   UserOutlined,
//   CustomerServiceOutlined,
//   FileTextOutlined,
//   AppstoreOutlined,
//   DashboardOutlined,
//   TeamOutlined,
//   ProfileOutlined,
//   CheckCircleOutlined,
//   MinusCircleOutlined,
//   CloseCircleOutlined,
//   FileWordOutlined,
//   LogoutOutlined,
//   CopyrightOutlined

// } from "@ant-design/icons";
// import uniqueId from "@/utils/uinqueId";
// import { selectUsersList } from "@/redux/user/selectors";


// import { logout } from "@/redux/auth/actions";
// import { selectAuth } from "@/redux/auth/selectors";
// import Chat from "@/components/Chat";

// const { Sider } = Layout;
// const { SubMenu } = Menu;

// const showNew = true

// function Navigation() {
//   const { current } = useSelector(selectAuth);
//   const [Status, setStatus] = useState(current.Status || 'Working')
//   const [collapsed, setCollapsed] = useState(false);
//   const dispatch = useDispatch();
//   const [open, setOpen] = useState(false)

//   const onCollapse = () => {
//     setCollapsed(!collapsed);
//   };

//   const close = () => {
//     setOpen(false)
//   }

//   useEffect(() => {
//     dispatch(user.list('admin'))
//   }, [])




//   const updateStatus = async (status) => {
//     setStatus(status)
//     updateLocal(status)
//     await request.update('jwt', current.EMPID, { Status: status })
//     await request.create("/pageLogger", { Url: '', Page: '', Status: status, UserName: current.name });
//   }


//   useEffect(() => {
//     if (Status != 'Working') {
//       setOpen(true)
//     }
//   }, [Status])

//   const setWorkingStatus = () => {
//     setStatus('Working')
//     current.Status = 'Working'
//     updateLocal('Working')
//   }


//   const updateLocal = (status) => {
//     let auth = JSON.parse(localStorage.getItem('auth'))
//     auth.current.Status = status
//     localStorage.setItem('auth', JSON.stringify(auth))
//     setOpen(false)
//   }


  

//   const managementServices = (

//     <SubMenu
//       key="sub4"
//       icon={<AppstoreOutlined />}
//       title={<div style={{ display: "flex", flexDirection: "column" }}><span className="header" style={{ marginTop: "5px", fontSize: "14px !important" }} className="italic">Management Services</span>  </div>}
//     >
//       <Menu.Item key="3000">
//         <NavLink to="/wqauditerrors" />
//         Audit Errors
//       </Menu.Item>

//       <Menu.Item key="17" >
//         <NavLink to="/performance-cards" />
//         <span >Performance Cards</span>
//       </Menu.Item>

//       <SubMenu
//         key="sub8"

//         title={<span style={{ fontSize: "12.8px" }}>Professionals Center</span>}
//       >
//         <Menu.Item key="18">
//           <NavLink to="/productivity-metrics/graphs" />
//           Graphs
//         </Menu.Item>
//         <Menu.Item key="19">
//           <NavLink to="/productivity-metrics/tables" />
//           Tables
//         </Menu.Item>
//       </SubMenu>


//       <SubMenu
//         key="sub1234"
//         title={'Bzz R&D'}
//         style={{ fontSize: "12.8px" }}
//       >
//         <Menu.Item key="19001">
//           <NavLink to="/5508-flowchart" />
//           WQ5508 Flowchart
//         </Menu.Item>

//         <Menu.Item key="19002">
//           <NavLink to="/1075-flowchart" />
//           WQ1075 Flowchart
//         </Menu.Item>

//         <Menu.Item key="19003">
//           <NavLink to="/1262-flowchart" />
//           WQ1262 Flowchart
//         </Menu.Item>
//       </SubMenu>



//       <SubMenu
//         key="sub9"

//         title={<span style={{ fontSize: "12.8px" }}> Data Control Center</span>}
//       >
//         <Menu.Item key="30">
//           <NavLink to="/data-control-center/irb" />
//           IRB
//         </Menu.Item>


//       </SubMenu>







//       <Menu.Item key="2200" className="large-content" >
//         <NavLink to="/denials" />
//         Denials
//       </Menu.Item>

//       <Menu.Item key="165"  >
//         <NavLink to="/wq-1075-kpis" />
//         WQ 1075 KPIs
//       </Menu.Item>





//       <Menu.Item key="20" className="large-content" >
//         <NavLink to="/epic-productivity" />
//         Epic Productivity
//       </Menu.Item>



//       <Menu.Item key="22">
//         <NavLink to="/reminders" />
//         Reminders
//       </Menu.Item>
//       <Menu.Item key="23">
//         <NavLink to="/team-calendar" />
//         Team Calendar
//       </Menu.Item>

//       <Menu.Item key="24">
//         <NavLink to="/management-milestones" />
//         Milestones
//       </Menu.Item>


//       <Menu.Item key="25">
//         <NavLink to="/emaillogger" />
//         Email Logger
//       </Menu.Item>

//       <Menu.Item key="26">
//         <NavLink to="/management-roadmap" />
//         Roadmap
//       </Menu.Item>

//       <Menu.Item key="27" className="large-content" >
//         <NavLink to="/master-staff-list" />
//         Master Staff List
//       </Menu.Item>
//     </SubMenu>
//   )

//   const menu = (
//     <Menu>

//       <Menu.Item key="1000" onClick={() => updateStatus('Working')}>
//         <CheckCircleOutlined style={{ color: "#adff2f" }} /> Working
//       </Menu.Item>
//       <Menu.Item key="2000" onClick={() => updateStatus('Meeting')}>
//         <MinusCircleOutlined style={{ color: "#ff0000" }} /> Meeting
//       </Menu.Item>
//       <Menu.Item key="3000" onClick={() => updateStatus('Away')}>
//         <CloseCircleOutlined /> Away
//       </Menu.Item>


//       <Menu.Item key={`${uniqueId()}`} onClick={() => dispatch(logout())}> <LogoutOutlined /> Log Out </Menu.Item>
//     </Menu>
//   );
//   return (
//     <>
//       <Sider
//         collapsible
//         collapsed={collapsed}
//         onCollapse={onCollapse}
//         style={{
//           zIndex: 1000,
//           background: "#fff",
//           overflow: "hidden"
//         }}
//       >
//         <div className="logo">
//             <div>

//               <div style={{ width: "180px" }}>
//                 <div style={{ width: "50px", display: "contents" }}>
//           <Dropdown overlay={menu} placement="bottomRight" arrow>

//                   <img style={{ height: "50px", marginTop: "-5px" }} src={logo} />
//           </Dropdown>

//                 </div>
//                 <div className="" style={{ width: "150px", display: "contents" }} >
//                   <span style={{ verticalAlign: "top", width: "125px", display: "inline-flex", flexDirection: "column" }}>
//                     <span className="text-center sub-header">Research Billing</span>
//                     <span className="header username">{current ? current.Nickname.split(" ")[0] : ""}


//                     </span>
//                   </span>
//                 </div>
//               </div>
//             </div>

//         </div>

//         {

//           current['managementCard'] == '1' ?
//             (
//               <Menu
//                 defaultOpenKeys={['sub1']}
//                 mode="inline"
//               >

//                 <SubMenu
//                   key="sub1"
//                   icon={<DashboardOutlined />}
//                   title="RB Team Dashboard"
//                 >
//                   <Menu.Item key="1">
//                     <NavLink to="/pb-team-dashboard-cards" />
//                     PB Performance Cards
//                   </Menu.Item>
//                   <Menu.Item key="2">
//                     <NavLink to="/hb-team-dashboard-cards" />
//                     HB Performance Cards
//                   </Menu.Item>
//                   <Menu.Item key="2600">
//                     <NavLink to="/intake-request" />
//                     Intake Requests
//                   </Menu.Item>
//                   <Menu.Item key="3">
//                     <NavLink to="/rb-team-dashboard-reminders" />
//                     Reminders
//                   </Menu.Item>
//                   <Menu.Item key="4">
//                     <NavLink to="/rb-team-dashboard-calendar" />
//                     Calendar
//                   </Menu.Item>
//                   <Menu.Item key="5">
//                     <NavLink to="/rb-team-dashboard-avatars" />
//                     Avatars
//                     {
//                       showNew ?
//                         <span style={{ color: "#1DA57A", fontSize: "9px", marginLeft: "5px" }}>(New)</span>
//                         : null
//                     }
//                   </Menu.Item>
//                 </SubMenu>


//                 <Menu.Item key="6" icon={<ProfileOutlined />}>
//                   <NavLink to="/wq5508" />
//                   WQ5508
//                 </Menu.Item>

//                 <Menu.Item key="7" icon={<ProfileOutlined />}>
//                   <NavLink to="/wq1075" />
//                   WQ1075
//                 </Menu.Item>


//                 <Menu.Item key="78" icon={<ProfileOutlined />}>
//                   <NavLink to="/wq3177" />
//                   WQ3177
//                 </Menu.Item>


//                 <Menu.Item key="8" icon={<ProfileOutlined />}>
//                   <NavLink to="/wq1262" />
//                   WQ1262
//                 </Menu.Item>

//                 <SubMenu
//                   key="sub90"
//                   icon={<FileWordOutlined />}
//                   title={'WQ Audits'}
//                 >
//                   <Menu.Item key="2205" className="large-content" >
//                     <NavLink to="/pbwqaudit" />
//                     PB WQ Audit
//                   </Menu.Item>


//                   <Menu.Item key="2206" className="large-content" >
//                     <NavLink to="/hbwqaudit" />
//                     HB WQ Audit
//                   </Menu.Item>

//                   <Menu.Item key="169"  >
//                     <NavLink to="/team-audit-graphs" />
//                     Team Audit Graphs
//                   </Menu.Item>


//                   <Menu.Item key="170"  >
//                     <NavLink to="/error-irbs" />
//                     Error IRBs
//                   </Menu.Item>
//                 </SubMenu>

//                 <SubMenu
//                   key="sub2"
//                   icon={<TeamOutlined />}
//                   title="Administration"
//                 >

//                   {/* <Menu.Item key="800" className="large-content" >
//                     <NavLink to="/mapping-oncore" />
//                     Mapping OnCore
//                   </Menu.Item> */}

//                   <Menu.Item key="801" className="large-content" >
//                     <NavLink to="/mapping-mca" />
//                     MCA Mapping
//                   </Menu.Item>

//                   <Menu.Item key="9">
//                     <NavLink to="/coverage" />
//                     Coverage
//                   </Menu.Item>

//                   <Menu.Item key="11">
//                     <NavLink to="/productivity-log" />
//                     Productivity Log
//                   </Menu.Item>

//                   <Menu.Item key="12">
//                     <NavLink to="/non-therapeutic-studies" />
//                     Non-Therapeutic Studies
//                   </Menu.Item>


//                   <Menu.Item key="14" className="large-content" >
//                     <NavLink to="/hims-master-task-list" />
//                     HIMS Master Task List
//                   </Menu.Item>

//                   <Menu.Item key="15" className="large-content" >
//                     <NavLink to="/hims-staff-schedule" />
//                     HIMS Staff Schedule
//                   </Menu.Item>

//                   <Menu.Item key="28">
//                     <NavLink to="/documentation" />
//                     Documentation
//                   </Menu.Item>

//                 </SubMenu>
//                 {managementServices}
//                 <SubMenu
//                   key="sub7"
//                   icon={<SettingOutlined />}
//                   title={'Settings'}
//                   style={{ fontSize: "12.8px" }}
//                 >
//                   <Menu.Item key="29">
//                     <NavLink to="/change-password" />
//                     Change Password
//                   </Menu.Item>

//                 </SubMenu>


//               </Menu>
//             )
//             : (
//               <Menu
//                 defaultOpenKeys={['sub1']}
//                 mode="inline"

//               >


//                 <SubMenu
//                   key="sub1"
//                   icon={<DashboardOutlined />}
//                   title="Team Dashboard"
//                 >
//                   {
//                     current.subSection == 'PB' ?
//                       <Menu.Item key="1">
//                         <NavLink to="/pb-team-dashboard-cards" />
//                         Performance Cards
//                       </Menu.Item> :
//                       null
//                   }


//                   {
//                     current.subSection == 'HB' ?
//                       <Menu.Item key="1">
//                         <NavLink to="/hb-team-dashboard-cards" />
//                         Performance Cards
//                       </Menu.Item> :
//                       null
//                   }


//                   {
//                     current.subSection == 'RBB' ?

//                       <Menu.Item key="1">
//                         <NavLink to="/pb-team-dashboard-cards" />
//                         PB Performance Cards
//                       </Menu.Item>

//                       :
//                       null
//                   }

//                   {
//                     current.subSection == 'RBB' ?
//                       <Menu.Item key="2">
//                         <NavLink to="/hb-team-dashboard-cards" />
//                         HB Performance Cards
//                       </Menu.Item> :
//                       null
//                   }

//                   <Menu.Item key="2600">
//                     <NavLink to="/intake-request" />
//                     Intake Requests
//                   </Menu.Item>
//                   <Menu.Item key="3">
//                     <NavLink to="/rb-team-dashboard-reminders" />
//                     Reminders
//                   </Menu.Item>

//                   <Menu.Item key="4">
//                     <NavLink to="/rb-team-dashboard-calendar" />
//                     Calendar
//                   </Menu.Item>
//                   <Menu.Item key="5">
//                     <NavLink to="/rb-team-dashboard-avatars" />
//                     Avatars
//                     {
//                       showNew ?
//                         <span style={{ color: "#1DA57A", fontSize: "9px", marginLeft: "5px" }}>(New)</span>
//                         : null
//                     }
//                   </Menu.Item>
//                 </SubMenu>



//                 {
//                   current.subSection == 'PB' || current.subSection == 'RBB' ?

//                     <Menu.Item key="6" icon={<ProfileOutlined />}>
//                       <NavLink to="/wq5508" />
//                       WQ5508
//                     </Menu.Item>
//                     : null

//                 }

//                 {
//                   current.subSection == 'PB' || current.subSection == 'RBB' ?
//                     <Menu.Item key="7" icon={<ProfileOutlined />}>
//                       <NavLink to="/wq1075" />
//                       WQ1075
//                     </Menu.Item>
//                     : null
//                 }

//                 {
//                   current.subSection == 'PB' || current.subSection == 'RBB' ?
//                     <Menu.Item key="78" icon={<ProfileOutlined />}>
//                       <NavLink to="/wq3177" />
//                       WQ3177
//                     </Menu.Item>
//                     : null
//                 }

//                 {
//                   current.subSection == 'HB' || current.subSection == 'RBB' ?
//                     <Menu.Item key="8" icon={<ProfileOutlined />}>
//                       <NavLink to="/wq1262" />
//                       WQ1262
//                     </Menu.Item>
//                     : null
//                 }

//                 {
//                   current.auditAccess ?
//                     <SubMenu
//                       key="sub90"
//                       icon={<FileWordOutlined />}

//                       title={'WQ Audits'}
//                     >
//                       <Menu.Item key="2205" className="large-content" >
//                         <NavLink to="/pbwqaudit" />
//                         PB WQ Audit
//                       </Menu.Item>


//                       <Menu.Item key="2206" className="large-content" >
//                         <NavLink to="/hbwqaudit" />
//                         HB WQ Audit
//                       </Menu.Item>

//                       <Menu.Item key="169"  >
//                         <NavLink to="/team-audit-graphs" />
//                         Team Audit Graphs
//                       </Menu.Item>

//                       <Menu.Item key="170"  >
//                         <NavLink to="/error-irbs" />
//                         Error IRBs
//                       </Menu.Item>

//                     </SubMenu>
//                     : null
//                 }

//                 <SubMenu
//                   key="sub2"
//                   icon={<TeamOutlined />}
//                   title="Administration"
//                 >


//                   {/* <Menu.Item key="800" className="large-content" >
//                     <NavLink to="/mapping-oncore" />
//                     Mapping OnCore
//                   </Menu.Item> */}

//                   <Menu.Item key="801" className="large-content" >
//                     <NavLink to="/mapping-mca" />
//                     MCA Mapping
//                   </Menu.Item>

//                   <Menu.Item key="166"  >
//                     <NavLink to="/data-control" />
//                     Data Control
//                   </Menu.Item>
//                   <Menu.Item key="9">
//                     <NavLink to="/coverage" />
//                     Coverage
//                   </Menu.Item>
//                   {
//                     current.subSection != 'RB' ?
//                       <Menu.Item key="11">
//                         <NavLink to="/productivity-log" />
//                         Productivity Log
//                       </Menu.Item>
//                       : null
//                   }



//                   <Menu.Item key="12">
//                     <NavLink to="/non-therapeutic-studies" />
//                     Non-Therapeutic Studies
//                   </Menu.Item>


//                   <Menu.Item key="14" className="large-content" >
//                     <NavLink to="/hims-master-task-list" />
//                     HIMS Master Task List
//                   </Menu.Item>

//                   <Menu.Item key="15" className="large-content" >
//                     <NavLink to="/hims-staff-schedule" />
//                     HIMS Staff Schedule
//                   </Menu.Item>



//                 </SubMenu>


//                 {current.adminAccess && current.outside != 1 ?
//                   managementServices
//                   : null
//                 }
//                 <SubMenu
//                   key="sub7"
//                   icon={<SettingOutlined />}
//                   title={'Settings'}
//                   style={{ fontSize: "12.8px" }}
//                 >
//                   <Menu.Item key="29">
//                     <NavLink to="/change-password" />
//                     Change Password
//                   </Menu.Item>

//                 </SubMenu>



//               </Menu>
//             )
//         }
//       </Sider>

//       <Modals config={{
//         title: "Status",
//         openModal: open,
//         handleCancel: close,
//         close: true
//       }}>
//         <div>
//           <p>Your current status is {Status}</p>
//           To continue set it to <Button type="primary" className="ml-168" onClick={setWorkingStatus}>Working</Button>
//         </div>
//       </Modals>
//     </>
//   );
// }
// export default Navigation;




import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import { request } from "@/request";
import { useSelector, useDispatch } from "react-redux";
import logo from "../../assets/images/logo.png";
import {user} from '@/redux/user/actions'
import Modals from "@/components/Modal";

import {
  SettingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  TeamOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  FileWordOutlined


} from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import {  selectUsersList } from "@/redux/user/selectors";


import { logout } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";

const { Sider } = Layout;
const { SubMenu } = Menu;

const showNew = true

function Navigation() {
  const { current } = useSelector(selectAuth);
  const [Status, setStatus] = useState(current.Status)
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState("")
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const onCollapse = () => {
    setCollapsed(!collapsed);
  };

  const close = () => {
    setOpen(false)
  }

  const allSubSections = ['AD','PB', 'HB', 'RBB']
  const pbSubSections = ['AD','PB',  'RBB']
  const hbSubSections = ['AD','HB', 'RBB']




  const menuList = [
    {
      path: "", title: "RB Team Dashboard", key: "sub1", category : "SUB_MENU" , icon: <DashboardOutlined/>, show: allSubSections.includes(current.subSection),
      options:[
        { path:"/pb-team-dashboard-cards", key:"1", title:"PB Performance Cards",category : "MENU" , show: pbSubSections.includes(current.subSection) },
        { path:"/hb-team-dashboard-cards", key:"2", title:"HB Performance Cards",category : "MENU", show: hbSubSections.includes(current.subSection)},
        { path:"/intake-request", key:"2600", title:"Intake Requests",category : "MENU", show: allSubSections.includes(current.subSection) },
        { path:"/rb-team-dashboard-reminders", key:"3", title:"Reminders",category : "MENU" ,show: allSubSections.includes(current.subSection)},
        { path:"/rb-team-dashboard-calendar", key:"4", title:"Calanders",category : "MENU" ,show: allSubSections.includes(current.subSection)},
        { path:"/rb-team-dashboard-avatars", key:"5", title:"Avatars",category : "MENU" ,show: allSubSections.includes(current.subSection)}
      ]
    },
    
    {
      path: "/wq5508", title: "WQ5508", key: "6", category : "MENU" , icon: <ProfileOutlined/>, options:[],  show: pbSubSections.includes(current.subSection)
    },
    {
      path: "/wq1075", title: "WQ1075", key: "7", category : "MENU" , icon: <ProfileOutlined/>, options:[],  show: pbSubSections.includes(current.subSection)
    },
    {
      path: "/wq3177", title: "WQ3177", key: "78", category : "MENU" , icon: <ProfileOutlined/>, options:[],  show: pbSubSections.includes(current.subSection)
    },
    {
      path: "/wq1262", title: "WQ1262", key: "8", category : "MENU" , icon: <ProfileOutlined/>, options:[],  show: hbSubSections.includes(current.subSection)
   },
    { path:"", key:"sub90", title:"WQ Audits",category : "SUB_MENU", icon : <FileWordOutlined /> , show: current.managementCard == '1' || current.auditAccess,
        options:[
          { path:"/pbwqaudit", key:"2205", title:"PB WQ Audit",category : "MENU", show: current.managementCard == '1' || current.auditAccess },
          { path:"/hbwqaudit", key:"2206", title:"HB WQ Audit",category : "MENU", show: current.managementCard == '1' ||  current.auditAccess },
          { path:"/team-audit-graphs", key:"169", title:"Team Audit Graphs",category : "MENU", show: current.managementCard == '1' ||  current.auditAccess  },
          { path:"/error-irbs", key:"170", title:"Error IRBs",category : "MENU", show: current.managementCard == '1' ||  current.auditAccess  },
        
        ] },
    {
      path: "", title: "Administration", key: "sub2", category : "SUB_MENU" , icon: <TeamOutlined/>, show: allSubSections.includes(current.subSection) ,
      options:[
        { path:"/mapping-mca", key:"800", title:"Mapping",category : "MENU" , show: allSubSections.includes(current.subSection) ,},
        { path:"/coverage", key:"9", title:"Coverage",category : "MENU", show: allSubSections.includes(current.subSection) , },
        { path:"/productivity-log", key:"11", title:"Productivity Log",category : "MENU", show: allSubSections.includes(current.subSection) , },
        { path:"/non-therapeutic-studies", key:"12", title:"Non Therapeutic Studies",category : "MENU" ,show: allSubSections.includes(current.subSection),},
        { path:"/hims-master-task-list", key:"14", title:"HIMS Master Task List",category : "MENU" ,show: allSubSections.includes(current.subSection),},
        { path:"/hims-staff-schedule", key:"15", title:"HIMS Staff Schedule",category : "MENU",show:allSubSections.includes(current.subSection), },
        { path:"/data-control", key:"166", title:"Data Control",category : "MENU" ,show: allSubSections.includes(current.subSection),},
      ]
    },
    
   
    {
      path: "", title: <div style={{ display: "flex", flexDirection: "column" }}><span className="header italic" style={{ marginTop: "5px", fontSize: "14px !important" }}>Management Services</span>  </div>, key: "sub4", category : "SUB_MENU" , icon: <AppstoreOutlined/>, show: current.managementCard == '1' || current.adminAccess,
      options:[
        
        { path:"/wqauditerrors", key:"3000", title:"Audit Errors",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/wq-errors", key:"3001", title:"WQ Errors",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/wq-error-graphs", key:"3002", title:"WQ Error Graphs",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},

        { path:"/performance-cards", key:"17", title:"Performance Cards",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"", key:"sub8", title:<span >Professionals Center</span>,category : "SUB_MENU", show: current.managementCard == '1' || current.adminAccess,
        options:[
          { path:"/productivity-metrics/graphs", key:"18", title:"Graphs",category : "MENU", show: current.managementCard == '1' || current.adminAccess },
          { path:"/productivity-metrics/tables", key:"19", title:"Tables",category : "MENU",show: current.managementCard == '1' || current.adminAccess },
        ] },
        { path:"", key:"sub1234", title:"Bzz R&D",category : "SUB_MENU",show: current.managementCard == '1' || current.adminAccess,
        options:[
          { path:"/5508-flowchart", key:"19001", title:"WQ5508 Flowchart",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
          { path:"/1075-flowchart", key:"19002", title:"WQ1075 Flowchart",category : "MENU",show: current.managementCard == '1' || current.adminAccess },
          { path:"/1262-flowchart", key:"19003", title:"WQ1262 Flowchart",category : "MENU",show: current.managementCard == '1' || current.adminAccess },
        ] },
        { path:"", key:"sub9", title:"Data Control Center",category : "SUB_MENU",show: current.managementCard == '1' || current.adminAccess,
        options:[
          { path:"/data-control-center/irb", key:"30", title:"IRB",category : "MENU", show: current.managementCard == '1' || current.adminAccess },
        ] },
        
        { path:"/denials", key:"2200", title:"Denials",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/wq-1075-kpis", key:"165", title:"WQ 1075 KPIs",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/epic-productivity", key:"20", title:"Epic Productivity",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/reminders", key:"22", title:"Reminders",category : "MENU", show: current.managementCard == '1' || current.adminAccess },
        { path:"/team-calendar", key:"23", title:"Team Calendar",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/management-milestones", key:"24", title:"Milestones",category : "MENU" , show: current.managementCard == '1' || current.adminAccess},
        { path:"/emaillogger", key:"25", title:"Email Logger",category : "MENU" ,show: current.managementCard == '1' || current.adminAccess},
        { path:"/management-roadmap", key:"26", title:"RoadMap",category : "MENU", class:"large-content",show: current.managementCard == '1' || current.adminAccess },
        { path:"/master-staff-list", key:"27", title:"Master Staff List",category : "MENU",class:"large-content",show: current.managementCard == '1' || current.adminAccess }
      ]
    },
    {
      path: "", title: "Settings", key: "sub7", category : "SUB_MENU" , icon: <SettingOutlined/>, show: allSubSections.includes(current.subSection),
      options:[
        { path:"/change-password", key:"29", title:"Change Password",category : "MENU",show: allSubSections.includes(current.subSection) },
      ]
    }
  ]

  console.log(menuList)

  let TabMap = [];
  TabMap['pb-team-dashboard-cards'] = '1'
  TabMap['hb-team-dashboard-cards'] = '2'
  TabMap['intake-request'] = '2600'
  TabMap['rb-team-dashboard-calendar'] = '3'
  TabMap['rb-team-dashboard-calendar'] = '4'
  TabMap['rb-team-dashboard-avatars'] = '5'
  TabMap['wq5508'] = '6'
  TabMap['wq1075'] = '7'
  TabMap['wq3177'] = '78'
  TabMap['wq1262'] = '8'
  TabMap['mapping'] = '800'
  TabMap['coverage'] = '9'
  TabMap['productivity-log'] = '11'
  TabMap['non-therapeutic-studies'] = '12'
  TabMap['hims-master-task-list'] = '14'
  TabMap['hims-staff-schedule'] = '15'
  TabMap['documentation'] = '28'
  TabMap['change-password'] = '29'
  TabMap['performance-cards'] = '17'
  TabMap['productivity-metrics/graphs'] = '18'
  TabMap['productivity-metrics/tables'] = '19'
  TabMap['5508-flowchart'] = '19001'
  TabMap['1075-flowchart'] = '19002'
  TabMap['1262-flowchart'] = '19003'
  TabMap['data-control-center/irb'] = '30'
  TabMap['pbwqaudit'] = '2205'
  TabMap['hbwqaudit'] = '2206'
  TabMap['team-audit-graphs'] = '169'
  TabMap['denials'] = '2200'
  TabMap['wq-1075-kpis'] = '165'
  TabMap['epic-productivity'] = '20'
  TabMap['reminders'] = '22'
  TabMap['team-calendar'] = '23'
  TabMap['management-milestones'] = '24'
  TabMap['emaillogger'] = '25'
  TabMap['management-roadmap'] = '26'
  TabMap['master-staff-list'] = '27'
  TabMap['error-irbs'] = '170'
  TabMap['wqauditerrors'] = '3000'
  TabMap['wq-errors'] = '3001'
  TabMap['wq-error-graphs'] = '3002'



  useEffect(() => {
      dispatch(user.list('admin'))
      console.log(location.pathname)
      let key = TabMap[location.pathname.slice(1)]?Number(TabMap[location.pathname.slice(1)]):1
      setCurrentTab(key)
  }, [])


 
  
  const updateStatus = async  (status) => {
    setStatus(status)
    updateLocal(status)
    await request.update('jwt', current.EMPID , {Status: status})
    await request.create("/pageLogger", {Url : '', Page : '', Status: status, UserName: current.name});
  }
  

  useEffect(() => {
    if(Status != 'Working') {
      setOpen(true)
    }
  }, [Status])
  
  const setWorkingStatus = () => {
    setStatus('Working')
    current.Status = 'Working'
    updateLocal('Working')
    let z = localStorage.getItem('CurrentTab')
    console.log(z)
    if(z) localStorage.removeItem('CurrentTab')
  }


  const updateLocal = (status) => {
    let auth = JSON.parse(localStorage.getItem('auth'))
    auth.current.Status = status
    localStorage.setItem('auth', JSON.stringify(auth))
    setOpen(false)
  }


  

  const menu = (
    <Menu>

      <Menu.Item key="1000" onClick={() => updateStatus('Working')}>
        <CheckCircleOutlined style={{ color: "#adff2f" }} /> Working
      </Menu.Item>
      <Menu.Item key="2000" onClick={() => updateStatus('Meeting')}>
        <MinusCircleOutlined style={{ color: "#ff0000" }} /> Meeting
      </Menu.Item>
      <Menu.Item key="3000" onClick={() => updateStatus('Away')}>
        <CloseCircleOutlined /> Away
      </Menu.Item>


      <Menu.Item key={`${uniqueId()}`} onClick={() => dispatch(logout())}> <LogoutOutlined /> Log Out </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        style={{
          zIndex: 1000,
          background: "#fff",
          overflow: "hidden"
        }}
      >
      <div className="logo">
           <div>

             <div style={{ width: "180px" }}>
               <div style={{ width: "50px", display: "contents" }}>
         <Dropdown overlay={menu} placement="bottomRight" arrow>

                 <img style={{ height: "50px", marginTop: "-5px" }} src={logo} />
         </Dropdown>

               </div>
               <div className="" style={{ width: "150px", display: "contents" }} >
                 <span style={{ verticalAlign: "top", width: "125px", display: "inline-flex", flexDirection: "column" }}>
                   <span className="text-center sub-header">Research Billing</span>
                   <span className="header username">{current ? current.Nickname.split(" ")[0] : ""}


                   </span>
                 </span>
               </div>
             </div>
           </div>

       </div>

        <Menu mode="inline" defaultOpenKeys={['sub1']} selectedKeys={[`${currentTab}`]} onSelect={(item, key, keyPath, selectedKeys, domEvent)=>{
                  setCurrentTab(item.key)
                }}>
                  

                  {
                    menuList.map((menu,index)=>{
                      return(
                            <>
                              {menu.category=="SUB_MENU" && menu.show ? (
                            <SubMenu
                            key={menu.key}
                            icon={menu.icon}
                            title={menu.title}
                            >
                              {
                                menu.options.map((submenu,index)=>{
                                  return(
                                    <>
                                      {
                                        submenu.category ==="SUB_MENU" && submenu.show?(
                                          <SubMenu
                                            key={submenu.key}
                                            icon={submenu.icon}
                                            title={submenu.title}
                                            >
                                              {
                                                submenu.options.map((submenuOption,index)=>{

                                                    if (submenuOption.show) {

                                                    return (
                                                      <Menu.Item key={submenuOption.key}>
                                                        <NavLink to={submenuOption.path} />
                                                        {submenuOption.title}
                                                      </Menu.Item>
                                                    )
                                                  }

                                                })
                                              }
                                            </SubMenu>
                                        ):
                                        submenu.show ?
                                        (

                                          <Menu.Item key={submenu.key}>
                                          <NavLink to={submenu.path} />
                                          {submenu.title}
                                          {submenu.title==="Avatars"?(
                                            <>
                                              {
                                              showNew ?
                                                <span style={{color: "#1DA57A", fontSize: "9px", marginLeft: "5px"}}>(New)</span>
                                                : null
                                              }
                                            </>
                                          ):""}
                                        </Menu.Item>
                                        ) : ""
                                      }
                                    </>
                                    
                                  )
                                })
                              }        
                            </SubMenu>
                          ):
                          menu.show ?
                          (
                             
                                <Menu.Item key={menu.key} icon={menu.icon}>
                                  <NavLink to={menu.path}/>
                                  {menu.title}
                                </Menu.Item>
                          )
                        
                        : ""}
                            </>
                          
                          
                      )
                    })
                  }
                  </Menu>

       
      </Sider>

      <Modals config={{
          title: "Status",
          openModal: open,
          handleCancel: close,
          close: true
        }}>
          <div>
            <p>Your current status is {Status}</p>
            To continue set it to <Button type="primary" className="ml-168" onClick={setWorkingStatus}>Working</Button> 
          </div>
        </Modals>
    </>
  );
}
export default Navigation;