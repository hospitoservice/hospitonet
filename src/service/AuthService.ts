const OTP_BASE = '/otp';

async function parseJSON(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    throw new Error(
      res.ok
        ? 'Unexpected server response. Please try again.'
        : `Server error (${res.status}). Please try again.`
    );
  }
}

export const sendOTP = async (phone: string): Promise<void> => {
  let res: Response;
  try {
    res = await fetch(`${OTP_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'LOGIN' }),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  const data = await parseJSON(res);
  if (!data.success) throw new Error(data.message);
};

export const verifyOTP = async (phone: string, otp: string): Promise<void> => {
  let res: Response;
  try {
    res = await fetch(`${OTP_BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  const data = await parseJSON(res);
  if (!data.success) throw new Error(data.message);
};

export const resendOTP = async (phone: string): Promise<void> => {
  let res: Response;
  try {
    res = await fetch(`${OTP_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'LOGIN' }),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  const data = await parseJSON(res);
  if (!data.success) throw new Error(data.message);
};