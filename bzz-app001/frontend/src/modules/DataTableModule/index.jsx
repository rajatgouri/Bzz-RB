import React, { useLayoutEffect } from "react";
import { Row, Col, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { useCrudContext } from "@/context/crud";

import { DataTableLayout } from "@/layout";

import DataTable from "./DataTable";

export default function CustomCrudModule({ config }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <DataTableLayout>
      <DataTable config={config} />
    </DataTableLayout>
  );
}
