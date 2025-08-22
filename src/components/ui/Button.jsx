import clsx from "clsx";

const Button = ({
  label,
  onClick,
  bg = "bg-[#00AEEF]", // Default background
  bghover = "hover:bg-sky-600",
  bgactive = "active:bg-sky-700",
  Icon1,
  Icon2,
  height = "h-[40px]",
  width = "w-auto", // Defaults to flexible width
  disabled = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex justify-center items-center gap-2 px-5 py-2 rounded-md transition-colors text-white cursor-pointer",
        bg,
        bghover,
        bgactive,
        height,
        width,
        "whitespace-nowrap",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {Icon1 && (
        <span className="w-5 shrink-0">
          <img src={Icon1} alt="" />
        </span>
      )}
      <span className="font-bold text-[16px]">{label}</span>
      {Icon2 && (
        <span className="w-5 shrink-0">
          <img src={Icon2} alt="" />
        </span>
      )}
    </button>
  );
};

export default Button;
