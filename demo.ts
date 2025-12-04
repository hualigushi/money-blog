
import React, { useRef, useEffect, useState } from 'react';
import { Line } from '@antv/g2plot';
import { Button } from 'antd';

const LineChartWithSlider = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);

  // 生成模拟数据：00:00-23:59每分钟的数据点
  const generateTodayData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        const timestamp = new Date(today);
        timestamp.setHours(hour, minute, 0, 0);

        // 第一条线：CPU使用率
        const cpuBase = 40 + 25 * Math.sin((hour * 60 + minute) * Math.PI / 720);
        const cpuNoise = Math.random() * 15 - 7.5;
        const cpuValue = Math.max(10, Math.min(90, cpuBase + cpuNoise));

        // 第二条线：内存使用率
        const memoryBase = 50 + 20 * Math.cos((hour * 60 + minute) * Math.PI / 720);
        const memoryNoise = Math.random() * 12 - 6;
        const memoryValue = Math.max(15, Math.min(85, memoryBase + memoryNoise));

        data.push({
          timestamp: timestamp.getTime(),
          value: Math.round(cpuValue * 100) / 100,
          category: 'CPU使用率',
          timeStr: timestamp.toDateString()
        })

        data.push(

          {
            timestamp: timestamp.getTime(),
            value: Math.round(memoryValue * 100) / 100,
            category: '内存使用率',
            timeStr: timestamp.toDateString()
          })
      }
    }

    return data;
  };

  useEffect(() => {
    // 初始化数据
    setChartData(generateTodayData());
  }, []);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    // 销毁之前的图表实例
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 创建新的图表实例
    chartInstance.current = new Line(chartRef.current, {
      data: chartData,
      xField: 'timestamp',
      yField: 'value',
      seriesField: 'category',
      smooth: true,
      height: 450,
      meta: {
        timestamp: {
          type: 'time',
          mask: 'HH:mm',
          tickCount: 12,
        },
        value: {
          alias: '使用率',
          formatter: (v) => `${v}%`,
          min: 0,
          max: 100,
        },
      },
        xAxis: {
          type: 'time',
          label: {
            formatter: (val, item, index) => {
              const date = new Date(val);
              const hours = date.getHours();
              return hours % 3 === 0 ? `${hours.toString().padStart(2, '0')}:00` : '';
            },
            style: {
              fontSize: 10,
            },
          },
          grid: {
            line: {
              style: {
                stroke: '#f0f0f0',
                lineWidth: 1,
              },
            },
          },
        },
        yAxis: {
          label: {
            formatter: (v) => `${v}%`,
            style: {
              fontSize: 10,
            },
          },
          grid: {
            line: {
              style: {
                stroke: '#f0f0f0',
                lineWidth: 1,
              },
            },
          },
        },
        slider: {
          start: 0.1,
          end: 0.3,
          trendCfg: {
            isArea: false,
          },
          handler: {
            style: {
              fill: '#1890ff',
              stroke: '#1890ff',
              lineWidth: 2,
            },
          },
          formatter: (val) => {
            const date = new Date(val);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          },
          backgroundStyle: {
            fill: '#fafafa',
          },
        },
        legend: {
          position: 'top-right',
          itemName: {
            style: {
              fontSize: 12,
            },
          },
        },
        color: ['#1890ff', '#52c41a'],
        lineStyle: {
          lineWidth: 2,
        },
        point: {
          size: 1,
          shape: 'circle',
          style: {
            fillOpacity: 0.8,
            stroke: '#fff',
            lineWidth: 1,
          },
        },
        tooltip: {
          showCrosshairs: true,
          shared: true,
          crosshairs: {
            type: 'x',
          },
          formatter: (datum) => {
            const time = new Date(datum.timestamp);
            const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            return {
              name: datum.category,
              value: `${datum.value}% (${timeStr})`,
            };
          },
        },
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 2000,
          },
          enter: {
            animation: 'fade-in',
            duration: 800,
          },
        },
      });


    // 渲染图表
    chartInstance.current.render();

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  const refreshData = () => {
    setChartData(generateTodayData());
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        24小时分钟数据折线图（带缩略轴）
      </h2>
      <div ref={chartRef} />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button
          onClick={refreshData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          刷新数据
        </Button>
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>G2-Plot 折线图示例</h1>
      </header>
      <main className="App-main">
        <LineChartWithSlider />
      </main>
    </div>
  )
}





export default HomePage;


