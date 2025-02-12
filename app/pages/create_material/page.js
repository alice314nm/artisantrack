'use client'

import { dbAddMaterial } from "@/app/_services/material-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import { storage } from "@/app/_utils/firebase";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import SmallBlockHolder from "@/app/components/small-block-holder";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import Link from "next/link";
import { useEffect, useState } from "react";



export default function Page(){
    const { user } = useUserAuth();
    const inputStyle = 'h-9 rounded-lg border p-2 w-full';
    const [loading, setLoading] = useState(true);


    const [materialId, setMaterialId] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const [color, setColor] = useState('');
    const [shop, setShop] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [total, setTotal] = useState('');
    const [desc, setDesc] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]); 
    
    const [costItems, setCostItems] = useState([]); // New state to hold the cost items

    useEffect(() => {
        const timeout = setTimeout(() => {
        setLoading(false);
        }, 500); 

        return () => clearTimeout(timeout);
    }, []);

    const handleNavigateToListPage = () => {
        window.location.href = '/pages/materials';
    };

    const handleAddCategory = () => {
        if (category.trim() && !categories.includes(category)) {
            setCategories([...categories, category]);
            setCategory('');
        }
    };

    const handleRemoveCategory = (cat) => {
        setCategories(categories.filter(c => c !== cat));
    };

    const handleRemoveCost = (cost) => {
        const updatedCostItems = costItems.filter(item => item !== cost);

        // Recalculate the total based on the updated costItems array
        const newTotal = updatedCostItems.reduce((acc, item) => acc + item.price, 0);

        // Update the state with the new total and cost items
        setCostItems(updatedCostItems);
        setTotal(newTotal.toFixed(2));

    };

    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        setLoading(true);

    
        const uploadedImages = await handleUpload() || []; 
    
        const materialObj = {
            materialId,
            name,
            categories,
            color,
            costItems: costItems || [],
            total,
            description: desc,
            images: uploadedImages 
        };
    
        try {
            await dbAddMaterial(user.uid, materialObj);
            console.log("Material added successfully");
            window.location.href = '/pages/materials';
            setLoading(false);

        } catch (error) {
            console.error("Error adding material:", error);
        }
    };
    
    

    const handleAddCostItem = () => {
        if (shop && price && quantity && currency) {
            const newItem = { 
                shop, 
                price: parseFloat(price), 
                currency, 
                quantity: parseInt(quantity) 
            };
            
            // Add the new cost item to the costItems array
            const updatedCostItems = [...costItems, newItem];
            setCostItems(updatedCostItems);
    
            // Recalculate the total
            const newTotal = updatedCostItems.reduce((acc, item) => acc + item.price, 0);
            setTotal(newTotal.toFixed(2));
    
            // Reset the form fields
            setShop('');
            setPrice('');
            setCurrency('');
            setQuantity('');
        }
    };


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };

    const removeSelectedImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
    };


    const handleUpload = async () => {
        if (!images.length) return []; // Ensure it returns an empty array instead of undefined
    
        const userId = user.uid;
        const uploadedImages = [];
    
        for (const image of images) {
            const filePath = `images/${userId}/${image.name}`;
            const fileRef = ref(storage, filePath);
    
            try {
                const snapshot = await uploadBytes(fileRef, image);
                const downloadUrl = await getDownloadURL(snapshot.ref);
    
                uploadedImages.push({ url: downloadUrl, path: filePath });
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }
    
        setImageUrls((prev) => [...prev, ...uploadedImages.map(img => img.url)]);
        setImages([]); 
    
        return uploadedImages;
    };
    
    if (loading) {
        return (
          <div className="flex items-center justify-center h-screen">
            <img src="/loading-gif.gif" className="h-10"/>      
          </div>
        );
    }


    if (user) {
        return (
            <div className="flex flex-col min-h-screen gap-4">
            <Header title="Materials" showUserName={true}/>
                <form className="mx-4 flex flex-col gap-4" onSubmit={handleCreateMaterial}> 
                        <p className="font-bold italic text-lg">Create a material</p> 
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Id <span className="text-red">*</span></label>
                                
                                <img  src={materialId === "" ? "/cross.png" : "/check.png"}  className={materialId === "" ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            <input required className={inputStyle} value={materialId} onChange={(e) => setMaterialId(e.target.value)} />
                        </div>


                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Name <span className="text-red">*</span></label>
                                <img  src={name === "" ? "/cross.png" : "/check.png"}  className={name === "" ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            <input required className={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />

                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Color</label>
                                <img  src={color === "" ? "/cross.png" : "/check.png"}  className={color === "" ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            <input className={inputStyle} value={color} onChange={(e) => setColor(e.target.value)} />

                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <label>Category</label>
                                <img src={categories.length === 0 ? "/cross.png" : "/check.png"} className={categories.length === 0 ? "h-4" : "h-6 text-green"} />
                            </div>
                            <div className="flex flex-row gap-2">
                                <input 
                                    list="categories" 
                                    className={inputStyle} 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddCategory} 
                                    className="bg-green px-4 py-1 rounded-lg"
                                >
                                    Add
                                </button>
                            </div>
                            <datalist id="categories">                                
                                <option value="Sweater"/>
                                <option value="Upper Clothes"/>
                            </datalist>

                            {/* Category List */}
                            <ul className="flex flex-col gap-2 list-decimal pl-4">
                                {categories.map((cat, index) => (
                                    <li key={index}>
                                        <div className="flex flex-row items-center justify-between gap-2">
                                            <p>{cat}</p>
                                            <button type="button" onClick={() => handleRemoveCategory(cat)} className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                                <p className="text-xs">x</p>
                                            </button>
                                        </div>                                    
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-between">
                                <p>Cost</p>
                                <img  src={total === "" ? "/cross.png" : "/check.png"}  className={total === "" ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center">
                                    <label className="w-16 text-right">Shop:</label>
                                    <input className={`${inputStyle} flex-1 ml-2`} value={shop} onChange={(e) => setShop(e.target.value)} />
                                </div>
                                <div className="flex flex-row items-center">
                                    <label className="w-16 text-right">Price:</label>
                                    <input className={`${inputStyle} flex-1 ml-2`} value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                                <div className="flex flex-row items-center">
                                    <label className="w-16 text-right">Currency:</label>
                                    <input className={`${inputStyle} flex-1 ml-2`} value={currency} onChange={(e) => setCurrency(e.target.value)} />
                                </div>
                                <div className="flex flex-row items-center">
                                    <label className="w-16 text-right">Quantity:</label>
                                    <input className={`${inputStyle} flex-1 ml-2`} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={handleAddCostItem} className="bg-green py-1 w-24 rounded-lg">Add</button>
                                </div>
                        </div>
                        
                        {/* Display added items in the list */}
                        <ul className="flex flex-col gap-2 mt-2 list-decimal pl-4">
                            {costItems.map((item, index) => (
                                <li key={index}>
                                    <div className="flex flex-row items-center justify-between gap-2">
                                        <p>{item.shop}, {item.price.toFixed(2)}{item.currency}, {item.quantity}</p>
                                        <button type="button" onClick={() => handleRemoveCost(item)} className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                            <p className="text-xs">x</p>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                        
                        <div className="flex flex-row items-center gap-2">
                            <label>Total:</label>
                            <input className={inputStyle} value={total} onChange={(e) => setTotal(e.target.value)} />

                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-between">
                                <p>Description:</p>
                                <img  src={desc === "" ? "/cross.png" : "/check.png"}  className={desc === "" ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            <textarea className="rounded-lg border p-2" value={desc} onChange={(e) => setDesc(e.target.value)} />

                        </div>

                        

                        <div className="flex flex-col gap-2">
                            {/* Image Selection */}
                            <div className="flex flex-row justify-between">
                                <label>Select images</label>
                                <img  src={images.length===0 ? "/cross.png" : "/check.png"}  className={images.length===0 ? "h-4" : "h-6 text-green"} />                            
                            </div>
                            <div className="relative inline-block">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-40 opacity-0 cursor-pointer" 
                                    multiple 
                                    onChange={handleFileChange} 
                                />
                                <p className="text-center bg-green rounded-lg w-40 py-1 ">select Image</p>
                            </div>

                           
                            {/* Preview Chosen Images */}
                            {images.length > 0 && (
                                <div className="flex flex-row gap-2 overflow-x-auto">
                                {images.map((image, index) => (
                                    <div key={index}>
                                        <SmallBlockHolder
                                        type="multiplePictureDelete"
                                        id={index+1}
                                        imageSource={URL.createObjectURL(image)}
                                        onButtonFunction={() => removeSelectedImage(index)}
                                        />
                                    </div>
                                ))}
                                </div>
                            )}                           
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