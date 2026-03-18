const c = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

const ts = () => new Date().toISOString();

const logger = {
  info: (...args) =>
    console.log(`${c.green}[INFO]${c.reset}  ${ts()}`, ...args),

  warn: (...args) =>
    console.warn(`${c.yellow}[WARN]${c.reset}  ${ts()}`, ...args),

  error: (...args) =>
    console.error(`${c.red}[ERROR]${c.reset} ${ts()}`, ...args),

  debug: (...args) => {
    if (process.env.NODE_ENV !== "production")
      console.log(`${c.gray}[DEBUG]${c.reset} ${ts()}`, ...args);
  },

  http: (req, res, ms) =>
    console.log(
      `${c.blue}[HTTP]${c.reset}  ${ts()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`
    ),
};

export default logger;