/**
 * Validation utility for the 10-step Wills form.
 * Maps formData to a list of error messages grouped by step number.
 */

export const validateWillsForm = (formData) => {
  const errors = {};

  // Helper to add error
  const addError = (step, message) => {
    if (!errors[step]) errors[step] = [];
    errors[step].push(message);
  };

  // Step 1: Personal
  if (!formData.personal?.fullName?.trim()) addError(1, "Full name is required");
  if (!formData.email?.trim()) addError(1, "Email address is required");
  if (!formData.personal?.occupation?.trim()) addError(1, "Occupation is required");
  if (!formData.personal?.address?.trim()) addError(1, "Residential address is required");
  if (formData.personal?.existingWill == null) addError(1, "Please specify if you have an existing Will");

  // Step 2: Executor
  const executors = formData.executors || [];
  if (!executors[0]?.name?.trim()) addError(2, "Primary Executor name is required");
  if (!executors[0]?.relation?.category) addError(2, "Relationship with primary Executor is required");
  if (!executors[0]?.address?.trim()) addError(2, "Primary Executor address is required");
  
  if (formData.hasSecondExecutor == null) addError(2, "Please specify if you want to add a second Executor");
  if (formData.hasSecondExecutor === true) {
    if (executors.length < 2) {
      addError(2, "Second Executor details are missing");
    } else {
      if (!executors[1]?.name?.trim()) addError(2, "Second Executor name is required");
      if (!executors[1]?.relation?.category) addError(2, "Relationship with second Executor is required");
      if (!executors[1]?.address?.trim()) addError(2, "Second Executor address is required");
    }
  }

  // Step 3: Beneficiaries
  const beneficiaries = formData.beneficiaries || [];
  if (beneficiaries.length === 0) {
    addError(3, "At least one beneficiary is required");
  } else {
    beneficiaries.forEach((ben, i) => {
      const bName = ben.name?.trim() || `Beneficiary ${i + 1}`;
      if (!ben.name?.trim()) addError(3, `Beneficiary ${i + 1} name is required`);
      if (!ben.age) addError(3, `${bName} age is required`);
      if (!ben.relation?.category) addError(3, `Relationship with ${bName} is required`);
      if (!ben.address?.trim()) addError(3, `${bName} address is required`);
    });
  }

  // Step 4: Real Estate
  if (formData.properties?.hasJoint == null) addError(4, "Please specify if you own joint properties");
  if (formData.properties?.hasJoint === true) {
    if (formData.properties.joint.length === 0) {
      addError(4, "Please add at least one joint property");
    } else {
      formData.properties.joint.forEach((p, i) => {
        if (!p.address?.trim()) addError(4, `Joint Property ${i + 1} address is required`);
        if (!p.volumeFolio?.trim()) addError(4, `Joint Property ${i + 1} Volume/Folio is required`);
        if (!p.beneficiary) addError(4, `Joint Property ${i + 1} beneficiary is required`);
      });
    }
  }

  if (formData.properties?.hasSole == null) addError(4, "Please specify if you own sole properties");
  if (formData.properties?.hasSole === true) {
    if (formData.properties.sole.length === 0) {
      addError(4, "Please add at least one sole property");
    } else {
      formData.properties.sole.forEach((p, i) => {
        if (!p.address?.trim()) addError(4, `Sole Property ${i + 1} address is required`);
        if (!p.volumeFolio?.trim()) addError(4, `Sole Property ${i + 1} Volume/Folio is required`);
        if (!p.beneficiary) addError(4, `Sole Property ${i + 1} beneficiary is required`);
      });
    }
  }

  // Step 5: Banks
  if (formData.bankAccounts?.hasJoint == null) addError(5, "Please specify if you have joint bank accounts");
  if (formData.bankAccounts?.hasJoint === true) {
    if (formData.bankAccounts.joint.length === 0) {
      addError(5, "Please add at least one joint bank account");
    } else {
      formData.bankAccounts.joint.forEach((a, i) => {
        if (!a.bankName?.trim()) addError(5, `Joint Bank ${i + 1} name is required`);
        if (!a.last4?.trim()) addError(5, `Joint Bank ${i + 1} last 4 digits are required`);
        if (!a.beneficiary) addError(5, `Joint Bank ${i + 1} beneficiary is required`);
      });
    }
  }

  if (formData.bankAccounts?.hasSingle == null) addError(5, "Please specify if you have single bank accounts");
  if (formData.bankAccounts?.hasSingle === true) {
    if (formData.bankAccounts.single.length === 0) {
      addError(5, "Please add at least one single bank account");
    } else {
      formData.bankAccounts.single.forEach((a, i) => {
        if (!a.bankName?.trim()) addError(5, `Single Bank ${i + 1} name is required`);
        if (!a.last4?.trim()) addError(5, `Single Bank ${i + 1} last 4 digits are required`);
        if (!a.beneficiary) addError(5, `Single Bank ${i + 1} beneficiary is required`);
      });
    }
  }

  // Step 6: Guardians
  if (formData.guardian?.hasChoice == null) addError(6, "Please specify if you want to appoint a guardian");
  if (formData.guardian?.hasChoice === true) {
    if (formData.guardian.isExecutor == null) addError(6, "Please specify if the Executor should be the guardian");
    if (formData.guardian.isExecutor === false) {
      if (!formData.guardian.name?.trim()) addError(6, "Guardian name is required");
      if (!formData.guardian.relation?.category) addError(6, "Relationship with guardian is required");
      if (!formData.guardian.address?.trim()) addError(6, "Guardian address is required");
    }
  }

  // Step 7: Funeral
  if (formData.funeral?.hasPlan == null) addError(7, "Please specify your funeral arrangement preference");
  if (!formData.funeral?.details?.trim()) {
     addError(7, formData.funeral?.hasPlan === true ? "Funeral plan details are required" : "Funeral preference is required");
  }

  // Step 8: Personal Assets
  if (formData.personalAssets?.hasJoint == null) addError(8, "Please specify if you own joint personal properties");
  if (formData.personalAssets?.hasJoint === true) {
    if (formData.personalAssets.joint.length === 0) {
      addError(8, "Please add at least one joint personal asset");
    } else {
      formData.personalAssets.joint.forEach((a, i) => {
        if (!a.type?.trim()) addError(8, `Joint Asset ${i + 1} type is required`);
        if (!a.beneficiary) addError(8, `Joint Asset ${i + 1} beneficiary is required`);
      });
    }
  }

  if (formData.personalAssets?.hasSole == null) addError(8, "Please specify if you own sole personal properties");
  if (formData.personalAssets?.hasSole === true) {
    if (formData.personalAssets.sole.length === 0) {
      addError(8, "Please add at least one sole personal asset");
    } else {
      formData.personalAssets.sole.forEach((a, i) => {
        if (!a.type?.trim()) addError(8, `Sole Asset ${i + 1} type is required`);
        if (!a.beneficiary) addError(8, `Sole Asset ${i + 1} beneficiary is required`);
      });
    }
  }

  // Step 9: Disclosures
  if (formData.other?.promisedBenefit == null) addError(9, "Please answer the Promised Benefit question");
  if (formData.other?.legalMatters == null) addError(9, "Please answer the Legal Matters question");
  if (formData.other?.otherNotes == null) addError(9, "Please answer the Other Matters question");
  if (!formData.other?.digitalBeneficiary?.trim()) addError(9, "Digital rights beneficiary is required");

  return errors;
};
