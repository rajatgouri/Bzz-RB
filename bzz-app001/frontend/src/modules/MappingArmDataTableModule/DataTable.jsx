import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Select,
  Radio,
  Popover,
  Row,
  Col,
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { request } from "@/request";
import { CheckOutlined, CopyOutlined, EditOutlined, EyeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import CheckImage from "../../assets/images/check.png";


// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());

const { Option } = Select;

export default function DataTable({ config }) {

  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, entity2, dataTableColumns, dataTableColumns2, getItems, reload,  getFilterValue, dataTableTitle , openModal, viewModal } = config;
  const [form] = Form.useForm();

  
  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])


  
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [dataSource2, setDataSource2] = useState([]);
  const [selectedTimepoint,setSelectedTimepoint] = useState('')
 
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)

  const [sorter, setSorter] = useState([])
  const [studies, setStudies] = useState([])
  const [currentStudy, setCurrentStudy] = useState('')
 

  useEffect(() => {
    setLoading(listIsLoading)

  }, [listIsLoading])



  

  
  const onChangeARM = async (value, index) => {

    dataSource[index].value = value
    dataSource[index]['item']['Selected MCA'] = value

    setDataSource([...dataSource])
    await request.create(entity, {
      'EPIC ARM': dataSource[index]['item']['TP_NAME'],
      'IRB': dataSource[index]['IRB'],
      'Selected MCA': value
    })

  }


  const onCopyPrevious = (index)  => {

    if(dataSource[index]['option'].filter((opt) => opt['SheetName'] == dataSource[index - 1].value ).length > 0) {
      dataSource[index].value = dataSource[index - 1].value 
      dataSource[index]['item']['Selected MCA'] = dataSource[index - 1].value 
      onChangeARM(dataSource[index - 1].value , index)
      setDataSource([...dataSource])
    }
    
  }

  const onCopyPreviousTimepoint = (index)  => {
       if(dataSource2[index]['option'].filter((opt) => opt['MCA TimePoint'] == dataSource2[index - 1].value ).length > 0) {
      dataSource2[index].value = dataSource2[index - 1].value 
      dataSource2[index]['MCA Column'] = dataSource2[index - 1]['MCA Column'] 
      onChangeMCATimepoint(dataSource2[index - 1].value, index)
      setDataSource2([...dataSource2])
    }
    
  }

  const onChangeMCATimepoint = async (value, index) => {
   
    dataSource2[index].value = value
    dataSource2[index]


    let col= dataSource2[0]['option'].filter((o) => o['MCA TimePoint'] == value)[0]['ColumnLetter']
    dataSource2[index]['MCA Column'] = col
    dataSource2[index]['item']['Selected MCA'] = value
    dataSource2[index]['item']['Selected Column'] = col

    setDataSource2([...dataSource2])


    await request.create(entity2, {
      'Timepoint': dataSource2[index]['item']['TIME_POINT'],
      'IRB': dataSource2[index]['IRB'],
      'Selected MCA': value,
      'Selected Column': col ? col : '',
      'MCA Arm': selectedTimepoint
    })
   
  }


  
 
  const newDataTableColumns = dataTableColumns.map((obj, i) => {


    if (obj.dataIndex == "option" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
               <Select style={{width: "95%", }}  
                  showSearch
                  placeholder=""
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if(option.children) {
                    return  option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                    }
                  }}
                  value={row['value']}
                  onChange={(value) => onChangeARM(value, row['index'])}
                  >

                    {
                      row['option'].map((o, index) => {
                        return <Option key={index} value={o.SheetName}>{o.SheetName}</Option>
                      })
                    }
                  </Select>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "item" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >

               <span className="mr-10">
                   <img src={CheckImage} height="17px" weight="16px" style={{ filter: row['item']['Selected MCA'] ?  "hue-rotate(293deg)" : "grayscale(100%)", marginLeft: "1px", marginRightL :"20px" }}  />  
                  </span>
                  <span>
                  </span>
                {row['item']['TP_NAME']}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "action" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div style={{textAlign: "left"}}>
                  <EditOutlined onClick={() => openModal(row, 'EDIT', 'epic')}/>
                <EyeOutlined className="ml-3" onClick={() => openModal(row, 'VIEW', 'epic')}/>
                {row['index'] != 0 && dataSource[row['index'] -1].value   ? 
                <CopyOutlined className="ml-3"  onClick={() => onCopyPrevious(row['index'])} />
                : null}
              </div>
            )
          };
        },
      })
    }



    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children: text,
        };
      },
    })
  });


  

 const getTextforMCA = (str) => {
  let s = str.replace('\n', ' ').split(',').filter(function(item,i,allItems){
	
   
    return i === allItems.indexOf(item);
}).join(',')

return (s)
 }

  const newDataTableColumns2 = dataTableColumns2.map((obj, i) => {


    if (obj.dataIndex == "option" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
               <Select style={{width: "95%", }}  
                  showSearch
                  placeholder=""
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if(option.children) {
                    return  option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                    }
                  }}
                  value={row['value']}
                  onChange={(value) => onChangeMCATimepoint(value, row['index'])}
                  >

                    {
                      (row['option']).map((o, index) => {

                       
                        return <Option  value={o['MCA TimePoint']}>{o['MCA TimePoint'] ? 
                        o['MCA TimePoint'].replace(/\n/g, ' ').split(',').filter(function(item,i,allItems){
                          return i === allItems.indexOf(item);
                      }).join(',')
                        : "" }</Option>
                      })
                    }
                  </Select>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "item" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
               
                  <span className="mr-10">
                   <img src={CheckImage} height="17px" weight="16px" style={{ filter: row['item']['Selected MCA'] ?  "hue-rotate(293deg)" : "grayscale(100%)", marginLeft: "1px", marginRightL :"20px" }}  />  
                  </span>
                  <span>
                  {row['item']['TIME_POINT']}
                  </span>
                  
                 
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "action" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div >
                <EditOutlined onClick={() => openModal(row, 'EDIT', 'timepoint')}/>
                <EyeOutlined className="ml-3" onClick={() => openModal(row, 'VIEW', 'timepoint')}/>

                {row['index'] != 0 && dataSource2[row['index'] -1].value   ? 
                <CopyOutlined className="ml-3" onClick={() => onCopyPreviousTimepoint(row['index'])} />
                : null}
              </div>
            )
          };
        },
      })
    }

    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children: text,
        };
      },
    })
  });


  const loadTable = async (value) => {  
    setLoading(true)
    setDataSource([])
   let {result, message, success} =  await request.list(entity, {irb: JSON.stringify({
      irb: value
    })})  

    if (!success) {
      notification.error({message: message})
    }

    setDataSource(result)
    setLoading(false)

  }

  const loadStudies = async () => {
    let {result} = await request.list('studies');
    setStudies(result)
  }

  useEffect(() => {
    items = []
    setDataSource([])
    loadStudies()

  }, []);

 

  const onChangeStudy = (values, index) => {
    setCurrentStudy(values)
    setSelectedTimepoint('')
    loadTable(values)
    setDataSource2([])    
  }


  useEffect(() => {
   items = []
  },[entity])

  useEffect(() => {

    if(dataSource.length == 0) {
      return 
    }

    if (reload) {
      if (previousEntity == entity) {
        // handelDataTableLoad(pagination, filters, sorters)
      } else {
        // han      delDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])


  const onChangeTimepoint = async (irb , value) => {
  
    setSelectedTimepoint(value)
    setLoading2(true)
    setDataSource2([])

    let {result, message, success} =  await request.list1(entity2, {
      irb: irb,
      sheet: value 
    })  

    if (!success) {
      notification.error({message: message})
    }

    setDataSource2(result)
    setLoading2(false)

    

  }


  const onSaveARMs = async() => {

    let obj = dataSource.map((d) => {
      return {
          'EPIC ARM': d['item']['TP_NAME'],
          'IRB': d['IRB'],
          'Selected MCA': d['item']['Selected MCA']
      }
    })
    setLoading(true)
    await request.create(entity + '-epic-save-all', obj)
    setLoading(false)

    notification.success({message: "Saved successfully!"})

  }


  const onSaveTimepoints = async() => {

    let obj = dataSource2.map((d) => {
      return {
        'Timepoint': d['item']['TIME_POINT'],
        'IRB': d['IRB'],
        'Selected MCA': d['item']['Selected MCA'],
        'Selected Column': d['item']['Selected Column'],
        'MCA Arm': d['MCA Arm']
      }
    })

    setLoading2(true)
    await request.create(entity + '-timepoint-save-all', obj)
    setLoading2(false)
    notification.success({message: "Saved successfully!"})

  }

  const columns = newDataTableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });


  const columns2 = newDataTableColumns2.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });



  

  return (
    <div className= {"mapping-module"}>
          <Row gutter={[24,24]}>
            <Col span={4}>
            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
          </Row> 
          <Row gutter={[24,24]} style={{marginBottom: "20px"}}>
            <Col span={12}>
              <label>ARMS Mapping</label>
              <Select style={{width: "150px", marginLeft: "20px"}}  onChange={onChangeStudy}
              
              showSearch
              placeholder=""
              optionFilterProp="children"
              filterOption={(input, option) => {
                if(option.children) {
                return  option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                }
              }}>
                {
                  studies.map((s, index) => {
                    return <Option key={index} value={s.StudyNumber}>{s.StudyNumber}</Option>
                  })
                }
              </Select>
           
            </Col>
            <Col span={12} className="text-end">
              <Button onClick={onSaveARMs} type="primary" disabled={dataSource.length ==0  || loading }>Save</Button>
            </Col>
          </Row> 
          
      <Table
        style={{marginTop: "10px"}}
    
        columns={columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        scroll={{ y:  'calc(100vh - 22.3em)' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        
      />



          <Row gutter={[24,24]} style={{marginBottom: "20px", marginTop: "20px"}}>
            <Col span={12}>
            <label>TimePoint Mapping: </label>
                  <Select 
                  style={{ width: 200,  marginLeft: "20px" }}
                  value={selectedTimepoint}
                  defaultValue={selectedTimepoint}
                  onChange={(e) => onChangeTimepoint(currentStudy, e)}
                  >
                    {
                      dataSource && dataSource.length> 0 && dataSource.filter((arr, index, self) => index === self.findIndex((t) => (t.value === arr.value ))).map((d) => {

                        if(d.value) {
                          return <Option value={d.value}>{d.value}</Option> 
                        }
                      })
                    }
                  </Select>
           
            </Col>
            <Col span={12} className="text-end">
              <Button onClick={onSaveTimepoints} type="primary" disabled={dataSource2.length ==0 || loading2}>Save</Button>
            </Col>
          </Row> 
          
      <Table
        columns={columns2}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        scroll={{ y:  'calc(100vh - 22.3em)' }}

        dataSource={dataSource2}
        pagination={pagination}
        loading={loading2 ? true : false}
      
      />
     
    </div>
  );
}