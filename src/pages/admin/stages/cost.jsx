import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import ClientAPI from "@/api/userAPI";
import { useParams } from "react-router-dom";
import StageAPI from "@/api/clientAPI";
import CommercialAPI from "@/api/commercialAPI";
import CostInputRow from "@/components/ui/CostInputRow";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper to define initial state structures for different companies
const getInitialState = (company, currentModule) => {
  const commonState = {
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
  };

  if (currentModule === "commercial") {
    return {
      VOI: "",
      "VOI Note": "",
      Title: "",
      "Title Note": "",
      "Land Tax": "",
      "Land Tax Note": "",
      "Owners Corporation": "",
      "Owners Corporation Note": "",
      PPSR: "",
      "PPSR Note": "",
      Water: "",
      "Water Note": "",
      Rates: "",
      "Rates Note": "",
      ...commonState,
    };
  } else if (company === "vkl") {
    return {
      "VOI/CAF": "",
      "VOI/CAF Note": "",
      Title: "",
      "Title Note": "",
      Plan: "",
      "Plan Note": "",
      "Land Tax": "",
      "Land Tax Note": "",
      "Land Information Certificate (Rates)": "",
      "Land Information Note": "",
      "Water Certificate": "",
      "Water Certificate Note": "",
      ...commonState,
    };
  }

  // Default or "idg" state
  return commonState;
};

