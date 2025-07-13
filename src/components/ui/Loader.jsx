export default function Loader({ height = 60, text }) {
    return (
        <div className={`flex items-center justify-center min-h-[${height}vh] mt-25`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00AEEF]" />
            <span className="ml-4 text-lg font-medium text-[#00AEEF]">
                {text}
            </span>
        </div>
    )
}