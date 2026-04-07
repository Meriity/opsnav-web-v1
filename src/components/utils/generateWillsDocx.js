import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const COLORS = {
  primary: "2E3D99",
  secondary: "1D97D7",
  gray: "F8FAFC",
  textGray: "94A3B8",
  border: "E2E8F0"
};

const createSectionHeader = (number, title) => {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: `${number}. ${title}`,
        color: COLORS.primary,
        bold: true,
        size: 28, // 14pt
      }),
    ],
  });
};

const createRow = (label, value) => {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 20, // 10pt
        color: "444444"
      }),
      new TextRun({
        text: value || "Not provided",
        size: 22, // 11pt
      }),
    ],
  });
};

const createSubHeader = (text, color = COLORS.primary) => {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 18,
        color: color,
        characterSpacing: 20,
      }),
    ],
  });
};

const getRelationText = (rel) => {
  if (!rel) return "";
  return rel.category === "Other" ? rel.customValue : rel.category;
};

export const generateWillsDocx = async (formData, fileName = "Will_Summary.docx") => {
  const {
    personal = {},
    executors = [],
    beneficiaries = [],
    properties = { joint: [], sole: [] },
    bankAccounts = { joint: [], single: [] },
    guardian = { relation: {} },
    funeral = {},
    personalAssets = { joint: [], sole: [] },
    other = {},
    matterReferenceNumber = "N/A"
  } = formData;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Last Will and Testament Information Summary",
                bold: true,
                size: 36,
                color: COLORS.primary,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `Reference Number: ${matterReferenceNumber}`,
                size: 24,
                color: COLORS.secondary,
              }),
            ],
          }),

          // 1. Personal Details
          createSectionHeader(1, "Personal Details"),
          createRow("Full Name", personal.fullName),
          createRow("Occupation", personal.occupation),
          createRow("Phone Number", personal.phone),
          createRow("Current Address", personal.address),
          createRow("Existing Will?", personal.existingWill ? "Yes" : "No"),

          // 2. Executors
          createSectionHeader(2, "Executors details"),
          ...executors.flatMap((ex, i) => [
            createSubHeader(`Executor ${i + 1}`),
            createRow("Full Name", ex.name),
            createRow("Relationship", getRelationText(ex.relation)),
            createRow("Address", ex.address),
          ]),

          // 3. Beneficiaries
          createSectionHeader(3, "Beneficiaries details"),
          ...beneficiaries.flatMap((ben, i) => [
            createSubHeader(`Beneficiary ${i + 1}`),
            createRow("Full Name", ben.name),
            createRow("Age", ben.age),
            createRow("Relationship", getRelationText(ben.relation)),
            createRow("Address", ben.address),
          ]),

          // 4. Real Estate
          createSectionHeader(4, "Real Estate"),
          ...(properties.joint.length > 0 ? [
            createSubHeader("Joint Ownership Properties", "B45309"), // Amber-600
            ...properties.joint.flatMap(p => [
              createRow("Address", p.address),
              createRow("Volume/Folio", p.volumeFolio),
              createRow("Gift To", p.beneficiary),
              createRow("Ratio", p.ratio),
            ])
          ] : []),
          ...(properties.sole.length > 0 ? [
            createSubHeader("Sole Ownership Properties", "059669"), // Emerald-600
            ...properties.sole.flatMap(p => [
              createRow("Address", p.address),
              createRow("Volume/Folio", p.volumeFolio),
              createRow("Gift To", p.beneficiary),
              createRow("Ratio", p.ratio),
            ])
          ] : []),

          // 5. Bank Accounts
          createSectionHeader(5, "Bank Accounts"),
          ...(bankAccounts.joint.length > 0 ? [
            createSubHeader("Joint Accounts", "B45309"),
            ...bankAccounts.joint.flatMap(acc => [
              createRow("Bank Name", acc.bankName),
              createRow("Account (Last 4)", acc.last4),
              createRow("Gift To", acc.beneficiary),
              createRow("Ratio", acc.ratio),
            ])
          ] : []),
          ...(bankAccounts.single.length > 0 ? [
            createSubHeader("Single Accounts", "059669"),
            ...bankAccounts.single.flatMap(acc => [
              createRow("Bank Name", acc.bankName),
              createRow("Account (Last 4)", acc.last4),
              createRow("Gift To", acc.beneficiary),
              createRow("Ratio", acc.ratio),
            ])
          ] : []),

          // 6. Guardian
          createSectionHeader(6, "Guardian for Minors"),
          createRow("Is Executor Guardian?", guardian.isExecutor ? "Yes" : "No"),
          ...(!guardian.isExecutor ? [
            createRow("Guardian Name", guardian.name),
            createRow("Relationship", getRelationText(guardian.relation)),
            createRow("Address", guardian.address),
          ] : []),

          // 7. Funeral
          createSectionHeader(7, "Funeral Arrangements"),
          createRow("Have a funeral plan?", funeral.hasPlan ? "Yes" : "No"),
          createRow("Funeral Type", funeral.type),
          createRow("Special Details", funeral.details),

          // 8. Personal Properties
          createSectionHeader(8, "Personal properties"),
          ...(personalAssets.joint.length > 0 ? [
            createSubHeader("Joint Personal Properties", "B45309"),
            ...personalAssets.joint.flatMap(a => [
              createRow("Asset Type", a.type),
              createRow("Description", a.description),
              createRow("Gift To", a.beneficiary),
            ])
          ] : []),
          ...(personalAssets.sole.length > 0 ? [
            createSubHeader("Sole Personal Properties", "059669"),
            ...personalAssets.sole.flatMap(a => [
              createRow("Asset Type", a.type),
              createRow("Description", a.description),
              createRow("Gift To", a.beneficiary),
            ])
          ] : []),

          // 9. Other Information
          createSectionHeader(9, "Other information"),
          createRow("Promised Benefit?", other.promisedBenefit ? "Yes" : "No"),
          createRow("Digital Rights Beneficiary", other.digitalBeneficiary),
          createRow("Other Wishes", other.otherWishes),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};
