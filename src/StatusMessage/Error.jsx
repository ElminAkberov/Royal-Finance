import React from 'react'

const Error = ({status}) => {
    return (
        <div>
            <div className={`pt-1 w-full  duration-300 max-md:mx-3 ${status == "error" ? "top-20" : "top-[-300px]"}`}>
                <div className="flex items-center mb-5 max-w-[720px] mx-auto border bg-white border-[#CE2E2E] rounded-md">
                    <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#CE2E2E] rounded-"></div>
                    <div className="relative mr-[8px] ml-[18px]">
                        <img src="/assets/img/error.svg" className=' rounded-full' alt="" />
                    </div>
                    <div className="">
                        <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Возникла ошибка.</h4>
                        <p className='text-[14px] text-[#484951]'>Что-то пошло не так. Повторите попытку позже.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Error