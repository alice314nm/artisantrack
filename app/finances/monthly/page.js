"use client";

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../_utils/firebase";
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

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [stateShow, setStateShow] = useState("orders");
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [popularProduct, setPopularProduct] = useState({});
  const [popularMaterial, setPopularMaterial] = useState({});
  const [regularClient, setRegularClient] = useState("");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  const monthYear = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  //Function where to set/change variables for popular entities, incomes, expense when the chosen month is changing
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
          if (!order.startDate || !order.startDate.seconds) return false;
          const orderDate = new Date(order.startDate.seconds * 1000);
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
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncomeAndExpenses();
  }, [user, currentMonth]);

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
                  <span className="underline">#id | Name</span>
                </p>
                <p>
                  Popular material this month:{" "}
                  <span className="underline">#id | Name</span>
                </p>
                {/* Make a "Name" a link to the popular product */}
                <p>Regular client: Alex Smith</p>
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

        <Menu
          type="TwoButtonsMenu"
          firstTitle={"Go back"}
          iconFirst={"/arrow-left.png"}
          onFirstFunction={() => (window.location.href = `/finances`)}
          secondTitle={"Download"}
          iconSecond={"/download.png"}
          onSecondFunction={() => console.log(0)}
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
