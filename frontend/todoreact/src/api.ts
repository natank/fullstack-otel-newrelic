import { trace, SpanStatusCode } from "@opentelemetry/api";
import axios from "axios";
const tracer = trace.getTracer("todoreact");

export type Todo = string;
export interface TodoResponse {
  todos: Todo[];
  user: {
    username: string;
  };
}
const API_BASE_URL = "http://localhost:8081";

export const fetchTodos = async (): Promise<TodoResponse> => {
  return await tracer.startActiveSpan("fetch-todos", async (span) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      } else {
        span.recordException(new Error("Unknown error occurred"));
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Unknown error occurred",
        });
      }
      throw error;
    } finally {
      span.end(); // Close the span after the operation is done
    }
  });
};
