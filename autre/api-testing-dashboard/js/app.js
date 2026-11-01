// Main Application Logic
// Coordinates all dashboard functionality

let apiTester, feignTracker, reportGenerator;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    apiTester = new APITester();
    feignTracker = new FeignTracker();
    reportGenerator = new ReportGenerator(apiTester, feignTracker);

    // Render service cards
    renderServiceCards();

    // Setup event listeners
    setupEventListeners();

    // Initial service status check
    checkAllServicesStatus();
});

function renderServiceCards() {
    const container = document.getElementById('services-container');
    container.innerHTML = '';

    Object.entries(SERVICES_CONFIG).forEach(([key, service]) => {
        const card = createServiceCard(key, service);
        container.appendChild(card);
    });
}

function createServiceCard(serviceKey, service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.style.borderLeft = `5px solid ${service.color}`;

    card.innerHTML = `
        <div class="service-header">
            <h3>${service.name}</h3>
            <span class="status-badge" id="status-${serviceKey}">⏳ Checking...</span>
        </div>
        <div class="service-info">
            <p><strong>Base URL:</strong> ${service.baseUrl}</p>
            <p><strong>Endpoints:</strong> ${service.endpoints.length}</p>
            ${service.feignClients ? `<p><strong>Feign Clients:</strong> ${service.feignClients.length}</p>` : ''}
        </div>
        <div class="service-actions">
            <button class="btn btn-primary" onclick="testSingleService('${serviceKey}')">
                🧪 Test Service
            </button>
            <button class="btn btn-secondary" onclick="viewEndpoints('${serviceKey}')">
                📋 View Endpoints
            </button>
        </div>
        <div class="endpoints-list" id="endpoints-${serviceKey}" style="display: none;"></div>
    `;

    return card;
}

async function checkAllServicesStatus() {
    for (const [key, service] of Object.entries(SERVICES_CONFIG)) {
        await checkServiceStatus(key, service);
    }
    updateOverallStats();
}

async function checkServiceStatus(serviceKey, service) {
    const statusBadge = document.getElementById(`status-${serviceKey}`);

    try {
        const healthEndpoint = service.endpoints.find(e => e.path.includes('health'));
        if (!healthEndpoint) {
            statusBadge.textContent = '❓ Unknown';
            statusBadge.className = 'status-badge status-unknown';
            return;
        }

        const response = await fetch(`${service.baseUrl}${healthEndpoint.path}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            statusBadge.textContent = '✅ Online';
            statusBadge.className = 'status-badge status-online';
        } else {
            statusBadge.textContent = '⚠️ Issues';
            statusBadge.className = 'status-badge status-warning';
        }
    } catch (error) {
        statusBadge.textContent = '❌ Offline';
        statusBadge.className = 'status-badge status-offline';
    }
}

async function testSingleService(serviceKey) {
    showLoading(`Testing ${SERVICES_CONFIG[serviceKey].name}...`);

    const results = await apiTester.testService(serviceKey, SERVICES_CONFIG);

    hideLoading();
    displayTestResults(results);
    updateOverallStats();
}

async function testAllServices() {
    showLoading('Testing all services...');

    const results = await apiTester.testAllServices(SERVICES_CONFIG);

    hideLoading();
    displayAllResults(results);
    updateOverallStats();
}

async function runScenario(scenarioKey) {
    const scenario = TEST_SCENARIOS[scenarioKey];
    showLoading(`Running scenario: ${scenario.name}...`);

    const result = await apiTester.testScenario(scenario, SERVICES_CONFIG);

    // Track Feign communications
    for (const step of result.steps) {
        if (step.stepDescription.includes('Feign')) {
            feignTracker.startTransaction(
                `${scenarioKey}-${Date.now()}`,
                scenario.steps[0].service,
                step.service,
                step.stepDescription
            );
        }
    }

    hideLoading();
    displayScenarioResults(result);
    updateOverallStats();
}

function viewEndpoints(serviceKey) {
    const endpointsList = document.getElementById(`endpoints-${serviceKey}`);
    const service = SERVICES_CONFIG[serviceKey];

    if (endpointsList.style.display === 'none') {
        endpointsList.innerHTML = `
            <h4>Available Endpoints:</h4>
            <ul class="endpoint-list">
                ${service.endpoints.map(e => `
                    <li>
                        <span class="method-badge method-${e.method.toLowerCase()}">${e.method}</span>
                        <code>${e.path}</code>
                        <span class="endpoint-desc">${e.description}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        endpointsList.style.display = 'block';
    } else {
        endpointsList.style.display = 'none';
    }
}

function displayTestResults(results) {
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.innerHTML = '<h3>Test Results</h3>';

    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Status Code</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(r => `
                <tr>
                    <td><code>${r.endpoint}</code></td>
                    <td><span class="status-${r.status}">${r.status.toUpperCase()}</span></td>
                    <td>${r.responseTime}ms</td>
                    <td>${r.statusCode || 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    resultsContainer.appendChild(table);
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function displayAllResults(results) {
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.innerHTML = '<h3>All Services Test Results</h3>';

    Object.entries(results).forEach(([serviceKey, serviceResults]) => {
        const section = document.createElement('div');
        section.className = 'service-results';
        section.innerHTML = `
            <h4>${SERVICES_CONFIG[serviceKey].name}</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Response Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceResults.map(r => `
                        <tr>
                            <td><code>${r.endpoint}</code></td>
                            <td><span class="status-${r.status}">${r.status.toUpperCase()}</span></td>
                            <td>${r.responseTime}ms</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        resultsContainer.appendChild(section);
    });

    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function displayScenarioResults(result) {
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.innerHTML = `
        <h3>Scenario Results: ${result.name}</h3>
        <p>${result.description}</p>
        <div class="scenario-stats">
            <span>Overall Status: <strong class="status-${result.overallStatus}">${result.overallStatus.toUpperCase()}</strong></span>
            <span>Total Time: <strong>${result.totalTime}ms</strong></span>
        </div>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Step</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Response Time</th>
                </tr>
            </thead>
            <tbody>
                ${result.steps.map(s => `
                    <tr>
                        <td>${s.stepDescription}</td>
                        <td>${s.service}</td>
                        <td><span class="status-${s.status}">${s.status.toUpperCase()}</span></td>
                        <td>${s.responseTime}ms</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function updateOverallStats() {
    const stats = apiTester.getStatistics();

    document.getElementById('total-tests').textContent = stats.total;
    document.getElementById('successful-tests').textContent = stats.successful;
    document.getElementById('failed-tests').textContent = stats.failed + stats.errors;
    document.getElementById('success-rate').textContent = `${stats.successRate}%`;
}

function setupEventListeners() {
    document.getElementById('test-all-btn').addEventListener('click', testAllServices);
    document.getElementById('refresh-status-btn').addEventListener('click', checkAllServicesStatus);
    document.getElementById('export-html-btn').addEventListener('click', () => reportGenerator.downloadHTMLReport());
    document.getElementById('export-json-btn').addEventListener('click', () => reportGenerator.downloadJSONReport());

    // Scenario buttons
    document.getElementById('scenario-sales-btn').addEventListener('click', () => runScenario('salesOrderFlow'));
    document.getElementById('scenario-purchase-btn').addEventListener('click', () => runScenario('purchaseOrderFlow'));
}

function showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
