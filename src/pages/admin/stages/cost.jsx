import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/userAPI";
import { useParams } from "react-router-dom";

export default function CostComponent({ changeStage, reloadTrigger, setReloadTrigger }) {
  const stage = 7;
  const api = new ClientAPI();
  const { matterNumber } = useParams();

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
    "Other fee (2)": "",
    "Note 2": "",
    "Other fee (3)": "",
    "Note 3": "",
    "Other fee (4)": "",
    "Note 4": "",
    "Other (total)": "",
    "Total Costs": "",
    "Quote Amount": "",
    "Invoice Amount": ""
  });

  const originalData = useRef({});

  useEffect(() => {
    async function fetch() {
      try {
        const response = await api.getCost(matterNumber);
        const cost = response.data;

        const mapped = {
          "VOI/CAF": cost.voiCaf?.$numberDecimal || "",
          "Title": cost.title?.toString() || "",
          "Plan": cost.plan?.toString() || "",
          "Land Tax": cost.landTax?.toString() || "",
          "Land Tax Amount": "", // optionally calculate if needed
          "Land Information Certificate (Rates)": cost.landInformationCertificate?.$numberDecimal || "",
          "Water Certificate": cost.waterCertificate?.$numberDecimal || "",
          "Other fee (1)": cost.otherFee_1?.$numberDecimal || "",
          "Note 1": cost.otherFee1Note || "",
          "Other fee (2)": cost.otherFee_2?.$numberDecimal || "",
          "Note 2": cost.otherFee2Note || "",
          "Other fee (3)": cost.otherFee_3?.$numberDecimal || "",
          "Note 3": cost.otherFee3Note || "",
          "Other fee (4)": cost.otherFee_4?.$numberDecimal || "",
          "Note 4": cost.otherFee4Note || "",
          "Other (total)": cost.otherTotal?.$numberDecimal || "",
          "Total Costs": cost.totalCosts?.$numberDecimal || "",
          "Quote Amount": cost.quoteAmount?.$numberDecimal || "",
          "Invoice Amount": cost.invoiceAmount?.$numberDecimal || ""
        };

        setFormValues(mapped);
        originalData.current = mapped;
      } catch (err) {
        console.error("Failed to fetch cost data", err);
      }
    }

    fetch();
  }, [matterNumber]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  function isChanged() {
    const current = formValues;
    const original = originalData.current;
    return Object.keys(current).some((key) => current[key] !== original[key]);
  }

  async function handleSubmit() {
    try {
      if (!isChanged()) {
        console.log("No changes to submit");
        return;
      }

      const payload = {
        matterNumber,
        voiCaf: formValues["VOI/CAF"],
        title: formValues["Title"],
        plan: formValues["Plan"],
        landTax: formValues["Land Tax"],
        landInformationCertificate: formValues["Land Information Certificate (Rates)"],
        waterCertificate: formValues["Water Certificate"],
        otherFee_1: formValues["Other fee (1)"],
        otherFee1Note: formValues["Note 1"],
        otherFee_2: formValues["Other fee (2)"],
        otherFee2Note: formValues["Note 2"],
        otherFee_3: formValues["Other fee (3)"],
        otherFee3Note: formValues["Note 3"],
        otherFee_4: formValues["Other fee (4)"],
        otherFee4Note: formValues["Note 4"],
        otherTotal: formValues["Other (total)"],
        totalCosts: formValues["Total Costs"],
        quoteAmount: formValues["Quote Amount"],
        invoiceAmount: formValues["Invoice Amount"]
      };

      console.log("Saving cost data:", payload);
      await api.upsertCost(payload);
      changeStage(stage + 1);
    } catch (err) {
      console.error("Error submitting cost data:", err);
    }
  }

  const renderTextField = (label) => (
    <div className="mt-4 flex items-center justify-between" key={label}>
      <label className="block mb-1 text-base font-bold pr-3">{label}</label>
      <input
        type="text"
        value={formValues[label] || ""}
        onChange={(e) => handleChange(label, e.target.value)}
        className="rounded p-2 bg-gray-100"
      />
    </div>
  );

  return (
    <div className="overflow-y-auto">
      <h1 className="font-bold text-[20px]">Cost</h1>
      {Object.keys(formValues).map((field) => renderTextField(field))}

      <div className="flex mt-10 justify-between">
        <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        <Button label="Save and Exit" width="w-[100px]" onClick={handleSubmit} />
      </div>
    </div>
  );
}
