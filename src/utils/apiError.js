export const formatApiError = (error, fallback = "Something went wrong.") => {
  if (!error) return fallback;
  if (error?.name === "SyntaxError") {
    return error.message || fallback;
  }

  if (error?.__sessionBlocked || error?.message === "Session expired") {
    return "Your session has expired. Please log in again.";
  }

  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) {
    const stripped = data.replace(/<[^>]*>/g, "").trim();
    if (stripped && stripped.length < 200) return stripped;
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.issues) && data.issues.length) {
      return data.issues
        .map((issue) => (issue?.field ? `${issue.field}: ${issue.message}` : issue?.message))
        .filter(Boolean)
        .join(" | ");
    }
    if (data.message) return data.message;
    if (data.error) return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  }

  if (error.message && error.message !== "Network Error") {
    return error.message;
  }

  if (error.message === "Network Error") {
    return "Network connection error. Please check your internet connection.";
  }

  return fallback;
};
