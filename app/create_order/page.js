'use client'

import { firebaseConfig } from '../_utils/firebase';
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";  
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SelectHolder from "../components/select-holder";
import Menu from "../components/menu";
import SelectedHolder from "../components/selected-holder";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dbAddOrder } from "@/app/_services/order-service";

export default function Page(){
  const router = useRouter();
  
  const { user } = useUserAuth();
  const inputStyle = 'h-9 rounded-lg border p-2 w-full';
  const [state, setState] = useState('form')
  const [loading, setLoading] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [daysCounter, setDaysCounter] = useState(0);
  const [materialCost, setMaterialCost] = useState("");
  const [productCost, setProductCost] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [workCost, setWorkCost] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const firebaseApp = initializeApp(firebaseConfig);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [])

  useEffect(() => {
    if (selectedMaterial) {
      // Fetch material cost based on selection
      const cost = getMaterialCost(selectedMaterial); 
      setMaterialCost(cost);
    }
  }, [selectedMaterial]);
  
  useEffect(() => {
    if (selectedProduct) {
      // Fetch product cost based on selection
      const cost = getProductCost(selectedProduct); 
      setProductCost(cost);
    }
  }, [selectedProduct]);

  useEffect(() => {
  const total = 
    (parseFloat(materialCost) || 0) + 
    (parseFloat(productCost) || 0) + 
    (parseFloat(workCost) || 0);
  setTotalCost(total.toFixed(2));
}, [materialCost, productCost, workCost]);


  const isValidDate = (date) => !isNaN(new Date(date).getTime());
  
  const calculateDaysCounter = (startDate, deadline) => {
    if (startDate && deadline) {
        const start = new Date(startDate);
        const end = new Date(deadline);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;  
    }
    return 0; 
  };
    
  useEffect(() => {
    if (startDate && deadline) {
        const days = calculateDaysCounter(startDate, deadline);
        setDaysCounter(days); // Set the calculated daysCounter state
      } else {
        console.log("Invalid startDate or deadline:", startDate, deadline); // Debugging
    }
  }, [startDate, deadline]);

  const handleCreateOrder = async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");


  const auth = getAuth(firebaseApp);  
  const user = auth.currentUser; 
    
  if (!user) {
      setErrorMessage("You need to be logged in to create an order.");
      setLoading(false);
      return;
    }
    
  if (!isValidDate(startDate) || !isValidDate(deadline)) {
      setErrorMessage("Please ensure start date and deadline are valid.");
      setLoading(false);
      return;
    }
  const daysUntilDeadline = calculateDaysCounter(startDate, deadline); 
  const parsedWorkCost = parseFloat(workCost) || 0;
  console.log("Days Until Deadline:", daysUntilDeadline);

    

  const orderObj = {
      orderName: orderName || "Untitled Order",
      customerName,
      description:desc,
      selectedProduct,
      selectedMaterial,
      materialCost: parseFloat(materialCost).toFixed(2),
      productCost: parseFloat(productCost).toFixed(2),
      workCost: parsedWorkCost.toFixed(2),
      totalCost: (
        parseFloat(materialCost) + 
        parseFloat(productCost) + 
        parsedWorkCost
      ).toFixed(2),
      startDate,
      deadline,
      daysUntilDeadline,
  };
    
  
        try {
            await dbAddOrder(user.uid, orderObj);
            console.log("Order added successfully");
            window.location.href = "/orders";
        } catch (error) {
            console.error("Error adding order:", error);
            setErrorMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
      };

    const handleWorkCostChange = (e) => {
      setWorkCost(e.target.value);
      console.log("workCost after change:", e.target.value);
  };
    
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);  // Store product in the state
    };
      
    const handleSelectMaterial = () => {
        setSelectedMaterial(materials);
    }
  
    const handleGoBack = () => {
        setState("form");
    }
    
    const handleNavigateToListPage = () => {
        window.location.href = '/orders';
    };
  
    const computeTotalCost = () => {
    const material = selectedMaterial ? parseFloat(selectedMaterial.cost) || 0 : 0;
    const product = selectedProduct ? parseFloat(selectedProduct.cost) || 0 : 0;
    const work = parseFloat(workCost) || 0;
    
      setTotalCost((material + product + work).toFixed(2));
    };
    
    
    useEffect(() => {
        computeTotalCost();
    }, [selectedMaterial, selectedProduct, workCost]);
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <img src="/loading-gif.gif" className="h-10" />
        </div>
      );
    }
      
    if (user) {
        return (
          <div className="flex flex-col min-h-screen gap-4">
            <Header title="Create Orders" showUserName={true}/>
            <form 
              className="mx-4 flex flex-col gap-4" 
              onSubmit={handleCreateOrder}> 
                
              <p className="font-bold italic text-lg">Create an order</p>
              {errorMessage.length === 0 ? null : (
                <p className="text-red">{errorMessage}</p>
              )}
            
              {/* Name of the order */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <label>Name of the order <span className="text-red">*</span></label>
                      <img
                        src={orderName === "" ? "/cross.png" : "/check.png"}
                        className={orderName === "" ? "h-4" : "h-6 text-green"}
                      />
                  </div>
                  <input 
                    className={inputStyle} 
                    name="orderName" 
                    value={orderName} 
                    onChange={(e) => setOrderName(e.target.value)}   
                  ></input>
              </div>
                
              {/* Deadline, Start Date, and Days Counter */}
              <div className="flex gap-4">
                {/* Deadline */}
                <div className="flex flex-col gap-2 w-3/4">
                  <div className="flex flex-row justify-between">
                    <label>Deadline</label>
                    <img
                      src={deadline === "" ? "/cross.png" : "/check.png"}
                      className={deadline === "" ? "h-4" : "h-6 text-green"}
                    />
                  </div>
                  <DatePicker
                    selected={deadline ? new Date(deadline) : null} // Ensure deadline is a valid Date object
                    onChange={(date) => setDeadline(date)} // Update the deadline when a date is selected
                    dateFormat="yyyy-MM-dd"
                    className={`${inputStyle} w-full`}
                    placeholderText="Select a deadline"
                  />
                </div>
                
              {/* Start Date */}
              <div className="flex flex-col gap-2 w-3/4">
                <div className="flex flex-row justify-between">
                  <label>Start Date</label>
                  <img
                      src={startDate === "" ? "/cross.png" : "/check.png"}
                      className={startDate === "" ? "h-4" : "h-6 text-green"}
                    />
                </div>
                <DatePicker
                  selected={startDate ? new Date(startDate) : null} // Ensure startDate is a valid Date object
                  onChange={(date) => setStartDate(date)} // Update the start date when a date is selected
                  dateFormat="yyyy-MM-dd"
                  className={`${inputStyle} w-full`}
                  placeholderText="Select a start date"
                />
              </div>
    
              {/* Days Counter */}
              <div className="flex flex-col gap-2 w-1/4">
                <div className="flex flex-row justify-between">
                  <label>Days until the deadline</label>
                </div>
                <input
                  className={`${inputStyle} w-full`}
                  type="text"
                  value={daysCounter}
                  disabled
                />
              </div>
            </div>
                    
                    
              {/* Customer name */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <label>Customer name <span className="text-red">*</span></label>
                      <img
                        src={customerName === "" ? "/cross.png" : "/check.png"}
                        className={customerName === "" ? "h-4" : "h-6 text-green"}
                      />
                  </div>
                  <input 
                    className={inputStyle} 
                    name="customerName" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}   
                  ></input>            
              </div>
              {/* Description */}
              <div className="flex flex-col">
                  <div className="flex flex-row justify-between">
                    <label>Description<span className="text-red">*</span></label>
                    <img
                      src={desc === "" ? "/cross.png" : "/check.png"}
                      className={desc === "" ? "h-4" : "h-6 text-green"}  
                          />
                  </div>
                  <textarea 
                    className="rounded-lg border p-2" 
                    name="description" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)}   
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
                    
              {/* Material cost */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <label>Material cost <span className="text-red">*</span></label>
                      <img
                      src={materialCost === "" ? "/cross.png" : "/check.png"}
                      className={materialCost === "" ? "h-4" : "h-6 text-green"}
                    />
                  </div>
                  <input className={inputStyle} type="text"
                  value={selectedMaterial ? selectedMaterial.cost : ""}
                      name="materialCost"   
                      disabled={true}                       
                      />   
              </div>
      
              {/* Product cost */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <p>Product cost:</p>
                      <img
                      src={productCost === "" ? "/cross.png" : "/check.png"}
                      className={productCost === "" ? "h-4" : "h-6 text-green"}
                    />
                  </div>
                  <input className={inputStyle} type="text"
                  value={selectedProduct ? selectedProduct.cost : ""}
                      name="productCost"
                      disabled={true}                              
                      />   
              </div>
                
              {/* Work Cost */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <p>Work cost:</p>
                      <img
                      src={workCost === "" ? "/cross.png" : "/check.png"}
                      className={workCost === "" ? "h-4" : "h-6 text-green"}
                    />
                  </div>
                  <input 
                    className={inputStyle} 
                    type="text"
                    value={workCost}
                    name="workCost"
                    onChange={(e) => setWorkCost(e.target.value)} 
                  />
              </div>
      
              {/* Total cost */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                      <p>Total cost:</p>
                      <img
                        src={totalCost === "" ? "/cross.png" : "/check.png"}
                        className={totalCost === "" ? "h-4" : "h-6 text-green"}
                      />
                  </div>
                  <input className={inputStyle} type="text"
                      value={totalCost === "" ? "" : `$${totalCost}`} 
                      name="totalCost"  
                      disabled // Read-only input field 
                  />   
              </div>
                    
                  <Menu
                  type="CreateMenu"
                  firstTitle="Cancel"
                  secondTitle="Create"
                  onFirstFunction={handleNavigateToListPage}
                  />       
            </form>
                    

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