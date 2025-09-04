module.exports = {
  info: (label, obj) => console.log(`[INFO] ${label}:`, obj),
  warn: (label, obj) => console.warn(`[WARN] ${label}:`, obj),
  error: (label, obj) => console.error(`[ERROR] ${label}:`, obj),
};
