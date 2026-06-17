import React from 'react';
import Svg, { Polyline, Line } from 'react-native-svg';

export default function Sparkline({ data, color, width = 56, height = 28 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 기준선: 첫 값 위치 (등락 비교용)
  const baseY = height - ((data[0] - min) / range) * height;

  return (
    <Svg width={width} height={height}>
      <Line
        x1="0"
        y1={baseY}
        x2={width}
        y2={baseY}
        stroke={color}
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity={0.3}
      />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
