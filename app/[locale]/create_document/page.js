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

export default function Page() {
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
  const [loading, setLoading] = useState(true);
  const years = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  const router = useRouter();

  useEffect(() => {
    document.title = "Create Document";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

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
      console.log(
        "Document written to documents subcollection with ID: ",
        docRef.id
      );
    } catch (error) {
      console.error(
        "Error adding document to documents subcollection: ",
        error
      );
    }
  };

  const handleCreateOrderReport = async () => {
    if (!orderName) {
      setErrorMessage("Document name cannot be empty.");
      return;
    }

    if (!user?.uid) {
      setErrorMessage("User not logged in.");
      return;
    }

    if (orderStartMonth && orderEndMonth) {
      const startMonthIndex = months.indexOf(orderStartMonth);
      const endMonthIndex = months.indexOf(orderEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(
          "Invalid month range: 'From Month' cannot be after 'To Month'"
        );
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(user.uid, orderName);
    if (!isUnique) {
      setErrorMessage("A document with this name already exists.");
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

    console.log("Order documentData before save:", documentData);

    try {
      console.log("Before calling createUserDocument for order");
      await createUserDocument(user.uid, documentData);
      console.log("After calling createUserDocument for order");
      router.push("/documents");
    } catch (error) {
      console.error("Error adding order document: ", error);
      setErrorMessage("Failed to create order document.");
    }
  };

  const handleCreateProductReport = async () => {
    if (!productName) {
      setErrorMessage("Document name cannot be empty.");
      return;
    }

    if (productStartMonth && productEndMonth) {
      const startMonthIndex = months.indexOf(productStartMonth);
      const endMonthIndex = months.indexOf(productEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(
          "Invalid month range: 'From Month' cannot be after 'To Month'"
        );
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(user.uid, productName);
    if (!isUnique) {
      setErrorMessage("A document with this name already exists.");
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
      console.log("Before calling createUserDocument for product");
      await createUserDocument(user.uid, documentData);
      console.log("After calling createUserDocument for product");
      router.push("/documents");
    } else {
      setErrorMessage("User not logged in.");
    }
  };

  const handleCreateMaterialReport = async () => {
    if (!materialName) {
      setErrorMessage("Document name cannot be empty.");
      return;
    }

    if (materialStartMonth && materialEndMonth) {
      const startMonthIndex = months.indexOf(materialStartMonth);
      const endMonthIndex = months.indexOf(materialEndMonth);
      if (startMonthIndex > endMonthIndex) {
        setErrorMessage(
          "Invalid month range: 'From Month' cannot be after 'To Month'"
        );
        return;
      }
    }

    const isUnique = await isFirestoreDocumentNameUnique(
      user.uid,
      materialName
    );
    if (!isUnique) {
      setErrorMessage("A document with this name already exists.");
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
      console.log("Before calling createUserDocument for material");
      await createUserDocument(user.uid, documentData);
      console.log("After calling createUserDocument for material");
      router.push("/documents");
    } else {
      setErrorMessage("User not logged in.");
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
        setErrorMessage("Please select a document type");
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
        <Header title="Create a Document" />
        <form className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-4">
          {errorMessage.length === 0 ? null : (
            <p className="text-red">{errorMessage}</p>
          )}

          {/* Document Type Selection Buttons */}
          <div className="mb-4">
            <p className="font-bold text-lg mb-2">Select Document Type</p>
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
                Orders
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
                Products
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
                Materials
              </button>
            </div>
          </div>

          {/* Order Section */}
          {documentType === "order" && (
            <div>
              <p className="font-bold text-lg mb-2">Orders</p>
              <p>Document Name</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
              />
              <p>Select Category</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={orderFilterCategory}
                onChange={(e) => setOrderFilterCategory(e.target.value)}
              >
                <option value="cost">By Cost</option>
                <option value="deadline">By Deadline</option>
                <option value="time">By Period of Time</option>
              </select>

              {orderFilterCategory === "cost" && (
                <div className="mt-2">
                  <p>Filter by Cost</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={orderCostFilter}
                    onChange={(e) => setOrderCostFilter(e.target.value)}
                  >
                    <option value="highest">Highest to Lowest Price</option>
                    <option value="lowest">Lowest to Highest Price</option>
                  </select>
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderStartMonth}
                          onChange={(e) => setOrderStartMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderEndMonth}
                          onChange={(e) => setOrderEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
                  <p>Filter by Deadline</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={orderDeadlineFilter}
                    onChange={(e) => setOrderDeadlineFilter(e.target.value)}
                  >
                    <option value="past">Past Due Deadline</option>
                    <option value="upcoming">Upcoming Deadline</option>
                  </select>
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderStartMonth}
                          onChange={(e) => setOrderStartMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={orderEndMonth}
                          onChange={(e) => setOrderEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
                  <p>Select Time Period</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>From Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={orderStartMonth}
                        onChange={(e) => setOrderStartMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>To Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={orderEndMonth}
                        onChange={(e) => setOrderEndMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>Year</p>
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
              <p className="font-bold text-lg mb-2">Products</p>
              <p>Document Name</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <p>Select Category</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={productFilterCategory}
                onChange={(e) => setProductFilterCategory(e.target.value)}
              >
                <option value="popularity">By Popularity in Orders</option>
                <option value="cost">By Cost</option>
                <option value="id">By ID</option>
                <option value="category">By Category</option>
                <option value="name">By Name</option>
              </select>

              {/* Product Time Filter */}
              {productFilterCategory === "popularity" && (
                <div className="mt-2">
                  <p>Select Time Period</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>From Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={productStartMonth}
                        onChange={(e) => setProductStartMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>To Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={productEndMonth}
                        onChange={(e) => setProductEndMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>Year</p>
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
                  <p>Filter by Cost</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={productCostFilter}
                    onChange={(e) => setProductCostFilter(e.target.value)}
                  >
                    <option value="highest">Highest to Lowest Price</option>
                    <option value="lowest">Lowest to Highest Price</option>
                  </select>
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productStartMonth}
                          onChange={(e) => setProductStartMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productEndMonth}
                          onChange={(e) => setProductEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
                  <p>{`Enter Product ${
                    productFilterCategory.charAt(0).toUpperCase() +
                    productFilterCategory.slice(1)
                  }`}</p>
                  <input
                    type="text"
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productStartMonth}
                          onChange={(e) => setProductStartMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={productEndMonth}
                          onChange={(e) => setProductEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
              <p className="font-bold text-lg mb-2">Materials</p>
              <p>Document Name</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2 w-full"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
              <p>Select Category</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                value={materialFilterCategory}
                onChange={(e) => setMaterialFilterCategory(e.target.value)}
              >
                <option value="popularity">By Popularity in Orders</option>
                <option value="cost">By Cost</option>
                <option value="name">By Name</option>
                <option value="id">By ID</option>
                <option value="category">By Category</option>
                <option value="color">By Color</option>
                <option value="quantity">By Quantity</option>
              </select>

              {/* Material Time Filter */}
              {materialFilterCategory === "popularity" && (
                <div className="mt-2">
                  <p>Select Time Period</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p>From Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={materialStartMonth}
                        onChange={(e) => setMaterialStartMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>To Month</p>
                      <select
                        className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                        value={materialEndMonth}
                        onChange={(e) => setMaterialEndMonth(e.target.value)}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p>Year</p>
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
                  <p>Filter by Cost</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={materialCostFilter}
                    onChange={(e) => setMaterialCostFilter(e.target.value)}
                  >
                    <option value="highest">Highest to Lowest Price</option>
                    <option value="lowest">Lowest to Highest Price</option>
                  </select>
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialStartMonth}
                          onChange={(e) =>
                            setMaterialStartMonth(e.target.value)
                          }
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialEndMonth}
                          onChange={(e) => setMaterialEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
                  <p>{`Enter Material ${
                    materialFilterCategory.charAt(0).toUpperCase() +
                    materialFilterCategory.slice(1)
                  }`}</p>
                  <input
                    type="text"
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  />
                  <div className="mt-2">
                    <p>Select Time Period</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p>From Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialStartMonth}
                          onChange={(e) =>
                            setMaterialStartMonth(e.target.value)
                          }
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>To Month</p>
                        <select
                          className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green w-full"
                          value={materialEndMonth}
                          onChange={(e) => setMaterialEndMonth(e.target.value)}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <p>Year</p>
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
            Create{" "}
            {documentType.charAt(0).toUpperCase() + documentType.slice(1)}{" "}
            Document
          </button>
          <button
            type="button"
            className="bg-red px-2 py-2 rounded-lg w-full text-center hover:bg-rose-700 mx-auto"
            onClick={() => router.push("/documents")}
          >
            Cancel
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
