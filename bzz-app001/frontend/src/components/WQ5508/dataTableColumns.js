import React, { useEffect } from "react";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import GreenDot from "assets/images/green-dot.png"
import { EyeOutlined } from "@ant-design/icons";


export default function DataTableColumns({ config }) {
  let { filteredValue , getColumnSearchProps, filters, users, current} = config;
  
  const dataTableColumns = [
    {
      title: "START", width: 100, dataIndex: "START" ,
      align: 'center',
      order: 1
    },
    

    (
      filteredValue['Process Type'] == 'Standard'?
      (
   
      {
        title: "Answer", width: 90, dataIndex: "Answer" ,
        order:2,
        filters: [],
        filteredValue: filteredValue['Answer'] || null

      }
      ): 
       {
         dataIndex: "Answer", order: 2
       }
    ),
    (
      filteredValue['Process Type'] == 'Standard'?
      (
   
      {
        title: "Correct", width: 90, dataIndex: "Correct" ,
        filters: [
          { text: <img src={GreenDot} height="9px"/>, value: 1 },
          { text: <img src={RedDot} height="9px"/>, value: 0 },
          { text: <img src={WhiteDot} height="9px"/>, value: null }
  
        ],
        order:3,
        filteredValue: filteredValue['Correct'] || null
      }
      ): 
       {
         dataIndex: "Correct", order: 3
       }
    ),
    {
      title: "Error", width: 70, dataIndex: "Error" ,
      filters: [
        { text: <img src={RedDot} height="9px"/>, value: 0 },
        { text: <img src={WhiteDot} height="9px"/>, value: 1 }
      ],
      order: 4,
      filteredValue: filteredValue['Error'] || null
    },
    {
      title: "Notes", width: 80, dataIndex: "Notes", filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value:  1}
      ],
      order: 5,
      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "FINISH", width: 100, dataIndex: "FINISH" ,
      align: 'center',
      order: 6,

    },
   
    { title: "Service", dataIndex: "Svc Date", width: 90, sorter: { multiple: 1}, 
    order: 7,

      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Svc Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Svc Date")[0].order : null, 
    },
    {
      title: "MRN",
      dataIndex: "Patient MRN",
      width: 100,
      order: 8,

      ...getColumnSearchProps("Patient MRN"),
      filteredValue: filteredValue['Patient MRN'] || null ,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient MRN")[0].order : null
    },
    {
      title: "Status", width: 80, dataIndex: "Status",
      order: 9,

      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Misc", value: "Misc" },
        { text: "Deferred", value: "Deferred" },
        { text: "Review", value: "Review" }
      ],
      filteredValue: filteredValue['Status'] || null 
    },
    {
      title: "Patient",
      dataIndex: "Patient",
      order: 10,

      width: 220,
      sorter: { multiple: 24},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Patient")[0].order : null,
      // ...getColumnSearchProps("Patient"),
      filters: filteredValue['Process Type'] == "Expedite" ? 
      filters['Patient-Expedite'] : 
      filteredValue['Process Type'] == "Standard" ?
      filters['Patient-Standard'] :
      filters['Patient-Common'],
      filterSearch: true,
      filteredValue: filteredValue['Patient'] || null 
    },
    { title: "IRB",
      dataIndex: "Research IRB", 
      width: 80, 
      order: 11,

      // ...getColumnSearchProps("Research IRB"),
      filters: filteredValue['Process Type'] == "Expedite" ? 
       filters['Research IRB-Expedite'] : 
       filteredValue['Process Type'] == "Standard" ?
       filters['Research IRB-Standard'] :
       filters['Research IRB-Common'],
      sorter: { multiple: 4},
      filterSearch: true,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Research IRB").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Research IRB")[0].order : null, 
      filteredValue: filteredValue['Research IRB'] || null 
    },
    { title: "CPT", 
      dataIndex: "CPT Codes", 
      width: 110, 
      order: 12,
      feature: "tooltip",
      ...getColumnSearchProps("CPT Codes"),
      filteredValue: filteredValue['CPT Codes'] || null ,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT Codes").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT Codes")[0].order : null,
     filteredValue: filteredValue['CPT Codes'] || null 
    },
    { title: "Amount", dataIndex: "Sess Amount", width: 100, sorter: { multiple: 2},
    order: 13,

      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Sess Amount").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Sess Amount")[0].order : null,
    },
    { title: "Coverage", 
      dataIndex: "Primary Coverage", 
      width: 350, 
      order: 14,

      filters: filteredValue['Process Type'] == "Expedite" ? 
       filters['Primary Coverage-Expedite'] : 
       filteredValue['Process Type'] == "Standard" ?
       filters['Primary Coverage-Standard']:
       filters['Primary Coverage-Common'],
      filterSearch: true,
      filteredValue: filteredValue['Primary Coverage'] || null ,
      sorter: { multiple: 8 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Primary Coverage").length > 0) ? filteredValue.sort.filter((value) => value.field == "Primary Coverage")[0].order : null
    },
    { title: "Study Type", dataIndex: "Study Type", width: 130 ,
    order: 15,

    filters: filteredValue['Process Type'] == "Expedite" ? 
     filters['Study Type-Expedite'] :  
     filteredValue['Process Type'] == "Standard" ?
     filters['Study Type-Standard']:
     filters['Study Type-Common'],
    filteredValue: filteredValue['Study Type'] || null ,
    filterSearch: true,

  },
  
  { title: "Study Status", dataIndex: "Study Status", width: 130 ,
  order: 16,

  filters: filteredValue['Process Type'] == "Expedite" ? 
     filters['Study Status-Expedite'] :  
     filteredValue['Process Type'] == "Standard" ?
     filters['Study Status-Standard']:
     filters['Study Status-Common'],
     filterSearch: true,
     filteredValue: filteredValue['Study Status'] || null ,
     filterSearch: true,
  },
    {
      title: "Timely",
      width: 80,
      order: 17,

      dataIndex: "Days Until Timely Filing",
    },
    { title: "Aging", width: 70, dataIndex: "Aging Days", sorter: { multiple: 3},
    order: 18,

      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Aging Days") ? filteredValue.sort.order : null,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Aging Days").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Aging Days")[0].order : null,
    
    },

    { title: "Enrolled - Active", width: 140, dataIndex: "Enrolled - Active", sorter: { multiple: 4},
    order: 19,

      // sortOrder: (filteredValue.sort && filteredValue.sort.column == "Enrolled - Active") ? filteredValue.sort.order : null,
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Enrolled - Active").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Enrolled - Active")[0].order : null,
    
    },

    { title: "Consented", width: 110, dataIndex: "Consented", sorter: { multiple: 5},
    order: 20,
    
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Consented").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Consented")[0].order : null,
    },

    { title: "IsScreening", width: 110, dataIndex: "IsScreening", 
    filters: [
      { text: "Y" , value: "Y" },
      { text: "N", value: "N" },
      { text: "" , value: "null" }
    ],
    order: 21,

    filteredValue: filteredValue['IsScreening'] || null
    },

    
    {
      title: "User Assigned", width: 130, dataIndex: "UserAssigned", filters: users,
      filteredValue: filteredValue['UserAssigned'] || null,
      filterSearch: true,
      order: 22,


    },
    
    { title: "User Logged", width: 120, dataIndex: "User" ,
    filters: [...users, {text: "", value: "null"}],
    filteredValue: filteredValue['User'] || null ,
    filterSearch: true,
    order: 24,



  },
    {
      title: "Start Time", dataIndex: "StartTimeStamp", width: 150, 
      sorter: { multiple: 5 },
      order: 25,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
    },
    {
      title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
      order: 26,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
    },
    {
      title: "Duration", dataIndex: "Duration", width: 100, 
      order: 27,

      ...getColumnSearchProps("Duration"),
      filteredValue: filteredValue['Duration'] || null
    },

    (
      current.managementAccess  == 1?
      (
        {
          title: "Original User Assigned", width: 200, dataIndex: "OriginalUserAssigned",
          filteredValue: filteredValue['OriginalUserAssigned'] || null ,
          filters: users,
            order: 28,

        }
      ): 
       {
         dataIndex: "OriginalUserAssigned", order: 28
       }
    )
  ];

  return dataTableColumns
}
