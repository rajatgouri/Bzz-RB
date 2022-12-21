import React, { useCallback, useEffect } from "react";
import { Radio, Table } from "antd";
import GreenDot from "assets/images/green-dot.png"
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"

import { EllipsisOutlined, IdcardOutlined, ReloadOutlined } from "@ant-design/icons";

import { request } from "@/request";
import { useState } from "react";

export default function NestedDataTable({ record,  dataTableColumns, entity}) {

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const onRowMarked = async(row, value) => {
  
    await request.update(entity + "-answers" , row.ID, {Incorrect: value ? '1' : '0'})
    loadTable(row.WQID)

  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "Incorrect") {
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
                  {text == '1' ? <img src={RedDot} width="9px" onClick={() => onRowMarked(row, false)} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked(row, true)} />}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Svc Date" || obj.dataIndex == "Post Date" ) {

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

  const loadTable = async  (id) => {
  
    setLoading(true)
    let response =  await request.list(entity+ "-answers", {id: JSON.stringify({id: id})});
    setItems([...response.result])
    setLoading(false)
   
  } 

  useEffect(() => {
    if (entity == 'wq1262') {
      loadTable(record['Acct ID'])

    } else if (entity == 'denials') {
      loadTable(record['Claim ID'])

    } 
    else {
      loadTable(record.ID)

    }
  }, [record])


return <Table 
columns={newDataTableColumns} 
dataSource={items} 
pagination={false} 
loading={loading}
/>;
}
