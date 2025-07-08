import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

export default function CostComponent({ changeStage }) {
  const stage = 7;

  const [formValues, setFormValues] = useState({
    "VOI/CAF": "",
    "Title": "",
    "Plan": "",
    "Land Tax": "",
    "Land Tax Amount": "",
    "Land Information Certificate (Rates)": "",
    "Water Certificate": "",
    "Other fee (1)": "",
    "Note 1": "",
    "Other fee (2)": "90.00",
    "Note 2": "",
    "Other fee (3)": "0.00",
    "Note 3": "",
    "Other fee (4)": "0.00",
    "Note 4": "",
    "Other (total)": "99.01",
    "Total Costs": "247.44",
    "Quote Amount": "825.00",
    "Invoice Amount": ""
  });

  useEffect(() => {
    
  }, []);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const renderTextField = (label) => (
    <div className="mt-4">
      <label className="block mb-1 text-base font-bold">{label}</label>
      <input
        type="text"
        value={formValues[label] || ""}
        onChange={(e) => handleChange(label, e.target.value)}
        className="w-full rounded p-2 bg-gray-100"
      />
    </div>
  );

  return (
    <div className="overflow-y-auto">
    <h1 className="font-bold" style={{fontSize:"20px"}}  >Cost</h1>
      {renderTextField("VOI/CAF")}
      {renderTextField("Title")}
      {renderTextField("Plan")}
      {renderTextField("Land Tax")}
      {renderTextField("Land Tax Amount")}
      {renderTextField("Land Information Certificate (Rates)")}
      {renderTextField("Water Certificate")}
      {renderTextField("Other fee (1)")}
      {renderTextField("Note 1")}
      {renderTextField("Other fee (2)")}
      {renderTextField("Note 2")}
      {renderTextField("Other fee (3)")}
      {renderTextField("Note 3")}
      {renderTextField("Other fee (4)")}
      {renderTextField("Note 4")}
      {renderTextField("Other (total)")}
      {renderTextField("Total Costs")}
      {renderTextField("Quote Amount")}
      {renderTextField("Invoice Amount")}

      <div className="flex mt-10 justify-between">
        <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        <Button label="Submit" width="w-[100px]" onClick={() => console.log("Cost Submitted", formValues)} />
      </div>
    </div>
  );
}
