"use client";

import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function OrderPage() {

  const [user, setUser] = useState(false);

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
          <Header title="Order" showUserName={true} />
  
          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold">Your view:</p>
              <Link href="/pages/materials">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>
  
            <div className="flex flex-col gap-2">
              <img src="/wool.png" alt="Sweater" className="rounded-xl" />
  
              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
              </div>
            </div>
  
            <div className="flex flex-col gap-2">

              <div className="flex flex-row gap-2">
                <button className=" relative bg-green rounded-2xl w-[70%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Create receipt</p>
                  <img src="/receipt.png" alt="Pencil" className="w-5" />
                </button>
                <button className="relative bg-green rounded-2xl w-[28%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>

              <p className="text-xl">testNameOrder | deadline: 1 Jan, 2025</p>

              <p>Category: testCategory1, testCategory2</p>
              
              <div>
                <p>Pattern Description</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took a galley                  
                </p>
                
                {/* The code below should replace to show the description of product */}
                {/* <p>
                  {filteredProducts.length > 0
                  ? filteredProducts[0].description
                  : "Product not found"}
                </p> */}
  
              </div>
              
              <div>
                <p>Client name:</p>
                <p>Alex Smith</p>
              </div>

              <div>
                <p>Description</p>
                <p>Address, phone, measurements shoulder shoulder</p>
              </div>

              <div>
                <p>Materials</p>
                <ul className="list-decimal px-6">
                    <li>wool id123456 - 400g</li>
                    <li>wool id123456 - 100g</li>
                </ul>
                <p>Material cost: 60$</p>
              </div>          
              
              <p>Total cost: {" "}140$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>

              <p>Total with tax (4): {" "}134.4$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p> 

              <p>Prepayment: {" "}70$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>    

              <div className="flex flex-row float-right gap-1 justify-between font-bold">
               <button
                className="hover:arrow bg-red w-[17%] h text-white rounded-xl"
                onClick={openConfirmation}
                >
                Delete
                </button>
                <button className="bg-yellow px-3 py-1 rounded-xl">Set as paid</button>
                <button className="bg-yellow px-1 py-1 rounded-xl  w-[50%]">Set as completed</button>
                
              </div>  

             
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
      return(
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Order" showUserName={true} />
  
          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold">Client view:</p>
              <Link href="/pages/materials">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>
  
            <div className="flex flex-col gap-2">
              <img src="/wool.png" alt="Sweater" className="rounded-xl" />
  
              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
                <SmallBlockHolder
                  type="plainPicture"
                  imageSource="/wool.png"
                />
              </div>
            </div>
  
            <div className="flex flex-col gap-2">
              <p className="text-xl">testNameOrder | deadline: 1 Jan, 2025</p>              
              
              <div>
                <p>Client name:</p>
                <p>Alex Smith</p>
              </div>

              <div>
                <p>Description</p>
                <p>Address, phone, measurements shoulder shoulder</p>
              </div>

              <div>
                <p>Materials</p>
                <ul className="list-decimal px-6">
                    <li>wool id123456 - 400g</li>
                    <li>wool id123456 - 100g</li>
                </ul>
              </div>          
              
              <p>Total cost: {" "}140$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>

              <p>Prepayment: {" "}70$
              {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>                
            </div>
          </div>
  
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
        <img src="/wool.png" alt="Sweater" className="rounded-xl" />

        <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
          <SmallBlockHolder
            type="plainPicture"
            imageSource="/wool.png"
          />
          <SmallBlockHolder
            type="plainPicture"
            imageSource="/wool.png"
          />
          <SmallBlockHolder
            type="plainPicture"
            imageSource="/wool.png"
          />
          <SmallBlockHolder
            type="plainPicture"
            imageSource="/wool.png"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xl">testNameOrder | deadline: 1 Jan, 2025</p>              
        
        <div>
          <p>Client name:</p>
          <p>Alex Smith</p>
        </div>

        <div>
          <p>Description</p>
          <p>Address, phone, measurements shoulder shoulder</p>
        </div>

        <div>
          <p>Materials</p>
          <ul className="list-decimal px-6">
              <li>wool id123456 - 400g</li>
              <li>wool id123456 - 100g</li>
          </ul>
        </div>          
        
        <p>Total cost: {" "}140$
        {/* {filteredProducts.length > 0
            ? filteredProducts[0].total
            : "Product not found"}$ */}
        </p>

        <p>Prepayment: {" "}70$
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
