import React, { useContext } from 'react'
import { Context } from '../../context/ContextProvider'

const ConverterModal = ({ setConverterModal, converterModal }) => {
    let { isDarkMode } = useContext(Context)
    return (
        <div>
            <div className="p-8 max-h-[85vh] overflow-y-scroll">
                <div className="">
                    <div className="mb-8">
                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Конвертировать </h3>
                        <svg onClick={() => setConverterModal(!converterModal)} className='absolute right-8 top-8 cursor-pointer' width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" fill={`${isDarkMode ? "#fff" : "#222222"} `} />
                        </svg>
                        <h5 className='text-[14px] text-[#60626C]'>Заполните необходимые поля</h5>
                    </div>
                    <div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Баланс</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>-10</p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Минимальный баланс</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>1000</p>
                        </div>
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Метод</h5>
                            <input style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                        </div>
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Сумма вывода</h5>
                            <input style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                        </div>
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>OТП Код</h5>
                            <input style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} focus:outline-[#536cfe] blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 rounded-[4px]`} />
                        </div>

                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Фиксированная ставка</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>200</p>
                        </div>
                    </div>
                    <div className="flex w-full text-white justify-end">
                        <button onClick={() => setConverterModal(false)} className='bg-[#536DFE] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                            Конвертировать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConverterModal