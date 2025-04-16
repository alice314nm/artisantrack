"use client";

import { useTranslations } from "use-intl";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { app } from "@/app/[locale]/_utils/firebase";
import { db } from "@/app/[locale]/_utils/firebase";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import PieChart from "@/app/[locale]/components/pie-chart";
import Link from "next/link";
import BlockHolder from "@/app/[locale]/components/block-holder";
import {
  fetchOrders,
  fetchProducts,
  fetchMaterials,
} from "@/app/[locale]/_services/monthlyFetch";

import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function WelcomePage() {
  const t = useTranslations("FinanceMonthly");
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

  const monthIndex = currentMonth.getMonth(); // 0 = January, 1 = February, ...
  const monthName = t(`months.${monthIndex}`); // Get the translated month name
  const monthYear = `${monthName} ${currentMonth.getFullYear()}`;

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

  const showOrdersWithPopularProduct = () => {
    const filtered = orders.filter(
      (order) => order.productId === popularProduct?.id
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("filters.popularProduct"));
    setStateShow("orders");
  };

  const showOrdersWithPopularMaterial = () => {
    const filtered = orders.filter((order) =>
      order.materialIds?.includes(popularMaterial?.id)
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("filters.popularMaterial"));
    setStateShow("orders");
  };

  const showOrdersWithRegularClient = () => {
    const filtered = orders.filter(
      (order) => order.customerName === regularClient?.name
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("filters.regularClient"));
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
    sheet.addRow([t("excel.income"), data.income]);
    sheet.addRow([t("excel.expenses"), data.expenses]);
    sheet.addRow([]);

    // Popular Product, Materials and Client
    sheet.addRow([t("excel.popularProduct"), data.popularProduct?.name]);
    sheet.addRow([t("excel.popularMaterial"), data.popularMaterial?.name]);
    sheet.addRow([t("excel.regularClient"), data.regularClient?.name]);
    sheet.addRow([]);

    // ORDERS Section
    sheet.addRow([t("excel.orders")]);

    const orderHeaders = [
      t("excel.headers.title"),
      t("excel.headers.customerName"),
      t("excel.headers.productId"),
      t("excel.headers.productCost"),
      t("excel.headers.materialId"),
      t("excel.headers.quantity"),
      t("excel.headers.materialCost"),
      t("excel.headers.workCost"),
      t("excel.headers.totalCost"),
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
    sheet.addRow([t("excel.products")]);

    const productHeaders = [
      t("excel.productHeaders.id"),
      t("excel.productHeaders.name"),
      t("excel.productHeaders.category"),
      t("excel.productHeaders.average"),
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
    sheet.addRow([t("excel.materials")]);

    const materialHeaders = [
      t("excel.materialHeaders.id"),
      t("excel.materialHeaders.name"),
      t("excel.materialHeaders.category"),
      t("excel.materialHeaders.color"),
      t("excel.materialHeaders.shop"),
      t("excel.materialHeaders.quantity"),
      t("excel.materialHeaders.costPerUnit"),
      t("excel.materialHeaders.total"),
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
    document.title = t("pageTitle.monthlyReport");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

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
      t("date.months.jan"),
      t("date.months.feb"),
      t("date.months.mar"),
      t("date.months.apr"),
      t("date.months.may"),
      t("date.months.jun"),
      t("date.months.jul"),
      t("date.months.aug"),
      t("date.months.sep"),
      t("date.months.oct"),
      t("date.months.nov"),
      t("date.months.dec"),
    ];

    const formattedDate = `${
      monthNames[deadlineDate.getMonth()]
    } ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;

    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? diffTime : 0;
    const daysStatus =
      diffTime > 0 ? `${diffTime} ${t("date.daysLeft")}` : t("date.dueToday");

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
        <Header title={t("pageTitle.monthlyReport")} />

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
                <p>
                  {t("finance.income")}: {income}$
                </p>
                <p>
                  {t("finance.expenses")}: {expenses}$
                </p>
              </div>
              {/* place for diagram */}
              <div className="flex justify-center px-4">
                {(income === 0 && expenses === 0) ? 
                  (<p className="py-36">No data for finances yet</p>) : 
                  (<PieChart income={income} expenses={expenses} />)
                }             
              </div>

              <div className="pt-2">
                <p>
                  {t("finance.popularProduct")}{" "}
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
                  {t("finance.popularMaterial")}{" "}
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
                  {t("finance.regularClient")}{" "}
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
              <p className="font-semibold">{t("view.show")}</p>
              <div className="flex flex-row gap-2 justify-between items-center">
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "orders"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateOrders}
                >
                  {t("view.orders")}
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "products"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateProducts}
                >
                  {t("view.products")}
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "materials"
                      ? "bg-transparent border-2 border-red text-blackBeige"
                      : "bg-red text-white"
                  }`}
                  onClick={handleStateMaterials}
                >
                  {t("view.materials")}
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
                        {t("view.clearFilter")}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 auto-rows-[1fr] justify-center items-stretch">
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
                                : [
                                    t("view.noDeadline"),
                                    0,
                                    t("view.noDeadline"),
                                  ]
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
          firstTitle={t("menu.goBack")}
          iconFirst={"/arrow-left.png"}
          onFirstFunction={() => (window.location.href = `/finances`)}
          secondTitle={t("menu.download")}
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
