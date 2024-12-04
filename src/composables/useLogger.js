const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const minLogLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase() || "info";

const levelControls = {
  debug: import.meta.env.VITE_LOG_DEBUG === "true",
  info: import.meta.env.VITE_LOG_INFO === "true",
  warn: import.meta.env.VITE_LOG_WARN === "true",
  error: import.meta.env.VITE_LOG_ERROR === "true",
};

const LOG_STYLES = {
  debug: "color: #9B9B9B", // Gray
  info: "color: #0066FF", // Blue
  warn: "color: #FF9900", // Orange
  error: "color: #FF0000", // Red
};

const writeToStorage = (level, message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    const logs = JSON.parse(localStorage.getItem("app_logs") || "[]");

    logs.push(logEntry);

    if (logs.length > 1000) {
      logs.shift();
    }

    localStorage.setItem("app_logs", JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to write to log storage:", error);
  }
};

export function useLogger() {
  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString();
  };

  const shouldLog = (level) => {
    return levelControls[level] && LOG_LEVELS[level] >= LOG_LEVELS[minLogLevel];
  };

  const formatLog = (level, args) => {
    const timestamp = getTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return [`%c${prefix}`, LOG_STYLES[level], ...args];
  };

  const debug = (...args) => {
    console.log("shouldlog", shouldLog("debug"));
    if (shouldLog("debug")) {
      console.log(...formatLog("debug", args));
      writeToStorage("debug", args.join(" "));
    }
  };

  const info = (...args) => {
    if (shouldLog("info")) {
      console.info(...formatLog("info", args));
      writeToStorage("info", args.join(" "));
    }
  };

  const warn = (...args) => {
    if (shouldLog("warn")) {
      console.warn(...formatLog("warn", args));
      writeToStorage("warn", args.join(" "));
    }
  };

  const error = (...args) => {
    if (shouldLog("error")) {
      console.error(...formatLog("error", args));
      writeToStorage("error", args.join(" "));
    }
  };

  const getLogConfig = () => {
    return {
      minLogLevel,
      enabledLevels: Object.entries(levelControls)
        .filter(([_, enabled]) => enabled)
        .map(([level]) => level),
      allLevels: Object.keys(LOG_LEVELS),
    };
  };

  const getLogs = () => {
    try {
      return JSON.parse(localStorage.getItem("app_logs") || "[]");
    } catch (error) {
      console.error("Failed to retrieve logs:", error);
      return [];
    }
  };

  const clearLogs = () => {
    try {
      localStorage.removeItem("app_logs");
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  return {
    debug,
    info,
    warn,
    error,
    getLogConfig,
    getLogs,
    clearLogs,
  };
}
