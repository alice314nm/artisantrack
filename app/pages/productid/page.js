"use client";

import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProductPage() {

  const [user, setUser] = useState(true);

  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [clientView, setClientView] = useState(false);
  const params = useParams();


  const openConfirmation = () => {
    setConfirmWindowVisibility(true);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
  };


  if (user){
    if (!clientView) {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Products" userName={"Olga Ivanova"} />
  
          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold">Your view:</p>
              <Link href="/">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>
  
            <div className="flex flex-col gap-2">
              <img src="/Sweater.jpg" alt="Sweater" className="rounded-xl" />
  
              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
              </div>
            </div>
  
            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>
              <p className="text-xl">
                testNameProduct
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].title
                  : "Product not found"} */}
                  </p>
              <p>Category: testCategory1, testCategory2
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].category
                  : "Product not found"} */}
              </p>
              <div>
                <p>Pattern description</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took a galley
                  of type and scrambled it to make a type specimen book. It has
                  survived not only five centuries, but also the leap into
                  electronic typesetting, remaining essentially unchanged.
                </p>
                
                {/* The code below should replace to show the description of product */}
                {/* <p>
                  {filteredProducts.length > 0
                  ? filteredProducts[0].description
                  : "Product not found"}
                </p> */}
  
              </div>
              <p>Average Total: {" "}123$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>
              <button
                className="hover:arrow bg-red text-white rounded-xl w-32"
                onClick={openConfirmation}
              >
                Delete
              </button>
            </div>
          </div>
  
          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={closeConfirmation}
          />
  
          <Menu
            type="TwoButtonsMenu"
            iconFirst="/link.png"
            iconSecond="/eye.png"
            firstTitle="Copy for client"
            secondTitle="View for client"
            onSecondFunction={changeView}
          />
        </div>
      );
    }
  
    // View for unlogged users
    else {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Products" userName="Olga Ivanova" />
  
          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold">Client view:</p>
              <Link href="/">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>
  
            <div className="flex flex-col gap-2">
              <img src="/Sweater.jpg" alt="Sweater" className="rounded-xl" />
  
              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/Sweater.jpg"
                />
              </div>
            </div>
  
            <div className="flex flex-col gap-2">
              <p className="text-xl">TestProductName
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].title
                  : "Product not found"} */}               
              </p>
              <p>Category: testcategory1, testcategory2
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].category
                  : "Product not found"} */}
              </p>
              <p>Average Total: 123$
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
                  </p>
            </div>
          </div>
  
          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={closeConfirmation}
          />
  
          <Menu
            type="TwoButtonsMenu"
            iconFirst="/link.png"
            iconSecond="/eye-crossed.png"
            firstTitle="Copy for client"
            secondTitle="Default View"
            onSecondFunction={changeView}
          />
        </div>
      );
    }
  }
else{
  return (
    <div className="flex flex-col min-h-screen gap-4">
      <Header title="Artisan Track" />

      <div className="mx-4 flex flex-col gap-4 pb-24">
        
        <div className="flex flex-col gap-2">
          <img src="/Sweater.jpg" alt="Sweater" className="rounded-xl" />

          <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
            <SmallBlockHolder
              type="plainPicture"
              imageSource="/Sweater.jpg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
        <p className="text-xl">testNameProduct
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].title
              : "Product not found"} */}
              </p>
          <p>Category: testCategory1, testCategory2
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].category
              : "Product not found"} */}
          </p>
          <p>Average Total: 123$
            {/* {filteredProducts.length > 0
              ? filteredProducts[0].total
              : "Product not found"}$ */}
              </p>
        </div>
      </div>
    </div>
    );
  }
}
