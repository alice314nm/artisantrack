'use client'

import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import Link from "next/link";
import { useState } from "react";


export default function Page() {
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2';

    const handleNavigateToListPage = () => {
        window.location.href = '/documents';
    };

    if (user) {
        return (
            <div className="flex flex-col min-h-screen gap-4">
                <Header title="Products" showUserName={true} />
                <form className="mx-4 flex flex-col gap-4">
                    <p className="font-bold italic text-lg">Create a document</p>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Category <span className="text-red mr-1">*</span></label>
                            <img src="/cross.png" className="h-4" />
                        </div>
                        <input className={inputStyle} type="text"
                            name="category"
                            list="categories" />
                        <datalist id="categories">
                            <option value="Sweater" />
                            <option value="Upper Clothes" />
                        </datalist>
                        <ul className="flex flex-col gap-2 list-decimal pl-4">
                            <li>
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <p>wool</p>
                                    <div className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                        <p className="text-xs">x</p>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <p>cotton</p>
                                    <div className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                        <p className="text-xs">x</p>
                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Name <span className="text-red mr-1">*</span></label>
                            <img src="/cross.png" className="h-4" />
                        </div>
                        <input className={inputStyle} name="name"></input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Filter by <span className="text-red mr-1">*</span></label>
                            <img src="/cross.png" className="h-4" />
                        </div>
                        <input className={inputStyle} type="text"
                            name="category"     //changes

                            list="categories" />
                        <datalist id="categories">
                            <option value="Sweater" />
                            <option value="Upper Clothes" />
                        </datalist>
                        <ul className="flex flex-col gap-2 list-decimal pl-4">
                            <li>
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <p>wool</p>
                                    <div className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                        <p className="text-xs">x</p>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <p>cotton</p>
                                    <div className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                        <p className="text-xs">x</p>
                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>

                    <div className="bottom-0 absolute w-[92%]">
                        <Menu
                            type="CreateMenu"
                            firstTitle="Cancel"
                            secondTitle="Create"
                            onFirstFunction={handleNavigateToListPage}
                        />
                    </div>
                </form>
            </div>

        );
    } else {
        return (
            <div className="flex flex-col min-h-screen gap-4">
                <Header title="Artisan Track" />
                <NotLoggedWindow />
            </div>
        );
    }
}