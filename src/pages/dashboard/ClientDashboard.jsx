import Button from "../../components/ui/Button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Stages from "../../components/clients/ClientStages";
import { AnimatePresence,motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientAPI from "../../api/clientAPI";
import { useParams } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const api = new ClientAPI();
  
  const [details,setdetails]=useState(false);
  const [stagedetails,setStagedetails]=useState([]);
  const [matterdetails, setMatterDetails] = useState({
  matter_date: "",
  matter_number: "",
  Clientname: "",
  address: "",
  state: "",
  type: "",
  settlement_date: "",
});

function formatMatterDetails(apiResponse) {
  console.log(apiResponse);
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
const { matterNumber } = useParams();


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
  console.log(stages);
  return stages;
}

useEffect(() => {
  async function fetchMatter() {
    console.log(matterNumber);
    const response = await api.getClientDetails(matterNumber); 
    console.log(response);
    const formatted = formatMatterDetails(response);
    console.log(formatted);
    setMatterDetails(formatted);
    const stagedetails = await api.getAllStages(matterNumber); 
    console.log(stagedetails);
    const data = stagedetails;
    const stageformatted = mapStagesFromDB(data);
    setStagedetails(stageformatted);

  }

  fetchMatter();
}, []);






  return (
    <div className="pt-[36px] px-[100px] bg-[#F3F4FB] ">
      <div className="flex justify-between items-center pb-[36px]">
        <div>
          <img
            className="w-[90px] h-[75px]"
            src="/Logo.png"
            alt="Logo"
          />
        </div>
        <div>
          <Button
            bg="bg-[#FB4A52]"
            label="Logout"
            height="h-[50px]"
            width="w-[120px]"
            bghover="hover:bg-red-600"
            bgactive="active:bg-red-900"
            onClick={()=>navigate("/client/login")}
          />
        </div>
      </div>
      <div className="max-h-800 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
<div
  className="flex justify-between items-center w-[1720] h-[71] bg-[#00AEEF] rounded-xl cursor-pointer"
  onClick={() => setdetails(prev => !prev)}
>
  <div style={{padding: "17.5px 20px"}}>
        <p className="text-24 text-white font-bold">Matter Details</p>
  </div>
        <div style={{padding: "17.5px 20px"}}>
          <button
  type="button"
  onClick={() => setdetails(prev => !prev)}
  aria-expanded={details}
>
  {details ? (
    <ChevronUp className="text-white" />
  ) : (
    <ChevronDown className="text-white" />
  )}
</button>

        </div>
      </div>
  <AnimatePresence initial={false}>
  {details && (
    <motion.div
      key="matter-details"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="w-[1720] p-4 bg-white rounded-xl mt-[20px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1 */}
          <div>
            <label className="text-sm text-gray-600">Matter Date</label>
            <input
              type="text"
              value={matterdetails.matter_date}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Matter Number</label>
            <input
              type="text"
              value={matterdetails.matter_number}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Client Name</label>
            <input
              type="text"
              value={matterdetails.Clientname}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>

          {/* Row 2 - full width address */}
          <div className="md:col-span-3">
            <label className="text-sm text-gray-600">Permanent Address</label>
            <input
              type="text"
              value={matterdetails.address}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>

          {/* Row 3 */}
          <div>
            <label className="text-sm text-gray-600">State</label>
            <input
              type="text"
              value={matterdetails.state}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Client Type</label>
            <input
              type="text"
              value={matterdetails.type}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Settlement Date</label>
            <input
              type="text"
              value={matterdetails.settlement_date}
              readOnly
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 w-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      


      <div className="flex justify-between items-center w-[1720] h-[71] bg-[#00AEEF] rounded-xl" style={{marginTop:"44px"}}>
        <p className="text-24 text-white font-bold" style={{padding: "17.5px 20px"}}>Matter Status</p>
      </div>
      <div>
      <div>
        
  {stagedetails.map((stage, idx) => (
    <Stages key={idx} stageName={stage.stageName} data={stage.data} />
  ))}
</div>

      </div>
          <div className="text-sm text-center w-full text-gray-700 font-semibold mt-5 mb-5 ">
       <p>Powered By Opsnav™</p> 
      </div>
</div>
</div>


  );
}
