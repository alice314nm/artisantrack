"use client";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "./_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import Link from "next/link";
import NotLoggedWindow from "./components/not-logged-window";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [inProgress, setInProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  const tileStyle =
    "border-b border-b-darkBeige px-4 pb-4 flex flex-col gap-4 items-start justify-between transition-all duration-300";
  const titleStyle = "text-lg font-bold";
  const infoStyle = "text text-blackBeige";
  const LinkStyle =
    "w-44 text-center bg-green px-4 font-semibold rounded-lg py-2 hover:bg-darkGreen transition-all duration-300";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
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

        const now = new Date();
        const currentMonth = now.getMonth();

        const monthlyOrders = ordersData.filter((order) => {
          if (!order.startDate || !order.startDate.seconds) return false;
          const orderDate = new Date(order.startDate.seconds * 1000);
          return orderDate.getMonth() === currentMonth;
        });

        const inProgressCount = ordersData.filter(
          (order) => !order.completed
        ).length;
        const completedCount = ordersData.filter(
          (order) => order.completed
        ).length;

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

        setMonthlyIncome(monthlyIncome);
        setMonthlyExpenses(monthlyExpenses);
        setInProgress(inProgressCount);
        setCompleted(completedCount);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMaterials = async () => {
      if (!user) return;
      try {
        const db = getFirestore(app);
        const materialsCollection = collection(
          db,
          `users/${user.uid}/materials`
        );
        const materialsSnapshot = await getDocs(materialsCollection);
        setTotalMaterials(materialsSnapshot.size);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      if (!user) return;
      try {
        const db = getFirestore(app);
        const productsCollection = collection(db, `users/${user.uid}/products`);
        const productsSnapshot = await getDocs(productsCollection);
        setTotalProducts(productsSnapshot.size);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchMaterials();
    fetchOrders();
  }, [user]);

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
      <div className="flex flex-col min-h-screen gap-6">
        <Header title="Artisan Track" />

        <div className="flex flex-col gap-4 pb-20">
          <h1 className="text-xl font-bold px-4">
            Welcome back, {user.displayName}!
          </h1>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={tileStyle}>
              <p className={titleStyle}>Orders</p>
              <div className="space-y-2">
                <p className={infoStyle}>In Progress: {inProgress}</p>
                <p className={infoStyle}>Completed: {completed}</p>
              </div>
              <Link className={LinkStyle} href="/orders">
                View Orders
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Materials</p>
              <div className="space-y-2">
                <p className={infoStyle}>Total Materials: {totalMaterials}</p>
              </div>
              <Link className={LinkStyle} href="/materials">
                View Materials
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Products</p>
              <div className="space-y-2">
                <p className={infoStyle}>Total Products: {totalProducts}</p>
              </div>
              <Link className={LinkStyle} href="/products">
                View Products
              </Link>
            </div>

            <div className={tileStyle}>
              <p className={titleStyle}>Finance</p>
              <div className="space-y-2">
                <p className={infoStyle}>Revenue: ${monthlyIncome}</p>
                <p className={infoStyle}>Expenses: ${monthlyExpenses}</p>
              </div>
              <Link className={LinkStyle} href="/finances">
                View Finances
              </Link>
            </div>
          </div>
        </div>

        <Menu type="OnlySlideMenu" />
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
