import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const ProgressChart = ({ completed, total, processing, chartImage }) => {
  const pending = total - completed - processing;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const safe = (val) => (val <= 0 ? 0.0001 : val);

  const data = {
    labels: ["Completed", "Pending", "Processing"],
    datasets: [
      {
        data: [safe(completed), safe(pending), safe(processing)],
        backgroundColor: ["#86B6F6", "#EEF5FF", "#B4D4FF"],
        borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
        borderWidth: 0,
        hoverBorderWidth: 0,
        cutout: "90%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: { enabled: true, displayColors: false },
    },
  };

  

  return (
<div className="relative w-25 h-25 flex-shrink-0 mt-2">
  {/* Center Content: move behind */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
        <span className="text-[13px] text-slate-500">Completed</span>
      </div>
    
  </div>

  <div className="w-full h-full z-20 relative">
    <Doughnut data={data} options={options} />
  </div>
</div>

  );
};

export default ProgressChart;
