import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../src/global.css';
import { authAPI } from "../../services/apis/Auth";
import {jwtDecode} from 'jwt-decode'; // Sửa import jwtDecode
import React from 'react';

export default function Header({ logo, navLinks }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập
        const checkLoginStatus = () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const decoded = jwtDecode(token.split(' ')[1]); // Giải mã token
                    setUser(decoded); // Lưu thông tin người dùng
                    console.log("Decoded token:", decoded);

                    // Kiểm tra vai trò của người dùng
                    if (decoded?.payload.role === 'ADMIN') {
                        setIsAdmin(true);
                    }
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error("Failed to decode token:", error);
                }
            } else {
                console.error("Token is not available");
            }
        };

        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        await authAPI.logout();
        localStorage.clear();
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false); // Đặt lại trạng thái admin
        setIsDropdownOpen(false);
        window.location.reload();
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="h-10">
                    <img src={logo} alt="Restaurant Logo" className='h-10' />
                </div>
                <nav className="header__nav">
                    <ul className="flex gap-6 list-none">
                        {navLinks.map((link, index) => (
                            <li key={index}>
                                <Link
                                    to={link.path}
                                    className="text-gray-800 no-underline font-medium transition-colors duration-300 hover:text-blue-500"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {isAdmin && (
                    <Link to={'/admin'} className="text-blue-500">
                        Admin
                    </Link>
                )
                }
                {isLoggedIn ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 focus:outline-none"
                        >
                            <img
                                src={user?.avatar || '/Assets/Header/avtprivate.jpg'}
                                alt="Profile"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                            <span className="text-gray-700">{user?.username}</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Thông tin cá nhân
                                </Link>
                                <Link
                                    to="/orders"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Đơn hàng của tôi
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="px-4 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-300"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
                        >
                            Đăng ký
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}