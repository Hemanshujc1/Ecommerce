import React from "react";
import LandingPage from "@/components/LandingPage/LandingPage";
import ServiceCard from "@/components/ServiceCard/ServiceCard";
import { LuNotebookPen, LuShoppingBag, LuGift } from "react-icons/lu";
import { CiDeliveryTruck } from "react-icons/ci";
import CategoryCard from "@/components/CategoryCard/CategoryCard";
import ProductCard from "@/components/ProductCard/ProductCard";
import BlogPost from "@/components/BlogPost/BlogPost";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col justify-center gap-20 py-16">
      <LandingPage />
      <div className="flex py-4">
        <ServiceCard
          logo={LuNotebookPen}
          title={"Book An Appointment"}
          description={
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
          }
        ></ServiceCard>
        <ServiceCard
          logo={LuShoppingBag}
          title={"Pick up in store"}
          description={
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
          }
        ></ServiceCard>
        <ServiceCard
          logo={LuGift}
          title={"Special packaging"}
          description={
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
          }
        ></ServiceCard>
        <ServiceCard
          logo={CiDeliveryTruck}
          title={"free global returns"}
          description={
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
          }
        ></ServiceCard>
      </div>
      <div className="flex gap-5 items-center justify-center py-4">
        <CategoryCard
          image={"/images/cat-item1.jpg"}
          category={"SHOP FOR MEN"}
        />
        <CategoryCard
          image={"/images/cat-item2.jpg"}
          category={"SHOP FOR WOMEN"}
        />
        <CategoryCard
          image={"/images/cat-item3.jpg"}
          category={"SHOP ACCESSORIES"}
        />
      </div>
      <ProductCard
        title="OUR NEW ARRIVAL"
        // items={newarrivaldata}
        className="py-6"
      />
      <div className="bg-[whitesmoke] text-black flex h-[60vh] w-[90vw] m-auto">
        <div className="relative w-[50%] h-full">
          <Image
            src="/images/single-image-2.jpg"
            alt="winter collection"
            width={300}
            height={200}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-1/2 flex flex-col justify-center px-10">
          <h1 className="text-4xl font-semibold mb-4 uppercase">
            Classic Winter Collection
          </h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Dignissim lacus, turpis ut suspendisse vel tellus. Turpis purus,
            gravida orci, fringilla a. Ac sed eu fringilla odio mi. Consequat
            pharetra at magna imperdiet cursus ac faucibus sit libero. Ultricies
            quam nunc, lorem sit lorem urna, pretium aliquam ut. In vel, quis
            donec dolor id in. Pulvinar commodo mollis diam sed facilisis at
            cursus imperdiet cursus ac faucibus sit faucibus sit libero.
          </p>
          <Link href="/users/Products">
            <button className="bg-white text-black py-2 px-6 w-fit uppercase hover:bg-gray-700 hover:scale-95 transition">
              Shop Collection
            </button>
          </Link>
        </div>
      </div>
      <ProductCard
        title="Best Selling Items"
        // items={bestsellingdata}
        className="py-6"
      />
      <ProductCard
        title="You May Also Like"
        // items={mayalsolikedata}
        className="py-6"
      />
      <BlogPost />
      <div className="brands flex gap-10 justify-center w-screen h-[30vh] px-6  ">
        <div className="relative w-[20%] h-full rounded-md overflow-hidden">
          <Image
            src={`/images/logo1.png`}
            alt="brandlogo"
            width={300}
  height={200}
            
            className="object-contain w-full h-full rounded-md"
          />
        </div>
        <div className="relative w-[20%] h-full rounded-md overflow-hidden">
          <Image
            src={`/images/logo2.png`}
            width={300}
  height={200}
            alt="brandlogo"
            
            className="object-contain w-full h-full rounded-md"
          />
        </div>
        <div className="relative w-[20%] h-full rounded-md overflow-hidden">
          <Image
            src={`/images/logo3.png`}
            width={300}
  height={200}
            alt="brandlogo"
            
            className="object-contain w-full h-full rounded-md"
          />
        </div>
        <div className="relative w-[20%] h-full rounded-md overflow-hidden">
          <Image
            src={`/images/logo4.png`}
            width={300}
  height={200}
            alt="brandlogo"
            
            className="object-contain w-full h-full rounded-md"
          />
        </div>
        <div className="relative w-[20%] h-full rounded-md overflow-hidden">
          <Image
            src={`/images/logo5.png`}
            width={300}
  height={200}
            alt="brandlogo"
            
            className="object-contain w-full h-full rounded-md"
          />
        </div>
      </div>
      <NewsLetter />
    </div>
  );
};

export default page;
