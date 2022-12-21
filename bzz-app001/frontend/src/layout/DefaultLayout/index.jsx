
import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

function DefaultLayout({ children }) {
  return (
    <Layout className="site-layout table-view" style={{ minHeight: "100vh", maxHeight: "100vh", overflow: "auto", minWidth: "1300px",  padding: "35px" }}>
      <Content
        className="site-layout-background"
        style={{
          padding: "31px ",
          width: "100%",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}


export default DefaultLayout;
