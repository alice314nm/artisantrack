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
  const [isEditing, setIsEditing] = useState(false);
  const [productName, setProductName] = useState("testNameProduct");
  const [productCategory, setProductCategory] = useState(
    "testCategory1, testCategory2"
  );
  const [productDescription, setProductDescription] = useState(
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
  );
  const [avgTotal, setAvgTotal] = useState(123);

  const openConfirmation = () => {
    setConfirmWindowVisibility(true);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  if (user) {
    if (!clientView) {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Products" userName={"Olga Ivanova"} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Your view">
                Your view:
              </p>
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
                <button
                  className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0"
                  onClick={toggleEdit}
                >
                  <p>{isEditing ? "Save" : "Edit"}</p>
                  <img
                    src={isEditing ? "/Save.png" : "/Pencil.png"}
                    className="w-4 h-4"
                  />
                </button>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="text-xl border p-2 rounded w-[300px]"
                />
              ) : (
                <p className="text-xl">
                  {productName}
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].title
                  : "Product not found"} */}
                </p>
              )}

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <p>Category: </p>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="border p-2 rounded w-[300px]"
                  />
                </div>
              ) : (
                <p>
                  Category: {productCategory}
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].category
                  : "Product not found"} */}
                </p>
              )}

              <div>
                <p>Pattern description</p>
                {isEditing ? (
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="border p-2 rounded w-full"
                    rows={3}
                  />
                ) : (
                  <p>
                    {productDescription}
                    {/* The code below should replace to show the description of product */}
                    {/* <p>
                  {filteredProducts.length > 0
                  ? filteredProducts[0].description
                  : "Product not found"}
                </p> */}
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <p>Average Total:</p>
                  <input
                    type="number"
                    value={avgTotal}
                    onChange={(e) => setAvgTotal(e.target.value)}
                    className="border p-2 rounded"
                  />
                </div>
              ) : (
                <p>
                  Average Total: {avgTotal}$
                  {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
                </p>
              )}
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
          <Header title="Products" userName="Olga Ivanova" />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
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
              <p className="text-xl">
                {productName}
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].title
                  : "Product not found"} */}
              </p>
              <p>
                Category: {productCategory}
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].category
                  : "Product not found"} */}
              </p>
              <div>
                <p>Pattern description</p>
                {productDescription}
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].description
                  : "Product not found"} */}
              </div>
              <p>
                Average Total: {avgTotal}$
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
  } else {
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
            <p className="text-xl">
              testNameProduct
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].title
              : "Product not found"} */}
            </p>
            <p>
              Category: testCategory1, testCategory2
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].category
              : "Product not found"} */}
            </p>
            <p>
              Average Total: 123$
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
