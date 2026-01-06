process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-secret-test-secret";
process.env.ALLOW_LOCAL_SOURCE =
  process.env.ALLOW_LOCAL_SOURCE ?? "true";
process.env.STORAGE_MODE = process.env.STORAGE_MODE ?? "memory";
process.env.QUEUE_MODE = process.env.QUEUE_MODE ?? "inline";
process.env.DATA_DIR = process.env.DATA_DIR ?? ".data-test";
