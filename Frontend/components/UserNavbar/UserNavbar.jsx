"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RiAccountCircleLine,
  RiShoppingCartLine,
  RiPokerHeartsLine,
  RiBookReadLine,
  RiHome9Line,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { IoCallOutline } from "react-icons/io5";
import { FaRegHandPointRight, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const UserNavbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/users/Products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/users/Products');
    }
    setIsMobileMenuOpen(false); // Close mobile menu after search
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white min-h-[12vh] flex flex-col lg:flex-row justify-between items-center px-4 lg:px-6 text-xl shadow-md sticky top-0 z-50">
      {/* Top row - Logo, Search, Mobile Menu Button */}
      <div className="w-full flex justify-between items-center py-2 lg:py-0">
        <Link href={"/users/Home"}>
          <div className="logo flex gap-3 items-center">
            <Image
              src="/EcommerceLogo.avif"
              width={60}
              height={60}
              alt="logo"
              className="lg:w-[80px] lg:h-[80px]"
            />
            <div className="flex flex-col font-extrabold">
              <h3 className="text-base lg:text-lg">Ecommerce Website</h3>
              <p className="text-xs lg:text-sm font-normal hidden sm:block">Lorem ipsum dolor sit.</p>
            </div>
          </div>
        </Link>
        
        {/* Desktop Search Bar */}
        <div className="searchbar hidden lg:flex flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-20 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </button>
      </div>

      {/* Mobile Search Bar */}
      <div className="w-full lg:hidden px-2 pb-2">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-16 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors text-sm"
          >
            Go
          </button>
        </form>
      </div>

      {/* Navigation Menu */}
      <div className={`navMenu w-full lg:w-auto ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
        <ul className="flex flex-col lg:flex-row gap-2 lg:gap-3 font-semibold items-center text-center pb-2 lg:pb-0">
          <Link href="/users/Home">
            <li className={`flex gap-1 items-center text-base lg:text-lg hover:scale-95 transition-transform p-2 rounded-md ${pathname === '/users/Home' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <RiHome9Line /> Home
            </li>
          </Link>
          <Link href="/users/Products">
            <li className={`flex gap-1 items-center text-base lg:text-lg hover:scale-95 transition-transform p-2 rounded-md ${pathname === '/users/Products' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <RiBookReadLine /> Products
            </li>
          </Link>
        
          
          <Link href="/users/AboutUs">
            <li className={`flex gap-1 items-center text-base lg:text-lg hover:scale-95 transition-transform p-2 rounded-md ${pathname === '/users/AboutUs' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <FaRegHandPointRight /> About
            </li>
          </Link>
          <Link href="/users/ContactUs">
            <li className={`flex gap-1 items-center text-base lg:text-lg hover:scale-95 transition-transform p-2 rounded-md ${pathname === '/users/ContactUs' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <IoCallOutline /> Contact
            </li>
          </Link>
          <Link href="/users/Account">
            <li className={`flex gap-1 items-center text-base lg:text-lg hover:scale-95 transition-transform p-2 rounded-md ${pathname === '/users/Account' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <RiAccountCircleLine /> Account
            </li>
          </Link>
        </ul>
      </div>
    </nav>
  );
};

export default UserNavbar;
