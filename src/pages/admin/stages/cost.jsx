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
    "Other (total)": "",
    "Other (total) Note":"",
    "Total Costs": "",
    "Total Costs Note": "",
    "Quote Amount": "",
    "Quote Amount Note": "",
    "Invoice Amount": "",
    "Invoice Amount Note": "",
  });

  const originalData = useRef({});

  useEffect(() => {
    async function fetch() {
      try {
        const response = await api.getCost(matterNumber);
        const cost = response;

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
          "Other (total) Note" : cost.otherTotalNote || "",
          "Total Costs": cost.totalCosts?.$numberDecimal || "",
          "Total Costs Note": cost.totalCostsNote || "",
          "Quote Amount": cost.quoteAmount?.$numberDecimal || "",
          "Quote Amount Note": cost.quoteAmountNote || "",
          "Invoice Amount": cost.invoiceAmount?.$numberDecimal || "",
          "Invoice Amount Note": cost.invoiceAmountNote || ""
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
        voiCafNote:formValues["VOI/CAF Note"],
        title: formValues["Title"],
        titleNote: formValues["Title Note"],
        plan: formValues["Plan"],
        planNote: formValues["Plan Note"],
        landTax: formValues["Land Tax"],
        landTaxNote: formValues["Land Tax Note"],
        landInformationCertificate: formValues["Land Information Certificate (Rates)"],
        landInformationCertificateNote: formValues["Land Information Note"],
        waterCertificate: formValues["Water Certificate"],
        waterCertificateNote: formValues["Water Certificate Note"],
        otherFee_1: formValues["Other fee (1)"],
        otherFee1Note: formValues["Note 1"],
        otherFee_2: formValues["Other fee (2)"],
        otherFee2Note: formValues["Note 2"],
        otherFee_3: formValues["Other fee (3)"],
        otherFee3Note: formValues["Note 3"],
        otherFee_4: formValues["Other fee (4)"],
        otherFee4Note: formValues["Note 4"],
        otherTotal: formValues["Other (total)"],
        otherTotalNote : formValues["Other (total) Note"],
        totalCosts: formValues["Total Costs"],
        totalCostsNote: formValues["Total Costs Note"],
        quoteAmount: formValues["Quote Amount"],
        quoteAmountNote: formValues["Quote Amount Note"],
        invoiceAmount: formValues["Invoice Amount"],
        invoiceAmountNote: formValues["Invoice Amount Note"]
      };

      console.log("Saving cost data:", payload);
      await api.upsertCost(payload);
      changeStage(stage + 1);
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
        <h1 className="font-bold text-[20px]"></h1> 
      </div>

      <div className="space-y-4">
        {/* VOI/CAF */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">VOI/CAF</div>
          <div>
            <input
              type="text"
              value={formValues["VOI/CAF"]}
              onChange={(e) => setFormValues({...formValues, "VOI/CAF": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["VOI/CAF Note"]}
              onChange={(e) => setFormValues({...formValues, "VOI/CAF Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Title": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Title Note"]}
              onChange={(e) => setFormValues({...formValues, "Title Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Plan": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Plan Note"]}
              onChange={(e) => setFormValues({...formValues, "Plan Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Land Tax": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Tax Note"]}
              onChange={(e) => setFormValues({...formValues, "Land Tax Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Land Information Certificate (Rates)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Information Note"]}
              onChange={(e) => setFormValues({...formValues, "Land Information Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Water Certificate": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Water Certificate Note"]}
              onChange={(e) => setFormValues({...formValues, "Water Certificate Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Other fee (1)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 1"]}
              onChange={(e) => setFormValues({...formValues, "Note 1": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Other fee (2)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 2"]}
              onChange={(e) => setFormValues({...formValues, "Note 2": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Other fee (3)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 3"]}
              onChange={(e) => setFormValues({...formValues, "Note 3": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Other fee (4)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
             <input
              type="text"
              value={formValues["Note 4"]}
              onChange={(e) => setFormValues({...formValues, "Note 4": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Other (total)": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Other (total) Note"]}
              onChange={(e) => setFormValues({...formValues, "Other (total) Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Total Costs": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Total Costs Note"]}
              onChange={(e) => setFormValues({...formValues, "Total Costs Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Quote Amount": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Quote Amount Note"]}
              onChange={(e) => setFormValues({...formValues, "Quote Amount Note": e.target.value})}
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
              onChange={(e) => setFormValues({...formValues, "Invoice Amount": e.target.value})}
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Invoice Amount Note"]}
              onChange={(e) => setFormValues({...formValues, "Invoice Amount Note": e.target.value})}
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
