/** @jsxRuntime classic */
import * as React from 'react';
import { 
  Chart, 
  ChartConfiguration,
  // Controllers
  BarController,
  DoughnutController,
  RadarController,
  // Elements
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  // Plugins
  Filler,
  Legend,
  Tooltip
} from 'chart.js';

// Register all the necessary components for Chart.js to work.
// This should be done once per application.
Chart.register(
  BarController,
  DoughnutController,
  RadarController,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  Legend,
  Tooltip
);

interface ChartComponentProps {
  config: ChartConfiguration;
  id: string;
}

const ChartComponent = ({ config, id }: ChartComponentProps) => {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = React.useRef<Chart | null>(null);

  React.useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Use the imported and registered Chart object
        chartInstanceRef.current = new Chart(ctx, config);
      }
    }

    // Cleanup function to destroy chart instance on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [config, id]); // Re-run effect if config or id changes

  return (
    <div className="relative h-full w-full">
      <canvas id={id} ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;