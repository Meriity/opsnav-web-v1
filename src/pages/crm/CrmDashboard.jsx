import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogBackdrop } from "@headlessui/react";
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  ListTodo,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Plus,
  UserPlus,
  Building2,
  MoreVertical,
  Settings,
  X,
  HelpCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Header from "../../components/layout/Header";
import crmAPI from "../../api/crmAPI";
import TaskDetailsDrawer from "../../components/ui/TaskDetailsDrawer";

// --- BACKGROUND FLOATING ELEMENTS ---
const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block pointer-events-none z-0"
    style={{ width: size, height: size, top: `${top}%`, left: `${left}%` }}
    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
    transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// --- DIAL GAUGE SVG RENDERER ---
const renderGaugeSVG = (settings) => {
  const cx = 140;
  const cy = 130;
  const r = 90;
  const strokeWidth = 18;
  
  const currentVal = settings.current;
  const targetVal = settings.target;
  const ratio = Math.min(Math.max(currentVal / targetVal, 0), 1);
  
  const theta = Math.PI - (ratio * Math.PI);
  const px = cx + r * Math.cos(theta);
  const py = cy - r * Math.sin(theta);
  
  const labelR = r + 18;
  const lx = cx + labelR * Math.cos(theta);
  const ly = cy - labelR * Math.sin(theta);
  
  const needleAngle = 180 + (ratio * 180);
  const needleLength = 75;

  const formatVal = (val) => {
    if (settings.metric === "Revenue") return `$${val.toLocaleString()}`;
    if (settings.metric === "Deals") return `${val} Deals`;
    return val.toLocaleString();
  };

  return (
    <svg viewBox="0 0 280 170" className="w-full h-auto overflow-visible">
      {/* Grey Background Arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Orange/Amber Progress Arc */}
      {ratio > 0 && (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${px} ${py}`}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {/* Pivot Circle */}
      <circle cx={cx} cy={cy} r={6} fill="#374151" />

      {/* Needle */}
      <polygon
        points={`${cx - 10},${cy} ${cx},${cy - 4} ${cx + needleLength},${cy} ${cx},${cy + 4}`}
        fill="#374151"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: `rotate(${needleAngle}deg)`,
          transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      />

      {/* Start Label (0) */}
      <text
        x={cx - r}
        y={cy + 22}
        textAnchor="middle"
        className="text-[11px] font-bold text-slate-400 fill-current"
      >
        0
      </text>

      {/* Target Label */}
      <text
        x={cx + r}
        y={cy + 22}
        textAnchor="middle"
        className="text-[11px] font-bold text-slate-400 fill-current"
      >
        Target: {formatVal(targetVal)}
      </text>

      {/* Current Value Label */}
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        className="text-[12px] font-extrabold text-[#F59E0B] fill-current"
      >
        {formatVal(currentVal)}
      </text>

      {/* Remaining Text */}
      <text
        x={cx}
        y={cy + 30}
        textAnchor="middle"
        className="text-xs font-bold text-slate-500 fill-current"
      >
        Remaining : {formatVal(Math.max(targetVal - currentVal, 0))}
      </text>
    </svg>
  );
};

// --- MOCK SPARKLINE DATA ---
const revenueSparkline = [
  { name: "Day 1", value: 30000 },
  { name: "Day 2", value: 45000 },
  { name: "Day 3", value: 35000 },
  { name: "Day 4", value: 65000 },
  { name: "Day 5", value: 80000 },
  { name: "Day 6", value: 110000 },
  { name: "Day 7", value: 128450 }
];

const dealsSparkline = [
  { name: "Day 1", value: 6 },
  { name: "Day 2", value: 8 },
  { name: "Day 3", value: 7 },
  { name: "Day 4", value: 10 },
  { name: "Day 5", value: 12 },
  { name: "Day 6", value: 14 },
  { name: "Day 7", value: 15 }
];

const winRateSparkline = [
  { name: "Day 1", value: 50 },
  { name: "Day 2", value: 55 },
  { name: "Day 3", value: 52 },
  { name: "Day 4", value: 60 },
  { name: "Day 5", value: 62 },
  { name: "Day 6", value: 65 },
  { name: "Day 7", value: 68 }
];

const contactsSparkline = [
  { name: "Day 1", value: 10 },
  { name: "Day 2", value: 12 },
  { name: "Day 3", value: 15 },
  { name: "Day 4", value: 16 },
  { name: "Day 5", value: 18 },
  { name: "Day 6", value: 20 },
  { name: "Day 7", value: 24 }
];


export default function CrmDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  // Target Meter states
  const [gaugeSettings, setGaugeSettings] = useState({
    name: "LEAD GENERATION TARGET - THIS YEAR",
    targetFor: "Entire Org",
    metric: "Leads",
    duration: "This Year",
    target: 1000,
    current: 100
  });
  const [tempSettings, setTempSettings] = useState({
    name: "LEAD GENERATION TARGET - THIS YEAR",
    targetFor: "Entire Org",
    metric: "Leads",
    duration: "This Year",
    target: 1000,
    current: 100
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await crmAPI.getDashboardData();
        const data = res.data;
        setDashboardData(data);
        
        // Update states if API provides them
        if (data.recentActivities) {
          setActivities(data.recentActivities);
        }
        // Fetch Real Tasks
        try {
          const tasksRes = await crmAPI.getAllTasks();
          const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.data || tasksRes.tasks || []);
          const mappedTasks = tasksList.map(t => ({
            id: t._id || t.id,
            text: t.title,
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Date",
            dueDateObj: t.dueDate ? new Date(t.dueDate).getTime() : Infinity,
            completed: t.status === "Completed" || t.status === "Done",
            category: "Task",
            raw: t
          })).sort((a, b) => a.dueDateObj - b.dueDateObj);
          setTasks(mappedTasks);
        } catch (tasksErr) {
          console.error("Failed to fetch tasks for dashboard:", tasksErr);
        }
        if (data.totalLeads !== undefined) {
           setGaugeSettings(prev => ({ ...prev, current: data.totalLeads }));
           setTempSettings(prev => ({ ...prev, current: data.totalLeads }));
        }
        if (data.gaugeSettings) {
           setGaugeSettings(prev => ({ ...prev, ...data.gaugeSettings }));
           setTempSettings(prev => ({ ...prev, ...data.gaugeSettings }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Funnel/Pipeline calculations using same mock values as deals list
  // Lead = Acme Corp ($25k) + Globex ($10k) = $35k
  // Proposal = Stark Ind. ($75k) = $75k
  // Negotiation = Oscorp ($12k) = $12k
  // Won = Wayne Ent ($45k) = $45k
  const funnelData = useMemo(() => {
    if (dashboardData) {
      return [
        { stage: "New Leads", value: dashboardData.newLeads * 10000, count: dashboardData.newLeads, color: "#2E3D99" },
        { stage: "Qualified", value: dashboardData.qualifiedLeads * 10000, count: dashboardData.qualifiedLeads, color: "#1D97D7" },
        { stage: "Converted", value: dashboardData.convertedLeads * 10000, count: dashboardData.convertedLeads, color: "#10B981" }
      ];
    }
    return [
      { stage: "Lead", value: 35000, count: 2, color: "#2E3D99" },
      { stage: "Proposal", value: 75000, count: 1, color: "#1D97D7" },
      { stage: "Negotiation", value: 12000, count: 1, color: "#4F46E5" },
      { stage: "Closed Won", value: 45000, count: 1, color: "#10B981" }
    ];
  }, [dashboardData]);

  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      await crmAPI.editTask(taskId, {
        status: !task.completed ? "Completed" : "Pending"
      });
    } catch (error) {
      console.error("Failed to toggle task status", error);
      // Revert on failure
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: task.completed } : t))
      );
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    // We cannot create a task without a lead ID on the backend
    // So we'll prompt the user to use the Leads dashboard
    alert("Please navigate to the Leads page to create new tasks, as they must be attached to a specific lead.");
    setNewTaskText("");
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative overflow-hidden h-screen">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E3D99]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative overflow-hidden h-screen">
      {/* Background decoration */}
      <FloatingElement top={8} left={12} delay={0} size={110} />
      <FloatingElement top={65} left={85} delay={2} size={140} />
      <FloatingElement top={35} left={30} delay={4} size={80} />

      <Header />

      <main className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-full overflow-y-auto z-10 pb-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <h1 className="text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-gray-900 truncate">
            <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              CRM Analytics Dashboard
            </span>
          </h1>
          <p className="text-gray-600 text-[10px] sm:text-xs lg:text-xs xl:text-sm mt-1">
            Real-time pipeline value, stage conversion metrics, and contact activity
          </p>
        </motion.div>

        {/* 📊 KPI WIDGETS WITH SPARKLINES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Leads */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between h-36 group"
          >
            <div className="absolute inset-x-0 bottom-0 h-14 opacity-20 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSparkline}>
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">{dashboardData ? dashboardData.totalLeads : 0}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ArrowUpRight size={14} />
              <span>Current</span>
            </div>
          </motion.div>

          {/* Card 2: New Leads */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between h-36 group"
          >
            <div className="absolute inset-x-0 bottom-0 h-14 opacity-20 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dealsSparkline}>
                  <Area type="monotone" dataKey="value" stroke="#2E3D99" fill="#2E3D99" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">New Leads</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">{dashboardData ? dashboardData.newLeads : 0} Leads</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#2E3D99] border border-blue-100/50 group-hover:scale-110 transition-transform">
                <UserPlus size={18} />
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-[#2E3D99]">
              <ArrowUpRight size={14} />
              <span>In Pipeline</span>
            </div>
          </motion.div>

          {/* Card 3: Converted Leads */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between h-36 group"
          >
            <div className="absolute inset-x-0 bottom-0 h-14 opacity-20 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={winRateSparkline}>
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Converted Leads</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">{dashboardData ? dashboardData.convertedLeads : 0}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-purple-600">
              <CheckCircle size={14} />
              <span>Success</span>
            </div>
          </motion.div>

          {/* Card 4: Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between h-36 group"
          >
            <div className="absolute inset-x-0 bottom-0 h-14 opacity-20 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contactsSparkline}>
                  <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="#F59E0B" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">{dashboardData ? dashboardData.pendingTasks : 0} Tasks</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                <ListTodo size={18} />
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Clock size={14} />
              <span>To-do</span>
            </div>
          </motion.div>
        </div>

        {/* 📊 PIPELINE FUNNEL CHART & SPLIT widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Funnel Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Pipeline Funnel Analysis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Total deal values and conversion volume per pipeline stage</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-[#2E3D99] rounded-lg">Active Pipeline: $167,000</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" barSize={26}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="stage" stroke="#64748B" fontSize={11} fontWeight={600} width={90} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0F172A", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                    formatter={(value, name, props) => [`$${value.toLocaleString()}`, "Stage Value"]}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Funnel visual labels below chart */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center mt-2">
              {funnelData.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.stage}</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1">${(stage.value / 1000)}k</span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{stage.count} {stage.count === 1 ? 'deal' : 'deals'}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col justify-start"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Tasks & Follow-ups</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tasks due for active pipelines</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-150">
                  <ListTodo size={16} />
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">No pending tasks!</div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task.raw)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                        task.completed
                          ? "bg-slate-50/50 border-slate-100 opacity-60"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => { e.stopPropagation(); handleToggleTask(task.id); }}
                        className="mt-1 h-4.5 w-4.5 rounded border-slate-350 text-[#2E3D99] focus:ring-[#2E3D99] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-semibold text-slate-700 leading-tight ${task.completed ? "line-through text-slate-400" : ""}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.due === 'Today' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {task.due}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick add task form */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new follow-up..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="p-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl hover:opacity-90 shadow-md shadow-[#2E3D99]/10 transition-opacity"
              >
                <Plus size={16} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Recent Activity Timeline & Leads Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Recent Activities</h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit log of system actions and updates</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-150">
                <Activity size={16} />
              </div>
            </div>

            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 max-h-[400px] overflow-y-auto pr-2">
              {activities.length === 0 && <p className="text-sm text-slate-500 italic pl-10">No recent activities.</p>}
              {activities.map((act) => (
                <div key={act._id || act.id} className="flex gap-4 relative">
                  <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 z-10 border shadow-sm ${
                    (act.entityType || act.type)?.toLowerCase() === 'deal' 
                      ? 'bg-blue-50 border-blue-100 text-[#2E3D99]' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    {(act.entityType || act.type)?.toLowerCase() === 'deal' ? <Briefcase size={12} /> : <Users size={12} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <div className="text-xs sm:text-sm text-slate-600 flex flex-col">
                        <span className="font-bold text-slate-800">{act.action}</span>
                        {act.description && <span className="text-slate-500">{act.description}</span>}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                        {act.createdAt ? new Date(act.createdAt).toLocaleString() : act.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Target Meter: Dial Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col justify-between relative"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider line-clamp-2">
                  {gaugeSettings.name}
                </h3>
                
                {/* Options Menu Button */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-colors focus:outline-none"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setTempSettings({ ...gaugeSettings });
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#2E3D99]/5 hover:text-[#2E3D99] flex items-center gap-2 transition-colors"
                        >
                          <Settings size={14} className="text-[#2E3D99]" />
                          Configure Target
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dial Gauge SVG Container */}
              <div className="flex justify-center items-center py-2">
                <div className="relative w-full max-w-[280px]">
                  {renderGaugeSVG(gaugeSettings)}
                </div>
              </div>

              {/* Target Details Breakdown */}
              <div className="mt-2 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-end">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Metric</span>
                    <span className="font-bold text-slate-800">{gaugeSettings.metric}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-bold text-slate-800">{gaugeSettings.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Target For</span>
                    <span className="font-bold text-slate-800">{gaugeSettings.targetFor}</span>
                  </div>
                </div>
                <div className="mt-5 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/50 shadow-inner">
                  <p className="text-xs text-blue-800 font-medium text-center leading-relaxed">
                    You are <span className="font-bold text-blue-900">{((gaugeSettings.current / (gaugeSettings.target || 1)) * 100).toFixed(1)}%</span> towards your goal! Keep it up! 🚀
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Configuration Modal */}
          <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-[9999]">
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                <Dialog.Panel
                  transition
                  className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 w-full max-w-4xl flex flex-col md:flex-row border border-slate-100"
                >
                  {/* Left Side: Form Controls */}
                  <div className="flex-1 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Settings className="text-[#2E3D99] w-5 h-5 shrink-0" />
                          Configure Target Meter
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Customize your dial gauge dashboard widget</p>
                      </div>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg hover:text-slate-700 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Component Name
                        </label>
                        <input
                          type="text"
                          value={tempSettings.name}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/40 focus:border-[#2E3D99] transition-all font-semibold text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Set target for
                          </label>
                          <select
                            value={tempSettings.targetFor}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, targetFor: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/40 focus:border-[#2E3D99] transition-all font-semibold text-slate-700 bg-white"
                          >
                            <option value="Entire Org">Entire Org</option>
                            <option value="My Team">My Team</option>
                            <option value="Individual">Individual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Target metric
                          </label>
                          <select
                            value={tempSettings.metric}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, metric: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/40 focus:border-[#2E3D99] transition-all font-semibold text-slate-700 bg-white"
                          >
                            <option value="Leads">Leads Count</option>
                            <option value="Deals">Deals Count</option>
                            <option value="Revenue">Revenue Value ($)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Duration
                          </label>
                          <select
                            value={tempSettings.duration}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, duration: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/40 focus:border-[#2E3D99] transition-all font-semibold text-slate-700 bg-white"
                          >
                            <option value="This Year">This Year</option>
                            <option value="This Quarter">This Quarter</option>
                            <option value="This Month">This Month</option>
                            <option value="This Week">This Week</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Target Limit
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={tempSettings.target}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, target: Math.max(parseInt(e.target.value) || 1, 1) }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E3D99]/40 focus:border-[#2E3D99] transition-all font-semibold text-slate-700"
                          />
                        </div>


                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="px-5 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setGaugeSettings(tempSettings);
                          setShowEditModal(false);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                      >
                        Save Target
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Live Visual Preview */}
                  <div className="w-full md:w-80 bg-slate-50 p-6 sm:p-8 flex flex-col justify-center items-center">
                    <div className="text-center mb-5">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Live Preview</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Real-time configuration display</p>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 w-full max-w-[260px] flex flex-col items-center">
                      <div className="w-full mb-3 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 block truncate uppercase tracking-wider">
                          {tempSettings.name || "UNTITLED TARGET"}
                        </span>
                      </div>
                      <div className="w-full relative">
                        {renderGaugeSVG(tempSettings)}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </div>
      </main>
      <TaskDetailsDrawer 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
}
