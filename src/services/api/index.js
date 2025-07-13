// API Service Index - Central export for all API services
import authService from "./authService";
import employeeService from "./employeeService";
import studentService from "./studentService";
import roomService from "./roomService";

// Default exports
export { default as authService } from "./authService";
export { default as employeeService } from "./employeeService";
export { default as studentService } from "./studentService";
export { default as roomService } from "./roomService";

// Combined services object for convenience
const apiServices = {
  auth: authService,
  employee: employeeService,
  student: studentService,
  room: roomService,
};

export default apiServices;
