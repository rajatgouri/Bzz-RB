import React, { useEffect, useState,useRef } from "react";

import { Layout, Input, Button, Space } from "antd";
import {  SearchOutlined } from "@ant-design/icons";
import EPICDataTable from "@/components/EpicDataTable";

const { Content,  Sider } = Layout;

export default function forwardRef({ children , ref , collapse}) {

  const [collapsed, setCollapsed] = useState(true);

  const onCollapse = () => {
    setCollapsed (!collapsed)
  };


  
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters)
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            } }
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });


  useEffect(() => { 
      if(collapse){
        setCollapsed(false)
      }

  }, [collapse])
  
 

    const columns = [
      { title: 'Billers Notes', dataIndex: 'BILLERs_NOTES', key: 'BILLERs_NOTES' , width: "500px", ...getColumnSearchProps('BILLERs_NOTES'), },
      { title: 'Type', dataIndex: 'Type', key: 'Type' , width: "200px",align: 'center',  ...getColumnSearchProps('Type')},
     
      { title: 'Review Name', dataIndex: 'User Reviewed', key: 'User Reviewed' , width: "200px",align: 'center',  ...getColumnSearchProps('User Reviewed')},
      { title: 'Service Date', dataIndex: 'Service Date', key: 'Service Date' , width: "200px", align: 'center', ...getColumnSearchProps('Service Date')},
      { title: 'Review Date', dataIndex: 'Review Date', key: 'Review Date', width: "300px",...getColumnSearchProps('Review Date') },
      { title: 'Review Datetime', dataIndex: 'Review DateTime', key: 'Review DateTime', width: "300px",...getColumnSearchProps('Review DateTime') },
  
      { title: 'Note Line', dataIndex: 'NOTE_LINE', key: 'NOTE_LINE' , width: "200px", ...getColumnSearchProps('NOTE_LINE')},
      { title: "Patient MRN", dataIndex: 'MRN', key: 'MRN' , width: "160px", align: 'center', ...getColumnSearchProps('MRN')},
      { title: 'IRB', dataIndex: 'IRB', key: 'IRB' , width: "250px",align: 'center', ...getColumnSearchProps('IRB')},
    ];


  return (
    <Layout className="site-layout table-view" style={{ minHeight: "100vh", maxHeight: "100vh", minWidth: "1333px",  padding: "35px 35px 29px" }}>
      <Content
        className="site-layout-background"
        style={{
          padding: "4px 11px",
          width: "100%",
        }}
      >
        {children}
      </Content>
      <Sider style={{marginTop: "-35px", position: "absolute", right: "0px", zIndex: "1000"}}  collapsible collapsed={collapsed} collapsedWidth={"25px"}  width={550}  onCollapse={onCollapse}   className="site-layout-background ">
          <EPICDataTable  dataTableColumns={columns} />
        </Sider>
    </Layout>
  );
}
