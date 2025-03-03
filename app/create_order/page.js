'use client'

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useEffect, useState } from "react";
import SelectHolder from "../components/select-holder";
import Menu from "../components/menu";
import SelectedHolder from "../components/selected-holder";
import { fetchMaterialsForOrder } from "../_services/material-service";
import { fetchProductsForOrder } from "../_services/product-service";



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

    const handleCancelProductSelection = () => {
        setSelectedProduct(null);
    }

    const handleSelectMaterialForm = () => {
        setState("materials");
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
        console.log('Navigating to the home page...');
        window.location.href = '/orders';
    };
    

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
            <Header title="Orders" showUserName={true}/>
                
                {state === "form" && (
                    <form className="mx-4 flex flex-col gap-4"> 
                        <p className="font-bold italic text-lg">Create an order</p> 
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Order name <span className="text-red">*</span></label>
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
                                <button type="button" onClick={handleSelectProductForm} className="bg-green rounded-lg w-40">select product</button>
                                <img src="/cross.png" className="h-4"/>
                            </div>                           
                        </div>
                        
                        {selectedProduct &&(
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
                                onRemove={handleCancelProductSelection}/>                                                
                            </div>
                        )}
                        

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Product cost</label>
                            </div>
                            <input 
                            className={inputStyle} 
                            type="text"
                            name="category"                                
                            readOnly
                            value={selectedProduct ? `${productCost}${selectedProduct.currency}` : 0}
                            />   
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <button type="button" onClick={handleSelectMaterialForm} className="bg-green rounded-lg w-40">select material</button>
                                <img src="/cross.png" className="h-4"/>
                            </div>                           
                        </div>
                        {selectedMaterials?.length > 0 && (
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

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Material cost</label>
                            </div>
                            <input 
                            className={inputStyle} 
                            type="text"
                            name="category"  
                            value={materialCost}
                            onChange={(e)=>setMaterialCost(e.target.value)}                                
                                />   
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Work cost</p>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <input 
                            className={inputStyle}                             
                            type="number"
                            value={workCost}
                            onChange={(e)=>setWorkCost(e.target.value)}                              
                                />   
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Total Cost</label>
                                <img src="/cross.png" className="h-4"/>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input 
                                data-id="product-average-cost"
                                className={inputStyle}
                                type="number"
                                value={total}
                                placeholder="0.00"
                                onChange={(e)=>setTotal(e.target.value)}                                
                                />
                                <select
                                // value={currency}
                                // onChange={(e) => setCurrency(e.target.value)}
                                className="rounded-lg border border-grey-200"
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

                {state==="products" && (
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
                                            selected={selectedProduct && product.productId===selectedProduct.productId ? 1 : 0}
                                            onClick={(e)=>handleSelectProduct(product)}
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

                {state==='materials'&&(
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
}