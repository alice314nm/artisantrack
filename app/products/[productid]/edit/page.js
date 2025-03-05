"use client";

import { fetchProductById, fetchProductCategories, fetchProductIds, updateProduct } from "@/app/_services/product-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import { app, storage } from "@/app/_utils/firebase";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SmallBlockHolder from "@/app/components/small-block-holder";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation'; // Import the useRouter hook


export default function Page() {
    const router = useRouter();
    const params = useParams();
    const productId = params.productid;

    const [isMounted, setIsMounted] = useState(false);
    const { user } = useUserAuth();
    const inputStyle = "w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green";
    const [loading, setLoading] = useState(true);
    const [userProductId, setUserProductId] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [desc, setDesc] = useState("");
    const [productImages, setProductImages] = useState([]);
    const [patternImages, setPatternImages] = useState([]);
    const [currency, setCurrency] = useState('USD');
    const [patternImageUrls, setPatternImageUrls] = useState([]);
    const [productImageUrls, setProductImageUrls] = useState([]);
    const [product, setProduct] = useState(null);
    const [averageCost, setAverageCost] = useState("");

    const [productIds, setProductIds] = useState([]);
    const [existingCategories, setExistingCategories] = useState([])
    const [errorMessage, setErrorMessage] = useState('')

  
    useEffect(() => {
        setIsMounted(true);  
    }, []);


    useEffect(() => {
        const timeout = setTimeout(() => {
        setLoading(false);
        }, 500); 

        return () => clearTimeout(timeout);
    }, []);


    useEffect(() => {
        setLoading(true);

        if (!user) {
            return;
        }

        if (user && productId) {
        fetchProductById(user.uid, productId, setProduct); 
        }
        setLoading(false);
    }, [user, productId]);


    useEffect(() => {
        if (!product) return;
        console.log(123, product)
        setLoading(true);
        setUserProductId(product.productId);
        setName(product.name);
        setCategory("");
        setCategories(product.categories);
        setAverageCost(product.averageCost);
        setDesc(product.description);
        setProductImages(product.productImages);
        setPatternImages(product.patternImages);
        setCurrency(product.currency);
        setPatternImageUrls([]);
        setProductImageUrls([]);
        setLoading(false);
    }, [product])


    useEffect(()=>{
        if (!user) {return};
        
        if (user) {
            fetchProductIds(user.uid, setProductIds); 
            fetchProductCategories(user.uid, setExistingCategories)
            setProductIds((productIds) => productIds.filter(id => id !== userProductId));
        }
    }, [user])


    const handleAddCategory = () => {
        if (category.trim() && !categories.includes(category)) {
            setCategories([...categories, category]);
            setCategory("")
        }
    };


    const handleRemoveCategory = (cat) => {
        setCategories(categories.filter((c) => c !== cat));
    };

 
    const removeProductImage = (index) => {
        const updatedImages = [...productImages];
        updatedImages.splice(index, 1);
        setProductImages(updatedImages);
    };

    const removePatternImage = (index) => {
        const updatedImages = [...patternImages];
        updatedImages.splice(index, 1);
        setPatternImages(updatedImages);
    };


    const handlePatternImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPatternImages((prev) => [...prev, file]);
        }
    };


    const handleProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImages((prev) => [...prev, file]);
        }
    };


    const handleUpload = async () => {
        if (!patternImages.length) return [];
        if (!productImages.length) return [];
        if (!patternImages.length && !productImages.length) return [];

        const uploadedProductImages = [];
        const uploadedPatternImages = [];

        const userId = user.uid;

        // Upload product images (HANDLE ARRAY OF FILES)
        for (const image of productImages) {
            console.log(image);

            if (image.url) {
                uploadedProductImages.push(image); // No need to upload again, just keep it
                continue;
            }

            const filePath = `images/${userId}/products/${image.name}`; 
            const fileRef = ref(storage, filePath);

            try {
                const snapshot = await uploadBytes(fileRef, image);
                const downloadUrl = await getDownloadURL(snapshot.ref);

                uploadedProductImages.push({ url: downloadUrl, path: filePath });
            } catch (error) {
                console.error("Upload failed:", error);
            }
            const snapshot = await uploadBytes(fileRef, image);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            uploadedProductImages.push({ url: downloadUrl, path: filePath });
            
        }

        // Upload pattern images (HANDLE ARRAY OF FILES AND UNIQUE NAMES)
        for (const image of patternImages) { 
            console.log(image);

            if (image.url) {
                uploadedPatternImages.push(image); 
                continue;
            }

            const filePath = `images/${userId}/patterns/${image.name}`;
            const fileRef = ref(storage, filePath);

            try {
                const snapshot = await uploadBytes(fileRef, image);
                const downloadUrl = await getDownloadURL(snapshot.ref);

                uploadedPatternImages.push({ url: downloadUrl, path: filePath });
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }

        console.log("Uploaded Images:", uploadedPatternImages, uploadedProductImages); 

        setProductImageUrls((prev) => {
            const updatedUrls = Array.isArray(prev) ? prev : [];
            return [...updatedUrls, ...uploadedProductImages.map(img => img.url)];
        });

        setPatternImageUrls((prev) => {
            const updatedUrls = Array.isArray(prev) ? prev : [];
            return [...updatedUrls, ...uploadedPatternImages.map(img => img.url)];
        });

        setPatternImages([]);
        setProductImages([]);

        return [uploadedProductImages, uploadedPatternImages];

    };


    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        setErrorMessage("");
            
        if (!userProductId || !name) {
            setErrorMessage("Id and Name are required.");
            setLoading(false);
            return;
        }

        if (userProductId.length>12) {
            setErrorMessage("Id should be less than 12 characters.");
            setLoading(false);
            return;
        }

        const filteredProductIds = productIds.filter(id => id !== product.productId);
        
        if (filteredProductIds.includes(userProductId)) {
            setErrorMessage(`Product with '${userProductId}' Id already exists.`);
            setLoading(false);
            return;
        }

        const uploadedImages = await handleUpload() || [];
        const uploadedProductImages = uploadedImages?.[0] || []; 
        const uploadedPatternImages = uploadedImages?.[1] || [];

        try {
            const updatedProductData = {
                productId: userProductId,
                name,
                averageCost: averageCost.trim() === "" ? "" : parseFloat(averageCost).toFixed(2),
                currency: averageCost.trim() === "" ? "" : currency,    
                categories,
                description: desc,
                productImages: uploadedProductImages,
                patternImages: uploadedPatternImages,
            };

            await updateProduct(user.uid, productId, updatedProductData)
            console.log("Product updated successfully!");
            setLoading(false);
            window.location.href = `/products/${productId}`;
        } catch (error){
            console.error("Error updating product:", error);
            setLoading(false);
        }
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
            <Header title="Edit the Product" />
            <form
            className="mx-4 flex flex-col gap-4"
            onSubmit={handleUpdateProduct}
            >

            {errorMessage.length===0?(null):(<p className="text-red">{errorMessage}</p>)}

            {/* Product ID */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <label>Id <span className="text-red">*</span></label>
                    <img  src={userProductId === "" ? "/cross.png" : "/check.png"}  className={userProductId === "" ? "h-4" : "h-6 text-green"} />                            
                </div>
                <input
                className={inputStyle}
                required
                value={userProductId}
                onChange={(e) => setUserProductId(e.target.value)}
                />
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                        <label>Name <span className="text-red">*</span></label>
                    <img  src={name === "" ? "/cross.png" : "/check.png"}  className={name === "" ? "h-4" : "h-6 text-green"} />                            
                </div>
                <input
                className={inputStyle}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Category*/}
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
                    data-id="product-category"
                />
                <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-green font-bold px-4 py-2 rounded-lg hover:bg-darkGreen transition-colors duration-300"
                    >
                    Add
                </button>
                </div>
                <datalist id="categories">
                    {existingCategories?.map((category, index)=>(
                        <option key={index} value={category} />
                    ))}
                </datalist>

                {/* Category List */}
                <ul className="flex flex-col gap-2 list-decimal pl-8">
                {categories.map((cat, index) => (
                    <li key={index}>
                    <div className="flex flex-row items-center justify-between gap-2">
                        <p>{cat}</p>
                        <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center"
                        >
                        <p className="text-xs">x</p>
                        </button>
                    </div>
                    </li>
                ))}
                </ul>
            </div>

            {/* Average Cost */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <label>Average Cost</label>
                    <img  src={averageCost === "" ? "/cross.png" : "/check.png"}  className={averageCost === "" ? "h-4" : "h-6 text-green"} />                            
                </div>
                <div className="flex flex-row gap-2">
                <input 
                    data-id="product-average-cost"
                    className={inputStyle}
                    type="number"
                    value={averageCost}
                    placeholder="0.00"
                    onChange={(e) => {
                        setAverageCost(e.target.value); // Allow empty value
                    }}
                    onBlur={() => {
                        if (averageCost === "") {
                            setAverageCost("");
                        }
                    }}
                    />
                    <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-lg border border-grey-200"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="RUB">RUB (₽)</option>
                    </select>
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <label>Description</label>
                    <img  src={desc === "" ? "/cross.png" : "/check.png"}  className={desc === "" ? "h-4" : "h-6 text-green"} />                            
                </div>
                
                <textarea
                className="rounded-lg border p-2"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                />
            </div>

            {/* Product Image Selection */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <label>Product Images</label>
                    <img  src={productImages.length===0 ? "/cross.png" : "/check.png"}  className={productImages.length===0 ? "h-4" : "h-6 text-green"} />                            
                </div>
                <div className="relative inline-block">
                <input
                    type="file"
                    className="absolute inset-0 w-40 opacity-0 cursor-pointer"
                    multiple
                    onChange={handleProductImageChange}
                />
                <p className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300">
                    select images
                </p>            
            </div>

                {/* Preview Product Images */}
                {productImages.length > 0 && (
                    <div className="flex flex-row gap-2 overflow-x-auto">
                    {productImages.map((image, index) => {
                        const imageUrl = typeof image.url === 'string' ? image.url : URL.createObjectURL(image);

                        return (
                            <div key={index}>
                                <SmallBlockHolder
                                    type="multiplePictureDelete"
                                    id={index + 1}
                                    imageSource={imageUrl}
                                    onButtonFunction={() => removeProductImage(index)}
                                />
                            </div>
                        );
                    })}   
                    </div>
                )}    
            </div>

            {/* Pattern Image Selection */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <label>Pattern Images</label>
                    <img  src={patternImages.length===0 ? "/cross.png" : "/check.png"}  className={patternImages.length===0 ? "h-4" : "h-6 text-green"} />
                </div>

                <div className="relative inline-block">
                    <input
                        type="file"
                        className="absolute inset-0 w-40 opacity-0 cursor-pointer"
                        onChange={handlePatternImageChange}
                    />
                <p className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300">
                    select images
                </p> 
            </div>

                {/* Preview Pattern Image */}
                {patternImages.length > 0 && (
                    <div className="flex flex-row gap-2 overflow-x-auto">
                        {patternImages.map((image, index) => {
                            const imageUrl = typeof image.url === 'string' ? image.url : URL.createObjectURL(image);

                            return (
                                <div key={index}>
                                    <SmallBlockHolder
                                        type="multiplePictureDelete"
                                        id={index + 1}
                                        imageSource={imageUrl}
                                        onButtonFunction={() => removePatternImage(index)}
                                    />
                                </div>
                            );
                        })}                        
                    </div>
                )}
            </div>
            
            {/* Submit */}
            <Menu
                type="CreateMenu"
                firstTitle="Cancel"
                secondTitle="Create"
                onFirstFunction={() => window.location.href = `/products/${productId}`}
                />
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
