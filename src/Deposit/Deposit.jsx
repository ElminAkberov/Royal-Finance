import { useContext, useEffect, useState } from 'react'
import { Context } from '../context/ContextProvider'
import { NavLink, useNavigate } from 'react-router-dom'
import Dark from '../Dark'
import { LuCopy } from 'react-icons/lu'
import Sidebar from '../Sidebar/Sidebar'

const Deposit = () => {
  let navigate = useNavigate()
  let [status, setStatus] = useState(null)

  const [modalUsdt, setModalUsdt] = useState(false)
  const [modalCash, setModalCash] = useState(false)
  const [method, setMethod] = useState("")
  const [amount, setAmount] = useState("")
  const [hash, setHash] = useState("")
  let [copy, setCopy] = useState(false)
  let [dropDown, setDropDown] = useState(false)
  let { isDarkMode } = useContext(Context)


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
      .catch(error => {
        console.warn(error)
        setCopy(false);
      });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://dev.royal-pay.org/api/v1/internal/refills/", {
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
          return handleSubmit(e);
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
  let [data, setData] = useState([])
  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        return;
      }
      const refreshResponse = await fetch("https://dev.royal-pay.org/api/v1/auth/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem("access", refreshData.access);
        return true;
      }
    } catch (error) {
      console.warn(error)
    }
  };
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await refreshAuth();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
          navigate("/login");
          return;
        }
        const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/refills/wallets/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div onClick={() => { dropDown ? setDropDown(!dropDown) : ""; navBtn ? setNavBtn(!navBtn) : "" }} className={`flex `}>
      <Sidebar />
      <div className={`w-full ${isDarkMode ? "bg-[#000]" : "bg-[#E9EBF7]"}`}>
        <div className={`pt-[129px] px-[68px] max-[300px]:px-[35px] ${(modalUsdt || modalCash) ? "h-[100vh]  overflow-hidden" : ""}`}>
          <h3 className={`font-semibold  max-[1100px]:text-center text-[24px] mb-[26px]  ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Пополнение депозита</h3>
          <div className="cards flex flex-wrap  gap-8  max-[1100px]:justify-center duration-300">
            <div onClick={() => { setModalUsdt(true); setMethod('USDT') }} className={`card_1 cursor-pointer hover:border-[#536DFE] duration-300 border  p-8 ${isDarkMode ? "bg-[#1F1F1F]  border-[#1F1F1F]" : "bg-[#F5F6FC] "}  rounded-2xl`}>
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

            <div onClick={() => { setModalCash(true); setMethod("GARANTEX") }} className={`card_1 cursor-pointer border hover:border-[#536DFE] duration-300 p-8 ${isDarkMode ? "bg-[#1F1F1F] border-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
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

            <div onClick={() => { setModalCash(true); setMethod("ABCEX") }} className={`card_1 cursor-pointer border hover:border-[#536DFE] duration-300 p-8 ${isDarkMode ? "bg-[#1F1F1F] border-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
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

            <div onClick={() => { setModalCash(true); setMethod("CASH") }} className={`card_1 cursor-pointer border hover:border-[#536DFE] duration-300 p-8 ${isDarkMode ? "bg-[#1F1F1F] border-[#1F1F1F]" : "bg-[#F5F6FC]"} rounded-2xl`}>
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
        <div onClick={() => { setModalCash(!modalCash); setMethod(""); setAmount(""); setHash(''); setCopy(false); setStatus(null) }} className={`${!modalCash && "hidden"} fixed inset-0  bg-[#2222224D]  z-20`}></div>
        <div onClick={() => { setModalUsdt(!modalUsdt); setMethod(""); setAmount(""); setHash(''); setCopy(false); setStatus(null) }} className={`${!modalUsdt && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
        {/* pop-up */}
        {
          <div className={`absolute ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2 -translate-x-1/2 z-50 ${copy ? "top-20" : "top-[-50px] "} duration-300 mx-auto left-1/2 `}>
            <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
            <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
          </div>
        }
        {/* modallar */}
        <form onSubmit={handleSubmit} className={`${!modalUsdt ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto overflow-y-hidden h-[90vh]  w-full max-w-[765px]`}>
          <div className="p-8 overflow-y-scroll max-h-[90vh]">
            <div className="relative">
              <div onClick={() => { setModalUsdt(false); setMethod(""); setAmount(""); setHash(""); setStatus(null); setCopy(false) }} className="absolute right-0 cursor-pointer">
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isDarkMode ? "fill-[#fff]" : "fill-[#000]"}`}>
                  <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                </svg>
              </div>
              <div className="mb-8">
                <h3 className={`text-[32px] font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Пополнить депозит</h3>
                <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
              </div>
              {status == "error" ?
                <div className={`pt-1  w-full duration-300 `}>
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
                : status == "success" ?
                  <div className="px-[20px] pt-1 ">
                    <div className="flex items-center max-w-[720px] mx-auto mb-5 border bg-white border-[#37B67E] rounded-md">
                      <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#37b67e]"></div>
                      <div className="relative mr-[8px] ml-[18px]">
                        <img src="/assets/img/check.svg" className='bg-[#37B67E] min-w-[26.67px] min-h-[26.67px] p-[6px] rounded-full' alt="" />
                      </div>
                      <div className="">
                        <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Успешно!</h4>
                        <p className='text-[14px] text-[#484951]'>Ваши изменения успешно сохранены.</p>
                      </div>
                    </div>
                  </div> : ""
              }

              <div className="mb-8">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Хеш</h4>
                <input value={hash} onChange={(e) => { setHash(e.target.value) }} placeholder='Хеш' type="text" required className={`${isDarkMode ? "text-white" : ""} focus:outline-[#536cfe] bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4  rounded-[4px]`} />
              </div>
              <div className="">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Cумма</h4>
                <input value={amount} onChange={(e) => { setAmount(e.target.value) }} placeholder='Cумма' type="number" required className={`${isDarkMode ? "text-white" : ""} focus:outline-[#536cfe] bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4  rounded-[4px]`} />
              </div>
              <div className="">
                <h3 className={`text-[24px] mt-8 font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сканировать QR код</h3>
                {data?.map(item => (
                  <>
                    <img className='max-w-[164px] mx-auto ' src="" alt="" />
                    <div className="flex justify-center gap-x-2">
                      <LuCopy size={20} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} className='cursor-pointer' onClick={(e) => handleCopy(e)} />
                      <p className={`text-[14px] text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>0x14ofgm52341of13ofqofekqog1eqrog</p>
                    </div>
                  </>
                ))}
              </div>
              <div className="flex w-full text-white justify-end">
                <button type='submit' className='bg-[#536DFE] px-[37.5px] py-[10px] mt-[32px] font-normal text-[14px] rounded-[8px]'>
                  Пополнить
                </button>
              </div>
            </div>
          </div>
        </form>
        <form onSubmit={handleSubmit} className={`${!modalCash ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[765px]`}>
          <div className="p-8">
            <div className="relative">
              <div onClick={() => { setModalCash(false); setMethod(""); setAmount(""); setHash(""); setStatus(null) }} className="absolute right-0 cursor-pointer ">
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isDarkMode ? "fill-[#fff]" : "fill-[#000]"} `}>
                  <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                </svg>
              </div>
              <div className="mb-8">
                <h3 className={`text-[32px] font-semibold ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Пополнить депозит</h3>
                <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
              </div>
              {status == "error" ?
                <div className={`pt-1 w-full duration-300 `}>
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
                : status == "success" ?
                  <div className="px-[20px] pt-1 ">
                    <div className="flex items-center max-w-[720px] mx-auto mb-5 border bg-white border-[#37B67E] rounded-md">
                      <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#37b67e]"></div>
                      <div className="relative mr-[8px] ml-[18px]">
                        <img src="/assets/img/check.svg" className='bg-[#37B67E] min-w-[26.67px] min-h-[26.67px] p-[6px] rounded-full' alt="" />
                      </div>
                      <div className="">
                        <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Успешно!</h4>
                        <p className='text-[14px] text-[#484951]'>Ваши изменения успешно сохранены.</p>
                      </div>
                    </div>
                  </div> : ""
              }

              <div className="mb-8">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Код</h4>
                <input value={hash} onChange={(e) => { setHash(e.target.value) }} placeholder='Код' type="text" required className={`${isDarkMode ? " text-white" : ""} focus:outline-[#536cfe] bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4  rounded-[4px]`} />
              </div>
              <div className="">
                <h4 className={`text-[12px] mb-2 font-semibold ${isDarkMode ? "text-[#e7e7e7]" : ""}`}>Cумма</h4>
                <input value={amount} onChange={(e) => { setAmount(e.target.value) }} placeholder='Cумма' type="number" required className={`${isDarkMode ? "text-white" : ""} focus:outline-[#536cfe] bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4  rounded-[4px]`} />
              </div>
              <div className="flex w-full text-white justify-end">
                <button type='submit' className='bg-[#536DFE] px-[37.5px] py-[10px] mt-[32px] font-normal text-[14px] rounded-[8px]'>
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