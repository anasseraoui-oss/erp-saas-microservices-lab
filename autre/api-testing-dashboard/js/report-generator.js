// Report Generator
// Generates comprehensive test reports in HTML and JSON formats

class ReportGenerator {
    constructor(apiTester, feignTracker) {
        this.apiTester = apiTester;
        this.feignTracker = feignTracker;
    }

    generateHTMLReport() {
        const stats = this.apiTester.getStatistics();
        const feignStats = this.feignTracker.getStatistics();
        const timestamp = new Date().toLocaleString();

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test Report - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; }
        .timestamp { color: #666; font-size: 14px; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; }
        .stat-value { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 24px; color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        .status-success { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .status-error { color: #ffc107; font-weight: bold; }
        .feign-flow { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 15px; }
        .flow-item { padding: 10px; margin: 5px 0; background: white; border-left: 4px solid #667eea; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 API Testing Dashboard - Comprehensive Report</h1>
        <div class="timestamp">Generated: ${timestamp}</div>

        <div class="section">
            <div class="section-title">📊 Overall Statistics</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.successful}</div>
                    <div class="stat-label">Successful</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.failed + stats.errors}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.successRate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.avgResponseTime}ms</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🔗 Feign Communications</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${feignStats.total}</div>
                    <div class="stat-label">Total Calls</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${feignStats.successful}</div>
                    <div class="stat-label">Successful</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${feignStats.successRate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${feignStats.avgDuration}ms</div>
                    <div class="stat-label">Avg Duration</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📝 Detailed Test Results</div>
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Status Code</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.generateTestResultsRows()}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">🔄 Feign Communication Flow</div>
            <div class="feign-flow">
                ${this.generateFeignFlowHTML()}
            </div>
        </div>
    </div>
</body>
</html>
        `;

        return html;
    }

    generateTestResultsRows() {
        return this.apiTester.results.map(result => `
            <tr>
                <td>${result.service}</td>
                <td>${result.endpoint}</td>
                <td class="status-${result.status}">${result.status.toUpperCase()}</td>
                <td>${result.responseTime}ms</td>
                <td>${result.statusCode || 'N/A'}</td>
            </tr>
        `).join('');
    }

    generateFeignFlowHTML() {
        const communications = this.feignTracker.getAllCommunications();

        if (communications.length === 0) {
            return '<p>No Feign communications recorded yet.</p>';
        }

        return communications.map(comm => `
            <div class="flow-item">
                <strong>${comm.source}</strong> → <strong>${comm.target}</strong>
                <br>
                <small>${comm.purpose} | Duration: ${comm.duration || 'N/A'}ms | Status: ${comm.status}</small>
            </div>
        `).join('');
    }

    generateJSONReport() {
        return {
            timestamp: new Date().toISOString(),
            statistics: {
                api: this.apiTester.getStatistics(),
                feign: this.feignTracker.getStatistics()
            },
            testResults: this.apiTester.results,
            feignCommunications: this.feignTracker.getAllCommunications(),
            flowDiagram: this.feignTracker.generateFlowDiagram()
        };
    }

    downloadHTMLReport() {
        const html = this.generateHTMLReport();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-test-report-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadJSONReport() {
        const json = JSON.stringify(this.generateJSONReport(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-test-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
