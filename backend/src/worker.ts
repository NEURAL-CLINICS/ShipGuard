import { config } from "./config";
import { registerScanWorker } from "./queue";
import { runScan } from "./services/scanRunner";

if (config.queueMode !== "redis") {
  console.log("ShipGuard worker idle (queue mode is inline)");
  setInterval(() => {}, 60_000);
} else {
  registerScanWorker(async ({ scanId }) => {
    await runScan(scanId);
  });
  console.log("ShipGuard worker listening for scan jobs");
}
