import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

function DashboardLayout({ children, style = {} }) {
  return (
    <Layout className="site-layout table-view" style={ style.section ? style.section : { minHeight: "100vh", maxHeight: "100vh", minWidth: "1300px",  padding: "35px" }}>
      <Content
        className="site-layout-background invisible-scrollbar"
        style={style.content ? style.content : {
          "boxShadow": "none",
          "padding": "35px",
          "width": "100%",
          "overflow": "auto",
          "background": "#eff1f4"
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}


export default DashboardLayout;

