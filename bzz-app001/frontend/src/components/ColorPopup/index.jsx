import React, {useState,useRef,useImperativeHandle, forwardRef, useEffect} from "react";
import { Dropdown, Button } from "antd";
import {CloseOutlined, SettingOutlined} from "@ant-design/icons";
import ColorsButton from "../ColorButton";
import uniqueId from "@/utils/uinqueId";



export default  forwardRef ( ({config}) => {
  var { colorsList, setColorList, setColorList, onSaveColors, onSaveColors, selectedRowID, onSelectColor,  getDefaultColors, ref}= config

  const inputColorRef = useRef(null);
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);

  useImperativeHandle(ref, () => ({
    changePickerColor(color) {
      setPickerColor(color)
    },
    changeColorIndex(index) {
      setColorIndex(index)
    }
  }));


  const  onDefault = () => {
      getDefaultColors((colors) => {

        let x = (colorsList.map((item, i) => {
            item['color'] = colors[i]['color']
            return item
        }))
        setColorList(x)
        onSaveColors(x)
      })
    }

 


  const handleDropDownClick = () => {
    if (selectedRowID) {
      return
    }

    setDropDownBox(!isDropDownBox);
  };

  const onCloseColor = () => {
    setColorIndex(null)
    setPickerColor("#FFFFFF")
    setDropDownBox(!isDropDownBox)
  }

  const onChangeColorPicker = (e) => {
    if (colorsList[colorIndex].color !== '#FFFFFF') {
      setPickerColor(e.target.value)
      if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return
      colorsList[colorIndex].color = e.target.value;
      setColorList(colorsList)
    }
  };

  const defaultColorChange =() => {
    onDefault()
    onCloseColor()
  }

  const onSave = (colorsList) =>{
    onSaveColors(colorsList)
  }

  const popUpContent = (
    <div className="dropDownBox">
      <div >
        <span className="float-left"></span>
        <span className="float-right padding-right padding-top" >
          <CloseOutlined onClick={() => onCloseColor()} />
        </span>
      </div>

      <div className="pad20" style={{ width: "300px", height: "180px", marginTop: "20px" }}>
        <div >
        <ColorsButton onSelectColor={onSelectColor} colorsList={colorsList}/>
        </div>
        <div >

          <input
            type="color"
            autoFocus
            ref={inputColorRef}
            value={pickerColor}
            onChange={onChangeColorPicker}
            className="colorpicker-input"
          />
          <Button style={{ float: "left" }} type="link" onClick={defaultColorChange}>Reset to Default Colors</Button>
          <Button style={{ float: "right", marginRight: "12px" }} type="primary" className="mb-1" onClick={() => onSave(colorsList)}>Save</Button>
        </div>

      </div>
    </div>
  );


  return (
    <Dropdown
    overlay={popUpContent}
    trigger={["click"]}
    visible={isDropDownBox}
    onClick={handleDropDownClick}
  >
    <Button style={{ marginTop: "5px", height: "25px" ,marginLeft: "5px" }} icon={<SettingOutlined />} />
  </Dropdown>
  )
} )

    

  

  


         
          