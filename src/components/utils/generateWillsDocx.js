import { Document, Packer, Paragraph, TextRun, AlignmentType, Footer, Header, PageNumber, NumberFormat, BorderStyle, Table, TableRow, TableCell, WidthType, HeightRule, VerticalAlign } from "docx";
import { saveAs } from "file-saver";

const FONTS = {
  body: "Times New Roman",
  title: "Times New Roman"
};

const SIZES = {
  title: 36, // 18pt
  heading: 24, // 12pt
  body: 24, // 12pt (Standard legal size)
  small: 20, // 10pt
  tiny: 16, // 8pt
};

const getRelationText = (rel, placeholder = "") => {
  if (!rel) return placeholder;
  if (typeof rel === 'string') return rel;
  const val = rel.category === "Other" ? rel.customValue : rel.category;
  return val || placeholder;
};

const toRoman = (n) => {
  const romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return romans[n - 1] || n.toString();
};

export const generateWillsDocx = async (formData, fileName = "Will.docx") => {
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
    styles: {
      default: {
        document: {
          run: { font: FONTS.body, size: SIZES.body },
          paragraph: { spacing: { line: 360, before: 120, after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                    font: FONTS.body,
                    size: SIZES.small,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // --- PAGE 1: TITLE PAGE ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 4500 },
            children: [new TextRun({ text: "WILL", bold: true, size: SIZES.title, font: FONTS.title })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "OF", bold: true, size: SIZES.title, font: FONTS.title })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000", space: 1 } },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: (personal.fullName || "INPUT FIELD 1").toUpperCase(),
                bold: true,
                size: SIZES.title,
                font: FONTS.title,
              }),
            ],
          }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 4500, after: 120 },
            children: [new TextRun({ text: "VK Lawyers Pty Ltd", bold: true, size: SIZES.heading, font: FONTS.title })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: "PO Box 4001, Narre Warren South VIC 3805", size: SIZES.small, font: FONTS.body })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: "Phone: (03) 5996 0691", size: SIZES.small, font: FONTS.body })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: "Email: communication@vklawyers.com.au", size: SIZES.small, font: FONTS.body })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `Ref: ${matterReferenceNumber}`, size: SIZES.small, font: FONTS.body })],
          }),

          // --- PAGE 2: CONTENT ---
          new Paragraph({ children: [new TextRun({ text: "", pageBreakBefore: true })] }),

          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({ text: "THIS IS THE LAST WILL AND TESTAMENT", bold: true, font: FONTS.body }),
              new TextRun({ text: " of me ", font: FONTS.body }),
              new TextRun({ text: personal.fullName || "[INPUT FIELD 1]", bold: true, font: FONTS.body }),
              new TextRun({ text: ", of ", font: FONTS.body }),
              new TextRun({ text: personal.address || "[INPUT FIELD 5]", bold: true, font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 400 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "1.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "I HEREBY REVOKE", bold: true, font: FONTS.body }),
              new TextRun({ text: " all former Wills and Testament previously made by me and declare this to be my last Will and Testament.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "2.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "IN THIS WILL", bold: true, font: FONTS.body }),
              new TextRun({ text: " the word ‘", font: FONTS.body }),
              new TextRun({ text: "children", italic: true, font: FONTS.body }),
              new TextRun({ text: "’ includes child and the word ‘", font: FONTS.body }),
              new TextRun({ text: "spouse", italic: true, font: FONTS.body }),
              new TextRun({ text: "’ includes a partner as determined by either marriage or a de facto relationship.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "3.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "WHERE ANY GIFT HEREIN", bold: true, font: FONTS.body }),
              new TextRun({ text: " is made to a person who does not survive me for a period of ", font: FONTS.body }),
              new TextRun({ text: "thirty (30) days", bold: true, font: FONTS.body }),
              new TextRun({ text: " the gift is to be treated as though the person died before me.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "4.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "IN THIS WILL", bold: true, font: FONTS.body }),
              new TextRun({ text: " any gift which depends upon the beneficiary surviving me by ", font: FONTS.body }),
              new TextRun({ text: "thirty (30) days or attaining an age specified", bold: true, font: FONTS.body }),
              new TextRun({ text: " in this Will does not vest unless the beneficiary survives me or attains the age specified. Income accumulated after my death and prior to the gift vesting comprises part of that gift.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "5.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "I APPOINT", bold: true, font: FONTS.body }),
              new TextRun({ text: " as my executor and trustee my ", font: FONTS.body }),
              new TextRun({ text: getRelationText(executors[0]?.relation), bold: true, font: FONTS.body }),
              new TextRun({ text: " ", font: FONTS.body }),
              new TextRun({ text: executors[0]?.name || "[INPUT FIELD 7]", bold: true, font: FONTS.body }),
              ...(executors.length > 1 ? [
                new TextRun({ text: " unless unable or unwilling to act or continue to act in which event ", font: FONTS.body }),
                new TextRun({ text: "I APPOINT", bold: true, font: FONTS.body }),
                new TextRun({ text: " my ", font: FONTS.body }),
                new TextRun({ text: getRelationText(executors[1]?.relation), bold: true, font: FONTS.body }),
                new TextRun({ text: " ", font: FONTS.body }),
                new TextRun({ text: executors[1]?.name || "[INPUT FIELD 11]", bold: true, font: FONTS.body }),
                new TextRun({ text: " of ", font: FONTS.body }),
                new TextRun({ text: executors[1]?.address || "[INPUT FIELD 13]", bold: true, font: FONTS.body }),
              ] : []),
              new TextRun({ text: " AND I DECLARE", bold: true, font: FONTS.body }),
              new TextRun({ text: " that the expression ‘my trustees’ when hereinafter used and where the context permits shall mean and include the executor or executors and trustee or trustees for the time being of my will whether original, surviving, substituted or additionally appointed, and I direct that providing one trustee remains other trustees may retire without being replaced.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "6.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "Gifts to my trustees are not dependent on them acting as executors or trustees, and they may apply to the court for commission.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "7.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "All digital rights, accounts, assets, and device content which is not otherwise ", font: FONTS.body }),
              new TextRun({ text: "personal property", italic: true, font: FONTS.body }),
              new TextRun({ text: " or the subject of a specific bequest, shall form part of the residue of my estate and my executor is empowered to deal with these assets.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "8.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "My executors and trustees hold my estate:", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            indent: { left: 1440, hanging: 720 },
            children: [
              new TextRun({ text: "(a)\tTo sell, call in or convert into money any part of my estate and pay any and all death, estate or succession duties, debts, funeral and testamentary expenses and any other costs, fees or expenses associated with my death or the administration of my estate;", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            indent: { left: 1440, hanging: 720 },
            children: [
              new TextRun({ text: "(b)\tTo give to my ", font: FONTS.body }),
              new TextRun({ text: getRelationText(executors[0]?.relation, "[INPUT FIELD 8]"), bold: true, font: FONTS.body }),
              new TextRun({ text: " ", font: FONTS.body }),
              new TextRun({ text: executors[0]?.name || "[INPUT FIELD 7]", bold: true, font: FONTS.body }),
              new TextRun({ text: " all my properties listed below:", font: FONTS.body }),
            ],
          }),
          ...[
            ...properties.joint.map((p) => ({
              text: `${p.address || "[INPUT FIELD 23(a)(i)]"}, ${p.volumeFolio || "[INPUT FIELD 23(a)(ii)]"}`
            })),
            ...bankAccounts.joint.map((acc) => ({
              text: `monies held in ${acc.bankName || "[INPUT FIELD 30(b)(i)]"}, with account ending in ${acc.last4 || "[INPUT FIELD 30(b)(ii)]"}`
            }))
          ].map((item, i) => new Paragraph({
            indent: { left: 2160, hanging: 720 },
            children: [new TextRun({ text: `(${toRoman(i + 1)})\t${item.text}`, bold: true, font: FONTS.body })]
          })),
          new Paragraph({
            indent: { left: 2160 },
            children: [new TextRun({ text: "provided they survive me, and if not, this gift shall form part of the rest and residue of my estate;", font: FONTS.body })]
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "9.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "To do all things necessary to enable ", font: FONTS.body }),
              new TextRun({ text: other.digitalBeneficiary || "[INPUT FIELD 42]", bold: true, font: FONTS.body }),
              new TextRun({ text: " to have the use and enjoyment of all digital rights, accounts, assets, and device content;", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "10.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "To give the rest and residue of my estate (real and personal) to my spouse; and", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "11.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "In the event that", bold: true, font: FONTS.body }),
              new TextRun({ text: " my spouse does not survive me, then to hold the rest and residue of my estate (real and personal) on trust:", font: FONTS.body }),
            ],
          }),

          ...beneficiaries.flatMap(ben => {
            const benSoleProps = (properties.sole || []).filter(p => {
              if (p.distributionType === "equal" || p.distributionType === "custom") {
                return (p.allocations || []).some(a => a.beneficiary === ben.name);
              }
              return p.beneficiary === ben.name;
            });
            const benSingleBanks = bankAccounts.single.filter(a => {
              if (a.distributionType === "equal" || a.distributionType === "custom") {
                return (a.allocations || []).some(alloc => alloc.beneficiary === ben.name);
              }
              return a.beneficiary === ben.name;
            });
            
            if (benSoleProps.length === 0 && benSingleBanks.length === 0) return [];
 
            return [
              // Sub-clause a: Properties
              ...(benSoleProps.length > 0 ? [
                new Paragraph({
                  indent: { left: 1440, hanging: 720 },
                  children: [
                    new TextRun({ text: "a.\t", bold: true, font: FONTS.body }),
                    new TextRun({ text: "To give to my ", font: FONTS.body }),
                    new TextRun({ text: getRelationText(ben.relation), bold: true, font: FONTS.body }),
                    new TextRun({ text: " ", font: FONTS.body }),
                    new TextRun({ text: ben.name, bold: true, font: FONTS.body }),
                    new TextRun({ text: " my following Properties transferred as a sole proprietor provided she/he survives me and if not this gift shall form part of the rest and residue of my estate;", font: FONTS.body }),
                  ]
                }),
                ...benSoleProps.map((p, i) => {
                  const alloc = (p.allocations || []).find(a => a.beneficiary === ben.name);
                  const ratioSuffix = p.distributionType === "custom" && alloc?.ratio ? ` (with a ${alloc.ratio}% share)` : p.distributionType === "equal" ? " (shared equally)" : "";
                  return new Paragraph({
                    indent: { left: 2160, hanging: 720 },
                    children: [new TextRun({ text: `(${toRoman(i + 1)})\t${p.address}, ${p.volumeFolio}${ratioSuffix}`, bold: true, font: FONTS.body })]
                  });
                }),
              ] : []),

              // Sub-clause b: Bank Accounts
              ...(benSingleBanks.length > 0 ? [
                new Paragraph({
                  indent: { left: 1440, hanging: 720 },
                  spacing: { before: 200 },
                  children: [
                    new TextRun({ text: "b.\t", bold: true, font: FONTS.body }),
                    new TextRun({ text: "To give to my ", font: FONTS.body }),
                    new TextRun({ text: getRelationText(ben.relation), bold: true, font: FONTS.body }),
                    new TextRun({ text: " ", font: FONTS.body }),
                    new TextRun({ text: ben.name, bold: true, font: FONTS.body }),
                    new TextRun({ text: " my share of the monies held in:", font: FONTS.body }),
                  ]
                }),
                ...benSingleBanks.map((acc, i) => {
                  const alloc = (acc.allocations || []).find(a => a.beneficiary === ben.name);
                  const ratioSuffix = acc.distributionType === "custom" && alloc?.ratio ? ` (with a ${alloc.ratio}% share)` : acc.distributionType === "equal" ? " (shared equally)" : "";
                  return new Paragraph({
                    indent: { left: 2160, hanging: 720 },
                    children: [new TextRun({ text: `(${toRoman(i + 1)})\t${acc.bankName}, with account ending in ${acc.last4}${ratioSuffix}`, bold: true, font: FONTS.body })]
                  });
                }),
                new Paragraph({
                  indent: { left: 2160, hanging: 720 },
                  children: [new TextRun({ text: `(${toRoman(benSingleBanks.length + 1)})\tAll contents from the safe deposit (if any)`, bold: true, font: FONTS.body })]
                }),
                new Paragraph({ 
                  indent: { left: 1440 }, 
                  children: [new TextRun({ text: "provided she/he survives me and if not, this gift shall form part of the rest and residue of my estate;", font: FONTS.body })] 
                }),
              ] : []),
            ];
          }),

          // Clause 12: Assets (Standalone)
          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "12.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "My executors and trustees hold my estate:", font: FONTS.body }),
            ],
          }),

          ...beneficiaries.flatMap(ben => {
            const benJointAssets = personalAssets.joint.filter(a => {
              if (a.distributionType === "equal" || a.distributionType === "custom") {
                return (a.allocations || []).some(alloc => alloc.beneficiary === ben.name);
              }
              return a.beneficiary === ben.name;
            });
            const benSoleAssets = personalAssets.sole.filter(a => {
              if (a.distributionType === "equal" || a.distributionType === "custom") {
                return (a.allocations || []).some(alloc => alloc.beneficiary === ben.name);
              }
              return a.beneficiary === ben.name;
            });
            if (benJointAssets.length === 0 && benSoleAssets.length === 0) return [];

            const allAssets = [...benJointAssets, ...benSoleAssets];

            return [
              new Paragraph({
                indent: { left: 1440, hanging: 720 },
                children: [
                  new TextRun({ text: "To give to my ", font: FONTS.body }),
                  new TextRun({ text: getRelationText(ben.relation), bold: true, font: FONTS.body }),
                  new TextRun({ text: " ", font: FONTS.body }),
                  new TextRun({ text: ben.name, bold: true, font: FONTS.body }),
                  new TextRun({ text: " my share in the proceeds of sale of the below items provided she/he survives me and if not, this gift shall form part of the rest and residue of my estate;", font: FONTS.body }),
                ]
              }),
              ...allAssets.map((a, i) => {
                const alloc = (a.allocations || []).find(alloc => alloc.beneficiary === ben.name);
                const ratioSuffix = a.distributionType === "custom" && alloc?.ratio ? ` (with a ${alloc.ratio}% share)` : a.distributionType === "equal" ? " (shared equally)" : "";
                return new Paragraph({
                  indent: { left: 2160, hanging: 720 },
                  children: [
                    new TextRun({ text: `${String.fromCharCode(97 + i)}.\t`, bold: true, font: FONTS.body }),
                    new TextRun({ text: `${a.type}${a.description ? `: ${a.description}` : ""}${ratioSuffix}`, bold: i === 0, font: FONTS.body })
                  ]
                });
              }),
              new Paragraph({ indent: { left: 2160, hanging: 720 }, children: [new TextRun({ text: `${String.fromCharCode(97 + allAssets.length)}.\t`, bold: true, font: FONTS.body }), new TextRun({ text: "Any motor vehicle registered under my name;", font: FONTS.body })] }),
              new Paragraph({ indent: { left: 2160, hanging: 720 }, children: [new TextRun({ text: `${String.fromCharCode(97 + allAssets.length + 1)}.\t`, bold: true, font: FONTS.body }), new TextRun({ text: `Home furnishings and personal chattels situated at the personal place of residence property known as ${personal.address};`, font: FONTS.body })] }),
              new Paragraph({ indent: { left: 2160, hanging: 720 }, children: [new TextRun({ text: `${String.fromCharCode(97 + allAssets.length + 2)}.\t`, bold: true, font: FONTS.body }), new TextRun({ text: "All collectables, jewellery, watches, book collections and articles of personal adornment owned by me at my death; and", font: FONTS.body })] }),
              new Paragraph({ indent: { left: 2160, hanging: 720 }, children: [new TextRun({ text: `${String.fromCharCode(97 + allAssets.length + 3)}.\t`, bold: true, font: FONTS.body }), new TextRun({ text: "Any art work in my possession.", font: FONTS.body })] }),
            ];
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "13.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "To divide the rest and residue of my estate equally among those of my children who survive me, provided always that should any of my children not survive me to take under this my will, leaving children who survive me and attain the age of 18 years then such children shall take by substitution and if more than one equally the share in my estate which their parent would otherwise have taken;", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "14.\t", bold: true, font: FONTS.body }),
              new TextRun({ text: "In the event that my spouse does not survive me and the above clause applies, and if there are gifts of money in that clause which mirror my spouse’s will, and if my spouse and I die within 30 days of each other, in order to prevent the gift being made twice then it shall be for one half of the said sum.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "15.\tIf the other parent of any of my children has not survived me then I APPOINT my ", font: FONTS.body }),
              new TextRun({ text: guardian.isExecutor ? getRelationText(executors[0]?.relation) : getRelationText(guardian.relation), bold: true, font: FONTS.body }),
              new TextRun({ text: " ", font: FONTS.body }),
              new TextRun({ text: guardian.isExecutor ? executors[0]?.name : guardian.name, bold: true, font: FONTS.body }),
              new TextRun({ text: " unless unable or unwilling to act or continue to act in which event ", font: FONTS.body }),
              new TextRun({ text: "I APPOINT", bold: true, font: FONTS.body }),
              new TextRun({ text: " my ", font: FONTS.body }),
              new TextRun({ text: getRelationText(executors[1]?.relation) || "executor", bold: true, font: FONTS.body }),
              new TextRun({ text: " ", font: FONTS.body }),
              new TextRun({ text: executors[1]?.name || "[SECOND EXECUTOR]", bold: true, font: FONTS.body }),
              new TextRun({ text: " as guardian of my minor children.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [
              new TextRun({ text: "16.\tI DIRECT", bold: true, font: FONTS.body }),
              new TextRun({ text: " my executor to arrange for ", font: FONTS.body }),
              new TextRun({ text: funeral.details || "[funeral details]", bold: true, font: FONTS.body }),
              new TextRun({ text: " . OR ", font: FONTS.body }),
              new TextRun({ text: "I WISH", bold: true, font: FONTS.body }),
              new TextRun({ text: " to be cremated and my funeral arrangements be carried out according to the wishes of my surviving family.", font: FONTS.body }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720, hanging: 720 },
            children: [new TextRun({ text: "17.\tMy trustees may in their discretion:", font: FONTS.body })],
          }),

          ...[
            "Exercise any powers given to them by law and have all the powers, authorities and discretions of a natural person, including but not limited to the power to invest and change investments freely as if they were beneficially entitled to them;",
            "Apply for the maintenance, education, including travel to broaden the mind, advancement or benefit of a beneficiary the whole or any part of the capital and income of that part of my estate to which the beneficiary is entitled or may in future be entitled;",
            "Make a payment or payments to a minor beneficiary’s parent or guardian or a person with whom the minor beneficiary resides and accept the receipt of that payee as an absolute discharge;",
            "Make loans to beneficiaries on whatever terms;",
            "Acquire or lease property for occupation, use or enjoyment by a beneficiary, whether alone or with some other person or persons;",
            "Sell, lease, exchange, transfer to a beneficiary or otherwise dispose of property in my estate in the terms they consider expedient as though they were absolute beneficial owners;",
            "Without the consent of any beneficiary, appropriate any assets of my estate at their value in or towards the satisfaction of a legacy or a share of any person in my estate;",
            "Do all such acts and things in relation to the affairs of any company in which my estate is or may become interested or concerned;",
            "Borrow money, either with or without giving security, and enter into any mortgage, charge, security agreement, lien or security over any part of my estate;",
            "Maintain, repair, improve, develop, alter, renovate, pull down, erect or re-erect any part of my estate;",
            "Maintain, take out or participate in any policy of insurance or superannuation scheme;",
            "For any reason, for instance to allow an early distribution of residue, set aside out of my estate a fund sufficient to meet all debts, charges, taxes and other liabilities of my estate;",
            "Carry on, either alone or in partnership with any person or persons the whole or part of any business in which I am engaged or interested at my death until such time as administration of my estate is finalised, and in this respect I direct my trustees to apply for a grant of letters of administration in order to get in the goods, pending a grant of probate, if necessary;",
            "Enter into a formal trust deed in order to provide for any trusts created by this my will, including the power to appoint any additional trustees and any costs, fees, duties or other expenses consequent upon the establishment of such trust deed shall be borne by my estate; and",
            "Hold all or part of any superannuation death benefits paid to my estate in a separate superannuation proceeds trust upon and subject to the rights and powers herein created for any of the beneficiaries under this my will who qualify as death benefit dependants pursuant to the Income Tax Assessment Act 1997 in such proportions as my executors may determine provided that my estate is divided between all the beneficiaries of my estate in the proportions that accord with my wishes expressed herein."
          ].map((power, idx) => new Paragraph({
            indent: { left: 1440, hanging: 720 },
            children: [
              new TextRun({ text: `(${String.fromCharCode(97 + idx)})\t`, font: FONTS.body }),
              new TextRun({ text: power, font: FONTS.body })
            ]
          })),

          new Paragraph({
            spacing: { before: 800 },
            children: [
              new TextRun({ text: "IN WITNESS ", bold: true, font: FONTS.body }),
              new TextRun({ text: "whereof I have hereunto set my hand to this my last Will and Testament this day of", font: FONTS.body })
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "SIGNED", bold: true, font: FONTS.body }),
                          new TextRun({ text: " by ", font: FONTS.body }),
                          new TextRun({ text: personal.fullName || "[INPUT FIELD 1]", bold: true, font: FONTS.body }),
                          new TextRun({ text: " as her/his last Will and Testament in the presence of us both present at the same time who at her/his request and in her/his presence and in the presence of each other have hereunto subscribed our names as witnesses:", font: FONTS.body }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 5, type: WidthType.PERCENTAGE },
                    borders: {
                      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                    },
                    children: [new Paragraph({ children: [new TextRun("")] })],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400, after: 200 }, children: [new TextRun("")] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: personal.fullName || "[INPUT FIELD 1]", bold: true, font: FONTS.body })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            spacing: { before: 400 },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Signature of Witness", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Name", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Address", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Occupation", italic: true, size: SIZES.small, font: FONTS.body })] }),
                    ],
                  }),
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [] }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Signature of Witness", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Name", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Address", italic: true, size: SIZES.small, font: FONTS.body })] }),
                      new Paragraph({ border: { bottom: { style: BorderStyle.DOTTED, size: 8 } }, spacing: { before: 400 }, children: [new TextRun("")] }),
                      new Paragraph({ children: [new TextRun({ text: "Witness Occupation", italic: true, size: SIZES.small, font: FONTS.body })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};
