import cors from "cors";
import "../shared/otel"; // Ensure OpenTelemetry is initialized
import express, { Request, Response } from "express";
import axios from "axios";
import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import Redis from "ioredis";

const tracer = trace.getTracer("todo-service");

// Initialize Express and Redis
const app = express();
const redis = new Redis({ host: "redis", port: 6379 });

const corsOptions = {
  origin: "http://localhost:5173", // Allow frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow necessary methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "traceparent", // Required for OpenTelemetry trace propagation
    "tracestate", // Required for OpenTelemetry trace propagation
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/todos", async (req: Request, res: Response) => {
  // Retrieve the active OpenTelemetry span
  const activeSpan = trace.getSpan(context.active());

  try {
    // Simulate an error if "error=1" is passed in the query params
    if (req.query.error === "1") {
      throw new Error("Simulated server error");
    }

    // Introduce an artificial delay if "slow=1" is passed
    const delay = req.query.slow === "1" ? 2000 : 0;

    const user = await axios.get("http://auth:8080/auth");
    const todoKeys = await redis.keys("todo-message-*");
    const todos: any[] = [];

    for (const key of todoKeys) {
      const todoItem = await redis.get(key);

      if (todoItem) {
        todos.push(todoItem);
      }
    }

    // Artificial delay before sending the response
    setTimeout(() => {
      res.json({ todos, user: user.data });
    }, delay);
  } catch (error) {
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();

      // Attach the error message and trace details to the span
      activeSpan.recordException(error as Error);
      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });

      // **✅ Manually log traceId & spanId in the Jaeger event logs**
      activeSpan.addEvent("Error Occurred", {
        message: (error as Error).message,
        spanId: spanContext?.spanId,
        traceId: spanContext?.traceId,
        traceFlags: spanContext?.traceFlags,
      });

      // ✅ Also log in the console with trace details
      console.error("Really bad error", {
        message: (error as Error).message,
        spanId: spanContext?.spanId,
        traceId: spanContext?.traceId,
        traceFlags: spanContext?.traceFlags,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function init() {
  const span = tracer.startActiveSpan("init-redis-messages", async (span) => {
    const messages = [
      "Message 1",
      "Message 2",
      "Message 3",
      "Message 4",
      "Message 5",
    ];

    try {
      const username = `user_${Math.floor(Math.random() * 1000)}`;
      span.setAttribute("username", username); // Add custom attribute

      span.addEvent("Starting Redis operations"); // 🔹 Add this event at the beginning

      await Promise.all(
        messages.map((msg, index) => {
          const uniqueKey = `todo-message-${Date.now()}-${index}`;
          return redis.set(uniqueKey, msg);
        })
      );
      span.setAttribute("message.count", messages.length);
      span.addEvent("Messages written to Redis");
    } catch (error: unknown) {
      if (error instanceof Error) {
        span.recordException(error);
      } else {
        span.recordException(new Error(String(error))); // Convert non-Error types to Error
      }
    } finally {
      span.end();
    }
  });
}

init(); // Run initialization on server start

// Start the Express server
app.listen(8080, () => {
  console.log("Service is up and running on port 8080!");
});
