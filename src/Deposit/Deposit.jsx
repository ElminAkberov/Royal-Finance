import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../context/ContextProvider'
import { NavLink, useNavigate } from 'react-router-dom'
import Dark from '../Dark'
import { LuCopy } from 'react-icons/lu'

const Deposit = () => {
  const [modalUsdt, setModalUsdt] = useState(false)
  const [modalCash, setModalCash] = useState(false)
  const [method, setMethod] = useState("")
  const [amount, setAmount] = useState("")
  const [hash, setHash] = useState("")
  let [copy, setCopy] = useState(false)
  let [dropDown, setDropDown] = useState(false)
  let { isDarkMode, toggleDarkMode } = useContext(Context)
  let [open, setOpen] = useState(true)
  let [error, setError] = useState(false)

  const [navBtn, setNavBtn] = useState(false)
  const handleCopy = (e) => {
    const textToCopy = e.currentTarget.nextSibling.innerText;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopy(true);
        setTimeout(() => {
          setCopy(false)
        }, 1500);
      })
      .catch(err => {
        setCopy(false);
        console.error('Metin kopyalanırken bir hata oluştu:', err);
      });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("https://dev.royal-pay.org/api/v1/internal/refills/", {
        method: "POST",
        headers: {
          "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hash: hash,
          method: method,
          amount: amount
        })
      }).then(res => res.json()).then(res => { if (res.code == "token_not_valid") { setError(true) } else { setError(false) } });
    } catch (error) {
      console.error("Error:", error);
      setError(true)
    }
  };


  return (
    <div onClick={() => { dropDown ? setDropDown(!dropDown) : ""; navBtn ? setNavBtn(!navBtn) : "" }} className='flex '>
      <div className={`max-md:hidden`}>
        <div className={`${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5] border"}  min-h-[100vh] h-full z-20  relative `}>
          <h3 className={`py-[20px] flex items-center justify-start ml-[8px] font-medium px-[8px] ${isDarkMode ? "text-white" : "text-black"}`}>Лого</h3>
          <div className={` ${!open && "min-w-[263px]"} `}>
            <div className="">
              {localStorage.getItem("role") !== "trader" &&
                <NavLink to={"/dash"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" fill="#8D8F9B" />
                  </svg>
                  <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px]  font-medium ml-[8px] `}>Управления депозитами</p>
                </NavLink>
              }
              <NavLink to={"/deposit"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] bg-[#2D54DD4D]">
                <svg width="24" height="24" viewBox="0 0 19 24" className='fill-[#2D54DD]' xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" />
                </svg>
                <p className={`${open && "hidden"}  text-[#2D54DD] text-[14px] font-medium ml-[8px]`}>Пополнение депозита</p>

              </NavLink>
              <NavLink to={"/payout"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.3633 19.6364H18.5452C16.1391 19.6364 14.1816 17.6789 14.1816 15.2728C14.1816 12.8668 16.1391 10.9093 18.5452 10.9093H22.3633C22.4349 10.9093 22.5059 10.8953 22.5721 10.8679C22.6383 10.8405 22.6985 10.8003 22.7491 10.7496C22.7998 10.699 22.8399 10.6388 22.8673 10.5726C22.8947 10.5064 22.9088 10.4355 22.9088 10.3638V8.7275C22.9088 7.5837 22.0216 6.6535 20.9006 6.56329L17.7681 1.09179C17.4778 0.585754 17.009 0.224073 16.4481 0.0738875C15.8899 -0.0752748 15.3061 0.00306481 14.8064 0.293873L4.06783 6.5457H2.1818C0.978529 6.5457 0 7.52418 0 8.7275V21.8182C0 23.0215 0.978478 24 2.1818 24H20.727C21.9302 24 22.9088 23.0215 22.9088 21.8182V20.1819C22.9088 20.1102 22.8947 20.0393 22.8673 19.9731C22.8399 19.9069 22.7998 19.8467 22.7491 19.7961C22.6985 19.7454 22.6383 19.7052 22.5721 19.6778C22.5059 19.6504 22.4349 19.6363 22.3633 19.6364ZM18.4445 4.4698L19.633 6.5457H14.8789L18.4445 4.4698ZM6.23598 6.5457L15.3556 1.23666C15.6022 1.0923 15.8904 1.05395 16.1658 1.12748C16.4444 1.20204 16.6766 1.38209 16.821 1.63403L16.8221 1.63603L8.38935 6.5457H6.23598Z" fill="#8D8F9B" />
                  <path d="M22.3642 12H18.5461C16.7414 12 15.2734 13.468 15.2734 15.2727C15.2734 17.0773 16.7414 18.5453 18.5461 18.5453H22.3642C23.2666 18.5453 24.0006 17.8113 24.0006 16.909V13.6363C24.0006 12.734 23.2666 12 22.3642 12ZM18.5461 16.3635C17.9448 16.3635 17.4552 15.874 17.4552 15.2727C17.4552 14.6713 17.9448 14.1818 18.5461 14.1818C19.1475 14.1818 19.637 14.6713 19.637 15.2727C19.637 15.874 19.1475 16.3635 18.5461 16.3635Z" fill="#8D8F9B" />
                </svg>
                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Выплаты</p>
              </NavLink>
              <div className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_289_6049)">
                    <path d="M19.2656 0.414062V4.68991H23.5411L19.2656 0.414062Z" fill="#8D8F9B" />
                    <path d="M18.5625 6.09375C18.1742 6.09375 17.8594 5.77894 17.8594 5.39062V0H7.78125C6.61814 0 5.67188 0.946266 5.67188 2.10938V9.9698C5.90353 9.9488 6.13795 9.9375 6.375 9.9375C8.77163 9.9375 10.917 11.0332 12.3368 12.75H19.9688C20.3571 12.75 20.6719 13.0648 20.6719 13.4531C20.6719 13.8414 20.3571 14.1562 19.9688 14.1562H13.2632C13.7124 15.0328 13.9888 15.9877 14.0771 16.9688H19.9688C20.3571 16.9688 20.6719 17.2836 20.6719 17.6719C20.6719 18.0602 20.3571 18.375 19.9688 18.375H14.0771C13.8668 20.6971 12.6261 22.7262 10.8168 24H21.8438C23.0069 24 23.9531 23.0537 23.9531 21.8906V6.09375H18.5625ZM19.9688 9.9375H9.65625C9.26794 9.9375 8.95312 9.62269 8.95312 9.23438C8.95312 8.84606 9.26794 8.53125 9.65625 8.53125H19.9688C20.3571 8.53125 20.6719 8.84606 20.6719 9.23438C20.6719 9.62269 20.3571 9.9375 19.9688 9.9375Z" fill="#8D8F9B" />
                    <path d="M6.375 11.3438C2.88567 11.3438 0.046875 14.1825 0.046875 17.6719C0.046875 21.1612 2.88567 24 6.375 24C9.86433 24 12.7031 21.1612 12.7031 17.6719C12.7031 14.1825 9.86433 11.3438 6.375 11.3438ZM8.25 18.375H6.375C5.98669 18.375 5.67188 18.0602 5.67188 17.6719V14.8594C5.67188 14.4711 5.98669 14.1562 6.375 14.1562C6.76331 14.1562 7.07812 14.4711 7.07812 14.8594V16.9688H8.25C8.63831 16.9688 8.95312 17.2836 8.95312 17.6719C8.95312 18.0602 8.63831 18.375 8.25 18.375Z" fill="#8D8F9B" />
                  </g>
                  <defs>
                    <clipPath id="clip0_289_6049">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Саппорт Транзакций</p>
              </div>
            </div>
          </div>
          <div onClick={() => { setOpen(true) }} className={`bg-[#1773F1] cursor-pointer absolute top-2 right-[-19px]  h-[45px] ${open ? "hidden" : "flex justify-center items-center"}  rounded-r-[4px] w-[19px]`}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.40625 2.31512L2.82625 7.35924L7.40625 12.4034L5.99625 13.9529L-0.00375366 7.35924L5.99625 0.765625L7.40625 2.31512Z" fill="white" />
            </svg>
          </div>
          {/* open */}
          <div onClick={() => { setOpen(false) }} className={`bg-[#1773F1] cursor-pointer absolute top-2 right-[-19px] ${!open ? "hidden" : "flex justify-center items-center"}  h-[45px]  rounded-r-[4px] w-[19px]`}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.93492e-06 10.59L4.58 6L3.93492e-06 1.41L1.41 0L7.41 6L1.41 12L3.93492e-06 10.59Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`flex w-full md:justify-end max-md:px-4 ${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5]"} absolute right-0 pr-[16px] py-2 items-center `}>
        <div className="flex max-md:w-full items-center justify-between">
          <div className="mr-[16px] max-md:hidden">
            <h4 className={`text-[14px] font-normal ${!isDarkMode ? "text-[#18181B]" : "text-[#E7E7E7]"} capitalize `}>{localStorage.getItem("username").split("_").join(' ')}</h4>
            <p className='text-[14px] font-normal text-[#60626C]'>{localStorage.getItem("role") == "admin" ? "Админ" : localStorage.getItem("role") == "merchant" ? "Мерчант" : "Трейдер"}</p>
          </div>
          <div className="flex items-center  cursor-pointer justify-between">
            {/* profile */}
            <div className='max-md:flex items-center justify-between'>
              <div onClick={() => setDropDown(!dropDown)} className="bg-[#4CAF50] uppercase rounded-[100px] text-white w-[48px] h-[48px] flex items-center justify-center">
                {localStorage.getItem("username").split("_")[0][0]}
                {localStorage.getItem("username").split("_")[1][0]}
              </div>
            </div>
            <div onClick={() => setDropDown(!dropDown)} className="cursor-pointer ">
              <svg width="16" height="10" viewBox="0 0 12 6" fill="none" className='ml-2 my-4' xmlns="http://www.w3.org/2000/svg">
                <path d="M5.57143 6C5.39315 6 5.21485 5.93469 5.07905 5.80469L0.204221 1.13817C-0.0680735 0.877514 -0.0680735 0.456152 0.204221 0.195494C0.476514 -0.0651646 0.916685 -0.0651646 1.18898 0.195494L5.57143 4.39068L9.95388 0.195494C10.2262 -0.0651646 10.6663 -0.0651646 10.9386 0.195494C11.2109 0.456152 11.2109 0.877514 10.9386 1.13817L6.06381 5.80469C5.92801 5.93469 5.74971 6 5.57143 6Z" fill="#60626C" />
              </svg>
            </div>
          </div>
          {/* hamburger button */}
          {
            !navBtn ?
              <div onClick={() => setNavBtn(!navBtn)} className="md:hidden">
                <svg width="18" height="12" viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12H17C17.55 12 18 11.55 18 11C18 10.45 17.55 10 17 10H1C0.45 10 0 10.45 0 11C0 11.55 0.45 12 1 12ZM1 7H17C17.55 7 18 6.55 18 6C18 5.45 17.55 5 17 5H1C0.45 5 0 5.45 0 6C0 6.55 0.45 7 1 7ZM0 1C0 1.55 0.45 2 1 2H17C17.55 2 18 1.55 18 1C18 0.45 17.55 0 17 0H1C0.45 0 0 0.45 0 1Z" fill={`${isDarkMode ? "#fff" : "#272727"}`} />
                </svg>
              </div>
              :
              <div onClick={() => setNavBtn(!navBtn)} className="md:hidden">
                <svg width="14" height="15" viewBox="0 0 14 15" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" fill={`${isDarkMode ? "#fff" : "#272727"}`} />
                </svg>
              </div>
          }
          {/* darkmode */}
          <div style={{ boxShadow: "0px 4px 12px 1px #0000001A" }} className={` w-full absolute text-[14px] font-normal z-50 md:w-[250px] p-4 ${isDarkMode ? "bg-[#1F1F1F] text-[#E7E7E7]" : "bg-white"} right-0 md:right-2 top-16 rounded-[12px] h-[84px] duration-300 ${dropDown ? "opacity-100" : "opacity-0 invisible"}  `}>
            <div className="flex mb-[12px] justify-between">
              <h4>Тема</h4>
              <Dark />
            </div>
            <NavLink to={"/login"} onClick={() => { localStorage.removeItem("access"); localStorage.removeItem("refresh"); localStorage.removeItem("username"); localStorage.removeItem("role") }}>Выйти</NavLink>
          </div>
          {/* links */}
          <div className={` w-full absolute text-[14px] font-normal z-50 p-4 ${isDarkMode ? "bg-[#1F1F1F] text-[#E7E7E7]" : "bg-white shadow-xl"} right-0 top-16 rounded-[12px]  duration-300 ${navBtn ? "opacity-100" : "opacity-0 invisible"}  `}>
            {localStorage.getItem("role") !== "trader" &&
              <NavLink to={"/dash"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px]  ">
                <svg width="24" height="24" className='fill-[#8D8F9B]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" />
                </svg>
                <p className={` text-[#BFC0C9] text-[14px]  font-medium ml-[8px] `}>Управления депозитами</p>
              </NavLink>
            }
            <NavLink to={"/deposit"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px]  bg-[#2D54DD4D]">
              <svg width="24" height="24" viewBox="0 0 19 24" className='fill-[#2D54DD]' xmlns="http://www.w3.org/2000/svg">
                <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" />
              </svg>
              <p className={` text-[#2D54DD] text-[14px] font-medium ml-[8px]`}>Пополнение депозита</p>
            </NavLink>
            <NavLink to={"/payout"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px]  ">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.3633 19.6364H18.5452C16.1391 19.6364 14.1816 17.6789 14.1816 15.2728C14.1816 12.8668 16.1391 10.9093 18.5452 10.9093H22.3633C22.4349 10.9093 22.5059 10.8953 22.5721 10.8679C22.6383 10.8405 22.6985 10.8003 22.7491 10.7496C22.7998 10.699 22.8399 10.6388 22.8673 10.5726C22.8947 10.5064 22.9088 10.4355 22.9088 10.3638V8.7275C22.9088 7.5837 22.0216 6.6535 20.9006 6.56329L17.7681 1.09179C17.4778 0.585754 17.009 0.224073 16.4481 0.0738875C15.8899 -0.0752748 15.3061 0.00306481 14.8064 0.293873L4.06783 6.5457H2.1818C0.978529 6.5457 0 7.52418 0 8.7275V21.8182C0 23.0215 0.978478 24 2.1818 24H20.727C21.9302 24 22.9088 23.0215 22.9088 21.8182V20.1819C22.9088 20.1102 22.8947 20.0393 22.8673 19.9731C22.8399 19.9069 22.7998 19.8467 22.7491 19.7961C22.6985 19.7454 22.6383 19.7052 22.5721 19.6778C22.5059 19.6504 22.4349 19.6363 22.3633 19.6364ZM18.4445 4.4698L19.633 6.5457H14.8789L18.4445 4.4698ZM6.23598 6.5457L15.3556 1.23666C15.6022 1.0923 15.8904 1.05395 16.1658 1.12748C16.4444 1.20204 16.6766 1.38209 16.821 1.63403L16.8221 1.63603L8.38935 6.5457H6.23598Z" fill="#8D8F9B" />
                <path d="M22.3642 12H18.5461C16.7414 12 15.2734 13.468 15.2734 15.2727C15.2734 17.0773 16.7414 18.5453 18.5461 18.5453H22.3642C23.2666 18.5453 24.0006 17.8113 24.0006 16.909V13.6363C24.0006 12.734 23.2666 12 22.3642 12ZM18.5461 16.3635C17.9448 16.3635 17.4552 15.874 17.4552 15.2727C17.4552 14.6713 17.9448 14.1818 18.5461 14.1818C19.1475 14.1818 19.637 14.6713 19.637 15.2727C19.637 15.874 19.1475 16.3635 18.5461 16.3635Z" fill="#8D8F9B" />
              </svg>
              <p className={`text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Выплаты</p>
            </NavLink>
            <div className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px]  ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_289_6049)">
                  <path d="M19.2656 0.414062V4.68991H23.5411L19.2656 0.414062Z" fill="#8D8F9B" />
                  <path d="M18.5625 6.09375C18.1742 6.09375 17.8594 5.77894 17.8594 5.39062V0H7.78125C6.61814 0 5.67188 0.946266 5.67188 2.10938V9.9698C5.90353 9.9488 6.13795 9.9375 6.375 9.9375C8.77163 9.9375 10.917 11.0332 12.3368 12.75H19.9688C20.3571 12.75 20.6719 13.0648 20.6719 13.4531C20.6719 13.8414 20.3571 14.1562 19.9688 14.1562H13.2632C13.7124 15.0328 13.9888 15.9877 14.0771 16.9688H19.9688C20.3571 16.9688 20.6719 17.2836 20.6719 17.6719C20.6719 18.0602 20.3571 18.375 19.9688 18.375H14.0771C13.8668 20.6971 12.6261 22.7262 10.8168 24H21.8438C23.0069 24 23.9531 23.0537 23.9531 21.8906V6.09375H18.5625ZM19.9688 9.9375H9.65625C9.26794 9.9375 8.95312 9.62269 8.95312 9.23438C8.95312 8.84606 9.26794 8.53125 9.65625 8.53125H19.9688C20.3571 8.53125 20.6719 8.84606 20.6719 9.23438C20.6719 9.62269 20.3571 9.9375 19.9688 9.9375Z" fill="#8D8F9B" />
                  <path d="M6.375 11.3438C2.88567 11.3438 0.046875 14.1825 0.046875 17.6719C0.046875 21.1612 2.88567 24 6.375 24C9.86433 24 12.7031 21.1612 12.7031 17.6719C12.7031 14.1825 9.86433 11.3438 6.375 11.3438ZM8.25 18.375H6.375C5.98669 18.375 5.67188 18.0602 5.67188 17.6719V14.8594C5.67188 14.4711 5.98669 14.1562 6.375 14.1562C6.76331 14.1562 7.07812 14.4711 7.07812 14.8594V16.9688H8.25C8.63831 16.9688 8.95312 17.2836 8.95312 17.6719C8.95312 18.0602 8.63831 18.375 8.25 18.375Z" fill="#8D8F9B" />
                </g>
                <defs>
                  <clipPath id="clip0_289_6049">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p className={`text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Саппорт Транзакций</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`w-full ${isDarkMode ? "bg-[#000]" : "bg-[#E9EBF7]"}`}>
        <div className={`pt-[129px] px-[68px] max-[300px]:px-[35px] `}>
          <h3 className={`font-semibold  max-[1100px]:text-center text-[24px] mb-[26px]  ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Пополнение депозита</h3>
          <div className="cards flex flex-wrap  gap-8  max-[1100px]:justify-center duration-300">
            <div onClick={() => { setModalUsdt(true); setMethod('USDT') }} className={`card_1 cursor-pointer   p-8 ${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"}  rounded-2xl`}>
              <div className='px-[64px] max-[300px]:px-[35px] max-[300px]:py-[35px] py-[61px] flex items-center justify-center bg-[#DAE2FF]'>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58.083 44.625C54.6455 44.625 51.7236 43.4219 49.3174 41.0156C46.9111 38.6094 45.708 35.6875 45.708 32.25C45.708 28.8125 46.9111 25.8906 49.3174 23.4844C51.7236 21.0781 54.6455 19.875 58.083 19.875C61.5205 19.875 64.4424 21.0781 66.8486 23.4844C69.2549 25.8906 70.458 28.8125 70.458 32.25C70.458 35.6875 69.2549 38.6094 66.8486 41.0156C64.4424 43.4219 61.5205 44.625 58.083 44.625ZM29.208 57C26.9393 57 24.9978 56.1929 23.3835 54.5786C21.7693 52.9644 20.9608 51.0215 20.958 48.75V15.75C20.958 13.4812 21.7665 11.5397 23.3835 9.9255C25.0005 8.31125 26.942 7.50275 29.208 7.5H86.958C89.2268 7.5 91.1696 8.3085 92.7866 9.9255C94.4036 11.5425 95.2108 13.484 95.208 15.75V48.75C95.208 51.0187 94.4009 52.9616 92.7866 54.5786C91.1724 56.1956 89.2295 57.0028 86.958 57H29.208ZM37.458 48.75H78.708C78.708 46.4813 79.5165 44.5398 81.1335 42.9255C82.7505 41.3113 84.692 40.5028 86.958 40.5V24C84.6893 24 82.7478 23.1929 81.1335 21.5786C79.5193 19.9644 78.7108 18.0215 78.708 15.75H37.458C37.458 18.0188 36.6509 19.9616 35.0366 21.5786C33.4224 23.1956 31.4795 24.0028 29.208 24V40.5C31.4768 40.5 33.4196 41.3085 35.0366 42.9255C36.6536 44.5425 37.4608 46.484 37.458 48.75ZM78.708 73.5H12.708C10.4393 73.5 8.49776 72.6929 6.88351 71.0786C5.26926 69.4644 4.46076 67.5215 4.45801 65.25V24C4.45801 22.8313 4.85401 21.8523 5.64601 21.063C6.43801 20.2738 7.41701 19.8778 8.58301 19.875C9.74901 19.8722 10.7294 20.2683 11.5241 21.063C12.3189 21.8578 12.7135 22.8368 12.708 24V65.25H78.708C79.8768 65.25 80.8571 65.646 81.6491 66.438C82.4411 67.23 82.8358 68.209 82.833 69.375C82.8303 70.541 82.4343 71.5214 81.645 72.3161C80.8558 73.1109 79.8768 73.5055 78.708 73.5Z" fill="#2D54DD" />
                </svg>
              </div>
              <div className={` ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>
                <h4 className={`text-[20px] font-semibold mt-6`}>Криптовалюта</h4>
                <p className={`text-[14px] mb-[10px]`}>USDT</p>
              </div>
            </div>
            <div onClick={() => { setModalCash(true); setMethod("GARANTEX") }} className={`card_1 cursor-pointer   p-8 ${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
              <div className='px-[64px] max-[300px]:px-[35px] max-[300px]:py-[35px] py-[61px] flex items-center justify-center bg-[#DAE2FF]'>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58.083 44.625C54.6455 44.625 51.7236 43.4219 49.3174 41.0156C46.9111 38.6094 45.708 35.6875 45.708 32.25C45.708 28.8125 46.9111 25.8906 49.3174 23.4844C51.7236 21.0781 54.6455 19.875 58.083 19.875C61.5205 19.875 64.4424 21.0781 66.8486 23.4844C69.2549 25.8906 70.458 28.8125 70.458 32.25C70.458 35.6875 69.2549 38.6094 66.8486 41.0156C64.4424 43.4219 61.5205 44.625 58.083 44.625ZM29.208 57C26.9393 57 24.9978 56.1929 23.3835 54.5786C21.7693 52.9644 20.9608 51.0215 20.958 48.75V15.75C20.958 13.4812 21.7665 11.5397 23.3835 9.9255C25.0005 8.31125 26.942 7.50275 29.208 7.5H86.958C89.2268 7.5 91.1696 8.3085 92.7866 9.9255C94.4036 11.5425 95.2108 13.484 95.208 15.75V48.75C95.208 51.0187 94.4009 52.9616 92.7866 54.5786C91.1724 56.1956 89.2295 57.0028 86.958 57H29.208ZM37.458 48.75H78.708C78.708 46.4813 79.5165 44.5398 81.1335 42.9255C82.7505 41.3113 84.692 40.5028 86.958 40.5V24C84.6893 24 82.7478 23.1929 81.1335 21.5786C79.5193 19.9644 78.7108 18.0215 78.708 15.75H37.458C37.458 18.0188 36.6509 19.9616 35.0366 21.5786C33.4224 23.1956 31.4795 24.0028 29.208 24V40.5C31.4768 40.5 33.4196 41.3085 35.0366 42.9255C36.6536 44.5425 37.4608 46.484 37.458 48.75ZM78.708 73.5H12.708C10.4393 73.5 8.49776 72.6929 6.88351 71.0786C5.26926 69.4644 4.46076 67.5215 4.45801 65.25V24C4.45801 22.8313 4.85401 21.8523 5.64601 21.063C6.43801 20.2738 7.41701 19.8778 8.58301 19.875C9.74901 19.8722 10.7294 20.2683 11.5241 21.063C12.3189 21.8578 12.7135 22.8368 12.708 24V65.25H78.708C79.8768 65.25 80.8571 65.646 81.6491 66.438C82.4411 67.23 82.8358 68.209 82.833 69.375C82.8303 70.541 82.4343 71.5214 81.645 72.3161C80.8558 73.1109 79.8768 73.5055 78.708 73.5Z" fill="#2D54DD" />
                </svg>
              </div>
              <div className={` ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>
                <h4 className={`text-[20px] font-semibold mt-6`}>Гарантекс</h4>
                <p className={`text-[14px] mb-[10px]`}>Код</p>
              </div>
            </div>
            <div onClick={() => { setModalCash(true); setMethod("ABCEX") }} className={`card_1 cursor-pointer   p-8 ${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
              <div className='px-[64px] max-[300px]:px-[35px] max-[300px]:py-[35px] py-[61px] flex items-center justify-center bg-[#DAE2FF]'>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58.083 44.625C54.6455 44.625 51.7236 43.4219 49.3174 41.0156C46.9111 38.6094 45.708 35.6875 45.708 32.25C45.708 28.8125 46.9111 25.8906 49.3174 23.4844C51.7236 21.0781 54.6455 19.875 58.083 19.875C61.5205 19.875 64.4424 21.0781 66.8486 23.4844C69.2549 25.8906 70.458 28.8125 70.458 32.25C70.458 35.6875 69.2549 38.6094 66.8486 41.0156C64.4424 43.4219 61.5205 44.625 58.083 44.625ZM29.208 57C26.9393 57 24.9978 56.1929 23.3835 54.5786C21.7693 52.9644 20.9608 51.0215 20.958 48.75V15.75C20.958 13.4812 21.7665 11.5397 23.3835 9.9255C25.0005 8.31125 26.942 7.50275 29.208 7.5H86.958C89.2268 7.5 91.1696 8.3085 92.7866 9.9255C94.4036 11.5425 95.2108 13.484 95.208 15.75V48.75C95.208 51.0187 94.4009 52.9616 92.7866 54.5786C91.1724 56.1956 89.2295 57.0028 86.958 57H29.208ZM37.458 48.75H78.708C78.708 46.4813 79.5165 44.5398 81.1335 42.9255C82.7505 41.3113 84.692 40.5028 86.958 40.5V24C84.6893 24 82.7478 23.1929 81.1335 21.5786C79.5193 19.9644 78.7108 18.0215 78.708 15.75H37.458C37.458 18.0188 36.6509 19.9616 35.0366 21.5786C33.4224 23.1956 31.4795 24.0028 29.208 24V40.5C31.4768 40.5 33.4196 41.3085 35.0366 42.9255C36.6536 44.5425 37.4608 46.484 37.458 48.75ZM78.708 73.5H12.708C10.4393 73.5 8.49776 72.6929 6.88351 71.0786C5.26926 69.4644 4.46076 67.5215 4.45801 65.25V24C4.45801 22.8313 4.85401 21.8523 5.64601 21.063C6.43801 20.2738 7.41701 19.8778 8.58301 19.875C9.74901 19.8722 10.7294 20.2683 11.5241 21.063C12.3189 21.8578 12.7135 22.8368 12.708 24V65.25H78.708C79.8768 65.25 80.8571 65.646 81.6491 66.438C82.4411 67.23 82.8358 68.209 82.833 69.375C82.8303 70.541 82.4343 71.5214 81.645 72.3161C80.8558 73.1109 79.8768 73.5055 78.708 73.5Z" fill="#2D54DD" />
                </svg>
              </div>
              <div className={` ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>
                <h4 className={`text-[20px] font-semibold mt-6`}>ABC</h4>
                <p className={`text-[14px] mb-[10px]`}>Код</p>
              </div>
            </div>
            <div onClick={() => { setModalCash(true); setMethod("CASH") }} className={`card_1 cursor-pointer   p-8 ${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
              <div className='px-[64px] max-[300px]:px-[35px] max-[300px]:py-[35px] py-[61px] flex items-center justify-center bg-[#DAE2FF]'>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58.083 44.625C54.6455 44.625 51.7236 43.4219 49.3174 41.0156C46.9111 38.6094 45.708 35.6875 45.708 32.25C45.708 28.8125 46.9111 25.8906 49.3174 23.4844C51.7236 21.0781 54.6455 19.875 58.083 19.875C61.5205 19.875 64.4424 21.0781 66.8486 23.4844C69.2549 25.8906 70.458 28.8125 70.458 32.25C70.458 35.6875 69.2549 38.6094 66.8486 41.0156C64.4424 43.4219 61.5205 44.625 58.083 44.625ZM29.208 57C26.9393 57 24.9978 56.1929 23.3835 54.5786C21.7693 52.9644 20.9608 51.0215 20.958 48.75V15.75C20.958 13.4812 21.7665 11.5397 23.3835 9.9255C25.0005 8.31125 26.942 7.50275 29.208 7.5H86.958C89.2268 7.5 91.1696 8.3085 92.7866 9.9255C94.4036 11.5425 95.2108 13.484 95.208 15.75V48.75C95.208 51.0187 94.4009 52.9616 92.7866 54.5786C91.1724 56.1956 89.2295 57.0028 86.958 57H29.208ZM37.458 48.75H78.708C78.708 46.4813 79.5165 44.5398 81.1335 42.9255C82.7505 41.3113 84.692 40.5028 86.958 40.5V24C84.6893 24 82.7478 23.1929 81.1335 21.5786C79.5193 19.9644 78.7108 18.0215 78.708 15.75H37.458C37.458 18.0188 36.6509 19.9616 35.0366 21.5786C33.4224 23.1956 31.4795 24.0028 29.208 24V40.5C31.4768 40.5 33.4196 41.3085 35.0366 42.9255C36.6536 44.5425 37.4608 46.484 37.458 48.75ZM78.708 73.5H12.708C10.4393 73.5 8.49776 72.6929 6.88351 71.0786C5.26926 69.4644 4.46076 67.5215 4.45801 65.25V24C4.45801 22.8313 4.85401 21.8523 5.64601 21.063C6.43801 20.2738 7.41701 19.8778 8.58301 19.875C9.74901 19.8722 10.7294 20.2683 11.5241 21.063C12.3189 21.8578 12.7135 22.8368 12.708 24V65.25H78.708C79.8768 65.25 80.8571 65.646 81.6491 66.438C82.4411 67.23 82.8358 68.209 82.833 69.375C82.8303 70.541 82.4343 71.5214 81.645 72.3161C80.8558 73.1109 79.8768 73.5055 78.708 73.5Z" fill="#2D54DD" />
                </svg>
              </div>
              <div className={` ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>
                <h4 className={`text-[20px] font-semibold mt-6`}>Cash</h4>
                <p className={`text-[14px] mb-[10px]`}>Код</p>
              </div>
            </div>
          </div>
        </div>

        <div onClick={()=>setModalCash(!modalCash)} className={`${!modalCash && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
        <div onClick={()=>setModalUsdt(!modalUsdt)} className={`${!modalUsdt && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
        {/* pop-up */}
        {
          <div className={`absolute ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2 -translate-x-1/2 z-50 ${copy ? "top-20" : "top-[-50px] "} duration-300 mx-auto left-1/2 `}>
            <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
            <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
          </div>
        }
        {/* modallar */}
        <form onSubmit={handleSubmit} className={`${!modalUsdt ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[765px]`}>
          <div className="p-8">
            <div className="relative">
              <div onClick={() => { setModalUsdt(false); setMethod(""); setAmount(""); setHash(""); setError(false); setCopy(false) }} className="absolute right-0 cursor-pointer">
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isDarkMode ? "fill-[#fff]" : "fill-[#000]"}`}>
                  <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                </svg>
              </div>
              <div className="mb-8">
                <h3 className={`text-[32px] font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Пополнить депозит</h3>
                <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
              </div>
              {error &&
                <div className=" pt-1">
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
              }
              <div className="mb-8">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Хеш</h4>
                <input value={hash} onChange={(e) => { setHash(e.target.value) }} placeholder='Хеш' type="text" required className={`${isDarkMode ? "text-white" : ""} bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
              </div>
              <div className="">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Cумма</h4>
                <input value={amount} onChange={(e) => { setAmount(e.target.value) }} placeholder='Cумма' type="number" required className={`${isDarkMode ? "text-white" : ""} bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
              </div>
              <div className="">
                <h3 className={`text-[24px] mt-8 font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сканировать QR код</h3>
                <img className='max-w-[164px] mx-auto ' src="https://s3-alpha-sig.figma.com/img/1c53/97a2/b612206479cef267d121963033b57436?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=m5dOgnwDKaZpvHBp~yqqkvovuhtjzFasTe4~W2rcNeJuhFRZNyMketIUldjEDznp8Z~WLE8e8eEWBfjHYrX9VmeO8K6DDltrRdZyRmw0gG7Nl7NNvc3N6T6h7t6Q4d0x61W~2klcVjP1TY-duKbUwnlONQ6PpJldWBKrssETyjFbSNyuj9WndZEI~BPdLTX6BuA1SPH3~0YUKoJJhg9qdhSLde35DAoUGGa8IElTVp-OJ1X6viTDU~9u2VSkYerAPPjBJutuJXBKM-euCSPdGRWX34pYtH6k5pbJ0bBA4JR9cPFCv1dA6I9wK7sHsy2FmxXmW6dcyq2JzOs~vJ31QA__" alt="" />
                <div className="flex justify-center gap-x-2">
                  <LuCopy size={20} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} className='cursor-pointer' onClick={(e) => handleCopy(e)} />
                  <p className={`text-[14px] text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>0x14ofgm52341of13ofqofekqog1eqrog</p>
                </div>
              </div>
              <div className="flex w-full text-white justify-end">
                <button type='submit' className='bg-[#2E70F5] px-[37.5px] py-[10px] mt-[32px] font-normal text-[14px] rounded-[8px]'>
                  Пополнить
                </button>
              </div>
            </div>
          </div>
        </form>
        <form onSubmit={handleSubmit} className={`${!modalCash ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[765px]`}>

          <div className="p-8">
            <div className="relative">
              <div onClick={() => { setModalCash(false); setMethod(""); setAmount(""); setHash(""); setError(false) }} className="absolute right-0 cursor-pointer ">
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isDarkMode ? "fill-[#fff]" : "fill-[#000]"} `}>
                  <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                </svg>
              </div>
              <div className="mb-8">
                <h3 className={`text-[32px] font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Пополнить депозит</h3>
                <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
              </div>
              {error &&
                <div className=" pt-1">
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
              }

              <div className="mb-8">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Код</h4>
                <input value={hash} onChange={(e) => { setHash(e.target.value) }} placeholder='Код' type="text" required className={`${isDarkMode ? " text-white" : ""} bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
              </div>
              <div className="">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Cумма</h4>
                <input value={amount} onChange={(e) => { setAmount(e.target.value) }} placeholder='Cумма' type="number" required className={`${isDarkMode ? "text-white" : ""} bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
              </div>
              <div className="flex w-full text-white justify-end">
                <button type='submit' className='bg-[#2E70F5] px-[37.5px] py-[10px] mt-[32px] font-normal text-[14px] rounded-[8px]'>
                  Пополнить
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Deposit