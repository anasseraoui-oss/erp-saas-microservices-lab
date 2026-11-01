// Fixed NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GATEWAY_URL, NOTIFICATION_SOCKET_URL } from '../../config/runtime';

// Types
interface Notification {
    subject: string;
    createdAt: string;
    id: string;
    message: string;
    timestamp: string;
    type?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    isConnected: boolean;
    sendTestNotification: () => void;
    clearNotifications: () => void;
    connectionStatus: string;
}

interface NotificationProviderProps {
    children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef<boolean>(true);

    // Cleanup function
    const cleanup = useCallback(() => {
        console.log('🧹 Cleaning up WebSocket connection...');

        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Unsubscribe
        if (subscriptionRef.current) {
            try {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                console.log('✅ Unsubscribed from WebSocket');
            } catch (error) {
                console.warn('⚠️ Error unsubscribing:', error);
            }
        }

        // Deactivate client
        if (clientRef.current) {
            try {
                // @ts-ignore
                clientRef.current.deactivate();
                clientRef.current = null;
                console.log('✅ WebSocket client deactivated');
            } catch (error) {
                console.warn('⚠️ Error deactivating client:', error);
            }
        }
    }, []);

    const connectWebSocket = useCallback(() => {
        if (!mountedRef.current) return;

        console.log('🔌 Initializing WebSocket connection through Gateway...');
        setConnectionStatus('Connecting...');

        // Cleanup existing connection
        cleanup();

        // Create new STOMP client
        const stompClient = new Client();

        // FIXED: Configure WebSocket factory with correct Gateway endpoint
        stompClient.webSocketFactory = () => {
            // IMPORTANT: Use the exact Gateway WebSocket endpoint
            const socket = new SockJS(NOTIFICATION_SOCKET_URL);
            console.log('🔌 Created SockJS connection to Gateway endpoint');
            return socket;
        };

        // Enhanced connection settings
        stompClient.connectHeaders = {
            'Accept-Version': '1.0,1.1,1.2',
            'Heart-Beat': '10000,10000'
        };
        stompClient.heartbeatIncoming = 10000;
        stompClient.heartbeatOutgoing = 10000;
        stompClient.reconnectDelay = 5000;
        stompClient.maxReconnectAttempts = 10;

        // Enhanced debug logging
        stompClient.debug = (str: string) => {
            console.log('🔍 STOMP Debug:', str);
        };

        // Connection established
        stompClient.onConnect = (frame: any) => {
            if (!mountedRef.current) return;

            console.log('✅ Connected to WebSocket via Gateway:', frame);
            setIsConnected(true);
            setConnectionStatus('Connected');

            try {
                // Subscribe to notifications topic
                const subscription = stompClient.subscribe('/topic/notifications', (message: any) => {
                    if (!mountedRef.current) return;

                    console.log('📨 Received notification:', message.body);
                    try {
                        const notification: Notification = JSON.parse(message.body);
                        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
                        console.log('✅ Notification added to state:', notification.id);

                        // Show browser notification if supported
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(notification.subject || 'New Notification', {
                                body: notification.message,
                                icon: '/favicon.ico'
                            });
                        }
                    } catch (error) {
                        console.error('❌ Error parsing notification:', error);
                    }
                });

                subscriptionRef.current = subscription;
                console.log('📡 Subscribed to /topic/notifications');
            } catch (error) {
                console.error('❌ Error subscribing to topic:', error);
                setConnectionStatus('Subscription Error');
            }
        };

        // STOMP protocol error
        stompClient.onStompError = (frame: any) => {
            if (!mountedRef.current) return;

            console.error('❌ STOMP protocol error:', frame);
            setIsConnected(false);
            const errorMsg = frame.headers?.message || frame.body || 'Unknown STOMP error';
            setConnectionStatus(`STOMP Error: ${errorMsg}`);

            // Schedule reconnect
            scheduleReconnect();
        };

        // WebSocket error
        stompClient.onWebSocketError = (error: Event) => {
            if (!mountedRef.current) return;

            console.error('❌ WebSocket error:', error);
            setIsConnected(false);
            setConnectionStatus('WebSocket Error');

            // Schedule reconnect
            scheduleReconnect();
        };

        // Connection closed
        stompClient.onWebSocketClose = (event: CloseEvent) => {
            if (!mountedRef.current) return;

            console.log('🔌 WebSocket connection closed:', event);
            setIsConnected(false);

            let reason = 'Connection closed';
            if (event.code === 1006) {
                reason = 'Connection lost unexpectedly';
            } else if (event.code === 1002) {
                reason = 'Protocol error';
            } else if (event.code === 1003) {
                reason = 'Unsupported data type';
            }

            setConnectionStatus(`${reason} (${event.code})`);

            // Schedule reconnect for unexpected closures
            if (event.code !== 1000) { // 1000 = normal closure
                scheduleReconnect();
            }
        };

        // Disconnected
        stompClient.onDisconnect = () => {
            if (!mountedRef.current) return;

            console.log('🔌 Disconnected from WebSocket');
            setIsConnected(false);
            setConnectionStatus('Disconnected');
        };

        // Store client reference
        clientRef.current = stompClient;

        // Activate the client
        try {
            stompClient.activate();
            console.log('🚀 WebSocket client activated');
        } catch (error) {
            console.error('❌ Error activating WebSocket client:', error);
            setConnectionStatus('Activation Error');
            scheduleReconnect();
        }
    }, [cleanup]);

    // Schedule reconnection
    const scheduleReconnect = useCallback(() => {
        if (!mountedRef.current || reconnectTimeoutRef.current) return;

        console.log('⏰ Scheduling reconnection in 5 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
                reconnectTimeoutRef.current = null;
                connectWebSocket();
            }
        }, 5000);
    }, [connectWebSocket]);

    useEffect(() => {
        mountedRef.current = true;

        // Request notification permission on user interaction
        const requestNotificationPermission = () => {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        };

        // Add click listener to request permission on first user interaction
        document.addEventListener('click', requestNotificationPermission, { once: true });

        // Initial connection
        connectWebSocket();

        // Cleanup on unmount
        return () => {
            mountedRef.current = false;
            document.removeEventListener('click', requestNotificationPermission);
            cleanup();
        };
    }, [connectWebSocket, cleanup]);

    const sendTestNotification = useCallback((): void => {
        const client = clientRef.current;
        if (client && isConnected) {
            try {
                const stompClient = client as any;

                if (stompClient.active && stompClient.connected) {
                    stompClient.publish({
                        destination: '/app/test',
                        body: JSON.stringify({
                            message: 'Test notification from client',
                            timestamp: new Date().toISOString()
                        })
                    });
                    console.log('📤 Test notification sent via WebSocket');
                } else {
                    console.warn('⚠️ Client not connected, sending via HTTP');
                    sendTestNotificationViaHttp();
                }
            } catch (error) {
                console.error('❌ Error sending test notification:', error);
                sendTestNotificationViaHttp();
            }
        } else {
            console.warn('⚠️ Cannot send notification: client not available or not connected');
            sendTestNotificationViaHttp();
        }
    }, [isConnected]);

    const sendTestNotificationViaHttp = async (): Promise<void> => {
        try {
            console.log('📤 Sending test notification via HTTP...');
            const response = await fetch(`${GATEWAY_URL}/test/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Test notification via HTTP',
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.text();
                console.log('✅ HTTP test notification response:', result);
            } else {
                console.error('❌ HTTP test notification failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Error sending HTTP test notification:', error);
        }
    };

    const contextValue: NotificationContextType = {
        notifications,
        isConnected,
        sendTestNotification,
        clearNotifications: () => setNotifications([]),
        connectionStatus
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
