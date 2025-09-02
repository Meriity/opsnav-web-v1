import { useState, useEffect, useRef } from "react";
import Button from "../../../components/ui/Button";
import ClientAPI from "../../../api/userAPI";
import { useParams } from "react-router-dom";
import StageAPI from "../../../api/clientAPI";
import CostInputRow from "../../../components/ui/CostInputRow";

export default function CostComponent({
  changeStage,
  reloadTrigger,
  setReloadTrigger,
}) {
  const stage = 7;
  const api = new ClientAPI();
  const StagesAPI = new StageAPI();
  const { matterNumber } = useParams();

  const [formValues, setFormValues] = useState({
    "VOI/CAF": "",
    "VOI/CAF Note": "",
    Title: "",
    "Title Note": "",
    Plan: "",
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

        const quoteType = stageResponse?.stage1?.quoteType || "Variable";
        const quoteAmount =
          stageResponse?.stage1?.quoteAmount?.$numberDecimal ||
          stageResponse?.stage1?.quoteAmount ||
          "";

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
          Title: costData.title?.$numberDecimal || "",
          "Title Note": costData.titleNote || "",
          Plan: costData.plan?.$numberDecimal || "",
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
        return; // ✅ removed navigate(-1)
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

      setReloadTrigger((prev) => !prev);
      // ❌ removed navigate(-1) → stay on page
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
      <div className="space-y-2">
        <CostInputRow
          label="VOI/CAF"
          amountValue={formValues["VOI/CAF"]}
          noteValue={formValues["VOI/CAF Note"]}
          onAmountChange={(e) => handleNumberChange("VOI/CAF", e.target.value)}
          onNoteChange={(e) => handleChange("VOI/CAF Note", e.target.value)}
        />
        <CostInputRow
          label="Title"
          amountValue={formValues["Title"]}
          noteValue={formValues["Title Note"]}
          onAmountChange={(e) => handleNumberChange("Title", e.target.value)}
          onNoteChange={(e) => handleChange("Title Note", e.target.value)}
        />
        <CostInputRow
          label="Plan"
          amountValue={formValues["Plan"]}
          noteValue={formValues["Plan Note"]}
          onAmountChange={(e) => handleNumberChange("Plan", e.target.value)}
          onNoteChange={(e) => handleChange("Plan Note", e.target.value)}
        />
        <CostInputRow
          label="Land Tax"
          amountValue={formValues["Land Tax"]}
          noteValue={formValues["Land Tax Note"]}
          onAmountChange={(e) => handleNumberChange("Land Tax", e.target.value)}
          onNoteChange={(e) => handleChange("Land Tax Note", e.target.value)}
        />
        <CostInputRow
          label="Land Information Certificate (Rates)"
          amountValue={formValues["Land Information Certificate (Rates)"]}
          noteValue={formValues["Land Information Note"]}
          onAmountChange={(e) =>
            handleNumberChange(
              "Land Information Certificate (Rates)",
              e.target.value
            )
          }
          onNoteChange={(e) =>
            handleChange("Land Information Note", e.target.value)
          }
        />
        <CostInputRow
          label="Water Certificate"
          amountValue={formValues["Water Certificate"]}
          noteValue={formValues["Water Certificate Note"]}
          onAmountChange={(e) =>
            handleNumberChange("Water Certificate", e.target.value)
          }
          onNoteChange={(e) =>
            handleChange("Water Certificate Note", e.target.value)
          }
        />
        <CostInputRow
          label="Other fee (1)"
          amountValue={formValues["Other fee (1)"]}
          noteValue={formValues["Note 1"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (1)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 1", e.target.value)}
        />
        <CostInputRow
          label="Other fee (2)"
          amountValue={formValues["Other fee (2)"]}
          noteValue={formValues["Note 2"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (2)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 2", e.target.value)}
        />
        <CostInputRow
          label="Other fee (3)"
          amountValue={formValues["Other fee (3)"]}
          noteValue={formValues["Note 3"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (3)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 3", e.target.value)}
        />
        <CostInputRow
          label="Other fee (4)"
          amountValue={formValues["Other fee (4)"]}
          noteValue={formValues["Note 4"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (4)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 4", e.target.value)}
        />

        <hr className="my-4" />

        <CostInputRow
          label="Other (total)"
          amountValue={formValues["Other (total)"]}
          noteValue={formValues["Other (total) Note"]}
          onNoteChange={(e) =>
            handleChange("Other (total) Note", e.target.value)
          }
          isReadOnly={true}
        />
        <CostInputRow
          label="Total Costs"
          amountValue={formValues["Total Costs"]}
          noteValue={formValues["Total Costs Note"]}
          onNoteChange={(e) => handleChange("Total Costs Note", e.target.value)}
          isReadOnly={true}
        />
        <CostInputRow
          label="Quote Amount"
          amountValue={formValues["Quote Amount"]}
          noteValue={formValues["Quote Amount Note"]}
          onNoteChange={(e) =>
            handleChange("Quote Amount Note", e.target.value)
          }
          isReadOnly={false}
        />
        <CostInputRow
          label="Invoice Amount"
          amountValue={formValues["Invoice Amount"]}
          noteValue={formValues["Invoice Amount Note"]}
          onNoteChange={(e) =>
            handleChange("Invoice Amount Note", e.target.value)
          }
          isReadOnly={true}
        />
      </div>

      {/* Buttons Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10">
        <Button
          label="Back"
          width="w-full md:w-[100px]"
          onClick={() => changeStage(stage - 1)}
        />
        <Button
          label={isSaving ? "Saving..." : "Save"}
          width="w-full md:w-[120px]"
          onClick={handleSubmit}
          disabled={isSaving}
        />
      </div>
    </div>
  );
}
