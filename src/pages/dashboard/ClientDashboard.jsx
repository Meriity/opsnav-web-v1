import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import ProgressChart from "../../components/ui/ProgressChart";
import Logo from "../../../public/main.jpg";
import conveyancing from "../../../public/Illustrator_image-removebg-preview.png";
// Icons
import {
  LogOut,
  Calendar,
  Home,
  FileText,
  User,
  ChevronsRight,
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  NotepadText,
} from "lucide-react";

// Original API and Components
import ClientAPI from "../../api/clientAPI";
import Loader from "../../components/ui/Loader";

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip);

// Card for each individual stage
const StageCard = ({ stage, stageIndex }) => {
  const getNextStageIndex = (index) => {
    const stageMap = {
      0: "1",
      1: "2A",
      2: "2B",
      3: "3",
      4: "4",
      5: "5",
    };
    return stageMap[index] ?? index;
  };
  const allTasks = [
    ...stage.data.sections,
    ...(stage.data.rows[0]?.sections || []),
  ];
  const completedTasks = allTasks.filter(
    (task) =>
      task.status?.toLowerCase() === "yes" ||
      task.status?.toLowerCase() === "nr"
  ).length;
  const totalTasks = allTasks.length;

  let statusLabel = "Not Started";
  let statusColor = "bg-gray-200 text-gray-700";

  if (completedTasks > 0 && completedTasks < totalTasks) {
    statusLabel = "In Progress";
    statusColor = "bg-yellow-100 text-yellow-800";
  } else if (completedTasks === totalTasks && totalTasks > 0) {
    statusLabel = "Completed";
    statusColor = "bg-green-100 text-green-800";
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {stage.stageName}
          </h3>
          <p
            className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${statusColor}`}
          >
            {statusLabel}
          </p>
        </div>
        <div className="text-3xl font-light text-slate-400">
          0{getNextStageIndex(stageIndex)}
        </div>
      </div>

      <div className="space-y-3 mb-4 flex">
        <div>
         {allTasks.map((task, index) => {
          const status = task.status?.toLowerCase();
          let icon = (
            <Circle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          );
          if (status === "yes" || status === "nr") {
            icon = (
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            );
          } else if (status === "no") {
            icon = (
              <XCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            );
          } else if (status === "processing") {
            icon = (
              <Clock className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
            );
          }
          return (
            <div
              key={task.title}
              className="flex items-center text-sm text-slate-600"
            >
              {icon}
              <span>{task.title}</span>
            </div>
          );
        })}
        </div>
        <div className="absolute right-5">
          {console.log(stage.svg)}
          <img src={stage.svg} alt="" style={{height:"60px"}} />
        </div>
      </div>

      {(stage.data.noteText || stage.data.rows[0]?.noteText) && (
        <div className="mt-4 pt-4 border-t border-white/60 flex">
          <blockquote className="text-sm text-slate-600 border-l-4 border-sky-300 pl-3">
            <p className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1">
              <NotepadText className="w-4 h-4" />
              Notes
            </p>
            {stage.data.noteText && <p>{stage.data.noteText}</p>}
            {stage.data.rows[0]?.noteText && (
              <p>{stage.data.rows[0].noteText}</p>
            )}
          </blockquote>
        </div>
      )}
    </motion.div>
  );
};

export default function ClientDashboard() {
  const logo = localStorage.getItem("logo") || "/Logo.png";
  const navigate = useNavigate();
  const api = new ClientAPI();
  let { matterNumber } = useParams();
  matterNumber = atob(matterNumber);

  const [loading, setLoading] = useState(true);
  const [stageDetails, setStageDetails] = useState([]);
  const [matterDetails, setMatterDetails] = useState({
    Clientname: "",
    matter_number: "",
    matter_date: "",
    settlement_date: "",
    address: "",
    state: "",
  });

  function formatMatterDetails(apiResponse) {
    return {
      matter_date: new Date(apiResponse.matterDate).toLocaleDateString("en-GB"),
      matter_number: apiResponse.matterNumber.toString(),
      Clientname: apiResponse.clientName,
      address: apiResponse.propertyAddress,
      state: apiResponse.state,
      type:
        apiResponse.clientType.charAt(0).toUpperCase() +
        apiResponse.clientType.slice(1),
      settlement_date: new Date(
        apiResponse.settlementDate
      ).toLocaleDateString("en-GB"),
    };
  }

  function splitNoteParts(note) {
    if (!note) return { beforeHyphen: "", afterHyphen: "" };
    const [before, ...after] = note.split("-");
    return {
      beforeHyphen: before?.trim() || "",
      afterHyphen: after.join("-").trim() || "",
    };
  }

  function mapStagesFromDB(response) {
    const stages = [];
    console.log(response);
    const createStage = (stageName, stageData, noteKey) => {
      if (!stageData) return;
      const note = splitNoteParts(stageData[noteKey]);
      const isDualRow = stageName === "Stage 2A" || stageName === "Stage 2B";

      stages.push({
        stageName,
        data: {
          sections: isDualRow ? stageData.sectionsA : stageData.sections,
          noteTitle: "System Note for Client",
          noteText: note.beforeHyphen,
          rows: [
            {
              sections: isDualRow
                ? stageData.sectionsB
                : stageData.sections2,
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    };

    if (response.stage1)
      stages.push({
        stageName: "Initialisation",
        svg : "/stage 1.svg",
        data: {
          sections: [
            { title: "Retainer", status: response.stage1.retainer },
            {
              title: "Declaration Forms",
              status: response.stage1.declarationForm,
            },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage1.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Contract Review",
                  status: response.stage1.contractReview,
                },
              ],
              noteText: splitNoteParts(response.stage1.noteForClient)
                .afterHyphen,
            },
          ],
        },
      });
    if (response.stage2) {
      stages.push({
        stageName: "Contract Confirmation",
        svg : "/stage 2A.svg",
        data: {
          sections: [
            { title: "VOI", status: response.stage2.voi },
            { title: "CAF", status: response.stage2.caf },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage2.noteForClientA)
            .beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Receive Signed Contract",
                  status: response.stage2.signedContract,
                },
                {
                  title: "Deposit Receipt",
                  status: response.stage2.depositReceipt,
                },
              ],
              noteText: splitNoteParts(response.stage2.noteForClientA)
                .afterHyphen,
            },
          ],
        },
      });
      stages.push({
        stageName: "Approvals",
        svg : "/stage 2B.svg",
        data: {
          sections: [
            {
              title: "Building & Pest Inspection",
              status: response.stage2.buildingAndPest,
            },
            {
              title: "Finance Approval",
              status: response.stage2.financeApproval,
            },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage2.noteForClientB)
            .beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Discharge Authority",
                  status: response.stage2.obtainDaSeller,
                },
              ],
              noteText: splitNoteParts(response.stage2.noteForClientB)
                .afterHyphen,
            },
          ],
        },
      });
    }
    if (response.stage3)
      stages.push({
        stageName: "Searches & Due Diligence",
        svg : "/stage 3.svg",
        data: {
          sections: [
            { title: "Title & Plan Search", status: response.stage3.titleSearch },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage3.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                { title: "PEXA & Invite Bank", status: response.stage3.inviteBank },
                { title: "Rates & Water", status: response.stage3.rates },
              ],
              noteText: splitNoteParts(response.stage3.noteForClient)
                .afterHyphen,
            },
          ],
        },
      });
    if (response.stage4)
      stages.push({
        stageName: "Duty & Settlement Adjustment",
        svg : "/stage 4.svg",
        data: {
          sections: [
            { title: "Dutiable statement", status: response.stage4.dts },
            { title: "Statement of Adjustment", status: response.stage4.soa },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage4.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                { title: "Duties Online", status: response.stage4.dutyOnline },
              ],
              noteText: splitNoteParts(response.stage4.noteForClient)
                .afterHyphen,
            },
          ],
        },
      });
    if (response.stage5)
      stages.push({
        stageName: "Finalisation & notifications",
        svg : "/stage 5.svg",
        data: {
          sections: [
            {
              title: "GST Withholding",
              status: response.stage5.gstWithholding,
            },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage5.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Notify SOA",
                  status: response.stage5.notifySoaToClient,
                },
                {
                  title: "Add Agent Fee",
                  status: response.stage5.addAgentFee,
                },
                {
                  title: "Settlement Notification to the authorities",
                  status: response.stage5.settlementNotification,
                },
              ],
              noteText: splitNoteParts(response.stage5.noteForClient)
                .afterHyphen,
            },
          ],
        },
      });

    return stages;
  }

  useEffect(() => {
    async function fetchMatter() {
      try {
        const response = await api.getClientDetails(matterNumber);
        const formatted = formatMatterDetails(response);
        setMatterDetails(formatted);
        const stagedetails = await api.getAllStages(matterNumber);
        const stageformatted = mapStagesFromDB(stagedetails);
        setStageDetails(stageformatted);
      } catch (error) {
        console.error("Failed to fetch matter details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatter();
  }, [matterNumber]);

  const overallProgress = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let processingTasks = 0;
    let notCompletedTasks = 0;
    stageDetails.forEach((stage) => {
      const allTasks = [
        ...stage.data.sections,
        ...(stage.data.rows[0]?.sections || []),
      ];
      totalTasks += allTasks.length;
      completedTasks += allTasks.filter(
        (task) =>
          task.status?.toLowerCase() === "yes" ||
          task.status?.toLowerCase() === "nr"
      ).length;
      processingTasks += allTasks.filter(
        (task) => task.status?.toLowerCase() === "processing"
      ).length;
      notCompletedTasks += allTasks.filter(
        (task) => task.status?.toLowerCase() === "no"
      ).length;
    });
    console.log(completedTasks, processingTasks, notCompletedTasks);
    return {
      completed: completedTasks,
      notcompleted: totalTasks,
      processingTask: processingTasks,
      total: totalTasks,
    };
  }, [stageDetails]);

  if (loading) return <Loader />;

  return (
    <div className="bg-slate-100 h-screen flex font-sans overflow-hidden">
      {/* ===== Left Sidebar ===== */}
      <aside className="bg-white text-slate-800 w-72 hidden lg:flex flex-col flex-shrink-0 border-r border-slate-200 h-screen">
        {/* The main content area that will grow */}
        <div className="flex-grow flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 flex-shrink-0 border-b border-slate-200">
            <img className="w-36 h-auto" src="/Logo.png" alt="Logo" />
          </div>
          <div className="flex-grow p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="text-x font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <span className="border-b-2 border-b-[#00AEEF]">
                    Matter Overview
                  </span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-x font-medium text-slate-600">
                        Client
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {matterDetails.Clientname}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-x font-medium text-slate-600">
                        Matter Number
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {matterDetails.matter_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-x font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <span className="border-b-2 border-b-[#00AEEF]">
                    Key Dates
                  </span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-x font-medium text-slate-600">
                        Matter Date
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {matterDetails.matter_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-x font-medium text-slate-600">
                        Settlement Date
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {matterDetails.settlement_date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-x font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <span className="border-b-2 border-b-[#00AEEF]">
                    Property
                  </span>
                </h4>
                <div className="flex items-start gap-3">
                  <Home className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-x font-medium text-slate-600">
                      Address
                    </p>
                    <p className="text-sm text-slate-800 font-semibold">
                      {matterDetails.address}
                    </p>
                    <p className="text-sm text-slate-800 font-semibold mt-1">
                      {matterDetails.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("matterNumber");
                  navigate("/client/login");
                }}
                className="w-full justify-center bg-[#EEF5FF]  text-slate-700 hover:bg-[#B4D4FF] hover:text-slate-700 active:bg-red-600 active:text-white transition-colors duration-200 font-medium flex items-center px-4 py-2 rounded"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main Content Area ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-10">
          {/* Header Section */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-slate-800">
                Hello, {matterDetails.Clientname}👋
              </h1>
              <p className="text-slate-500 mt-1">
                Welcome back. Here is the latest status of your matter.
              </p>
            </div>
            <div className="flex-shrink-0">
              <ProgressChart
                completed={overallProgress.completed}
                total={overallProgress.total}
              />
            </div>
          </motion.div>

          {/* Stage Cards Section */}
          <div>
            <div className="sticky top-0 z-10 backdrop-blur-md py-4 px-2 flex items-center justify-between mb-4 mr-1 flex-wrap gap-4">
              {/* Left: Chevron + Title */}
              <div className="flex items-center">
                <ChevronsRight className="w-7 h-7 text-sky-500 mr-2" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Stage-by-Stage Progress
                </h2>
              </div>

              {/* Right: Icon Notation */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Not Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-slate-300" />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {stageDetails.map((stage, index) => (
                <StageCard
                  key={stage.stageName}
                  stage={stage}
                  stageIndex={index}
                />
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="text-sm text-slate-500 font-medium mt-8 py-2 flex justify-center gap-2 mx-auto w-fit">
            <p>Powered By </p>{" "}
            <img className="w-15 h-auto" src="/Logo.png" alt="Logo" />
          </footer>
        </div>
      </main>
    </div>
  );
}