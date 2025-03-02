import provider from "./tracer"; // Import the tracing provider
import meterProvider from "./metrics"; // Import the meter provider

// Initialize tracing
const sdk = provider;

// Initialize metrics and export the meter
export const meter = meterProvider;

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
