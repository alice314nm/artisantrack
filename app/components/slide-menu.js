"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useUserAuth } from "../_utils/auth-context";

export default function SlideMenu({ menuVisible }) {
  const buttonStyleLi =
    "py-2 px-4 gap-2  border-b border-green hover:bg-lightBeige flex flex-row items-center";
  const [inventoryVisible, setInventoryVisible] = useState(false);

  const { firebaseSignOut } = useUserAuth();

  const toggleInventory = () => {
    setInventoryVisible((prev) => !prev);
  };

  const handleLogout = async () => {
    await firebaseSignOut();
    window.location.href = "/";
  };

  return (
    <div className="z-10 fixed w-full bottom-0 right-0 flex flex-col justify-end">
      {/* Slide Menu */}
      <div
        className={`
          fixed z-10 w-[200px] h-screen bg-beige font-bold bottom-16 
          transition-all duration-300 ease-in-out 
          ${
            menuVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full"
          }
        `}
        data-id="slide-menu"
      >
        <ul className="h-screen flex flex-col justify-end">
          <a
            data-id="logout"
            onClick={handleLogout}
            className="flex gap-2 justify-end py-2 px-4 text-right border-b border-green w-full bg-beige hover:bg-darkBeige cursor-pointer"
            style={{
              position: "sticky",
              top: 0,
            }}
          >
            <p>Log out</p>
            <img src="/logout.png" className="w-5" alt="Logout" />
          </a>

          <Link className={buttonStyleLi} href="/">
            <img src="/home.png" className="w-5" />
            <p>Home</p>
          </Link>

          <Link
            className={buttonStyleLi}
            href="/profile"
            data-id="slide-profile"
          >
            <img src="/profile.png" className="w-5" />
            <p>Profile</p>
          </Link>

          <Link className={buttonStyleLi} href="/documents">
            <img src="/documents.png" className="w-5" />
            <p>Documents</p>
          </Link>

          <Link
            className={buttonStyleLi}
            href="/finances"
            data-id="slide-finance"
          >
            <img src="/finances.png" className="w-5" />
            <p>Finance</p>
          </Link>
          <li>
            <div
              className={`flex flex-row gap-1 items-center cursor-pointer ${buttonStyleLi}`}
              onClick={toggleInventory}
            >
              <p
                className="flex flex-row gap-2 items-center"
                data-id="slide-inventory"
              >
                <img src="/inventory.png" className="w-5" />
                Inventory
              </p>
              <img
                src="/angle-small-down.png"
                className={`w-5 ${inventoryVisible ? "hidden" : ""}`}
                alt="Expand"
              />
              <img
                src="/angle-small-up.png"
                className={`w-5 ${inventoryVisible ? "" : "hidden"}`}
                alt="Collapse"
              />
            </div>

            {/* Submenu */}
            <div
              className={`transition-all duration-300 overflow-hidden flex flex-col ${
                inventoryVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                maxHeight: inventoryVisible ? "200px" : "0px",
              }}
              data-id="inventory-submenu"
            >
              <Link
                data-id="slide-products"
                className={`${buttonStyleLi} px-11`}
                href="/products"
              >
                Products
              </Link>
              <Link
                data-id="slide-materials"
                className={`${buttonStyleLi} px-11`}
                href="/materials"
              >
                Materials
              </Link>
            </div>
          </li>
          <Link className={buttonStyleLi} href="/orders" data-id="slide-orders">
            <img src="/orders.png" className="w-5" />
            <p>Orders</p>
          </Link>
        </ul>
      </div>
    </div>
  );
}
