"use client";

import { useTranslations } from "use-intl";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/app/[locale]/_utils/firebase";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import PieChart from "@/app/[locale]/components/pie-chart";
import {
  fetchMaterials,
  fetchOrders,
  fetchProducts,
} from "@/app/[locale]/_services/yearlyFetch";
import Link from "next/link";
import BlockHolder from "@/app/[locale]/components/block-holder";
import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function WelcomePage() {
  const t = useTranslations("financeYearly");
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [stateShow, setStateShow] = useState("orders");
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterLabel, setFilterLabel] = useState("");

  const [popularProduct, setPopularProduct] = useState({});
  const [popularMaterial, setPopularMaterial] = useState({});
  const [regularClient, setRegularClient] = useState("");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  const showOrdersWithPopularProduct = () => {
    const filtered = orders.filter(
      (order) => order.productId === popularProduct?.id
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("popularProduct"));
    setStateShow("orders");
  };

  const showOrdersWithPopularMaterial = () => {
    const filtered = orders.filter((order) =>
      order.materialIds?.includes(popularMaterial?.id)
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("popularMaterial"));
    setStateShow("orders");
  };

  const showOrdersWithRegularClient = () => {
    const filtered = orders.filter(
      (order) => order.customerName === regularClient?.name
    );
    setFilteredOrders(filtered);
    setFilterLabel(t("regularClient"));
    setStateShow("orders");
  };

  useEffect(() => {
    document.title = t("title");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  //Function where to set/change variables for popular entities, incomes, expense when the chosen year is changing
  useEffect(() => {}, [currentYear]);

  // Fetch orders, products, materials
  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      const fetchedOrders = await fetchOrders(user, currentYear);
      setOrders(fetchedOrders);

      // Only try to find a popular client if there are orders
      if (fetchedOrders.length > 0) {
        const clientCounts = fetchedOrders.reduce((acc, order) => {
          const clientId = order.customerId;
          acc[clientId] = (acc[clientId] || 0) + 1;
          return acc;
        }, {});

        const clientIds = Object.keys(clientCounts);

        if (clientIds.length > 0) {
          const popularClientId = clientIds.reduce((a, b) =>
            clientCounts[a] > clientCounts[b] ? a : b
          );

          // If you want to also get the full client object from the orders:
          const regularClientData = fetchedOrders.find(
            (order) => order.customerId === popularClientId
          )?.customerName;

          setRegularClient({
            id: popularClientId,
            name: regularClientData || "Unknown",
            count: clientCounts[popularClientId],
          });
        } else {
          setRegularClient(null);
        }
      } else {
        setRegularClient(null);
      }
    };

    loadOrders();
  }, [user, currentYear]);

  useEffect(() => {
    if (!user) return;

    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts(user, currentYear);
      setProducts(fetchedProducts);

      if (fetchedProducts.length > 0) {
        const productCounts = fetchedProducts.reduce((acc, product) => {
          acc[product.productId] = (acc[product.productId] || 0) + 1;
          return acc;
        }, {});

        const productIds = Object.keys(productCounts);

        if (productIds.length > 0) {
          const popularProductId = productIds.reduce((a, b) =>
            productCounts[a] > productCounts[b] ? a : b
          );

          const popularProductData = fetchedProducts.find(
            (product) => product.productId === popularProductId
          );

          setPopularProduct({
            ...popularProductData,
            count: productCounts[popularProductId],
          });
        } else {
          setPopularProduct(null);
        }
      } else {
        setPopularProduct(null);
      }
    };

    loadProducts();
  }, [user, currentYear]);

  useEffect(() => {
    if (!user) return;

    const loadMaterials = async () => {
      const fetchedMaterials = await fetchMaterials(user, currentYear);
      setMaterials(fetchedMaterials);

      if (fetchedMaterials.length > 0) {
        const materialCounts = fetchedMaterials.reduce((acc, material) => {
          acc[material.materialId] = (acc[material.materialId] || 0) + 1;
          return acc;
        }, {});

        const materialIds = Object.keys(materialCounts);

        if (materialIds.length > 0) {
          const popularMaterialId = materialIds.reduce((a, b) =>
            materialCounts[a] > materialCounts[b] ? a : b
          );

          const popularMaterialData = fetchedMaterials.find(
            (material) => material.materialId === popularMaterialId
          );

          setPopularMaterial({
            ...popularMaterialData,
            count: materialCounts[popularMaterialId],
          });
        } else {
          setPopularMaterial(null);
        }
      } else {
        setPopularMaterial(null);
      }
    };

    loadMaterials();
  }, [user, currentYear]);

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

        const currentYearValue = new Date(currentYear, 0, 1).getFullYear();
        const yearlyOrders = ordersData.filter((order) => {
          if (!order.startDate || !order.startDate.seconds) return false;
          const orderDate = new Date(order.startDate.seconds * 1000);
          return orderDate.getFullYear() === currentYearValue;
        });

        const yearlyIncome = yearlyOrders.reduce(
          (sum, order) =>
            sum +
            (parseFloat(order.productCost) || 0) +
            (parseFloat(order.workCost) || 0),
          0
        );

        const yearlyExpenses = yearlyOrders.reduce(
          (sum, order) => sum + (parseFloat(order.materialsCost) || 0),
          0
        );

        setIncome(yearlyIncome);
        setExpenses(yearlyExpenses);

        // Calculate Popular Material
        const materialCount = {};

        yearlyOrders.forEach((order) => {
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

        // Find the most popular material
        const mostPopularMaterial = Object.values(materialCount).reduce(
          (max, material) => (material.count > max.count ? material : max),
          { count: 0 }
        );

        console.log("Material count:", materialCount);
        setPopularMaterial(mostPopularMaterial);

        // Calculate Popular Product
        const productCount = {};

        yearlyOrders.forEach((order) => {
          if (order.productId) {
            if (productCount[order.productId]) {
              productCount[order.productId].count += 1;
            } else {
              const product = products.find((p) => p.id === order.productId);
              productCount[order.productId] = { ...product, count: 1 };
            }
          }
        });

        // Find the most popular Product
        const mostPopularProduct = Object.values(productCount).reduce(
          (max, product) => (product.count > max.count ? product : max),
          { count: 0 }
        );

        setPopularProduct(mostPopularProduct);

        // Find the most popular Client
        const clientCount = {};

        yearlyOrders.forEach((order) => {
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
  }, [user, currentYear, products]);

  const handleStateOrders = () => {
    setStateShow("orders");
  };

  const handleStateProducts = () => {
    setStateShow("products");
  };

  const handleStateMaterials = () => {
    setStateShow("materials");
  };

  const goToPreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const goToNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const formatDeadline = (timestamp) => {
    const deadlineDate = new Date(timestamp * 1000);
    const today = new Date();

    const monthNames = [
      t("months.jan"),
      t("months.feb"),
      t("months.mar"),
      t("months.apr"),
      t("months.may"),
      t("months.jun"),
      t("months.jul"),
      t("months.aug"),
      t("months.sep"),
      t("months.oct"),
      t("months.nov"),
      t("months.dec"),
    ];

    const formattedDate = `${
      monthNames[deadlineDate.getMonth()]
    } ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;

    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? diffTime : 0;
    const daysStatus =
      diffTime > 0 ? `${diffTime} ${t("days")}` : t("dueToday");

    return [formattedDate, daysLeft, daysStatus];
  };

  const exportYearlyReportWithExcelJS = async ({
    year,
    income,
    expenses,
    popularProduct,
    popularMaterial,
    regularClient,
  }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Yearly Report ${year}`);

    sheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Value", key: "value", width: 50 },
    ];

    const rows = [
      { title: "Year", value: year },
      { title: "Income ($)", value: income },
      { title: "Expenses ($)", value: expenses },
      {},
      { title: "Most Popular Product", value: popularProduct?.name || "N/A" },
      { title: "Product ID", value: popularProduct?.productId || "N/A" },
      { title: "Product Count", value: popularProduct?.count || 0 },
      {},
      { title: "Most Used Material", value: popularMaterial?.name || "N/A" },
      { title: "Material ID", value: popularMaterial?.materialId || "N/A" },
      { title: "Material Count", value: popularMaterial?.count || 0 },
      {},
      { title: "Most Frequent Client", value: regularClient?.name || "N/A" },
      { title: "Client Order Count", value: regularClient?.count || 0 },
    ];

    rows.forEach((row) => sheet.addRow(row));

    // Optional: Make headers bold
    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Yearly_Report_${year}.xlsx`);
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
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("title")} />

        <div className="flex flex-col gap-4 pb-20">
          {/* Toggle */}
          <div className="border-b border-b-darkBeige">
            <div className="flex flex-row items-center pb-4 justify-between px-4">
              <button onClick={goToPreviousYear}>
                <img className="h-5" src="/arrowLeft.png" />
              </button>
              <p className="text-xl font-semibold">{currentYear}</p>
              <button onClick={goToNextYear}>
                <img className="h-5" src="/arrowRight.png" />
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="px-4 pb-22 gap-4 flex flex-col">
            {/* Diagram */}
            <div className="flex flex-col gap-2">
              {/* Finance text */}
              <div className="flex flex-row gap-2 text-xl">
                <p>
                  {t("income")}: {income.toFixed(2)}$
                </p>
                <p>
                  {t("expenses")}: {expenses.toFixed(2)}$
                </p>
              </div>

              {/* Diagram */}
              <div className="flex justify-center px-4">
              {(income === 0 && expenses === 0) ? 
                (<p className="py-36">No data for finances yet</p>) : 
                (<PieChart income={income} expenses={expenses} />)
              }
              </div>

              <div className="pt-2">
                <p>
                  {t("popularProduct")}:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithPopularProduct}
                  >
                    {popularProduct?.productId || "N/A"} |{" "}
                    {popularProduct?.name || "N/A"} | {t("amount")}:{" "}
                    {popularProduct?.count || 0}
                  </button>
                </p>

                <p>
                  {t("popularMaterial")}:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithPopularMaterial}
                  >
                    {popularMaterial?.materialId || "N/A"} |{" "}
                    {popularMaterial?.name || "N/A"} | {t("amount")}:{" "}
                    {popularMaterial?.count || 0}
                  </button>
                </p>

                <p>
                  {t("regularClient")}:{" "}
                  <button
                    className="underline"
                    onClick={showOrdersWithRegularClient}
                  >
                    {regularClient?.name || "N/A"} | {t("amount")}:{" "}
                    {regularClient?.count || 0}
                  </button>
                </p>
              </div>
            </div>

            {/* view */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold">{t("show")}</p>

              {filterLabel && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg">{filterLabel}</p>
                    <button
                      onClick={() => {
                        setFilteredOrders([]);
                        setFilterLabel("");
                      }}
                      className="rounded-md text-white bg-red py-y px-4"
                    >
                      {t("clearFilter")}
                    </button>
                  </div>

                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
            gap-4 sm:gap-6 lg:gap-8 
            auto-rows-[1fr] 
            justify-center items-stretch"
                  >
                    {filteredOrders.map((order, index) => (
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
                              : [t("noDeadline"), 0, t("noDeadline")]
                          }
                          currency={order.currency}
                          total={order.totalCost}
                          customerId={order.customerId}
                          type={"order"}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-row gap-2 justify-between items-center">
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "orders"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateOrders}
                >
                  {t("orders")}
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "products"
                      ? "bg-transparent border-2 border-green"
                      : "bg-green"
                  }`}
                  onClick={handleStateProducts}
                >
                  {t("products")}
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${
                    stateShow === "materials"
                      ? "bg-transparent border-2 border-red text-blackBeige"
                      : "bg-red text-white"
                  }`}
                  onClick={handleStateMaterials}
                >
                  {t("materials")}
                </button>
              </div>

              {stateShow === "orders" && (
                <div className="w-full px-4 pb-20">
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
                    gap-4 sm:gap-6 lg:gap-8 
                    auto-rows-[1fr] 
                    justify-center items-stretch"
                  >
                    {orders.map((order, index) => (
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
                    ))}
                  </div>
                </div>
              )}

              {stateShow === "products" && (
                <div className="w-full px-4 pb-20">
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
                  gap-4 sm:gap-6 lg:gap-8 
                  auto-rows-[1fr] 
                  justify-center items-stretch"
                  >
                    {products.map((product) => (
                      <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        data-id="product-block"
                        className="transition-all duration-300 
                        rounded-lg 
                        overflow-hidden"
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

        {stateShow === "orders" && (
          <div className="w-full px-4 pb-20">
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
      gap-4 sm:gap-6 lg:gap-8 
      auto-rows-[1fr] 
      justify-center items-stretch"
            >
              {orders.map((order, index) => (
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
                        : [t("noDeadline"), 0, t("noDeadline")]
                    }
                    currency={order.currency}
                    total={order.totalCost}
                    customerId={order.customerId}
                    type={"order"}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {stateShow === "products" && (
          <div className="w-full px-4 pb-20">
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
      gap-4 sm:gap-6 lg:gap-8 
      auto-rows-[1fr] 
      justify-center items-stretch"
            >
              {products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  data-id="product-block"
                  className="transition-all duration-300 
          rounded-lg 
          overflow-hidden"
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

        <Menu
          type="TwoButtonsMenu"
          firstTitle={t("goBack")}
          iconFirst={"/arrow-left.png"}
          onFirstFunction={() => (window.location.href = `/finances`)}
          secondTitle={t("download")}
          iconSecond={"/download.png"}
          onSecondFunction={() =>
            exportYearlyReportWithExcelJS({
              year: currentYear,
              income,
              expenses,
              popularProduct,
              popularMaterial,
              regularClient,
            })
          }
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
