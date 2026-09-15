const cluster = require('cluster');
const os = require('os');
const path = require('path');

/**
 * High-Availability Multi-Core Load Balancer & Process Manager
 * Automatically scales workers across CPU cores and handles zero-downtime restarts.
 */

const numCPUs = process.env.CLUSTER_WORKERS
  ? parseInt(process.env.CLUSTER_WORKERS, 10)
  : Math.min(4, os.cpus().length || 1);

const serverScript = path.join(__dirname, 'server.js');

if (cluster.isPrimary || cluster.isMaster) {
  console.log(`🚀 [Cluster Master] PID ${process.pid} is running. Setting up ${numCPUs} worker processes for ${serverScript}...`);

  if (typeof cluster.setupPrimary === 'function') {
    cluster.setupPrimary({ exec: serverScript });
  } else if (typeof cluster.setupMaster === 'function') {
    cluster.setupMaster({ exec: serverScript });
  }

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    console.log(`⚡ [Worker Online] Worker PID ${worker.process.pid} ready to accept traffic`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ [Worker Died] Worker PID ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Spawning replacement...`);
    cluster.fork();
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('🛑 [Cluster Master] Received SIGTERM, gracefully shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGTERM');
    }
    process.exit(0);
  });
} else {
  // Worker process runs express server
  require('./server.js');
}
