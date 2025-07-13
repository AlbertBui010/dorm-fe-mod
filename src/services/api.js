// Legacy API service file - now using modular services
// Import all services from the new organized structure
export {
  authService,
  employeeService,
  studentService,
  roomService,
  bedService,
  donGiaDienNuocService,
  registrationApi,
} from "./api/index";

// Export the api instance for direct use
export { default as api } from "../utils/api";
