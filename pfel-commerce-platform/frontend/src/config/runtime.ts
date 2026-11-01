const configuredGatewayUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:9055';

export const GATEWAY_URL = configuredGatewayUrl.replace(/\/+$/, '');
export const NOTIFICATION_SOCKET_URL = `${GATEWAY_URL}/ws/notifications`;
