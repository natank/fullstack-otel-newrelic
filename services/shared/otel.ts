import { initializeTracing } from "./tracer";
import { initializeMetrics } from "./metrics";

// Initialize tracing
const sdk = initializeTracing();

// Initialize metrics and export the meter
export const meter = initializeMetrics();

// Handle shutdown on process termination
process.on("SIGTERM", async () => {
  try {
    await sdk.shutdown();
    console.log("✅ Tracing terminated gracefully.");
  } catch (error) {
    console.error("❌ Error during tracing shutdown:", error);
  }
  process.exit(0);
});

export default sdk;
