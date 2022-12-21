import React from "react";

import DefaultLayout from "../DefaultLayout";
import HeaderContent from "../HeaderContent";

import { Layout } from "antd";

const { Content } = Layout;

export default function DataTableLayout({ children }) {
  return (
      <Layout style={{ minHeight: "100vh" ,  marginTop: "50px"}}>
        <Layout className="site-layout">
          {/* <HeaderContent /> */}
          <Content
            className="site-layout-background"
            style={{
              padding: "50px 40px",
              margin: "30px auto",
              width: "100%",
              maxWidth: "1200px",
              minWidth: "1200px"
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
  );
}
