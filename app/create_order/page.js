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
import { fetchMaterialsForOrder } from "../_services/material-service";
import { fetchProductsForOrder } from "../_services/product-service";


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


export default function Page(){
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2 w-full';
    const [state, setState] = useState('form')
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedMaterials, setSelectedMaterials] = useState([])
    const [selectedMaterialsQuantities, setSelectedMaterialsQuantities] = useState([])
    const [materialQuantities, setMaterialQuantities] = useState({});
    
    const [productCost, setProductCost] = useState(0);
    const [materialCost, setMaterialCost] = useState(0);
    const [workCost, setWorkCost] = useState(0);
    const [total, setTotal] = useState(0)
    
    useEffect(() => {
        const timeout = setTimeout(() => {
        setLoading(false);
        }, 500); 

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const workCostValue = parseFloat(workCost) || 0;
        const productCostValue = parseFloat(productCost) || 0;
        const materialCostValue = parseFloat(materialCost) || 0;
        
        setTotal(workCostValue + productCostValue + materialCostValue);
      }, [workCost, productCost, materialCost]);

    useEffect(() => {
        if (!user){return;}

        if (user) {
            fetchProductsForOrder(user.uid, setProducts);
            fetchMaterialsForOrder(user.uid, setMaterials);
        }
    }, [user]); 

    const handleSelectProductForm = () => {
        setState("products");
        console.log(products[0].productImages);
    }

    const handleConfirm = () => {
        setState('form');
        calculateMaterialsCost();
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
    
    const handleCancelProductSelection = () => {
        setSelectedProduct(null);
    }

    const handleSelectMaterialForm = () => {
        setState("materials");

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
  

    const handleGoBackFromProducts = () => {

        setState("form");
        setSelectedProduct(null);
    }

    const handleGoBackFromMaterials = () => {
        setState('form');
        setSelectedMaterials([]);
    } 

    const handleSelectProduct = (product) => {
        setSelectedProduct(product); 
        setProductCost(product.averageCost)    
        console.log(product)   
    }

    const handleSelectMaterial = (material) => {
        if (!selectedMaterials.includes(material)) {
          setSelectedMaterials([...selectedMaterials, material]);
          setMaterialQuantities({
            ...materialQuantities,
            [material.materialId]: "0"
          });
        }
        calculateMaterialsCost();

      };

    const handleMaterialQuantityChange = (materialId, value) => {
        setMaterialQuantities({
            ...materialQuantities,
            [materialId]: value
        });
    };

    const handleRemoveMaterial = (material) => {
        setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
        
        const updatedQuantities = { ...materialQuantities };
        delete updatedQuantities[material.materialId];
        setMaterialQuantities(updatedQuantities);
        calculateMaterialsCost();
    };

    const calculateMaterialsCost = () => {
        if (selectedMaterials.length === 0) {
          setMaterialCost(0);
          return;
        }
        
        const totalCost = selectedMaterials.reduce((total, material) => {
          const selectedQuantity = parseFloat(materialQuantities[material.materialId] || 0);
          const totalQuantity = parseFloat(material.quantity || 0);
          const totalMaterialCost = parseFloat(material.total || 0);
          console.log(selectedQuantity, totalQuantity, totalMaterialCost)
          let materialCost = 0;
          
          if (!totalQuantity || isNaN(totalQuantity) || totalQuantity === 0 || 
              !totalMaterialCost || isNaN(totalMaterialCost)) {
            return total;
          } else {
            const unitCost = totalMaterialCost / totalQuantity;
            materialCost = selectedQuantity * unitCost;
          }
          
          return total + materialCost;
        }, 0);
        
        setMaterialCost(totalCost);
    };

    const handleResetSelectedMaterial = () => {
        setSelectedMaterials([])
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
      
      {state === "form" && (
        <form 
          className="mx-4 flex flex-col gap-4" 
          onSubmit={handleCreateOrder}
        > 
          <p className="font-bold italic text-lg">Create an order</p>
          {errorMessage && errorMessage.length > 0 && (
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
                selected={deadline ? new Date(deadline) : null}
                onChange={(date) => setDeadline(date)}
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
                selected={startDate ? new Date(startDate) : null}
                onChange={(date) => setStartDate(date)}
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
          
          {/* Product Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <button 
                type="button" 
                onClick={handleSelectProductForm} 
                className="bg-green rounded-lg w-40"
              >
                select product
              </button>
              <img 
                src={selectedProduct ? "/check.png" : "/cross.png"} 
                className={selectedProduct ? "h-6 text-green" : "h-4"}
              />
            </div>                       
          </div>
  
          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="flex flex-col gap-2">
              <SelectedHolder
                type="product"
                imageSrc={
                  selectedProduct.productImages && selectedProduct.productImages.length > 0
                    ? selectedProduct.productImages[0].url
                    : "/noImage.png"
                }
                name={selectedProduct.name}
                id={selectedProduct.productId}
                onRemove={handleCancelProductSelection}
              />                                                
            </div>
          )}
  
          {/* Material Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <button 
                type="button" 
                onClick={handleSelectMaterialForm} 
                className="bg-green rounded-lg w-40"
              >
                select material
              </button>
              <img 
                src={selectedMaterials && selectedMaterials.length > 0 ? "/check.png" : "/cross.png"} 
                className={selectedMaterials && selectedMaterials.length > 0 ? "h-6 text-green" : "h-4"}
              />
            </div>                         
          </div>
  
          {/* Selected Materials Display */}
          {selectedMaterials && selectedMaterials.length > 0 && (
            <div className="flex flex-col gap-2">
              {selectedMaterials.map((material, index) => (
                <SelectedHolder
                  key={index}
                  type="material"
                  imageSrc={
                    material.images && material.images.length > 0
                      ? material.images[0].url
                      : "/noImage.png"
                  }
                  name={material.name}
                  id={material.materialId}
                  index={index+1}
                  quantity={`${materialQuantities[material.materialId] || 0}`}
                  onRemove={() => handleRemoveMaterial(material)}
                />
              ))}                          
            </div>
          )}
                
          {/* Material cost */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Material cost</label>
              <img
                src={materialCost === "" ? "/cross.png" : "/check.png"}
                className={materialCost === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input 
              className={inputStyle} 
              type="text"
              value={materialCost}
              name="materialCost"
              onChange={(e) => setMaterialCost(e.target.value)}   
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
            <input 
              className={inputStyle} 
              type="text"
              value={selectedProduct ? `${productCost}${selectedProduct.currency || ''}` : ""}
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
              type="number"
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
            <div className="flex flex-row gap-2">
              <input 
                data-id="product-average-cost"
                className={inputStyle}
                type="number"
                value={total || totalCost}
                placeholder="0.00"
                onChange={(e) => setTotal(e.target.value)}
                disabled={!allowTotalEdit}
              />
              <select
                className="rounded-lg border border-grey-200"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
          </div>
                
          <Menu
            type="CreateMenu"
            firstTitle="Cancel"
            secondTitle="Create"
            onFirstFunction={handleNavigateToListPage}
          />       
        </form>
      )}

      {/* Products Selection State */}
      {state === "products" && (
        <div className="flex flex-col gap-4">
          <SearchBar/>
          {products.length === 0 ? (
            <p className="flex flex-col items-center w-full py-40">No products in inventory</p>
          ) : (
            <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
              {products.map((product, index) => (
                <SelectHolder
                  key={index}
                  type="product"
                  imageSource={
                    product.productImages && product.productImages.length > 0
                      ? product.productImages[0].url
                      : "/noImage.png"
                  }
                  name={product.name}
                  id={product.productId}
                  selected={selectedProduct && product.productId === selectedProduct.productId ? 1 : 0}
                  onClick={(e) => handleSelectProduct(product)}
                />
              ))}
            </div>
          )}
          <Menu
            type="SelectMenu"
            onFirstFunction={handleGoBackFromProducts}
            onSecondFunction={handleCancelProductSelection}
            onThirdFunction={handleConfirm}
          />
        </div>
      )}

      {/* Materials Selection State */}
      {state === 'materials' && (
        <div className="flex flex-col gap-4">
          <SearchBar/>
          {materials.length === 0 ? (
            <p className="flex flex-col items-center w-full py-40">No materials in inventory</p>
          ) : (
            <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
              {materials.map((material, index) => (
                <SelectHolder
                  key={index}
                  type="material"
                  imageSource={
                    material.images && material.images.length > 0
                      ? material.images[0].url
                      : "/noImage.png"
                  }
                  name={material.name}
                  id={material.materialId}
                  quantity={material.quantity || "—"}
                  selected={selectedMaterials.includes(material)}
                  selectedQuantity={materialQuantities[material.materialId]}
                  onClick={selectedMaterials.includes(material) 
                    ? () => handleRemoveMaterial(material) 
                    : () => handleSelectMaterial(material)
                  }
                  onQuantityChange={handleMaterialQuantityChange}
                />
              ))}
            </div>
          )}
          <Menu
            type="SelectMenu"
            onFirstFunction={handleGoBackFromMaterials}
            onSecondFunction={handleResetSelectedMaterial}
            onThirdFunction={handleConfirm}
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