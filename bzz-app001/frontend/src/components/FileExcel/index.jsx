import React, { useState} from "react";
import {  Button } from "antd";
import { FileExcelOutlined} from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import Modals from "../Modal";
import SheetJS from "@/components/SheetJS";


export default function FileExcel({ config}) {
  const { entity} = config;
  const [clear, setClear] = useState(false)

  const [openExcelModal, setOpenExcelModal] = useState(false)

  const closeExcel = () => {
    setOpenExcelModal(false)
    setClear(!clear)
  }

  const openExcel = () => {
    setOpenExcelModal(true) 
  }

  const modalConfig = {
    title: "Excel viewer",
    openModal: openExcelModal,
    handleCancel: closeExcel,
    width: 1200
  };

  return (
    <>
       <Button className="ml-3" size="small" onClick={openExcel} key={`${uniqueId()}`}>
        <FileExcelOutlined />
        </Button>

        <div className="excel-modal">
        <Modals config={modalConfig}>
            <SheetJS config={{
              clear
            }}/>
        </Modals>
      </div>
    </> 
  );
}
