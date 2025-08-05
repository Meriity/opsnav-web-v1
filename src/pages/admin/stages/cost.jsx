import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/userAPI";
import { useParams,useNavigate } from "react-router-dom";

export default function CostComponent({ changeStage, reloadTrigger, setReloadTrigger }) {
  const stage = 7;
  const api = new ClientAPI();
  const { matterNumber } = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    "VOI/CAF": "",
    "VOI/CAF Note": "",
    "Title": "",
    "Title Note": "",
    "Plan": "",
    "Plan Note": "",
    "Land Tax": "",
    "Land Tax Note": "",
    "Land Tax Amount": "",
    "Land Tax Amount Note": "",
    "Land Information Certificate (Rates)": "",
    "Land Information Note": "",
    "Water Certificate": "",
    "Water Certificate Note": "",
    "Other fee (1)": "",
    "Note 1": "",
    "Other fee (2)": "",
    "Note 2": "",
    "Other fee (3)": "",
    "Note 3": "",
    "Other fee (4)": "",
    "Note 4": "",
    "Other (total)": "0",
    "Other (total) Note":"",
    "Total Costs": "0",
    "Total Costs Note": "",
    "Quote Amount": "",
    "Quote Amount Note": "",
    "Invoice Amount": "",
    "Invoice Amount Note": "",
  });

  const originalData = useRef({});

  useEffect(() => {
    calculateTotals();
  }, [
    formValues["Other fee (1)"],
    formValues["Other fee (2)"],
    formValues["Other fee (3)"],
    formValues["Other fee (4)"],
    formValues["VOI/CAF"],
    formValues["Title"],
    formValues["Plan"],
    formValues["Land Tax"],
    formValues["Land Information Certificate (Rates)"],
    formValues["Water Certificate"]
  ]);

  useEffect(() => {
  async function fetchData() {
    try {
      const stageResponse = await api.getStageOne(matterNumber);
      const response = await api.getCost(matterNumber);
      const cost = response;
      const stage = stageResponse;
      
      console.log("Stage data:", stage);

      // Initialize invoice amount
      let invoiceAmount = cost.invoiceAmount?.$numberDecimal || "";
      let quoteAmount = cost.quoteAmount?.$numberDecimal || "";
      // Apply quote type logic if stage data exists
      if (stage && stage.quoteType && stage.quoteAmount) {
        console.log("Applying quote type logic");
        if (stage.quoteType === "Fixed") {
          invoiceAmount = stage.quoteAmount;
          quoteAmount = stage.quoteAmount;
          console.log("Fixed quote - invoice amount set to:", invoiceAmount,quoteAmount);
        } else {
          // Calculate total costs for non-fixed quotes
           console.log("quoteAmount",stage.quoteAmount)
          quoteAmount = stage.quoteAmount;
         
          const totalCosts = (
            (parseFloat(cost.voiCaf?.$numberDecimal) || 0) +
            (parseFloat(cost.title?.$numberDecimal) || 0) +
            (parseFloat(cost.plan?.$numberDecimal) || 0) +
            (parseFloat(cost.landTax?.$numberDecimal) || 0) +
            (parseFloat(cost.landInformationCertificate?.$numberDecimal) || 0) +
            (parseFloat(cost.waterCertificate?.$numberDecimal) || 0) +
            (parseFloat(cost.otherTotal?.$numberDecimal) || 0)
          ).toString();
          
          invoiceAmount = (parseFloat(totalCosts) + parseFloat(stage.quoteAmount)).toString();          
          console.log("Non-fixed quote - calculated invoice amount:", invoiceAmount,quoteAmount);
        }
      }

      const mapped = {
        "VOI/CAF": cost.voiCaf?.$numberDecimal || "",
        "VOI/CAF Note": cost.voiCafNote || "",
        "Title": cost.title?.$numberDecimal || "",
        "Title Note": cost.titleNote || "",
        "Plan": cost.plan?.$numberDecimal || "",
        "Plan Note": cost.planNote || "",
        "Land Tax": cost.landTax?.$numberDecimal || "",
        "Land Tax Note": cost.landTaxNote || "",
        "Land Tax Amount": "", // optionally calculate if needed
        "Land Tax Amount Note": "",
        "Land Information Certificate (Rates)": cost.landInformationCertificate?.$numberDecimal || "",
        "Land Information Note": cost.landInformationCertificateNote || "",
        "Water Certificate": cost.waterCertificate?.$numberDecimal || "",
        "Water Certificate Note": cost.waterCertificateNote || "",
        "Other fee (1)": cost.otherFee_1?.$numberDecimal || "",
        "Note 1": cost.otherFee1Note || "",
        "Other fee (2)": cost.otherFee_2?.$numberDecimal || "",
        "Note 2": cost.otherFee2Note || "",
        "Other fee (3)": cost.otherFee_3?.$numberDecimal || "",
        "Note 3": cost.otherFee3Note || "",
        "Other fee (4)": cost.otherFee_4?.$numberDecimal || "",
        "Note 4": cost.otherFee4Note || "",
        "Other (total)": cost.otherTotal?.$numberDecimal || "",
        "Other (total) Note": cost.otherTotalNote || "",
        "Total Costs": cost.totalCosts?.$numberDecimal || "",
        "Total Costs Note": cost.totalCostsNote || "",
        "Quote Amount": quoteAmount,
        "Quote Amount Note": cost.quoteAmountNote || "",
        "Invoice Amount": invoiceAmount, // Use the calculated value
        "Invoice Amount Note": cost.invoiceAmountNote || "",
        "Quote Type": stage?.quoteType || "Fixed" // Add quote type to form state
      };

      setFormValues(mapped);
      originalData.current = mapped;
    } catch (err) {
      console.error("Failed to fetch cost data", err);
    }
  }

  fetchData();
}, [matterNumber, reloadTrigger]);

  const calculateTotals = () => {
    setFormValues(prevValues => {
      // Calculate Other (total)
      const otherTotal = (
        (parseFloat(prevValues["Other fee (1)"]) || 0) +
        (parseFloat(prevValues["Other fee (2)"]) || 0) +
        (parseFloat(prevValues["Other fee (3)"]) || 0) +
        (parseFloat(prevValues["Other fee (4)"]) || 0)
      ).toString();

      // Calculate Total Costs
      const totalCosts = (
        (parseFloat(prevValues["VOI/CAF"]) || 0) +
        (parseFloat(prevValues["Title"]) || 0) +
        (parseFloat(prevValues["Plan"]) || 0) +
        (parseFloat(prevValues["Land Tax"]) || 0) +
        (parseFloat(prevValues["Land Information Certificate (Rates)"]) || 0) +
        (parseFloat(prevValues["Water Certificate"]) || 0) +
        (parseFloat(otherTotal) || 0)
      ).toString();

      return {
        ...prevValues,
        "Other (total)": otherTotal,
        "Total Costs": totalCosts
      };
    });
  };

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

   const handleNumberChange = (field, value) => {
    // Only allow numbers and decimal points
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      handleChange(field, value);
    }
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
        matterNumber: matterNumber,
       voiCaf: parseFloat(formValues["VOI/CAF"]) || 0,
      voiCafNote: formValues["VOI/CAF Note"],
      title: parseFloat(formValues["Title"]) || 0,
      titleNote: formValues["Title Note"],
      plan: parseFloat(formValues["Plan"]) || 0,
      planNote: formValues["Plan Note"],
      landTax: parseFloat(formValues["Land Tax"]) || 0,
      landTaxNote: formValues["Land Tax Note"],
      landInformationCertificate: parseFloat(formValues["Land Information Certificate (Rates)"]) || 0,
      landInformationCertificateNote: formValues["Land Information Note"],
      waterCertificate: parseFloat(formValues["Water Certificate"]) || 0,
      waterCertificateNote: formValues["Water Certificate Note"],
      otherFee_1: parseFloat(formValues["Other fee (1)"]) || 0,
      otherFee1Note: formValues["Note 1"],
      otherFee_2: parseFloat(formValues["Other fee (2)"]) || 0,
      otherFee2Note: formValues["Note 2"],
      otherFee_3: parseFloat(formValues["Other fee (3)"]) || 0,
      otherFee3Note: formValues["Note 3"],
      otherFee_4: parseFloat(formValues["Other fee (4)"]) || 0,
      otherFee4Note: formValues["Note 4"],
      otherTotal: parseFloat(formValues["Other (total)"]) || 0,
      otherTotalNote: formValues["Other (total) Note"],
      totalCosts: parseFloat(formValues["Total Costs"]) || 0,
      totalCostsNote: formValues["Total Costs Note"],
      quoteAmount: parseFloat(formValues["Quote Amount"]) || 0,
      quoteAmountNote: formValues["Quote Amount Note"],
      invoiceAmount: parseFloat(formValues["Invoice Amount"]) || 0,
      invoiceAmountNote: formValues["Invoice Amount Note"]
      };

      console.log("Saving cost data:", payload);
      await api.upsertCost(payload);
      setReloadTrigger(!reloadTrigger);
      navigate(-1);
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
      {/* Header Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <h1 className="font-bold text-[20px] text-center">Field</h1>
        <h1 className="font-bold text-[20px] text-center">Amount</h1>
        <h1 className="font-bold text-[20px] text-center">Notes</h1> 
      </div>

      <div className="space-y-4">
        {/* VOI/CAF */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">VOI/CAF</div>
          <div>
            <input
              type="text"
              value={formValues["VOI/CAF"]}
              onChange={(e) => handleNumberChange("VOI/CAF", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["VOI/CAF Note"]}
              onChange={(e) => handleChange("VOI/CAF Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Title */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Title</div>
          <div>
            <input
              type="text"
              value={formValues["Title"]}
              onChange={(e) =>  handleNumberChange("Title", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Title Note"]}
              onChange={(e) => handleChange("Title Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Plan */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Plan</div>
          <div>
            <input
              type="text"
              value={formValues["Plan"]}
              onChange={(e) => handleNumberChange("Plan", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Plan Note"]}
              onChange={(e) => handleChange("Plan Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Land Tax */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Land Tax</div>
          <div>
            <input
              type="text"
              value={formValues["Land Tax"]}
              onChange={(e) => handleNumberChange("Land Tax", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Tax Note"]}
              onChange={(e) => handleChange("Land Tax Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Land Tax Amount */}
        {/* <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Land Tax Amount</div>
          <div>
            <input
              type="number"
              value={formValues["Land Tax Amount"]}
              onChange={(e) => setFormValues({...formValues, "Land Tax Amount": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Tax Amount Note"]}
              onChange={(e) => setFormValues({...formValues, "Land Tax Amount Note": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div> */}

        {/* Continue with all other fields in the same pattern... */}
        
        {/* Land Information Certificate (Rates) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Land Information Certificate (Rates)</div>
          <div>
            <input
              type="text"
              value={formValues["Land Information Certificate (Rates)"]}
              onChange={(e) => handleNumberChange("Land Information Certificate (Rates)", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Information Note"]}
              onChange={(e) => handleChange("Land Information Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Water Certificate */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Water Certificate</div>
          <div>
            <input
              type="text"
              value={formValues["Water Certificate"]}
              onChange={(e) => handleNumberChange("Water Certificate", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Water Certificate Note"]}
              onChange={(e) => handleChange("Water Certificate Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Other fee (1) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (1)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (1)"]}
              onChange={(e) => handleNumberChange("Other fee (1)", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 1"]}
              onChange={(e) => handleChange( "Note 1", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (2)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (2)"]}
              onChange={(e) => handleNumberChange("Other fee (2)", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 2"]}
              onChange={(e) => handleChange("Note 2", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (3)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (3)"]}
              onChange={(e) => handleNumberChange("Other fee (3)", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 3"]}
              onChange={(e) => handleChange("Note 3", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (4)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (4)"]}
              onChange={(e) => handleNumberChange("Other fee (4)", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
             <input
              type="text"
              value={formValues["Note 4"]}
              onChange={(e) => setForhandleChangemValues("Note 4", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other (total)</div>
          <div>
            <input
              type="number"
              value={formValues["Other (total)"]}
              className="w-full rounded p-2 bg-gray-100"
              readOnly // Added readOnly to prevent manual changes
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Other (total) Note"]}
              onChange={(e) => handleChange("Other (total) Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Total Costs */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Total Costs</div>
          <div>
            <input
              type="number"
              value={formValues["Total Costs"]}
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Total Costs Note"]}
              onChange={(e) => handleChange("Total Costs Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Quote Amount */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Quote Amount</div>
          <div>
            <input
              type="number"
              value={formValues["Quote Amount"]}
              onChange={(e) => handleNumberChange("Quote Amount", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Quote Amount Note"]}
              onChange={(e) => handleChange("Quote Amount Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Invoice Amount</div>
          <div>
            <input
              type="number"
              value={formValues["Invoice Amount"]}
              onChange={(e) => handleNumberChange("Invoice Amount", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Invoice Amount Note"]}
              onChange={(e) => handleChange("Invoice Amount Note", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>
      </div>
       {/* <div className="space-y-4">
        {Object.keys(formValues).map((field) => (
          <div key={field} className="grid grid-cols-3 gap-4 items-center">
            <div className="font-bold text-gray-700">{field}</div>
           
            <div> {renderTextField(field)}</div>
          </div>
        ))}
      </div>  */}

      {/* Buttons Row */}
      <div className="grid grid-cols-3 gap-4 mt-10">
        <div>
          <Button label="Back" width="w-[100px]" onClick={() => changeStage(stage - 1)} />
        </div>
        <div></div> {/* Empty column to align buttons properly */}
        <div className="flex justify-end">
          <Button label="Save and Exit" width="w-[100px]" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
