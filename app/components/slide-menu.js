'use client';

import Link from 'next/link';
import React, { useState } from 'react';

/*
    SlideMenu - component to show slide menu with: Log out, profile, documents
    finance, products, materials, orders options

    props:
    - menuVisible - function to show the menu
*/

export default function SlideMenu({ menuVisible }) {
    const buttonStyleLi = "py-2 px-4 border-b border-green hover:bg-lightBeige";
    const [inventoryVisible, setInventoryVisible] = useState(false);

    const toggleInventory = () => {
        setInventoryVisible((prev) => !prev);
    };

    return (
        <div className="z-10 fixed w-full bottom-0 right-0 flex flex-col justify-end">
            {/* Slide Menu */}
            <div
                className={`transition-all duration-300 overflow-hidden w-[200px] h-screen bg-beige font-bold bottom-20 ${
                    menuVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-0 hidden"
                } fixed z-10`}
            >
                <ul className="h-screen flex flex-col justify-end">
                    <Link href="/pages/login" className="flex flex-row gap-2 py-2 px-4 justify-items-center left-20 w-[200px] fixed top-24 hover:bg-darkBeige">
                        <p>Log out</p>
                        <img src="/logout.png"/>
                    </Link>
                    <Link className={buttonStyleLi} href='/pages/profile'>
                        <p>Profile</p>
                    </Link>

                    <Link className={buttonStyleLi} href='/pages/documents'>
                        <p>Documents</p>
                    </Link>
                    
                    <Link className={buttonStyleLi} href='/pages/finances'>
                        <p>Finance</p>
                    </Link>
                    <li>
                        <div
                            className={`flex flex-row gap-1 items-center cursor-pointer ${buttonStyleLi}`}
                            onClick={toggleInventory}
                        >
                            <p>Inventory</p>
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
                                inventoryVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                            style={{
                                maxHeight: inventoryVisible ? '200px' : '0px',
                            }}
                        >
                            <Link className={`${buttonStyleLi} px-8`} href='/'>
                                Products
                            </Link>
                            <Link className={`${buttonStyleLi} px-8`} href='/pages/materials'>
                                Materials
                            </Link>
                        </div>
                    </li>
                    <Link className={buttonStyleLi} href='/pages/orders'>
                        <p>Orders</p>
                    </Link>
                </ul>
            </div>
        </div>
    );
}
