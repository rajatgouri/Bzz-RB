import React, {useState, useEffect} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from "recharts";

export default function barChart({ config }) {

  const [data, setData] = useState();
  useEffect(() => {
    setData(config.data)
  }, [config.data])

  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const radius = 10;
  
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - radius}
          fill="#000000"
          style={{
            fontSize: "10px"
          }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <>
    <BarChart
              width={config.width}
              height={config.height}
              data={data}
              style={config.style}
            > 
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#78e0e1" minPointSize={5}>
                <LabelList dataKey="value" content={renderCustomizedLabel} />
              </Bar>
        </BarChart>
    </> 
  );
}
