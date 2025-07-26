import Button from "../../components/ui/Button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Stages from "../../components/clients/ClientStages";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientAPI from "../../api/clientAPI";
import Loader from "../../components/ui/Loader";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const api = new ClientAPI();
  let { matterNumber } = useParams();
  matterNumber = atob(matterNumber);

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(false);
  const [stageDetails, setStageDetails] = useState([]);
  const [matterDetails, setMatterDetails] = useState({
    matter_date: "",
    matter_number: "",
    Clientname: "",
    address: "",
    state: "",
    type: "",
    settlement_date: "",
  });

  function formatMatterDetails(apiResponse) {
    return {
      matter_date: new Date(apiResponse.matterDate).toLocaleDateString("en-GB"),
      matter_number: apiResponse.matterNumber.toString(),
      Clientname: apiResponse.clientName,
      address: apiResponse.propertyAddress,
      state: apiResponse.state,
      type: apiResponse.clientType.charAt(0).toUpperCase() + apiResponse.clientType.slice(1),
      settlement_date: new Date(apiResponse.settlementDate).toLocaleDateString("en-GB"),
    };
  }


  function splitNoteParts(note) {
    if (!note) return { beforeHyphen: "", afterHyphen: "" };
    const [before, ...after] = note.split("-");
    return {
      beforeHyphen: before?.trim() || "",
      afterHyphen: after.join("-").trim() || ""
    };
  }

  function mapStagesFromDB(response) {
    const stages = [];

    // Stage 1
    const note1 = splitNoteParts(response.stage1?.noteForClient);
    stages.push({
      stageName: "Stage 1",
      data: {
        sections: [
          { title: "Retainer", status: response.stage1?.retainer },
          { title: "Declaration Form", status: response.stage1?.declarationForm }
        ],
        noteTitle: "System Note for Client",
        noteText: note1.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Tenants", status: response.stage1?.tenants },
              { title: "Contract Review", status: response.stage1?.contractReview }
            ],
            noteText: note1.afterHyphen
          }
        ]
      }
    });

    // Stage 2A
    const note2a = splitNoteParts(response.stage2?.noteForClientA);
    stages.push({
      stageName: "Stage 2A",
      data: {
        sections: [
          { title: "VOI", status: response.stage2?.voi },
          { title: "CAF", status: response.stage2?.caf }
        ],
        noteTitle: "System Note for Client",
        noteText: note2a.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Signed Contract", status: response.stage2?.signedContract },
              { title: "Deposit Receipt", status: response.stage2?.depositReceipt }
            ],
            noteText: note2a.afterHyphen
          }
        ]
      }
    });

    // Stage 2B
    const note2b = splitNoteParts(response.stage2?.noteForClientB);
    stages.push({
      stageName: "Stage 2B",
      data: {
        sections: [
          { title: "Building & Pest", status: response.stage2?.buildingAndPest },
          { title: "Finance Approval", status: response.stage2?.financeApproval }
        ],
        noteTitle: "System Note for Client",
        noteText: note2b.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Obtain DA Seller", status: response.stage2?.obtainDaSeller },
              { title: "CT Controller", status: response.stage2?.checkCtController }
            ],
            noteText: note2b.afterHyphen
          }
        ]
      }
    });

    // Stage 3
    const note3 = splitNoteParts(response.stage3?.noteForClient);
    stages.push({
      stageName: "Stage 3",
      data: {
        sections: [
          { title: "Instrument", status: response.stage3?.instrument },
          { title: "Title Search", status: response.stage3?.titleSearch }
        ],
        noteTitle: "System Note for Client",
        noteText: note3.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Invite Bank", status: response.stage3?.inviteBank },
              { title: "Rates", status: response.stage3?.rates }
            ],
            noteText: note3.afterHyphen
          }
        ]
      }
    });

    // Stage 4
    const note4 = splitNoteParts(response.stage4?.noteForClient);
    stages.push({
      stageName: "Stage 4",
      data: {
        sections: [
          { title: "DTS", status: response.stage4?.dts },
          { title: "SOA", status: response.stage4?.soa }
        ],
        noteTitle: "System Note for Client",
        noteText: note4.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Duty Online", status: response.stage4?.dutyOnline },
              { title: "FRCGW", status: response.stage4?.frcgw }
            ],
            noteText: note4.afterHyphen
          }
        ]
      }
    });

    // Stage 5
    const note5 = splitNoteParts(response.stage5?.noteForClient);
    stages.push({
      stageName: "Stage 5",
      data: {
        sections: [
          { title: "Council", status: response.stage5?.council },
          { title: "GST Withholding", status: response.stage5?.gstWithholding }
        ],
        noteTitle: "System Note for Client",
        noteText: note5.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Notify SOA", status: response.stage5?.notifySoaToClient },
              { title: "Settlement Notification", status: response.stage5?.settlementNotification }
            ],
            noteText: note5.afterHyphen
          }
        ]
      }
    });

    // Stage 6
    const note6 = splitNoteParts(response.stage6?.noteForClient);
    stages.push({
      stageName: "Stage 6",
      data: {
        sections: [
          { title: "Invoiced", status: response.stage6?.invoiced },
          { title: "NOA to Council/Water", status: response.stage6?.noaToCouncilWater }
        ],
        noteTitle: "System Note for Client",
        noteText: note6.beforeHyphen,
        rows: [
          {
            sections: [
              { title: "Duty Paid", status: response.stage6?.dutyPaid },
              { title: "Final Letter to Agent", status: response.stage6?.finalLetterToAgent }
            ],
            noteText: note6.afterHyphen
          }
        ]
      }
    });
    return stages;
  }

  useEffect(() => {
    async function fetchMatter() {
      const response = await api.getClientDetails(matterNumber);
      const formatted = formatMatterDetails(response);
      setMatterDetails(formatted);
      const stagedetails = await api.getAllStages(matterNumber);
      const data = stagedetails;
      const stageformatted = mapStagesFromDB(data);
      setStageDetails(stageformatted);
      setLoading(false);
    }
    fetchMatter();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-[#F3F4FB] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between shadow-2xl p-2 sm:items-center gap-4 mb-6">
        <div className="flex justify-center sm:justify-start">
          <img className="w-[170px] h-[65px]" src="/Logo.png" alt="Logo" />
        </div>
        <div className="flex justify-center sm:justify-end">
          <Button
            bg="bg-[#FB4A52]"
            label="Logout"
            height="h-[50px]"
            width="w-[120px]"
            bghover="hover:bg-red-600"
            bgactive="active:bg-red-900"
            onClick={() => navigate("/client/login")}
          />
        </div>
      </div>


      {/* Main Container */}
      <main className="px-4 sm:px-6 md:px-12 lg:px-24 py-6">
        {/* Matter Details Toggle */}
        <div
          className="flex justify-between items-center bg-[#00AEEF] rounded-xl px-4 py-3 cursor-pointer"
          onClick={() => setDetails(prev => !prev)}
        >
          <p className="text-white font-semibold text-lg">Matter Details</p>
          <button type="button" aria-expanded={details}>
            {details ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
          </button>
        </div>

        {/* Matter Details Accordion */}
        <AnimatePresence initial={false}>
          {details && (
            <motion.div
              key="matter-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="bg-white shadow rounded-xl p-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    ["Matter Date", matterDetails.matter_date],
                    ["Matter Number", matterDetails.matter_number],
                    ["Client Name", matterDetails.Clientname],
                    ["Address", matterDetails.address],
                    ["State", matterDetails.state],
                    ["Client Type", matterDetails.type],
                    ["Settlement Date", matterDetails.settlement_date],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label className="text-sm text-gray-600">{label}</label>
                      <input
                        type="text"
                        value={value || ""}
                        readOnly
                        className="w-full bg-gray-100 rounded-md px-4 py-2 mt-1 text-sm text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matter Status */}
        <div className="mt-8 bg-[#00AEEF] rounded-xl px-4 py-3">
          <p className="text-white font-semibold text-lg">Matter Status</p>
        </div>

        <div className="mt-4 space-y-4">
          {stageDetails.map((stage, idx) => (
            <Stages key={idx} stageName={stage.stageName} data={stage.data} />
          ))}
        </div>

        {/* Footer */}
        <footer className="text-sm text-center text-gray-600 font-medium mt-8">
          <p>Powered By Opsnav™</p>
        </footer>
      </main>
    </div>
  );
}
