import React, { useContext } from 'react'
import { Context } from '../../context/ContextProvider';
const DetailsModal = ({ setDetailModal }) => {
    const { isDarkMode } = useContext(Context)

    return (
        <div>
            <div className="p-8 max-h-[85vh] overflow-y-scroll">
                <div className="">
                    <div className="mb-8">
                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Детали объявления </h3>
                        <h5 className='text-[14px] text-[#60626C]'>Подробная информация</h5>
                    </div>
                    {/* {details?.map((data, index) => ( */}
                    <div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Дата создания</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>21-04-2024 21:00</p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Трейдер</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>Трейдер</p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Доступные методы выплат </h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>
                                <div className={`flex mt-1 text-xs ${isDarkMode ? "" : "text-white"}  items-center text-center gap-1`}>
                                    <div className="selectable-text rounded-full bg-[#536DFE] p-1 px-2">
                                        Sber
                                    </div>
                                    <div className="selectable-text rounded-full bg-[#536DFE] p-1 px-2">
                                        Sber
                                    </div>
                                </div>
                            </p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Мин сумма на выплату</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>1</p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Макс сумма на выплату</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>100</p>
                        </div>
                        <div className="modal">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Направления</h5>
                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>-</p>
                        </div>
                    </div>
                    {/* ))} */}
                    <div className="flex w-full text-white justify-end">
                        <button onClick={() => setDetailModal(false)} className='bg-[#2E70F5] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailsModal