import React, { useCallback, useEffect, useState } from "react";
import { Button, PageHeader, Table, Popover, Form, Input, notification } from "antd";

import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
// import IrbIcon from "../../assets/images/add-irb-icon.png";
import uniqueId from "@/utils/uinqueId";
import { CloseCircleTwoTone, CloseOutlined, ReloadOutlined } from "@ant-design/icons";

export default function DataTable({ config }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, handleRowClick , getItems, reload, addModal, getFilterValue} = config;
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = visible => {
    setVisible( visible );
  };

  
  const text = <div><span className="float-left">{addModal ? addModal.title : ""}</span><span className="float-right" onClick={() => handleVisibleChange(false)}><CloseOutlined/></span></div>;
  const content = addModal ?  addModal.content : "";
  
  const { result: listResult, isLoading: listIsLoading } =
    useSelector(selectListItems);

  const { pagination, items } = listResult;

  useEffect(() => {
    
    getItems(items)
  }, [items])

  useEffect(() => {
    if(reload) {
      const option = {
        page:  1,
        filter: JSON.stringify({}),
        sorter: JSON.stringify([])
      };
      dispatch(crud.list(entity, option));
      getFilterValue({})
      setVisible(false)
      

    }
  }, [reload])

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination, filter = {}, sorter = []) => {


    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    } 

    const option = { 
      page: pagination.current || 1 ,
      filter:  JSON.stringify(filter) || JSON.stringify({}), 
      sorter: JSON.stringify(filteredArray)
    };
    
    filter.sort = filteredArray;
    getFilterValue(filter);  

    dispatch(crud.list(entity, option));
  }, []);

  useEffect(() => {

    const option = {
      page:  1,
      filter: JSON.stringify({}),
      sorter: JSON.stringify([])
    };
    dispatch(crud.list(entity, option));
  }, []);

  const Title = () => {
    return (
      <h2
        className="ant-page-header-heading-title"
        style={{ fontSize: "36px" }}
      >
        {DATATABLE_TITLE}
      </h2>
    );
  };
  return (
    <>
      <PageHeader
        title={<Title />}
        ghost={false}
        extra={[
          <div>
            <Button onClick={handelDataTableLoad} key={`${uniqueId()}`}>
              <ReloadOutlined/>
            </Button>
            {
              addModal && addModal.icon ?
                <Popover placement="rightTop" title={text} visible={visible} onVisibleChange={handleVisibleChange} className="mr-3"  content={content} trigger="click">
                  <Button>
                    {addModal.type === 'image' ? 
                      <img src={addModal.icon} height={16} className="icon"></img>
                      : 
                      addModal.icon
                  } 
                    {/*  */}
                  </Button>
                </Popover>
              : null
            }
          </div>
          ,
        ]}
        style={{
          padding: "35px 0px",
          marginTop: "-40px"
        }}
      ></PageHeader>
      <Table
        columns={dataTableColumns}
        rowKey="ID"
        size={"small"}
        dataSource={items}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        onRow={handleRowClick}

      />
    </>
  );
}
