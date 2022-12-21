
import React, { useEffect, useState } from "react";
import { Modal, List, Button } from "antd";
import ReactDragListView from "react-drag-listview";

export default function forwardRef({ config, children }) {
  let { title,  openModal, handleCancel , width = 400, style = {}, centered = true, minHeight="0px" , close, columns, onSort, type= "WQ"} = config;
  const [data, setData] = useState([])

 

  useEffect(() => {
    setData(columns)
  }, [columns])

 
 const onDragEnd = (fromIndex, toIndex) => {
    if (toIndex < 0) return; // Ignores if outside designated area

    const items = [...data];
    const item = items.splice(fromIndex, 1)[0];
    items.splice(toIndex, 0, item);
    setData( items );
  };
  return (
    <>
    <Modal maskClosable={close ? false: true} centered={centered} bodyStyle={{minHeight: minHeight}}  style={style} title={title} visible={openModal} onCancel={handleCancel} footer={null} closeIcon={close ?  <span style={{visibility: "hidden"}} >"."</span> : "" }  width={width}>
    <ReactDragListView
          nodeSelector=".ant-list-item.draggble"
          onDragEnd={onDragEnd}
        >
          <List
            size="small"
            bordered
            dataSource={data }
            renderItem={(item, i) => {
            
              console.log(item)
                let draggable = type == 'WQ' ? (
                  item.dataIndex !== 'START'
                  && item.dataIndex !== 'PLAY'
                  && item.dataIndex !== 'FINISH'
                  && item.dataIndex !== 'UploadDateTime'
                  && item.dataIndex !== 'StartTimeStamp'
                  && item.dataIndex !== 'FinishTimeStamp'
                  && item.dataIndex !== 'OriginalUserAssigned'
                  && item.dataIndex !== 'Duration'
                  && item.dataIndex !== null 
                  && item.dataIndex !== undefined 
                  && item.dataIndex !== 'Error'
                  && item.dataIndex !== 'Answer'
                  && item.title !== 'Action'
                  && item.title !== 'Password'
                  && item.title !== 'EMPID'
                  && item.dataIndex !== 'Notes'
                  &&  item.dataIndex !== 'Correct'
                
                ) : 
                (
                 
                   item.dataIndex !== null 
                  && item.dataIndex !== undefined 
                  && item.title !== 'Action'
                  && item.title !== 'Password'
                  && item.title !== 'EMPID'

                 
                
                )

                if (draggable) {

                  return (
                    <List.Item
                      className={ "draggble" }
                    >
                        <span className="badge">{i+1}</span>  {item.title}
                    </List.Item>
                  ) }
                  else {
                    return   <div className={ "draggble" }> </div>

                  }
               
               
            }}
          />
        </ReactDragListView>
        <div className="text-end mt-8">
        <Button  type="primary"onClick={() => onSort(data)}>Save</Button>

        </div>
      </Modal>
    </> 
  );
}
