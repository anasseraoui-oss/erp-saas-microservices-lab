// API Testing Engine
// Handles all API testing logic and result collection

class APITester {
    constructor() {
        this.results = [];
        this.currentTest = null;
    }

    async testEndpoint(service, endpoint, testData = null) {
        const startTime = performance.now();
        const result = {
            service: service.name,
            endpoint: `${endpoint.method} ${endpoint.path}`,
            description: endpoint.description,
            status: 'pending',
            responseTime: 0,
            statusCode: null,
            error: null,
            timestamp: new Date().toISOString()
        };

        try {
            const url = `${service.baseUrl}${endpoint.path}`;
            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (testData && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
                options.body = JSON.stringify(testData);
            }

            const response = await fetch(url, options);
            const endTime = performance.now();

            result.responseTime = Math.round(endTime - startTime);
            result.statusCode = response.status;
            result.status = response.ok ? 'success' : 'failed';

            if (!response.ok) {
                result.error = `HTTP ${response.status}: ${response.statusText}`;
            }

            try {
                result.responseData = await response.json();
            } catch (e) {
                result.responseData = await response.text();
            }

        } catch (error) {
            const endTime = performance.now();
            result.responseTime = Math.round(endTime - startTime);
            result.status = 'error';
            result.error = error.message;
        }

        this.results.push(result);
        return result;
    }

    async testService(serviceKey, config) {
        const service = config[serviceKey];
        const serviceResults = [];

        for (const endpoint of service.endpoints) {
            const result = await this.testEndpoint(service, endpoint);
            serviceResults.push(result);

            // Small delay between requests
            await this.delay(100);
        }

        return serviceResults;
    }

    async testAllServices(config) {
        this.results = [];
        const allResults = {};

        for (const [serviceKey, service] of Object.entries(config)) {
            console.log(`Testing ${service.name}...`);
            allResults[serviceKey] = await this.testService(serviceKey, config);
        }

        return allResults;
    }

    async testScenario(scenario, config) {
        const scenarioResults = {
            name: scenario.name,
            description: scenario.description,
            steps: [],
            overallStatus: 'success',
            totalTime: 0,
            timestamp: new Date().toISOString()
        };

        const startTime = performance.now();

        for (const step of scenario.steps) {
            const service = config[step.service];
            const endpoint = service.endpoints.find(e =>
                `${e.method} ${e.path}` === step.endpoint
            );

            if (!endpoint) {
                scenarioResults.steps.push({
                    description: step.description,
                    status: 'error',
                    error: 'Endpoint not found in configuration'
                });
                scenarioResults.overallStatus = 'failed';
                continue;
            }

            const result = await this.testEndpoint(service, endpoint);
            scenarioResults.steps.push({
                ...result,
                stepDescription: step.description
            });

            if (result.status !== 'success') {
                scenarioResults.overallStatus = 'failed';
            }

            await this.delay(200);
        }

        const endTime = performance.now();
        scenarioResults.totalTime = Math.round(endTime - startTime);

        return scenarioResults;
    }

    getStatistics() {
        const total = this.results.length;
        const successful = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const errors = this.results.filter(r => r.status === 'error').length;

        const avgResponseTime = total > 0
            ? Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / total)
            : 0;

        return {
            total,
            successful,
            failed,
            errors,
            successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
            avgResponseTime
        };
    }

    clearResults() {
        this.results = [];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
