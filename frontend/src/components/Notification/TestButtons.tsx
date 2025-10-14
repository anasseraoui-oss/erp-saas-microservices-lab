import React from 'react';
import { useNotifications } from "./NotificationContext";
import { Activity, Send, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function TestButtons() {
    const { isConnected, connectionStatus } = useNotifications();
    const { t } = useTranslation('generic_action_buttons');

    const testPing = async () => {
        try {
            const response = await fetch('http://localhost:9055/test/ping');
            const result = await response.text();
            console.log('🏓 Ping:', result);
            alert('Ping: ' + result);
        } catch (error) {
            console.error('❌ Ping error:', error);
            alert('Error: ' + error);
        }
    };

    const testSend = async () => {
        try {
            const response = await fetch('http://localhost:9055/test/send', {
                method: 'POST'
            });
            const result = await response.text();
            console.log('📤 Send:', result);
            alert('Send: ' + result);
        } catch (error) {
            console.error('❌ Send error:', error);
            alert('Error: ' + error);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-6 border border-blue-200 dark:border-slate-600 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                        <Activity size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {t('webSocketTestPanel')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t('testNotificationSystem')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Connection Status */}
            <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <Wifi size={18} className="text-green-500" />
                    ) : (
                        <WifiOff size={18} className="text-red-500" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {t('status')}
                    </span>
                    <span className={`text-sm font-semibold ${
                        isConnected
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {connectionStatus}
                    </span>
                    <span className="ml-auto text-xl">
                        {isConnected ? '✅' : '❌'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={testPing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!isConnected}
                >
                    <Activity size={18} />
                    {t('testPing')}
                </button>

                <button
                    onClick={testSend}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!isConnected}
                >
                    <Send size={18} />
                    {t('sendTest')}
                </button>
            </div>

            {/* Info Text */}
            {!isConnected && (
                <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400">
                    {t('connectToWebSocketToEnableTesting')}
                </p>
            )}
        </div>
    );
}

export default TestButtons;
