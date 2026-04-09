import { DocumentCategory } from "@prisma/client";

export const CLIENT_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  DocumentCategory.W2,
  DocumentCategory.W2G,
  DocumentCategory.FORM_1099_INT,
  DocumentCategory.FORM_1099_DIV,
  DocumentCategory.FORM_1099_B,
  DocumentCategory.FORM_1099_R,
  DocumentCategory.FORM_1099_MISC,
  DocumentCategory.FORM_1099_NEC,
  DocumentCategory.FORM_1099_G,
  DocumentCategory.FORM_1098,
  DocumentCategory.FORM_1095,
  DocumentCategory.K1,
  DocumentCategory.BROKERAGE_STATEMENT,
  DocumentCategory.BANK_STATEMENT,
  DocumentCategory.CRYPTO_STATEMENT,
  DocumentCategory.RETIREMENT_STATEMENT,
  DocumentCategory.PRIOR_YEAR_RETURN,
  DocumentCategory.ESTIMATED_TAX_PAYMENT,
  DocumentCategory.ID_DOCUMENT,
  DocumentCategory.IRS_NOTICE,
  DocumentCategory.OTHER,
];

export const ADMIN_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  DocumentCategory.COMPLETED_RETURN,
  DocumentCategory.OTHER,
];

export const FINISHED_RETURN_TYPES = [
  "State signature page",
  "Completed federal return",
  "Completed state return",
  "Federal filing instructions",
  "State filing instructions",
  "Federal e-file authorization (Form 8879)",
  "State e-file authorization",
  "Federal extension (Form 4868)",
  "State extension",
  "Estimated tax vouchers",
  "Payment voucher",
  "Amended return (Form 1040-X)",
] as const;

export const FINISHED_RETURN_TYPES_REQUIRING_STATE = new Set<string>([
  "State signature page",
  "Completed state return",
  "State filing instructions",
  "State e-file authorization",
  "State extension",
]);

export const US_STATE_OPTIONS = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

export const US_STATE_CODES: ReadonlySet<string> = new Set(US_STATE_OPTIONS.map((state) => state.code));

export function isUSStateCode(value: string): boolean {
  return US_STATE_CODES.has(value);
}

export function isFinishedReturnType(value: string): boolean {
  return FINISHED_RETURN_TYPES.some((option) => option === value);
}

export function doesReturnTypeRequireState(value: string): boolean {
  return FINISHED_RETURN_TYPES_REQUIRING_STATE.has(value);
}

export function getDocumentCategoryLabel(category: DocumentCategory): string {
  switch (category) {
    case DocumentCategory.W2:
      return "W-2 (Wages and Salary)";
    case DocumentCategory.W2G:
      return "W-2G (Gambling Winnings)";
    case DocumentCategory.FORM_1099_INT:
      return "1099-INT (Interest Income)";
    case DocumentCategory.FORM_1099_DIV:
      return "1099-DIV (Dividend Income)";
    case DocumentCategory.FORM_1099_B:
      return "1099-B (Brokerage Sales)";
    case DocumentCategory.FORM_1099_R:
      return "1099-R (Retirement Distributions)";
    case DocumentCategory.FORM_1099_MISC:
      return "1099-MISC (Miscellaneous Income)";
    case DocumentCategory.FORM_1099_NEC:
      return "1099-NEC (Contractor / Nonemployee Income)";
    case DocumentCategory.FORM_1099_G:
      return "1099-G (State Tax Refund / Unemployment)";
    case DocumentCategory.FORM_1098:
      return "1098 (Mortgage Interest Statement)";
    case DocumentCategory.FORM_1095:
      return "1095 (Health Insurance Coverage)";
    case DocumentCategory.K1:
      return "K-1 (Partnership / S Corp / Trust Income)";
    case DocumentCategory.BROKERAGE_STATEMENT:
      return "Brokerage Statement (Investment Account Statement)";
    case DocumentCategory.BANK_STATEMENT:
      return "Bank Statement (Bank Account Statement)";
    case DocumentCategory.CRYPTO_STATEMENT:
      return "Crypto Statement (Crypto Transactions)";
    case DocumentCategory.RETIREMENT_STATEMENT:
      return "Retirement Statement (IRA / 401(k) Statement)";
    case DocumentCategory.PRIOR_YEAR_RETURN:
      return "Prior Year Return (Last Year's Tax Return)";
    case DocumentCategory.ESTIMATED_TAX_PAYMENT:
      return "Estimated Tax Payment (Quarterly Tax Payment Record)";
    case DocumentCategory.ID_DOCUMENT:
      return "ID Document (Driver's License / Passport)";
    case DocumentCategory.IRS_NOTICE:
      return "IRS Notice (Letter from the IRS)";
    case DocumentCategory.COMPLETED_RETURN:
      return "Completed Return (Final Tax Return)";
    case DocumentCategory.OTHER:
      return "Other (Anything Else)";
    default:
      return category;
  }
}

export function getTaxYearChoices(): number[] {
  const defaultTaxYear = getDefaultTaxYear();
  return [defaultTaxYear + 1, defaultTaxYear, defaultTaxYear - 1, defaultTaxYear - 2];
}

export function getDefaultTaxYear(date = new Date()): number {
  const month = date.getMonth();
  const year = date.getFullYear();

  return month <= 5 ? year - 1 : year;
}
