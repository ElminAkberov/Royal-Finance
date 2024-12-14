import React from 'react'

const Success = ({ status }) => {
    return (
        <div>
            <div className={`w-full pt-1 max-md:px-3 right-0 ${status == "success" ? "top-20" : "top-[-300px]"} duration-300`}>
                <div className="flex items-center max-w-[720px] mx-auto mb-5 border bg-white border-[#37B67E] rounded-md">
                    <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#37b67e]"></div>
                    <div className="relative  mr-[8px] ml-[18px]">
                        <img src="/assets/img/check.svg" className='bg-[#37B67E] min-w-[26.67px] min-h-[26.67px] max-w-[26.67px] p-[6px] rounded-full' alt="" />
                    </div>
                    <div className="">
                        <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Успешно!</h4>
                        <p className='text-[14px] text-[#484951]'>Ваши изменения успешно сохранены.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Success