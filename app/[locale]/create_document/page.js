"use client";

import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/[locale]/_utils/firebase"; 
import { collection, addDoc, doc, setDoc, getDoc, where, query, getDocs} from "firebase/firestore";

export default function Page() {
  const { user } = useUserAuth();
  const [orderFilterCategory, setOrderFilterCategory] = useState("cost");
  const [orderCostFilter, setOrderCostFilter] = useState("highest");
  const [orderDeadlineFilter, setOrderDeadlineFilter] = useState("past");
  const [orderTimeFilterMonth, setOrderTimeFilterMonth] = useState("");
  const [orderTimeFilterYear, setOrderTimeFilterYear] = useState(new Date().getFullYear());
  const [orderName, setOrderName] = useState("");

  const [productFilterCategory, setProductFilterCategory] = useState("popularity");
  const [productCostFilter, setProductCostFilter] = useState("highest");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productTimeFilterMonth, setProductTimeFilterMonth] = useState("");
  const [productTimeFilterYear, setProductTimeFilterYear] = useState(new Date().getFullYear());
  const [productName, setProductName] = useState("");

  const [materialFilterCategory, setMaterialFilterCategory] = useState("popularity");
  const [materialCostFilter, setMaterialCostFilter] = useState("highest");
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialTimeFilterMonth, setMaterialTimeFilterMonth] = useState("");
  const [materialTimeFilterYear, setMaterialTimeFilterYear] = useState(new Date().getFullYear());
  const [materialName, setMaterialName] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  const router = useRouter();

  const isFirestoreDocumentNameUnique = async (userId, documentName) => {
    if (!userId || !documentName) {
      return true; 
    }
    const documentsRef = collection(db, "users", userId, "documents");
    const q = query(documentsRef, where("name", "==", documentName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; 
  };

  const generateDocumentID = () => {
    return Date.now(); 
  };

  const createUserDocument = async (userId, documentData) => {
    try {
      const documentsCollectionRef = collection(db, "users", userId, "documents");
      const docRef = await addDoc(documentsCollectionRef, documentData);
      console.log("Document written to documents subcollection with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document to documents subcollection: ", error);
    }
  };

  const handleCreateOrderReport = async () => {
    if (!orderName) {
      alert("Document name cannot be empty.");
      return;
    }
  
    if (!user?.uid) {
      alert("User not logged in.");
      return;
    }
  
    const isUnique = await isFirestoreDocumentNameUnique(user.uid, orderName);
    if (!isUnique) {
      alert("A document with this name already exists."); 
      return; 
    }
  
    let queryParams = { category: orderFilterCategory };
  
    if (orderFilterCategory === "cost") {
      queryParams.sortOrder = orderCostFilter === "highest" ? "desc" : "asc";
      if (orderTimeFilterMonth) {
        queryParams.month = orderTimeFilterMonth;
      }
      if (orderTimeFilterYear) {
        queryParams.year = Number(orderTimeFilterYear);
      }
    } else if (orderFilterCategory === "deadline") {
      queryParams.deadlineFilter = orderDeadlineFilter;
      if (orderTimeFilterMonth) {
        queryParams.month = orderTimeFilterMonth;
      }
      if (orderTimeFilterYear) {
        queryParams.year = Number(orderTimeFilterYear); 
      }
    } else if (orderFilterCategory === "time") {
      queryParams.month = orderTimeFilterMonth;
      queryParams.year = Number(orderTimeFilterYear); 
    } else if (["customerName", "description"].includes(orderFilterCategory)) {
      queryParams.searchTerm = orderSearchTerm;
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
      alert("Failed to create order document.");
    }
  };
  
  const handleCreateProductReport = async () => {
    if (!productName) {
      alert("Document name cannot be empty.");
      return;
    }
  
    const isUnique = await isFirestoreDocumentNameUnique(user.uid, productName);
    if (!isUnique) {
      alert("A document with this name already exists."); 
      return; 
    }
  
    let queryParams = {
      category: productFilterCategory,
      name: productName,
    };
  
    if (productFilterCategory === "cost") {
      queryParams.sortOrder = productCostFilter === "highest" ? "desc" : "asc";
      if (productTimeFilterMonth) {
        queryParams.month = productTimeFilterMonth;
      }
      if (productTimeFilterYear) {
        queryParams.year = Number(productTimeFilterYear);
      }
    } else if (productFilterCategory === "popularity") {
      if (productTimeFilterMonth) {
        queryParams.month = productTimeFilterMonth;
      }
      if (productTimeFilterYear) {
        queryParams.year = Number(productTimeFilterYear);
      }
    } else if (["id", "category", "name"].includes(productFilterCategory)) {
      queryParams.searchTerm = productSearchTerm;
      if (productTimeFilterMonth) {
        queryParams.month = productTimeFilterMonth;
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
      alert("User not logged in.");
    }
  };
  
  const handleCreateMaterialReport = async () => {
    if (!materialName) {
      alert("Document name cannot be empty.");
      return;
    }
  
    const isUnique = await isFirestoreDocumentNameUnique(user.uid, materialName);
    if (!isUnique) {
      alert("A document with this name already exists."); 
      return; 
    }
  
    let queryParams = {
      category: materialFilterCategory,
      name: materialName,
    };
  
    if (materialFilterCategory === "cost") {
      queryParams.sortOrder = materialCostFilter === "highest" ? "desc" : "asc";
      if (materialTimeFilterMonth) {
        queryParams.month = materialTimeFilterMonth;
      }
      if (materialTimeFilterYear) {
        queryParams.year = Number(materialTimeFilterYear);
      }
    } else if (materialFilterCategory === "popularity") {
      if (materialTimeFilterMonth) {
        queryParams.month = materialTimeFilterMonth;
      }
      if (materialTimeFilterYear) {
        queryParams.year = Number(materialTimeFilterYear);
      }
    } else if (["id", "category", "name", "color", "quantity"].includes(materialFilterCategory)) {
      queryParams.searchTerm = materialSearchTerm;
      if (materialTimeFilterMonth) {
        queryParams.month = materialTimeFilterMonth;
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
      alert("User not logged in.");
    }
  };
  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4 p-4 relative pb-20">
        <Header title="Create a Document" showUserName={true} />

        {/* Order Section */}
        <div className="mb-4">
          <p className="font-bold text-lg mb-2">Orders</p>
          <p>Document Name</p>
          <input
            type="text"
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
          />
          <p>Select Category</p>
          <select
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
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
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={orderCostFilter}
                onChange={(e) => setOrderCostFilter(e.target.value)}
              >
                <option value="highest">Highest to Lowest Price</option>
                <option value="lowest">Lowest to Highest Price</option>
              </select>
              <div className="mt-2 flex gap-2">
                <div>
                  <p>Select Month</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={orderTimeFilterMonth}
                    onChange={(e) => setOrderTimeFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p>Select Year</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={orderTimeFilterYear}
                    onChange={(e) => setOrderTimeFilterYear(Number(e.target.value))}
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

          {orderFilterCategory === "deadline" && (
            <div className="mt-2">
              <p>Filter by Deadline</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={orderDeadlineFilter}
                onChange={(e) => setOrderDeadlineFilter(e.target.value)}
              >
                <option value="past">Past Due Deadline</option>
                <option value="upcoming">Upcoming Deadline</option>
              </select>
            </div>
          )}
          

          {orderFilterCategory === "time" && (
            <div className="mt-2 flex gap-2">
              <div>
                <p>Select Month</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={orderTimeFilterMonth}
                  onChange={(e) => setOrderTimeFilterMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p>Select Year</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={orderTimeFilterYear}
                  onChange={(e) => setOrderTimeFilterYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <button className="bg-green px-2 py-2 rounded-lg w-60 text-center hover:bg-darkGreen mt-8 mb-1" onClick={handleCreateOrderReport}>
            Create Order Document
          </button>
        </div>

        <hr className="mb-0" />

        {/* Product Section */}
        <div className="mb-4">
          <p className="font-bold text-lg mb-2">Products</p>
          <p>Document Name</p>
          <input
            type="text"
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <p>Select Category</p>
          <select
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
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
            <div className="mt-2 flex gap-2">
              <div>
                <p>Select Month</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={productTimeFilterMonth}
                  onChange={(e) => setProductTimeFilterMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p>Select Year</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={productTimeFilterYear}
                  onChange={(e) => setProductTimeFilterYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {productFilterCategory === "cost" && (
            <div className="mt-2">
              <p>Filter by Cost</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={productCostFilter}
                onChange={(e) => setProductCostFilter(e.target.value)}
              >
                <option value="highest">Highest to Lowest Price</option>
                <option value="lowest">Lowest to Highest Price</option>
              </select>
              <div className="mt-2 flex gap-2">
                <div>
                  <p>Select Month</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={productTimeFilterMonth}
                    onChange={(e) => setProductTimeFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p>Select Year</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={productTimeFilterYear}
                    onChange={(e) => setProductTimeFilterYear(Number(e.target.value))}
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

          {["id", "category", "name"].includes(productFilterCategory) && (
            <div className="mt-2">
              <p>{`Enter Product ${productFilterCategory.charAt(0).toUpperCase() + productFilterCategory.slice(1)}`}</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <div>
                  <p>Select Month</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={productTimeFilterMonth}
                    onChange={(e) => setProductTimeFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p>Select Year</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={productTimeFilterYear}
                    onChange={(e) => setProductTimeFilterYear(Number(e.target.value))}
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

          <button className="bg-green px-2 py-2 rounded-lg w-60 text-center hover:bg-darkGreen mt-8" onClick={handleCreateProductReport}>
            Create Product Document
          </button>
        </div>

        <hr className="mb-0" />

        {/* Material Section */}
        <div>
          <p className="font-bold text-lg mb-2">Materials</p>
          <p>Document Name</p>
          <input
            type="text"
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green mb-2"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
          />
          <p>Select Category</p>
          <select
            className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
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
            <div className="mt-2 flex gap-2">
              <div>
                <p>Select Month</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={materialTimeFilterMonth}
                  onChange={(e) => setMaterialTimeFilterMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p>Select Year</p>
                <select
                  className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                  value={materialTimeFilterYear}
                  onChange={(e) => setMaterialTimeFilterYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {materialFilterCategory === "cost" && (
            <div className="mt-2">
              <p>Filter by Cost</p>
              <select
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={materialCostFilter}
                onChange={(e) => setMaterialCostFilter(e.target.value)}
              >
                <option value="highest">Highest to Lowest Price</option>
                <option value="lowest">Lowest to Highest Price</option>
              </select>
              <div className="mt-2 flex gap-2">
                <div>
                  <p>Select Month</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={materialTimeFilterMonth}
                    onChange={(e) => setMaterialTimeFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p>Select Year</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={materialTimeFilterYear}
                    onChange={(e) => setMaterialTimeFilterYear(Number(e.target.value))}
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

          {["id", "category", "name", "color", "quantity"].includes(materialFilterCategory) && (
            <div className="mt-2">
              <p>{`Enter Material ${materialFilterCategory.charAt(0).toUpperCase() + materialFilterCategory.slice(1)}`}</p>
              <input
                type="text"
                className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                value={materialSearchTerm}
                onChange={(e) => setMaterialSearchTerm(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <div>
                  <p>Select Month</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={materialTimeFilterMonth}
                    onChange={(e) => setMaterialTimeFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p>Select Year</p>
                  <select
                    className="p-1 rounded-lg border border-darkBeige focus:outline-none focus:ring-2 focus:ring-green"
                    value={materialTimeFilterYear}
                    onChange={(e) => setMaterialTimeFilterYear(Number(e.target.value))}
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

          <button className="bg-green px-2 py-2 rounded-lg w-60 text-center hover:bg-darkGreen mt-8" onClick={handleCreateMaterialReport}>
            Create Material Document
          </button>
        </div>

        <hr className="mb-0" />

        <div className="absolute bottom-4 left-4">
          <Menu type="HamburgerMenu" style={{ width: '50px', height: '50px' }} />
        </div>
        <Menu type="OnlySlideMenu" iconFirst="/link.png" />
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
