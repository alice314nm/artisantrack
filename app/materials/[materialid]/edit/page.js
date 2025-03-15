"use client";

import {
  dbAddMaterial,
  fetchMaterialById,
  fetchMaterialCategories,
  fetchMaterials,
  fetchMaterialsIds,
  updateMaterial,
} from "@/app/_services/material-service";
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

  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState({});
  const inputStyle =
    "w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green";

  const [userMaterialId, setUserMaterialId] = useState("");
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
    document.title = "Edit the Material";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    if (user && id) {
      fetchMaterialById(user.uid, id, setSelectedMaterial);
    }
    setLoading(false);
  }, [user, id]);

  useEffect(() => {
    if (!selectedMaterial) return;

    console.log(selectedMaterial);

    setUserMaterialId(selectedMaterial.materialId || "");
    setName(selectedMaterial.name || "");
    setCategory("");
    setCategories(selectedMaterial.categories || []);
    setColor(selectedMaterial.color || "");
    setShop(selectedMaterial.shop || "");
    setCurrency(selectedMaterial.currency || "USD");
    setQuantity(selectedMaterial.quantity || 0);
    setTotal(selectedMaterial.total || 0);
    setDesc(selectedMaterial.description || "");
    setImages(selectedMaterial.images || []);
    setImageUrls([]);
    setCost(selectedMaterial.costPerUnit || 0.0);
    setLoading(false);
  }, [selectedMaterial]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user) {
      fetchMaterialsIds(user.uid, setMaterialIds);
      fetchMaterialCategories(user.uid, setExistingMaterialCategories);
    }
  }, [user]);

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
      return [...updatedUrls, ...uploadedImages.map((img) => img.url)];
    });

    setImages([]);

    return uploadedImages;
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);
    const allImages = (await handleUpload()) || [];
    const db = getFirestore(app);

    setErrorMessage("");

    if (!userMaterialId || !name) {
      setErrorMessage("Id and Name are required.");
      setLoading(false);
      return;
    }

    if (userMaterialId.length > 12) {
      setErrorMessage("Id should be less than 12 characters.");
      setLoading(false);
      return;
    }

    const filteredMaterialIds = materialIds.filter(
      (id) => id !== selectedMaterial.materialId
    );

    if (filteredMaterialIds.includes(userMaterialId)) {
      setErrorMessage(`Product with '${userMaterialId}' Id already exists.`);
      setLoading(false);
      return;
    }

    try {
      const updatedMaterialData = {
        materialId: userMaterialId || "",
        name: name || "",
        description: desc || "",
        color: color || "",
        categories: categories || [],
        images: allImages || [],
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

      await updateMaterial(user.uid, id, updatedMaterialData);

      console.log("Material updated successfully!");
      setLoading(false);
      window.location.href = `/materials/${id}`;
    } catch (error) {
      console.error("Error updating material:", error);
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
        <Header title="Edit the Material" />

        <form
          className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-4"
          onSubmit={handleUpdateMaterial}
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
                src={userMaterialId === "" ? "/cross.png" : "/check.png"}
                className={userMaterialId === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              data-id="material-id"
              className={inputStyle}
              value={userMaterialId}
              placeholder="Enter id (2-64 characters)"
              onChange={(e) => setUserMaterialId(e.target.value)}
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
            <div className="relative inline-block text-center">
              <label
                htmlFor="fileInput"
                className="bg-green block font-bold rounded-lg w-40 py-1 transition-colors duration-300 cursor-pointer hover:bg-darkGreen"
              >
                Select images
              </label>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {/* Preview Chosen Images */}
            {images.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {images.map((image, index) => {
                  const imageUrl =
                    typeof image.url === "string"
                      ? image.url
                      : URL.createObjectURL(image);

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
                className={inputStyle}
                value={total === 0 ? "" : total}
                type="number"
                placeholder="0.00"
                onChange={(e) => {
                  setTotal(e.target.value);
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
              data-id="material-quantity"
              className={inputStyle}
              placeholder="0.00"
              value={cost === 0 ? "" : cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          <Menu
            type="CreateMenu"
            firstTitle="Cancel"
            secondTitle="Save"
            onFirstFunction={() => (window.location.href = `/materials/${id}`)}
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
