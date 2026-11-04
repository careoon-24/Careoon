import crypto from 'crypto';

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  env: 'UAT' | 'PROD';
  hostUrl: string;
}

export function getPhonePeConfig(): PhonePeConfig {
  const env = (process.env.PHONEPE_ENV || 'UAT').toUpperCase() as 'UAT' | 'PROD';
  const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
  const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
  const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
  
  const hostUrl = env === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  return { merchantId, saltKey, saltIndex, env, hostUrl };
}

/**
 * Generates PhonePe X-VERIFY checksum for API requests:
 * SHA256(base64Payload + apiEndpoint + saltKey) + "###" + saltIndex
 */
export function generateChecksum(payloadBase64: string, endpoint: string, saltKey: string, saltIndex: string): string {
  const dataToHash = payloadBase64 + endpoint + saltKey;
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  return `${hash}###${saltIndex}`;
}

/**
 * Validates PhonePe webhook / callback X-VERIFY header:
 * SHA256(responseBase64 + saltKey) + "###" + saltIndex
 */
export function verifyCallbackChecksum(responseBase64: string, receivedChecksum: string, saltKey: string, saltIndex: string): boolean {
  if (!receivedChecksum) return false;
  const expectedHash = crypto.createHash('sha256').update(responseBase64 + saltKey).digest('hex');
  const expectedChecksum = `${expectedHash}###${saltIndex}`;
  return expectedChecksum.toLowerCase() === receivedChecksum.toLowerCase();
}

/**
 * Initiates a standard Pay Page request with PhonePe
 */
export async function createPhonePePaymentOrder(params: {
  bookingId: string;
  bookingCode: string;
  amountInRupees: number;
  patientUserId: string;
  patientPhone: string;
  appBaseUrl: string;
}): Promise<{ success: boolean; redirectUrl?: string; transactionId: string; error?: string }> {
  const config = getPhonePeConfig();
  const transactionId = `TXN_${params.bookingCode.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  
  // PhonePe requires amount in PAISA (integer)
  const amountInPaisa = Math.round(params.amountInRupees * 100);

  const redirectUrl = `${params.appBaseUrl}/api/payments/phonepe/callback?bookingId=${params.bookingId}&txnId=${transactionId}`;
  const callbackUrl = `${params.appBaseUrl}/api/payments/phonepe/callback?bookingId=${params.bookingId}&txnId=${transactionId}`;

  const payload = {
    merchantId: config.merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: `USER_${params.patientUserId.slice(0, 16)}`,
    amount: amountInPaisa,
    redirectUrl,
    redirectMode: 'POST',
    callbackUrl,
    mobileNumber: (params.patientPhone || '').replace(/\D/g, '').slice(-10),
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const endpoint = '/pg/v1/pay';
  const checksum = generateChecksum(payloadBase64, endpoint, config.saltKey, config.saltIndex);

  try {
    const response = await fetch(`${config.hostUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return {
        success: true,
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId,
      };
    }

    // If sandbox / preprod has temporary network limits, construct safe fallback sandbox URL or report exact PhonePe error
    return {
      success: false,
      transactionId,
      error: data.message || 'PhonePe payment gateway initiation failed',
    };
  } catch (err: any) {
    console.error('PhonePe API Error:', err);
    return {
      success: false,
      transactionId,
      error: err.message || 'Unable to connect to PhonePe servers',
    };
  }
}

/**
 * Checks payment status directly with PhonePe Status API:
 * GET /pg/v1/status/{merchantId}/{merchantTransactionId}
 */
export async function checkPhonePeTransactionStatus(merchantTransactionId: string): Promise<{
  success: boolean;
  status: 'PAYMENT_SUCCESS' | 'PAYMENT_PENDING' | 'PAYMENT_ERROR';
  data?: any;
}> {
  const config = getPhonePeConfig();
  const endpoint = `/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
  
  // SHA256(endpoint + saltKey) + "###" + saltIndex
  const dataToHash = endpoint + config.saltKey;
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  const checksum = `${hash}###${config.saltIndex}`;

  try {
    const res = await fetch(`${config.hostUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': config.merchantId,
      },
    });

    const data = await res.json();
    if (data.code === 'PAYMENT_SUCCESS') {
      return { success: true, status: 'PAYMENT_SUCCESS', data };
    } else if (data.code === 'PAYMENT_PENDING') {
      return { success: false, status: 'PAYMENT_PENDING', data };
    } else {
      return { success: false, status: 'PAYMENT_ERROR', data };
    }
  } catch (err) {
    return { success: false, status: 'PAYMENT_ERROR' };
  }
}
