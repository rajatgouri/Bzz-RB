
import React, { useState, useEffect, useRef } from "react";
import { FullCalendarLayout, DashboardLayout, DefaultLayout } from "@/layout";
import {  Row, Col, Popover} from 'antd';
import { Button , Form} from "antd";
import { request } from "@/request";
import { notification } from "antd";




import ReactDOM from 'react-dom';
import '@ant-design/flowchart/dist/index.css';
import {  FormWrapper, EdgeService, GroupService, CanvasService, EditorPanels } from '@ant-design/flowchart';
import { ConsoleSqlOutlined, EditOutlined , EllipsisOutlined } from "@ant-design/icons";

import { Flowchart } from "@/components/flowchart/es";
const PREFIX = 'flowchart-editor';
const { InputFiled, ColorPicker, Position, InputNumberFiled, Size } = EditorPanels;

const NodeComponent = (props) => {
  const { config, plugin = {} } = props;
  const { updateNode } = plugin;
  const [nodeConfig, setNodeConfig] = useState({
    ...config,
  });
  const onNodeConfigChange = (key, value) => {
    setNodeConfig({
      ...nodeConfig,
      [key]: value,
    });

   
    updateNode({
      [key]: value,
    });


  };
  useEffect(() => {
    setNodeConfig({
      ...config,
    });
  }, [config]);
  return (
    <div className={`${PREFIX}-panel-body`}>
      <div className={`${PREFIX}-panel-group`}>
        <h5>Content</h5>
        <InputFiled
          label={nodeConfig.name === 'custom-node-image' ? 'image address' : 'title'}
          value={nodeConfig.label}
          onChange={(value) => {
            onNodeConfigChange('label', value);
          }}
        />
      </div>
      <div className={`${PREFIX}-panel-group`}>
        <h5>Column</h5>
        <InputFiled
          label={nodeConfig.name === 'custom-node-image' ? 'image address' : 'name'}
          value={nodeConfig.column}
          onChange={(value) => {
            onNodeConfigChange('column', value);
          }}
        />
      </div>
      <div className={`${PREFIX}-panel-group`} style={{ borderBottom: 'none' }}>
        <h5>Style</h5>
        <Position
          
          x={nodeConfig.x}
          y={nodeConfig.y}
          onChange={(key, value) => {
            onNodeConfigChange(key, value);
          }}
        />
        <Size
          width={nodeConfig.width}
          height={nodeConfig.height}
          onChange={(key, value) => {
            onNodeConfigChange(key, value);
          }}
        />
        <ColorPicker
          label="Fill"
          value={nodeConfig.fill}
          onChange={(value) => {
            onNodeConfigChange('fill', value);
          }}
        />
        <ColorPicker
          label="Border"
          value={nodeConfig.stroke}
          onChange={(value) => {
            onNodeConfigChange('stroke', value);
          }}
        />
        <div className={`${PREFIX}-node-text-style`}>
          <InputNumberFiled
            label="Font Size"
            value={nodeConfig.fontSize}
            width={68}
            onChange={(value) => {
              onNodeConfigChange('fontSize', value);
            }}
          />
          <ColorPicker
            value={nodeConfig.fontFill}
            onChange={(value) => {
              onNodeConfigChange('fontFill', value);
            }}
          />
        </div>
      </div>
    </div>
  );
};


const NodeService = (props) => {
  return (
    <FormWrapper {...props}>
      {(config, plugin) => <NodeComponent {...props} plugin={plugin} config={config} />}
    </FormWrapper>
  );
};

export const controlMapService = (controlMap) => {
  controlMap.set('custom-node-service', NodeService);
  controlMap.set('custom-edge-service', EdgeService);
  controlMap.set('custom-group-service', GroupService);
  controlMap.set('custom-canvas-service', CanvasService);
  return controlMap;
};

const formSchemaService = async (args) => {
  const { targetType } = args;
  const isGroup = args.targetData?.isGroup;
  const groupSchema = {
    tabs: [
      {
        name: 'Settings',
        groups: [
          {
            name: 'groupName',
            controls: [
              {
                label: 'group name',
                name: 'custom-group-service',
                shape: 'custom-group-service',
                placeholder: 'group name',
              },
            ],
          },
        ],
      },
    ],
  };
  const nodeSchema = {
    tabs: [
      {
        name: 'Settings',
        groups: [
          {
            name: 'groupName',
            controls: [
              {
                label: 'node name',
                name: 'custom-node-service',
                shape: 'custom-node-service',
                placeholder: 'node name',
              },
            ],
          },
        ],
      },
    ],
  };
  const edgeSchema = {
    tabs: [
      {
        name: 'Settings',
        groups: [
          {
            name: 'groupName',
            controls: [
              {
                label: 'side',
                name: 'custom-edge-service',
                shape: 'custom-edge-service',
                placeholder: 'side name',
              },
            ],
          },
        ],
      },
    ],
  };
  if (isGroup) {
    return groupSchema;
  }
  if (targetType === 'node') {
    return nodeSchema;
  }
  if (targetType === 'edge') {
    return edgeSchema;
  }
  return {
    tabs: [
      {
        name: 'Settings',
        groups: [
          {
            name: 'groupName',
            controls: [
              {
                label: '',
                name: 'custom-canvas-service',
                shape: 'custom-canvas-service',
              },
            ],
          },
        ],
      },
    ],
  };
};


