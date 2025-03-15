"use client";

import {
  dbAddMaterial,
  fetchMaterialCategories,
  fetchMaterialsIds,
} from "@/app/_services/material-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import { storage } from "@/app/_utils/firebase";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SmallBlockHolder from "@/app/components/small-block-holder";
import { doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";

export default function Page() {
  const { user } = useUserAuth();
  const inputStyle =
    "w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green";
  const [loading, setLoading] = useState(true);

  const [materialId, setMaterialId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [color, setColor] = useState("");
  const [shop, setShop] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState(0);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [materialIds, setMaterialIds] = useState([]);
  const [existingMaterialCategories, setExistingMaterialCategories] = useState(
    []
  );

  useEffect(() => {
    document.title = "Create a material";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user) {
      fetchMaterialsIds(user.uid, setMaterialIds);
      fetchMaterialCategories(user.uid, setExistingMaterialCategories);
    }
  }, [user]);

  const handleNavigateToListPage = () => {
    window.location.href = "/materials";
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeSelectedImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  useEffect(() => {
    const calculateCostPerUnit = () => {
      const totalValue = parseFloat(total);
      const quantityValue = parseInt(quantity);

      if (isNaN(totalValue) || isNaN(quantityValue) || quantityValue <= 0) {
        setCost(0.0);
      } else {
        const costPerUnit = (totalValue / quantityValue).toFixed(2);
        setCost(costPerUnit);
      }
    };

    calculateCostPerUnit();
  }, [total, quantity]);

  const handleUpload = async () => {
    if (!images.length) return []; // Ensure it returns an empty array instead of undefined

    const userId = user.uid;
    const uploadedImages = [];

    for (const image of images) {
      const filePath = `images/${userId}/materials/${image.name}`;
      const fileRef = ref(storage, filePath);

      try {
        const snapshot = await uploadBytes(fileRef, image);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        uploadedImages.push({ url: downloadUrl, path: filePath });
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setImageUrls((prev) => [...prev, ...uploadedImages.map((img) => img.url)]);
    setImages([]);

    return uploadedImages;
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);

    setErrorMessage("");

    if (!materialId || !name) {
      setErrorMessage("Id and Name are required.");
      setLoading(false);
      return;
    }

    if (materialId.length > 16) {
      setErrorMessage("Id should be less than 12 characters.");
      setLoading(false);
      return;
    }

    if (materialIds.includes(materialId)) {
      setErrorMessage(`Product with '${materialId}' Id already exists.`);
      setLoading(false);
      return;
    }

    const uploadedImages = (await handleUpload()) || [];

    const materialObj = {
      materialId: materialId || "",
      name: name || "",
      description: desc || "",
      color: color || "",
      categories: categories || [],
      images: uploadedImages || [],
      shop: shop || "",
      quantity: quantity || 0.0,
      total: total || 0.0,
      currency:
        total === 0
          ? ""
          : (typeof total === "string" ? total.trim() : total) === ""
          ? ""
          : currency,
      costPerUnit: cost || 0.0,
    };

    try {
      await dbAddMaterial(user.uid, materialObj);
      console.log(materialObj);
      window.location.href = "/materials";
      setLoading(false);
    } catch (error) {
      console.error("Error adding material:", error);
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
        <Header title="Create a material" />
        <form
          className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-4"
          onSubmit={handleCreateMaterial}
        >
          {errorMessage.length === 0 ? null : (
            <p className="text-red">{errorMessage}</p>
          )}

          <p className="text-lg font-semibold underline">General</p>

          {/* Product Id */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label>
                Id <span className="text-red">*</span>
              </label>
              <img
                src={materialId === "" ? "/cross.png" : "/check.png"}
                className={materialId === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              data-id="material-id"
              className={inputStyle}
              value={materialId}
              placeholder="Enter id (2-16 characters)"
              onChange={(e) => setMaterialId(e.target.value)}
            />
          </div>

          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>
                Name <span className="text-red">*</span>
              </label>
              <img
                src={name === "" ? "/cross.png" : "/check.png"}
                className={name === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              data-id="material-name"
              className={inputStyle}
              value={name}
              placeholder="Enter name (2-64 characters)"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Product Description */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <p>Description</p>
              <img
                src={desc === "" ? "/cross.png" : "/check.png"}
                className={desc === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <textarea
              data-id="material-description"
              className="rounded-lg border p-2"
              value={desc}
              placeholder="Enter description"
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <p className="text-lg underline font-semibold">Details</p>

          {/* Product Color */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Color</label>
              <img
                src={color === "" ? "/cross.png" : "/check.png"}
                className={color === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              data-id="material-color"
              className={inputStyle}
              value={color}
              placeholder="Enter a color"
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Products Categories */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Categories</label>
              <img
                src={categories.length === 0 ? "/cross.png" : "/check.png"}
                className={categories.length === 0 ? "h-4" : "h-6 text-green"}
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                data-id="material-category"
                list="categories"
                className={inputStyle}
                value={category}
                placeholder="Add a category for a material "
                onChange={(e) => setCategory(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-green font-bold px-4 py-2 rounded-lg hover:bg-darkGreen transition-colors duration-300"
                data-id="material-add-category"
              >
                Add
              </button>
            </div>
            <datalist id="categories">
              {existingMaterialCategories?.map((category, index) => (
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

          {/* Image Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Select images</label>
              <img
                src={images.length === 0 ? "/cross.png" : "/check.png"}
                className={images.length === 0 ? "h-4" : "h-6 text-green"}
              />
            </div>
            <div className="relative inline-block">
              <input
                type="file"
                className="absolute inset-0 w-40 opacity-0 cursor-pointer"
                multiple
                onChange={handleFileChange}
              />
              <p className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300">
                select images
              </p>
            </div>

            {/* Preview Chosen Images */}
            {images.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <div key={index}>
                    <SmallBlockHolder
                      type="multiplePictureDelete"
                      id={index + 1}
                      imageSource={URL.createObjectURL(image)}
                      onButtonFunction={() => removeSelectedImage(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-lg underline font-semibold">Price</p>

          {/* Products Shops */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <p>Shop</p>
              <img
                src={shop === "" ? "/cross.png" : "/check.png"}
                className={shop === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              data-id="material-shop"
              className={`${inputStyle}`}
              value={shop}
              placeholder="Enter a shop"
              onChange={(e) => setShop(e.target.value)}
            />
          </div>

          {/* Product Quantity */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Quantity</label>
              <img
                src={
                  quantity === 0 || quantity === ""
                    ? "/cross.png"
                    : "/check.png"
                }
                className={
                  quantity === 0 || quantity === "" ? "h-4" : "h-6 text-green"
                }
              />
            </div>
            <input
              data-id="material-quantity"
              className={inputStyle}
              value={quantity === 0 ? "" : quantity}
              placeholder="0.00"
              type="numbers"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Product Total  */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Total</label>
              <img
                src={total === 0 || total === "" ? "/cross.png" : "/check.png"}
                className={
                  total === 0 || total === "" ? "h-4" : "h-6 text-green"
                }
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                data-id="material-total-price"
                className={inputStyle}
                value={total === 0 ? "" : total}
                type="number"
                placeholder="0.00"
                onChange={(e) => {
                  setTotal(e.target.value); // Allow empty value
                }}
              />
              <select
                data-id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-15 md:w-auto p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
          </div>

          {/* Product Cost per Unit */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <label>Cost per unit</label>
              <img
                src={cost === 0 ? "/cross.png" : "/check.png"}
                className={cost === 0 ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              readOnly
              disabled
              data-id="material-cost-per-unit"
              className={inputStyle}
              placeholder="0.00"
              value={cost === 0 ? "" : cost}
              onChange={(e) => setCost(e.target.value)}
            />
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
        <NotLoggedWindow />
      </div>
    );
  }
}
