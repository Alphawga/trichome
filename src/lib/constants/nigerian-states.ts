/**
 * Nigerian States Constant
 *
 * All 36 states + FCT for use in address/shipping forms. `value` matches the
 * short-name keys already used by STATE_SHIPPING_COSTS/DELIVERY_DAYS in
 * src/lib/shipping/calculate-shipping.ts (e.g. FCT uses "Abuja", not "FCT").
 */

export interface NigerianState {
  value: string;
  label: string;
}

export const NIGERIAN_STATES: NigerianState[] = [
  { value: "Abia", label: "Abia" },
  { value: "Adamawa", label: "Adamawa" },
  { value: "Akwa Ibom", label: "Akwa Ibom" },
  { value: "Anambra", label: "Anambra" },
  { value: "Abuja", label: "Abuja (FCT)" },
  { value: "Bauchi", label: "Bauchi" },
  { value: "Bayelsa", label: "Bayelsa" },
  { value: "Benue", label: "Benue" },
  { value: "Borno", label: "Borno" },
  { value: "Cross River", label: "Cross River" },
  { value: "Delta", label: "Delta" },
  { value: "Ebonyi", label: "Ebonyi" },
  { value: "Edo", label: "Edo" },
  { value: "Ekiti", label: "Ekiti" },
  { value: "Enugu", label: "Enugu" },
  { value: "Gombe", label: "Gombe" },
  { value: "Imo", label: "Imo" },
  { value: "Jigawa", label: "Jigawa" },
  { value: "Kaduna", label: "Kaduna" },
  { value: "Kano", label: "Kano" },
  { value: "Katsina", label: "Katsina" },
  { value: "Kebbi", label: "Kebbi" },
  { value: "Kogi", label: "Kogi" },
  { value: "Kwara", label: "Kwara" },
  { value: "Lagos", label: "Lagos" },
  { value: "Nasarawa", label: "Nasarawa" },
  { value: "Niger", label: "Niger" },
  { value: "Ogun", label: "Ogun" },
  { value: "Ondo", label: "Ondo" },
  { value: "Osun", label: "Osun" },
  { value: "Oyo", label: "Oyo" },
  { value: "Plateau", label: "Plateau" },
  { value: "Rivers", label: "Rivers" },
  { value: "Sokoto", label: "Sokoto" },
  { value: "Taraba", label: "Taraba" },
  { value: "Yobe", label: "Yobe" },
  { value: "Zamfara", label: "Zamfara" },
].sort((a, b) => a.label.localeCompare(b.label));
