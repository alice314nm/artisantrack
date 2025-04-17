"use client";

import { useTranslations } from "use-intl";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import SearchBar from "@/app/[locale]/components/search-bar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SelectHolder from "@/app/[locale]/components/select-holder";
import Menu from "@/app/[locale]/components/menu";
import SelectedHolder from "@/app/[locale]/components/selected-holder";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dbAddOrder } from "@/app/[locale]/_services/order-service";
import { fetchMaterialsForOrder } from "@/app/[locale]/_services/material-service";
import { fetchProductsForOrder } from "@/app/[locale]/_services/product-service";
import { doc } from "firebase/firestore";

export default function Page() {
  const t = useTranslations("createOrder");
  const router = useRouter();
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  const inputStyle =
    "w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green focus:bg-white";
  const [errorMessage, setErrorMessage] = useState("");

  const [state, setState] = useState("form");

  const [orderName, setOrderName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [daysCounter, setDaysCounter] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [materialQuantities, setMaterialQuantities] = useState({});

  const [productCost, setProductCost] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [workCost, setWorkCost] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.title = t("title");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const workCostValue = parseFloat(workCost) || 0;
    const productCostValue = parseFloat(productCost) || 0;
    const materialCostValue = parseFloat(materialCost) || 0;

    const totalValue = workCostValue + productCostValue + materialCostValue;

    // Format the total value to 2 decimal places
    setTotal(totalValue.toFixed(2));
  }, [workCost, productCost, materialCost]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user) {
      fetchProductsForOrder(user.uid, setProducts);
      fetchMaterialsForOrder(user.uid, setMaterials);
    }
  }, [user]);

  const handleSelectProductForm = () => {
    setState("products");
  };

  const handleSelectMaterialForm = () => {
    setState("materials");
  };

  const handleConfirm = () => {
    setState("form");
    calculateMaterialsCost();
  };

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
      if (new Date(deadline) < new Date(startDate)) {
        setErrorMessage(t("deadlineError"));
        setDaysCounter(0);
      } else {
        setErrorMessage("");
        const days = calculateDaysCounter(startDate, deadline);
        setDaysCounter(days);
      }
    } else {
      console.log("Invalid startDate or deadline:", startDate, deadline);
    }
  }, [startDate, deadline]);

  const handleGoBackFromProducts = () => {
    setState("form");
    setSelectedProduct("");
  };

  const handleGoBackFromMaterials = () => {
    setState("form");
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductCost(product.averageCost);
    setCurrency(product.currency);
  };

  const handleSelectMaterial = (material) => {
    if (!selectedMaterials.includes(material)) {
      setSelectedMaterials([...selectedMaterials, material]);
      setMaterialQuantities({
        ...materialQuantities,
        [material.materialId]: "",
      });
    }
    calculateMaterialsCost();
  };

  const handleMaterialQuantityChange = (materialId, value) => {
    setMaterialQuantities({
      ...materialQuantities,
      [materialId]: value,
    });
  };

  const handleRemoveMaterial = (material) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== material));

    const updatedQuantities = { ...materialQuantities };
    delete updatedQuantities[material.materialId];

    setMaterialQuantities(updatedQuantities);
    calculateMaterialsCost();
  };

  useEffect(() => {
    calculateMaterialsCost();
  }, [selectedMaterials, materialQuantities]);

  const calculateMaterialsCost = () => {
    if (!selectedMaterials || selectedMaterials.length === 0) {
      setMaterialCost(0);
      return;
    }

    let totalCost = 0;

    selectedMaterials.forEach((material) => {
      const selectedQuantity = parseFloat(
        materialQuantities[material.materialId] || 0
      );
      const costPerUnit = parseFloat(material.costPerUnit || 0);

      if (
        !isNaN(selectedQuantity) &&
        !isNaN(costPerUnit) &&
        selectedQuantity > 0
      ) {
        totalCost += selectedQuantity * costPerUnit;
      }
    });

    setMaterialCost(Number(totalCost.toFixed(2)));
  };

  const handleResetSelectedMaterial = () => {
    setSelectedMaterials([]);
  };

  const handleNavigateToListPage = () => {
    window.location.href = "/orders";
  };

  const handleCancelProductSelection = () => {
    setSelectedProduct("");
    setProductCost(0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!isValidDate(startDate) || !isValidDate(deadline)) {
      setErrorMessage(t("invalidDateError"));
      setLoading(false);
      return;
    }

    const daysUntilDeadline = calculateDaysCounter(startDate, deadline);
    const parsedWorkCost = parseFloat(workCost) || 0;
    console.log("Days Until Deadline:", daysUntilDeadline);

    const orderObj = {
      nameOrder: orderName?.trim() || "",
      customerName: customerName?.trim() || "",
      description: desc?.trim() || "",
      productId: selectedProduct?.id || null,
      materialIds: Array.isArray(selectedMaterials)
        ? selectedMaterials.map((mat) => mat.id)
        : [],
      quantities: selectedMaterials.map((material) => ({
        id: material.id,
        materialId: material.materialId,
        quantity: materialQuantities[material.materialId],
      })),
      materialsCost: isNaN(parseFloat(materialCost))
        ? "0.00"
        : parseFloat(materialCost).toFixed(2),
      productCost: isNaN(parseFloat(productCost))
        ? "0.00"
        : parseFloat(productCost).toFixed(2),
      workCost: isNaN(parsedWorkCost) ? "0.00" : parsedWorkCost.toFixed(2),
      totalCost:
        isNaN(total) || total === null || total === undefined ? 0.0 : total,
      startDate: startDate || null,
      deadline: deadline || null,
      daysUntilDeadline: daysUntilDeadline || 0,
      completed: false,
      paid: false,
      currency: selectedProduct?.currency || "",
      orderImages: [selectedProduct?.id || null],
    };

    try {
      await dbAddOrder(user.uid, orderObj);
      console.log(t("orderSuccess"));
      window.location.href = "/orders";
    } catch (error) {
      console.error(t("orderError"), error);
      setErrorMessage(`${t("orderError")}: ${error.message}`);
    } finally {
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
        <Header title={t("title")} />

        {state === "form" && (
          <form className="mx-4 flex flex-col gap-4" onSubmit={handleCreateOrder}>
            {errorMessage && errorMessage.length > 0 && (
              <p className="text-red">{errorMessage}</p>
            )}

            <p className="text-lg font-semibold underline">{t("general")}</p>

            {/* Name of the order */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>
                  {t("orderTitle")} <span className="text-red">{t("required")}</span>
                </label>
                <img
                  src={orderName === "" ? "/cross.png" : "/check.png"}
                  className={orderName === "" ? "h-4" : "h-6 text-green"}
                />
              </div>
              <input
                className={inputStyle}
                name="orderName"
                value={orderName}
                placeholder={t("orderTitle")}
                onChange={(e) => setOrderName(e.target.value)}
              />
            </div>

            {/* Deadline, Start Date, and Days Counter */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <label>
                  {t("deadline")} <span className="text-red">{t("required")}</span>
                </label>
                <img
                  src={daysCounter === 0 ? "/cross.png" : "/check.png"}
                  className={daysCounter === 0 ? "h-4" : "h-6 text-green"}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-3/4">
                  <label className="text-xs">{t("startDate")}</label>
                  <DatePicker
                    selected={startDate ? new Date(startDate) : null}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd-MM-yyyy"
                    className={`${inputStyle} w-full`}
                    placeholderText="dd-mm-yyyy"
                    popperPlacement="bottom-start"                  
                    />
                </div>

                <div className="flex flex-col gap-1 w-3/4">
                  <label className="text-xs">{t("deadline")}</label>
                  <DatePicker
                    selected={deadline ? new Date(deadline) : null}
                    onChange={(date) => setDeadline(date)}
                    dateFormat="dd-MM-yyyy"
                    className={`${inputStyle} w-full`}
                    placeholderText="dd-mm-yyyy"
                    popperPlacement="bottom-start"                  
                    />
                </div>

                <div className="flex flex-col gap-1 w-1/4">
                  <label className="text-xs">{t("days")}</label>
                  <input
                    className={`${inputStyle} w-full`}
                    type="text"
                    value={daysCounter}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Customer name */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>
                  {t("customerName")} <span className="text-red">{t("required")}</span>
                </label>
                <img
                  src={customerName === "" ? "/cross.png" : "/check.png"}
                  className={customerName === "" ? "h-4" : "h-6 text-green"}
                />
              </div>
              <input
                className={inputStyle}
                name="customerName"
                value={customerName}
                placeholder={t("customerName")}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("description")}</label>
                <img
                  src={desc === "" ? "/cross.png" : "/check.png"}
                  className={desc === "" ? "h-4" : "h-6 text-green"}
                />
              </div>
              <textarea
                className={inputStyle}
                name="description"
                placeholder={t("description")}
                value={desc}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setDesc(e.target.value);
                  }
                }}
              />
              <div className="text-sm text-gray-500 mt-1">
                {desc.length} / 1000 characters
              </div>
            </div>

            <p className="text-lg font-semibold underline">{t("productMaterials")}</p>

            {/* Product Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("product")}</label>
                <img
                  src={selectedProduct ? "/check.png" : "/cross.png"}
                  className={selectedProduct ? "h-6 text-green" : "h-4"}
                />
              </div>
              <div className="flex flex-row justify-between">
                <button
                  type="button"
                  onClick={handleSelectProductForm}
                  className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300"
                >
                  {selectedProduct ? (<p>{t("changeProduct")}</p>) : (<p>{t("selectProduct")}</p>)}
                                   
                </button>
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

            {/* Product cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("productCost")}</label>
              </div>
              <input
                className={inputStyle}
                type="text"
                value={
                  productCost === 0
                    ? ""
                    : `${productCost} ${selectedProduct.currency ? selectedProduct.currency : ""}`
                }
                name="productCost"
                placeholder="0.00"
                readOnly
              />
            </div>

            {/* Material Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("materials")}</label>
                <img
                  src={selectedMaterials && selectedMaterials.length > 0 ? "/check.png" : "/cross.png"}
                  className={selectedMaterials && selectedMaterials.length > 0 ? "h-6 text-green" : "h-4"}
                />
              </div>
              <div className="flex flex-row justify-between">
                <button
                  data-id="select-material-button"
                  type="button"
                  onClick={handleSelectMaterialForm}
                  className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300"
                >
                  {selectedMaterials && selectedMaterials.length > 0 ? (<p>{t("changeMaterial")}</p>) : (<p>{t("selectMaterial")}</p>)}
                
                </button>
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
                    index={index + 1}
                    quantity={`${materialQuantities[material.materialId] || 0}`}
                    onRemove={() => handleRemoveMaterial(material)}
                  />
                ))}
              </div>
            )}

            {/* Material cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("materialCost")}</label>
              </div>
              <input
                className={inputStyle}
                type="text"
                value={materialCost === 0 ? "" : materialCost}
                name="materialCost"
                placeholder="0.00"
                readOnly
              />
            </div>

            {/* Work Cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <p>{t("workCost")}</p>
                <img
                  src={workCost === 0 ? "/cross.png" : "/check.png"}
                  className={workCost === 0 ? "h-4" : "h-6 text-green"}
                />
              </div>
              <input
                data-id="work-cost"
                className={inputStyle}
                type="number"
                value={workCost === 0 ? "" : workCost}
                name="workCost"
                placeholder="0.00"
                onChange={(e) => setWorkCost(e.target.value)}
              />
            </div>

            {/* Total cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <p>
                  {t("totalCost")} <span className="text-red">*</span>
                </p>
                <img
                  src={
                    total === 0 || total === "" || total == "0.00"
                      ? "/cross.png"
                      : "/check.png"
                  }
                  className={
                    total === 0 || total === "" || total == "0.00"
                      ? "h-4"
                      : "h-6 text-green"
                  }
                />
              </div>
              <div className="flex flex-row gap-2">
                <input
                  className={inputStyle}
                  value={total === 0 || total == "0.00" ? "" : total}
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => {
                    setTotal(e.target.value);
                  }}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-15 md:w-auto p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  data-id="currency-select"
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
              firstTitle={t("cancel")}
              secondTitle={t("create")}
              onFirstFunction={handleNavigateToListPage}
            />
          </form>
        )}

        {/* Products Selection State */}
        {state === "products" && (
          <div className="flex flex-col gap-4">
            <SearchBar />

            {products.length === 0 ? (
              <p className="flex flex-col items-center w-full py-40">
                {t("createOrder.noProducts")}
              </p>
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
                    cost={product.averageCost || "—"}
                    currency={product.currency || ""}
                    selected={
                      selectedProduct &&
                        product.productId === selectedProduct.productId
                        ? 1
                        : 0
                    }
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
        {state === "materials" && (
          <div className="flex flex-col gap-4">
            <SearchBar />

            {materials.length === 0 ? (
              <p className="flex flex-col items-center w-full py-40">
                {t("createOrder.noMaterials")}
              </p>
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
                    cost={material.total || "—"}
                    currency={material.currency || ""}
                    onClick={
                      selectedMaterials.includes(material)
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
        <NotLoggedWindow />
      </div>
    );
  }
}
