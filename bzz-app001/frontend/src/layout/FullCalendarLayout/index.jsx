import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function FullCalendarLayout({ children , style}) {
  return (
    <Layout className="site-layout" style={style.layout}>
      {/* <div className="space30"></div> */}
      <Content
        style={style.content}
      >
        {children}
      </Content>
    </Layout>
  );
}