const FlowchartDiagram = ({ data, edit }) => {

 
  const DATA = data
  const [show, setShow] = useState(true)
  

  let config = {
    mode:"edit",
    edit: edit,
    data: {...DATA},
    onSave: async (value) => {
     await request.update('flowcharts', 0, {'1075Flowchart': JSON.stringify(value)});
     notification.success({message: "Flowchart Updated Successfully!",duration:3})
   },
   toolbarPanelProps:{
     position: {
       top: 0,
       left: 0,
       right: 0,
     },
   },
   scaleToolbarPanelProps:{
     layout: 'horizontal',
     position: {
       right: 0,
       top: -40,
     },
     style: {
       width: 150,
       height: 39,
       left: 'auto',
       background: 'transparent',
     },
   },
   canvasProps: {
     position: {
       top: 40,
       left: 0,
       right: 0,
       bottom: 0,
     },
   },
   nodePanelProps:{
     position: { width: 160, top: 40, bottom: 0, left: 0 },
     show: edit
   },
   detailPanelProps:{
     show: edit,
     position: { width: 200, top: 40, bottom: 0, right: 0 },
     controlMapService,
     formSchemaService,
   }
  }

 
  useEffect(() => {
    setShow(false)
    setTimeout(()=> setShow(true), 10)
  },[edit])

  return (

      
  <div style={{height: "2000px"}}>
    {
      show ?
      <Flowchart {...config}  />
      : null
    }
     
  </div>
    

  
  )
};


const DemoFlowchart = ({data, update, onUpdate}) => {
  const [DATA, setDATA] = useState()
  const [edit, setEdit] = useState(false)
  const [options, setOptions] = useState([])
  
    var dataConfig = null
    if( data ) {
      if(typeof data == 'object') {
        data = '{}'
      }
     dataConfig = JSON.parse(data)
    }  


  

  useEffect(async () => {
    fetchData()
  }, [data])


   useEffect(() => {
    if(!edit) {
      fetchData()
    }
   }, [update])


  const fetchData = async() => {
    const {result, success, message} = await request.list('wq1075-flowchart');

    if(dataConfig && result.length > 0) {   
      if(dataConfig && dataConfig.nodes) {

       dataConfig.nodes.map((d, index) => {
        if (Object.keys(result[0]).includes(d.column)) {
          dataConfig.nodes[index].label = result[0][d.column].toString()
        }
      })

      setDATA({...dataConfig})
      setOptions(Object.keys(result[0]))
    }   else {
      setDATA({})
      setOptions(Object.keys(result[0]))

        }    }

  }


  const onEditClicked = () => {
    setEdit(!edit)
    onUpdate()
    fetchData()
  }

   
  

  return (
    <div style={{ height: "93vh" }}>
      <Row gutter={[24,24]}>
        <Col span={12}>
            <h4 className="mt-2 ml-2">Bzz R&D</h4>
          </Col>
        <Col span={12} className="text-end">
        <Popover placement="rightTop"  content={
              <div style={{height: "300px", overflow: "auto"}}>
                {options && options.map((o) => {
                  return <p  className="menu-option">{o}</p>
                })}
              </div>
            } trigger="click">
          <EllipsisOutlined style={{ cursor: "pointer", fontSize: "24px" , marginRight: "10px"}} />
        </Popover>
          <Button onClick={() => onEditClicked()}><EditOutlined/></Button>
        </Col>

      </Row>
      {
        DATA ? 

        <FlowchartDiagram data={DATA} edit={edit}/>
        
      : null
      }
     
    
    </div>
  );
};

export default function FlowchartPage() {
  const [form] = Form.useForm()
  const [Result, setResult] = useState({})
  const [update, setUpdate] = useState(false)



  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }
  }


  setTimeout(() => {
    setUpdate(!update)
  }, 60000 )
  

  const [ID, setID] = useState("");
  var [value, setValue] = useState();
  const [collapsed, setCollapsed] = useState(false)
  const editor = useRef();



  const fetchData = async() => {
    const resposne = await request.read('flowcharts', 1);
    setID(resposne.result[0].ID)
    setValue(resposne.result[0]['1075Flowchart'] ?  resposne.result[0]['1075Flowchart'] : {})        

  }
  

  useEffect(() => {
    (async () => {
     fetchData()
    })()

  }, [])

 

  const onQuery = async(value) => {
   let {success, result, message} =  await request.create('query', value)
    setResult({Result: result})
  
  }

  return (
    
    <DashboardLayout style={dashboardStyles}>
 
      <Row gutter={[24, 24]} style={{rowGap: "30px !important" }}>
          
         
          <Col span={24} className="h-80">
            <div className="whiteBox shadow h-80 mb-30">
            
            <DemoFlowchart data={value} update={update} onUpdate={() => fetchData()}/>


            </div>
          </Col>

          <Col style={{height: "30px"}} span={24}></Col>


        
      </Row>
    </DashboardLayout>
  )
}
