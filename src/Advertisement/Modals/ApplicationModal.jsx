import React, { useContext, useState } from 'react'
import { Context } from '../../context/ContextProvider';
import Success from '../../StatusMessage/Success';
import Error from '../../StatusMessage/Error';

const ApplicationModal = ({ setModal, modal }) => {
    let { isDarkMode } = useContext(Context)
    const [status, setStatus] = useState(null)
    const [application, setApplication] = useState("")


    const handleApplication = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://dev.royal-pay.org/api/v1/applications", {
                method: "POST",
                headers: {
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    allowed_transfer_methods: [setApplication["allowedMethod"]],
                    min_payouts_amount: setApplication["minAmount"],
                    max_payouts_amount: setApplication["maxAmount"]
                })
            });
            if (res.status === 401) {
                const refreshResponse = await fetch("https://dev.royal-pay.org/api/v1/auth/refresh/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refresh: localStorage.getItem("refresh"),
                    }),
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    localStorage.setItem("access", refreshData.access);
                    return handleApplication(e);
                } else {
                    navigate("/login");
                }
            } else if (res.status == 400) {
                setStatus("error");
            } else {
                setStatus("success");
            }
        } catch (error) {
            console.warn(error)
            setStatus("error");
        }
    };
    return (
        <div>
            <div className="p-8">
                <form onSubmit={handleApplication}>
                    <div className="mb-8">
                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Создать объявление</h3>
                        <svg onClick={() => { setModal(!modal); setApplication(""); setStatus(null) }} className='absolute right-8 top-8 cursor-pointer' width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" fill={`${isDarkMode ? "#fff" : "#222222"} `} />
                        </svg>
                        <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
                    </div>
                    {status == "error" &&
                        <Error status={status} />
                    }
                    {status == "success" &&
                        <Success status={status} />
                    }
                    <div className="modal_payout blur-0  ">
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Доступные методы выплат</h5>
                            <select onChange={(e) => { setApplication((prevApp) => ({ ...prevApp, "allowedMethod": e.target.value })) }} value={application["allowedMethod"] || ""} style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-2 outline-none rounded-[4px]`} >
                                <option defaultValue={"Выбрать"} value="">Выбрать</option>
                                <option defaultValue={"Выбрать"}>SBER</option>
                            </select>
                        </div>
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Мин сумма на выплату</h5>
                            <input onChange={(e) => { setApplication((prevApp) => ({ ...prevApp, "minAmount": e.target.value })) }} value={application["minAmount"] || ""} style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                        </div>
                        <div className="modal_payout ">
                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Макс сумма на выплату</h5>
                            <input onChange={(e) => { setApplication((prevApp) => ({ ...prevApp, "maxAmount": e.target.value })) }} value={application["maxAmount"] || ""} style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='0' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                        </div>
                        <div className={`flex justify-end mt-2 text-white`}>
                            <button type='submit' className='bg-[#2E70F5] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                Создать
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ApplicationModal