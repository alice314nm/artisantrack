'use client'

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import { useState } from "react";


export default function Page(){
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2';

    const handleNavigateToListPage = () => {
        console.log('Navigating to the home page...');
        window.location.href = '/pages/documents';
    };

    if (user) {
        return (
            <div className="flex flex-col min-h-screen gap-4">
            <Header title="Products" showUserName={true}/>
                    <form className="mx-4 flex flex-col gap-4"> 
                        <p className="font-bold italic text-lg">Create a document</p> 

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Category <span className="text-red mr-1">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"                                
                                list="categories"/>
                            <datalist id="categories">                               
                                <option value="Sweater"/>
                                <option value="Upper Clothes"/>
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
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="name"></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Filter by <span className="text-red mr-1">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"     //changes
                                
                                list="categories"/>
                            <datalist id="categories">                               
                                <option value="Sweater"/>
                                <option value="Upper Clothes"/>
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
    
            <div className="fixed w-screen h-screen flex flex-col text-center items-centeer justify-center gap-4">
              <p>
                Create account to start your <br />
                artisan track
              </p>
              <Link href="/pages/signin">
                <button className="font-bold bg-green py-2 px-4 rounded-lg">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        );
    }
}