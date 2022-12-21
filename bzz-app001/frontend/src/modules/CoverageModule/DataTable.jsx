import React, { useCallback, useEffect, useState } from "react";
import { Button, PageHeader, Table, Select } from "antd";

import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";

import uniqueId from "@/utils/uinqueId";
import { ReloadOutlined } from "@ant-design/icons";


const { Option } = Select;
export default function DataTable({ config }) {
  let { entity, dataTableColumns, DATATABLE_TITLE } = config;
  const [currentOrder, setOrder] = useState("DESC");
  const [valueOrder, setValueOrder] = useState("DESC");
  const { result: listResult, isLoading: listIsLoading } =
    useSelector(selectListItems);

  const { pagination, items } = listResult;

  const dispatch = useDispatch();

  const onOrderChange = (value) => {
    setOrder(value);
    setTimeout(() => {
      setValueOrder(value);
    }, 100);
  };

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

  const handelDataTableLoad = useCallback((pagination) => {
    const option = { page: pagination.current || 1, order: currentOrder };

    dispatch(crud.list(entity, option));
  }, []);
  useEffect(() => {
    const option = { page: pagination.current, order: currentOrder };
    dispatch(crud.list(entity, option));
  }, [currentOrder]);
  useEffect(() => {
    dispatch(crud.list(entity));
  }, []);

  return (
    <>
      <PageHeader
        title={<Title />}
        ghost={false}
        extra={[
          <Button onClick={handelDataTableLoad} key={uniqueId()}>
            <ReloadOutlined/>
          </Button>,
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
      />
    </>
  );
}
