// 1. Read the base URL from Vite's environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// 2. Add a safety check to prevent running without the variable set
if (!apiUrl) {
  throw new Error("VITE_API_URL is not defined. Please check your .env file.");
}

// 3. Export the derived endpoints for your Apollo client
export const endpoint = apiUrl;
export const graphqlEndpoint = `${apiUrl}/graphql`;

// 4. Since EnvironmentLabel.tsx also checks the environment,
//    we can centralize that logic here too.
export const isDevelopment = import.meta.env.VITE_APP_ENV === "development";
const maxUploadSize = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB);
export const MAX_UPLOAD_MB = isNaN(maxUploadSize) ? 10 : maxUploadSize;

const maxUploadFiles = Number(import.meta.env.VITE_MAX_UPLOAD_FILES);
export const MAX_UPLOAD_FILES = isNaN(maxUploadFiles) ? 5 : maxUploadFiles;
