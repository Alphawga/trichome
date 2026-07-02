// Paystack inline.js window type declarations
// Loaded via https://js.paystack.co/v1/inline.js

interface PaystackPopOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  label?: string;
  metadata?: Record<string, unknown>;
  callback: (response: PaystackPopResponse) => void;
  onClose: () => void;
}

interface PaystackPopResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

interface PaystackPopHandler {
  openIframe: () => void;
}

interface PaystackPopStatic {
  setup: (options: PaystackPopOptions) => PaystackPopHandler;
  resumeTransaction: (accessCode: string) => void;
}

interface Window {
  PaystackPop: PaystackPopStatic;
}
