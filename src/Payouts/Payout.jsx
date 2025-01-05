import 'swiper/css';
import axios from 'axios';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/swiper-bundle.css';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { LuCopy } from "react-icons/lu";
import Sidebar from '../Sidebar/Sidebar';
import Loading from '../Loading/Loading';
import { CiFilter } from 'react-icons/ci';
import { GoUpload } from "react-icons/go";
import { Column } from 'primereact/column';
import 'pdfjs-dist/build/pdf.worker.entry';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { useKeenSlider } from 'keen-slider/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import { Context } from '../context/ContextProvider';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useEffect, useState, useRef, useContext } from 'react';
const Payout = () => {
    const abortControllerRef = useRef(null);
    const isPayoutPage = location.pathname == "/payout"
    const [swiperIndex, setSwiperIndex] = useState(0);
    const mainSwiperRef = useRef(null);
    const thumbsContainerRef = useRef(null);

    useEffect(() => {
        if (thumbsContainerRef.current) {
            const thumbsContainer = thumbsContainerRef.current;
            const activeThumb = thumbsContainer.children[swiperIndex];
            const containerWidth = thumbsContainer.offsetWidth;
            const activeThumbWidth = activeThumb.offsetWidth;
            const scrollPosition = activeThumb.offsetLeft - (containerWidth / 2) + (activeThumbWidth / 2);

            thumbsContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [swiperIndex]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const [sliderRef, instanceRef] = useKeenSlider({
        slides: {
            perView: 1,
            spacing: 10,
        },
        loop: false,
        initial: 0,
        animationEnded(s) {
            const newSlideIndex = s.track.details.rel;
            setCurrentSlide(newSlideIndex);
            scrollToThumbnail(newSlideIndex);
        }
    });

    const [thumbnailRef, thumbnailInstanceRef] = useKeenSlider({
        slides: {
            perView: 4,
            spacing: 10,
        },
        centered: true,

    });

    const scrollToThumbnail = (index) => {
        const perViewThumbnails = 4;

        if (thumbnailInstanceRef.current) {
            const targetPosition = Math.max(0, index - Math.floor(perViewThumbnails / 2));
            thumbnailInstanceRef.current.moveToIdx(targetPosition);
        }
    };

    const handleThumbnailClick = (index) => {
        setCurrentSlide(index);
        if (instanceRef.current) {
            instanceRef.current.moveToIdx(index);
        }
        scrollToThumbnail(index);
    };


    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    let [status, setStatus] = useState({ "handleCancel": null, "handleUpload": null, "handleAccept": null })
    const [loading, setLoading] = useState(true);
    let [dropDown, setDropDown] = useState(false)
    let { isDarkMode } = useContext(Context)
    let navigate = useNavigate()
    const [data, setData] = useState([])
    let [id, setId] = useState(1)
    let [reason, setReason] = useState("")
    const [filterHide, setFilterHide] = useState(false)

    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    let [query, setQuery] = useState("")
    let [details, setDetails] = useState([])
    const [modal, setModal] = useState(false)
    const [modalChek, setModalChek] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((data?.count || 1) / 10);

    const [startDate, setStartDate] = useState("2024-10-16");
    const [endDate, setEndDate] = useState("");

    let [merchant, setMerchant] = useState("")
    let [trader, setTrader] = useState("")
    let [selectStatus, setSelectStatus] = useState("")
    let [selectMethod, setSelectMethod] = useState("")

    const [time, setTime] = useState('');
    const [time_2, setTime_2] = useState('');
    // mobile
    const [filterBtn, setFilterBtn] = useState(false)
    const [searchBtn, setSearchBtn] = useState(false)
    const [navBtn, setNavBtn] = useState(false)

    let [copy, setCopy] = useState(false)
    let [otkImg, setOtkImg] = useState(null)
    let [otkImgDesc, setOtkImgDesc] = useState(null)

    useEffect(() => {
        setThumbsSwiper(thumbsSwiper)
    }, [thumbsSwiper]);

    const handleCopy = (e) => {
        const textElement = e.currentTarget.parentElement.nextElementSibling;
        const textToCopy = Array.from(textElement.querySelectorAll("p")).map(p => p.textContent).join("");

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopy(true);
                setTimeout(() => {
                    setCopy(false);
                }, 1500);
            })
            .catch(error => {
                console.warn(error)
                setCopy(false);
            });
    };
    const handleFilterApply = async () => {
        setCurrentPage(1);
        handleFilter();
    };

    let [method, setMethod] = useState([])

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
            navigate("/login");
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
        setLoading(true);
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/payouts/?q=${query}&status=${selectStatus}&merchant=${merchant}&trader=${trader}&method=${selectMethod}&created_at_after=${time ? startDate + "T" + time : startDate}&created_at_before=${time_2 ? endDate + "T" + time_2 : endDate}&page=${currentPage === "" ? 1 : currentPage}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
                }
            });

            if (response.status === 401) {
                const tokenRefreshed = await refreshAuth();
                if (tokenRefreshed) {
                    handleFilter();
                }
            } else if (response.status === 404) {
                setCurrentPage(1);
            } else if (response.ok) {
                const data = await response.json();
                setData(data);
            }
        } catch (error) {
            console.warn(error)
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleMethod = async () => {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
            navigate("/login");
            return;
        }

        let allMethods = [];
        let page = 1;
        let hasNextPage = true;

        try {
            while (hasNextPage) {
                if (!isPayoutPage) {
                    abortControllerRef.current.abort();
                    break;
                }

                const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/payouts/?status=${selectStatus}&page=${page}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    signal: abortControllerRef.current.signal
                });

                if (response.status === 401) {
                    const tokenRefreshed = await refreshAuth();
                    if (tokenRefreshed) {
                        handleMethod();
                        return;
                    } else {
                        navigate("/login");
                        return;
                    }
                } else if (response.ok) {
                    const data = await response.json();
                    const methodsOnPage = data.results
                        .filter(item => (selectStatus ? selectStatus === item.status : true))
                        .map(item => item.method["name"]);
                    allMethods = allMethods.concat(methodsOnPage);
                    hasNextPage = data.next !== null;
                    page++;
                } else {
                    hasNextPage = false;
                }
            }

            setMethod(allMethods);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem("access");

        if (accessToken && isPayoutPage) {
            abortControllerRef.current = new AbortController();
            handleMethod();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [currentPage, selectStatus, isPayoutPage]);

    useEffect(() => {
        if (currentPage) {
            handleFilter();
        }
    }, [currentPage]);

    const handleDropOrFileChange = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (files.length === 0) return;

        const acceptedFiles = Array.from(files);
        const filePreviews = [];

        await Promise.all(
            acceptedFiles.map(async (file) => {
                if (file.type === "application/pdf") {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        if (!arrayBuffer) throw new Error("PDF dosyası geçerli değil.");

                        const pdfDoc = await PDFDocument.load(arrayBuffer);
                        const numPages = pdfDoc.getPages().length;
                        const blobs = [];
                        for (let i = 0; i < numPages; i++) {
                            const newPdfDoc = await PDFDocument.create();
                            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
                            newPdfDoc.addPage(copiedPage);

                            const pdfBytes = await newPdfDoc.save();
                            const blob = new Blob([pdfBytes], { type: "application/pdf" });
                            blobs.push(blob);
                        }
                        filePreviews.push(blobs);
                    } catch (error) {
                        console.error("PDF işlenirken bir hata oluştu:", error);
                    }
                } else if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    const result = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    filePreviews.push(result);
                }
            })
        );

        setOtkImg((prev) => [...(prev || []), ...filePreviews]);
        setOtkImgDesc((prev) => [...(prev || []), ...acceptedFiles]);

        if (e.target.files) e.target.value = '';
    };

    const [images, setImages] = useState([]);
    const [pdfUrls, setPdfUrls] = useState([])
    let [zoom, setZoom] = useState(false)

    useEffect(() => {
        if (data?.results) {
            const foundItem = data.results.find(item => item.id === id);
            if (foundItem) {
                setPdfUrls(foundItem.receipts);
            }
        }
    }, [data, id, zoom]);

    useEffect(() => {
        if (pdfUrls.length > 0) {
            const loadPdf = async (url) => {
                try {
                    const loadingTask = pdfjsLib.getDocument(url);
                    const pdf = await loadingTask.promise;
                    const scale = 2; // Increase scale for better resolution
                    const pages = [];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        await page.render({ canvasContext: context, viewport }).promise;
                        const imgData = canvas.toDataURL();
                        pages.push(imgData);
                    }

                    return pages;
                } catch (error) {
                    return [];
                }
            };

            const loadAllPdfs = async () => {
                const allImages = [];

                for (const url of pdfUrls) {
                    if (url.endsWith(".pdf")) {
                        const pdfImages = await loadPdf(url);
                        allImages.push(...pdfImages);
                    } else {
                        allImages.push(url);
                    }
                }

                setImages(allImages);
            };

            loadAllPdfs();
        }
    }, [pdfUrls]);


    const handleImageLoad = () => {
        instanceRef.current?.update();
        thumbnailInstanceRef.current?.update();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            otkImgDesc.forEach((file, index) => {
                formData.append(`receipts[${index}]`, file);
            });

            const response = await axios.post(`https://dev.royal-pay.org/api/v1/internal/payouts/submit/${id}/`, formData, {
                headers: {
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
                    "Content-Type": "multipart/form-data"
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
                    return handleUpload();
                } else {
                    navigate("/login");
                }
            } else if (response.status == 400) {
                setStatus((prevError) => ({ ...prevError, "handleUpload": "error" }));
            } else {
                setStatus((prevError) => ({ ...prevError, "handleUpload": "success" }));
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setStatus((prevError) => ({ ...prevError, "handleUpload": "error" }));
        }
    };
    const handleCancel = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('reason', reason);

            if (otkImgDesc && otkImgDesc.length > 0) {
                otkImgDesc.forEach((img, index) => {
                    formData.append(`receipts[${index}]`, img);
                });
            }

            const response = await axios.post(`https://dev.royal-pay.org/api/v1/internal/payouts/deny/${id}/`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
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
                    return handleCancel();
                } else {
                    navigate("/login");
                }
            } else if (response.status === 200) {
                const data = response.data;
                setStatus((prevError) => ({ ...prevError, "handleCancel": "success" }));
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
            }

            if (response.status === 400) {
                setStatus((prevError) => ({ ...prevError, "handleCancel": "error" }));
            } else {
                setStatus((prevError) => ({ ...prevError, "handleCancel": "success" }));
            }
        } catch (error) {
            setStatus((prevError) => ({ ...prevError, "handleCancel": "error" }));
        }
    };

    const handleDepositGet = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/retransfer/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
                    "Accept": "application/json",
                }
            });
            if (response.status == 403) { }
            if (!response.ok) {
            }
        } catch (error) {
            return
        }
    };


    let [depositAmount, setDepositAmount] = useState("")
    let [depositModal, setDepositModal] = useState(false)
    const handleDepositPost = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/retransfer/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
                },
                body: JSON.stringify({
                    "sent_amount": `${depositAmount}`
                }),
            });
            if (!response.ok) {
                // throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
        } catch (error) {
        }
    };

    let [cancel, setCancel] = useState(false)
    let [cancelCheck, setCancelCheck] = useState(false)
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

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const fileInputRef = useRef(null);

    const handleonClick = () => {
        fileInputRef.current.click();
    };

    const handleShow = (info) => {
        setDetails([info])
    }
    const handleAccept = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/payouts/accept/${id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`
                }
            });
            const data = await response.json();
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
                    return handleAccept();
                } else {
                    navigate("/login");
                }
            } else if (response.status == 400) {
                setStatus((prevError) => ({ ...prevError, handleAccept: "error" }));
            } else {
                setStatus((prevError) => ({ ...prevError, handleAccept: "success" }));
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            }
        } catch (error) {
            setStatus((prevError) => ({ ...prevError, handleAccept: "error" }));
        }
    };

    const handleDownload = () => {
        fetch("https://dev.royal-pay.org/api/v1/internal/payouts/download/", {
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
            .catch(err => "");
    };

    const handleDeleteImage_Otk = (index) => {
        setOtkImg((prevImages) => {
            const updatedImages = prevImages.filter((_, i) => i !== index);
            if (updatedImages.length === 0) {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.disabled = false;
            }
            return updatedImages;
        });

        setOtkImgDesc((prevDescribe) => {
            const updatedDescribe = prevDescribe.filter((_, i) => i !== index);
            if (updatedDescribe.length === 0) {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.disabled = false;
            }
            return updatedDescribe;
        });
    };

    useEffect(() => {
        if (modal && mainSwiperRef.current && mainSwiperRef.current.swiper) {
            mainSwiperRef.current?.swiper.slideTo(0);
            setSwiperIndex(0);
        }
    }, [modal]);
    useEffect(() => {
        if (zoom) {
            setCurrentSlide(0)
        }
    }, [zoom]);
    return (
        <div onClick={() => { dropDown ? setDropDown(!dropDown) : ""; navBtn ? setNavBtn(!navBtn) : ""; }} className={`${isDarkMode ? "bg-[#000] border-black" : "bg-[#E9EBF7] border-[#F4F4F5] border"} min-h-[100vh]  relative  border`}>
            <div className='flex'>
                <Sidebar />
                <div className={`mt-[94px] max-md:mt-[50px] w-full rounded-[24px] pr-[32px] pl-[32px] max-md:pl-4 max-md:pr-0 pt-[32px] ${isDarkMode ? "md:bg-[#1F1F1F]" : "md:bg-[#F5F6FC]"} overflow-x-auto md:mr-[40px] md:mx-[32px]   `}>
                    <div className="flex max-lg:flex-col mb-4 gap-x-2 justify-between items-center">
                        <div className="flex max-[270px]:flex-wrap items-center justify-between w-full ">
                            <h3 className={`font-semibold text-[24px] max-lg:mx-auto max-md:mx-0 md:text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Выплаты</h3>
                            {/* poisk */}
                            <div className="flex gap-x-2 md:hidden pr-4">
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
                        {/* lazim */}
                        <div className={` flex max-lg:flex-col items-center max-md:w-full  ${!searchBtn && "max-md:hidden"} `}>
                            <div className="relative max-lg:my-3 max-md:pr-4 max-md:w-full">
                                <input type="text" onChange={(e) => setQuery(e.target.value)} value={query} placeholder='Поиск' style={{ color: isDarkMode ? "#fff" : "#616E90" }} className={`border focus:outline-[#536cfe] ${isDarkMode ? "border-[#D9D9D940]" : "border-[#C5C7CD]"}   bg-transparent   pl-7 placeholder:text-[#616E90] placeholder:font-medium placeholder:text-xs  relative md:max-w-[150px] max-md:w-full py-[9px] lg:mr-[15px] rounded-[8px] `} />
                                <div onClick={() => { handleFilter() }} className="flex items-center top-[3px] absolute cursor-pointer">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="#616E90" className='m-[10px]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1419 14L8.02728 8.88525C7.62011 9.22143 7.15187 9.48452 6.62256 9.67453C6.09324 9.86454 5.54567 9.95955 4.97984 9.95955C3.58802 9.95955 2.41008 9.47767 1.44605 8.51392C0.482017 7.55018 0 6.37253 0 4.98099C0 3.58959 0.481881 2.41154 1.44564 1.44684C2.40941 0.482281 3.58707 0 4.97862 0C6.37005 0 7.54811 0.482009 8.51283 1.44603C9.4774 2.41005 9.95969 3.58796 9.95969 4.97977C9.95969 5.56133 9.86211 6.11677 9.66694 6.64608C9.47163 7.17538 9.21111 7.63575 8.88538 8.02716L14 13.1417L13.1419 14ZM4.97984 8.73827C6.02911 8.73827 6.91782 8.37413 7.64597 7.64586C8.37425 6.91772 8.73839 6.02902 8.73839 4.97977C8.73839 3.93052 8.37425 3.04183 7.64597 2.31369C6.91782 1.58541 6.02911 1.22128 4.97984 1.22128C3.93058 1.22128 3.04187 1.58541 2.31372 2.31369C1.58544 3.04183 1.22129 3.93052 1.22129 4.97977C1.22129 6.02902 1.58544 6.91772 2.31372 7.64586C3.04187 8.37413 3.93058 8.73827 4.97984 8.73827Z" fill="#616E90" />
                                    </svg>
                                </div>
                            </div>
                            <button onClick={handleDownload} className='text-[#fff] text-[14px] max-md:hidden lg:mr-4 font-normal bg-[#536cfe] rounded-[8px] py-[8px] min-w-[156px]'>Скачать отчет</button>
                        </div>
                    </div>
                    {/* filters */}
                    <button onClick={() => setFilterHide(!filterHide)} className='text-[#fff] mb-2 flex justify-center items-center gap-x-1 text-[14px] max-md:hidden font-normal bg-[#536cfe] rounded-[8px] py-[8px] min-w-[115px]'>
                        <CiFilter size={20} />
                        {!filterHide ? "Открыть" : "Скрыть"}
                    </button>
                    <div className={`${!filterHide ? 'md:hidden' : ''}`}>
                        <div className={`${!filterBtn && "max-md:hidden"} flex max-md:grid max-md:grid-cols-2 max-md:justify-items-center max-[450px]:grid-cols-1  max-[1200px]:justify-center flex-wrap   py-[24px] pr-4 text-[14px] gap-2 text-[#717380]`}>
                            {localStorage.getItem("role") !== "trader" &&
                                <input onChange={(e) => setMerchant(e.target.value)} placeholder='Мерчант' type="text" className={` h-[40px] w-[155px] focus:outline-[#536cfe] pl-[12px] rounded-[4px] ${isDarkMode ? "bg-[#121212]  text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                            }
                            {localStorage.getItem("role") !== "merchant" &&
                                <input onChange={(e) => setTrader(e.target.value)} placeholder='Трейдер' type="text" className={` pl-[12px] w-[155px] focus:outline-[#536cfe] h-[40px] rounded-[4px] ${isDarkMode ? "bg-[#121212]   text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                            }
                            <select onChange={(e) => setSelectMethod(e.target.value)} className={`${isDarkMode ? "bg-[#121212]  text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] max-w-[155px] min-w-[155px] h-[40px]`} name="" id="">
                                <option value="" defaultValue={"Метод"}>Метод</option>
                                {[...new Set(method)].map(item => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                            <select onChange={(e) => setSelectStatus(e.target.value)} className={`${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] max-w-[155px] h-[40px]`} name="" id="">
                                <option defaultValue={"Статус"} value={""} >Статус</option>
                                <option value={"completed"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Завершено</option>
                                <option value={"in_progress"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>В обработке</option>
                                <option value={"wait_confirm"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}> Ожидает подтверждения</option>
                                <option value={"pending"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>В ожидании</option>
                                <option value={"canceled"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Отклонено</option>
                            </select>
                            <div className={`flex items-center pl-[12px] rounded-[4px] min-w-[155px] max-w-[155px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} cursor-pointer`} onClick={() => startDateRef.current && startDateRef.current.showPicker()}>
                                <svg width="24" height="24" className='' viewBox="0 0 24 24" fill={`#536cfe`} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                                </svg>
                                <div className="w-max relative">
                                    <div className="absolute h-6 w-5 bg-[#DFDFEC] z-40 right-0 top-0"></div>
                                    <input ref={startDateRef} type="date" name="" id="date-picker" min="2023-01-01" className='bg-transparent outline-none relative mt-1 ml-1 w-full cursor-pointer' onChange={(e) => setStartDate(e.target.value)} defaultValue={"2024-10-16"} />
                                </div>
                            </div>

                            <div className={`flex items-center pl-[12px] rounded-[4px] w-[155px]  relative h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#536cfe" className='absolute top-2' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" />
                                    </svg>
                                </div>
                                <input value={time} onChange={handleStartTimeChange} type="text" className='bg-transparent outline-none pl-7 max-w-[75px]' placeholder='00:00' />
                            </div>

                            <div className={`flex overflow-hidden items-center cursor-pointer  pl-[12px] rounded-[4px] min-w-[155px] max-w-[155px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC] text-black"}`} onClick={() => endDateRef.current && endDateRef.current.showPicker()}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#536cfe" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                                </svg>
                                <div className="w-max relative">
                                    <div className="absolute h-6 w-5 bg-[#DFDFEC] z-40 right-0 top-0"></div>
                                    <input ref={endDateRef} type="date" name="" id="" min="2024-01-01" className='bg-transparent cursor-pointer outline-none mt-1 ml-1' onChange={(e) => setEndDate(e.target.value)} defaultValue={"2024-12-12"} />
                                </div>
                            </div>
                            <div className={`flex overflow-hidden items-center pl-[12px] relative rounded-[4px] w-[155px] h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                                <div className="">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#536cfe" className='absolute top-2' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" />
                                    </svg>
                                </div>
                                <input value={time_2} onChange={handleEndTimeChange} type="text" className='bg-transparent outline-none pl-7' placeholder='23:59' />
                            </div>
                            <div className="flex justify-center mb-2 max-w-[160px] max-md:hidden">
                                <button onClick={handleFilterApply} className='bg-[#536DFE] text-[#fff]  py-[9.5px] font-normal min-w-[156px]  text-[14px] rounded-[8px]'>
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
                            <button onClick={handleFilterApply} className='bg-[#536DFE]  text-[#fff] min-w-[156px] py-[9.5px] font-normal  text-[14px] rounded-[8px]'>
                                Применить фильтр
                            </button>
                        </div>
                    </div>
                    {localStorage.getItem("role") == "merchant" &&
                        <div className="flex justify-between flex-wrap gap-x-3">

                            <form onSubmit={handleDepositGet}>
                                <button type='submit' className='bg-[#536DFE] mb-3 text-[#fff]  px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                    Пополнить депозит
                                </button>
                            </form>

                            <div className=' justify-end' >
                                <button onClick={() => setDepositModal(!depositModal)} className='bg-[#536DFE] mb-3 text-[#fff]  px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px] max-md:mr-4'>
                                    Пополнить депозит
                                </button>
                            </div>

                        </div>
                    }
                    <div className={`${!depositModal && "hidden"} fixed inset-0 bg-[#2222224D] z-40`}></div>
                    <form onSubmit={handleDepositPost} className={`${!depositModal ? "hidden" : ""} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[784px]`}>
                        <div className="p-8 relative">
                            <div className="">
                                <div className="mb-8">
                                    <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}> Пополнить депозит</h3>
                                    <svg className={`${isDarkMode ? "fill-[#fff]" : "fill-[#000]"} absolute right-5 top-8`} onClick={() => { setDepositModal(false); setDepositAmount("") }} width="14" height="15" viewBox="0 0 14 15" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                    </svg>
                                    <h5 className='text-[14px] text-[#60626C]'>Подробная информация</h5>
                                </div>
                                <div className="">
                                    <h3 className={`${isDarkMode ? "text-white" : ""} text-[12px] font-semibold mb-4`}>Чек</h3>
                                    <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="text" className={`${isDarkMode ? "text-white" : ""} focus:outline-[#536cfe] bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 rounded-[4px]`} />
                                </div>
                                <div className="flex w-full text-white justify-end">
                                    <button type='submit' className='bg-[#536DFE] mt-4 px-[37.5px] py-[10px]   font-normal text-[14px] rounded-[8px]'>
                                        Пополнить депозит
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className={`${!loading ? (isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]") : ""}  max-md:pr-0 max-md:pt-0`}>

                        <div className="block max-md:hidden">

                            {loading ? (
                                <Loading />
                            ) :
                                <DataTable value={data?.results} rows={8} tableStyle={{ minWidth: '50rem' }} rowClassName={() => "dataTableRow"} className={`${isDarkMode ? "dark_mode" : "light_mode"} `}>
                                    <Column headerClassName="custom-column-header" body={(rowData) => {
                                        return (
                                            <>
                                                <div className='flex justify-center gap-x-[10px]'>
                                                    {(rowData.status == "completed" || rowData.status == "canceled") ?
                                                        <>
                                                            <div onClick={() => { handleShow(rowData); setModal(true); setId(rowData.id) }} className='cursor-pointer'>
                                                                <svg width="24" height="24" className='mx-auto min-w-[24px] cursor-pointer hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                                    <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                                </svg>
                                                            </div>

                                                            {rowData.receipts.length > 0 &&
                                                                <div onClick={() => { handleShow(rowData); setZoom(!zoom); setId(rowData.id); }} className="cursor-pointer">
                                                                    <svg width="18" height="20" className='hover:fill-[#536DFE] duration-300 fill-[#7A8EA4] cursor-pointer min-w-[20px] mx-auto' viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M15 -0.000244141H3C2.20436 -0.000244141 1.44129 0.315826 0.878684 0.878436C0.316075 1.44104 4.71977e-06 2.20411 4.71977e-06 2.99976V17.7998C-0.000729577 18.1378 0.0842283 18.4705 0.246942 18.7668C0.409657 19.0631 0.644818 19.3133 0.930458 19.4941C1.2161 19.6749 1.5429 19.7803 1.88033 19.8005C2.21776 19.8207 2.55482 19.7551 2.86 19.6098C3.1 19.4898 3.31 19.3598 3.53 19.2298C3.95312 18.9121 4.47107 18.7465 5 18.7598C5.53201 18.7466 6.05309 18.912 6.48 19.2298C7.21843 19.7444 8.10003 20.0138 9 19.9998C9.90008 20.0145 10.7819 19.745 11.52 19.2298C11.9466 18.9113 12.4679 18.7458 13 18.7598C13.5292 18.7449 14.0476 18.9106 14.47 19.2298C14.6866 19.3649 14.9103 19.4884 15.14 19.5998C15.4444 19.7447 15.7806 19.8104 16.1172 19.7907C16.4538 19.7709 16.7799 19.6664 17.0653 19.4868C17.3507 19.3072 17.586 19.0583 17.7494 18.7634C17.9129 18.4684 17.9991 18.1369 18 17.7998V2.99976C18 2.20411 17.6839 1.44104 17.1213 0.878436C16.5587 0.315826 15.7957 -0.000244141 15 -0.000244141ZM9 13.9998H5C4.73479 13.9998 4.48043 13.8944 4.2929 13.7069C4.10536 13.5193 4 13.265 4 12.9998C4 12.7345 4.10536 12.4802 4.2929 12.2926C4.48043 12.1051 4.73479 11.9998 5 11.9998H9C9.26522 11.9998 9.51958 12.1051 9.70711 12.2926C9.89465 12.4802 10 12.7345 10 12.9998C10 13.265 9.89465 13.5193 9.70711 13.7069C9.51958 13.8944 9.26522 13.9998 9 13.9998ZM13 9.99976H5C4.73479 9.99976 4.48043 9.8944 4.2929 9.70686C4.10536 9.51933 4 9.26497 4 8.99976C4 8.73454 4.10536 8.48019 4.2929 8.29265C4.48043 8.10511 4.73479 7.99976 5 7.99976H13C13.2652 7.99976 13.5196 8.10511 13.7071 8.29265C13.8946 8.48019 14 8.73454 14 8.99976C14 9.26497 13.8946 9.51933 13.7071 9.70686C13.5196 9.8944 13.2652 9.99976 13 9.99976ZM13 5.99976H5C4.73479 5.99976 4.48043 5.8944 4.2929 5.70686C4.10536 5.51933 4 5.26497 4 4.99976C4 4.73454 4.10536 4.48019 4.2929 4.29265C4.48043 4.10511 4.73479 3.99976 5 3.99976H13C13.2652 3.99976 13.5196 4.10511 13.7071 4.29265C13.8946 4.48019 14 4.73454 14 4.99976C14 5.26497 13.8946 5.51933 13.7071 5.70686C13.5196 5.8944 13.2652 5.99976 13 5.99976Z" />
                                                                    </svg>
                                                                </div>
                                                            }
                                                        </>
                                                        :
                                                        <>
                                                            <div onClick={() => { handleShow(rowData); setModal(true); setId(rowData.id) }} className='cursor-pointer'>
                                                                <svg width="24" height="24" className='mx-auto min-w-[24px] cursor-pointer hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                                    <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                                </svg>
                                                            </div>
                                                            {rowData.status == "in_progress" &&
                                                                <div onClick={() => { handleShow(rowData); setCancelCheck(!cancelCheck); setId(rowData.id) }} className="cursor-pointer">
                                                                    <svg width="24" height="24" viewBox="0 0 24 24" className='min-w-[24px] cursor-pointer mx-auto hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M20.4844 15.8716L19.6412 17.1284L20.766 18.0714H18.2283C17.9139 16.7195 16.8226 15.7143 15.5156 15.7143H8.48438C7.17736 15.7143 6.08606 16.7195 5.77167 18.0714H4.21875C2.66766 18.0714 1.40625 16.6619 1.40625 14.9286C1.40625 13.1953 2.66766 11.7857 4.21875 11.7857H5.77167C6.08606 13.1376 7.17736 14.1429 8.48438 14.1429H15.5156C16.8226 14.1429 17.9139 13.1376 18.2283 11.7857H19.7812C22.1076 11.7857 24 9.67104 24 7.07143C24 4.47181 22.1076 2.35714 19.7812 2.35714H18.2283C17.9139 1.00524 16.8226 0 15.5156 0H8.48438C7.17736 0 6.08606 1.00524 5.77167 2.35714H5.15625L2.53087 0.157352L1.68788 1.41408L2.81269 2.35714H0V3.92857H2.81269L1.68788 4.87164L2.53087 6.12836L5.15625 3.92857H5.77167C6.08606 5.28047 7.17736 6.28571 8.48438 6.28571H15.5156C16.8226 6.28571 17.9139 5.28047 18.2283 3.92857H19.7812C21.3323 3.92857 22.5938 5.33814 22.5938 7.07143C22.5938 8.80471 21.3323 10.2143 19.7812 10.2143H18.2283C17.9139 8.86239 16.8226 7.85714 15.5156 7.85714H8.48438C7.17736 7.85714 6.08606 8.86239 5.77167 10.2143H4.21875C1.89239 10.2143 0 12.329 0 14.9286C0 17.5282 1.89239 19.6429 4.21875 19.6429H5.77167C6.08606 20.9948 7.17736 22 8.48438 22H15.5156C16.8226 22 17.9139 20.9948 18.2283 19.6429H20.766L19.6412 20.5859L20.4844 21.8426L24 18.8571L20.4844 15.8716Z" />
                                                                    </svg>
                                                                </div>
                                                            }
                                                            {rowData.receipts.length > 0 &&
                                                                <div onClick={() => { handleShow(rowData); setZoom(!zoom); setId(rowData.id); }} className="cursor-pointer">
                                                                    <svg width="18" height="20" className='hover:fill-[#536DFE] duration-300 fill-[#7A8EA4] cursor-pointer min-w-[20px] mx-auto' viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M15 -0.000244141H3C2.20436 -0.000244141 1.44129 0.315826 0.878684 0.878436C0.316075 1.44104 4.71977e-06 2.20411 4.71977e-06 2.99976V17.7998C-0.000729577 18.1378 0.0842283 18.4705 0.246942 18.7668C0.409657 19.0631 0.644818 19.3133 0.930458 19.4941C1.2161 19.6749 1.5429 19.7803 1.88033 19.8005C2.21776 19.8207 2.55482 19.7551 2.86 19.6098C3.1 19.4898 3.31 19.3598 3.53 19.2298C3.95312 18.9121 4.47107 18.7465 5 18.7598C5.53201 18.7466 6.05309 18.912 6.48 19.2298C7.21843 19.7444 8.10003 20.0138 9 19.9998C9.90008 20.0145 10.7819 19.745 11.52 19.2298C11.9466 18.9113 12.4679 18.7458 13 18.7598C13.5292 18.7449 14.0476 18.9106 14.47 19.2298C14.6866 19.3649 14.9103 19.4884 15.14 19.5998C15.4444 19.7447 15.7806 19.8104 16.1172 19.7907C16.4538 19.7709 16.7799 19.6664 17.0653 19.4868C17.3507 19.3072 17.586 19.0583 17.7494 18.7634C17.9129 18.4684 17.9991 18.1369 18 17.7998V2.99976C18 2.20411 17.6839 1.44104 17.1213 0.878436C16.5587 0.315826 15.7957 -0.000244141 15 -0.000244141ZM9 13.9998H5C4.73479 13.9998 4.48043 13.8944 4.2929 13.7069C4.10536 13.5193 4 13.265 4 12.9998C4 12.7345 4.10536 12.4802 4.2929 12.2926C4.48043 12.1051 4.73479 11.9998 5 11.9998H9C9.26522 11.9998 9.51958 12.1051 9.70711 12.2926C9.89465 12.4802 10 12.7345 10 12.9998C10 13.265 9.89465 13.5193 9.70711 13.7069C9.51958 13.8944 9.26522 13.9998 9 13.9998ZM13 9.99976H5C4.73479 9.99976 4.48043 9.8944 4.2929 9.70686C4.10536 9.51933 4 9.26497 4 8.99976C4 8.73454 4.10536 8.48019 4.2929 8.29265C4.48043 8.10511 4.73479 7.99976 5 7.99976H13C13.2652 7.99976 13.5196 8.10511 13.7071 8.29265C13.8946 8.48019 14 8.73454 14 8.99976C14 9.26497 13.8946 9.51933 13.7071 9.70686C13.5196 9.8944 13.2652 9.99976 13 9.99976ZM13 5.99976H5C4.73479 5.99976 4.48043 5.8944 4.2929 5.70686C4.10536 5.51933 4 5.26497 4 4.99976C4 4.73454 4.10536 4.48019 4.2929 4.29265C4.48043 4.10511 4.73479 3.99976 5 3.99976H13C13.2652 3.99976 13.5196 4.10511 13.7071 4.29265C13.8946 4.48019 14 4.73454 14 4.99976C14 5.26497 13.8946 5.51933 13.7071 5.70686C13.5196 5.8944 13.2652 5.99976 13 5.99976Z" />
                                                                    </svg>
                                                                </div>
                                                            }

                                                        </>
                                                    }
                                                </div>
                                            </>
                                        );
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="Действия" ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 8px", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C", userSelect: 'text', position: "relative", }} field="method" header=" ID " body={(rowData) => <div className='selectable-text'>{rowData.id}</div>} ></Column>

                                    <Column body={(rowData) => {
                                        return (
                                            <div>
                                                <div>
                                                    <h5 className='selectable-text'>{rowData?.created_at && rowData?.created_at?.split("T")[0]} {rowData?.created_at && rowData?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</h5>
                                                    <h5 className='selectable-text'>{rowData?.created_at && rowData?.updated_at?.split("T")[0]} {rowData?.created_at && rowData?.updated_at?.split("T")[1].split("+")[0].slice(0, 5)}</h5>
                                                </div>
                                            </div>
                                        )
                                    }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Дата и время создания / обновления"  ></Column>

                                    {localStorage.getItem("role") !== "trader" &&
                                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="amount_in_usdt" header={"Мерчант"} headerClassName={`${isDarkMode ? "sortable-column_dark" : "sortable-column"} `} body={(rowData) => {
                                            return (
                                                <div>
                                                    <>
                                                        <div className='selectable-text'>{rowData.merchant["username"]}</div>
                                                    </>
                                                </div>
                                            )

                                        }} ></Column>
                                    }
                                    {localStorage.getItem("role") !== "merchant" &&
                                        <Column body={(rowData) => {
                                            return (
                                                <div>
                                                    <>
                                                        <div className='selectable-text'>{rowData.trader ? rowData.trader["username"] : "-"}</div>
                                                    </>
                                                </div>
                                            )

                                        }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="course" header="Трейдер" ></Column>
                                    }

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="price_2" header="Назначенный трейдер" body={(rowData) => {
                                        return (
                                            <div>
                                                <>
                                                    <div >{rowData.selected_traders.length > 0 ? rowData.selected_traders.map((person, index) => <p className='selectable-text' key={index}>{person.username}{index !== rowData.selected_traders.length - 1 && ','}</p>) : "-"}</div>
                                                </>
                                            </div>
                                        )

                                    }} ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} body={(rowData) => {
                                        return (
                                            <div>
                                                <div className='selectable-text'>{rowData.bank} Банк</div>
                                            </div>
                                        )

                                    }} field="code" header="Банк" ></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Метод" body={(rowData) => {
                                        return <div className='selectable-text'>{rowData.method["name"]}</div>
                                    }}></Column>
                                    {localStorage.getItem("role") !== "trader" &&
                                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Ставка мерчанта " body={(rowData) => {
                                            return (<div className='selectable-text'>{rowData.merchant_rate}</div>)
                                        }}></Column>
                                    }
                                    {localStorage.getItem("role") !== "merchant" &&
                                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Ставка трейдера" body={(rowData) => {
                                            return (<div className='selectable-text'>{rowData.trader_rate}</div>)
                                        }}></Column>
                                    }

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Сумма" body={(rowData) => {
                                        return (<div className='selectable-text'>{rowData.amount}</div>)

                                    }}></Column>

                                    <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] max-md:py-[10px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Статус" body={(rowData) => {
                                        if (rowData.status == "in_progress") {
                                            return (
                                                <div className='bg-[#FFC107] flex justify-center mx-auto text-[12px]  w-[116px]  font-medium text-white py-[4px] rounded-[100px] '>
                                                    В обработке
                                                </div>
                                            );
                                        } else if (rowData.status == "wait_confirm") {
                                            return (
                                                <div className='bg-[#37B67E] flex justify-center mx-auto text-[12px]  w-[116px]  font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                    Ожидает <br /> подтверждения
                                                </div>
                                            );
                                        } else if (rowData.status == "pending") {
                                            return (
                                                <div className=' bg-[#FFC107]  flex justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] rounded-[100px] '>
                                                    В ожидании
                                                </div>
                                            )
                                        } else if (rowData.status == "completed") {
                                            return (
                                                <div className='bg-[#37B67E]  flex justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                    Завершено
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
                        <style>
                            {`
                            .p-datatable-thead {
                                background-color: ${isDarkMode ? '#272727' : '#F4F5FB'};
                            }   
                                @media only screen and (max-width: 768px) {
    .p-paginator-bottom,.pages {
      background-color: ${isDarkMode ? '#000' : ' #E9EBF7'};
    }                       
                            `}
                        </style>
                        <div className="hidden max-md:block">
                            {loading ? (
                                <Loading />
                            ) :
                                <div className={`max-h-[70dvh] overflow-y-scroll overflow-hidden ${isDarkMode ? "text-white" : ""}`}>
                                    {
                                        data?.results?.map((dashData, index) => (
                                            <div className=''>
                                                <div className={`p-2 border ${isDarkMode ? "border-black" : ""} `}>
                                                    <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>ID </span><span className="selectable-text">{dashData.id}</span></div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="selectable-text font-bold text-[16px]">{dashData.selected_traders.length > 0 ? dashData.selected_traders.map((person, index) => <span key={index}>{person.username}{index !== dashData.selected_traders.length - 1 && ','}</span>) : "-"} {dashData.method["name"] && `- ${dashData?.method["name"]}`} </div>

                                                        <div className='flex justify-center gap-x-[10px]'>
                                                            {(dashData.status == "completed" || dashData.status == "canceled") ?
                                                                <>
                                                                    <div onClick={() => { handleShow(dashData); setModal(true); setId(dashData.id) }} className='cursor-pointer'>
                                                                        <svg width="24" height="24" className='mx-auto min-w-[24px] cursor-pointer hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                                            <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                                        </svg>
                                                                    </div>

                                                                    {dashData.receipts.length > 0 &&
                                                                        <div onClick={() => { handleShow(dashData); setZoom(!zoom); setId(dashData.id); }} className="cursor-pointer">
                                                                            <svg width="18" height="20" className='hover:fill-[#536DFE] duration-300 fill-[#7A8EA4] cursor-pointer min-w-[20px] mx-auto' viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M15 -0.000244141H3C2.20436 -0.000244141 1.44129 0.315826 0.878684 0.878436C0.316075 1.44104 4.71977e-06 2.20411 4.71977e-06 2.99976V17.7998C-0.000729577 18.1378 0.0842283 18.4705 0.246942 18.7668C0.409657 19.0631 0.644818 19.3133 0.930458 19.4941C1.2161 19.6749 1.5429 19.7803 1.88033 19.8005C2.21776 19.8207 2.55482 19.7551 2.86 19.6098C3.1 19.4898 3.31 19.3598 3.53 19.2298C3.95312 18.9121 4.47107 18.7465 5 18.7598C5.53201 18.7466 6.05309 18.912 6.48 19.2298C7.21843 19.7444 8.10003 20.0138 9 19.9998C9.90008 20.0145 10.7819 19.745 11.52 19.2298C11.9466 18.9113 12.4679 18.7458 13 18.7598C13.5292 18.7449 14.0476 18.9106 14.47 19.2298C14.6866 19.3649 14.9103 19.4884 15.14 19.5998C15.4444 19.7447 15.7806 19.8104 16.1172 19.7907C16.4538 19.7709 16.7799 19.6664 17.0653 19.4868C17.3507 19.3072 17.586 19.0583 17.7494 18.7634C17.9129 18.4684 17.9991 18.1369 18 17.7998V2.99976C18 2.20411 17.6839 1.44104 17.1213 0.878436C16.5587 0.315826 15.7957 -0.000244141 15 -0.000244141ZM9 13.9998H5C4.73479 13.9998 4.48043 13.8944 4.2929 13.7069C4.10536 13.5193 4 13.265 4 12.9998C4 12.7345 4.10536 12.4802 4.2929 12.2926C4.48043 12.1051 4.73479 11.9998 5 11.9998H9C9.26522 11.9998 9.51958 12.1051 9.70711 12.2926C9.89465 12.4802 10 12.7345 10 12.9998C10 13.265 9.89465 13.5193 9.70711 13.7069C9.51958 13.8944 9.26522 13.9998 9 13.9998ZM13 9.99976H5C4.73479 9.99976 4.48043 9.8944 4.2929 9.70686C4.10536 9.51933 4 9.26497 4 8.99976C4 8.73454 4.10536 8.48019 4.2929 8.29265C4.48043 8.10511 4.73479 7.99976 5 7.99976H13C13.2652 7.99976 13.5196 8.10511 13.7071 8.29265C13.8946 8.48019 14 8.73454 14 8.99976C14 9.26497 13.8946 9.51933 13.7071 9.70686C13.5196 9.8944 13.2652 9.99976 13 9.99976ZM13 5.99976H5C4.73479 5.99976 4.48043 5.8944 4.2929 5.70686C4.10536 5.51933 4 5.26497 4 4.99976C4 4.73454 4.10536 4.48019 4.2929 4.29265C4.48043 4.10511 4.73479 3.99976 5 3.99976H13C13.2652 3.99976 13.5196 4.10511 13.7071 4.29265C13.8946 4.48019 14 4.73454 14 4.99976C14 5.26497 13.8946 5.51933 13.7071 5.70686C13.5196 5.8944 13.2652 5.99976 13 5.99976Z" />
                                                                            </svg>
                                                                        </div>
                                                                    }
                                                                </>
                                                                :
                                                                <>
                                                                    <div onClick={() => { handleShow(dashData); setModal(true); setId(dashData.id) }} className='cursor-pointer'>
                                                                        <svg width="24" height="24" className='mx-auto min-w-[24px] cursor-pointer hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                                                                            <path d="M23.0091 11.1844C21.7687 9.26625 20.1595 7.63688 18.3558 6.47203C16.3603 5.18203 14.1572 4.5 11.985 4.5C9.99187 4.5 8.03203 5.06953 6.15984 6.19266C4.25062 7.33781 2.52093 9.01078 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81984 16.3997 5.59547 17.5486C7.59468 18.8438 9.74625 19.5 11.985 19.5C14.1745 19.5 16.3823 18.8236 18.3694 17.5444C20.1722 16.3833 21.7781 14.7478 23.0137 12.8137C23.1689 12.5702 23.251 12.2872 23.2502 11.9984C23.2493 11.7096 23.1656 11.4271 23.0091 11.1844ZM12.0009 16.5C11.1109 16.5 10.2409 16.2361 9.50087 15.7416C8.76085 15.2471 8.18407 14.5443 7.84348 13.7221C7.50288 12.8998 7.41377 11.995 7.5874 11.1221C7.76103 10.2492 8.18962 9.44736 8.81895 8.81802C9.44829 8.18868 10.2501 7.7601 11.123 7.58647C11.9959 7.41283 12.9007 7.50195 13.723 7.84254C14.5453 8.18314 15.2481 8.75991 15.7425 9.49993C16.237 10.24 16.5009 11.11 16.5009 12C16.4996 13.1931 16.025 14.3369 15.1814 15.1805C14.3378 16.0241 13.194 16.4986 12.0009 16.5Z" />
                                                                        </svg>
                                                                    </div>
                                                                    {dashData.status == "in_progress" &&
                                                                        <div onClick={() => { handleShow(dashData); setCancelCheck(!cancelCheck); setId(dashData.id) }} className="cursor-pointer">
                                                                            <svg width="24" height="24" viewBox="0 0 24 24" className='min-w-[24px] cursor-pointer mx-auto hover:fill-[#536DFE] duration-300 fill-[#7A8EA4]' xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M20.4844 15.8716L19.6412 17.1284L20.766 18.0714H18.2283C17.9139 16.7195 16.8226 15.7143 15.5156 15.7143H8.48438C7.17736 15.7143 6.08606 16.7195 5.77167 18.0714H4.21875C2.66766 18.0714 1.40625 16.6619 1.40625 14.9286C1.40625 13.1953 2.66766 11.7857 4.21875 11.7857H5.77167C6.08606 13.1376 7.17736 14.1429 8.48438 14.1429H15.5156C16.8226 14.1429 17.9139 13.1376 18.2283 11.7857H19.7812C22.1076 11.7857 24 9.67104 24 7.07143C24 4.47181 22.1076 2.35714 19.7812 2.35714H18.2283C17.9139 1.00524 16.8226 0 15.5156 0H8.48438C7.17736 0 6.08606 1.00524 5.77167 2.35714H5.15625L2.53087 0.157352L1.68788 1.41408L2.81269 2.35714H0V3.92857H2.81269L1.68788 4.87164L2.53087 6.12836L5.15625 3.92857H5.77167C6.08606 5.28047 7.17736 6.28571 8.48438 6.28571H15.5156C16.8226 6.28571 17.9139 5.28047 18.2283 3.92857H19.7812C21.3323 3.92857 22.5938 5.33814 22.5938 7.07143C22.5938 8.80471 21.3323 10.2143 19.7812 10.2143H18.2283C17.9139 8.86239 16.8226 7.85714 15.5156 7.85714H8.48438C7.17736 7.85714 6.08606 8.86239 5.77167 10.2143H4.21875C1.89239 10.2143 0 12.329 0 14.9286C0 17.5282 1.89239 19.6429 4.21875 19.6429H5.77167C6.08606 20.9948 7.17736 22 8.48438 22H15.5156C16.8226 22 17.9139 20.9948 18.2283 19.6429H20.766L19.6412 20.5859L20.4844 21.8426L24 18.8571L20.4844 15.8716Z" />
                                                                            </svg>
                                                                        </div>
                                                                    }
                                                                    {dashData.receipts.length > 0 &&
                                                                        <div onClick={() => { handleShow(dashData); setZoom(!zoom); setId(dashData.id); }} className="cursor-pointer">
                                                                            <svg width="18" height="20" className='hover:fill-[#536DFE] duration-300 fill-[#7A8EA4] cursor-pointer min-w-[20px] mx-auto' viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M15 -0.000244141H3C2.20436 -0.000244141 1.44129 0.315826 0.878684 0.878436C0.316075 1.44104 4.71977e-06 2.20411 4.71977e-06 2.99976V17.7998C-0.000729577 18.1378 0.0842283 18.4705 0.246942 18.7668C0.409657 19.0631 0.644818 19.3133 0.930458 19.4941C1.2161 19.6749 1.5429 19.7803 1.88033 19.8005C2.21776 19.8207 2.55482 19.7551 2.86 19.6098C3.1 19.4898 3.31 19.3598 3.53 19.2298C3.95312 18.9121 4.47107 18.7465 5 18.7598C5.53201 18.7466 6.05309 18.912 6.48 19.2298C7.21843 19.7444 8.10003 20.0138 9 19.9998C9.90008 20.0145 10.7819 19.745 11.52 19.2298C11.9466 18.9113 12.4679 18.7458 13 18.7598C13.5292 18.7449 14.0476 18.9106 14.47 19.2298C14.6866 19.3649 14.9103 19.4884 15.14 19.5998C15.4444 19.7447 15.7806 19.8104 16.1172 19.7907C16.4538 19.7709 16.7799 19.6664 17.0653 19.4868C17.3507 19.3072 17.586 19.0583 17.7494 18.7634C17.9129 18.4684 17.9991 18.1369 18 17.7998V2.99976C18 2.20411 17.6839 1.44104 17.1213 0.878436C16.5587 0.315826 15.7957 -0.000244141 15 -0.000244141ZM9 13.9998H5C4.73479 13.9998 4.48043 13.8944 4.2929 13.7069C4.10536 13.5193 4 13.265 4 12.9998C4 12.7345 4.10536 12.4802 4.2929 12.2926C4.48043 12.1051 4.73479 11.9998 5 11.9998H9C9.26522 11.9998 9.51958 12.1051 9.70711 12.2926C9.89465 12.4802 10 12.7345 10 12.9998C10 13.265 9.89465 13.5193 9.70711 13.7069C9.51958 13.8944 9.26522 13.9998 9 13.9998ZM13 9.99976H5C4.73479 9.99976 4.48043 9.8944 4.2929 9.70686C4.10536 9.51933 4 9.26497 4 8.99976C4 8.73454 4.10536 8.48019 4.2929 8.29265C4.48043 8.10511 4.73479 7.99976 5 7.99976H13C13.2652 7.99976 13.5196 8.10511 13.7071 8.29265C13.8946 8.48019 14 8.73454 14 8.99976C14 9.26497 13.8946 9.51933 13.7071 9.70686C13.5196 9.8944 13.2652 9.99976 13 9.99976ZM13 5.99976H5C4.73479 5.99976 4.48043 5.8944 4.2929 5.70686C4.10536 5.51933 4 5.26497 4 4.99976C4 4.73454 4.10536 4.48019 4.2929 4.29265C4.48043 4.10511 4.73479 3.99976 5 3.99976H13C13.2652 3.99976 13.5196 4.10511 13.7071 4.29265C13.8946 4.48019 14 4.73454 14 4.99976C14 5.26497 13.8946 5.51933 13.7071 5.70686C13.5196 5.8944 13.2652 5.99976 13 5.99976Z" />
                                                                            </svg>
                                                                        </div>
                                                                    }
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="text-[15px]">
                                                        <div className="selectable-text">{dashData.bank} Банк </div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Мерчант </span><span className="selectable-text">{dashData?.merchant["username"]}</span></div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Трейдер </span><span className="selectable-text">{dashData.trader ? dashData.trader["username"] : "-"}</span></div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Сум </span><span className="selectable-text">{dashData.amount}</span></div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Ставка мерчанта  </span><span className="selectable-text">{dashData.merchant_rate}</span></div>
                                                        <div className='text-xs mb-[2px]'><span className='text-[#616E90] '>Ставка трейдера  </span><span className="selectable-text">{dashData.trader_rate}</span></div>

                                                        <div className="text-xs">
                                                            <span className='text-[#616E90]'>
                                                                Дата и время
                                                            </span>
                                                            <span className="">
                                                                <span className='selectable-text'> {dashData?.created_at && dashData?.created_at?.split("T")[0]} {dashData?.created_at && dashData?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</span>
                                                                <span className='selectable-text'> - {dashData?.created_at && dashData?.updated_at?.split("T")[0]} {dashData?.created_at && dashData?.updated_at?.split("T")[1].split("+")[0].slice(0, 5)}(обновлено)</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-end mt-2">

                                                            {dashData.status == "in_progress" ? (
                                                                <div className='bg-[#FFC107] flex justify-center  text-[12px]  w-[116px]  font-medium text-white py-[4px]  rounded-[100px] '>
                                                                    В обработке
                                                                </div>
                                                            ) : dashData.status == "wait_confirm" ? (
                                                                <div className='bg-[#37B67E] flex justify-center  text-[12px]  w-[116px]  font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                                    Ожидает <br /> подтверждения
                                                                </div>
                                                            )
                                                                : dashData.status == "pending" ? (
                                                                    <div className=' bg-[#FFC107]  flex justify-center  text-[12px]  w-[116px] font-medium text-white py-[4px]  rounded-[100px] '>
                                                                        В ожидании
                                                                    </div>
                                                                )
                                                                    : dashData.status == "completed" ? (
                                                                        <div className='bg-[#37B67E]  flex justify-center  text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                                            Завершено
                                                                        </div>
                                                                    ) :
                                                                        <div className='bg-[#CE2E2E] flex  justify-center  text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                                                            Отклонено
                                                                        </div>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
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
                                        className={`w-[50px] focus:outline-[#536cfe] border mx-2 text-center page-button rounded-md px-[12px] py-1 ${isDarkMode ? "text-[#fff]" : ""} bg-[#D9D9D91F]`}
                                    />


                                    <button className={`text-[#2D54DD]`} onClick={() => setCurrentPage(totalPages > currentPage ? currentPage + 1 : currentPage)}>
                                        <FaAngleRight />
                                    </button>
                                </div>
                            }
                            <p className={`text-right text-[14px] font-normal mr-4  z-30 duration-300 ${isDarkMode ? "text-[#FFFFFF33]" : "text-[#252840]"}`}>{data?.count ? data?.count : 0} результата</p>
                        </div>
                    }
                    <div onClick={() => { setModal(!modal); setThumbsSwiper(null); setOtkImgDesc(null); setSwiperIndex(0); setCancel(""); setOtkImg(""); setStatus((prevError) => ({ ...prevError, handleCancel: null })); setReason("") }} className={`${(!modal) && "hidden"} fixed inset-0 ${isDarkMode ? "bg-[#00000093]" : "bg-[#2222224d]"} z-20`}></div>
                    <div onClick={() => { setModal(!modal); setThumbsSwiper(null); setSwiperIndex(0); setCancel("") }} className={`${(!modalChek) && "hidden"} fixed inset-0 ${isDarkMode ? "bg-[#00000093]" : "bg-[#2222224d]"} z-20`}></div>
                    <div onClick={() => { setZoom(!zoom); setThumbsSwiper(null); setSwiperIndex(0); }} className={`${(!zoom) && "hidden"} fixed inset-0 ${isDarkMode ? "bg-[#00000093]" : "bg-[#2222224d]"} z-50`}></div>

                    {/* cek tam ekran */}
                    <div onClick={() => { setZoom(!zoom); }} className='fixed top-1/2  left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[80%]'>
                        {zoom &&
                            <div ref={sliderRef} className="keen-slider">
                                {images.length > 0 ? (
                                    images.map((imgSrc, index) => (
                                        <div onClick={() => setZoom(!zoom)} className='keen-slider__slide flex justify-center'>
                                            <img
                                                onLoad={handleImageLoad}

                                                onClick={(e) => { e.stopPropagation(); }}
                                                key={index}
                                                src={imgSrc}
                                                alt={`Image ${index}`}
                                                style={{ maxWidth: '500px', height: '300px', objectFit: "contain" }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-center'>Loading images...</p>
                                )}
                            </div>
                        }

                        {zoom &&
                            <div
                                onClick={() => setZoom(!zoom)}
                                ref={thumbnailRef}
                                className="keen-slider thumbnail-slider mt-4 mx-auto max-w-[400px]"
                            >
                                {images.length > 0 ? (
                                    images.map((imgSrc, index) => (
                                        <>
                                            <img
                                                onLoad={handleImageLoad}
                                                className={`keen-slider__slide cursor-pointer ${index == currentSlide ? "opacity-100" : "opacity-50"}`}
                                                onClick={(e) => { handleThumbnailClick(index); e.stopPropagation(); }}
                                                key={index}
                                                src={imgSrc}
                                                alt={`Image ${index}`}
                                                style={{ maxWidth: '100px', height: '100px', objectFit: "contain" }}
                                            />
                                        </>
                                    ))
                                ) : (
                                    <p className='text-center'>Loading images...</p>
                                )}
                            </div>
                        }
                        {zoom &&
                            <div onClick={() => setZoom(!zoom)} className="absolute top-[-40px] right-0 cursor-pointer" >
                                <svg style={{ filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.45))' }} className={`scale-150 ${isDarkMode ? "fill-white" : "fill-black"}  `} width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                </svg>
                            </div>
                        }
                    </div>
                    {/* cek yuklemek ucun */}
                    <div onClick={() => { setCancelCheck(!cancelCheck); setOtkImg(""); setOtkImgDesc(null); setStatus((prevError) => ({ ...prevError, handleUpload: null })); }} className={`${!cancelCheck && "hidden"} fixed inset-0 bg-[#2222224D] z-30`}></div>
                    <form onSubmit={handleUpload} className={`${!cancelCheck ? "hidden" : ""}  ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} pt-8 pl-8 pb-8 md:pr-8 z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[763px]  overflow-y-hidden  rounded-[24px]`}>
                        <div className={`overflow-y-scroll max-h-[85vh] ${isDarkMode ? "scroll-black" : "scroll-white"} `}>
                            <div className="relative mb-8">
                                <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Завершить</h3>
                                <svg width="14" onClick={() => { setCancelCheck(!cancelCheck); setOtkImg(""); setOtkImgDesc(null); setStatus((prevError) => ({ ...prevError, handleUpload: null })); }} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-5`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                </svg>
                                <h5 className='text-[14px] text-[#60626C]'>Заполните информацию</h5>
                            </div>
                            {status["handleUpload"] == "error" &&
                                <div className={`pt-1 z-20 max-md:pr-5 w-full fixed right-0`}>
                                    <div className="flex relative items-center mb-5 max-w-[720px] mx-auto border bg-white border-[#CE2E2E] rounded-md">
                                        <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#CE2E2E] rounded-"></div>
                                        <div className="relative mr-[8px] ml-[18px]">
                                            <img src="/assets/img/error.svg" className=' rounded-full' alt="" />
                                        </div>
                                        <div className="">
                                            <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Возникла ошибка.</h4>
                                            <p className='text-[14px] text-[#484951]'>Что-то пошло не так. Повторите попытку позже.</p>
                                        </div>
                                        <img onClick={() => setStatus((prevError) => ({ ...prevError, handleUpload: null }))} src="/assets/img/Close.svg" className='absolute w-[15px] right-2 cursor-pointer' alt="" />
                                    </div>
                                </div>
                            }
                            {status["handleUpload"] == "success" &&
                                <div className="w-full pt-1 z-30 fixed right-0">
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
                                </div>
                            }
                            <div className="modal_payout mb-8 ">
                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} mb-2`}>Чек</h5>
                                <div onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDropOrFileChange}
                                    onClick={handleonClick}
                                    className="mb-8 mr-8 blur-0 cursor-pointer text-[15px] rounded-[8px] border border-[#536cfe]  border-dashed h-40 flex items-center justify-center">
                                    <div
                                        className={`dropzone-container flex gap-x-1 items-center ${isDarkMode && "text-white"}`}
                                    >
                                        <GoUpload />
                                        Прикрепить Чек
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={handleDropOrFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className=" flex flex-col items-center ">
                                {otkImg && otkImg.flatMap((src, index) => (
                                    Array.isArray(src) ? src.map((nestedSrc, nestedIndex) => (
                                        <div key={nestedIndex + `${nestedSrc}`} className="relative m-2 flex items-center justify-center">
                                            <div className='flex mx-auto  relative right-[156px] justify-start'>
                                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                                    <Viewer fileUrl={URL.createObjectURL(nestedSrc)} defaultScale={.5} />
                                                </Worker>
                                                {nestedIndex === 0 && (
                                                    <svg onClick={() => handleDeleteImage_Otk(index, nestedIndex)} width="24" className="cursor-pointer absolute right-[-340px] top-1/2 min-w-[24px]" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                    </svg>)}
                                            </div>
                                        </div>
                                    )) : (
                                        <div key={index + `${src}`} className="relative m-2 flex items-center justify-center">
                                            {(src.type == "application/pdf") ? (
                                                <div className='flex mx-auto justify-start relative right-[156px]'>
                                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                                        <Viewer fileUrl={URL.createObjectURL(src)} defaultScale={.5} />
                                                    </Worker>
                                                    {nestedIndex === 0 && (
                                                        <svg onClick={() => handleDeleteImage_Otk(index)} width="24" className="cursor-pointer absolute right-[-340px] top-1/2 min-w-[24px]" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                        </svg>)}
                                                </div>
                                            ) : (
                                                <>
                                                    <img src={src} alt={`Uploaded preview ${index + 1}`} className="mt-4 max-w-[300px] max-h-[400px]" />
                                                    <svg onClick={() => handleDeleteImage_Otk(index)} width="24" className="cursor-pointer min-w-[24px] ml-2" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                    </svg>
                                                </>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="flex justify-end my-4 mr-4">
                                <button type='submit' className='bg-[#536DFE] text-[#fff] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                    Завершить
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="">
                        <div className={` ${!modal && "hidden"} ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[763px]  ${!cancelCheck ? "overflow-y-hidden h-[90vh]" : ""} `}>
                            <div className="p-8 overflow-y-scroll max-h-[90vh]">
                                <div className="">
                                    <div className="mb-8 relative">
                                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Детали выплаты </h3>
                                        <svg width="14" onClick={() => { setModal(false); setThumbsSwiper(null); }} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-0`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                        </svg>
                                        <h5 className='text-[14px] text-[#60626C]'>Подробная информация</h5>
                                    </div>
                                    {status["handleAccept"] == "error" &&
                                        <div className={`pt-1 w-full absolute right-0 duration-300 max-md:mx-3 ${status["handleAccept"] == "error" ? "top-20" : "top-[-300px]"}`}>
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
                                    {status["handleAccept"] == "success" &&
                                        <div className={`w-full pt-1 absolute max-md:px-3 right-0 ${status["handleAccept"] == "success" ? "top-20" : "top-[-300px]"} duration-300`}>
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
                                        </div>
                                    }
                                    <div className="">
                                        {details?.map((data, index) => (
                                            <div key={index} className='grid grid-cols-2 gap-x-4 max-[500px]:grid-cols-1 '>
                                                <div className="" >
                                                    {data?.receipts?.length > 0 ? (
                                                        <>
                                                            <Swiper
                                                                style={{
                                                                    '--swiper-navigation-color': `${isDarkMode ? "#F5F6FC" : "#272727"}`,
                                                                    '--swiper-pagination-color': `${isDarkMode ? "#F5F6FC" : "#272727"}`,
                                                                }}
                                                                ref={mainSwiperRef}
                                                                spaceBetween={10}
                                                                navigation={true}
                                                                initialSlide={0}
                                                                preventClicksPropagation={true}
                                                                onSlideChange={(swiper) => setSwiperIndex(swiper.activeIndex)}
                                                                modules={[Navigation, Thumbs]}
                                                                className="mySwiper2 mb-2 cursor-pointer"
                                                            >
                                                                {images?.map((item, index) => (
                                                                    <SwiperSlide key={index}>
                                                                        <img style={{
                                                                            userSelect: 'none',
                                                                            WebkitUserDrag: 'none',
                                                                        }} src={item} alt={`Slide ${index}`} />
                                                                    </SwiperSlide>
                                                                ))}
                                                            </Swiper>

                                                            <div className="thumbsWrapper overflow-hidden mt-2" style={{ maxWidth: '100%' }}>
                                                                <div
                                                                    ref={thumbsContainerRef}
                                                                    className="thumbsContainer flex gap-2 x-scroll"
                                                                >
                                                                    {images?.map((item, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className={`thumb cursor-pointer ${swiperIndex === index ? 'opacity-100' : 'opacity-50'}`}
                                                                            onClick={() => mainSwiperRef.current.swiper.slideTo(index)}
                                                                            style={{ width: '80px', height: '90px', flexShrink: 0 }}
                                                                        >

                                                                            <img
                                                                                src={item}
                                                                                className={`thumbImage w-full h-full object-contain ${!isDarkMode ? "bg-[#F5F6FC]" : "bg-[#272727]"}`}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="modal_payout">

                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>ID</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.id}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Назначенный трейдер</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.trader ? data.trader["username"] : "-"}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Мерчант</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.merchant ? data.merchant["username"] : "-"}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Получатель</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>-</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Метод оплаты</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.method["name"]}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка мерчанта</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.merchant_rate}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка трейдера</h5>
                                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.trader_rate}</p>
                                                            </div>
                                                            <div className="modal_payout relative w-max">
                                                                {/* slice metodu */}
                                                                <div className="flex items-center font-semibold gap-x-1">
                                                                    <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} flex items-center gap-x-2 text-[12px] `}>Внешний ID</h5>
                                                                    <LuCopy className={`text-[16px] top-0 ${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} cursor-pointer`} onClick={(e) => handleCopy(e)} />
                                                                </div>
                                                                <div className=" mb-0">
                                                                    <p style={{ fontSize: "14px" }} className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} `}>{data.outter_id ? data.outter_id.slice(0, 33) : '-'}</p>
                                                                    <p style={{ fontSize: "14px" }} className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} `}>{data.outter_id ? data.outter_id.slice(32) : ''}</p>
                                                                </div>
                                                            </div>
                                                            {
                                                                <div className={`fixed ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2 -translate-x-1/2 z-50 ${copy ? "top-32" : "top-[-200px] "} duration-300 mx-auto left-1/2 `}>
                                                                    <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
                                                                    <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
                                                                </div>
                                                            }
                                                        </>
                                                    )}
                                                </div>

                                                <div className="">
                                                    {data.receipts.length >= 1 &&
                                                        <>
                                                            <div className="modal_payout ">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>ID</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.id} </p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Назначенный трейдер</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.trader ? data.trader["username"] : "-"}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Мерчант </h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.merchant ? data.merchant["username"] : "-"}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Получатель</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>-</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Метод оплаты</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.method["name"]}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка мерчанта</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.merchant_rate}</p>
                                                            </div>
                                                            <div className="modal_payout">
                                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка трейдера</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.trader_rate}</p>
                                                            </div>
                                                            <div className="modal_payout relative w-max">
                                                                {/* slice metodu */}
                                                                <div className="flex items-center font-semibold gap-x-1">
                                                                    <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} flex items-center gap-x-2 text-[12px] `}>Внешний ID</h5>
                                                                    <LuCopy className={`text-[16px]  top-0  ${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} cursor-pointer`} onClick={(e) => handleCopy(e)} />
                                                                </div>
                                                                <div className=" mb-0">
                                                                    <p style={{ fontSize: "14px" }} className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} `}>{data.outter_id ? data.outter_id.slice(0, 33) : '-'}</p>
                                                                    <p style={{ fontSize: "14px" }} className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"} `}>{data.outter_id ? data.outter_id.slice(32) : ''}</p>
                                                                </div>
                                                            </div>
                                                            {
                                                                <div className={`fixed ${isDarkMode ? "bg-[#1F1F1F] shadow-lg" : "bg-[#E9EBF7] shadow-lg"} w-max p-3 rounded-md flex gap-x-2  -translate-x-1/2 z-50 ${copy ? "top-32" : "top-[-200px] "} duration-300 mx-auto left-1/2 `}>
                                                                    <LuCopy size={18} color={`${isDarkMode ? "#E7E7E7" : "#18181B"}`} />
                                                                    <h4 className={`text-sm ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`} >Ссылка скопирована</h4>
                                                                </div>
                                                            }
                                                        </>
                                                    }
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.amount}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Статус</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.status === "pending" ? "В ожидании" : data?.status == "wait_confirm" ? "Ожидает подтверждения" : data?.status == "in_progress" ? "В обработке" : data?.status === "completed" ? "Завершено" : "Отклонено"}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Трейдеры на выбор</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.selected_traders.length > 0 ? data.selected_traders.map((person, index) => <span key={index}>{person.username}{index !== data.selected_traders.length - 1 && ','}</span>) : "-"}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Банк</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.bank} Банк</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма с учетом ставки трейдера </h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.trader_amount_with_rate}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма с учетом ставки мерчанта</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.merchant_amount_with_rate}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Время создания</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.created_at?.split("T")[0]} {data?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Время обновления</h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.updated_at?.split("T")[0]} {data?.updated_at?.split("T")[1].split("+")[0].slice(0, 5)}</p>
                                                    </div>
                                                    <div className="modal_payout">
                                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Реквизиты </h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.requisite} </p>
                                                    </div>
                                                    {data?.reason &&
                                                        <div className="modal_payout">
                                                            <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Причина </h5><p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.reason && data?.reason.split(": ")[1].split("|")[0].trim()} </p>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* cancel modal */}
                                    <div onClick={() => { setOtkImg(""); setOtkImgDesc(null); setStatus((prevError) => ({ ...prevError, handleCancel: null })); setReason("") }} className={`${!cancel && "hidden"} fixed inset-0 h-[120vh] bg-[#2222224D] z-20`}></div>
                                    <form onSubmit={handleCancel} className={`${!cancel ? "hidden" : ""}  ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} blur-0 pt-8 pl-8 pb-8 z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 shadow-sm shadow-black -translate-y-1/2 mx-auto w-full overflow-y-hidden  rounded-[24px] `}>
                                        <div className={`${isDarkMode ? "scroll-black" : "scroll-white"} overflow-y-scroll max-h-[80vh]`}>
                                            <div className="relative mb-8 mr-8">
                                                <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Отклонить выплату</h3>
                                                <svg width="14" onClick={() => { setCancel(!cancel); setOtkImg(""); setOtkImgDesc(null); setReason(""); setStatus((prevError) => ({ ...prevError, handleCancel: null })) }} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-0`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                                </svg>
                                                <h5 className='text-[14px] text-[#60626C]'>Укажите причину</h5>
                                            </div>
                                            {/* errorm */}
                                            {status["handleCancel"] == "error" &&
                                                <div className={`pt-1 z-20  duration-300  w-full fixed right-0`}>
                                                    <div className="flex relative items-center mb-5 max-w-[720px] mx-auto border bg-white border-[#CE2E2E] rounded-md">
                                                        <div className="w-[14px] rounded-l-[5px] h-[88px] bg-[#CE2E2E] rounded-"></div>
                                                        <div className="relative mr-[8px] ml-[18px]">
                                                            <img src="/assets/img/error.svg" className=' rounded-full' alt="" />
                                                        </div>
                                                        <div className="">
                                                            <h4 style={{ letterSpacing: "-2%" }} className='text-[14px] font-semibold text-[#18181B]'>Возникла ошибка.</h4>
                                                            <p className='text-[14px] text-[#484951]'>Что-то пошло не так. Повторите попытку позже.</p>
                                                        </div>
                                                        <img onClick={() => setStatus((prevError) => ({ ...prevError, handleCancel: null }))} src="/assets/img/Close.svg" className='absolute w-[15px] right-2 cursor-pointer' alt="" />
                                                    </div>
                                                </div>
                                            }
                                            {status["handleCancel"] == "success" &&
                                                <div className="w-full pt-1 fixed right-0 z-30">
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
                                                </div>
                                            }
                                            <div className="modal_payout blur-0 mb-8 mr-8 ">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} mb-2`}>Описание</h5>
                                                <input onChange={(e) => setReason(e.target.value)} style={{ caretColor: `${isDarkMode ? "#fff" : "#000"}` }} value={reason} required placeholder='Описание' type="text" className={`${isDarkMode ? "text-white" : ""}  bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 focus:outline-[#536cfe] rounded-[4px]`} />
                                            </div>
                                            <div onDragOver={handleDragOver}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDropOrFileChange}
                                                onClick={handleonClick}
                                                className="mb-8 mr-8 blur-0 cursor-pointer text-[15px] rounded-[8px] border border-[#536cfe]  border-dashed h-40 flex items-center justify-center">
                                                <div
                                                    className={`dropzone-container flex gap-x-1 items-center ${isDarkMode && "text-white"}`}
                                                >
                                                    <GoUpload />
                                                    Прикрепить Чек
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        multiple
                                                        style={{ display: 'none' }}
                                                        onChange={handleDropOrFileChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className=" flex flex-col items-center mr-8 blur-0">
                                                {otkImg && otkImg.flatMap((src, index) => (
                                                    Array.isArray(src) ? src.map((nestedSrc, nestedIndex) => (
                                                        <div key={nestedIndex + `${nestedSrc}`} className="relative m-2 flex items-center justify-center">
                                                            <div className='flex mx-auto  relative right-[156px] justify-start'>
                                                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                                                    <Viewer fileUrl={URL.createObjectURL(nestedSrc)} defaultScale={.5} />
                                                                </Worker>
                                                                {nestedIndex === 0 && (
                                                                    <svg onClick={() => handleDeleteImage_Otk(index, nestedIndex)} width="24" className="cursor-pointer absolute right-[-340px] top-1/2 min-w-[24px]" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                                    </svg>)}
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div key={index + `${src}`} className="relative m-2 flex items-center justify-center">
                                                            {(src.type == "application/pdf") ? (
                                                                <div className='flex mx-auto justify-start relative right-[156px]'>
                                                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                                                        <Viewer fileUrl={URL.createObjectURL(src)} defaultScale={.5} />
                                                                    </Worker>
                                                                    {nestedIndex === 0 && (
                                                                        <svg onClick={() => handleDeleteImage_Otk(index)} width="24" className="cursor-pointer absolute right-[-340px] top-1/2 min-w-[24px]" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                                        </svg>)}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <img src={src} alt={`Uploaded preview ${index + 1}`} className="mt-4 max-w-[300px] max-h-[400px]" />
                                                                    <svg onClick={() => handleDeleteImage_Otk(index)} width="24" className="cursor-pointer min-w-[24px] ml-2" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                                                    </svg>
                                                                </>
                                                            )}
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                            <div className="flex justify-end pr-8 blur-0">
                                                <button type='submit' className=' relative bg-[#536DFE] text-[#fff] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                    Отклонить
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                    {/* buttonlar */}
                                    <div className="flex w-full text-white md:justify-end gap-x-4 mt-2 ">
                                        {details?.map((data, index) => {
                                            return (
                                                <div key={index}>
                                                    {(data.status === "pending") && (
                                                        <>
                                                            <div className='flex  max-[420px]:flex-col gap-4'>
                                                                <button onClick={() => setCancel(!cancel)} className='text-[#536DFE] border-[#2E70F5] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                                    Отклонить
                                                                </button>
                                                                <form onSubmit={handleAccept}>
                                                                    <button type='submit' className='bg-[#536DFE] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                                        Взять в работу
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </>
                                                    )}
                                                    {(data.status === "in_progress") && (
                                                        <div className='flex max-[420px]:flex-col  gap-4'>
                                                            <button onClick={() => setCancel(!cancel)} className='text-[#2E70F5] border-[#2E70F5] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                                Отклонить
                                                            </button>
                                                            <button onClick={() => { setCancelCheck(!cancelCheck); setModal(!modal) }} type='submit' className='bg-[#536DFE]  text-[#fff] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                                Завершить
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Payout