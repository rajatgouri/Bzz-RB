import React, {useEffect, useState} from "react";
import { Modal, Button, notification} from "antd";
import { CloudDownloadOutlined} from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import Modals from "../Modal";
import { request } from "@/request";

export default function ExportTable({ config}) {
  const { entity} = config;
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)

  
  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
  }


  const modalConfig = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };

  return (
    <>
       <Button className="ml-3" size="small" onClick={exportTable} key={`${uniqueId()}`}>
          <CloudDownloadOutlined />
        </Button>

        <Modals config={modalConfig}>
        <div className="confirm-modal">

          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary ml-3" danger  onClick={() => closeConfirmModal()}>No</Button>

          </div>
      </div>

        </Modals>
    </> 
  );
}
