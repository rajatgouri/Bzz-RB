
import React, { useEffect, useState } from "react";
import {Button, Popover } from "antd";
import '@/style/partials/popover.less'

export default function forwardRef({ content , defaultOpen , children}) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    defaultOpen(newOpen)
   
    
  };

 

  return (
    <Popover
      content={
        
        content
      }
      title=""
      trigger="click"
      destroyTooltipOnHide={true}
      open={open}
      onOpenChange={handleOpenChange}
      autoAdjustOverflow={true}
    >
      

     {children}
    </Popover>
  );

}
