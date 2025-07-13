// API Service Index - Central export for all API services
import authService from "./authService";
import employeeService from "./employeeService";
import { studentService } from "./studentService";
import { roomService } from "./roomService";
import { bedService } from "./bedService";

// Default exports
export { default as authService } from "./authService";
export { default as employeeService } from "./employeeService";
export { studentService } from "./studentService";
export { roomService } from "./roomService";
export { bedService } from "./bedService";

// Combined services object for convenience
const apiServices = {
  auth: authService,
  employee: employeeService,
  student: studentService,
  room: roomService,
  bed: bedService,
};

export default apiServices;
