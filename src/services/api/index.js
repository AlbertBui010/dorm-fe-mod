// API Service Index - Central export for all API services
import authService from "./authService";
import employeeService from "./employeeService";
import { studentService } from "./studentService";
import { roomService } from "./roomService";
import { bedService } from "./bedService";
import donGiaDienNuocService from "./donGiaDienNuocService";
import registrationApi from "./registrationApi";
import { studentPaymentService } from "./studentPaymentService";

// Default exports
export { default as authService } from "./authService";
export { default as employeeService } from "./employeeService";
export { studentService } from "./studentService";
export { roomService } from "./roomService";
export { bedService } from "./bedService";
export { default as donGiaDienNuocService } from "./donGiaDienNuocService";
export { default as registrationApi } from "./registrationApi";
export { studentPaymentService } from "./studentPaymentService";

// Combined services object for convenience
const apiServices = {
  auth: authService,
  employee: employeeService,
  student: studentService,
  room: roomService,
  bed: bedService,
  donGiaDienNuoc: donGiaDienNuocService,
  registration: registrationApi,
  studentPayment: studentPaymentService,
};

export default apiServices;
