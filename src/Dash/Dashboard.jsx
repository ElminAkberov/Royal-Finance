import { useEffect, useState, useRef, useContext } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import { Context } from '../context/ContextProvider';
import { FaArrowDownShortWide, FaArrowDownWideShort } from "react-icons/fa6";
import { CiFilter } from "react-icons/ci";
import Loading from '../Loading/Loading';
import { LuCopy } from 'react-icons/lu';
import Pagination from '../Pagination/Pagination';
import Sidebar from '../Sidebar/Sidebar';

const Dashboard = () => {
    let [arrows, setArrow] = useState("amount")
    const [loading, setLoading] = useState(true);
    let [copy, setCopy] = useState(false)
    let [dropDown, setDropDown] = useState(false)
    let { isDarkMode } = useContext(Context)
    const [filterHide, setFilterHide] = useState(false)
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    let [details, setDetails] = useState([])
    const [modal, setModal] = useState(false)
    let [query, setQuery] = useState("")
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    let [selectMethod, setSelectMethod] = useState("")
    let [hash, setHash] = useState("")
    let [selectStatus, setSelectStatus] = useState("")

    const [time, setTime] = useState('');
    const [time_2, setTime_2] = useState('');
    let navigate = useNavigate()
    const [data, setData] = useState([])
    // mobile
    const [filterBtn, setFilterBtn] = useState(false)
    const [searchBtn, setSearchBtn] = useState(false)
    const [navBtn, setNavBtn] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((data?.count || 1) / 10);
    const handleFilterApply = () => {
        setCurrentPage(1);
        handleFilter();
    };
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
            console.log(error)
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
    const handleFilter = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/refills/?q=${query}&method=${selectMethod && selectMethod}&o=${arrows}_in_usdt&status=${selectStatus && selectStatus}&created_at_before=${time_2 ? endDate + "T" + time_2 : endDate}&created_at_after=${time ? startDate + "T" + time : startDate}&hash=${hash && hash}&page=${currentPage === "" ? 1 : currentPage}`, {
                method: "GET",
                headers: {
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
                }
            });

            if (response.status === 401) {
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
                    handleFilter();
                } else {
                    navigate("/login");
                }
            } else if (response.status === 400) {
                return
            } else if (response.status === 404) {
                setCurrentPage(1);
            } else if (response.ok) {
                const data = await response.json();
                setData(data);
            } else {
                const errorText = await response.text();
                console.log(errorText)
            }
        } catch (error) {
            console.warn(error)
            navigate("/login");
        } finally {
            setLoading(false)
        }
    };
    useEffect(() => {
        handleFilter();
    }, [currentPage]);

    const handleStartTimeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let cleanedValue = value;

        if (cleanedValue.length >= 3) {
            cleanedValue = cleanedValue.slice(0, 2) + ':' + cleanedValue.slice(2);
        }

        const timeParts = cleanedValue.split(':');
        if (timeParts[0] && parseInt(timeParts[0], 10) > 23) {
            cleanedValue = '23:' + (timeParts[1] ? timeParts[1] : '00');
        }

        if (timeParts[1] && parseInt(timeParts[1], 10) > 59) {
            cleanedValue = timeParts[0] + ':59';
        }

        if (cleanedValue.endsWith(':000')) {
            cleanedValue = cleanedValue.slice(0, -1);
        }

        setTime(cleanedValue);

    };
    const handleEndTimeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let cleanedValue = value;

        if (cleanedValue.length >= 3) {
            cleanedValue = cleanedValue.slice(0, 2) + ':' + cleanedValue.slice(2);
        }

        const timeParts = cleanedValue.split(':');
        if (timeParts[0] && parseInt(timeParts[0], 10) > 23) {
            cleanedValue = '23:' + (timeParts[1] ? timeParts[1] : '00');
        }

        if (timeParts[1] && parseInt(timeParts[1], 10) > 59) {
            cleanedValue = timeParts[0] + ':59';
        }
        if (cleanedValue.endsWith(':000')) {
            cleanedValue = cleanedValue.slice(0, -1);
        }

        setTime_2(cleanedValue);
    };
    const handleShow = (info) => {
        setDetails([info])
    }
    const handleDownload = () => {
        fetch("https://dev.royal-pay.org/api/v1/internal/refills/download/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access")}`
            }
        })
            .then(res => res.text())
            .then(csvData => {
                const workbook = XLSX.read(csvData, { type: 'string', raw: true, FS: ',' });

                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

                const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'data.xlsx');
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            })
            .catch(error => console.warn(error));
    };
    useEffect(() => {
        handleFilter();
    }, [arrows]);
    return (
        <div onClick={() => { dropDown ? setDropDown(!dropDown) : ""; navBtn ? setNavBtn(!navBtn) : ""; }} className={`${isDarkMode ? "bg-[#000]  border-black" : "bg-[#E9EBF7] border-[#F4F4F5] border"} min-h-[100vh]  relative  border `}>
            <div className='flex'>
                <Sidebar />
                <div className={`mt-[50px] md:mt-[94px] w-full rounded-[24px] pr-[32px] pl-[32px] max-md:pl-4 max-md:pr-0 pt-[32px] ${isDarkMode ? "md:bg-[#1F1F1F]" : "md:bg-[#F5F6FC]"}  overflow-x-auto md:mr-[40px] md:mx-[32px]  `}>
                    <div className="flex max-lg:flex-col relative gap-x-2 justify-between pr-4 items-center mb-4">
                        <div className="flex max-[270px]:flex-wrap items-center justify-between w-full ">

                            <h3 className={`font-semibold text-[24px] max-lg:mx-auto max-md:mx-0 md:text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Управления депозитами</h3>
                            {/* poisk */}
                            <div className="flex gap-x-2 md:hidden ">
                                {/* search */}
                                <svg onClick={() => setSearchBtn(!searchBtn)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_706_24455" style={{ "maskType": "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_706_24455)">
                                        <path d="M17.9651 19.1768L18.1419 19.3536L18.3187 19.1768L19.1768 18.3185L19.3535 18.1417L19.1768 17.9649L14.2193 13.0075C14.4991 12.6335 14.7261 12.2079 14.9015 11.7326L14.9015 11.7326C15.1072 11.1747 15.2097 10.5899 15.2097 9.97977C15.2097 8.52317 14.7021 7.28118 13.6896 6.2692L13.6895 6.26919C12.6769 5.25727 11.4348 4.75 9.97862 4.75C8.52225 4.75 7.28051 5.25758 6.26879 6.27014L6.26878 6.27015C5.25713 7.28279 4.75 8.52484 4.75 9.98099C4.75 11.4373 5.25728 12.679 6.2693 13.6907C7.28131 14.7024 8.52329 15.2095 9.97984 15.2095C10.5743 15.2095 11.1504 15.1096 11.707 14.9098C12.1863 14.7378 12.6202 14.5076 13.0072 14.2188L17.9651 19.1768ZM12.4692 12.4691L12.4692 12.4691C11.7889 13.1495 10.9642 13.4883 9.97984 13.4883C8.99549 13.4883 8.17079 13.1495 7.49051 12.4691L7.49048 12.4691C6.81007 11.7888 6.47129 10.9641 6.47129 9.97977C6.47129 8.99543 6.81007 8.17075 7.49048 7.49048L7.49051 7.49045C8.17079 6.81005 8.99549 6.47128 9.97984 6.47128C10.9642 6.47128 11.7889 6.81005 12.4692 7.49045L12.4692 7.49048C13.1496 8.17075 13.4884 8.99543 13.4884 9.97977C13.4884 10.9641 13.1496 11.7888 12.4692 12.4691Z" fill="#2552F2" stroke="#2552F2" strokeWidth="0.5" />
                                    </g>
                                </svg>
                                {/* download */}
                                <svg onClick={handleDownload} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97933 19.8043 4.588 19.413C4.19667 19.0217 4.00067 18.5507 4 18V15H6V18H18V15H20V18C20 18.55 19.8043 19.021 19.413 19.413C19.0217 19.805 18.5507 20.0007 18 20H6Z" fill="#2552F2" />
                                </svg>
                                {/* filter */}
                                <svg onClick={() => setFilterBtn(!filterBtn)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 18H13C13.55 18 14 17.55 14 17C14 16.45 13.55 16 13 16H11C10.45 16 10 16.45 10 17C10 17.55 10.45 18 11 18ZM3 7C3 7.55 3.45 8 4 8H20C20.55 8 21 7.55 21 7C21 6.45 20.55 6 20 6H4C3.45 6 3 6.45 3 7ZM7 13H17C17.55 13 18 12.55 18 12C18 11.45 17.55 11 17 11H7C6.45 11 6 11.45 6 12C6 12.55 6.45 13 7 13Z" fill="#2552F2" />
                                </svg>
                            </div>
                        </div>
                        <div className={` flex  max-lg:flex-col items-center max-md:w-full ${!searchBtn && "max-md:hidden"} `}>
                            <div className="relative max-lg:my-3 max-md:w-full">
                                <input onChange={(e) => setQuery(e.target.value)} value={query} type="text" placeholder='Поиск' style={{ color: isDarkMode ? "#fff" : "#616E90" }} className={`border focus:outline-[#536cfe] ${isDarkMode ? "border-[#D9D9D940]" : "border-[#C5C7CD]"}   bg-transparent   pl-7 placeholder:text-[#616E90] placeholder:font-medium placeholder:text-xs  relative md:max-w-[150px]  max-md:w-full py-[9px] lg:mr-[15px] rounded-[8px] `} />
                                <div onClick={() => { handleFilter() }} className="flex items-center top-[3px] absolute cursor-pointer">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="#616E90" className='m-[10px]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1419 14L8.02728 8.88525C7.62011 9.22143 7.15187 9.48452 6.62256 9.67453C6.09324 9.86454 5.54567 9.95955 4.97984 9.95955C3.58802 9.95955 2.41008 9.47767 1.44605 8.51392C0.482017 7.55018 0 6.37253 0 4.98099C0 3.58959 0.481881 2.41154 1.44564 1.44684C2.40941 0.482281 3.58707 0 4.97862 0C6.37005 0 7.54811 0.482009 8.51283 1.44603C9.4774 2.41005 9.95969 3.58796 9.95969 4.97977C9.95969 5.56133 9.86211 6.11677 9.66694 6.64608C9.47163 7.17538 9.21111 7.63575 8.88538 8.02716L14 13.1417L13.1419 14ZM4.97984 8.73827C6.02911 8.73827 6.91782 8.37413 7.64597 7.64586C8.37425 6.91772 8.73839 6.02902 8.73839 4.97977C8.73839 3.93052 8.37425 3.04183 7.64597 2.31369C6.91782 1.58541 6.02911 1.22128 4.97984 1.22128C3.93058 1.22128 3.04187 1.58541 2.31372 2.31369C1.58544 3.04183 1.22129 3.93052 1.22129 4.97977C1.22129 6.02902 1.58544 6.91772 2.31372 7.64586C3.04187 8.37413 3.93058 8.73827 4.97984 8.73827Z" fill="#616E90" />
                                    </svg>
                                </div>
                            </div>
                            <button onClick={handleDownload} className='text-[#fff] text-[14px] max-md:hidden font-normal bg-[#536cfe]  rounded-[8px] py-[8px] min-w-[156px]'>Скачать отчет</button>
                        </div>
                    </div>
                    {/* filter */}
                    <button onClick={() => setFilterHide(!filterHide)} className='text-[#fff] mb-2 flex justify-center items-center gap-x-1 text-[14px] max-md:hidden font-normal bg-[#536cfe] rounded-[8px] py-[8px] min-w-[115px]'>
                        <CiFilter size={20} />
                        {!filterHide ? "Открыть" : "Скрыть"}
                    </button>
                    <div className={`${!filterHide ? 'md:hidden' : ''}`}>
                        <div className={`${!filterBtn && "max-md:hidden"} flex max-md:grid max-md:grid-cols-2 max-md:justify-items-center max-[450px]:grid-cols-1  max-[1200px]:justify-center flex-wrap py-[24px] pr-4 text-[14px] gap-2 text-[#717380]`}>
                            <input onChange={(e) => setHash(e.target.value)} placeholder='Хеш' type="text" className={`focus:outline-[#536cfe] pl-[12px] w-[149.5px] h-[40px] rounded-[4px] ${isDarkMode ? "bg-[#121212]   text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                            <select onChange={(e) => setSelectMethod(e.target.value)} className={`${isDarkMode ? "bg-[#121212] focus:outline-[#536cfe] text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] min-w-[149.5px] h-[40px]`} name="" id="">
                                <option value="" defaultValue={"Метод"}>Метод</option>
                                <option>ABCEX</option>
                                <option>GARANTEX</option>
                                <option>USDT</option>
                                <option>CASH</option>
                            </select>
                            <select onChange={(e) => setSelectStatus(e.target.value)} className={`${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] min-w-[149.5px] h-[40px]`} name="" id="">
                                <option defaultValue={"Статус"} value={""} >Статус</option>
                                <option value={"success"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Успешно</option>
                                <option value={"pending"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>В обработке</option>
                                <option value={"failed"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Отклонено</option>
                            </select>
                            <div className={`flex items-center pl-[12px] rounded-[4px] min-w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} cursor-pointer`} onClick={() => startDateRef.current && startDateRef.current.showPicker()}>
                                <svg width="24" height="24" className='text-[#536cfe] ' viewBox="0 0 24 24" fill={`#536cfe`} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                                </svg>
                                <div className="w-max relative">
                                    <div className="absolute h-6 w-4 bg-[#DFDFEC] z-40 right-0 top-0"></div>
                                    <input ref={startDateRef} type="date" name="" id="date-picker" min="2023-01-01" className='bg-transparent outline-none relative mt-1 ml-1 w-full cursor-pointer ' onChange={(e) => setStartDate(e.target.value)} defaultValue={"2024-10-16"} />
                                </div>
                            </div>

                            <div className={`flex items-center pl-[12px] rounded-[4px] w-[149.5px] relative h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" className='absolute top-2 fill-[#536cfe]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" />
                                    </svg>
                                </div>
                                <input value={time} onChange={handleStartTimeChange} type="text" className='bg-transparent outline-none pl-7 ' placeholder='00:00' />
                            </div>
                            <div className={`flex overflow-hidden items-center  pl-[12px] rounded-[4px] min-w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC] text-black"}`} onClick={() => endDateRef.current && endDateRef.current.showPicker()}>
                                <svg width="24" height="24" className='text-[#536cfe] ' viewBox="0 0 24 24" fill={`#536cfe`} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                                </svg>
                                <div className="w-max relative">
                                    <div className="absolute h-6 w-5 bg-[#DFDFEC] z-40 right-0 top-0"></div>
                                    <input ref={endDateRef} type="date" name="" id="" min="2024-01-01" className='bg-transparent outline-none mt-1 ml-1 ]' onChange={(e) => setEndDate(e.target.value)} defaultValue={"2024-12-12"} />
                                </div>
                            </div>
                            <div className={`flex overflow-hidden items-center pl-[12px] relative rounded-[4px] w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" className='absolute top-2 fill-[#536cfe]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" />
                                    </svg>
                                </div>
                                <input value={time_2} onChange={handleEndTimeChange} type="text" className='bg-transparent outline-none pl-7' placeholder='23:59' />
                            </div>
                            <div className="flex justify-center mb-2 max-w-[160px] max-md:hidden">
                                <button onClick={handleFilterApply} className='bg-[#536DFE] text-[#fff]  py-[9.5px] font-normal min-w-[156px] text-[14px] rounded-[8px]'>
                                    Применить фильтр
                                </button>
                            </div>
                            <div className="flex justify-center w-full min-[450px]:hidden mb-2 ">
                                <button onClick={handleFilterApply} className='bg-[#536DFE] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                    Применить фильтр
                                </button>
                            </div>
                        </div>
                        <div className={`hidden justify-center w-full  ${filterBtn && "max-md:flex"} max-[450px]:hidden mb-2 `}>
                            <button onClick={handleFilterApply} className='bg-[#536DFE] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                Применить фильтр
                            </button>
                        </div>
                    </div>

                    <div className={`fixed ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2  -translate-x-1/2 z-50 ${copy ? "top-20" : "top-[-200px] "} duration-300 mx-auto left-1/2 `}>
                        <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
                        <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
                    </div>
                    <div className={`overflow-hidden ${!loading ? (isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]") : ""}`}>
                        <div className="hidden max-md:block ">
                            <style >
                                {`
.p-datatable-thead {
      background-color: ${isDarkMode ? '#272727' : '#F4F5FB'};
    }
    @media only screen and (max-width: 768px) {
    .p-paginator-bottom,.pages {
      background-color: ${isDarkMode ? '#000' : ' #E9EBF7'};
    }
    
}                          
                            `}
                            </style>
                            {loading ? (
                                <Loading />
                            ) :
                                <div className={`max-h-[70dvh] overflow-y-scroll overflow-hidden ${isDarkMode ? "text-white" : ""}`}>
                                    {
                                        data?.results?.map((dashData, index) => (
                                            <div className=''>
                                                <div className={`p-2 border ${isDarkMode ? "border-black" : ""} `}>
                                                    <div className="flex justify-between items-center">
                                                        <div className="selectable-text font-bold text-[16px]">{dashData?.merchant["username"]} <span className="selectable-text">{dashData.method_name && `- ${dashData?.method_name}`} </span></div>
                                                        <div onClick={() => { handleShow(dashData); setModal(true) }} className='cursor-pointer'>
                                                            <svg width="24" height="24" className='mx-auto hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                                <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="text-[15px]">
                                                        <div className="selectable-text">{dashData.amount_in_usdt} USDT</div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Курс/Крипта </span><span className="selectable-text">{dashData.course} {dashData.currency}</span></div>
                                                        <div className="text-xs mb-[2px]">
                                                            <span className='text-[#616E90]'>Xэш </span>
                                                            <span className='group cursor-pointer'>
                                                                {dashData.hash.slice(0, 10)}...
                                                                <div
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(dashData.hash);
                                                                        setCopy(true);
                                                                        setTimeout(() => {
                                                                            setCopy(false);
                                                                        }, 2000);
                                                                    }}
                                                                    className="group-hover:opacity-100 group-hover:visible duration-300 flex flex-col items-center gap-y-1 absolute left-0 p-1 opacity-0 invisible"
                                                                    style={{
                                                                        background: isDarkMode ? "#121212" : "#dfdfec",
                                                                        color: isDarkMode ? "#fff" : "#121212",
                                                                    }}
                                                                >
                                                                    {dashData.hash.length > 15 ?
                                                                        <>
                                                                            <div>{dashData.hash.slice(0, dashData.hash.length / 2)}</div> {/* İlk yarısı */}
                                                                            <div>{dashData.hash.slice(dashData.hash.length / 2)}</div>    {/* İkinci yarısı */}
                                                                        </>
                                                                        : <>{dashData.hash}</>
                                                                    }
                                                                    <LuCopy />
                                                                </div>

                                                            </span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className='text-[#616E90]'>
                                                                Дата и время
                                                            </span>
                                                            <span className="">
                                                                <span className="selectable-text"> {dashData?.created_at && dashData?.created_at?.split("T")[0]} </span>
                                                                <span className="selectable-text"> {dashData?.created_at && dashData?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            {dashData.status === "pending" ? (
                                                                <div className="bg-[#FFC107] flex justify-center text-[12px] w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]">
                                                                    В обработке
                                                                </div>
                                                            ) : dashData.status === "success" ? (
                                                                <div className="bg-[#37B67E] flex justify-center text-[12px] w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]">
                                                                    Успешно
                                                                </div>
                                                            ) : (
                                                                <div className="bg-[#CE2E2E] flex justify-center text-[12px] w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]">
                                                                    Отклонено
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                            }
                        </div>

                        <div className="block max-md:hidden">
                            {loading ? (
                                <Loading />
                            ) :
                                <DataTable value={data?.results} rows={10} tableStyle={{ minWidth: '50rem' }} className={`${isDarkMode ? "dark_mode" : "light_mode"}`} rowClassName={() => "dataTableRow"} style={{ userSelect: 'text' }}>
                                    <Column body={(rowData) => {
                                        return (
                                            <div onClick={() => { handleShow(rowData); setModal(true) }} className='cursor-pointer pointer-events-auto'>
                                                <svg width="24" height="24" className='mx-auto hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                    <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                </svg>
                                            </div>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="Действия" ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div >
                                                <div>
                                                    <h5 className='selectable-text'>{rowData?.created_at && rowData?.created_at?.split("T")[0]}</h5>
                                                    <p className='selectable-text'>{rowData?.created_at && rowData?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</p>
                                                </div>

                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"}` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Дата и время"  ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="method" header="Метод" body={(rowData) => <div className="selectable-text">{rowData?.method_name}</div>} ></Column>
                                    {localStorage.getItem("role") == "admin" &&
                                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="merchant" header="Мерчант" body={(rowData) => <div className="selectable-text">{rowData?.merchant["username"]}</div>} ></Column>
                                    }
                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="amount_in_usdt" header={
                                        <div onClick={() => { setArrow(arrows === "amount" ? "-amount" : "amount"); }} style={{ display: 'flex', alignItems: 'center' }}>
                                            {arrows === "amount" ?
                                                <FaArrowDownShortWide color={isDarkMode ? "#E7E7E7" : "#2B347C"} size={17} />
                                                :
                                                <FaArrowDownWideShort color={isDarkMode ? "#E7E7E7" : "#2B347C"} size={17} />
                                            }
                                            Сумма
                                        </div>
                                    } headerClassName={`${isDarkMode ? "sortable-column_dark" : "sortable-column"} cursor-pointer`} body={(rowData) => {
                                        return (
                                            <div>
                                                <div className="selectable-text">{rowData.amount_in_usdt} USDT</div>
                                            </div>
                                        );
                                    }}
                                    ></Column>


                                    <Column body={(rowData) => {
                                        return (
                                            <div>
                                                <>
                                                    <div className="selectable-text">{rowData.course} {rowData.currency}</div>
                                                </>
                                            </div>
                                        )

                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="course" header="Курс/Крипта" ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="price_2" header="Сумма" body={(rowData) => {
                                        return (
                                            <div>
                                                <>
                                                    <div className="selectable-text">{rowData.amount} RUB</div>
                                                </>
                                            </div>
                                        )

                                    }} ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} body={(rowData) => {
                                        return (
                                            <div >
                                                <div className='group cursor-pointer pointer-events-auto'>{rowData.hash.slice(0, 8)}...
                                                    <div onClick={() => { navigator.clipboard.writeText(rowData.hash); setCopy(true); setTimeout(() => { setCopy(false) }, 2000) }} className="group-hover:opacity-100 group-hover:visible duration-300  flex items-center gap-x-2 absolute right-0 p-1 opacity-0 invisible" style={{ background: isDarkMode ? "#121212" : "#dfdfec", color: isDarkMode ? "#fff" : "#121212" }}>{rowData.hash}  <LuCopy /></div>
                                                </div>
                                            </div>
                                        )

                                    }} field="code" header="Xэш" ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Статус" body={(rowData) => {
                                        if (rowData.status === "pending") {
                                            return (
                                                <div className='bg-[#FFC107] flex justify-center mx-auto text-[12px]  w-[116px]  font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                    В обработке
                                                </div>
                                            );
                                        } else if (rowData.status == "success") {
                                            return (
                                                <div className='bg-[#37B67E]  flex justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                    Успешно
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className='bg-[#CE2E2E] flex  justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                    Отклонено
                                                </div>
                                            )
                                        }
                                    }}></Column>

                                </DataTable>
                            }
                        </div>
                        {/* izz */}
                    </div>
                    {loading ? "" :
                        <div className=" flex items-center justify-between ">
                            {data?.count >= 10 &&
                                <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
                            }
                            <p className={`text-end w-full my-3 text-[14px] font-normal mr-4  z-30 duration-300 ${isDarkMode ? "text-[#FFFFFF33]" : "text-[#252840]"}`}>{data?.count ? data?.count : 0} результата</p>
                        </div>
                    }

                    {/* <p className={`text-right text-[14px] font-normal relative bottom-[45px] mr-4  duration-300 ${isDarkMode ? "text-[#FFFFFF33]" : "text-[#252840]"}`}>{data.results ? (!filteredCustomers ? data.results.length : filteredCustomers.length) : 0} результата</p> */}
                    <div onClick={() => setModal(!modal)} className={`${!modal && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
                    <div className={`${!modal ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[784px] `}>
                        <div className="p-8">
                            <div className="">
                                <div className="mb-8">
                                    <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Детали депозита </h3>
                                    <h5 className='text-[14px] text-[#60626C]'>Подробная информация</h5>
                                </div>
                                {details?.map((data, index) => (
                                    <div key={index}>
                                        <div className="modal">
                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Дата и время пополнения</h5>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.created_at && `${data?.created_at?.split("T")[0]} ${data?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}`}</p>
                                        </div>
                                        <div className="modal">
                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Метод пополнения</h5>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.currency}</p>
                                        </div>
                                        <div className="modal">
                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма пополнения </h5>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.amount} RUB</p>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.amount_in_usdt} USDT</p>
                                        </div>
                                        <div className="modal">
                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Курс обмена</h5>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.course} {data?.currency}</p>
                                        </div>
                                        <div className="modal">
                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Статус</h5>
                                            <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.status === "pending" ? "В обработке" : data?.status === "success" ? "Успешно" : "Отклонено"}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex w-full text-white justify-end">
                                    <button onClick={() => setModal(false)} className='bg-[#536DFE] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                        Закрыть
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard