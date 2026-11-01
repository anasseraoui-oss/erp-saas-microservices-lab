// src/types/stomp.d.ts
declare module '@stomp/stompjs' {
    export interface IMessage {
        body: string;
        headers: { [key: string]: string };
        ack: (headers?: { [key: string]: string }) => void;
        nack: (headers?: { [key: string]: string }) => void;
    }

    export interface IFrame {
        command: string;
        headers: { [key: string]: string };
        body?: string;
    }

    export interface StompSubscription {
        id: string;
        unsubscribe: (headers?: { [key: string]: string }) => void;
    }

    export class Client {
        constructor(conf?: any);

        webSocketFactory?: () => any;
        connectHeaders?: { [key: string]: string };
        heartbeatIncoming?: number;
        heartbeatOutgoing?: number;
        reconnectDelay?: number;
        maxReconnectAttempts?: number;
        debug?: (str: string) => void;

        onConnect?: (frame: IFrame) => void;
        onStompError?: (frame: IFrame) => void;
        onWebSocketError?: (error: Event) => void;
        onWebSocketClose?: (event: CloseEvent) => void;
        onDisconnect?: () => void;

        connected: boolean;

        activate(): void;
        deactivate(): void;
        publish(params: { destination: string; body?: string; headers?: { [key: string]: string } }): void;
        subscribe(destination: string, callback: (message: IMessage) => void, headers?: { [key: string]: string }): StompSubscription;
    }
}