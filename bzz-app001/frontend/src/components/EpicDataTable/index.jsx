import React, { useCallback, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { Table, notification } from "antd";
import { selectEpicsList } from "@/redux/epic/selectors";
import {  CopyOutlined } from "@ant-design/icons";



export default function EPICDataTable({   dataTableColumns }) {

  var { result: listResult, isLoading: isLoading } = useSelector(selectEpicsList  );
  var {  items } = listResult;
  const [dataSource, setDataSource] = useState([])

  
  function copy(textToCopy, message = 'Billers Notes') {
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

    document.execCommand('copy') ? res() : rej();
    textArea.remove();

    notification.success({ message: message + " Copied!", duration: 3 })
    });
  }

  useEffect(() => {
    console.log(items)
    setDataSource(items? items : [])
  },[items])

  useEffect(( ) => {
    setDataSource([])
  }, [])

  const newDataTableColumns = dataTableColumns.map((obj) => {

    
    if (obj.dataIndex == "Review Date" || obj.dataIndex == "Service Date"  || obj.dataIndex == "SERVICE_DATE"  || obj.dataIndex == "DISCH_DATE" || obj.dataIndex == 'HAR_RVW_DATE') {

            return ({
        ...obj,
        render: (text, row) => {
    
          return {
            
            children: (
              <div>
                {text ? text.split("T")[0]  : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Review DateTime") {

      return ({
  ...obj,
  render: (text, row) => {

    return {
      
      children: (
        <div>
          {text ? text.split("T")[0] + " " + text.split("T")[1]?.substring(0, 8) : ""}
        </div>
      )
    };
  },
})
}



    if (obj.dataIndex == "BILLERs_NOTES"  || obj.dataIndex == "Notes"  ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
           
            children: (
              <div className="w-100">
                <div className="w-85 inline">
              {text}
                </div>
                <div className="w-15 inline text-end">

                {text && text.trim() != '' ?
                <CopyOutlined onClick={() => copy(text, 'Billers Note')} />
                  : null
              }
                </div>
                
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



return (

<div className="epic-table">
<Table 
columns={newDataTableColumns} 
dataSource={dataSource} 
pagination={false} 
loading={isLoading}
/>
   </div>
  
)

}
