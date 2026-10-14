export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
let csrf = "";
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  try {
    if (method !== "GET" && !csrf) {
      const r = await fetch("/api/csrf", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!r.ok)
        throw new ApiError(
          "Could not establish a secure session. Please try again.",
          r.status,
        );
      csrf = (await r.json()).token;
    }
    const r = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(method !== "GET" ? { "X-CSRF-TOKEN": csrf } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      if (r.status === 419 || r.status === 401) csrf = "";
      throw new ApiError(
        r.status === 419
          ? "Your secure session expired. Please try again; your form is still here."
          : data.errors
            ? Object.values(data.errors).flat().join(" ")
            : data.message ||
              (r.status === 429
                ? "Too many attempts. Please wait a minute and try again."
                : "The request could not be completed. Please try again."),
        r.status,
      );
    }
    if (
      path === "/login" ||
      path === "/register" ||
      path === "/logout" ||
      path === "/reset-password"
    )
      csrf = "";
    return r.status === 204 ? (undefined as T) : await r.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "Unable to connect. Check your connection and try again. Your form has been kept open.",
      0,
    );
  }
}
export async function downloadExport() {
  const r = await fetch("/api/export", {
    credentials: "same-origin",
    headers: { Accept: "text/csv" },
  });
  if (!r.ok)
    throw new Error(
      "Export unavailable. Check your session or wait a minute before retrying.",
    );
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = "almanac-records.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
