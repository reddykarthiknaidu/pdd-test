const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArgValue = (argName, defaultValue) => {
  const idx = args.findIndex(a => a === argName || a.startsWith(argName + '='));
  if (idx === -1) return defaultValue;
  if (args[idx].includes('=')) {
    return args[idx].split('=')[1];
  }
  return args[idx + 1] || defaultValue;
};

const urlStr = getArgValue('--url', 'http://localhost:8081/api/healthz');
const concurrency = parseInt(getArgValue('--concurrency', '100'), 10);
const durationSecs = parseInt(getArgValue('--duration', '60'), 10);
const outputPath = getArgValue('--output', '');

let outputStream = null;
if (outputPath) {
  const absolutePath = path.resolve(outputPath);
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  outputStream = fs.createWriteStream(absolutePath, { flags: 'w' });
}

function log(message) {
  console.log(message);
  if (outputStream) {
    outputStream.write(message + '\n');
  }
}

log(`Starting load test with settings:`);
log(`- Target URL: ${urlStr}`);
log(`- Concurrency: ${concurrency} virtual users`);
log(`- Duration: ${durationSecs} seconds`);
if (outputPath) {
  log(`- Saving report to: ${outputPath}`);
}
log(`----------------------------------------`);

const targetUrl = new URL(urlStr);
const isHttps = targetUrl.protocol === 'https:';
const client = isHttps ? https : http;

const agent = new client.Agent({
  keepAlive: true,
  maxSockets: concurrency,
  keepAliveMsecs: 10000,
});

let totalRequests = 0;
let successRequests = 0;
let errorRequests = 0;
const statusCodes = {};
const responseTimes = [];

let stopTesting = false;
const startTime = Date.now();
const endTime = startTime + (durationSecs * 1000);

// For progress updates
let lastTickTime = startTime;
let lastTickRequests = 0;

function printProgress() {
  const now = Date.now();
  const elapsed = (now - startTime) / 1000;
  const tickElapsed = (now - lastTickTime) / 1000;
  const tickReqs = totalRequests - lastTickRequests;
  const currentRps = (tickReqs / tickElapsed).toFixed(1);
  
  // Calculate average latency in this tick
  let avgLatency = 0;
  const tickLatencies = responseTimes.slice(lastTickRequests);
  if (tickLatencies.length > 0) {
    avgLatency = (tickLatencies.reduce((a, b) => a + b, 0) / tickLatencies.length).toFixed(1);
  } else {
    avgLatency = '0.0';
  }

  log(`[Progress] Elapsed: ${elapsed.toFixed(0)}s | Current RPS: ${currentRps} | Avg Latency: ${avgLatency}ms | Total Requests: ${totalRequests}`);
  
  lastTickTime = now;
  lastTickRequests = totalRequests;
}

const progressInterval = setInterval(printProgress, 5000);

function sendRequest() {
  if (stopTesting || Date.now() >= endTime) {
    return Promise.resolve();
  }

  const reqStartTime = process.hrtime.bigint();
  totalRequests++;

  return new Promise((resolve) => {
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: 'GET',
      agent: agent,
      headers: {
        'Connection': 'keep-alive',
      },
      timeout: 10000, // 10s timeout
    };

    const req = client.request(options, (res) => {
      // Read response body so socket is released back to agent
      res.resume();
      res.on('end', () => {
        const reqEndTime = process.hrtime.bigint();
        const durationMs = Number(reqEndTime - reqStartTime) / 1e6; // nanoseconds to milliseconds
        responseTimes.push(durationMs);

        const status = res.statusCode;
        statusCodes[status] = (statusCodes[status] || 0) + 1;

        if (status >= 200 && status < 400) {
          successRequests++;
        } else {
          errorRequests++;
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      const reqEndTime = process.hrtime.bigint();
      const durationMs = Number(reqEndTime - reqStartTime) / 1e6;
      responseTimes.push(durationMs);
      
      const errorMsg = err.message || 'Error';
      statusCodes[errorMsg] = (statusCodes[errorMsg] || 0) + 1;
      errorRequests++;
      resolve();
    });

    req.on('timeout', () => {
      req.destroy(new Error('Timeout'));
    });

    req.end();
  }).then(() => {
    // Immediately send next request to maintain concurrency
    if (!stopTesting && Date.now() < endTime) {
      return sendRequest();
    }
  });
}

// Run concurrency
const workers = [];
for (let i = 0; i < concurrency; i++) {
  workers.push(sendRequest());
}

setTimeout(() => {
  stopTesting = true;
  clearInterval(progressInterval);
  log(`\nStopping test, waiting for active requests to finish...`);
  
  Promise.all(workers).then(() => {
    const actualEndTime = Date.now();
    const actualDurationSecs = (actualEndTime - startTime) / 1000;
    
    // Sort response times for percentiles
    responseTimes.sort((a, b) => a - b);
    
    const count = responseTimes.length;
    const min = count > 0 ? responseTimes[0] : 0;
    const max = count > 0 ? responseTimes[count - 1] : 0;
    const sum = responseTimes.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    
    const getPercentile = (p) => {
      if (count === 0) return 0;
      const index = Math.ceil((p / 100) * count) - 1;
      return responseTimes[index];
    };

    const p50 = getPercentile(50);
    const p90 = getPercentile(90);
    const p95 = getPercentile(95);
    const p99 = getPercentile(99);

    const rps = (successRequests / actualDurationSecs).toFixed(1);

    log(`\n================ LOAD TEST RESULTS ================`);
    log(`Target URL:             ${urlStr}`);
    log(`Total duration:         ${actualDurationSecs.toFixed(2)} seconds`);
    log(`Concurrency:            ${concurrency} virtual users`);
    log(`---------------------------------------------------`);
    log(`Total Requests Sent:    ${totalRequests}`);
    log(`Successful Requests:    ${successRequests}`);
    log(`Failed Requests:        ${errorRequests}`);
    log(`Requests / Sec (RPS):   ${rps} req/sec`);
    log(`---------------------------------------------------`);
    log(`Response Times:`);
    log(`  Min:                  ${min.toFixed(2)} ms`);
    log(`  Average:              ${avg.toFixed(2)} ms`);
    log(`  Max:                  ${max.toFixed(2)} ms`);
    log(`  50th Percentile (p50): ${p50.toFixed(2)} ms`);
    log(`  90th Percentile (p90): ${p90.toFixed(2)} ms`);
    log(`  95th Percentile (p95): ${p95.toFixed(2)} ms`);
    log(`  99th Percentile (p99): ${p99.toFixed(2)} ms`);
    log(`---------------------------------------------------`);
    log(`Status / Error Codes Distribution:`);
    for (const [code, count] of Object.entries(statusCodes)) {
      const pct = ((count / totalRequests) * 100).toFixed(1);
      log(`  ${code}: ${count} (${pct}%)`);
    }
    log(`===================================================`);

    if (outputStream) {
      outputStream.end();
    }
  });
}, durationSecs * 1000);
