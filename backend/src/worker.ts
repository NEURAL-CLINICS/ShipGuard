import { config } from "./config";

console.log(`ShipGuard worker ready (env port ${config.port})`);
setInterval(() => {}, 60_000);
