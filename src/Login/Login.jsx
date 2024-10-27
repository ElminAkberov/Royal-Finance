import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import { Context } from '../context/ContextProvider'

const Login = () => {
  let navigate = useNavigate()
  let [email, setEmail] = useState("front_superuser")
  let [pass, setPass] = useState("alFGamBELatO")
  let [otp, setOtp] = useState("")
  const [err, setErr] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

  let { isDarkMode, toggleDarkMode } = useContext(Context)

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    fetch("https://dev.royal-pay.org/api/v1/auth/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": email,
        "password": pass,
        "otp": otp,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return Promise.reject(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => { localStorage.setItem("access", data.access); localStorage.setItem("refresh", data.refresh); setErr(false); navigate("/dash") })
      .catch(() => { setErr(true) })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      })
  };
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };


  return (
    <div className={`${isDarkMode ? "bg-linear_dark" : "bg-linear"} inter`}>
      {/* Testiq */}
      {/* <div className="px-[20px] pt-1">
        <div className="flex items-center max-w-[720px] mx-auto mb-5 border bg-white border-[#37B67E] rounded-md">
          <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#37b67e] rounded-"></div>
          <div className="relative mr-[8px] ml-[18px]">
            <img src="/assets/img/check.svg" className='bg-[#37B67E] min-w-[26.67px] min-h-[26.67px] p-[6px] rounded-full' alt="" />
          </div>
          <div className="">
            <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Успешно!</h4>
            <p className='text-[14px] text-[#484951]'>Ваши изменения успешно сохранены.</p>
          </div>
        </div>
      </div> */}

      {/* Xeta */}
      {err &&
        <div className="px-[20px] pt-1">
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
      <div className={`flex justify-center ${!err && "h-[100vh]"} px-[20px] items-center`}>
        <div className={`${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"} px-8 max-[300px]:px-4 md:px-[134px] pt-[40px] md:pt-[119px] pb-[40px] md:pb-[89px] rounded-2xl max-md:max-w-md max-md:w-full duration-300`}>
          <div className="px-[16.5px]">
            <h1 className={`text-[35px] max-md:text-[25px] max-[300px]:text-[18px] ${isDarkMode ? "text-[#F0F3FD]" : "text-[#18181B]"} font-semibold mb-[12px] px-[6px] text-center mx-auto leading-none`}>Добро пожаловать!</h1>
            <p className='text-[18px] max-md:text-[15px] max-[300px]:text-[12px] text-[#5D5E64] mb-[56px] text-center leading-none' >Введите данные, чтобы войти в аккаунт.</p>
          </div>
          <form onSubmit={handleSubmit} className="label">
            <label htmlFor='name'>
              <input  type="text" onChange={(e => setEmail(e.target.value))} placeholder='Имя пользователя' className={`w-full border-[#6C6E86] border bg-transparent ${isDarkMode ? "text-[#C5C7CD]" : "text-[#000]"}  rounded-[4px]  outline-[#2D54DD] pl-4  py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal`} required />
            </label>
            <label htmlFor="password" className='relative'>
              <input value={"alFGamBELatO"} type={showPassword ? 'text' : 'password'} onChange={(e => setPass(e.target.value))} placeholder='Пароль' className={`w-full border-[#6C6E86] border bg-transparent ${isDarkMode ? "text-[#C5C7CD]" : "text-[#000]"}  rounded-[4px] outline-[#2D54DD] pl-4 my-4 py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal`} required />
              <svg onClick={togglePasswordVisibility} width="22" className='cursor-pointer absolute top-[40%] right-0  mr-[12px]' height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.33392 0.159547C0.976426 -0.0966972 0.457373 -0.0373235 0.175503 0.287669C-0.106367 0.612662 -0.0410561 1.08453 0.316438 1.34077L20.6661 15.8405C21.0236 16.0967 21.5426 16.0373 21.8245 15.7123C22.1064 15.3873 22.0411 14.9155 21.6836 14.6592L18.0674 12.0843C19.4286 10.8156 20.3498 9.39372 20.8139 8.38437C20.9273 8.1375 20.9273 7.8625 20.8139 7.61563C20.3017 6.50003 19.2258 4.87507 17.6171 3.51885C16.0015 2.15013 13.7775 1.00015 11 1.00015C8.65567 1.00015 6.7032 1.82201 5.18041 2.90011L1.33392 0.159547ZM7.66912 4.67195C8.54567 3.94384 9.71783 3.5001 11 3.5001C13.7328 3.5001 15.9499 5.51568 15.9499 8C15.9499 8.77811 15.7334 9.50934 15.3518 10.1468L14.0249 9.2031C14.3137 8.59999 14.3893 7.90938 14.1899 7.22502C13.8084 5.92817 12.5468 5.05631 11.1444 5.00319C10.945 4.99694 10.8281 5.19381 10.89 5.36881C10.9622 5.5688 11.0034 5.7813 11.0034 6.00317C11.0034 6.32191 10.9209 6.62191 10.7766 6.88752L7.67256 4.67507L7.66912 4.67195ZM12.8218 12.1843C12.2581 12.3874 11.6428 12.4999 11 12.4999C8.26723 12.4999 6.05009 10.4843 6.05009 8C6.05009 7.78438 6.06727 7.57501 6.09821 7.36876L2.85671 5.04694C2.07297 5.97504 1.51267 6.90002 1.18611 7.61563C1.07267 7.8625 1.07267 8.1375 1.18611 8.38437C1.69829 9.49997 2.77421 11.1249 4.38293 12.4812C5.99853 13.8499 8.22255 14.9998 11 14.9998C12.6431 14.9998 14.0903 14.5967 15.338 13.9842L12.8218 12.1843Z" fill={`${isDarkMode ? "#ACADB2" : "#322F35"} `} />
              </svg>

            </label>
            <label htmlFor="otp">
              <input type="text" onChange={(e => setOtp(e.target.value))} placeholder='ОТП' className={`w-full mb-11 border-[#6C6E86] border bg-transparent ${isDarkMode ? "text-[#C5C7CD]" : "text-[#000]"}  rounded-[4px] outline-[#2D54DD] pl-4 py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal`} required minLength={6} maxLength={6} />
            </label>
            <button type='submit' className='py-[10px] text-[14px] text-white font-medium rounded-[4px] bg-[#2D54DD] w-full text-center'>{loading ? <PulseLoader color="#fff" speedMultiplier={0.6} size={12} /> : "Войти"}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login