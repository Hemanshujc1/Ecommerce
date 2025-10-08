"use client";
import React,{useState, useEffect} from "react";
import {
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoYoutube,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
} from "react-icons/io5";
import ImageContainer from "../ImageContainer/ImageContainer";
import { fetchSocialLinks } from "@/lib/api";
import Link from "next/link";

const UserFooter = () => {
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    youtube: "",
  });

  useEffect(() => {
    const getLinks = async () => {
      const data = await fetchSocialLinks();
      if (data) setSocialLinks(data);
    };

    getLinks();
  }, []);
  return (
    <>
    <ImageContainer/>
      <div className="bg-[whitesmoke] h-[50vh] flex flex-col justify-center items-center gap-1">
        <div className="-mt-5 z-50">
        <Link href={socialLinks.instagram || '#'} target="_blank" rel="noopener noreferrer">
          <button className="bg-white text-black px-6 py-3 font-semibold rounded-md hover:scale-95">
          Follow us on Instagram
          </button>
          </Link>
        </div>
        <div className="upperfooter w-screen h-[40vh] flex justify-around items-center gap-5 px-6">
          <div className="footeraddress flex flex-col gap-5 w-[20vw]">
            <h1>Ecommerce</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae
              error ipsa ullam quo velit corrupti, suscipit mollitia expedita
              dolorum vitae!
            </p>
            <div className="links flex gap-5 text-3xl">
             <Link href={socialLinks.facebook || '#'} target="_blank" rel="noopener noreferrer">
             <IoLogoFacebook />
              </Link>
              <Link href={socialLinks.twitter || '#'} target="_blank" rel="noopener noreferrer">
              <IoLogoTwitter />
              </Link>
              <Link href={socialLinks.linkedin || '#'} target="_blank" rel="noopener noreferrer">
              <IoLogoLinkedin/>
              </Link>
              <Link href={socialLinks.whatsapp || '#'} target="_blank" rel="noopener noreferrer">
              <IoLogoWhatsapp />
              </Link>
              <Link href={socialLinks.youtube || '#'} target="_blank" rel="noopener noreferrer">
              <IoLogoYoutube />
              </Link>
              <Link href={socialLinks.instagram || '#'} target="_blank" rel="noopener noreferrer">  
              <IoLogoInstagram />
              </Link>
            </div>
          </div>
          <div className="quicklink flex flex-col text-center gap-3">
            <h1>Quick Links</h1>
            <ul className="flex gap-4">
              <li> <Link href="/users/Home">Home</Link></li>
              <li> <Link href="/users/Products">Product</Link></li>
              <li><Link href="/users/Account">Orders</Link></li>
              <li><Link href="/users/Blogs">Blog</Link></li>
              <li><Link href="/users/ContactUs">Contact</Link></li>
            </ul>
          </div>
          <div className="contact-info flex flex-col gap-3">
            <h2>Do you have any questions or suggestions?</h2>
            <ul className="flex flex-col gap-5">
              <li>
                <h2>Do you have any questions or suggestions?</h2>
                <p>contact@yourcompany.com</p>
              </li>
              <li>
                <h2>Do you need support? Give us a call.</h2>
                <p>+43 720 11 52 78</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="h-[2px] bg-white w-screen"></div>
        <div className="lowerfooter flex justify-center gap-20 items-center py-2">
          <div className="flex flex-col gap-2">
            <span>We ship with: DHL Porter</span>
            <span>Payment Option: VISA, PAYPAL, MASTERCARD</span>
          </div>
          <div>
            <span>
              © Copyright 2022 Kaira. All rights reserved. Design by
              TemplatesJungle
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserFooter;
