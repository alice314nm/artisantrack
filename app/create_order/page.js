'use client'

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useState } from "react";
import SelectHolder from "../components/select-holder";
import Menu from "../components/menu";
import SelectedHolder from "../components/selected-holder";



export default function Page(){
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2 w-full';
    const [state, setState] = useState('form')

    const handleSelectProduct = () => {
        setState("products");
    }

    const handleSelectMaterial = () => {
        setState("materials");
    }

    const handleGoBack = () => {
        setState("form");
    }

    const handleNavigateToListPage = () => {
        console.log('Navigating to the home page...');
        window.location.href = '/orders';
    };

    if (user) {
        return (
            <div className="flex flex-col min-h-screen gap-4">
            <Header title="Orders" showUserName={true}/>
                
                {state === "form" && (
                    <form className="mx-4 flex flex-col gap-4"> 
                        <p className="font-bold italic text-lg">Create an order</p> 
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Name of the order <span className="text-red">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="id"   //changes
                                
                            ></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Deadline</label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} name="name"   //changes
                                ></input>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Customer name <span className="text-red">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"                                
                                />             
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-between">
                                <label>Description<span className="text-red">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <textarea className="rounded-lg border p-2" name="description"    //changes
                            ></textarea>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <button type="button" onClick={handleSelectProduct} className="bg-green rounded-lg w-40">select product</button>
                                <img src="/cross.png" className="h-4"/>
                            </div>                           
                        </div>

                        <div className="flex flex-col gap-2">
                            <SelectedHolder
                            type="product"
                            imageSource={"/noImage.png"}
                            name={"Sweater"}
                            id={"123"}
                            onRemove={(e)=>console.log('remove product')}/>                                                
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <button type="button" onClick={handleSelectMaterial} className="bg-green rounded-lg w-40">select material</button>
                                <img src="/cross.png" className="h-4"/>
                            </div>                           
                        </div>

                        <div className="flex flex-col gap-2">
                            <SelectedHolder
                            type="material"
                            imageSource={"/noImage.png"}
                            name={"Sweater"}
                            id={"123"}
                            index={1}
                            quantity={"400g"}
                            onRemove={(e)=>console.log('remove material')}/>
                            <SelectedHolder
                            type="material"
                            imageSource={"/noImage.png"}
                            name={"Sweater"}
                            id={"123"}
                            index={2}
                            quantity={"400g"}
                            onRemove={(e)=>console.log('remove material')}/>                          
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Material cost <span className="text-red">*</span></label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"                                
                                />   
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Work cost:</p>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"                                
                                />   
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Total cost:</p>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input className={inputStyle} type="text"
                                name="category"                                
                                />   
                        </div>

                        <Menu
                        type="CreateMenu"
                        firstTitle="Cancel"
                        secondTitle="Create"
                        onFirstFunction={handleNavigateToListPage}
                        />       
                    </form>
                )}

                {state==="products" && (
                    <div className="flex flex-col gap-2">
                        <SearchBar/>
                        <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
                        <SelectHolder
                        type="product"
                        imageSource="/noImage.png"
                            name="testName"
                            id="testId"
                            selected={1}
                        />
                        <SelectHolder
                        type="product"
                        imageSource="/noImage.png"
                            name="testName"
                            id="testId"
                        />
                        </div>
                        <Menu
                        type="SelectMenu"
                        onFirstFunction={handleGoBack}
                        onSecondFunction={(e) => console.log("reset")}
                        onThirdFunction={(e) => console.log("confirm")}
                        />
                    </div>
                )}

                {state==='materials'&&(
                    <div className="flex flex-col gap-2">
                        <SearchBar/>
                        <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
                            <SelectHolder
                            type="material"
                            imageSource="/noImage.png"
                            name="testName"
                            id="testId"
                            quantity="400g"
                            selected={true}
                            />
                            <SelectHolder
                            type="material"
                            imageSource="/noImage.png"
                            name="testName"
                            id="testId"
                            quantity="400g"
                            selected={false}
                            />
                        </div>
                        <Menu
                        type="SelectMenu"
                        onFirstFunction={handleGoBack}
                        onSecondFunction={(e) => console.log("reset")}
                        onThirdFunction={(e) => console.log("confirm")}
                        />
                    </div>
                )}
                
                

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