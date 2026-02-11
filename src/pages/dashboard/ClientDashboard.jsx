import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import ProgressChart from "../../components/ui/ProgressChart";

// Icons
import {
  LogOut,
  Calendar,
  Home,
  FileText,
  User,
  X,
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  NotepadText,
  ChevronsRight,
} from "lucide-react";

// Original API and Components
import ClientAPI from "../../api/clientAPI";
import Loader from "../../components/ui/Loader";

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip);

// Card for each individual stage
const StageCard = ({ stage, stageIndex }) => {
  const getNextStageIndex = (index) => {
    let stageMap = {};
    const currentModule = localStorage.getItem("currentModule");
    if (currentModule === "conveyancing" || currentModule === "wills") {
      stageMap = {
        0: "1",
        1: "2A",
        2: "2B",
        3: "3",
        4: "4",
        5: "5",
      };
    } else if (currentModule === "print media") {
      stageMap = {
        0: "1",
        1: "2",
        2: "3",
        3: "4",
      };
    }

    return stageMap[index] ?? index;
  };

  const allTasks = [
    ...stage.data.sections,
    ...(stage.data.rows[0]?.sections || []),
  ];

  const completedTasks = allTasks.filter(
    (task) =>
      task.status?.toLowerCase() === "yes" ||
      task.status?.toLowerCase() === "n/r"
  ).length;

  const totalTasks = allTasks.length;

  let statusLabel = "Not Started";
  let statusColor = "bg-gray-200 text-gray-700";

  if (stage.stagecolor === "amber") {
    statusLabel = "In Progress";
    statusColor = "bg-yellow-100 text-yellow-800";
  } else if (stage.stagecolor === "green") {
    statusLabel = "Stage Completed";
    statusColor = "bg-green-100 text-green-800";
  }

  return (
    <motion.div
      className="relative group overflow-hidden p-6 rounded-xl border border-white/40 
             bg-white/30 shadow-sm mb-5 
             hover:scale-[1.05] transition-transform transform duration-300 hover:shadow-lg"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute top-1/2 left-1/2 
               -translate-x-1/2 -translate-y-1/2 
               w-3/4 h-3/4 
               bg-[#2E3D99]/70 opacity-20 blur-3xl rounded-full 
               hidden group-hover:block z-0 transition duration-500"
      ></div>

      {/* Card Content */}
      <div className="relative z-10">
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

        <div className="space-y-3 mb-5 flex">
          <div className="w-full">
            {allTasks.map((task) => {
              const status = task.status?.toLowerCase();
              let icon = (
                <Circle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              );
              if (
                status === "yes" ||
                status === "n/r" ||
                status === "approved"
              ) {
                icon = (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                );
              } else if (status === "no" || status === "rejected") {
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
                  className="flex items-center text-sm text-slate-700 mt-2 w-40 sm:w-auto"
                >
                  {icon}
                  <span>{task.title}</span>
                </div>
              );
            })}
          </div>
          <div className="absolute right-5 sm:right-2">
            <img src={stage.svg} alt="" className="h-15 sm:w-auto" />
          </div>
        </div>

        {(stage.data.noteText || stage.data.rows[0]?.noteText) && (
          <div className="mt-4 pt-4 border-t-2 border-[#FB4A50] flex">
            <blockquote className="text-sm text-slate-600 border-l-4 border-[#FB4A50] pl-3">
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
      </div>
    </motion.div>
  );
};

export default function ClientDashboard() {
  const logo = localStorage.getItem("logo") || "/Logo.png";
  const navigate = useNavigate();
  const currentModule = localStorage.getItem("currentModule");
  const [isOpen, setIsOpen] = useState(false);
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
  const [orderDetails, setOrderDetails] = useState({
    Clientname: "",
    orderId: "",
    order_date: "",
    delivery_date: "",
    address: "",
    state: "",
    type: "",
  });
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-GB")
      : "Not Set";
  };
  function formatMatterDetails(apiResponse) {
    // // // console.log(apiResponse);

    return {
      matter_date: formatDate(apiResponse.matterDate),
      matter_number: apiResponse.matterNumber.toString(),
      Clientname: apiResponse.clientName,
      address: apiResponse.propertyAddress,
      state: apiResponse.state,
      type:
        apiResponse.clientType.charAt(0).toUpperCase() +
        apiResponse.clientType.slice(1),
      settlement_date: formatDate(apiResponse.settlementDate),
    };
  }

  function formatOrderDetails(apiResponse) {
    return {
      order_date: formatDate(apiResponse.data[0].orderDetails.orderDate),
      orderId: apiResponse.data[0].orderDetails.orderId,
      Clientname: apiResponse.data[0].clientDetails.name,
      delivery_address: apiResponse.data[0].orderDetails.deliveryAddress,
      state: apiResponse.data[0].orderDetails.state,
      type: apiResponse.data[0].orderDetails.orderType,
      delivery_date: formatDate(apiResponse.data[0].orderDetails.orderDate),
    };
  }

  function splitNoteParts(note) {
    if (!note) return { beforeHyphen: "", afterHyphen: "" };
    const cleanedNote = note.replace(/SOA/g, "Adjustment Statement");
    const [before, ...after] = cleanedNote.split("-");
    return {
      beforeHyphen: before?.trim() || "",
      afterHyphen: after.join("-").trim() || "",
    };
  }

  function mapStagesFromDB(response, clientType) {
    const stages = [];
    // // // console.log(response);
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
              sections: isDualRow ? stageData.sectionsB : stageData.sections2,
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    };

    if (response.stage1)
      stages.push({
        stageName: "Initialisation",
        svg: "/stage 1.svg",
        stagecolor: response.stage1.colorStatus,
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
        svg: "/stage 2A.svg",
        stagecolor: response.stage2.colorStatus,
        financeApproval: formatDate(response.stage2.financeApprovalDate),
        data: {
          sections: [],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage2.noteForClientA).beforeHyphen,
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
                {
                  title: "Identity Verification and Client Authorisation",
                  status:
                    response.stage2.voi === "Yes" ||
                    ("yes" && response.stage2.caf === "Yes") ||
                    "yes"
                      ? "Yes"
                      : response.stage2.voi === "Processing" &&
                        response.stage2.caf === "Processing"
                      ? "Processing"
                      : "No",
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
        svg: "/stage 2B.svg",
        stagecolor: response.stage2.colorStatus,
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
          noteText: splitNoteParts(response.stage2.noteForClientB).beforeHyphen,
          rows: [
            {
              sections: [
                ...(clientType?.toLowerCase() === "seller"
                  ? [
                      {
                        title: "Discharge Authority",
                        status: response.stage2.obtainDaSeller,
                      },
                    ]
                  : []),
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
        svg: "/stage 3.svg",
        stagecolor: response.stage3.colorStatus,
        data: {
          sections: [
            {
              title: "Title & Plan Search",
              status: response.stage3.titleSearch,
            },
          ],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage3.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "PEXA & Invite Bank",
                  status: response.stage3.inviteBank,
                },
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
        svg: "/stage 4.svg",
        stagecolor: response.stage4.colorStatus,
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
        svg: "/stage 5.svg",
        stagecolor: response.stage5.colorStatus,
        data: {
          sections: [],
          noteTitle: "System Note for Client",
          noteText: splitNoteParts(response.stage5.noteForClient).beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Notification to Client",
                  status: response.stage5.notifySoaToClient,
                },
                {
                  title: "Transfer Documents Complete",
                  status: response.stage5.transferDocsOnPexa,
                },
                {
                  title: "Settlement Notification to the authorities",
                  status: response.stage5.disbursementsInPexa,
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

  function mapIDGStagesFromDB(response) {
    const stages = [];
    const order = response?.data?.[0];

    const splitNoteParts = (note = "") => {
      const [beforeHyphen, afterHyphen] = note.split(" - ");
      return {
        beforeHyphen: beforeHyphen?.trim() || "",
        afterHyphen: afterHyphen?.trim() || "",
      };
    };

    if (order?.s1) {
      const note = splitNoteParts(order.s1.noteForClient || "");
      stages.push({
        stageName: "Stage 1: Verification & Approval",
        svg: "/stage 1.svg",
        stagecolor: order.s1.colorStatus,
        data: {
          sections: [
            {
              title: "Customer Details Verified",
              status: order.s1.customerDetailsVerified || "Not Provided",
            },
            {
              title: "Customer Accepted Quote",
              status: order.s1.customerAcceptedQuote || "Not Provided",
            },
            {
              title: "Approval Status",
              status: order.s1.approvalStatus || "Not Provided",
            },
          ],
          noteTitle: "System Note for Client",
          noteText: note.beforeHyphen,
          rows: [
            {
              sections: [],
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    }

    if (order?.s2) {
      const note = splitNoteParts(order.s2.noteForClient || "");
      stages.push({
        stageName: "Stage 2: Design & Material Planning",
        svg: "/stage 2B.svg",
        stagecolor: order.s2.colorStatus,
        data: {
          sections: [],
          noteTitle: "System Note for Client",
          noteText: note.beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Design Artwork",
                  status: order.s2.designArtwork || "Not Provided",
                },
                {
                  title: "Internal Approval",
                  status: order.s2.internalApproval || "Not Provided",
                },
                {
                  title: "Proof Sent To Client",
                  status: order.s2.proofSentToClient || "Not Provided",
                },
              ],
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    }

    if (order?.s3) {
      const note = splitNoteParts(order.s3.noteForClient || "");
      stages.push({
        stageName: "Stage 3: Production & Installation",
        svg: "/stage 3.svg",
        stagecolor: order.s3.colorStatus,
        data: {
          sections: [
            {
              title: "Boards Printed",
              status: order.s3.boardsPrinted || "Not Provided",
            },
            { title: "Packaged", status: order.s3.packaged || "Not Provided" },
            {
              title: "Quality Check Passed",
              status: order.s3.qualityCheckPassed || "Not Provided",
            },
          ],
          noteTitle: "System Note for Client",
          noteText: note.beforeHyphen,
          rows: [
            {
              sections: [],
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    }

    if (order?.s4) {
      const note = splitNoteParts(order.s4.noteForClient || "");
      stages.push({
        stageName: "Stage 4: Proof & Completion",
        svg: "/stage 5.svg",
        stagecolor: order.s4.colorStatus,
        data: {
          sections: [],
          noteTitle: "System Note for Client",
          noteText: note.beforeHyphen,
          rows: [
            {
              sections: [
                {
                  title: "Images Uploaded",
                  status: (order.s4.images?.length ?? 0) > 0 ? "Yes" : "No",
                },
              ],
              noteText: note.afterHyphen,
            },
          ],
        },
      });
    }

    return stages;
  }

  useEffect(() => {
    async function fetchMatter() {
      if (!matterNumber) return;
      try {
        try {
          const response = await api.getClientDetails(matterNumber);
          if (response && response.matterNumber) {
            const formatted = formatMatterDetails(response);
            setMatterDetails(formatted);
            const stagedetails = await api.getAllStages(matterNumber);
            const stageformatted = mapStagesFromDB(stagedetails, formatted.type);
            setStageDetails(stageformatted);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log("Not a standard client, trying IDG...");
        }

        const response = await api.getIDGClientDetails(matterNumber);
        if (response) {
            const formatted = formatOrderDetails(response);
            setOrderDetails(formatted);
            const stageformatted = mapIDGStagesFromDB(response);
            setStageDetails(stageformatted);
        }
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
          task.status?.toLowerCase() === "n/r"
      ).length;
      processingTasks += allTasks.filter(
        (task) => task.status?.toLowerCase() === "processing"
      ).length;
      notCompletedTasks += allTasks.filter(
        (task) => task.status?.toLowerCase() === "no"
      ).length;
    });
    // // console.log(completedTasks, processingTasks, notCompletedTasks);
    return {
      completed: completedTasks,
      notcompleted: totalTasks,
      processingTask: processingTasks,
      total: totalTasks,
    };
  }, [stageDetails]);

  if (loading) return <Loader />;

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed top-4 left-4 h-[calc(100vh-2rem)] w-72 sm:block
        bg-[#F9FAFB] text-slate-800 rounded-2xl border border-white/40 
        shadow-sm mb-3 overflow-y-auto flex-col z-50 
        transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:flex`}
      >
        <div className="flex-grow flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-center flex-shrink-0 border-b border-slate-200 relative">
            <img className="h-auto w-[120px]" alt="OpsNav Logo" src="https://storage.googleapis.com/opsnav_web_image/opsnav%20logo%20(3).png" />
            {/* Close button in mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 lg:hidden"
            >
              <X className="w-5 h-5 text-[#FB4A50]" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-grow p-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Matter Overview */}
              <div>
                <h4 className="text-x font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <span className="border-b-2 border-b-[#FB4A50]">
                    {currentModule === "print media"
                      ? "Order Overview"
                      : "Matter Overview"}
                  </span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-x font-medium text-slate-600">
                        Client Name
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {matterDetails.Clientname || orderDetails.Clientname}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("matterNumber");
                  navigate("/client/login");
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-[#FB4A50] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1  overflow-y-auto min-w-0 lg:ml-[19.5rem]">
        <div className="p-6 sm:p-6">
          <div className="mb-6 pl-2">
            <img
              src={logo}
              className="h-[80px] md:h-[100px] w-auto object-contain"
              alt="Company Logo"
            />
          </div>

          <div className="relative flex flex-col md:flex-row items-start justify-between border-white/40 rounded-2xl shadow-sm mb-3 overflow-hidden w-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]">
            {/* LEFT SECTION: Glassmorphism card */}
            <motion.div
              className="flex-1 min-w-0 gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-lg relative p-10 shadow-lg border border-white/30 md:h-[310px]">
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex gap-1 bg-[#98dffa] z-50 lg:hidden p-2 rounded-lg text-[#049bd4] mb-2 items-center"
                >
                  <ChevronsRight className="w-8 h-8  text-[#FB4A50]" />
                  <span>Matter Details</span>
                </button>

                {/* Overlay for mobile */}
                {isOpen && (
                  <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  />
                )}
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg md:mt-20">
                  Hello, {matterDetails.Clientname || orderDetails.Clientname}{" "}
                  <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
                </h1>
                <p className="text-lg md:text-xl font-medium text-blue-50/90 tracking-wide mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                  Welcome. Here is the latest status of your matter.
                </p>

                {/* Show progress chart only on mobile */}
                {/* <div className="mt-4 block md:hidden">
          {overallProgress && (
            <ProgressChart
              completed={overallProgress.completed}
              total={overallProgress.total}
              processing={overallProgress.processingTask}
            />
          )}
        </div> */}
              </div>
            </motion.div>

            {/* RIGHT SECTION: Full image box */}
            <motion.div
              className="w-full md:w-[580px] h-[310px] overflow-hidden shadow-lg bg-white" // bg-[#B9F3FC]
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  padding: "20px 20px",
                }}
                className="h-full sm:block md:flex"
              >
                <div>
                  {overallProgress && (
                    <ProgressChart
                      completed={overallProgress.completed}
                      total={overallProgress.total}
                      processing={overallProgress.processingTask}
                    />
                  )}
                </div>
                {currentModule !== "print media" ? (
                  <img
                    src="/Home.svg"
                    alt="Image"
                    width={450}
                    height={400}
                    style={{ objectFit: "fill" }}
                  />
                ) : orderDetails.type === "Vehicle" ? (
                  <img
                    src="/IDG_Vehicle.png"
                    alt="Image"
                    width={400}
                    height={400}
                    style={{ objectFit: "fill" }}
                  />
                ) : orderDetails.type === "Commercial" ? (
                  <img
                    src="/IDG_Commercial.png"
                    alt="Image"
                    width={400}
                    height={400}
                    style={{ objectFit: "fill" }}
                  />
                ) : orderDetails.type === "Real Estate" ? (
                  <img
                    src="/IDG_RealEstate.png"
                    alt="Image"
                    width={400}
                    height={400}
                    style={{ objectFit: "fill" }}
                  />
                ) : (
                  <img
                    src="/IDG_Services.png"
                    alt="Image"
                    width={400}
                    height={400}
                    style={{ objectFit: "fill" }}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Stage Cards Section */}
          <div>
            <div className="sticky top-0 z-20 bg-[#F9FAFB] py-4 px-2 flex items-center justify-between mb-4 mr-1 flex-wrap gap-4">
              {/* Left: Chevron + Title */}
              <div className="flex items-center gap-5">
                {/* <ChevronsRight className="w-7 h-7 text-sky-500 mr-2" />
                 */}
                <img
                  src="/stage-by-stage.svg"
                  style={{ height: "60px" }}
                  alt=""
                />
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
