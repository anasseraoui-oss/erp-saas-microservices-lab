import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import * as Stomp from '@stomp/stompjs';

interface ChatMessage {
  sender: string;
  type: 'JOIN' | 'LEAVE' | 'CHAT';
  content?: string;
}

const useOnlineStatus = (username: string) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const stompClient = useRef<Stomp.Client | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    console.log('useOnlineStatus hook useEffect running for username:', username);

    const connect = () => {
      if (stompClient.current?.connected) {
        console.log('Already connected, skipping connection attempt');
        return;
      }

      console.log('Attempting to connect STOMP client...');
      setConnectionStatus('connecting');

      const client = new Stomp.Client({
        webSocketFactory: () => {
          // Try both gateway and direct connection
          const wsUrl = process.env.NODE_ENV === 'production'
              ? 'http://localhost:9055/ws/online'  // Through gateway
              : 'http://localhost:8081/ws/online'; // Direct to service (adjust port as needed)

          console.log('Creating SockJS connection to:', wsUrl);
          const socket = new SockJS(wsUrl);

          socket.onopen = () => {
            console.log('✅ SockJS connection opened successfully');
            reconnectAttempts.current = 0;
          };

          // @ts-ignore
          socket.onclose = (event) => {
            console.log('❌ SockJS connection closed:', event.code, event.reason);
            setConnectionStatus('disconnected');
          };

          // @ts-ignore
          socket.onerror = (error) => {
            console.error('❌ SockJS error:', error);
            setConnectionStatus('error');
          };

          return socket;
        },

        debug: (str: string) => {
          console.log('🔍 STOMP Debug:', str);
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame: Stomp.IFrame) => {
          console.log('✅ STOMP Connected successfully:', frame);
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;

          if (client.connected) {
            console.log('📡 Subscribing to /topic/public...');

            // Subscribe to the public topic
            client.subscribe('/topic/public', (message: Stomp.IMessage) => {
              console.log('📨 Received message on /topic/public:', message.body);
              try {
                const chatMessage: ChatMessage = JSON.parse(message.body);
                console.log('✅ Parsed chat message:', chatMessage);

                if (chatMessage.type === 'JOIN') {
                  setOnlineUsers((prev) => {
                    const newSet = new Set(prev).add(chatMessage.sender);
                    console.log('👥 Online users after JOIN:', Array.from(newSet));
                    return newSet;
                  });
                } else if (chatMessage.type === 'LEAVE') {
                  setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(chatMessage.sender);
                    console.log('👥 Online users after LEAVE:', Array.from(newSet));
                    return newSet;
                  });
                } else if (chatMessage.type === 'CHAT') {
                  console.log('💬 Chat message from', chatMessage.sender, ':', chatMessage.content);
                }
              } catch (e) {
                console.error('❌ Failed to parse message body:', message.body, e);
              }
            });

            // Tell everyone I'm online
            const joinMessage = { sender: username, type: 'JOIN' };
            console.log('📤 Publishing JOIN message:', joinMessage);

            try {
              client.publish({
                destination: '/app/chat.addUser',
                body: JSON.stringify(joinMessage),
              });
              console.log('✅ JOIN message published successfully');
            } catch (error) {
              console.error('❌ Failed to publish JOIN message:', error);
            }
          }
        },

        onStompError: (frame: Stomp.IFrame) => {
          console.error('❌ STOMP Broker reported error:', frame.headers['message']);
          console.error('❌ STOMP Additional details:', frame.body);
          setConnectionStatus('error');

          reconnectAttempts.current++;
          console.log(`🔄 Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);

          if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached. Stopping reconnection.');
            client.deactivate();
          }
        },

        onWebSocketError: (event: Event) => {
          console.error('❌ WebSocket Error:', event);
          setConnectionStatus('error');
        },

        onDisconnect: (frame: Stomp.IFrame) => {
          console.log('🔌 STOMP Disconnected:', frame);
          setConnectionStatus('disconnected');
        },

        onWebSocketClose: (event: CloseEvent) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          setConnectionStatus('disconnected');
        }
      });

      stompClient.current = client;

      try {
        console.log('🚀 Activating STOMP client...');
        client.activate();
      } catch (error) {
        console.error('❌ Failed to activate STOMP client:', error);
        setConnectionStatus('error');
      }
    };

    const disconnect = () => {
      console.log('🔄 Attempting to disconnect STOMP client...');

      if (stompClient.current?.connected) {
        // The backend now handles broadcasting the LEAVE message via SessionDisconnectEvent
        // So, we just need to deactivate the client from the frontend.
        stompClient.current.deactivate();
        console.log('✅ STOMP client deactivated.');

      } else if (stompClient.current) {
        stompClient.current.deactivate();
      }

      setConnectionStatus('disconnected');
      setOnlineUsers(new Set());
    };

    if (username) {
      connect();
    } else {
      console.log('⚠️ Username is empty, not connecting STOMP client.');
      setConnectionStatus('disconnected');
    }

    return () => {
      disconnect();
    };
  }, [username]);

  return {
    onlineUsers,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
    hasError: connectionStatus === 'error'
  };
};

export default useOnlineStatus;