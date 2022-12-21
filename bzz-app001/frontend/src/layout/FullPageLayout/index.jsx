import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function FullPageLayout({ children }) {
  return (
    <Layout className="site-layout" style={{ minHeight: "100vh", height: "100%", padding: "40px"}}>
      {/* <HeaderContent /> */}
      <Content
        className="site-layout-background"
        style={{
          padding: "40px",
          width: "100%"           
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}
