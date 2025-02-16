"use client";

import { dbAddProduct } from "@/app/_services/product-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import { storage } from "@/app/_utils/firebase";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SmallBlockHolder from "@/app/components/small-block-holder";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; // Import the useRouter hook


export default function Page() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUserAuth();
  const inputStyle = "h-9 rounded-lg border p-2 w-full";
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [desc, setDesc] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [ProductImagePreview, setProductImagePreview] = useState("");
  const [patternImages, setPatternImages] = useState([]);
  const [images, setImageUrls] = useState([]);
  const [averageCost, setAverageCost] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  
  useEffect(() => {
    setIsMounted(true);  
  }, []);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleNavigateToListPage = () => {
    window.location.href = "/pages/products";
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImages((prev) => [...prev, file]);

    }
  };

  const handleAddCategory = () => {
    if (category.trim() && !categories.includes(category)) {
      setCategories([...categories, category]);
      setCategory("");
    }
  };

  const handleRemoveCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  

  const removeProductImage = (index, isPattern = false) => {  //***/
    if (isPattern) {
      const updatedPatternImages = [...patternImages];
      updatedPatternImages.splice(index, 1);
      setPatternImage(updatedPatternImages);
    } else {
      setMainImage(null);
    }
  };

  const handlePatternImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPatternImages((prev) => [...prev, file]);

    }
  };


  const handleUpload = async () => {
    const uploadedImages = [];
    const userId = user.uid;

     // Upload product images (HANDLE ARRAY OF FILES)
     for (const image of productImages) {  // Iterate over the array
      const filePath = `images/${userId}/products/${image.name}`; // Use image.name
      const fileRef = ref(storage, filePath);
      const snapshot = await uploadBytes(fileRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedImages.push({ url: downloadUrl, path: filePath });
    }

    // Upload pattern images (HANDLE ARRAY OF FILES AND UNIQUE NAMES)
    for (const image of patternImages) { // Iterate over the array
      const filePath = `images/${userId}/patterns/${image.name}`; // Use image.name
      const fileRef = ref(storage, filePath);
      const snapshot = await uploadBytes(fileRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedImages.push({ url: downloadUrl, path: filePath });
    }

    console.log("Uploaded Images:", uploadedImages); // Debugging log
    setImageUrls(uploadedImages.map((img) => img.url)); // <-- Store URLs in state
    return uploadedImages;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    

    const uploadedImages = await handleUpload();

    const productObj = {
      productId,
      name,
      averageCost,
      category,
      description: desc,
      images: uploadedImages.map(img => img.url),
    };

    try {
      await dbAddProduct(user.uid, productObj);
      console.log("Product added successfully");
      router.push("/pages/products");
      setLoading(false);
    } catch (error) {
      console.error("Error adding product:", error);
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
        <Header title="Create Product" showUserName={true} />
        <form
          className="mx-4 flex flex-col gap-4"
          onSubmit={handleCreateProduct}
        >
          <p className="font-bold italic text-lg">Create a Product</p>

          {/* Product ID */}
          <div className="flex flex-col gap-2">
            <label>Product Id <span className="text-red">*</span></label>
            <input
              className={inputStyle}
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <label>Name <span className="text-red">*</span></label>
            <input
              className={inputStyle}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Average Cost */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Average Cost</label>
            </div>
            <input
              data-id="product-average-cost"
              className={inputStyle}
              value={averageCost}
              onChange={(e) => setAverageCost(e.target.value)}
            />
          </div>

          {/* Category*/}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Category</label>
              <img
                src={categories.length === 0 ? "/cross.png" : "/check.png"}
                className={categories.length === 0 ? "h-4" : "h-6 text-green"}
              />
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
                className="bg-green px-4 py-1 rounded-lg"
              >
                Add
              </button>
            </div>
            <datalist id="categories">
              <option value="Sweater" />
              <option value="Upper Clothes" />
            </datalist>

            {/* Category List */}
            <ul className="flex flex-col gap-2 list-decimal pl-4">
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



          {/* Description */}
          <div className="flex flex-col gap-2">
            <label>Description</label>
            <textarea
              className="rounded-lg border p-2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {/* Product Image Selection */}
            <div className="flex flex-row justify-between">
              <label>Product Image</label>
              <img
                src={productImages.length === 0 ? "/cross.png" : "/c.png"}
                className={productImages.length === 0 ? "h-6 text-green" : "h-4"}
              />
            </div>
            <div className="relative inline-block">
              <input
                type="file"
                className="absolute inset-0 w-40 opacity-0 cursor-pointer"
                multiple
                onChange={handleProductImageChange}
              />
              <p className="text-center bg-green rounded-lg w-40 py-1">Select Image</p>
              </div>

            {/* Preview Product Images */}
            {productImages.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {productImages.map((patternImage, index) => (
                  <div key={index}>
                    <SmallBlockHolder
                      type="multiplePictureDelete"
                      id={index + 1}
                      imageSource={URL.createObjectURL(productImages[index])}  // Pass the individual image
                      onButtonFunction={() => removeProductImage(index)}
                    />

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Display Uploaded Images Below Product Form */}
          <div className="flex flex-col gap-2">
    <h3 className="font-bold">Uploaded Product Images:</h3>
    {uploadedImageUrls.length > 0 && ( // Use uploadedImageUrls here
      <div className="flex flex-row gap-4">
        {uploadedImageUrls.map((imgUrl, index) => (
          <img key={index} src={imgUrl} alt={`Product Image ${index + 1}`} className="h-40 w-40 object-cover" />
        ))}
      </div>
    )}
  </div>

            {/* Pattern Image Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>Pattern Image</label>
                <img
                  src={patternImages.length > 0 ? "/check.png" : "/cross.png"}
                  className={patternImages.length > 0 ? "h-6 text-green" : "h-4"}
/>

              </div>
              <div className="relative inline-block">
                <input
                  type="file"
                  className="absolute inset-0 w-40 opacity-0 cursor-pointer"
                  onChange={handlePatternImageChange}
                />
                <p className="text-center bg-green rounded-lg w-40 py-1">Select Image</p>
              </div>

              {/* Preview Pattern Image */}
              {patternImages.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {patternImages.map((patternImage, index) => (
                  <div key={index}>
                    <SmallBlockHolder
                      type="multiplePictureDelete"
                      id={index + 1}
                      imageSource={URL.createObjectURL(patternImage)}
                      onButtonFunction={() => removePatternImage(index)}
                    />
                  </div>
                   ))}
                </div>
              )}
            </div>
          

          {/* Submit */}
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
        <NotLoggedWindow />
      </div>
    );
  }
}

