// Utility functions for electricity and water price calculations

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

export const calculateElectricityCost = (kWh, pricePerKWh) => {
  return kWh * pricePerKWh;
};

export const calculateWaterCost = (m3, pricePerM3) => {
  return m3 * pricePerM3;
};

export const calculateTotalUtilityCost = (electricityKWh, waterM3, donGia) => {
  if (!donGia) return 0;

  const electricityCost = calculateElectricityCost(
    electricityKWh,
    donGia.GiaDienPerKWh
  );
  const waterCost = calculateWaterCost(waterM3, donGia.GiaNuocPerM3);

  return electricityCost + waterCost;
};

export const isDateInRange = (date, startDate, endDate = null) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  return checkDate >= start && checkDate <= end;
};

export const getCurrentDateString = () => {
  return new Date().toISOString().split("T")[0];
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const formatDateForInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export const formatDateForDisplay = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};
