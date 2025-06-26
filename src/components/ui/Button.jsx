const Button = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex justify-center items-center w-full px-5 py-2 rounded-md transition-colors bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700"
    >
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default Button;

