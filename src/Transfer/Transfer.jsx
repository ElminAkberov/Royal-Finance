import React, { useEffect, useState, useRef, useContext } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import Dark from '../Dark';
import { Context } from '../context/ContextProvider';
import { FaAngleLeft, FaAngleRight, FaArrowDownShortWide, FaArrowDownWideShort } from "react-icons/fa6";
import Loading from '../Loading/Loading';
import { LuArrowDownUp, LuCopy } from 'react-icons/lu';
import { CiFilter } from 'react-icons/ci';

const Transfer = () => {
    let [arrows, setArrow] = useState("amount")
    const [loading, setLoading] = useState(true);
    let [copy, setCopy] = useState(false)
    let [dropDown, setDropDown] = useState(false)
    let { isDarkMode } = useContext(Context)
    const [filterHide, setFilterHide] = useState(false)

    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    let [open, setOpen] = useState(true)
    let [details, setDetails] = useState([])
    const [modal, setModal] = useState(false)
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
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/refills/?method=${selectMethod && selectMethod}&o=${arrows}_in_usdt&status=${selectStatus && selectStatus}&created_at_before=${time_2 ? endDate + "T" + time_2 : endDate}&created_at_after=${time ? startDate + "T" + time : startDate}&hash=${hash && hash}&page=${currentPage === "" ? 1 : currentPage}`, {
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
            } else if (response.status === 404) {
                setCurrentPage(1);
            } else if (response.ok) {
                const data = await response.json();
                setData(data);
            } else {
                const errorText = await response.text();
            }
        } catch (error) {
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
        setEndTime(cleanedValue);
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
            .catch(err => '');
    };
    useEffect(() => {
        handleFilter();
    }, [arrows]);
    return (
        <div onClick={() => { dropDown ? setDropDown(!dropDown) : ""; navBtn ? setNavBtn(!navBtn) : ""; }} className={`${isDarkMode ? "bg-[#000] border-black" : "bg-[#E9EBF7] border-[#F4F4F5] border"} min-h-[100vh]  relative  border `}>
            <div className='flex'>
                <div className="max-md:hidden">
                    <div className={`${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5] border"}  min-h-[100vh] h-full z-20  relative `}>
                        <h3 className={`py-[15px] flex items-center justify-start ml-[8px] font-medium px-[8px] ${isDarkMode ? "text-white" : "text-black"}`}><img className='max-w-[40px]' src={`/assets/logo/${isDarkMode ? "Logo_dark.svg" : "Logo_light.svg"}`} /></h3>
                        <div className={` ${!open ? "min-w-[263px]" : "min-w-0"}  transition-all duration-300`}>
                            <div className="">
                                {localStorage.getItem("role") !== "trader" &&
                                    <NavLink to={"/dash"} className="py-[12px] group min-h-[48px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px]">
                                        <svg width="24" height="24" className='fill-[#8D8F9B] ' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" />
                                        </svg>
                                        <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-10 p-2 shadow-xl rounded-md bg-[#fff] text-[#BFC0C9] text-[14px]  font-medium ml-[8px]   whitespace-nowrap`}>Управления депозитами</p>
                                    </NavLink>
                                }
                                <NavLink to={"/deposit"} className="py-[12px] group min-h-[48px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                                    <svg width="24" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" fill="#8D8F9B" />
                                    </svg>
                                    <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-10 p-2 shadow-xl rounded-md bg-[#fff] text-[#BFC0C9] text-[14px] font-medium ml-[8px] whitespace-nowrap `}>Пополнение депозита</p>

                                </NavLink>
                                <NavLink to={"/payout"} className="py-[12px] group min-h-[48px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.3633 19.6364H18.5452C16.1391 19.6364 14.1816 17.6789 14.1816 15.2728C14.1816 12.8668 16.1391 10.9093 18.5452 10.9093H22.3633C22.4349 10.9093 22.5059 10.8953 22.5721 10.8679C22.6383 10.8405 22.6985 10.8003 22.7491 10.7496C22.7998 10.699 22.8399 10.6388 22.8673 10.5726C22.8947 10.5064 22.9088 10.4355 22.9088 10.3638V8.7275C22.9088 7.5837 22.0216 6.6535 20.9006 6.56329L17.7681 1.09179C17.4778 0.585754 17.009 0.224073 16.4481 0.0738875C15.8899 -0.0752748 15.3061 0.00306481 14.8064 0.293873L4.06783 6.5457H2.1818C0.978529 6.5457 0 7.52418 0 8.7275V21.8182C0 23.0215 0.978478 24 2.1818 24H20.727C21.9302 24 22.9088 23.0215 22.9088 21.8182V20.1819C22.9088 20.1102 22.8947 20.0393 22.8673 19.9731C22.8399 19.9069 22.7998 19.8467 22.7491 19.7961C22.6985 19.7454 22.6383 19.7052 22.5721 19.6778C22.5059 19.6504 22.4349 19.6363 22.3633 19.6364ZM18.4445 4.4698L19.633 6.5457H14.8789L18.4445 4.4698ZM6.23598 6.5457L15.3556 1.23666C15.6022 1.0923 15.8904 1.05395 16.1658 1.12748C16.4444 1.20204 16.6766 1.38209 16.821 1.63403L16.8221 1.63603L8.38935 6.5457H6.23598Z" fill="#8D8F9B" />
                                        <path d="M22.3642 12H18.5461C16.7414 12 15.2734 13.468 15.2734 15.2727C15.2734 17.0773 16.7414 18.5453 18.5461 18.5453H22.3642C23.2666 18.5453 24.0006 17.8113 24.0006 16.909V13.6363C24.0006 12.734 23.2666 12 22.3642 12ZM18.5461 16.3635C17.9448 16.3635 17.4552 15.874 17.4552 15.2727C17.4552 14.6713 17.9448 14.1818 18.5461 14.1818C19.1475 14.1818 19.637 14.6713 19.637 15.2727C19.637 15.874 19.1475 16.3635 18.5461 16.3635Z" fill="#8D8F9B" />
                                    </svg>
                                    <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-10 p-2 shadow-xl rounded-md bg-[#fff] text-[#BFC0C9] text-[14px] font-medium ml-[8px] whitespace-nowrap`}>Выплаты</p>
                                </NavLink>
                                <div className="py-[12px] group min-h-[48px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
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
                                    <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-10 p-2 shadow-xl rounded-md bg-[#fff] text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Саппорт Транзакций</p>
                                </div>
                                <NavLink to={"/transfer"} className="py-[12px] group  min-h-[48px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] bg-[#2D54DD4D]">
                                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.0625 1.53764C19.71 1.18514 19.71 0.615139 20.0625 0.266389C20.415 -0.0823614 20.985 -0.0861114 21.3337 0.266389L23.7337 2.66639C23.9025 2.83514 23.9963 3.06389 23.9963 3.30389C23.9963 3.54389 23.9025 3.77264 23.7337 3.94139L21.3337 6.34139C20.9812 6.69389 20.4112 6.69389 20.0625 6.34139C19.7137 5.98889 19.71 5.41889 20.0625 5.07014L20.925 4.20764L14.4 4.20014C13.9012 4.20014 13.5 3.79889 13.5 3.30014C13.5 2.80139 13.9012 2.40014 14.4 2.40014H20.9287L20.0625 1.53764ZM3.9375 14.1376L3.075 15.0001H9.6C10.0987 15.0001 10.5 15.4014 10.5 15.9001C10.5 16.3989 10.0987 16.8001 9.6 16.8001H3.07125L3.93375 17.6626C4.28625 18.0151 4.28625 18.5851 3.93375 18.9339C3.58125 19.2826 3.01125 19.2864 2.6625 18.9339L0.2625 16.5376C0.09375 16.3689 0 16.1401 0 15.9001C0 15.6601 0.09375 15.4314 0.2625 15.2626L2.6625 12.8626C3.015 12.5101 3.585 12.5101 3.93375 12.8626C4.2825 13.2151 4.28625 13.7851 3.93375 14.1339L3.9375 14.1376ZM3.6 2.40014H12.6712C12.5325 2.67014 12.45 2.97389 12.45 3.30014C12.45 4.37639 13.3237 5.25014 14.4 5.25014H18.8025C18.6525 5.88764 18.825 6.58139 19.32 7.08014C20.0812 7.84139 21.315 7.84139 22.0763 7.08014L22.8 6.35639V14.4001C22.8 15.7239 21.7237 16.8001 20.4 16.8001H11.3287C11.4675 16.5301 11.55 16.2264 11.55 15.9001C11.55 14.8239 10.6762 13.9501 9.6 13.9501H5.1975C5.3475 13.3126 5.175 12.6189 4.68 12.1201C3.91875 11.3589 2.685 11.3589 1.92375 12.1201L1.2 12.8439V4.80014C1.2 3.47639 2.27625 2.40014 3.6 2.40014ZM6 4.80014H3.6V7.20014C4.92375 7.20014 6 6.12389 6 4.80014ZM20.4 12.0001C19.0762 12.0001 18 13.0764 18 14.4001H20.4V12.0001ZM12 13.2001C12.9548 13.2001 13.8705 12.8209 14.5456 12.1457C15.2207 11.4706 15.6 10.5549 15.6 9.60014C15.6 8.64536 15.2207 7.72969 14.5456 7.05455C13.8705 6.37942 12.9548 6.00014 12 6.00014C11.0452 6.00014 10.1295 6.37942 9.45442 7.05455C8.77928 7.72969 8.4 8.64536 8.4 9.60014C8.4 10.5549 8.77928 11.4706 9.45442 12.1457C10.1295 12.8209 11.0452 13.2001 12 13.2001Z" fill="#2D54DD" />
                                    </svg>
                                    <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-12 p-2 shadow-xl rounded-md bg-[#fff] text-[#2D54DD] text-[14px]  font-medium ml-[8px]   whitespace-nowrap`}>Переводы</p>
                                </NavLink>
                                <NavLink to={"/ad"} className="py-[12px] group cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] min-h-[48px]">
                                    <svg width="22" height="17" viewBox="0 0 22 17" fill="#8D8F9B" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10.5V9H6.5V10.5H5ZM0.5 3C0.5 2.20435 0.816071 1.44129 1.37868 0.87868C1.94129 0.31607 2.70435 0 3.5 0H14C14.7956 0 15.5587 0.31607 16.1213 0.87868C16.6839 1.44129 17 2.20435 17 3V12.75C17 12.9489 17.079 13.1397 17.2197 13.2803C17.3603 13.421 17.5511 13.5 17.75 13.5C17.9489 13.5 18.1397 13.421 18.2803 13.2803C18.421 13.1397 18.5 12.9489 18.5 12.75V3C19.2956 3 20.0587 3.31607 20.6213 3.87868C21.1839 4.44129 21.5 5.20435 21.5 6V12.75C21.5 13.7446 21.1049 14.6984 20.4016 15.4017C19.6984 16.1049 18.7446 16.5 17.75 16.5H4.25C3.25544 16.5 2.30161 16.1049 1.59835 15.4017C0.895088 14.6984 0.5 13.7446 0.5 12.75V3ZM4.25 4.5C4.05109 4.5 3.86032 4.57902 3.71967 4.71967C3.57902 4.86032 3.5 5.05109 3.5 5.25C3.5 5.44891 3.57902 5.63968 3.71967 5.78033C3.86032 5.92098 4.05109 6 4.25 6H13.25C13.4489 6 13.6397 5.92098 13.7803 5.78033C13.921 5.63968 14 5.44891 14 5.25C14 5.05109 13.921 4.86032 13.7803 4.71967C13.6397 4.57902 13.4489 4.5 13.25 4.5H4.25ZM4.25 7.5C4.05109 7.5 3.86032 7.57902 3.71967 7.71967C3.57902 7.86032 3.5 8.05109 3.5 8.25V11.25C3.5 11.4489 3.57902 11.6397 3.71967 11.7803C3.86032 11.921 4.05109 12 4.25 12H7.25C7.44891 12 7.63968 11.921 7.78033 11.7803C7.92098 11.6397 8 11.4489 8 11.25V8.25C8 8.05109 7.92098 7.86032 7.78033 7.71967C7.63968 7.57902 7.44891 7.5 7.25 7.5H4.25ZM10.25 7.5C10.0511 7.5 9.86032 7.57902 9.71967 7.71967C9.57902 7.86032 9.5 8.05109 9.5 8.25C9.5 8.44891 9.57902 8.63968 9.71967 8.78033C9.86032 8.92098 10.0511 9 10.25 9H13.25C13.4489 9 13.6397 8.92098 13.7803 8.78033C13.921 8.63968 14 8.44891 14 8.25C14 8.05109 13.921 7.86032 13.7803 7.71967C13.6397 7.57902 13.4489 7.5 13.25 7.5H10.25ZM10.25 10.5C10.0511 10.5 9.86032 10.579 9.71967 10.7197C9.57902 10.8603 9.5 11.0511 9.5 11.25C9.5 11.4489 9.57902 11.6397 9.71967 11.7803C9.86032 11.921 10.0511 12 10.25 12H13.25C13.4489 12 13.6397 11.921 13.7803 11.7803C13.921 11.6397 14 11.4489 14 11.25C14 11.0511 13.921 10.8603 13.7803 10.7197C13.6397 10.579 13.4489 10.5 13.25 10.5H10.25Z" />
                                    </svg>
                                    <p className={`w-max group-hover:opacity-100 opacity-0 group-hover:visible invisible duration-300 absolute left-10 p-2 shadow-xl rounded-md bg-[#fff] text-[#BFC0C9] text-[14px]  font-medium ml-[8px]   whitespace-nowrap`}>Объявления</p>
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`flex w-full md:justify-end max-md:px-4 ${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5]"} absolute right-0 pr-[16px] py-2 items-center `}>
                    <div className="flex max-md:w-full items-center justify-between">
                        <div className="mr-[16px] max-md:hidden">
                            <h4 className={`text-[14px] font-normal capitalize ${!isDarkMode ? "text-[#18181B]" : "text-[#E7E7E7]"} `}>{localStorage.getItem("username") && localStorage.getItem("username").split("_").join(' ')}</h4>
                            <p className='text-[14px] font-normal text-[#60626C]'>{localStorage.getItem("role") == "admin" ? "Админ" : localStorage.getItem("role") == "merchant" ? "Мерчант" : "Трейдер"}</p>
                        </div>
                        <div className="flex items-center  cursor-pointer justify-between">
                            {/* profile */}
                            <div className='max-md:flex items-center justify-between'>
                                <div onClick={() => setDropDown(!dropDown)} className="bg-[#4CAF50] uppercase  rounded-[100px] text-white w-[48px] h-[48px] flex items-center justify-center">
                                    {(localStorage.getItem("username") && localStorage.getItem("username") !== "undefined") ? (
                                        <>
                                            {localStorage.getItem("username").split("_")[0][0]}
                                            {localStorage.getItem("username").split("_")[1][0]}
                                        </>
                                    ) : ""}
                                </div>
                            </div>
                            <div onClick={() => setDropDown(!dropDown)} className="cursor-pointer">
                                <svg width="16" height="10" viewBox="0 0 12 6" fill="none" className={`ml-2 my-4 ${dropDown ? "rotate-180" : ""} duration-300 `} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.57143 6C5.39315 6 5.21485 5.93469 5.07905 5.80469L0.204221 1.13817C-0.0680735 0.877514 -0.0680735 0.456152 0.204221 0.195494C0.476514 -0.0651646 0.916685 -0.0651646 1.18898 0.195494L5.57143 4.39068L9.95388 0.195494C10.2262 -0.0651646 10.6663 -0.0651646 10.9386 0.195494C11.2109 0.456152 11.2109 0.877514 10.9386 1.13817L6.06381 5.80469C5.92801 5.93469 5.74971 6 5.57143 6Z" fill="#60626C" />
                                </svg>
                            </div>
                        </div>
                        {/* hamburger button */}
                        {
                            !navBtn ?
                                <div onClick={() => setNavBtn(!navBtn)} className="md:hidden">
                                    <svg width="18" height="12" viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 12H17C17.55 12 18 11.55 18 11C18 10.45 17.55 10 17 10H1C0.45 10 0 10.45 0 11C0 11.55 0.45 12 1 12ZM1 7H17C17.55 7 18 6.55 18 6C18 5.45 17.55 5 17 5H1C0.45 5 0 5.45 0 6C0 6.55 0.45 7 1 7ZM0 1C0 1.55 0.45 2 1 2H17C17.55 2 18 1.55 18 1C18 0.45 17.55 0 17 0H1C0.45 0 0 0.45 0 1Z" fill={`${isDarkMode ? "#fff" : "#272727"} `} />
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
                        <div style={{ boxShadow: "0px 4px 12px 1px #0000001A" }} className={` w-full absolute text-[14px] font-normal z-50 md:w-[250px] p-4 ${isDarkMode ? "bg-[#1F1F1F] text-[#E7E7E7]" : "bg-white"}  right-0 md:right-2 top-16 rounded-[12px] h-[84px] duration-300 ${dropDown ? "opacity-100" : "opacity-0 invisible"}  `}>
                            <div className="flex mb-[12px] justify-between">
                                <h4>Тема</h4>
                                <Dark />
                            </div>
                            <NavLink to={"/login"} onClick={() => { localStorage.removeItem("access"); localStorage.removeItem("refresh"); localStorage.removeItem("role") }}>Выйти</NavLink>
                        </div>
                        {/* links mobile */}
                        <div className={` w-full absolute text-[14px] font-normal z-50 p-4 ${isDarkMode ? "bg-[#1F1F1F] text-[#E7E7E7]" : "bg-white shadow-xl"} right-0 top-16 rounded-[12px]  duration-300 ${navBtn ? "opacity-100" : "opacity-0 invisible"}  `}>
                            {localStorage.getItem("role") !== "trader" &&
                                <NavLink to={"/dash"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] ">
                                    <svg width="24" height="24" className='fill-[#8D8F9B]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" />
                                    </svg>
                                    <p className={` text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Управления депозитами</p>
                                </NavLink>
                            }
                            <NavLink to={"/deposit"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px]  ">
                                <svg width="24" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" fill="#8D8F9B" />
                                </svg>
                                <p className={`text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Пополнение депозита</p>
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
                            <NavLink to={"/transfer"} className="py-[12px]  cursor-pointer px-[8px] flex items-center rounded-[4px]  bg-[#2D54DD4D]">
                                <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.0625 1.53764C19.71 1.18514 19.71 0.615139 20.0625 0.266389C20.415 -0.0823614 20.985 -0.0861114 21.3337 0.266389L23.7337 2.66639C23.9025 2.83514 23.9963 3.06389 23.9963 3.30389C23.9963 3.54389 23.9025 3.77264 23.7337 3.94139L21.3337 6.34139C20.9812 6.69389 20.4112 6.69389 20.0625 6.34139C19.7137 5.98889 19.71 5.41889 20.0625 5.07014L20.925 4.20764L14.4 4.20014C13.9012 4.20014 13.5 3.79889 13.5 3.30014C13.5 2.80139 13.9012 2.40014 14.4 2.40014H20.9287L20.0625 1.53764ZM3.9375 14.1376L3.075 15.0001H9.6C10.0987 15.0001 10.5 15.4014 10.5 15.9001C10.5 16.3989 10.0987 16.8001 9.6 16.8001H3.07125L3.93375 17.6626C4.28625 18.0151 4.28625 18.5851 3.93375 18.9339C3.58125 19.2826 3.01125 19.2864 2.6625 18.9339L0.2625 16.5376C0.09375 16.3689 0 16.1401 0 15.9001C0 15.6601 0.09375 15.4314 0.2625 15.2626L2.6625 12.8626C3.015 12.5101 3.585 12.5101 3.93375 12.8626C4.2825 13.2151 4.28625 13.7851 3.93375 14.1339L3.9375 14.1376ZM3.6 2.40014H12.6712C12.5325 2.67014 12.45 2.97389 12.45 3.30014C12.45 4.37639 13.3237 5.25014 14.4 5.25014H18.8025C18.6525 5.88764 18.825 6.58139 19.32 7.08014C20.0812 7.84139 21.315 7.84139 22.0763 7.08014L22.8 6.35639V14.4001C22.8 15.7239 21.7237 16.8001 20.4 16.8001H11.3287C11.4675 16.5301 11.55 16.2264 11.55 15.9001C11.55 14.8239 10.6762 13.9501 9.6 13.9501H5.1975C5.3475 13.3126 5.175 12.6189 4.68 12.1201C3.91875 11.3589 2.685 11.3589 1.92375 12.1201L1.2 12.8439V4.80014C1.2 3.47639 2.27625 2.40014 3.6 2.40014ZM6 4.80014H3.6V7.20014C4.92375 7.20014 6 6.12389 6 4.80014ZM20.4 12.0001C19.0762 12.0001 18 13.0764 18 14.4001H20.4V12.0001ZM12 13.2001C12.9548 13.2001 13.8705 12.8209 14.5456 12.1457C15.2207 11.4706 15.6 10.5549 15.6 9.60014C15.6 8.64536 15.2207 7.72969 14.5456 7.05455C13.8705 6.37942 12.9548 6.00014 12 6.00014C11.0452 6.00014 10.1295 6.37942 9.45442 7.05455C8.77928 7.72969 8.4 8.64536 8.4 9.60014C8.4 10.5549 8.77928 11.4706 9.45442 12.1457C10.1295 12.8209 11.0452 13.2001 12 13.2001Z" fill="#2D54DD" />
                                </svg>
                                <p className={`text-[#2D54DD] text-[14px]  font-medium ml-[8px]  whitespace-nowrap`}>Переводы</p>
                            </NavLink>
                            <NavLink to={"/ad"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] ">
                                <svg width="22" height="17" viewBox="0 0 22 17" fill="#8D8F9B" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 10.5V9H6.5V10.5H5ZM0.5 3C0.5 2.20435 0.816071 1.44129 1.37868 0.87868C1.94129 0.31607 2.70435 0 3.5 0H14C14.7956 0 15.5587 0.31607 16.1213 0.87868C16.6839 1.44129 17 2.20435 17 3V12.75C17 12.9489 17.079 13.1397 17.2197 13.2803C17.3603 13.421 17.5511 13.5 17.75 13.5C17.9489 13.5 18.1397 13.421 18.2803 13.2803C18.421 13.1397 18.5 12.9489 18.5 12.75V3C19.2956 3 20.0587 3.31607 20.6213 3.87868C21.1839 4.44129 21.5 5.20435 21.5 6V12.75C21.5 13.7446 21.1049 14.6984 20.4016 15.4017C19.6984 16.1049 18.7446 16.5 17.75 16.5H4.25C3.25544 16.5 2.30161 16.1049 1.59835 15.4017C0.895088 14.6984 0.5 13.7446 0.5 12.75V3ZM4.25 4.5C4.05109 4.5 3.86032 4.57902 3.71967 4.71967C3.57902 4.86032 3.5 5.05109 3.5 5.25C3.5 5.44891 3.57902 5.63968 3.71967 5.78033C3.86032 5.92098 4.05109 6 4.25 6H13.25C13.4489 6 13.6397 5.92098 13.7803 5.78033C13.921 5.63968 14 5.44891 14 5.25C14 5.05109 13.921 4.86032 13.7803 4.71967C13.6397 4.57902 13.4489 4.5 13.25 4.5H4.25ZM4.25 7.5C4.05109 7.5 3.86032 7.57902 3.71967 7.71967C3.57902 7.86032 3.5 8.05109 3.5 8.25V11.25C3.5 11.4489 3.57902 11.6397 3.71967 11.7803C3.86032 11.921 4.05109 12 4.25 12H7.25C7.44891 12 7.63968 11.921 7.78033 11.7803C7.92098 11.6397 8 11.4489 8 11.25V8.25C8 8.05109 7.92098 7.86032 7.78033 7.71967C7.63968 7.57902 7.44891 7.5 7.25 7.5H4.25ZM10.25 7.5C10.0511 7.5 9.86032 7.57902 9.71967 7.71967C9.57902 7.86032 9.5 8.05109 9.5 8.25C9.5 8.44891 9.57902 8.63968 9.71967 8.78033C9.86032 8.92098 10.0511 9 10.25 9H13.25C13.4489 9 13.6397 8.92098 13.7803 8.78033C13.921 8.63968 14 8.44891 14 8.25C14 8.05109 13.921 7.86032 13.7803 7.71967C13.6397 7.57902 13.4489 7.5 13.25 7.5H10.25ZM10.25 10.5C10.0511 10.5 9.86032 10.579 9.71967 10.7197C9.57902 10.8603 9.5 11.0511 9.5 11.25C9.5 11.4489 9.57902 11.6397 9.71967 11.7803C9.86032 11.921 10.0511 12 10.25 12H13.25C13.4489 12 13.6397 11.921 13.7803 11.7803C13.921 11.6397 14 11.4489 14 11.25C14 11.0511 13.921 10.8603 13.7803 10.7197C13.6397 10.579 13.4489 10.5 13.25 10.5H10.25Z" />
                                </svg>
                                <p className={` text-[#BFC0C9] text-[14px]  font-medium ml-[8px]   whitespace-nowrap`}>Объявления</p>
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className={`mt-[50px] md:mt-[94px] w-full rounded-[24px] pr-[32px] pl-[32px] max-md:pl-4 max-md:pr-0 pt-[32px] ${isDarkMode ? "md:bg-[#1F1F1F]" : "md:bg-[#F5F6FC]"}  overflow-x-auto md:mr-[40px] md:mx-[32px]  `}>
                    <div className="flex max-lg:flex-col relative gap-x-2 justify-between pr-4 items-center mb-4">
                        <div className="flex max-[270px]:flex-wrap items-center justify-between w-full ">

                            <h3 className={`font-semibold text-[24px] max-lg:mx-auto max-md:mx-0 md:text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Переводы</h3>
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
                            <div className="relative max-lg:my-3  max-md:w-full">
                                <input type="text" placeholder='Поиск' style={{ color: isDarkMode ? "#fff" : "#616E90" }} className={`border  ${isDarkMode ? "border-[#D9D9D940]" : "border-[#C5C7CD]"}   bg-transparent   pl-7 placeholder:text-[#616E90] placeholder:font-medium placeholder:text-xs  relative md:max-w-[150px]  max-md:w-full py-[9px] lg:mr-[15px] rounded-[8px] outline-none `} />
                                <div className="flex items-center top-[3px] absolute">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="#616E90" className='m-[10px]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1419 14L8.02728 8.88525C7.62011 9.22143 7.15187 9.48452 6.62256 9.67453C6.09324 9.86454 5.54567 9.95955 4.97984 9.95955C3.58802 9.95955 2.41008 9.47767 1.44605 8.51392C0.482017 7.55018 0 6.37253 0 4.98099C0 3.58959 0.481881 2.41154 1.44564 1.44684C2.40941 0.482281 3.58707 0 4.97862 0C6.37005 0 7.54811 0.482009 8.51283 1.44603C9.4774 2.41005 9.95969 3.58796 9.95969 4.97977C9.95969 5.56133 9.86211 6.11677 9.66694 6.64608C9.47163 7.17538 9.21111 7.63575 8.88538 8.02716L14 13.1417L13.1419 14ZM4.97984 8.73827C6.02911 8.73827 6.91782 8.37413 7.64597 7.64586C8.37425 6.91772 8.73839 6.02902 8.73839 4.97977C8.73839 3.93052 8.37425 3.04183 7.64597 2.31369C6.91782 1.58541 6.02911 1.22128 4.97984 1.22128C3.93058 1.22128 3.04187 1.58541 2.31372 2.31369C1.58544 3.04183 1.22129 3.93052 1.22129 4.97977C1.22129 6.02902 1.58544 6.91772 2.31372 7.64586C3.04187 8.37413 3.93058 8.73827 4.97984 8.73827Z" fill="#616E90" />
                                    </svg>
                                </div>
                            </div>
                            <button onClick={handleDownload} className='text-[#2D54DD] max-lg:mb-2 text-[14px] max-md:hidden font-normal border-[#2D54DD] border-2 rounded-[8px] py-[8px] min-w-[145px] '>Скачать отчет</button>
                        </div>
                        <button onClick={() => { setModal(!modal) }} className='bg-[#2D54DD] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px] max-md:hidden'>Новый перевод</button>
                    </div>
                    {/* filter */}
                    <button onClick={() => setFilterHide(!filterHide)} className='text-[#2D54DD] mb-2 flex justify-center items-center gap-x-1 text-[14px] max-md:hidden font-normal border-[#2D54DD] border-2 rounded-[8px] py-[8px] min-w-[115px]'>
                        <CiFilter size={20} />
                        {!filterHide ? "Открыть" : "Скрыть"}
                    </button>
                    <div className={`${!filterHide ? 'md:hidden' : ''}`}>
                        <div className={`${!filterBtn && "max-md:hidden"} flex max-md:grid max-md:grid-cols-2 max-md:justify-items-center max-[450px]:grid-cols-1  max-[1200px]:justify-center flex-wrap py-[24px] pr-4 text-[14px] gap-2 text-[#717380]`}>
                            <input onChange={(e) => setHash(e.target.value)} placeholder='Трейдер' type="text" className={` pl-[12px] w-[149.5px] h-[40px] rounded-[4px] ${isDarkMode ? "bg-[#121212]   text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                            <select onChange={(e) => setSelectStatus(e.target.value)} className={`${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] min-w-[149.5px] h-[40px]`} name="" id="">
                                <option defaultValue={"Статус"} value={""} >Статус</option>
                                <option value={"success"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Успешно</option>
                                <option value={"pending"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>В обработке</option>
                                <option value={"failed"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Отклонено</option>
                            </select>
                            <div className={`flex items-center pl-[12px] rounded-[4px] min-w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} cursor-pointer`} onClick={() => startDateRef.current && startDateRef.current.showPicker()}>
                                <svg width="24" height="24" className='' viewBox="0 0 24 24" fill={`${isDarkMode ? "#E7E7E7" : "#252840"}`} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                                </svg>
                                <input ref={startDateRef} type="date" name="" id="date-picker" min="2023-01-01" className='bg-transparent outline-none relative mt-1 ml-1 w-full cursor-pointer' onChange={(e) => setStartDate(e.target.value)} defaultValue={"2024-10-16"} />
                            </div>

                            <div className={`flex items-center pl-[12px] rounded-[4px] w-[149.5px] relative h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className='absolute top-2' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" fill="#717380" />
                                    </svg>
                                </div>
                                <input value={time} onChange={handleStartTimeChange} type="text" className='bg-transparent outline-none pl-7' placeholder='00:00' />
                            </div>
                            <div className={`flex overflow-hidden items-center  pl-[12px] rounded-[4px] min-w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC] text-black"}`} onClick={() => endDateRef.current && endDateRef.current.showPicker()}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" fill="#717380" />
                                </svg>
                                <div className="">
                                    <input ref={endDateRef} type="date" name="" id="" min="2024-01-01" className='bg-transparent outline-none mt-1 ml-1' onChange={(e) => setEndDate(e.target.value)} defaultValue={"2024-12-12"} />
                                </div>
                            </div>
                            <div className={`flex overflow-hidden items-center pl-[12px] relative rounded-[4px] w-[149.5px] h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className='absolute top-2' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" fill="#717380" />
                                    </svg>
                                </div>
                                <input value={time_2} onChange={handleEndTimeChange} type="text" className='bg-transparent outline-none pl-7' placeholder='23:59' />
                            </div>
                            <div className="flex justify-center mb-2 max-w-[160px] max-md:hidden">
                                <button onClick={handleFilterApply} className='bg-[#2E70F5] text-[#fff]  py-[9.5px] font-normal min-w-[156px] text-[14px] rounded-[8px]'>
                                    Применить фильтр
                                </button>
                            </div>
                            <div className="flex justify-center w-full min-[450px]:hidden mb-2 ">
                                <button onClick={handleFilterApply} className='bg-[#2E70F5] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                    Применить фильтр
                                </button>
                            </div>
                            <div className="flex justify-center w-full min-[450px]:hidden mb-2 ">
                                <button onClick={() => { setModal(!modal) }} className='bg-[#2D54DD] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                    Новый перевод
                                </button>
                            </div>
                        </div>
                        <div className={`hidden justify-center w-full  ${filterBtn && "max-md:flex max-md:flex-col items-center gap-y-2"} max-[450px]:hidden mb-2 `}>
                            <div className="">
                                <button onClick={handleFilterApply} className='bg-[#2E70F5] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                    Применить фильтр
                                </button>
                            </div>
                            <button onClick={() => { setModal(!modal) }} className='bg-[#2D54DD] text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>Новый перевод</button>
                        </div>
                    </div>
                    <div className={`fixed ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2  -translate-x-1/2 z-50 ${copy ? "top-20" : "top-[-200px] "} duration-300 mx-auto left-1/2 `}>
                        <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
                        <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
                    </div>
                    <div className={`${!loading ? (isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]") : ""}`}>
                        <div className="hidden max-md:block">
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
                                <DataTable scrollable scrollHeight="65vh" value={data?.results} rows={10} tableStyle={{ minWidth: '50rem' }} className={`${isDarkMode ? "dark_mode" : "light_mode"} `}>
                                    <Column body={(rowData) => {
                                        return (
                                            <div className='cursor-pointer select-text'>
                                                ID
                                            </div>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="ID" ></Column>
                                    <Column body={(rowData) => {
                                        return (
                                            <div className='cursor-pointer select-text'>
                                                Трейдер 1
                                            </div>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="Трейдер" ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div className='select-text'>
                                                318в615р-7de34-3j3j-dug6-a98d73v8s8s8
                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Внешний ID"  ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="price_2" header="Сумма" body={(rowData) => {
                                        return (
                                            <div>
                                                <>
                                                    <div className="selectable-text">{rowData.amount}</div>
                                                </>
                                            </div>
                                        )

                                    }} ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div>
                                                2024-09-11 16:00
                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Дата и время"  ></Column>



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

                        <div className="block max-md:hidden">
                            {loading ? (
                                <Loading />
                            ) :
                                <DataTable value={data?.results} rows={10} tableStyle={{ minWidth: '50rem' }} className={`${isDarkMode ? "dark_mode" : "light_mode"} `}>
                                    <Column body={(rowData) => {
                                        return (
                                            <div className='cursor-pointer select-text'>
                                                ID
                                            </div>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="ID" ></Column>
                                    <Column body={(rowData) => {
                                        return (
                                            <div className='cursor-pointer select-text'>
                                                Трейдер 1
                                            </div>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="Трейдер" ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div className='select-text'>
                                                318в615р-7de34-3j3j-dug6-a98d73v8s8s8
                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Внешний ID"  ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="price_2" header="Сумма" body={(rowData) => {
                                        return (
                                            <div>
                                                <>
                                                    <div className="selectable-text">{rowData.amount}</div>
                                                </>
                                            </div>
                                        )

                                    }} ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div>
                                                2024-09-11 16:00
                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Дата и время"  ></Column>



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

                                </DataTable>}
                        </div>
                        {/* izz */}
                    </div>
                    {loading ? "" :
                        <div className="flex items-center justify-between">
                            {data?.count >= 10 &&
                                <div className="pagination-buttons bg-transparent flex items-center my-4">

                                    <button className={`text-[#2D54DD]`} onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage)}>
                                        <FaAngleLeft />
                                    </button>


                                    <input
                                        type="number"
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === "") {
                                                setCurrentPage("");
                                            } else {
                                                const page = Math.max(1, Math.min(totalPages, Number(value)));
                                                setCurrentPage(page);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (currentPage === "") setCurrentPage(1);
                                        }}
                                        value={currentPage}
                                        className={`w-[40px] border mx-2 text-center page-button rounded-md px-[12px] py-1 ${isDarkMode ? "text-[#fff]" : ""} bg-[#D9D9D91F]`}
                                    />


                                    <button className={`text-[#2D54DD]`} onClick={() => setCurrentPage(totalPages > currentPage ? currentPage + 1 : currentPage)}>
                                        <FaAngleRight />
                                    </button>
                                </div>
                            }
                            <p className={`text-end w-full my-3 text-[14px] font-normal mr-4  z-30 duration-300 ${isDarkMode ? "text-[#FFFFFF33]" : "text-[#252840]"}`}>{data?.count ? data?.count : 0} результата</p>
                        </div>
                    }

                    <div onClick={() => setModal(!modal)} className={`${!modal && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
                    <div className={`${!modal ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[784px] `}>
                        <div className="p-8">
                            <div className="">
                                <div className="mb-8">
                                    <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Новый перевод </h3>
                                    <svg onClick={() => setModal(!modal)} className='absolute right-8 top-10 cursor-pointer' width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" fill={`${isDarkMode ? "#fff" : "#222222"} `} />
                                    </svg>
                                    <h5 className='text-[14px] text-[#60626C]'>Заполните форму</h5>
                                </div>
                                <div className="modal_payout blur-0  ">
                                    <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} blur-0 mb-2`}>Желаемая сумма</h5>
                                    <input style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} required placeholder='Сумма' type="text" className={`${isDarkMode ? "text-white" : ""} blur-0 mb-2 bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                                    <div className={`text-[#60626C] text-[12px]`}>
                                        <p>Минимальная сумма перевода — 10 000.</p>
                                        <p>Сумма должна быть кратной 1000.</p>
                                    </div>
                                    <div className={`flex justify-end mt-2 text-white`}>
                                        <form>
                                            <button type='submit' className='bg-[#2E70F5] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                Перевести
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

            </div>
        </div>
    )
}

export default Transfer