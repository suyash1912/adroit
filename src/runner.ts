import type { TestCase } from "./domain";

export type CaseResult = {
  passed: boolean;
  actual?: unknown;
  expected: unknown;
  error?: string;
};

function normalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(normalize).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${normalize(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function encode(value: string): string {
  return btoa(
    Array.from(new TextEncoder().encode(value), (byte) =>
      String.fromCharCode(byte),
    ).join(""),
  );
}

export function runCases(
  code: string,
  tests: TestCase[],
  timeoutMs = 1800,
): Promise<CaseResult[]> {
  return new Promise((resolve, reject) => {
    if (code.length > 50000) {
      reject(new Error("Code is limited to 50,000 characters per run."));
      return;
    }
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("title", "Isolated code runner");
    frame.style.cssText =
      "position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0";
    const token = crypto.randomUUID();
    const workerSource = `
      function bounded(value, seen = new WeakSet(), depth = 0) {
        if (depth > 8) return "[Depth limit]";
        if (value === null || typeof value === "boolean") return value;
        if (typeof value === "number") return Number.isFinite(value) ? value : null;
        if (typeof value === "string") return value.slice(0, 10000);
        if (typeof value === "undefined") return null;
        if (typeof value !== "object") return String(value).slice(0, 1000);
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
        if (Array.isArray(value)) {
          const output = [];
          for (let i = 0; i < Math.min(value.length, 100); i++) output.push(bounded(value[i], seen, depth + 1));
          if (value.length > 100) output.push("[Truncated]");
          return output;
        }
        const output = {};
        let count = 0;
        for (const key in value) {
          if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
          if (count >= 100) { output.__truncated__ = true; break; }
          try { output[key.slice(0, 100)] = bounded(value[key], seen, depth + 1); }
          catch (error) { output[key.slice(0, 100)] = "[Unreadable value]"; }
          count++;
        }
        return output;
      }
      self.onmessage = ({ data }) => {
        const { token, cases, source } = data;
        const results = [];
        try {
          const solve = new Function(source + ";\\nreturn solve;")();
          if (typeof solve !== "function") throw new Error("Define a function named solve(input).");
          for (const test of cases) {
            try { results.push({ actual: bounded(solve(test.input)), expected: test.expected }); }
            catch (error) { results.push({ error: String(error && error.message || error).slice(0, 500), expected: test.expected }); }
          }
          self.postMessage({ token, results });
        } catch (error) {
          self.postMessage({ token, error: String(error && error.message || error).slice(0, 500) });
        }
      };
    `;
    const script = `
      const token = ${JSON.stringify(token)};
      const cases = ${JSON.stringify(tests)};
      const source = decodeURIComponent(escape(atob(${JSON.stringify(encode(code))})));
      try {
        const workerUrl = URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}], { type: "text/javascript" }));
        const worker = new Worker(workerUrl);
        URL.revokeObjectURL(workerUrl);
        worker.onmessage = event => { parent.postMessage(event.data, "*"); worker.terminate(); };
        worker.onerror = event => { parent.postMessage({ token, error: String(event.message || "Worker failed") }, "*"); worker.terminate(); };
        worker.postMessage({ token, cases, source });
      } catch (error) {
        parent.postMessage({ token, error: String(error && error.message || error) }, "*");
      }
    `;
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'"><script>${script}<\/script>`;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      frame.remove();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.token !== token)
        return;
      cleanup();
      if (event.data.error)
        reject(new Error(String(event.data.error).slice(0, 500)));
      else
        resolve(
          (
            event.data.results as Array<{
              actual?: unknown;
              expected: unknown;
              error?: string;
            }>
          ).map((item) => ({
            ...item,
            passed:
              !item.error &&
              normalize(item.actual) === normalize(item.expected),
            error: item.error?.slice(0, 500),
          })),
        );
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          `Execution stopped after ${timeoutMs} ms. Check for an infinite loop or expensive operation.`,
        ),
      );
    }, timeoutMs);
    window.addEventListener("message", onMessage);
    document.body.append(frame);
  });
}
