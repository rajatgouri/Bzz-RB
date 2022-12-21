import React, {useState,useEffect, useRef} from "react";
import {  Button } from "antd";
import ColorsButton from "../ColorButton"
import ColorPopup from '../ColorPopup'
import { mappedColorData } from "@/utils/helpers";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";


export default function ColorListBox({ entity, dataTableTitle, items, selectedRowKeys,  selectedRowID, mrnFilterAndCopied, colorsList = [], updateColorList, show, modal = false ,handleSaveColor,handleColorChange, setColorList,showClock, timer,getDefaultColors, filters ={} , dataSource = []}) {


  const { current } = useSelector(selectAuth);
  const childRef  = useRef()

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
  
  

      const onSelectColor = (index, color, all = false) => {

        let keys = []
        if (all && !modal) {
  
          let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
          let patientMRN = item['Patient MRN']
          
          if (entity == 'wq1075' && filters && (filters['Process Type'] == "Top 10 $ Amount" || filters['Process Type'] == 'Top 10 Aging Days')) {
            keys = dataSource.map(d => d.ID)
          } else {
            keys = (items.filter(item => (filters['Status'] ? filters['Status'].includes(item.Status) : item.Status == 'Review' ) && item['Patient MRN'] == patientMRN)).map(item => item.ID)
          }
  
          mrnFilterAndCopied()
  
        } else if (all && modal) {
  
          let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
          let patientMRN = item['Patient MRN']
  
          
          if (entity == 'wq1075' && filters && (filters['Process Type'] == "Top 10 $ Amount" || filters['Process Type'] == 'Top 10 Aging Days')) {
            keys = dataSource.map(d => d.ID)
          } else {
            keys = (items.filter(item => (filters['Status'] ? filters['Status'].includes(item.Status) : item.Status == 'Review' ) && item['Patient MRN'] == patientMRN)).map(item => item.ID)
          }
          
          mrnFilterAndCopied()
  
  
        } else {
          keys = selectedRowKeys
  
        }
  
        handleColorChange(color, keys, all);
        makeSelectedHightlight(index)
        if(childRef.current) {
          childRef.current.changeColorIndex(index)
          childRef.current.changePickerColor(color)

        }
        
  
      }


      const makeSelectedHightlight = (index) => {
        let list = colorsList;
        for (let i = 0; i < colorsList.length; i++) {
          list[i].selected = false
        }
        list[index].selected = true;
        updateColorList(list)
      }
  
  
      const onSaveColors = async (colors) => {
        
        let data = await mappedColorData(colors)
        handleSaveColor(current.EMPID, data);
  
      }
  
   
     
      const config = {
        colorsButton: ColorsButton, 
        colorsList: colorsList, 
        setColorList:setColorList, 
        setColorList:setColorList, 
        onSaveColors:onSaveColors, 
        onSaveColors:onSaveColors, 
        selectedRowID:selectedRowID, 
        onSelectColor:onSelectColor,
        getDefaultColors:getDefaultColors,
        ref: childRef

      }


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
  
  
  
  
          <div style={{ display: "inline-block", position: "relative", width: modal ? "280px" : "265px", }} className="color-box">
            <ColorsButton onSelectColor={onSelectColor} colorsList={colorsList}/>
            <div className="">
  
            <div className="Inline-left">
  
            
          
              {
                !modal ? 
                <ColorPopup config={config}/>
              : null
  
              }
            </div>
            <div style={{ textAlign: "end" }} className="Inline-right-1">
              <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color" style={{ background:  colorsList && colorsList.filter(li => li.text == 'Done')[0]['color'], marginLeft: "14px" }} onClick={() => onSelectColor(0, colorsList.filter(li => li.text == 'Done')[0]['color'], true)}>Done All</Button>
              <Button size="small" disabled={selectedRowKeys.length < 1} className="all-color ml-2" style={{ background: colorsList && colorsList.filter(li => li.text == 'Pending')[0]['color'] }} onClick={() => onSelectColor(1,  colorsList.filter(li => li.text == 'Pending')[0]['color'], true)}>Pending All</Button>  
            </div>
            </div>
  
          </div>
  
        </>
      );    
  
}
 

    

  

  


         
          