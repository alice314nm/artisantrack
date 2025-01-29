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

  if (user) {
    if (!clientView) {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Materials" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Your view">
                Your view:
              </p>
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
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>

              <p className="text-xl">testNameMaterial | testId</p>

              <p>Category: testCategory1, testCategory2</p>

              <div>
                <p>Description</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley
                </p>

                {/* The code below should replace to show the description of product */}
                {/* <p>
                  {filteredProducts.length > 0
                  ? filteredProducts[0].description
                  : "Product not found"}
                </p> */}
              </div>

              <p>Cost</p>
              <ul className="list-decimal pl-4">
                <li>Artic, 1.4$, 400g = 100$</li>
                <li>Artic, 1.4$, 400g = 100$</li>
              </ul>

              <p>
                Total cost: 200$
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>
              <button
                className="hover:arrow bg-red text-white rounded-xl w-32"
                onClick={openConfirmation}
                data-id="delete-button"
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
          <Header title="Materials" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
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
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xl">testNameMaterial | testId</p>

              <p>Category: testCategory1, testCategory2</p>

              <div>
                <p>Description</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley
                </p>

                {/* The code below should replace to show the description of product */}
                {/* <p>
                        {filteredProducts.length > 0
                        ? filteredProducts[0].description
                        : "Product not found"}
                    </p> */}
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
            iconSecond="/eye-crossed.png"
            firstTitle="Copy for client"
            secondTitle="Default View"
            onSecondFunction={changeView}
          />
        </div>
      );
    }
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />

        <div className="mx-4 flex flex-col gap-4 pb-24">
          <div className="flex flex-col gap-2">
            <img src="/wool.png" alt="Sweater" className="rounded-xl" />

            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xl">testNameMaterial | testId</p>

            <p>Category: testCategory1, testCategory2</p>

            <div>
              <p>Description</p>
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
          </div>
        </div>
      </div>
    );
  }
}
