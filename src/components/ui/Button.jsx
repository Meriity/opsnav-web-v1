const Button = ({
  label,
  onClick,
  bg = "bg-[#00AEEF]",
  bghover = "hover:bg-sky-600",
  bgactive = "active:bg-sky-700",
  Icon, // pass image path here
  height = "h-[40px]",
  width = "w-[177px]",
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex justify-center items-center gap-2 px-5 py-2 rounded-md transition-colors ${bg} text-white ${bghover} ${bgactive} ${height} ${width}`}
    >
      {Icon && <span className="w-5 h-5"><img src={Icon} alt="" /></span>}
      <span className="font-bold">{label}</span>
    </button>
  );
};

export default Button;
