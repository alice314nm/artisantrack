"use client";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { app } from "../../_utils/firebase";
import { db } from "../../_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import PieChart from "@/app/components/pie-chart";
import Link from "next/link";
import BlockHolder from "@/app/components/block-holder";
import {
  fetchOrders,
  fetchProducts,
  fetchMaterials,
} from "@/app/_services/monthlyFetch";

import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [stateShow, setStateShow] = useState("orders");
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterLabel, setFilterLabel] = useState("");

  const [popularProduct, setPopularProduct] = useState({});
  const [popularMaterial, setPopularMaterial] = useState({});
  const [regularClient, setRegularClient] = useState("");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const isInMonth = (deadlineSeconds, targetMonth) => {
    if (!deadlineSeconds || !targetMonth) {
      return false;
    }
    const deadlineDate = new Date(deadlineSeconds * 1000);
    const deadlineMonth = deadlineDate.getMonth(); // 0 = January, 1 = February, ...
    const deadlineYear = deadlineDate.getFullYear();
    const [targetMonthName, targetYear] = targetMonth.split(" ");
    const targetMonthIndex = new Date(
      Date.parse(targetMonthName + " 1, 2012")
    ).getMonth(); // Convert string month to index
    const targetYearInt = parseInt(targetYear, 10);

    console.log("Comparing:");
    console.log("  Deadline Month:", deadlineMonth);
    console.log("  Target Month Index:", targetMonthIndex);
    console.log("  Deadline Year:", deadlineYear);
    console.log("  Target Year:", targetYearInt);

    return deadlineMonth === targetMonthIndex && deadlineYear === targetYearInt;
  };

  const monthYear = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const showOrdersWithPopularProduct = () => {
    const filtered = orders.filter(
      (order) => order.productId === popularProduct?.id
    );
    setFilteredOrders(filtered);
    setFilterLabel("Orders with popular product this month");
    setStateShow("orders");
  };

  const showOrdersWithPopularMaterial = () => {
    const filtered = orders.filter((order) =>
      order.materialIds?.includes(popularMaterial?.id)
    );
    setFilteredOrders(filtered);
    setFilterLabel("Orders with popular material this month");
    setStateShow("orders");
  };

  const showOrdersWithRegularClient = () => {
    const filtered = orders.filter(
      (order) => order.customerName === regularClient?.name
    );
    setFilteredOrders(filtered);
    setFilterLabel("Orders from regular client this month");
    setStateShow("orders");
  };

  const exportToExcel = async (data, selectedMonth, selectedYear, userName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    // Title Section

    const titleCell = sheet.addRow([`${selectedMonth} ${selectedYear}`]);
    titleCell.font = { bold: true, size: 14 };
    sheet.addRow([]);

    // Income and Expenses
    sheet.addRow([`INCOME:`, data.income]);
    sheet.addRow([`EXPENSES:`, data.expenses]);
    sheet.addRow([]);

    // Popular Product, Materials and Client
    sheet.addRow([`Popular Product:`, data.popularProduct?.name]);
    sheet.addRow([`Popular Material:`, data.popularMaterial?.name]);
    sheet.addRow([`Regular Client:`, data.regularClient?.name]);
    sheet.addRow([]);

    // ORDERS Section
    sheet.addRow(["ORDERS"]);
    const orderHeaders = [
      "Title of the order",
      "Customer's name",
      "Product Id",
      "Product cost",
      "Material Id",
      "Quantity",
      "Material Cost",
      "Work cost",
      "Total Cost",
    ];
    sheet.addRow(orderHeaders);

    const filteredOrders = orders.filter((order) => {
      return (
        new Date(order.startDate.seconds * 1000).getMonth() === selectedMonth &&
        new Date(order.startDate.seconds * 1000).getFullYear() === selectedYear
      );
    });

    const orderRows = filteredOrders.map(async (order) => {
      console.log("Order: ", order);

      // Fetch product data if it's a reference
      const productId = order.productId;
      const productRef = doc(collection(db, "products"), productId); // Adjust this to match your Firestore structure.
      const productSnapshot = await getDoc(productRef);

      let productName = "—";
      let productCost = 0;

      if (productSnapshot.exists) {
        console.log("productSnapshot.data(): ", productSnapshot.data());
        const productData = productSnapshot.data();
        if (productData !== null && productData && productData.name) {
          productName = productData.name;
          productCost = productData.cost;
        } else {
          console.warn(`Product not found for order ID: ${order.id}`);
        }
      }
      let materialDetails = "";
      let totalMaterialCost = 0;

      if (
        order.materialIds &&
        Array.isArray(order.materialIds) &&
        order.quantities &&
        Array.isArray(order.quantities)
      ) {
        order.materialIds.forEach((materialId, index) => {
          const material = data.materials.find((m) => m.id === materialId);
          if (material && order.quantities[index] !== undefined) {
            let quantityValue = order.quantities[index];
            if (
              typeof order.quantities[index] === "object" &&
              order.quantities[index] !== null
            ) {
              if (order.quantities[index].hasOwnProperty("value")) {
                // example of checking for a value property.
                quantityValue = order.quantities[index].value; // Access the value property
              } else {
                console.warn("Quantity object does not have 'value' property.");
              }
            }
            const materialCost = material.cost * quantityValue; // Use quantityValue
            totalMaterialCost += materialCost;
            materialDetails += `${material.name} (Qty: ${quantityValue}), `; // Use quantityValue
          }
        });
        // Remove the last comma and space.
        materialDetails = materialDetails.slice(0, -2);
      } else {
        materialDetails = "—"; // If no material info, mark it as empty.
      }

      // Check if required fields are missing and log
      if (!order.productId || !order.customerName) {
        console.warn(
          `Missing productId or customerName for order ID: ${order.id}`
        );
      }

      return [
        order.nameOrder || "—",
        order.customerName || "—",
        order.productId || "—",
        order.productCost,
        order.materialIds ? order.materialIds.join(", ") : "—",
        order.quantities ? order.quantities.join(", ") : "—",
        order.totalMaterialCost,
        order.workCost || 0,
        order.totalCost || 0,
      ];
    });

    // Since you're using async calls, you need to ensure that all promises resolve before proceeding
    const resolvedOrderRows = await Promise.all(orderRows);

    // Add the rows to the sheet
    resolvedOrderRows.forEach((row) => {
      sheet.addRow(row);
    });

    sheet.addRow([]);

    // PRODUCTS Section
    sheet.addRow(["PRODUCTS"]);

    const productHeaders = [
      "Product ID",
      "Product name",
      "Category",
      "Average Total",
    ];
    sheet.addRow(productHeaders);

    data.products.forEach((prod) => {
      sheet.addRow([
        prod.productId,
        prod.name,
        prod.categories.join(", "),
        prod.averageCost,
      ]);
    });

    sheet.addRow([]);

    // MATERIALS Section
    sheet.addRow(["MATERIALS"]);

    const materialHeaders = [
      "Material Id",
      "Material Name",
      "Category",
      "Color",
      "Shop",
      "Quantity",
      "Cost per unit",
      "Total",
    ];

    sheet.addRow(materialHeaders);

    data.materials.forEach((mat) => {
      sheet.addRow([
        mat.materialId,
        mat.name,
        mat.categories.join(", "),
        mat.color,
        mat.shop,
        mat.quantity,
        mat.costPerUnit,
        mat.total,
      ]);
    });

    // Apply width to all columns
    sheet.columns = sheet.columns.map((col) => ({
      ...col,
      width: 25,
    }));

    // Apply font size 12
    sheet.eachRow((row) => {
      row.font = { size: 12 };
    });

    // Create a buffer and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${monthName}-${selectedYear}-artisan-${userName}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  useEffect(() => {
    document.title = "Monthly Report";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {}, [currentMonth]);

  // Fetch orders, products, materials
  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      const fetchedOrders = await fetchOrders(user, currentMonth);
      setOrders(fetchedOrders);
    };
    loadOrders();
  }, [user, currentMonth]);

  useEffect(() => {
    if (!user) return;

    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts(user, currentMonth);
      console.log("Fetched Products:", fetchedProducts);
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, [user, currentMonth]);

  useEffect(() => {
    if (!user) return;

    const loadMaterials = async () => {
      const fetchedMaterials = await fetchMaterials(user, currentMonth);
      setMaterials(fetchedMaterials);
    };
    loadMaterials();
  }, [user, currentMonth]);

  // Fetch Income and Expenses
  useEffect(() => {
    const fetchIncomeAndExpenses = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const ordersCollection = collection(db, `users/${user.uid}/orders`);
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(ordersData);

        const currentMonthValue = currentMonth.getMonth();
        const monthlyOrders = ordersData.filter((order) => {
          if (!order.deadline || !order.deadline.seconds) return false;
          const orderDate = new Date(order.deadline.seconds * 1000);
          return orderDate.getMonth() === currentMonthValue;
        });

        const monthlyIncome = monthlyOrders.reduce(
          (sum, order) =>
            sum +
            (parseFloat(order.productCost) || 0) +
            (parseFloat(order.workCost) || 0),
          0
        );

        const monthlyExpenses = monthlyOrders.reduce(
          (sum, order) => sum + (parseFloat(order.materialsCost) || 0),
          0
        );

        setIncome(monthlyIncome);
        setExpenses(monthlyExpenses);

        // Filter orders based on the current month and year
        const monthYear = currentMonth.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        console.log("Current Month:", currentMonth);
        console.log("Month Year:", monthYear);

        // Filter orders based on the current month and year (e.g., February 2025)
        const filteredOrdersForMonth = orders.filter((order) =>
          isInMonth(order.deadline?.seconds, monthYear)
        );

        console.log("Filtered Orders for this Month:", filteredOrdersForMonth);

        // Calculate Monthly Popular Material
        const materialCount = {};

        filteredOrdersForMonth.forEach((order) => {
          // Use filtered orders
          if (order.materialIds && Array.isArray(order.materialIds)) {
            order.materialIds.forEach((materialId) => {
              if (materialCount[materialId]) {
                materialCount[materialId].count += 1;
              } else {
                const material = materials.find((p) => p.id === materialId);
                if (material) {
                  materialCount[materialId] = { ...material, count: 1 };
                }
              }
            });
          }
        });

        // Find the monthly most popular material
        const mostPopularMaterial = Object.values(materialCount).reduce(
          (max, material) => (material.count > max.count ? material : max),
          { count: 0 }
        );

        console.log("Material count:", materialCount);
        setPopularMaterial(mostPopularMaterial);

        // Calculate Monthly Popular Product
        const productCount = {};

        filteredOrdersForMonth.forEach((order) => {
          // Use filtered orders
          if (order.productId) {
            if (productCount[order.productId]) {
              productCount[order.productId].count += 1;
            } else {
              const product = products.find((p) => p.id === order.productId);
              if (product) {
                productCount[order.productId] = { ...product, count: 1 };
              }
            }
          }
        });

        // Find the most popular product
        const mostPopularProduct = Object.values(productCount).reduce(
          (max, product) => (product.count > max.count ? product : max),
          { count: 0 }
        );

        setPopularProduct(mostPopularProduct);

        // Find the monthly most popular Client
        const clientCount = {};

        monthlyOrders.forEach((order) => {
          if (order.customerName) {
            if (clientCount[order.customerName]) {
              clientCount[order.customerName].count += 1;
            } else {
              clientCount[order.customerName] = {
                name: order.customerName,
                count: 1,
              };
            }
          }
        });

        const regularClient = Object.values(clientCount).reduce(
          (max, client) => (client.count > max.count ? client : max),
          { count: 0 }
        );
        setRegularClient(regularClient);

        console.log("Regular Client:", regularClient);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncomeAndExpenses();
  }, [user, currentMonth, products]);

  const handleStateOrders = () => {
    setStateShow("orders");
  };

  const handleStateProducts = () => {
    setStateShow("products");
  };

  const handleStateMaterials = () => {
    setStateShow("materials");
  };

  // Handle previous and next month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
    );
  };

  const formatDeadline = (timestamp) => {
    const deadlineDate = new Date(timestamp * 1000);
    const today = new Date();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedDate = `${
      monthNames[deadlineDate.getMonth()]
    } ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;

    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    const daysLeft = diffTime > 0 ? diffTime : 0;
    const daysStatus = diffTime > 0 ? `${diffTime} days` : "Due today";

    return [formattedDate, daysLeft, daysStatus];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="/loading-gif.gif"
          className="h-10"
          data-id="loading-spinner"
        />
      </div>
    );
  }

  if (user) {
    const selectedMonth = currentMonth.getMonth();
    const selectedYear = currentMonth.getFullYear();
    const userName = user.displayName || user.email || "User";

    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Monthly Report" />

        <div className="flex flex-col gap-4 pb-20">
          {/* toggle */}
          <div className="border-b border-b-darkBeige">
            <div className="flex flex-row items-center pb-4 justify-between px-4">
              <button onClick={goToPreviousMonth}>
                <img className="h-5" src="/arrowLeft.png" />
              </button>
              <p className="text-xl font-semibold">{monthYear}</p>
              <button onClick={goToNextMonth}>
                <img className="h-5" src="/arrowRight.png" />
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="px-4 pb-22 gap-4 flex flex-col">
            {/* diagram */}
            <div className="flex flex-col gap-2">
              {/* Finance text */}
              <div className="flex flex-row gap-2 text-xl">
                <p>Income: {income}$</p>
                <p>Expenses: {expenses}$</p>
              </div>
              {/* place for diagram */}
              <div className="flex justify-center px-4">
                <PieChart income={income} expenses={expenses} />
              </div>

              <div className="pt-2">
                <p>
                  Popular product this month:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithPopularProduct}
                  >
                    {popularProduct?.productId || "N/A"} |{" "}
                    {popularProduct?.name || "N/A"} |{" "}
                    {popularProduct?.count || 0}
                  </button>
                </p>

                <p>
                  Popular material this month:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithPopularMaterial}
                  >
                    {popularMaterial?.materialId || "N/A"} |{" "}
                    {popularMaterial?.name || "N/A"} |{" "}
                    {popularMaterial?.count || 0}
                  </button>
                </p>

                <p>
                  Regular client this month:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithRegularClient}
                  >
                    {regularClient?.name || "N/A"} | {regularClient?.count || 0}
                  </button>
                </p>
              </div>
            </div>

            {/* view */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Show</p>
              <div className="flex flex-row gap-2 justify-between items-center">
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "orders"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateOrders}
                >
                  Orders
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "products"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateProducts}
                >
                  Products
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "materials"
                      ? "bg-transparent border-2 border-red text-blackBeige"
                      : "bg-red text-white"
                  }`}
                  onClick={handleStateMaterials}
                >
                  Materials
                </button>
              </div>

              {stateShow === "orders" && (
                <div className="w-full px-4 pb-20">
                  {filterLabel && (
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-lg">{filterLabel}</p>
                      <button
                        onClick={() => {
                          setFilteredOrders([]);
                          setFilterLabel("");
                        }}
                        className="text-sm text-red underline"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}

                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
                    gap-4 sm:gap-6 lg:gap-8 
                    auto-rows-[1fr] 
                    justify-center items-stretch"
                  >
                    {(filteredOrders.length > 0 ? filteredOrders : orders).map(
                      (order, index) => (
                        <Link
                          href={`/orders/${order.id}`}
                          key={order.id}
                          data-id="order-block"
                        >
                          <BlockHolder
                            id={index + 1}
                            title={order.nameOrder}
                            imageSource={order.imageUrl || "/noImage.png"}
                            deadline={
                              order.deadline?.seconds
                                ? formatDeadline(order.deadline.seconds)
                                : ["No deadline", 0, "No deadline"]
                            }
                            currency={order.currency}
                            total={order.totalCost}
                            customerId={order.customerId}
                            type={"order"}
                          />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}

              {stateShow === "products" && (
                <div className="w-full px-4 pb-20">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 auto-rows-[1fr] justify-center items-stretch">
                    {Object.values(products).map((product) => (
                      <Link
                        href={`/products/${product.productId}`}
                        key={product.productId}
                        data-id="product-block"
                        className="transition-all duration-300 rounded-lg overflow-hidden"
                      >
                        <BlockHolder
                          key={product.productId}
                          id={product.productId}
                          title={product.name}
                          currency={product.currency}
                          category={product.categories?.join(", ") || "—"}
                          total={product.averageCost || "—"}
                          imageSource={
                            product.productImages?.[0]?.url || "/noImage.png"
                          }
                          type={"product"}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {stateShow === "materials" && (
                <div className="w-full px-4 pb-20">
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
                    gap-4 sm:gap-6 lg:gap-8 
                    auto-rows-[1fr] 
                    justify-center items-stretch"
                  >
                    {materials.map((material) => (
                      <Link
                        href={`/materials/${material.id}`}
                        key={material.materialId}
                        data-id="material-block"
                      >
                        <BlockHolder
                          key={material.materialId}
                          id={material.materialId}
                          title={material.name}
                          quantity={material.quantity || "—"}
                          category={material.categories.join(", ") || "—"}
                          total={material.total || "—"}
                          currency={material.currency}
                          color={material.color || "—"}
                          imageSource={material.images[0].url || "/noImage.png"}
                          type={"material"}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Menu
          type="TwoButtonsMenu"
          firstTitle={"Go back"}
          iconFirst={"/arrow-left.png"}
          onFirstFunction={() => (window.location.href = `/finances`)}
          secondTitle={"Download"}
          iconSecond={"/download.png"}
          onSecondFunction={() => {
            const yourData = {
              income,
              expenses,
              popularProduct,
              popularMaterial,
              regularClient,
              orders,
              products,
              materials,
            };

            exportToExcel(yourData, selectedMonth, selectedYear, userName);
          }}
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-6">
        <Header title="Artisan Track" />
        <NotLoggedWindow />
      </div>
    );
  }
}
