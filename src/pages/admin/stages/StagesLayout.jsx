import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Stage1 from "./Stage1";
import Stage2 from "./Stage2";
import Stage3 from "./Stage3";
import Stage4 from "./Stage4";
import Stage5 from "./Stage5";
import Stage6 from "./Stage6";
import Cost from "./cost";


export default function StagesLayout() {
  const [selectedStage, setSelectedStage] = useState(1);
  const navigate=useNavigate();
  const stages = [
    { id: 1, title: "Retainer/Declaration" },
    { id: 2, title: "VOI/CAF/Approvals" },
    { id: 3, title: "Searches/PEXA" },
    { id: 4, title: "DTS/DOL/SOA" },
    { id: 5, title: "Notify/Transfer/Disb" },
    { id: 6, title: "Final Letter/Close" },
  ];

  const section = {
    status: "In progress",
  };

  function bgcolor(status) {
    switch (status) {
      case "In progress":
        return "bg-[#FFEECF]";
      case "Completed":
        return "bg-[#00A506]";
      case "Not Completed":
        return "bg-[#FF0000]";
      default:
        return "";
    }
  }

  function RenderStage(newStage) {
    setSelectedStage(newStage);
  }


  function Showstage(stage){
    switch(stage){
      case 0:
        return <Stage1 changeStage={RenderStage}/>
      case 1:
        return <Stage1 changeStage={RenderStage}/>
      case 2:
        return <Stage2 changeStage={RenderStage}/>
      case 3:
        return <Stage3 changeStage={RenderStage}/>
      case 4:
        return <Stage4 changeStage={RenderStage}/>
      case 5:
        return <Stage5 changeStage={RenderStage}/>
      case 6:
        return <Stage6 changeStage={RenderStage}/>   
      case 7:
        return <Cost changeStage={RenderStage}/>   
      default:
        return <Stage6 changeStage={RenderStage}/>
    }

  }


  return (
    <div className="flex w-full h-full bg-gray-100">
      <main className="flex-grow h-full space-y-4 w-[1230px]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hello Vinu</h2>
          <div className="flex items-center gap-2">
            <Button label="Back" bg="bg-[#FB4A52]" width="w-[84px]" onClick={()=>navigate("/admin/view-clients")} />
            <Button label="Cost" bg="bg-[#FB4A52]" width="w-[84px]" onClick={()=>setSelectedStage(7)}/>
          </div>
        </div>

        <div className="flex px-4 py-3  bg-[#F2FBFF] gap-[10px] rounded flex-wrap">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`cursor-pointer p-2 rounded shadow w-[190px] h-[62px] transition-colors duration-200 ${
                selectedStage === stage.id ? "bg-white" : "bg-[#F3F7FF]"
              }`}
            >
              <div className="flex justify-between">
                <p className="font-bold font-poppins">Stage {index + 1}</p>
                <div
                  className={`w-[90px] h-[18px] ${bgcolor(section.status)} ${
                    section.status === "In progress" ? "text-[#FF9500]" : "text-white"
                  } flex items-center justify-center rounded-4xl`}
                >
                  <p className="text-[12px] whitespace-nowrap">{section.status}</p>
                </div>
              </div>
              <div>
                <p>{stage.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-[22px]">
            <div className="w-[923px] h-[540px] p-[40px] bg-white overflow-y-auto">
              {Showstage(selectedStage)}
            </div>
    <div className="w-[710px] h-[540px]">
     <div className="w-full max-w-4xl p-[30px] bg-white rounded-[10px] shadow">
      <h2 className="text-xl font-bold mb-3">Matter Details</h2>
      <form className="space-y-1">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Matter Date</label>
            <input
              type="date"
              placeholder="dd/mm/yyyy"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Matter Number</label>
            <input
              type="text"
              placeholder="Matter Number"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Client Name</label>
            <input
              type="text"
              placeholder="Client Name"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block mb-1 text-sm font-medium">Property Address</label>
            <input
              type="text"
              placeholder="Permanent Address"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">State</label>
            <input
              type="text"
              placeholder="State"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Client Type</label>
            <input
              type="text"
              placeholder="Client Type"
              className="w-full rounded p-2 bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Settlement Date</label>
            <input
              type="date"
              placeholder="dd/mm/yyyy"
              className="w-full rounded p-2 border"
            />
          </div>
        </div>

        {/* Data Entry By */}
        <div>
          <label className="block mb-1 text-sm font-medium">Data Entry By</label>
          <input
            type="text"
            placeholder="Data Entry By"
            className="w-full rounded p-2 bg-gray-100"
            disabled
          />
        </div>

        {/* Notes / Comments */}
        <div>
          <label className="block mb-1 text-sm font-medium">Notes / Comments</label>
          <textarea
            rows={4}
            placeholder="Enter comments here..."
            className="w-full border rounded p-2 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#00AEEF] hover:bg-[#0086bf] text-white font-medium py-2 rounded"
        >
          Update
        </button>
      </form>
    </div>

            </div>
        </div>
      </main>
    </div>
  );
}
