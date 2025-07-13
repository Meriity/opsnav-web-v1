export default function Pagination() {
    
    //Not implemented any where, need to work and make as reusable component.
    return (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mt-4 ml-28">
            <nav aria-label="Table pagination">
                <ul className="inline-flex text-sm">
                    <li className="mx-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center px-3 h-8 rounded-lg border ${currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            {'<'} Prev
                        </button>
                    </li>

                    {renderPageNumbers().map((page, index) => (
                        <li key={index} className="mx-1">
                            {page === '...' ? (
                                <span className="px-3 h-8 flex items-center justify-center text-gray-500">...</span>
                            ) : (
                                <button
                                    onClick={() => handlePageChange(page)}
                                    className={`flex items-center justify-center px-3 h-8 rounded-lg border ${currentPage === page
                                        ? 'bg-sky-500 text-white border-sky-500'
                                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                                        }`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}

                    <li className="mx-1">
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center px-3 h-8 rounded-lg border ${currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            Next {'>'}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}