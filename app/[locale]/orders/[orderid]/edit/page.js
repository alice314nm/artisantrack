"use client";

import { useTranslations } from "next-intl";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "next/navigation";
import Header from "@/app/[locale]/components/header";
import SelectedHolder from "@/app/[locale]/components/selected-holder";
import Menu from "@/app/[locale]/components/menu";
import SearchBar from "@/app/[locale]/components/search-bar";
import SelectHolder from "@/app/[locale]/components/select-holder";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import {
  dbAddOrder,
  dbGetOrderById,
  dbUpdateOrder,
} from "@/app/[locale]/_services/order-service";
import { fetchMaterialsForOrder } from "@/app/[locale]/_services/material-service";
import { fetchProductsForOrder } from "@/app/[locale]/_services/product-service";

export default function Page() {
  const t = useTranslations("EditOrder");
  const router = useRouter();
  const { user } = useUserAuth();
  const params = useParams();
  const id = params.orderid;

  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState({});
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  const inputStyle =
    "w-full p-2 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green";
  const [errorMessage, setErrorMessage] = useState("");

  const [state, setState] = useState("form");

  const [orderName, setOrderName] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [daysCounter, setDaysCounter] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    document.title = t("createTitle");
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

    if (user && id) {
      fetchProductsForOrder(user.uid, setProducts);
      fetchMaterialsForOrder(user.uid, setMaterials);
      dbGetOrderById(user.uid, id, setSelectedOrder);
    }
  }, [user, id]);

  useEffect(() => {
    if (!selectedOrder || Object.keys(selectedOrder).length === 0) return;

    setLoading(true);
    setOrderName(selectedOrder.nameOrder || "");

    const parseDate = (date) => {
      if (!date) return null;
      if (date.seconds) return new Date(date.seconds * 1000); // Firestore Timestamp
      return isNaN(new Date(date).getTime()) ? null : new Date(date);
    };

    setDeadline(parseDate(selectedOrder.deadline));
    setStartDate(parseDate(selectedOrder.startDate));
    setDaysCounter(selectedOrder.daysUntilDeadline || 0);
    setCustomerName(selectedOrder.customerName || "");
    setDesc(selectedOrder.description || "");
    setSelectedProduct(selectedOrder.productForOrderData || null);
    setSelectedMaterials(selectedOrder.materialsForOrderData || []);

    if (selectedOrder.quantities && Array.isArray(selectedOrder.quantities)) {
      const quantitiesObj = {};
      selectedOrder.quantities.forEach((item) => {
        if (item && item.id) {
          quantitiesObj[item.id] = item.quantity;
        }
      });
      setMaterialQuantities(quantitiesObj);
    }

    setProductCost(selectedOrder.productCost || 0);
    setMaterialCost(selectedOrder.materialsCost || 0);
    setWorkCost(selectedOrder.workCost || 0);
    setCurrency(selectedOrder.currency || "USD");
    setTotal(selectedOrder.totalCost || 0);
    setLoading(false);
  }, [selectedOrder]);

  const calculateMaterialsCost = () => {
    if (!selectedMaterials || selectedMaterials.length === 0) {
      setMaterialCost(0);
      return;
    }

    let totalCost = 0;

    selectedMaterials.forEach((material) => {
      const materialId = material.materialId || material.id;
      const quantity = parseFloat(materialQuantities[materialId] || 0);
      // Get cost per unit - find it in material data
      const materialData = materials.find(m => m.id === materialId || m.materialId === materialId);
      const cost = parseFloat(materialData?.costPerUnit || 0);

      if (!isNaN(quantity) && !isNaN(cost) && quantity > 0) {
        totalCost += quantity * cost;
      }
    });

    setMaterialCost(Number(totalCost.toFixed(2)));
  };

  useEffect(() => {
    calculateMaterialsCost();
  }, [selectedMaterials, materialQuantities, materials]);

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
  };

  const handleGoBackFromMaterials = () => {
    setState("form");
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product || null);
    setProductCost(product?.averageCost || 0);
    setCurrency(product?.currency || "USD");
  };

  const handleSelectMaterial = (material) => {
    const materialId = material.materialId || material.id;
    const existingMaterial = selectedMaterials.find(m => 
      (m.materialId === materialId) || (m.id === materialId)
    );

    if (!existingMaterial) {
      setSelectedMaterials([...selectedMaterials, material]);
      setMaterialQuantities(prev => ({
        ...prev,
        [materialId]: "",
      }));
    }
  };

  const handleMaterialQuantityChange = (materialId, value) => {
    console.log(`Changing quantity for ${materialId} to ${value}`);
    
    // Allow empty inputs during typing
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    
    setMaterialQuantities(prev => {
      const updated = {
        ...prev,
        [materialId]: numValue
      };
      console.log('Updated quantities:', updated);
      return updated;
    });
  };

  const handleRemoveMaterial = (material) => {
    const materialId = material.materialId || material.id;
    
    // Store the quantity being removed before updating the state
    const quantityToReturn = parseFloat(materialQuantities[materialId] || 0);
    
    // Remove the material from selectedMaterials
    setSelectedMaterials(selectedMaterials.filter(m => 
      (m.materialId !== materialId) && (m.id !== materialId)
    ));
  
    // Remove the quantity from materialQuantities
    const updatedQuantities = { ...materialQuantities };
    delete updatedQuantities[materialId];
    setMaterialQuantities(updatedQuantities);
    
    // Recalculate the material cost
    calculateMaterialsCost();
  };

  const handleResetSelectedMaterial = () => {
    setSelectedMaterials([]);
    setMaterialQuantities({});
  };

  const handleNavigateToListPage = () => {
    window.location.href = `/orders/${id}`;
  };

  const handleCancelProductSelection = () => {
    setSelectedProduct(null);
    setProductCost(0);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!isValidDate(startDate) || !isValidDate(deadline)) {
      setErrorMessage(t("invalidDate"));
      setLoading(false);
      return;
    }

    const daysUntilDeadline = calculateDaysCounter(startDate, deadline);
    const parsedWorkCost = parseFloat(workCost) || 0;

    const orderObj = {
      nameOrder: orderName?.trim() || "",
      customerName: customerName?.trim() || "",
      description: desc?.trim() || "",
      productId: selectedProduct?.id || selectedProduct?.productId || null,
      materialIds: Array.isArray(selectedMaterials)
        ? selectedMaterials.map((mat) => mat.id || mat.materialId)
        : [],
      quantities: selectedMaterials.map((material) => {
        const materialId = material.materialId || material.id;
        return {
          id: materialId,
          quantity: parseFloat(materialQuantities[materialId] || 0)
        };
      }),
      materialsCost: isNaN(parseFloat(materialCost))
        ? "0.00"
        : parseFloat(materialCost).toFixed(2),
      productCost: isNaN(parseFloat(productCost))
        ? "0.00"
        : parseFloat(productCost).toFixed(2),
      workCost: isNaN(parsedWorkCost) ? "0.00" : parsedWorkCost.toFixed(2),
      totalCost:
        isNaN(parseFloat(total)) || total === null || total === undefined ? "0.00" : parseFloat(total).toFixed(2),
      startDate: startDate || null,
      deadline: deadline || null,
      daysUntilDeadline: daysUntilDeadline || 0,
      completed: selectedOrder.completed || false,
      paid: selectedOrder.paid || false,
      currency: currency || selectedProduct?.currency || "USD",
      orderImages: selectedProduct ? [selectedProduct.id || selectedProduct.productId || null] : [],
    };

    try {
      await dbUpdateOrder(user.uid, id, orderObj);
      console.log("Order updated successfully");
      window.location.href = `/orders/${id}`;
    } catch (error) {
      console.error("Error updating order:", error);
      setErrorMessage(`${t("errorUpdating") || "Error updating order:"} ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10" alt="Loading" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("EditOrderTitle")} />

        {state === "form" && (
          <form
            className="mx-4 flex flex-col gap-4"
            onSubmit={handleUpdateOrder}
          >
            {errorMessage && errorMessage.length > 0 && (
              <p className="text-red">{errorMessage}</p>
            )}

            <p className="text-lg font-semibold underline">{t("general")}</p>

            {/* Name of the order */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>
                  {t("titleOfOrder")} <span className="text-red">*</span>
                </label>
                <img
                  src={orderName === "" ? "/cross.png" : "/check.png"}
                  className={orderName === "" ? "h-4" : "h-6 text-green"}
                  alt={orderName === "" ? "Missing" : "Complete"}
                />
              </div>
              <input
                data-id="order-name"
                className={inputStyle}
                name="orderName"
                value={orderName}
                placeholder={t("enterTitle")}
                onChange={(e) => setOrderName(e.target.value)}
              />
            </div>

            {/* Deadline, Start Date, and Days Counter */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <label>
                  {t("deadline")} <span className="text-red">*</span>
                </label>
                <img
                  src={daysCounter === 0 ? "/cross.png" : "/check.png"}
                  className={daysCounter === 0 ? "h-4" : "h-6 text-green"}
                  alt={daysCounter === 0 ? "Missing" : "Complete"}
                />
              </div>

              <div className="flex gap-4">
                {/* Start Date */}
                <div data-id="start-date" className="flex flex-col gap-1 w-1/3">
                  <div className="flex flex-row justify-between">
                    <label className="text-xs">{t("startDate")}</label>
                  </div>
                  <DatePicker
                    selected={startDate ? new Date(startDate) : null}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd-MM-yyyy"
                    className={`${inputStyle} w-full`}
                    placeholderText="dd-mm-yyyy"
                  />
                </div>

                {/* Deadline */}
                <div data-id="deadline" className="flex flex-col gap-1 w-1/3">
                  <div className="flex flex-row justify-between">
                    <label className="text-xs">{t("deadline")}</label>
                  </div>
                  <DatePicker
                    selected={deadline ? new Date(deadline) : null}
                    onChange={(date) => setDeadline(date)}
                    dateFormat="dd-MM-yyyy"
                    className={`${inputStyle} w-full`}
                    placeholderText="dd-mm-yyyy"
                  />
                </div>

                {/* Days Counter */}
                <div className="flex flex-col gap-1 w-1/3">
                  <div className="flex flex-row justify-between">
                    <label className="text-xs">{t("days")}</label>
                  </div>
                  <input
                    data-id="days-counter"
                    className={`${inputStyle} w-full`}
                    type="text"
                    value={daysCounter}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>
                  {t("customerName")} <span className="text-red">*</span>
                </label>
                <img
                  src={customerName === "" ? "/cross.png" : "/check.png"}
                  className={customerName === "" ? "h-4" : "h-6 text-green"}
                  alt={customerName === "" ? "Missing" : "Complete"}
                />
              </div>
              <input
                data-id="order-customer"
                className={inputStyle}
                name="customerName"
                value={customerName}
                placeholder={t("enterCustomerName")}
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
                  alt={desc === "" ? "Missing" : "Complete"}
                />
              </div>
              <textarea
                data-id="order-description"
                className={inputStyle}
                name="description"
                placeholder={t("enterDetails")}
                value={desc}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setDesc(e.target.value);
                  }
                }}
              />
              {/* Display character count */}
              <div className="text-sm text-gray-500 mt-1">
                {desc?.length} / 1000 {t("characters")}
              </div>
            </div>

            <p className="text-lg font-semibold underline">
              {t("productMaterials")}
            </p>

            {/* Product Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("product")}</label>
                <img
                  src={selectedProduct ? "/check.png" : "/cross.png"}
                  className={selectedProduct ? "h-6 text-green" : "h-4"}
                  alt={selectedProduct ? "Selected" : "Not Selected"}
                />
              </div>
              <div className="flex flex-row justify-between">
                <button
                  data-id="select-product-button"
                  type="button"
                  onClick={handleSelectProductForm}
                  className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300"
                >
                  {t("selectProduct")}
                </button>
              </div>
            </div>

            {/* Selected Product Display */}
            {selectedProduct && (
              <div className="flex flex-col gap-2">
                <SelectedHolder
                  type="product"
                  imageSrc={
                    selectedProduct.productImages && 
                    selectedProduct.productImages.length > 0
                      ? selectedProduct.productImages[0].url
                      : "/noImage.png"
                  }
                  name={selectedProduct.name || selectedProduct.productName}
                  id={selectedProduct.productId || selectedProduct.id}
                  onRemove={handleCancelProductSelection}
                />
              </div>
            )}

            {/* Product Cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("costForSelectedProduct")}</label>
              </div>
              <input
                className={inputStyle}
                type="text"
                value={
                  productCost === 0
                    ? ""
                    : `${productCost} ${currency || (selectedProduct?.currency || "")}`
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
                  src={
                    selectedMaterials && selectedMaterials.length > 0
                      ? "/check.png"
                      : "/cross.png"
                  }
                  className={
                    selectedMaterials && selectedMaterials.length > 0
                      ? "h-6 text-green"
                      : "h-4"
                  }
                  alt={selectedMaterials && selectedMaterials.length > 0 ? "Selected" : "Not Selected"}
                />
              </div>
              <div className="flex flex-row justify-between">
                <button
                  data-id="select-material-button"
                  type="button"
                  onClick={handleSelectMaterialForm}
                  className="text-center bg-green font-bold rounded-lg w-40 py-1 hover:bg-darkGreen transition-colors duration-300"
                >
                  {t("selectMaterial")}
                </button>
              </div>
            </div>

            {/* Selected Materials Display */}
            {selectedMaterials && selectedMaterials.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedMaterials.map((material, index) => {
                  const materialId = material.materialId || material.id;
                  return (
                    <SelectedHolder
                      key={materialId || index}
                      type="material"
                      imageSrc={
                        material.materialImage?.url || 
                        (material.images && material.images.length > 0 
                          ? material.images[0].url 
                          : "/noImage.png")
                      }
                      name={material.name || material.materialName}
                      id={materialId}
                      index={index + 1}
                      quantity={materialQuantities[materialId] || "0"}
                      onRemove={() => handleRemoveMaterial(material)}
                      onQuantityChange={(value) => handleMaterialQuantityChange(materialId, value)}
                    />
                  );
                })}
              </div>
            )}

            {/* Material Cost */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <label>{t("materialsCost")}</label>
              </div>
              <input
                className={inputStyle}
                value={materialCost === 0 ? "" : materialCost}
                type="number"
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
                  alt={workCost === 0 ? "Missing" : "Complete"}
                />
              </div>
              <input
                data-id="work-cost"
                className={inputStyle}
                type="number"
                value={workCost}
                name="workCost"
                placeholder="0.00"
                onChange={(e) =>
                  setWorkCost(
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  )
                }
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
                  alt={total === 0 || total === "" || total == "0.00" ? "Missing" : "Complete"}
                />
              </div>
              <div className="flex flex-row gap-2">
                <input
                  className={inputStyle}
                  value={total}
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => {
                    setTotal(
                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                    );
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
              secondTitle={t("edit")}
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
                {t("noProducts")}
              </p>
            ) : (
              <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
                {products.map((product, index) => (
                  <SelectHolder
                    key={product.id || index}
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
                      ((product.productId === selectedProduct.productId) || 
                       (product.id === selectedProduct.id))
                        ? 1
                        : 0
                    }
                    onClick={() => handleSelectProduct(product)}
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
                {t("noMaterials")}
              </p>
            ) : (
              <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
                {materials.map((material, index) => {
                  const materialId = material.materialId || material.id;
                  const isSelected = selectedMaterials.some(m => 
                    (m.materialId === materialId) || (m.id === materialId)
                  );
                  
                  return (
                    <SelectHolder
                      key={materialId || index}
                      type="material"
                      imageSource={
                        material.images && material.images.length > 0
                          ? material.images[0].url
                          : "/noImage.png"
                      }
                      name={material.name}
                      id={materialId}
                      quantity={material.quantity || "—"}
                      selected={isSelected}
                      selectedQuantity={materialQuantities[materialId]}
                      cost={material.total || "—"}
                      currency={material.currency || ""}
                      onClick={
                        isSelected
                          ? () => handleRemoveMaterial(material)
                          : () => handleSelectMaterial(material)
                      }
                      onQuantityChange={(value) => handleMaterialQuantityChange(materialId, value)}
                    />
                  );
                })}
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