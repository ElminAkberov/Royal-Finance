import React, { useContext } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { Context } from '../context/ContextProvider';

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
    const { isDarkMode } = useContext(Context)
    return (
        <div>
            <div className="pagination-buttons bg-transparent flex items-center my-4">

                <button className={`text-[#2D54DD]`} onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage)}>
                    <FaAngleLeft />
                </button>


                <input
                    type="number"
                    onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                            setCurrentPage("");
                        } else {
                            const page = Math.max(1, Math.min(totalPages, Number(value)));
                            setCurrentPage(page);
                        }
                    }}
                    onBlur={() => {
                        if (currentPage === "") setCurrentPage(1);
                    }}
                    value={currentPage}
                    className={`w-[40px] focus:outline-[#536cfe] border mx-2 text-center page-button rounded-md px-[12px] py-1 ${isDarkMode ? "text-[#fff]" : ""} bg-[#D9D9D91F]`}
                />


                <button className={`text-[#2D54DD]`} onClick={() => setCurrentPage(totalPages > currentPage ? currentPage + 1 : currentPage)}>
                    <FaAngleRight />
                </button>
            </div>
        </div>
    )
}

export default Pagination