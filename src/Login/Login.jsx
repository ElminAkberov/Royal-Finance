import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'

const Login = () => {
  let navigate = useNavigate()
  let [email, setEmail] = useState("front_superuser")
  let [pass, setPass] = useState("alFGamBELatO")
  let [otp, setOtp] = useState("")
  const [err, setErr] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

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
      .then((data) => { localStorage.setItem("access", data.access); localStorage.setItem("refresh", data.refresh); setErr(false);navigate("/dash") })
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
    <div className='bg-linear inter'>
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
        <div className="bg-[#F5F6FC] px-8 max-[300px]:px-4 md:px-[134px] pt-[40px] md:pt-[119px] pb-[40px] md:pb-[89px] rounded-2xl max-md:max-w-md max-md:w-full duration-300">
          <div className="px-[16.5px]">
            <h1 className='text-[35px] max-md:text-[25px] max-[300px]:text-[18px] text-[#18181B] font-semibold mb-[12px] px-[6px] text-center mx-auto leading-none'>Добро пожаловать!</h1>
            <p className='text-[18px] max-md:text-[15px] max-[300px]:text-[12px] text-[#5D5E64] mb-[56px] text-center leading-none' >Введите данные, чтобы войти в аккаунт.</p>
          </div>
          <form onSubmit={handleSubmit} className="label">
            <label htmlFor='name'>
              <input type="text" onChange={(e => setEmail(e.target.value))} placeholder='Имя пользователя' className='w-full border-[#6C6E86] border rounded-[4px]  outline-[#2D54DD] pl-4  py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal' required />
            </label>
            <label htmlFor="password" className='relative'>
              <input type={showPassword ? 'text' : 'password'} onChange={(e => setPass(e.target.value))} placeholder='Пароль' className='w-full border-[#6C6E86] border rounded-[4px] outline-[#2D54DD] pl-4 my-4 py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal' required />
              <img onClick={togglePasswordVisibility} src="/assets/img/hidden.svg" className='cursor-pointer absolute top-[40%] right-0  mr-[12px]' alt="" />
            </label>
            <label htmlFor="otp">
              <input type="text" onChange={(e => setOtp(e.target.value))} placeholder='ОТП' className='w-full mb-11 border-[#6C6E86] border rounded-[4px] outline-[#2D54DD] pl-4 py-[10px] placeholder:text-[#C5C7CD] text-[14px] font-normal' required minLength={6} maxLength={6} />
            </label>
            <button type='submit' className='py-[10px] text-[14px] text-white font-medium rounded-[4px] bg-[#2D54DD] w-full text-center'>{loading ? <PulseLoader color="#fff" speedMultiplier={0.6} size={12} /> : "Войти"}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login