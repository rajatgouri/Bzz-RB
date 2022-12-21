// import React from "react";
// import { Modal } from "antd";


// export default function Modals({ config, children }) {
//   let { title,  openModal, handleCancel } = config;

//   return (
//     <>
//     <Modal maskClosable={false}  centered title={title} visible={openModal} onCancel={handleCancel} footer={null}  width={400}>
//         {children}
//       </Modal>
//     </> 
//   );
// }


import React from "react";
import { Modal } from "antd";


export default function Modals({ config, children }) {
  let { title,  openModal, handleCancel , width = 400, style = {}, centered = true, minHeight="0px" , close} = config;

  return (
    <>
    <Modal maskClosable={close ? false: true} centered={centered} bodyStyle={{minHeight: minHeight}}  style={style} title={title} visible={openModal} onCancel={handleCancel} footer={null} closeIcon={close ?  <span style={{visibility: "hidden"}} >"."</span> : "" }  width={width}>
        {children}
      </Modal>
    </> 
  );
}
