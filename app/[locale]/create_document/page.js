"use client";

import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/[locale]/_utils/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("CreateDocument");
  const { user } = useUserAuth();
  const [orderFilterCategory, setOrderFilterCategory] = useState("cost");
  const [orderCostFilter, setOrderCostFilter] = useState("highest");
  const [orderDeadlineFilter, setOrderDeadlineFilter] = useState("past");
  const [orderStartMonth, setOrderStartMonth] = useState("January");
  const [orderEndMonth, setOrderEndMonth] = useState("January");
  const [orderTimeFilterYear, setOrderTimeFilterYear] = useState(
    new Date().getFullYear()
  );
  const [orderName, setOrderName] = useState("");
  const [documentType, setDocumentType] = useState("order");
  const [productFilterCategory, setProductFilterCategory] =
    useState("popularity");
  const [productCostFilter, setProductCostFilter] = useState("highest");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productStartMonth, setProductStartMonth] = useState("January");
  const [productEndMonth, setProductEndMonth] = useState("January");
  const [productTimeFilterYear, setProductTimeFilterYear] = useState(
    new Date().getFullYear()
  );
  const [productName, setProductName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [materialFilterCategory, setMaterialFilterCategory] =
    useState("popularity");
  const [materialCostFilter, setMaterialCostFilter] = useState("highest");
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialStartMonth, setMaterialStartMonth] = useState("January");
  const [materialEndMonth, setMaterialEndMonth] = useState("January");
  const [materialTimeFilterYear, setMaterialTimeFilterYear] = useState(
    new Date().getFullYear()
  );
  const [materialName, setMaterialName] = useState("");

  // Use English month names for storing in database to maintain compatibility
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Translated month options for display
  const translatedMonths = months.map((_, index) => t(`months.${index}`));

  const [loading, setLoading] = useState(true);
  const years = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  const router = useRouter();

  useEffect(() => {
    document.title = t("pageTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [t]);

  const isFirestoreDocumentNameUnique = async (userId, documentName) => {
    if (!userId || !documentName) {
      return true;
    }
    const documentsRef = collection(db, "users", userId, "documents");
    const q = query(documentsRef, where("name", "==", documentName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const createUserDocument = async (userId, documentData) => {
    try {
      const documentsCollectionRef = collection(
        db,
        "users",
        userId,
        "documents"
      );
      const docRef = await addDoc(documentsCollectionRef, documentData);
      console.log(t("console.documentCreated"), docRef.id);
    } catch (error) {
      console.error(t("console.documentError"), error);
    }
  };

  const handleCreateOrderReport = async () => {
    if (!orderName) {
      setErrorMessage(t("errors.emptyName"));
      return;
    }

    if (!user?.uid) {
      setErrorMessage(t("errors.notLoggedIn"));
      return;
    }

    if (orderStartMonth && orderEndMonth) {
      const startMonthIndex = months.indexOf(orderStartMonth);
      const endMonthIndex = months.indexOf(orderEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(t("errors.invalidDateRange"));
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(user.uid, orderName);
    if (!isUnique) {
      setErrorMessage(t("errors.duplicateName"));
      return;
    }

    let queryParams = { category: orderFilterCategory };

    if (orderFilterCategory === "cost") {
      queryParams.sortOrder = orderCostFilter === "highest" ? "desc" : "asc";
      if (orderStartMonth) {
        queryParams.startMonth = orderStartMonth;
      }
      if (orderEndMonth) {
        queryParams.endMonth = orderEndMonth;
      }
      if (orderTimeFilterYear) {
        queryParams.year = Number(orderTimeFilterYear);
      }
    } else if (orderFilterCategory === "deadline") {
      queryParams.deadlineFilter = orderDeadlineFilter;
      if (orderStartMonth) {
        queryParams.startMonth = orderStartMonth;
      }
      if (orderEndMonth) {
        queryParams.endMonth = orderEndMonth;
      }
      if (orderTimeFilterYear) {
        queryParams.year = Number(orderTimeFilterYear);
      }
    } else if (orderFilterCategory === "time") {
      if (orderStartMonth) {
        queryParams.startMonth = orderStartMonth;
      }
      if (orderEndMonth) {
        queryParams.endMonth = orderEndMonth;
      }
      queryParams.year = Number(orderTimeFilterYear);
    }

    const documentData = {
      name: orderName,
      createdAt: new Date().toISOString(),
      type: "order",
      docCategory: orderFilterCategory,
      queryParams,
      userId: user.uid,
    };

    console.log(t("console.orderDocBeforeSave"), documentData);

    try {
      console.log(t("console.beforeCreateOrder"));
      await createUserDocument(user.uid, documentData);
      console.log(t("console.afterCreateOrder"));
      router.push("/documents");
    } catch (error) {
      console.error(t("console.orderError"), error);
      setErrorMessage(t("errors.createOrderFailed"));
    }
  };

  const handleCreateProductReport = async () => {
    if (!productName) {
      setErrorMessage(t("errors.emptyName"));
      return;
    }

    if (productStartMonth && productEndMonth) {
      const startMonthIndex = months.indexOf(productStartMonth);
      const endMonthIndex = months.indexOf(productEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(t("errors.invalidDateRange"));
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(user.uid, productName);
    if (!isUnique) {
      setErrorMessage(t("errors.duplicateName"));
      return;
    }

    let queryParams = {
      category: productFilterCategory,
      name: productName,
    };

    if (productFilterCategory === "cost") {
      queryParams.sortOrder = productCostFilter === "highest" ? "desc" : "asc";
      if (productStartMonth) {
        queryParams.startMonth = productStartMonth;
      }
      if (productEndMonth) {
        queryParams.endMonth = productEndMonth;
      }
      if (productTimeFilterYear) {
        queryParams.year = Number(productTimeFilterYear);
      }
    } else if (productFilterCategory === "popularity") {
      if (productStartMonth) {
        queryParams.startMonth = productStartMonth;
      }
      if (productEndMonth) {
        queryParams.endMonth = productEndMonth;
      }
      if (productTimeFilterYear) {
        queryParams.year = Number(productTimeFilterYear);
      }
    } else if (["id", "category", "name"].includes(productFilterCategory)) {
      queryParams.searchTerm = productSearchTerm;
      if (productStartMonth) {
        queryParams.startMonth = productStartMonth;
      }
      if (productEndMonth) {
        queryParams.endMonth = productEndMonth;
      }
      if (productTimeFilterYear) {
        queryParams.year = Number(productTimeFilterYear);
      }
    }

    const documentData = {
      name: productName,
      createdAt: new Date().toISOString(),
      type: "product",
      queryParams,
      userId: user?.uid,
    };

    if (user?.uid) {
      console.log(t("console.beforeCreateProduct"));
      await createUserDocument(user.uid, documentData);
      console.log(t("console.afterCreateProduct"));
      router.push("/documents");
    } else {
      setErrorMessage(t("errors.notLoggedIn"));
    }
  };

  const handleCreateMaterialReport = async () => {
    if (!materialName) {
      setErrorMessage(t("errors.emptyName"));
      return;
    }

    if (materialStartMonth && materialEndMonth) {
      const startMonthIndex = months.indexOf(materialStartMonth);
      const endMonthIndex = months.indexOf(materialEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(t("errors.invalidDateRange"));
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(
      user.uid,
      materialName
    );
    if (!isUnique) {
      setErrorMessage(t("errors.duplicateName"));
      return;
    }

    let queryParams = {
      category: materialFilterCategory,
      name: materialName,
    };

    if (materialFilterCategory === "cost") {
      queryParams.sortOrder = materialCostFilter === "highest" ? "desc" : "asc";
      if (materialStartMonth) {
        queryParams.startMonth = materialStartMonth;
      }
      if (materialEndMonth) {
        queryParams.endMonth = materialEndMonth;
      }
      if (materialTimeFilterYear) {
        queryParams.year = Number(materialTimeFilterYear);
      }
    } else if (materialFilterCategory === "popularity") {
      if (materialStartMonth) {
        queryParams.startMonth = materialStartMonth;
      }
      if (materialEndMonth) {
        queryParams.endMonth = materialEndMonth;
      }
      if (materialTimeFilterYear) {
        queryParams.year = Number(materialTimeFilterYear);
      }
    } else if (
      ["id", "category", "name", "color", "quantity"].includes(
        materialFilterCategory
      )
    ) {
      queryParams.searchTerm = materialSearchTerm;
      if (materialStartMonth) {
        queryParams.startMonth = materialStartMonth;
      }
      if (materialEndMonth) {
        queryParams.endMonth = materialEndMonth;
      }
      if (materialTimeFilterYear) {
        queryParams.year = Number(materialTimeFilterYear);
      }
    }

    const documentData = {
      name: materialName,
      createdAt: new Date().toISOString(),
      type: "material",
      queryParams,
      userId: user?.uid,
    };

    if (user?.uid) {
      console.log(t("console.beforeCreateMaterial"));
      await createUserDocument(user.uid, documentData);
      console.log(t("console.afterCreateMaterial"));
      router.push("/documents");
    } else {
      setErrorMessage(t("errors.notLoggedIn"));
    }
  };

  const handleCreateDocument = () => {
    switch (documentType) {
      case "order":
        handleCreateOrderReport();
        break;
      case "product":
        handleCreateProductReport();
        break;
      case "material":
        handleCreateMaterialReport();
        break;
      default:
        setErrorMessage(t("errors.selectDocType"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10" alt={t("loading")} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("pageTitle")} />
        <form className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-4">
          {errorMessage.length === 0 ? null : (
            <p className="text-red">{errorMessage}</p>
          )}

          {/* Document Type Selection Buttons */}
          <div className="mb-4">
            <p className="font-bold text-lg mb-2">{t("selectType")}</p>
            <div className="flex justify-between gap-2 w-full">
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                  documentType === "order"
                    ? "bg-darkGreen text-white"
                    : "bg-darkBeige hover:bg-green"
                }`}
                onClick={() => setDocumentType("order")}
              >
                {t("docTypes.order")}
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                  documentType === "product"
                    ? "bg-darkGreen text-white"
                    : "bg-darkBeige hover:bg-green"
                }`}
                onClick={() => setDocumentType("product")}
              >
                {t("docTypes.product")}
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                  documentType === "material"
                    ? "bg-darkGreen text-white"
                    : "bg-darkBeige hover:bg-green"
                }`}
                onClick={() => setDocumentType("material")}
              >
                {t("docTypes.material")}
              </button>
            </div>
          </div>

          {/* Order Section */}
          {documentType === "order" && (
            <div>
              <p className="font-bold text-lg mb-2">{t("orders.title")}</p>
              <p>{t("documentName")}</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder={t("orders.namePlaceholder")}
              />
              <p>{t("selectCategory")}</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={orderFilterCategory}
                onChange={(e) => setOrderFilterCategory(e.target.value)}
              >
                <option value="cost">{t("orders.categories.byCost")}</option>
                <option value="deadline">
                  {t("orders.categories.byDeadline")}
                </option>
                <option value="time">{t("orders.categories.byPeriod")}</option>
              </select>

              {orderFilterCategory === "cost" && (
                <div className="mt-2">
                  <p>{t("orders.filterByCost")}</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={orderCostFilter}
                    onChange={(e) => setOrderCostFilter(e.target.value)}
                  >
                    <option value="highest">{t("highestToLowest")}</option>
                    <option value="lowest">{t("lowestToHighest")}</option>
                  </select>
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderStartMonth}
                          onChange={(e) => setOrderStartMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderEndMonth}
                          onChange={(e) => setOrderEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderTimeFilterYear}
                          onChange={(e) =>
                            setOrderTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {orderFilterCategory === "deadline" && (
                <div className="mt-2">
                  <p>{t("orders.filterByDeadline")}</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={orderDeadlineFilter}
                    onChange={(e) => setOrderDeadlineFilter(e.target.value)}
                  >
                    <option value="past">{t("pastDueDeadline")}</option>
                    <option value="upcoming">{t("upcomingDeadline")}</option>
                  </select>
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderStartMonth}
                          onChange={(e) => setOrderStartMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderEndMonth}
                          onChange={(e) => setOrderEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderTimeFilterYear}
                          onChange={(e) =>
                            setOrderTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {orderFilterCategory === "time" && (
                <div className="mt-2">
                  <p>{t("selectTimePeriod")}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>{t("fromMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={orderStartMonth}
                        onChange={(e) => setOrderStartMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("toMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={orderEndMonth}
                        onChange={(e) => setOrderEndMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("year")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={orderTimeFilterYear}
                        onChange={(e) =>
                          setOrderTimeFilterYear(Number(e.target.value))
                        }
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Section */}
          {documentType === "product" && (
            <div>
              <p className="font-bold text-lg mb-2">{t("products.title")}</p>
              <p>{t("documentName")}</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t("products.namePlaceholder")}
              />
              <p>{t("selectCategory")}</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={productFilterCategory}
                onChange={(e) => setProductFilterCategory(e.target.value)}
              >
                <option value="popularity">
                  {t("products.categories.byPopularity")}
                </option>
                <option value="cost">{t("products.categories.byCost")}</option>
                <option value="id">{t("products.categories.byId")}</option>
                <option value="category">
                  {t("products.categories.byCategory")}
                </option>
                <option value="name">{t("products.categories.byName")}</option>
              </select>

              {/* Product Time Filter */}
              {productFilterCategory === "popularity" && (
                <div className="mt-2">
                  <p>{t("selectTimePeriod")}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>{t("fromMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={productStartMonth}
                        onChange={(e) => setProductStartMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("toMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={productEndMonth}
                        onChange={(e) => setProductEndMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("year")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={productTimeFilterYear}
                        onChange={(e) =>
                          setProductTimeFilterYear(Number(e.target.value))
                        }
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {productFilterCategory === "cost" && (
                <div className="mt-2">
                  <p>{t("products.filterByCost")}</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={productCostFilter}
                    onChange={(e) => setProductCostFilter(e.target.value)}
                  >
                    <option value="highest">{t("highestToLowest")}</option>
                    <option value="lowest">{t("lowestToHighest")}</option>
                  </select>
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productStartMonth}
                          onChange={(e) => setProductStartMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productEndMonth}
                          onChange={(e) => setProductEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productTimeFilterYear}
                          onChange={(e) =>
                            setProductTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {["id", "category", "name"].includes(productFilterCategory) && (
                <div className="mt-2">
                  <p>
                    {t("products.enter")}{" "}
                    {t(`products.fields.${productFilterCategory}`)}
                  </p>
                  <input
                    type="text"
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    placeholder={t(
                      `products.placeholders.${productFilterCategory}`
                    )}
                  />
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productStartMonth}
                          onChange={(e) => setProductStartMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productEndMonth}
                          onChange={(e) => setProductEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productTimeFilterYear}
                          onChange={(e) =>
                            setProductTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Material Section */}
          {documentType === "material" && (
            <div>
              <p className="font-bold text-lg mb-2">{t("materials.title")}</p>
              <p>{t("documentName")}</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder={t("materials.namePlaceholder")}
              />
              <p>{t("selectCategory")}</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={materialFilterCategory}
                onChange={(e) => setMaterialFilterCategory(e.target.value)}
              >
                <option value="popularity">
                  {t("materials.categories.byPopularity")}
                </option>
                <option value="cost">{t("materials.categories.byCost")}</option>
                <option value="name">{t("materials.categories.byName")}</option>
                <option value="id">{t("materials.categories.byId")}</option>
                <option value="category">
                  {t("materials.categories.byCategory")}
                </option>
                <option value="color">
                  {t("materials.categories.byColor")}
                </option>
                <option value="quantity">
                  {t("materials.categories.byQuantity")}
                </option>
              </select>

              {/* Material Time Filter */}
              {materialFilterCategory === "popularity" && (
                <div className="mt-2">
                  <p>{t("selectTimePeriod")}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>{t("fromMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={materialStartMonth}
                        onChange={(e) => setMaterialStartMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("toMonth")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={materialEndMonth}
                        onChange={(e) => setMaterialEndMonth(e.target.value)}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={month}>
                            {t(`months.${index}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>{t("year")}</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={materialTimeFilterYear}
                        onChange={(e) =>
                          setMaterialTimeFilterYear(Number(e.target.value))
                        }
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {materialFilterCategory === "cost" && (
                <div className="mt-2">
                  <p>{t("materials.filterByCost")}</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={materialCostFilter}
                    onChange={(e) => setMaterialCostFilter(e.target.value)}
                  >
                    <option value="highest">{t("highestToLowest")}</option>
                    <option value="lowest">{t("lowestToHighest")}</option>
                  </select>
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialStartMonth}
                          onChange={(e) =>
                            setMaterialStartMonth(e.target.value)
                          }
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialEndMonth}
                          onChange={(e) => setMaterialEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialTimeFilterYear}
                          onChange={(e) =>
                            setMaterialTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {["id", "category", "name", "color", "quantity"].includes(
                materialFilterCategory
              ) && (
                <div className="mt-2">
                  <p>
                    {t("materials.enter")}{" "}
                    {t(`materials.fields.${materialFilterCategory}`)}
                  </p>
                  <input
                    type="text"
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                    placeholder={t(
                      `materials.placeholders.${materialFilterCategory}`
                    )}
                  />
                  <div className="mt-2">
                    <p>{t("selectTimePeriod")}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>{t("fromMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialStartMonth}
                          onChange={(e) =>
                            setMaterialStartMonth(e.target.value)
                          }
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("toMonth")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialEndMonth}
                          onChange={(e) => setMaterialEndMonth(e.target.value)}
                        >
                          {months.map((month, index) => (
                            <option key={month} value={month}>
                              {t(`months.${index}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>{t("year")}</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialTimeFilterYear}
                          onChange={(e) =>
                            setMaterialTimeFilterYear(Number(e.target.value))
                          }
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Document Button */}
          <button
            type="button"
            className="bg-green px-2 py-2 rounded-lg w-full text-center hover:bg-darkGreen mt-10 mx-auto"
            onClick={handleCreateDocument}
          >
            {t("create")} {t(`docTypes.${documentType}`)}
          </button>
          <button
            type="button"
            className="bg-red px-2 py-2 rounded-lg w-full text-center hover:bg-rose-700 mx-auto"
            onClick={() => router.push("/documents")}
          >
            {t("cancel")}
          </button>
        </form>
        <Menu type="OnlySlideMenu" />
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
