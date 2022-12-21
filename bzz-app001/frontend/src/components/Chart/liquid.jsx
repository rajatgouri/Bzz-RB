import React, {useState, useEffect} from "react";
import { Liquid,  measureTextWidth  } from "@ant-design/charts";

export default function LiquidChart({ percent , text, height = 90 , width = 80 , customClassName}) {

  var config = {
    percent,
    radius: 0.8,
    statistic: {
      content: {
        style: function style(_ref2) {
          var percent = _ref2.percent;
          return {
            fontSize: 60,
            lineHeight: 1,
            fill: percent > 0.65 ? 'white' : 'rgba(44,53,66,0.85)',
          };
        },
        customHtml: function customHtml(container, view, _ref3) {
          var percent = _ref3.percent;
          var _container$getBoundin = container.getBoundingClientRect(),
            width = _container$getBoundin.width,
            height = _container$getBoundin.height;
          var d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          var text = ''.concat((percent * 100).toFixed(2), '%');
          var textWidth = (0, measureTextWidth)(text, { fontSize: 60 });
          var scale = Math.min(d / textWidth, 1);
          return '<div style="width:'
            .concat(d, 'px;display:flex;align-items:center;justify-content:center;font-size:')
            .concat(scale, 'em;line-height:')
            .concat(scale <= 1 ? 1 : 'inherit', '">')
            .concat(text, '</div>');
        },
      },
    },
    liquidStyle: function liquidStyle(_ref4) {
      var percent = _ref4.percent;
      return {
        fill: '#5BC2E7',
        stroke:  '#5BC2E7',
      };
    },
    
  };
  
  return (
    <div className={customClassName ? customClassName : "liquid-chart"}>
      <Liquid height={height} width={width} style={{marginTop: "2px", }} {...config} />
      <p className="liquid-chart-label">{text}</p>
    </div>

  );

}
