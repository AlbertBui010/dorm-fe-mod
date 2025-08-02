const RegistrationStatsCard = ({
  title,
  value,
  icon,
  bgColor = "bg-blue-500",
  textColor = "text-white",
  trend = null,
}) => {
  return (
    <div className={`${bgColor} ${textColor} p-6 rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold opacity-90">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-sm opacity-75 mt-1">{trend}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default RegistrationStatsCard;
