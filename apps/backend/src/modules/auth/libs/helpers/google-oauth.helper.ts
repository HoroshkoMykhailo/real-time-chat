type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
};

const exchangeGoogleAuthorizationCode = async (parameters: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string }> => {
  const body = new URLSearchParams({
    client_id: parameters.clientId,
    client_secret: parameters.clientSecret,
    code: parameters.code,
    grant_type: 'authorization_code',
    redirect_uri: parameters.redirectUri
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`Google token endpoint failed: ${String(response.status)}`);
  }

  const data = (await response.json()) as GoogleTokenResponse;

  if (!data.access_token) {
    throw new Error('Google token response missing access_token');
  }

  return { accessToken: data.access_token };
};

type GoogleUserInfo = {
  email: string;
  email_verified: boolean;
  name?: string;
  sub: string;
};

const fetchGoogleUserProfile = async (
  accessToken: string
): Promise<GoogleUserInfo> => {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    throw new Error(`Google userinfo failed: ${String(response.status)}`);
  }

  return (await response.json()) as GoogleUserInfo;
};

export { exchangeGoogleAuthorizationCode, fetchGoogleUserProfile };
