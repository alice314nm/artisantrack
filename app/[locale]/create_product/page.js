"use client";

import { useTranslations } from "use-intl";
import {
  dbAddProduct,
  fetchProductCategories,
  fetchProductIds,
} from "@/app/[locale]/_services/product-service";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { storage } from "@/app/[locale]/_utils/firebase";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import SmallBlockHolder from "@/app/[locale]/components/small-block-holder";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import { doc } from "firebase/firestore";

export default function Page() {
  const t = useTranslations("createProduct");
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUserAuth();
  const inputStyle = "h-9 rounded-lg border p-2 w-full";
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [desc, setDesc] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [patternImages, setPatternImages] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [patternImageUrls, setPatternImageUrls] = useState([]);
  const [productImageUrls, setProductImageUrls] = useState([]);
  const [averageCost, setAverageCost] = useState("");

  const [productIds, setProductIds] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.title = t("pageTitle");
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
      fetchProductIds(user.uid, setProductIds);
      fetchProductCategories(user.uid, setExistingCategories);
    }
  }, [user]);

  const handleNavigateToListPage = () => {
    window.location.href = "/products";
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
    try {
      if (!e?.target?.files) return;
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) =>
        ["image/png", "image/jpeg"].includes(file.type)
      );

      if (validFiles.length !== files.length) {
        setErrorMessage(t("invalidImageFormat"));
      }

      setPatternImages((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error("Failed to handle pattern image upload:", error);
    }
  };

  const handleProductImageChange = (e) => {
    try {
      if (!e?.target?.files) return;
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) =>
        ["image/png", "image/jpeg"].includes(file.type)
      );

      if (validFiles.length !== files.length) {
        setErrorMessage(t("invalidImageFormat"));
      }

      setProductImages((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error("Failed to handle product image upload:", error);
    }
  };

  useEffect(() => {
    console.log(patternImages);
    console.log(0, productImages);
  }, [patternImages, productImages]);

  const handleUpload = async () => {
    const uploadedProductImages = [];
    const uploadedPatternImages = [];

    const userId = user.uid;

    // Upload product images (HANDLE ARRAY OF FILES)
    for (const image of productImages) {
      const filePath = `images/${userId}/products/${image.name}`;
      const fileRef = ref(storage, filePath);
      const snapshot = await uploadBytes(fileRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedProductImages.push({ url: downloadUrl, path: filePath });
    }

    // Upload pattern images (HANDLE ARRAY OF FILES AND UNIQUE NAMES)
    for (const image of patternImages) {
      const filePath = `images/${userId}/patterns/${image.name}`;
      const fileRef = ref(storage, filePath);
      const snapshot = await uploadBytes(fileRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedPatternImages.push({ url: downloadUrl, path: filePath });
    }

    console.log(
      "Uploaded Images:",
      uploadedPatternImages,
      uploadedProductImages
    );

    setProductImageUrls((prev) => [
      ...prev,
      ...uploadedProductImages.map((img) => img.url),
    ]);
    setPatternImageUrls((prev) => [
      ...prev,
      ...uploadedPatternImages.map((img) => img.url),
    ]);

    setPatternImages([]);
    setProductImages([]);

    return [uploadedProductImages, uploadedPatternImages];
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!productId || !name) {
      setErrorMessage(t("requiredFields"));
      setLoading(false);
      return;
    }

    if (productId.length > 12) {
      setErrorMessage(t("idTooLong"));
      setLoading(false);
      return;
    }

    if (productIds.includes(productId)) {
      setErrorMessage(t("productExists", { id: productId }));
      setLoading(false);
      return;
    }

    const uploadedImages = (await handleUpload()) || [];
    const uploadedProductImages = uploadedImages?.[0] || [];
    const uploadedPatternImages = uploadedImages?.[1] || [];

    const productObj = {
      productId,
      name,
      averageCost:
        averageCost.trim() === "" ? "" : parseFloat(averageCost).toFixed(2),
      currency: averageCost.trim() === "" ? "" : currency,
      categories,
      description: desc,
      productImages: uploadedProductImages,
      patternImages: uploadedPatternImages,
    };

    try {
      await dbAddProduct(user.uid, productObj);
      console.log(t("productAdded"));
      window.location.href = "/products";
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
      <div className="flex flex-col min-h-screen gap-4 bg-lightBeige">
        <Header title={t("pageTitle")} />
        <form
          className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-4"
          onSubmit={handleCreateProduct}
        >
          {errorMessage && <p className="text-red">{errorMessage}</p>}
          <p className="text-lg font-semibold underline">{t("general")}</p>
          {/* Product ID */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">
                {t("id")} <span className="text-red">*</span>
              </label>
              <img
                src={productId === "" ? "/cross.png" : "/check.png"}
                className={productId === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              placeholder={t("idPlaceholder")}
              data-id="product-id"
              className="w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">
                {t("name")} <span className="text-red">*</span>
              </label>
              <img
                src={name === "" ? "/cross.png" : "/check.png"}
                className={name === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <input
              placeholder={t("namePlaceholder")}
              data-id="product-name"
              className="w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <p>{t("description")}</p>
              <img
                src={desc === "" ? "/cross.png" : "/check.png"}
                className={desc === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <textarea
              placeholder={t("descriptionPlaceholder")}
              data-id="product-description"
              className="w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
              value={desc}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setDesc(e.target.value);
                }
              }}
            />
            <div className="text-sm text-gray-500 mt-1">
              {desc.length} / 1000 {t("characters")}
            </div>
          </div>
          <p className="text-lg font-semibold underline">{t("details")}</p>
          {/* Category */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">{t("category")}</label>
              <img
                src={categories.length === 0 ? "/cross.png" : "/check.png"}
                className={categories.length === 0 ? "h-4" : "h-6 text-green"}
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                placeholder={t("categoryPlaceholder")}
                list="categories"
                className="w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-id="product-category"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-green font-bold px-4 py-2 rounded-lg hover:bg-darkGreen transition-colors duration-300"
                data-id="add-category-button"
              >
                {t("add")}
              </button>
            </div>
            <datalist id="categories">
              {existingCategories?.map((category, index) => (
                <option key={index} value={category} />
              ))}
            </datalist>

            {/* Category List */}
            <ul className="flex flex-col gap-2 list-decimal pl-8">
              {categories.map((cat, index) => (
                <li key={index}>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-blackBeige">{cat}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="font-bold bg-lightBeige border-2 border-blackBeige rounded-xl w-6 h-6 flex justify-center items-center hover:bg-darkBeige transition-colors duration-300"
                      data-id={`remove-category-button-${index}`}
                    >
                      <p className="text-xs">x</p>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Product Image Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">{t("productImages")}</label>
              <img
                src={productImages.length === 0 ? "/cross.png" : "/check.png"}
                className={
                  productImages.length === 0 ? "h-4" : "h-6 text-green"
                }
              />
            </div>
            <div className="relative inline-block">
              <label
                htmlFor="fileInputProduct"
                className="text-center bg-green block font-bold rounded-lg w-40 py-1 transition-colors duration-300 cursor-pointer hover:bg-darkGreen"
              >
                {t("selectImages")}
              </label>
              <input
                id="fileInputProduct"
                type="file"
                className="hidden"
                multiple
                accept="image/png, image/jpeg"
                onChange={handleProductImageChange}
              />
            </div>

            {/* Preview Product Images */}
            {productImages.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <div key={index}>
                    <SmallBlockHolder
                      type="multiplePictureDelete"
                      id={index + 1}
                      imageSource={URL.createObjectURL(image)}
                      onButtonFunction={() => removeProductImage(index)}
                      data-id={`product-image-preview-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Pattern Image Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">{t("patternImages")}</label>
              <img
                src={patternImages.length === 0 ? "/cross.png" : "/check.png"}
                className={
                  patternImages.length === 0 ? "h-4" : "h-6 text-green"
                }
              />
            </div>

            <div className="relative inline-block">
              <label
                htmlFor="fileInputPattern"
                className="text-center bg-green block font-bold rounded-lg w-40 py-1 transition-colors duration-300 cursor-pointer hover:bg-darkGreen"
              >
                {t("selectImages")}
              </label>
              <input
                id="fileInputPattern"
                type="file"
                className="hidden"
                multiple
                accept="image/png, image/jpeg"
                onChange={handlePatternImageChange}
              />
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
                      data-id={`pattern-image-preview-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-lg font-semibold underline">{t("price")}</p>

          {/* Average Cost */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label className="text-blackBeige">{t("cost")}</label>
              <img
                src={averageCost === "" ? "/cross.png" : "/check.png"}
                className={averageCost === "" ? "h-4" : "h-6 text-green"}
              />
            </div>
            <div className="flex flex-row gap-2">
              <input
                data-id="product-average-cost"
                className="w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                type="number"
                value={averageCost}
                placeholder="0.00"
                onChange={(e) => setAverageCost(e.target.value)}
                onBlur={() => {
                  if (averageCost === "") {
                    setAverageCost("");
                  }
                }}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-15 md:w-auto p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                data-id="currency-select"
              >
                <option value="USD">{t("currency.usd")}</option>
                <option value="EUR">{t("currency.eur")}</option>
                <option value="CAD">{t("currency.cad")}</option>
                <option value="RUB">{t("currency.rub")}</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <Menu
            type="CreateMenu"
            firstTitle={t("cancel")}
            secondTitle={t("create")}
            onFirstFunction={handleNavigateToListPage}
            data-id="create-menu"
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
