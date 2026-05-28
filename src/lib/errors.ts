export type ActionErrorCode = "AUTH" | "VALIDATION" | "DATABASE" | "CONFLICT" | "NOT_FOUND" | "UNKNOWN";

type ErrorLike = {
  code?: string;
  message?: string;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? (error as ErrorLike) : {};
}

export function getActionErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  const next = asErrorLike(error);

  switch (next.code) {
    case "P1000":
    case "P1001":
    case "P1002":
    case "P1017":
      return "Database connection failed. Check PostgreSQL and DATABASE_URL, then try again.";
    case "P2002":
      return "A record with the same unique field already exists.";
    case "P2025":
      return "The requested record was not found.";
    default:
      break;
  }

  if (next.message?.includes("Unique constraint")) {
    return "A record with the same unique field already exists.";
  }

  if (next.message?.includes("connect") || next.message?.includes("ECONNREFUSED")) {
    return "Database connection failed. Check PostgreSQL and DATABASE_URL, then try again.";
  }

  return fallback;
}

export function getActionErrorCode(error: unknown): ActionErrorCode {
  const next = asErrorLike(error);

  if (["P1000", "P1001", "P1002", "P1017"].includes(next.code ?? "")) return "DATABASE";
  if (next.code === "P2002") return "CONFLICT";
  if (next.code === "P2025") return "NOT_FOUND";
  if (next.message?.includes("Unique constraint")) return "CONFLICT";
  if (next.message?.includes("connect") || next.message?.includes("ECONNREFUSED")) return "DATABASE";

  return "UNKNOWN";
}

export function getPageLoadErrorMessage(error: unknown) {
  return getActionErrorMessage(error, "Live data could not load. Showing fallback data where available.");
}
