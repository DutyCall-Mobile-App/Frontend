// Centralized config for API hosts. Reads from environment variables.
// For Expo/React Native, process.env is typically provided at build time or via a .env loader.
// If you use expo-constants or react-native-config, adapt accordingly.

const DEFAULT_HOST = "http://172.20.10.9:3000";
const API_PATH = "/api";

// Trim any trailing slashes for consistency
function trimSlash(s) {
  if (!s) return s;
  return s.replace(/\/+$/, "");
}

const rawHost = (
  process.env.REACT_NATIVE_APP_API_HOST ||
  process.env.API_HOST ||
  process.env.BASE_URL ||
  ""
).trim();
const host = rawHost ? trimSlash(rawHost) : DEFAULT_HOST;

const API_BASE = `${host}${API_PATH}`; // e.g. http://172.20.10.9:3000/api
const FILE_BASE = host; // e.g. http://172.20.10.9:3000

export default {
  API_BASE,
  FILE_BASE,
};
