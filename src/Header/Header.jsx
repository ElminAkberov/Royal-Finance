import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = ({ open }) => {
    return (
        <div className="">
            {localStorage.getItem("role") !== "trader" &&
                <NavLink to={"/dash"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                    <svg width="24" height="24" className='fill-[#8D8F9B]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" />
                    </svg>
                    <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px]  font-medium ml-[8px]  whitespace-nowrap`}>Управления депозитами</p>
                </NavLink>
            }
            <NavLink to={"/deposit"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                <svg width="24" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" fill="#8D8F9B" />
                </svg>
                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px] whitespace-nowrap`}>Пополнение депозита</p>
            </NavLink>
            <NavLink to={"/payout"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] bg-[#2D54DD4D]">
                <svg width="24" height="24" className='fill-[#2D54DD]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.3633 19.6364H18.5452C16.1391 19.6364 14.1816 17.6789 14.1816 15.2728C14.1816 12.8668 16.1391 10.9093 18.5452 10.9093H22.3633C22.4349 10.9093 22.5059 10.8953 22.5721 10.8679C22.6383 10.8405 22.6985 10.8003 22.7491 10.7496C22.7998 10.699 22.8399 10.6388 22.8673 10.5726C22.8947 10.5064 22.9088 10.4355 22.9088 10.3638V8.7275C22.9088 7.5837 22.0216 6.6535 20.9006 6.56329L17.7681 1.09179C17.4778 0.585754 17.009 0.224073 16.4481 0.0738875C15.8899 -0.0752748 15.3061 0.00306481 14.8064 0.293873L4.06783 6.5457H2.1818C0.978529 6.5457 0 7.52418 0 8.7275V21.8182C0 23.0215 0.978478 24 2.1818 24H20.727C21.9302 24 22.9088 23.0215 22.9088 21.8182V20.1819C22.9088 20.1102 22.8947 20.0393 22.8673 19.9731C22.8399 19.9069 22.7998 19.8467 22.7491 19.7961C22.6985 19.7454 22.6383 19.7052 22.5721 19.6778C22.5059 19.6504 22.4349 19.6363 22.3633 19.6364ZM18.4445 4.4698L19.633 6.5457H14.8789L18.4445 4.4698ZM6.23598 6.5457L15.3556 1.23666C15.6022 1.0923 15.8904 1.05395 16.1658 1.12748C16.4444 1.20204 16.6766 1.38209 16.821 1.63403L16.8221 1.63603L8.38935 6.5457H6.23598Z" />
                    <path d="M22.3642 12H18.5461C16.7414 12 15.2734 13.468 15.2734 15.2727C15.2734 17.0773 16.7414 18.5453 18.5461 18.5453H22.3642C23.2666 18.5453 24.0006 17.8113 24.0006 16.909V13.6363C24.0006 12.734 23.2666 12 22.3642 12ZM18.5461 16.3635C17.9448 16.3635 17.4552 15.874 17.4552 15.2727C17.4552 14.6713 17.9448 14.1818 18.5461 14.1818C19.1475 14.1818 19.637 14.6713 19.637 15.2727C19.637 15.874 19.1475 16.3635 18.5461 16.3635Z" />
                </svg>
                <p className={`${open && "hidden"} text-[#2D54DD] text-[14px] font-medium ml-[8px] whitespace-nowrap`}>Выплаты</p>
            </NavLink>
            {/* <div className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
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
            </div> */}
        </div>
    )
}

export default Header