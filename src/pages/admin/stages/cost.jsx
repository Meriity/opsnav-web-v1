import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/userAPI";
import { useParams, useNavigate } from "react-router-dom";
import StageAPI from "../../../api/clientAPI";

export default function CostComponent({
  changeStage,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 7;
  const api = new ClientAPI();
  const StagesAPI = new StageAPI();
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
    "Other (total) Note": "",
    "Total Costs": "0",
    "Total Costs Note": "",
    "Quote Amount": "",
    "Quote Amount Note": "",
    "Invoice Amount": "",
    "Invoice Amount Note": "",
    "Quote Type": "Variable",
  });

  const originalData = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const calculateTotals = (values = formValues) => {
    const otherTotal = (
      (parseFloat(values["Other fee (1)"]) || 0) +
      (parseFloat(values["Other fee (2)"]) || 0) +
      (parseFloat(values["Other fee (3)"]) || 0) +
      (parseFloat(values["Other fee (4)"]) || 0)
    ).toString();

    const totalCosts = (
      (parseFloat(values["VOI/CAF"]) || 0) +
      (parseFloat(values["Title"]) || 0) +
      (parseFloat(values["Plan"]) || 0) +
      (parseFloat(values["Land Tax"]) || 0) +
      (parseFloat(values["Land Information Certificate (Rates)"]) || 0) +
      (parseFloat(values["Water Certificate"]) || 0) +
      (parseFloat(otherTotal) || 0)
    ).toString();

    const quoteType = values["Quote Type"]?.toLowerCase() || "variable";
    const quoteAmount = parseFloat(values["Quote Amount"]) || 0;

    let invoiceAmount = "0";
    if (quoteType === "fixed") {
      invoiceAmount = values["Quote Amount"] || "0";
    } else {
      invoiceAmount = (parseFloat(totalCosts || 0) + quoteAmount).toString();
    }

    return {
      ...values,
      "Other (total)": otherTotal,
      "Total Costs": totalCosts,
      "Invoice Amount": invoiceAmount,
    };
  };

  useEffect(() => {
    setFormValues((prev) => calculateTotals(prev));
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
    formValues["Water Certificate"],
    formValues["Quote Type"],
    formValues["Quote Amount"],
  ]);

  useEffect(() => {
  async function fetchData() {
    try {
        setIsLoading(true);
        const stageResponse = await StagesAPI.getAllStages(matterNumber);
        const costData = stageResponse?.cost?.[0] || {};

        // Get quote info from stage1
        const quoteType = stageResponse?.stage1?.quoteType || "Variable";
        const quoteAmount =
          stageResponse?.stage1?.quoteAmount?.$numberDecimal ||
          stageResponse?.stage1?.quoteAmount ||
          "";

        // Calculate initial invoice amount
        const totalCosts = (
          (parseFloat(costData.voiCaf?.$numberDecimal) || 0) +
          (parseFloat(costData.title?.$numberDecimal) || 0) +
          (parseFloat(costData.plan?.$numberDecimal) || 0) +
          (parseFloat(costData.landTax?.$numberDecimal) || 0) +
          (parseFloat(costData.landInformationCertificate?.$numberDecimal) ||
            0) +
          (parseFloat(costData.waterCertificate?.$numberDecimal) || 0) +
          (parseFloat(costData.otherTotal?.$numberDecimal) || 0)
        ).toString();

        let invoiceAmount = "";
        if (quoteType.toLowerCase() === "fixed") {
          invoiceAmount = quoteAmount;
        } else {
          invoiceAmount = (
            parseFloat(totalCosts || 0) + parseFloat(quoteAmount || 0)
          ).toString();
      }

      const mapped = {
          "VOI/CAF": costData.voiCaf?.$numberDecimal || "",
          "VOI/CAF Note": costData.voiCafNote || "",
          "Title": costData.title?.$numberDecimal || "",
          "Title Note": costData.titleNote || "",
          "Plan": costData.plan?.$numberDecimal || "",
          "Plan Note": costData.planNote || "",
          "Land Tax": costData.landTax?.$numberDecimal || "",
          "Land Tax Note": costData.landTaxNote || "",
          "Land Tax Amount": "",
        "Land Tax Amount Note": "",
          "Land Information Certificate (Rates)":
            costData.landInformationCertificate?.$numberDecimal || "",
          "Land Information Note":
            costData.landInformationCertificateNote || "",
          "Water Certificate": costData.waterCertificate?.$numberDecimal || "",
          "Water Certificate Note": costData.waterCertificateNote || "",
          "Other fee (1)": costData.otherFee_1?.$numberDecimal || "",
          "Note 1": costData.otherFee1Note || "",
          "Other fee (2)": costData.otherFee_2?.$numberDecimal || "",
          "Note 2": costData.otherFee2Note || "",
          "Other fee (3)": costData.otherFee_3?.$numberDecimal || "",
          "Note 3": costData.otherFee3Note || "",
          "Other fee (4)": costData.otherFee_4?.$numberDecimal || "",
          "Note 4": costData.otherFee4Note || "",
          "Other (total)": costData.otherTotal?.$numberDecimal || "0",
          "Other (total) Note": costData.otherTotalNote || "",
          "Total Costs": costData.totalCosts?.$numberDecimal || "0",
          "Total Costs Note": costData.totalCostsNote || "",
        "Quote Amount": quoteAmount,
          "Quote Amount Note": costData.quoteAmountNote || "",
          "Invoice Amount": invoiceAmount,
          "Invoice Amount Note": costData.invoiceAmountNote || "",
          "Quote Type": quoteType,
        };

        const calculatedMapped = calculateTotals(mapped);
        setFormValues(calculatedMapped);
        originalData.current = calculatedMapped;
    } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
    }
  }

  fetchData();
}, [matterNumber, reloadTrigger]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

   const handleNumberChange = (field, value) => {
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
    setIsSaving(true);
    try {
      if (!isChanged()) {
        console.log("No changes to submit");
        navigate(-1);
        return;
      }

      const formatNumber = (value) => {
        if (value === "") return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      };

      const payload = {
        matterNumber: matterNumber,
        voiCaf: formatNumber(formValues["VOI/CAF"]),
      voiCafNote: formValues["VOI/CAF Note"],
        title: formatNumber(formValues["Title"]),
      titleNote: formValues["Title Note"],
        plan: formatNumber(formValues["Plan"]),
      planNote: formValues["Plan Note"],
        landTax: formatNumber(formValues["Land Tax"]),
      landTaxNote: formValues["Land Tax Note"],
        landInformationCertificate: formatNumber(
          formValues["Land Information Certificate (Rates)"]
        ),
      landInformationCertificateNote: formValues["Land Information Note"],
        waterCertificate: formatNumber(formValues["Water Certificate"]),
      waterCertificateNote: formValues["Water Certificate Note"],
        otherFee_1: formatNumber(formValues["Other fee (1)"]),
      otherFee1Note: formValues["Note 1"],
        otherFee_2: formatNumber(formValues["Other fee (2)"]),
      otherFee2Note: formValues["Note 2"],
        otherFee_3: formatNumber(formValues["Other fee (3)"]),
      otherFee3Note: formValues["Note 3"],
        otherFee_4: formatNumber(formValues["Other fee (4)"]),
      otherFee4Note: formValues["Note 4"],
        otherTotal: formatNumber(formValues["Other (total)"]),
      otherTotalNote: formValues["Other (total) Note"],
        totalCosts: formatNumber(formValues["Total Costs"]),
      totalCostsNote: formValues["Total Costs Note"],
        quoteType: formValues["Quote Type"]?.toLowerCase() || "variable",
        quoteAmount: formatNumber(formValues["Quote Amount"]),
      quoteAmountNote: formValues["Quote Amount Note"],
        invoiceAmount: formatNumber(formValues["Invoice Amount"]),
        invoiceAmountNote: formValues["Invoice Amount Note"],
      };

      // Save cost data
      const response = await api.upsertCost(payload);
      console.log("Save successful:", response);

      // const stageResponse =  await StagesAPI.upsertStageOne(matterNumber, {
      //   quoteType: formValues["Quote Type"],
      //   quoteAmount: formValues["Quote Amount"],
      // });

      // Update stage1 with quote information

      setReloadTrigger((prev) => !prev);
      navigate(-1);
    } catch (err) {
      console.error("Full error:", err);
    
      
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading cost data...</div>;
  }

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
              onChange={(e) => handleNumberChange("Title", e.target.value)}
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

        {/* Land Information Certificate (Rates) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">
            Land Information Certificate (Rates)
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Information Certificate (Rates)"]}
              onChange={(e) =>
                handleNumberChange(
                  "Land Information Certificate (Rates)",
                  e.target.value
                )
              }
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Land Information Note"]}
              onChange={(e) =>
                handleChange("Land Information Note", e.target.value)
              }
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
              onChange={(e) =>
                handleNumberChange("Water Certificate", e.target.value)
              }
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Water Certificate Note"]}
              onChange={(e) =>
                handleChange("Water Certificate Note", e.target.value)
              }
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
              onChange={(e) =>
                handleNumberChange("Other fee (1)", e.target.value)
              }
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Note 1"]}
              onChange={(e) => handleChange("Note 1", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Other fee (2) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (2)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (2)"]}
              onChange={(e) =>
                handleNumberChange("Other fee (2)", e.target.value)
              }
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

        {/* Other fee (3) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (3)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (3)"]}
              onChange={(e) =>
                handleNumberChange("Other fee (3)", e.target.value)
              }
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

        {/* Other fee (4) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other fee (4)</div>
          <div>
            <input
              type="text"
              value={formValues["Other fee (4)"]}
              onChange={(e) =>
                handleNumberChange("Other fee (4)", e.target.value)
              }
              className="w-full rounded p-2 bg-gray-100"
            />
          </div>
          <div>
             <input
              type="text"
              value={formValues["Note 4"]}
              onChange={(e) => handleChange("Note 4", e.target.value)}
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>

        {/* Other (total) */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="font-bold text-gray-700">Other (total)</div>
          <div>
            <input
              type="number"
              value={formValues["Other (total)"]}
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Other (total) Note"]}
              onChange={(e) =>
                handleChange("Other (total) Note", e.target.value)
              }
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
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Quote Amount Note"]}
              onChange={(e) =>
                handleChange("Quote Amount Note", e.target.value)
              }
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
              className="w-full rounded p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <input
              type="text"
              value={formValues["Invoice Amount Note"]}
              onChange={(e) =>
                handleChange("Invoice Amount Note", e.target.value)
              }
              className="w-full rounded p-2 bg-gray-100"
              placeholder="Enter Note"
            />
          </div>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="grid grid-cols-3 gap-4 mt-10">
        <div>
          <Button
            label="Back"
            width="w-[100px]"
            onClick={() => changeStage(stage - 1)}
          />
        </div>
        <div></div>
        <div className="flex justify-end">
          <Button
            label={isSaving ? "Saving..." : "Save and Exit"}
            width="w-[100px]"
            onClick={handleSubmit}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
