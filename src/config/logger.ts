export type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private log(level: LogLevel, message: string, data?: object) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }

  debug(message: string, data?: object) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }

  info(message: string, data?: object) {
    this.log("info", message, data);
  }

  warn(message: string, data?: object) {
    this.log("warn", message, data);
  }

  error(message: string, data?: object) {
    this.log("error", message, data);
  }
}

export const logger = new Logger();
