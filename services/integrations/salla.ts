export const getSallaAuthUrl = () => {
  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/salla/callback`;
  const scope = 'offline_access'; // Add required scopes here
  
  return `https://accounts.salla.sa/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=salla`;
};

export const exchangeSallaCode = async (code: string) => {
  const clientId = process.env.SALLA_CLIENT_ID;
  const clientSecret = process.env.SALLA_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/salla/callback`;

  const response = await fetch('https://accounts.salla.sa/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Salla code');
  }

  return response.json();
};

export const getSallaStoreData = async (accessToken: string) => {
  const response = await fetch('https://api.salla.dev/admin/v2/store/info', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Salla store info');
  }

  const data = await response.json();
  
  // Also fetch products count
  const productsResponse = await fetch('https://api.salla.dev/admin/v2/products', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  let productsCount = 0;
  if (productsResponse.ok) {
    const productsData = await productsResponse.json();
    productsCount = productsData.pagination?.total || 0;
  }

  // Also fetch orders count
  const ordersResponse = await fetch('https://api.salla.dev/admin/v2/orders', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  let ordersCount = 0;
  if (ordersResponse.ok) {
    const ordersData = await ordersResponse.json();
    ordersCount = ordersData.pagination?.total || 0;
  }

  return {
    storeName: data.data?.name || 'متجر سلة',
    productsCount,
    ordersCount,
  };
};
