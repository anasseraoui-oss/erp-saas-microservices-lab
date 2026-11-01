// Feign Communication Tracker
// Tracks and visualizes inter-service communications via Feign clients

class FeignTracker {
    constructor() {
        this.communications = [];
        this.activeTransactions = new Map();
    }

    startTransaction(transactionId, sourceName, targetName, purpose) {
        const transaction = {
            id: transactionId,
            source: sourceName,
            target: targetName,
            purpose: purpose,
            startTime: Date.now(),
            endTime: null,
            duration: null,
            status: 'in-progress',
            error: null
        };

        this.activeTransactions.set(transactionId, transaction);
        this.communications.push(transaction);

        return transaction;
    }

    endTransaction(transactionId, status, error = null) {
        const transaction = this.activeTransactions.get(transactionId);

        if (transaction) {
            transaction.endTime = Date.now();
            transaction.duration = transaction.endTime - transaction.startTime;
            transaction.status = status;
            transaction.error = error;

            this.activeTransactions.delete(transactionId);
        }

        return transaction;
    }

    async trackFeignCall(sourceService, targetService, endpoint, purpose) {
        const transactionId = `${sourceService}-${targetService}-${Date.now()}`;

        this.startTransaction(transactionId, sourceService, targetService, purpose);

        try {
            // Simulate Feign call tracking
            const result = await this.simulateFeignCall(targetService, endpoint);
            this.endTransaction(transactionId, 'success');
            return { success: true, transactionId, result };
        } catch (error) {
            this.endTransaction(transactionId, 'failed', error.message);
            return { success: false, transactionId, error: error.message };
        }
    }

    async simulateFeignCall(targetService, endpoint) {
        // This simulates a Feign call by making an actual HTTP request
        // In a real scenario, this would be intercepted from the backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure
                if (Math.random() > 0.1) {
                    resolve({ status: 'success', data: {} });
                } else {
                    reject(new Error('Feign call failed'));
                }
            }, Math.random() * 1000 + 500);
        });
    }

    getTransactionFlow(serviceName) {
        return this.communications.filter(
            comm => comm.source === serviceName || comm.target === serviceName
        );
    }

    getAllCommunications() {
        return this.communications;
    }

    getStatistics() {
        const total = this.communications.length;
        const successful = this.communications.filter(c => c.status === 'success').length;
        const failed = this.communications.filter(c => c.status === 'failed').length;
        const inProgress = this.communications.filter(c => c.status === 'in-progress').length;

        const completedCalls = this.communications.filter(c => c.duration !== null);
        const avgDuration = completedCalls.length > 0
            ? Math.round(completedCalls.reduce((sum, c) => sum + c.duration, 0) / completedCalls.length)
            : 0;

        return {
            total,
            successful,
            failed,
            inProgress,
            successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
            avgDuration
        };
    }

    generateFlowDiagram() {
        // Generate a visual representation of service communications
        const nodes = new Set();
        const edges = [];

        this.communications.forEach(comm => {
            nodes.add(comm.source);
            nodes.add(comm.target);
            edges.push({
                from: comm.source,
                to: comm.target,
                label: comm.purpose,
                status: comm.status
            });
        });

        return {
            nodes: Array.from(nodes),
            edges: edges
        };
    }

    clearCommunications() {
        this.communications = [];
        this.activeTransactions.clear();
    }
}
