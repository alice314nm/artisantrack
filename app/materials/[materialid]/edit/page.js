'use client'

import { dbAddMaterial, fetchMaterialCategories, fetchMaterials, fetchMaterialsIds, updateMaterial } from "@/app/_services/material-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import { storage } from "@/app/_utils/firebase";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SmallBlockHolder from "@/app/components/small-block-holder";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { app } from "@/app/_utils/firebase";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
} from "firebase/firestore";


export default function Page() {
    const { user } = useUserAuth();
    const params = useParams();
    const id = params.materialid;

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMaterials = async () => {
            if (!user) return;
            setLoading(true);
            const materialsData = await fetchMaterials(user.uid);
            setMaterials(materialsData);
            setLoading(false);

            console.log(materialsData);
        };

        loadMaterials();
    }, [user]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, []);

    const filteredMaterials = [...materials];
    const materialId = filteredMaterials.filter((material) => material.id == id);
    const selectedMaterial = materialId[0];

    const inputStyle = 'h-9 rounded-lg border p-2 w-full';

    const [userMaterialId, setUserMaterialId] = useState('')
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [color, setColor] = useState('');
    const [shop, setShop] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [quantity, setQuantity] = useState('');
    const [total, setTotal] = useState('');
    const [desc, setDesc] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    const [costItems, setCostItems] = useState([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [materialIds, setMaterialIds] = useState([]);
    const [existingMaterialCategories, setExistingMaterialCategories] = useState([]);



    useEffect(() => {
        setLoading(true);

        if (!selectedMaterial) return;

        setUserMaterialId(selectedMaterial.materialId);
        setName(selectedMaterial.name);
        setCategory('');
        setCategories(selectedMaterial.categories);
        setColor(Array.isArray(selectedMaterial.colors)
            ? selectedMaterial.colors[0]
            : selectedMaterial.colors
        );
        setShop('');
        setPrice('');
        setCurrency(selectedMaterial.currency);
        setQuantity(selectedMaterial.quantity);
        setTotal(selectedMaterial.total);
        setDesc(selectedMaterial.description);
        setImages(selectedMaterial.images);
        setImageUrls(selectedMaterial.images.url);
        setCostItems(selectedMaterial.pricing);
        setLoading(false);

    }, [selectedMaterial]);

    useEffect(()=>{
        if (!user) {return;}
        
        if (user) {
            fetchMaterialsIds(user.uid, setMaterialIds); 
            fetchMaterialCategories(user.uid, setExistingMaterialCategories)
        }

    }, [user])

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
        setCostItems(updatedCostItems);
    };

    const handleUpdateMaterial = async (e) => {
        e.preventDefault();
        setLoading(true);
        const allImages = await handleUpload() || [];
        const db = getFirestore(app);

        setErrorMessage("");
            
        if (!userMaterialId || !name) {
            setErrorMessage("Id and Name are required.");
            setLoading(false);
            return;
        }

        if (userMaterialId.length>12) {
            setErrorMessage("Id should be less than 12 characters.");
            setLoading(false);
            return;
        }

        const filteredMaterialIds = materialIds.filter(id => id !== selectedMaterial.materialId);
        
        if (filteredMaterialIds.includes(userMaterialId)) {
            setErrorMessage(`Product with '${userMaterialId}' Id already exists.`);
            setLoading(false);
            return;
        }

        try {
            const updatedMaterialData = {
                materialId: userMaterialId,
                name,
                categories,
                color,
                costItems: costItems || [],
                total: total.trim() === "" ? "" : parseFloat(total).toFixed(2),
                currency: total.trim() === "" ? "" : currency,
                quantity,
                description: desc,
                images: allImages
            };

            // handle color
            const colorCollectionRef = collection(db, `users/${user.uid}/colors`);
            const colorSnap = await getDocs(colorCollectionRef);

            let existingColorDoc = colorSnap.docs.find(doc => doc.data().name === color);

            if (!existingColorDoc) {
                const newColorRef = await addDoc(colorCollectionRef, { name: color });
                console.log("New color added to Firestore:", color);
                updatedMaterialData.color = newColorRef.id;
            } else {
                updatedMaterialData.color = existingColorDoc.id;
                console.log("Color already exists:", color);
            }
            await updateMaterial(user.uid, id, updatedMaterialData);

            console.log("Material updated successfully!");
            setLoading(false);
            window.location.href = `/materials/${id}`;
        } catch (error) {
            console.error("Error updating material:", error);
            setLoading(false);
        }
    };


    const handleUpload = async () => {
        if (!images.length) return [];
        const userId = user.uid;
        const uploadedImages = [];

        for (const image of images) {
            console.log(image);

            if (image.url) {
                uploadedImages.push(image); // No need to upload again, just keep it
                continue;
            }

            const filePath = `images/${userId}/materials/${image.path}`;
            const fileRef = ref(storage, filePath);

            try {
                const snapshot = await uploadBytes(fileRef, image);
                const downloadUrl = await getDownloadURL(snapshot.ref);

                uploadedImages.push({ url: downloadUrl, path: filePath });
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }

        setImageUrls((prev) => {
            const updatedUrls = Array.isArray(prev) ? prev : [];
            return [...updatedUrls, ...uploadedImages.map(img => img.url)];
        });

        setImages([]);

        return uploadedImages;
    };

    const handleAddCostItem = () => {
        if (shop && price && quantity && currency) {
            const newItem = {
                shop,
                price,
            };

            const updatedCostItems = [...costItems, newItem];
            setCostItems(updatedCostItems);

            setShop('');
            setPrice('');
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
                <Header title="Materials" showUserName={true} />
                <form className="mx-4 flex flex-col gap-4" onSubmit={handleUpdateMaterial}>
                    <p className="font-bold italic text-lg">Edit the material</p>
                    
                    {errorMessage.length===0?(null):(<p className="text-red">{errorMessage}</p>)}

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Id <span className="text-red">*</span></label>
                            <img src={userMaterialId === "" ? "/cross.png" : "/check.png"} className={userMaterialId === "" ? "h-4" : "h-6 text-green"} />
                        </div>
                        <input required className={inputStyle} value={userMaterialId} onChange={(e) => setUserMaterialId(e.target.value)} />
                    </div>


                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Name <span className="text-red">*</span></label>
                            <img src={name === "" ? "/cross.png" : "/check.png"} className={name === "" ? "h-4" : "h-6 text-green"} />
                        </div>
                        <input required className={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />

                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Color</label>
                            <img src={color === "" ? "/cross.png" : "/check.png"} className={color === "" ? "h-4" : "h-6 text-green"} />
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
                            {existingMaterialCategories?.map((category, index)=>(
                                <option key={index} value={category} />
                            ))}
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

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <p>Cost</p>
                            <img src={costItems.length === 0 ? "/cross.png" : "/check.png"} className={costItems.length === 0 ? "h-4" : "h-6 text-green"} />
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
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={handleAddCostItem} className="bg-green py-1 w-24 rounded-lg">Add</button>
                        </div>
                    
                        {/* Display added items in the list */}
                        <ul className="flex flex-col gap-2 mt-2 list-decimal pl-4">
                            {costItems.map((item, index) => (
                                <li key={index}>
                                    <div className="flex flex-row items-center justify-between gap-2">
                                        <p>{item.shopName}, {item.price}</p>
                                        <button type="button" onClick={() => handleRemoveCost(item)} className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                                            <p className="text-xs">x</p>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div> 

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Quantity</label>
                            <img src={quantity === "" ? "/cross.png" : "/check.png"} className={quantity === "" ? "h-4" : "h-6 text-green"} />
                        </div>
                        <input 
                        className={inputStyle} 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <label>Total</label>
                            <img  src={total === "" ? "/cross.png" : "/check.png"}  className={total === "" ? "h-4" : "h-6 text-green"} />                            
                        </div>
                        <div className="flex flex-row gap-2">
                            <input 
                            className={inputStyle} 
                            value={total}
                            type="number" 
                            placeholder="0"
                            onChange={(e) => {
                                setTotal(e.target.value); // Allow empty value
                            }}
                            onBlur={() => {
                                if (total === "") {
                                    setTotal("");
                                }
                            }}                                />
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

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-between">
                            <p>Description</p>
                            <img src={desc === "" ? "/cross.png" : "/check.png"} className={desc === "" ? "h-4" : "h-6 text-green"} />
                        </div>
                        <textarea className="rounded-lg border p-2" value={desc} onChange={(e) => setDesc(e.target.value)} />

                    </div>



                    <div className="flex flex-col gap-2">
                        {/* Image Selection */}
                        <div className="flex flex-row justify-between">
                            <label>Select images</label>
                            <img src={images.length === 0 ? "/cross.png" : "/check.png"} className={images.length === 0 ? "h-4" : "h-6 text-green"} />
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
                                {images.map((image, index) => {
                                    const imageUrl = typeof image.url === 'string' ? image.url : URL.createObjectURL(image);

                                    return (
                                        <div key={index}>
                                            <SmallBlockHolder
                                                type="multiplePictureDelete"
                                                id={index + 1}
                                                imageSource={imageUrl}
                                                onButtonFunction={() => removeSelectedImage(index)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Menu
                        type="CreateMenu"
                        firstTitle="Cancel"
                        secondTitle="Save"
                        onFirstFunction={() => window.location.href = `/materials/${id}`}
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