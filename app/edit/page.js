'use client'

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useState } from "react";


export default function Page(){
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2';

    const [] = useState('');

    const handleNavigateToListPage = () => {
        console.log('Navigating to the home page...');
        window.location.href = '/';
    };

    if (user) {
        return (
            <div className="flex flex-col min-h-screen gap-4">
            <Header title="Products" showUserName={true}/>
                    <form className="mx-4 flex flex-col gap-4"> 
                        <p className="font-bold italic text-lg">Create a product</p> 
 
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Id <span className="text-red mr-1">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="id"   //changes
                                
                            ></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Name <span className="text-red mr-1">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="name"   //changes
                                ></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Average cost</label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="averageCost"
                                ></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Category</label>
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

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Description</label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <textarea className="rounded-lg border p-2" name="description"    //changes
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-2" >
                            <div className="flex flex-row justify-between">
                                <label>Select images</label>
                                <img  src="/cross.png"  className="h-4" />                            
                            </div>
                            <div className="relative inline-block">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-40 opacity-0 cursor-pointer" 
                                    multiple 
                                 
                                />
                                <p className="text-center bg-green rounded-lg w-40 py-1 ">select Image</p>
                            </div>
                            

                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Select images</label>
                                <img  src="/cross.png"  className="h-4" />                            
                            </div>
                            <div className="relative inline-block">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-40 opacity-0 cursor-pointer" 
                                    multiple 
                                 
                                />
                                <p className="text-center bg-green rounded-lg w-40 py-1 ">select Image</p>
                            </div>
                            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                                

                            </div>
                        </div>

                        <Menu
                        type="CreateMenu"
                        firstTitle="Cancel"
                        secondTitle="Create"
                        onFirstFunction={handleNavigateToListPage}
                        />       
                </form>
          </div>

        );
      } else {
        return (
            <div className="flex flex-col min-h-screen gap-4">
            <Header title="Artisan Track" />
            <NotLoggedWindow/>            
          </div>
        );
    }
}