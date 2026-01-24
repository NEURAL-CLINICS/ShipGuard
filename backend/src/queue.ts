import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { config } from "./config";

const queueName = "shipguard:scans";
let queue: Queue | null = null;
let connection: ConnectionOptions | null = null;

function getConnection() {
  if (connection) {
    return connection;
  }

  if (!config.redisUrl) {
    throw new Error("REDIS_URL is required for redis queue mode");
  }

  const url = new URL(config.redisUrl);
  const dbFromPath = url.pathname && url.pathname !== "/" ? Number(url.pathname.slice(1)) : undefined;

  connection = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number.isFinite(dbFromPath) ? dbFromPath : undefined,
    maxRetriesPerRequest: null,
    tls: url.protocol === "rediss:" ? {} : undefined
  };

  return connection;
}

export function getScanQueue() {
  if (config.queueMode !== "redis") {
    return null;
  }
  if (!queue) {
    queue = new Queue(queueName, { connection: getConnection() });
  }
  return queue;
}

export function registerScanWorker(
  handler: (data: { scanId: string }) => Promise<void>
) {
  if (config.queueMode !== "redis") {
    return null;
  }
  return new Worker(
    queueName,
    async (job) => {
      await handler(job.data as { scanId: string });
    },
    { connection: getConnection() }
  );
}
