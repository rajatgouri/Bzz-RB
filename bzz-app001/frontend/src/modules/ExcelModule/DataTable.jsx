import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Table,
  Row,
  Radio,
  Col,
  Input,
  Button,
  Space
} from "antd";
import { SearchOutlined } from "@ant-design/icons";




export default function DataTable({ config }) {

  let {wb, dataTableColumns, dataSource  ,scroll, className,   onChangeTab, clear} = config;
  const [listIsLoading, setlistIsLoading] = useState()
  const [tabs, setTabs] = useState([])
  const [columns, setColumns] = useState([])
  const [data, setData] = useState([])
  const [activeTab, setACtiveTab] = useState('')
  
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
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div
				style={{
					padding: 8,
				}}
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
						onClick={() => clearFilters && handleReset(clearFilters)}
						size="small"
						style={{
							width: 90,
						}}
					>
						Reset
					</Button>
					<Button
						type="link"
						size="small"
						onClick={() => {
							confirm({
								closeDropdown: false,
							});
							setSearchText(selectedKeys[0]);
							setSearchedColumn(dataIndex);
						}}
					>
						Filter
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
				text ? text.toString() : ''
			) : (
				text
			),
	});

  useEffect(() => {
    setTabs(wb.SheetNames)
    if (wb.SheetNames && wb.SheetNames.length > 0) {
      setACtiveTab(wb.SheetNames[0])
    }
  }, [wb])



 

    
  useEffect(() => {

    let c  = (dataTableColumns.map((obj) => {
      return {
        title: obj.name == 'No' ? "" : obj.name,
        dataIndex: obj.name,
        key: obj.key,
        onFilter: (value, record) => record[obj.name].indexOf(value) === 0,
        children: [
          {
            title: obj.dataIndex,
            dataIndex: obj.name,
            key: obj.key,
            sorter:  {
              
         
              compare: (a, b) => {
                if (a[obj.name] > b[obj.name]) {    
                  return 1;    
              } else if (a[obj.name] < b[obj.name]) {    
                  return -1;    
              }    
              return 0;  
              },
              multiple: 2,
            // } else {
            //  return  a[obj.name].length - b[obj.name].length
            // }
  
          },
          sortDirection: ['descend', 'ascend'],
          ...getColumnSearchProps(obj.name),
          }
        ],
        
      }
     }))

     setColumns(c)
  }, [dataTableColumns])

  useEffect(() => {

   let d =  dataSource.map((r,i) =>  {
      let obj = {}
      dataTableColumns.map((c, j) => {
        obj[c.name] = r[j]  
        obj['key'] = i
        
      })
      return (obj)

    })

    setData(d)

    
  }, [dataSource, dataTableColumns])



  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  const onclickTab = (e) => {
    setACtiveTab(e.target.value)
    onChangeTab(e.target.value)
  }

  
  return (
    <div>
      {
        columns && columns.length > 0 ? 

        <div  className= {className}>

          <Table
            columns={ columns}
            rowKey="ID"
            rowClassName={(record, index) => {
              return 'wq-rows'
            }}
            scroll={scroll}
            dataSource={data}
            pagination={{ defaultPageSize: 1000000, pageSizeOptions: [], size: "small"}}
            loading={loading ? true : false}
            footer={
              () => (
                <Row gutter={[24, 24]} style={{minHeight: "25px", textAlign: "left"}}>
                  <Col span={24}>
                    <Radio.Group value={activeTab} onChange={onclickTab}>
                      {
                        tabs && tabs.map((tab) => {
                          return  <Radio.Button value={tab} className="box-shadow mr-3" >{tab}</Radio.Button>
                        })
                      }
                    </Radio.Group>
                  </Col>
                </Row>
              )
            }
          />
          </div>
        
      :
      null
      }
    

    
    </div>
  );
}