export default function CostComponent({ changeStage }) {
  const { matterNumber } = useParams();
  const queryClient = useQueryClient();

  // --- Memoized Values ---
  const company = useMemo(() => localStorage.getItem("company") || "idg", []);
  const currentModule = useMemo(
    () => localStorage.getItem("currentModule"),
    []
  );

  const stage = 7;
  const api = useMemo(() => new ClientAPI(), []);
  const StagesAPI = useMemo(() => new StageAPI(), []);
  const commercialApi = useMemo(() => new CommercialAPI(), []);

  // --- State ---
  const [formValues, setFormValues] = useState(
    getInitialState(company, currentModule)
  );
  const originalData = useRef({});
  // isLoading and isSaving are now handled by React Query

  // --- Calculation Logic ---
  const calculateTotals = useCallback(
    (values) => {
      const formatNum = (num) => {
        if (isNaN(num)) return "0.00";
        return parseFloat(num).toFixed(2);
      };

      const otherTotal = formatNum(
        (parseFloat(values["Other fee (1)"]) || 0) +
          (parseFloat(values["Other fee (2)"]) || 0) +
          (parseFloat(values["Other fee (3)"]) || 0) +
          (parseFloat(values["Other fee (4)"]) || 0)
      );

      let totalCosts = "0.00";

      if (currentModule === "commercial") {
        totalCosts = formatNum(
          (parseFloat(values["VOI"]) || 0) +
            (parseFloat(values["Title"]) || 0) +
            (parseFloat(values["Land Tax"]) || 0) +
            (parseFloat(values["Owners Corporation"]) || 0) +
            (parseFloat(values["PPSR"]) || 0) +
            (parseFloat(values["Water"]) || 0) +
            (parseFloat(values["Rates"]) || 0) +
            (parseFloat(otherTotal) || 0)
        );
      } else if (company === "vkl") {
        totalCosts = formatNum(
          (parseFloat(values["VOI/CAF"]) || 0) +
            (parseFloat(values["Title"]) || 0) +
            (parseFloat(values["Plan"]) || 0) +
            (parseFloat(values["Land Tax"]) || 0) +
            (parseFloat(values["Land Information Certificate (Rates)"]) || 0) +
            (parseFloat(values["Water Certificate"]) || 0) +
            (parseFloat(otherTotal) || 0)
        );
      } else {
        totalCosts = otherTotal;
      }

      const quoteType = values["Quote Type"]?.toLowerCase() || "variable";
      const quoteAmount = parseFloat(values["Quote Amount"]) || 0;

      let invoiceAmount = "0.00";
      if (quoteType === "fixed") {
        invoiceAmount = formatNum(values["Quote Amount"] || 0);
      } else {
        invoiceAmount = formatNum(parseFloat(totalCosts || 0) + quoteAmount);
      }

      return {
        ...values,
        "Other (total)": otherTotal,
        "Total Costs": totalCosts,
        "Invoice Amount": invoiceAmount,
      };
    },
    [company, currentModule]
  );

  // --- Data Fetching with useQuery ---
  const fetchCostData = useCallback(async () => {
    try {
      let stageResponse, costData, stage1Data;

      if (currentModule === "commercial") {
        console.log("Fetching commercial cost data for:", matterNumber);
        try {
          const costResponse = await commercialApi.getCostData(matterNumber);
          costData = costResponse || {};
        } catch (error) {
          console.log("No commercial cost data found, using empty state");
          costData = {};
        }

        try {
          const stage1Response = await commercialApi.getStageData(
            1,
            matterNumber
          );
          stage1Data = stage1Response || {};
        } catch (stageError) {
          console.log("No commercial stage 1 data found");
          stage1Data = {};
        }
      } else {
        stageResponse =
          company === "vkl"
            ? await StagesAPI.getAllStages(matterNumber)
            : await StagesAPI.getIDGStages(matterNumber);

        if (!stageResponse || (company === "idg" && !stageResponse.data)) {
          throw new Error(
            "Failed to fetch stage data. The client may not exist."
          );
        }

        if (company === "vkl") {
          costData = stageResponse?.cost || {};
        } else {
          costData =
            stageResponse?.cost?.[0] || stageResponse?.data?.cost || {};
        }
        stage1Data = stageResponse?.stage1 || {};
      }

      const quoteType =
        (stage1Data.quoteType &&
          (stage1Data.quoteType.$numberDecimal ?? stage1Data.quoteType)) ||
        "Variable";

      const getDecimalValue = (v) => {
        if (v === undefined || v === null) return "";
        if (typeof v === "object" && v.$numberDecimal !== undefined)
          return v.$numberDecimal;
        return v;
      };

      const quoteAmount =
        getDecimalValue(stage1Data.quoteAmount) ||
        getDecimalValue(costData.quoteAmount) ||
        "";

      let mappedData = {};

      const commonMapped = {
        "Other (total)": costData.otherTotal?.$numberDecimal || "0",
        "Other (total) Note": costData.otherTotalNote || "",
        "Total Costs": costData.totalCosts?.$numberDecimal || "0",
        "Total Costs Note": costData.totalCostsNote || "",
        "Quote Amount": quoteAmount === "" ? "" : parseFloat(quoteAmount),
        "Quote Amount Note": costData.quoteAmountNote || "",
        "Invoice Amount": costData.invoiceAmount?.$numberDecimal || "",
        "Invoice Amount Note": costData.invoiceAmountNote || "",
        "Quote Type": quoteType,
      };

      if (currentModule === "commercial") {
        mappedData = {
          VOI: getDecimalValue(costData.voi) || "",
          "VOI Note": costData.voiNote || "",
          Title: getDecimalValue(costData.title) || "",
          "Title Note": costData.titleNote || "",
          "Land Tax": getDecimalValue(costData.landTax) || "",
          "Land Tax Note": costData.landTaxNote || "",
          "Owners Corporation":
            getDecimalValue(costData.ownersCorporation) || "",
          "Owners Corporation Note": costData.ownersCorporationNote || "",
          PPSR: getDecimalValue(costData.ppsr) || "",
          "PPSR Note": costData.ppsrNote || "",
          Water: getDecimalValue(costData.water) || "",
          "Water Note": costData.waterNote || "",
          Rates: getDecimalValue(costData.rates) || "",
          "Rates Note": costData.ratesNote || "",
          "Other fee (1)": getDecimalValue(costData.otherFee1) || "",
          "Note 1": costData.otherFee1Note || "",
          "Other fee (2)": getDecimalValue(costData.otherFee2) || "",
          "Note 2": costData.otherFee2Note || "",
          "Other fee (3)": getDecimalValue(costData.otherFee3) || "",
          "Note 3": costData.otherFee3Note || "",
          "Other fee (4)": getDecimalValue(costData.otherFee4) || "",
          "Note 4": costData.otherFee4Note || "",
          ...commonMapped,
        };
      } else if (company === "vkl") {
        mappedData = {
          "VOI/CAF": costData.voiCaf?.$numberDecimal || "",
          "VOI/CAF Note": costData.voiCafNote || "",
          Title: costData.title?.$numberDecimal || "",
          "Title Note": costData.titleNote || "",
          Plan: costData.plan?.$numberDecimal || "",
          "Plan Note": costData.planNote || "",
          "Land Tax": costData.landTax?.$numberDecimal || "",
          "Land Tax Note": costData.landTaxNote || "",
          "Land Information Certificate (Rates)":
            costData.landInformationCertificate?.$numberDecimal || "",
          "Land Information Note":
            costData.landInformationCertificateNote || "",
          "Water Certificate": costData.waterCertificate?.$numberDecimal || "",
          "Water Certificate Note": costData.waterCertificateNote || "",
          "Other fee (1)": getDecimalValue(costData.otherFee_1) || "",
          "Note 1": costData.otherFee1Note || "",
          "Other fee (2)": getDecimalValue(costData.otherFee_2) || "",
          "Note 2": costData.otherFee2Note || "",
          "Other fee (3)": getDecimalValue(costData.otherFee_3) || "",
          "Note 3": costData.otherFee3Note || "",
          "Other fee (4)": getDecimalValue(costData.otherFee_4) || "",
          "Note 4": costData.otherFee4Note || "",
          ...commonMapped,
        };
      } else {
        mappedData = {
          "Other fee (1)": getDecimalValue(costData.fee1) || "",
          "Note 1": costData.fee1Note || "",
          "Other fee (2)": getDecimalValue(costData.fee2) || "",
          "Note 2": costData.fee2Note || "",
          "Other fee (3)": getDecimalValue(costData.fee3) || "",
          "Note 3": costData.fee3Note || "",
          "Other fee (4)": getDecimalValue(costData.fee4) || "",
          "Note 4": costData.fee4Note || "",
          ...commonMapped,
        };
      }

      return calculateTotals(mappedData);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load cost data");
      throw err; // Re-throw to be caught by useQuery
    }
  }, [
    matterNumber,
    currentModule,
    company,
    commercialApi,
    StagesAPI,
    calculateTotals,
  ]);

  const { data: loadedData, isLoading } = useQuery({
    queryKey: ["costData", matterNumber, currentModule, company],
    queryFn: fetchCostData,
    enabled: !!matterNumber,
  });

  // Effect to populate form when query data is loaded
  useEffect(() => {
    if (loadedData) {
      setFormValues(loadedData);
      originalData.current = loadedData;
      console.log("Final initialized form data:", loadedData);
    }
  }, [loadedData]);

  // Effect to re-calculate totals when inputs change
  useEffect(() => {
    setFormValues((prev) => calculateTotals(prev));
  }, [
    calculateTotals,
    formValues["Other fee (1)"],
    formValues["Other fee (2)"],
    formValues["Other fee (3)"],
    formValues["Other fee (4)"],
    formValues["VOI"],
    formValues["VOI/CAF"],
    formValues["Title"],
    formValues["Plan"],
    formValues["Land Tax"],
    formValues["Owners Corporation"],
    formValues["PPSR"],
    formValues["Water"],
    formValues["Rates"],
    formValues["Land Information Certificate (Rates)"],
    formValues["Water Certificate"],
    formValues["Quote Type"],
    formValues["Quote Amount"],
    formValues["Other (total)"],
    formValues["Total Costs"],
    formValues["Invoice Amount"],
  ]);

  // --- Change Handlers ---
  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      handleChange(field, value);
    }
  };

  const isChanged = () => {
    return JSON.stringify(formValues) !== JSON.stringify(originalData.current);
  };

  // --- Data Saving with useMutation ---
  const { mutate: saveCost, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const formatNumber = (value) => {
        if (value === "") return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
      };

      let commonPayload;
      if (currentModule === "commercial") {
        commonPayload = {
          matterNumber: matterNumber,
          otherFee1: formatNumber(formValues["Other fee (1)"]),
          otherFee1Note: formValues["Note 1"],
          otherFee2: formatNumber(formValues["Other fee (2)"]),
          otherFee2Note: formValues["Note 2"],
          otherFee3: formatNumber(formValues["Other fee (3)"]),
          otherFee3Note: formValues["Note 3"],
          otherFee4: formatNumber(formValues["Other fee (4)"]),
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
      } else if (company === "vkl") {
        commonPayload = {
          matterNumber: matterNumber,
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
      } else {
        commonPayload = {
          orderId: matterNumber,
          fee1: formatNumber(formValues["Other fee (1)"]),
          fee1Note: formValues["Note 1"],
          fee2: formatNumber(formValues["Other fee (2)"]),
          fee2Note: formValues["Note 2"],
          fee3: formatNumber(formValues["Other fee (3)"]),
          fee3Note: formValues["Note 3"],
          fee4: formatNumber(formValues["Other fee (4)"]),
          fee4Note: formValues["Note 4"],
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
      }

      let finalPayload;
      if (currentModule === "commercial") {
        finalPayload = {
          ...commonPayload,
          voi: formatNumber(formValues["VOI"]),
          voiNote: formValues["VOI Note"],
          title: formatNumber(formValues["Title"]),
          titleNote: formValues["Title Note"],
          landTax: formatNumber(formValues["Land Tax"]),
          landTaxNote: formValues["Land Tax Note"],
          ownersCorporation: formatNumber(formValues["Owners Corporation"]),
          ownersCorporationNote: formValues["Owners Corporation Note"],
          ppsr: formatNumber(formValues["PPSR"]),
          ppsrNote: formValues["PPSR Note"],
          water: formatNumber(formValues["Water"]),
          waterNote: formValues["Water Note"],
          rates: formatNumber(formValues["Rates"]),
          ratesNote: formValues["Rates Note"],
        };
      } else if (company === "vkl") {
        finalPayload = {
          ...commonPayload,
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
        };
      } else {
        finalPayload = commonPayload;
      }

      console.log("=== COST SAVE PAYLOAD ===", finalPayload);

      if (currentModule === "commercial") {
        return commercialApi.upsertCost(matterNumber, finalPayload);
      } else if (company === "vkl") {
        return api.upsertCost(finalPayload);
      } else {
        return api.upsertIDGCost(matterNumber, finalPayload);
      }
    },
    onSuccess: (response) => {
      console.log("Cost save successful:", response);
      originalData.current = { ...formValues }; // Update original data
      toast.success("Cost data updated Successfully!");
      // Invalidate query to refetch
      queryClient.invalidateQueries({
        queryKey: ["costData", matterNumber, currentModule, company],
      });
      try {
        sessionStorage.setItem("opsnav_clients_should_reload", "1");
      } catch (e) {}
    },
    onError: (err) => {
      console.error("=== COST SAVE ERROR ===", err);
      let errorMessage = "Failed to save cost data. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    },
  });

  async function handleSubmit() {
    if (!isChanged() || isSaving) {
      if (!isChanged()) console.log("No changes to submit");
      return;
    }
    saveCost();
  }

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="space-y-2">
        {/* Commercial specific fields */}
        {currentModule === "commercial" && (
          <>
            <CostInputRow
              label="VOI"
              amountValue={formValues["VOI"]}
              noteValue={formValues["VOI Note"]}
              onAmountChange={(e) => handleNumberChange("VOI", e.target.value)}
              onNoteChange={(e) => handleChange("VOI Note", e.target.value)}
            />
            <CostInputRow
              label="Title"
              amountValue={formValues["Title"]}
              noteValue={formValues["Title Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Title", e.target.value)
              }
              onNoteChange={(e) => handleChange("Title Note", e.target.value)}
            />
            <CostInputRow
              label="Land Tax"
              amountValue={formValues["Land Tax"]}
              noteValue={formValues["Land Tax Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Land Tax", e.target.value)
              }
              onNoteChange={(e) =>
                handleChange("Land Tax Note", e.target.value)
              }
            />
            <CostInputRow
              label="Owners Corporation"
              amountValue={formValues["Owners Corporation"]}
              noteValue={formValues["Owners Corporation Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Owners Corporation", e.target.value)
              }
              onNoteChange={(e) =>
                handleChange("Owners Corporation Note", e.target.value)
              }
            />
            <CostInputRow
              label="PPSR"
              amountValue={formValues["PPSR"]}
              noteValue={formValues["PPSR Note"]}
              onAmountChange={(e) => handleNumberChange("PPSR", e.target.value)}
              onNoteChange={(e) => handleChange("PPSR Note", e.target.value)}
            />
            <CostInputRow
              label="Water"
              amountValue={formValues["Water"]}
              noteValue={formValues["Water Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Water", e.target.value)
              }
              onNoteChange={(e) => handleChange("Water Note", e.target.value)}
            />
            <CostInputRow
              label="Rates"
              amountValue={formValues["Rates"]}
              noteValue={formValues["Rates Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Rates", e.target.value)
              }
              onNoteChange={(e) => handleChange("Rates Note", e.target.value)}
            />
          </>
        )}

        {/* VKL specific fields */}
        {company === "vkl" && currentModule !== "commercial" && (
          <>
            <CostInputRow
              label="VOI/CAF"
              amountValue={formValues["VOI/CAF"]}
              noteValue={formValues["VOI/CAF Note"]}
              onAmountChange={(e) =>
                handleNumberChange("VOI/CAF", e.target.value)
              }
              onNoteChange={(e) => handleChange("VOI/CAF Note", e.target.value)}
            />
            <CostInputRow
              label="Title"
              amountValue={formValues["Title"]}
              noteValue={formValues["Title Note"]}
              onAmountChange={(e) =>
                handleNumberChange("Title", e.target.value)
              }
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
              onAmountChange={(e) =>
                handleNumberChange("Land Tax", e.target.value)
              }
              onNoteChange={(e) =>
                handleChange("Land Tax Note", e.target.value)
              }
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
          </>
        )}

        {/* Common fee fields */}
        <CostInputRow
          label={
            currentModule === "commercial"
              ? "Fee 1"
              : company === "vkl"
              ? "Other fee (1)"
              : "Fee 1"
          }
          amountValue={formValues["Other fee (1)"]}
          noteValue={formValues["Note 1"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (1)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 1", e.target.value)}
        />
        <CostInputRow
          label={
            currentModule === "commercial"
              ? "Fee 2"
              : company === "vkl"
              ? "Other fee (2)"
              : "Fee 2"
          }
          amountValue={formValues["Other fee (2)"]}
          noteValue={formValues["Note 2"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (2)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 2", e.target.value)}
        />
        <CostInputRow
          label={
            currentModule === "commercial"
              ? "Fee 3"
              : company === "vkl"
              ? "Other fee (3)"
              : "Fee 3"
          }
          amountValue={formValues["Other fee (3)"]}
          noteValue={formValues["Note 3"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (3)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 3", e.target.value)}
        />
        <CostInputRow
          label={
            currentModule === "commercial"
              ? "Fee 4"
              : company === "vkl"
              ? "Other fee (4)"
              : "Fee 4"
          }
          amountValue={formValues["Other fee (4)"]}
          noteValue={formValues["Note 4"]}
          onAmountChange={(e) =>
            handleNumberChange("Other fee (4)", e.target.value)
          }
          onNoteChange={(e) => handleChange("Note 4", e.target.value)}
        />

        <hr className="my-4" />

        {/* Total fields */}
        <CostInputRow
          label={
            currentModule === "commercial"
              ? "Total Fees"
              : company === "vkl"
              ? "Other (total)"
              : "Total Fees"
          }
          amountValue={formValues["Other (total)"]}
          noteValue={formValues["Other (total) Note"]}
          onNoteChange={(e) =>
            handleChange("Other (total) Note", e.target.value)
          }
          isReadOnly={true}
        />
        {(currentModule === "commercial" || company === "vkl") && (
          <CostInputRow
            label="Total Costs"
            amountValue={formValues["Total Costs"]}
            noteValue={formValues["Total Costs Note"]}
            onNoteChange={(e) =>
              handleChange("Total Costs Note", e.target.value)
            }
            isReadOnly={true}
          />
        )}
        <CostInputRow
          label="Quote Amount"
          amountValue={formValues["Quote Amount"]}
          noteValue={formValues["Quote Amount Note"]}
          onAmountChange={(e) =>
            handleNumberChange("Quote Amount", e.target.value)
          }
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
          disabled={isSaving || !isChanged()}
        />
      </div>
    </div>
  );
}
