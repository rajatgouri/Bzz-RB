import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { crud1 } from "@/redux/crud1/actions";

import { selectListItems } from "@/redux/crud/selectors";
import { selectListItems as  selectListItems1 } from "@/redux/crud1/selectors";

import { Pie, measureTextWidth } from "@ant-design/charts";
import PageLoader from "@/components/PageLoader";



const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "revert",
    "background": "#eff1f4",
    "margin": "auto",
    "maxWidth": "1333px",
    "height": "0px"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1333px"
  }
}


const DemoPie = ({ data = [], type = '' , layout = 'horizontal', colors = [], percentage = "%"}) => {

  data= data.filter((d) => d.type != "Total Recouped"  )
  data= data.filter((d) => d.type != "Total Denied (Expected)"  )
   

  function renderStatistic(containerWidth, text, style, fontWeight = 500) {
    const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
    const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

    let scale = 1;

    if (containerWidth < textWidth) {
      scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
    }

    const textStyleStr = `width:${containerWidth}px;`;
    return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};font-weight:${fontWeight}  ">${text}</div>`;
  }


  const config = {
    appendPadding: 10,
    data,
    height: 300,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    meta: {
      value: {
        formatter: (v) => `${v}`,
      },
    },
    legend: {
      layout: layout,
      position: 'bottom',
      style: {
        fontSize: 50,
        marginTop: "-50px"
      }
    },
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
        fill: 'black',
        fontSize: 15
      },
      autoRotate: false,
      content:  (value) => value.value ? value.value + percentage : '',
      formatter: (value) => {
      }
      
    },
    colorField: 'type',
    color: colors.length > 0 ? colors :  data.map((d) => d.color),

    statistic: {
      title: {
        offsetY: -2,
        style: {
          fontSize: '12px',
          marginLeft: "-25px"
        },
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.type : 'Total Charges Audited' 
          return renderStatistic(d, text, {
            fontSize: 12,
            fontWeight: 700,
            marginLeft: 0
          });
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '16px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          const text = '';
          return renderStatistic(width, text, {
            fontSize: 16,
          });
        },
      },
    },
    // 添加 中心统计文本 交互
    inteKPItions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
  };
  return <Pie {...config} />;
};

export default function RAReview() {
  const dispatch = useDispatch();
  const [data, setData] = useState([])
  const [data1, setData1] = useState([])

  var { result: listResult, isLoading } = useSelector(selectListItems);
  var { result: listResult1, isLoading :isLoading1 } = useSelector(selectListItems1);

  var { items } = listResult;
  var { items: items1 } = listResult1;



  useEffect(() => {
    getData({dates: JSON.stringify([])})
    getData1({dates: JSON.stringify([])})

  }, [])

  useEffect(() => {

    setData(items)
  }, [items])

  useEffect(() => {

    setData1(items1)
  }, [items1])


  const getData = (options) => {
    dispatch(crud.list('wqaudit-kpi', options));
  }


  const getData1 = (options) => {
    dispatch(crud1.list('hbwqaudit-kpi', options));
  }

  const onChangeDatePicker = (d, value) => {
    getData( {dates: JSON.stringify(value)})
  }




  return (
    <DashboardLayout style={dashboardStyles}>


      <Row gutter={[24,24]} style={{rowGap: "0px", padding: "10px"}}>
            <Col span={12}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                Team Audit Graphs
              </h2>
              </div>
            </Col>
            <Col span={12}  style={{textAlign :"end"}}>


            </Col>
           
          </Row> 
     

      <Row gutter={[24, 24]} className="ra-review">



        <Col span={24} className="gutter-row ">
          <div className="whitebox shadow h-100 p-15 mb-5 border-5" style={{ minHeight: "calc(100vh - 150px)", fontSize: "15px", padding: "30px" }}>
            {
              isLoading && isLoading1 ?
                <PageLoader />
                :
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <Row gutter={[24,24]}>
                      <Col span={24}>
                    <h3 style={{marginBottom: "35px"}}>PB Total Charges Audited</h3>

                       <DemoPie data={data['KPI'] ? data['KPI']['data'] : []} type={'KPIs'} />

                      </Col>

                      <Col span={24}>

                    <div >
                      <div className="inline w-50 font-bold">Correct </div>
                      <div className="inline w-50 text-end ">{data['KPI'] ? data['KPI']['correct'] : 0}</div>
                    </div>

                    <div >
                      <div className="inline w-50 font-bold">
                        Incorrect
                      </div>
                      <div className="inline w-50 text-end ">
                        {data['KPI'] ? data['KPI']['incorrect'] : 0}
                      </div>
                    </div>

                    <div style={{ height: "50px" }}></div>

                    <div >
                      <div className="inline w-75 mb-5">
                        Total Charges
                      </div>
                      <div className="inline w-25 text-end " style={{ padding: "2px 5px" }}>
                        {data['KPI'] ? data['KPI']['total'] : 0}
                      </div>
                    </div>

                    {
                      data['KPI'] && data['KPI']['data'].map((d) => {
                        return (
                          <div style={{ background: d.color, padding: "5px 5px" }}>
                            <div className="inline w-20 ">
                              {/* {d.value} % */}
                              {d.value ? d.value + ' %': ''} 

                            </div>
                            <div className="inline w-55 ">
                              {d.type}
                            </div>
                            <div className="inline w-25 text-end ">
                              {d.count}
                            </div>
                          </div>
                        )
                      })
                    }

  
                  </Col>
                    </Row>

                  </Col>
                 
                  <Col span={12} >

                    <Row gutter={[24,24]}>
                    <Col span={24}>
                    <h3 style={{marginBottom: "35px"}}>HB Total Charges Audited</h3>

                       <DemoPie data={data1['KPI'] ? data1['KPI']['data'] : []} type={'KPIs'} />

                      </Col>

                      <Col span={24}>

                    <div >
                      <div className="inline w-50 font-bold">Correct </div>
                      <div className="inline w-50 text-end ">{data1['KPI'] ? data1['KPI']['correct'] : 0}</div>
                    </div>

                    <div >
                      <div className="inline w-50 font-bold">
                        Incorrect
                      </div>
                      <div className="inline w-50 text-end ">
                        {data1['KPI'] ? data1['KPI']['incorrect'] : 0}
                      </div>
                    </div>

                    <div style={{ height: "50px" }}></div>

                    <div >
                      <div className="inline w-75 mb-5">
                        Total Charges
                      </div>
                      <div className="inline w-25 text-end " style={{ padding: "2px 5px" }}>
                        {data1['KPI'] ? data1['KPI']['total'] : 0}
                      </div>
                    </div>

                    {
                      data1['KPI'] && data1['KPI']['data'].map((d) => {
                        return (
                          <div style={{ background: d.color, padding: "5px 5px" }}>
                            <div className="inline w-20 ">
                              {/* {d.value} % */}
                              {d.value ? d.value + ' %': ''} 

                            </div>
                            <div className="inline w-55 ">
                              {d.type}
                            </div>
                            <div className="inline w-25 text-end ">
                              {d.count}
                            </div>
                          </div>
                        )
                      })
                    }

  
                  </Col>
                      </Row>
                  </Col>


                </Row>

            }


          </div>
        </Col>

     



      </Row>


    </DashboardLayout>
  );
}
