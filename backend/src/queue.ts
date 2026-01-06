import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config";

const queueName = "shipguard:scans";
let queue: Queue | null = null;
let connection: IORedis | null = null;

function getConnection() {
  if (!connection) {
    if (!config.redisUrl) {
      throw new Error("REDIS_URL is required for redis queue mode");
    }
    connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
  }
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
