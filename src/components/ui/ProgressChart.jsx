  import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const ProgressChart = ({ completed, total, processing, variant = "default" }) => {
  const pending = total - completed - processing;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const safe = (val) => (val <= 0 ? 0.0001 : val);

  // Color Palettes
  const colors =
    variant === "white"
      ? {
          completed: "#FFFFFF",
          pending: "rgba(255, 255, 255, 0.1)",
          processing: "rgba(255, 255, 255, 0.5)",
          textMain: "text-white",
          textSub: "text-blue-100",
        }
      : {
          completed: "#2E3C99",
          pending: "#EEF5FF",
          processing: "#B4D4FF",
          textMain: "text-slate-700",
          textSub: "text-slate-500",
        };

  const data = {
    labels: ["Completed", "Pending", "Processing"],
    datasets: [
      {
        data: [safe(completed), safe(pending), safe(processing)],
        backgroundColor: [
          colors.completed,
          colors.pending,
          colors.processing,
        ],
        borderColor: ["transparent", "transparent", "transparent"],
        borderWidth: 0,
        hoverBorderWidth: 0,
        cutout: "80%",
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
<div className="relative w-25 h-25 flex-shrink-0">
  {/* Center Content: move behind */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 backdrop-blur-md" style={{borderRadius:"50%"}}>

      <div className="flex flex-col items-center">
        <span className={`text-2xl font-bold ${colors.textMain}`}>{percentage}%</span>
        <span className={`text-[13px] ${colors.textSub}`}>Completed</span>
      </div>
    
  </div>

  <div className="w-full h-full z-20 relative">
    <Doughnut data={data} options={options} />
  </div>
</div>

  );
};

export default ProgressChart;
