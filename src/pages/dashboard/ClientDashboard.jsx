import Button from "../../components/ui/Button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Stages from "../../components/clients/ClientStages";
import { AnimatePresence,motion } from "framer-motion";
import { useState } from "react";

export default function ClientDashboard() {
  const [details,setdetails]=useState(false);
    const matterdetails = {
    matter_date:"27-04-2024",
    matter_number:"2345768",
    Clientname:"Warren Getten",
    address:"XXXXXXXXXXXXXXXXX",
    state:"VIC",
    type:"Buyer",
    settlement_date:"27-04-2024",
  }



  const stageData = [
  {
    stageName: "Stage 1",
    data: {
      sections: [
        { title: "Retainer", status: "Not Completed" },
        { title: "Declaration", status: "Completed" }
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "In progress"},
            { title: "Deposit", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "In progress"},
            { title: "Declaration", status: "Not Completed" }
          ],
         
        }
      ]
    }
  },
  {
    stageName: "Stage 2A",
    data: { sections: [
        { title: "Retainer", status: "In progress" },
        { title: "Declaration", status: "Completed"}
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "In progress" },
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "Completed" },
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Another note for the second row with the same layout."
        }
      ] } 
  },
  {
    stageName: "Stage 2B",
    data: { sections: [
        { title: "Retainer", status: "In progress"},
        { title: "Declaration", status: "Completed" }
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "In progress"},
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "Completed" },
            { title: "Declaration", status: "In progress"}
          ],
          noteTitle: "System Note for Client",
          noteText: "Another note for the second row with the same layout."
        }
      ] }
  },
  {
    stageName: "Stage 3",
    data: { sections: [
        { title: "Retainer", status: "In progress"},
        { title: "Declaration", status: "Completed" }
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "In progress" },
            { title: "Declaration", status: "Completed"}
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "Completed" },
            { title: "Declaration", status: "In progress" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Another note for the second row with the same layout."
        }
      ] }
  },
  {
    stageName: "Stage 4",
    data: { sections: [
        { title: "Retainer", status: "In progress" },
        { title: "Declaration", status: "Completed" }
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "Not Completed" },
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "In progress" },
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Another note for the second row with the same layout."
        }
      ]  }
  },
  {
    stageName: "Stage 5",
    data: { sections: [
        { title: "Retainer", status: "In progress"},
        { title: "Declaration", status: "Completed" }
      ],
      noteTitle: "System Note for Client",
      noteText: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      rows: [
        {
          sections: [
            { title: "Retainer", status: "In progress"},
            { title: "Declaration", status: "Completed" }
          ],
          noteTitle: "System Note for Client",
          noteText: "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        },
        {
          sections: [
            { title: "Declaration", status: "Not Completed" },
            { title: "Declaration", status: "Not Completed"}
          ],
          noteTitle: "System Note for Client",
          noteText: "Another note for the second row with the same layout."
        }
      ] }
  }
];

  return (
    <div className="pt-[36px] px-[100px] bg-[#F3F4FB] ">
      <div className="flex justify-between items-center pb-[36px]">
        <div>
          <img
            className="w-[90px] h-[75px]"
            src="/Logo.png"
            alt="Logo"npm 
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
      


      <div className="flex justify-between items-center w-[1720] h-[71] bg-[#00AEEF] rounded-xl" style={{marginTop:"64px"}}>
        <p className="text-24 text-white font-bold" style={{padding: "17.5px 20px"}}>Matter Status</p>
      </div>
      <div>
      <div>
        
  {stageData.map((stage, idx) => (
    <Stages key={idx} stageName={stage.stageName} data={stage.data} />
  ))}
</div>

      </div>
          <div className="text-sm text-center w-full text-gray-700 font-semibold">
        Powered By Opsnav™
      </div>
</div>
</div>


  );
}
