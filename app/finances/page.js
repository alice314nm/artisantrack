"use client";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { app } from "../_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import BlockHolder from "@/app/components/block-holder";
import DocumentHolder from "@/app/components/document-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [inProgress, setInProgress] = useState(0);
  const [completed, setCompleted] = useState(0);


  const buttonStyle = "bg-green px-2 py-1 rounded-lg w-60 text-center"


  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchTax = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const userDoc = doc(db, `users/${user.uid}`);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        console.log(userData);

        setUserData(userSnapshot.data());
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTax();
  }, [user]);

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

        const inProgressCount = ordersData.filter(order => !order.completed).length;
        const completedCount = ordersData.filter(order => order.completed).length;
        setInProgress(inProgressCount);
        setCompleted(completedCount);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
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
        <Header title="Finance" showUserName={true} />

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <div className="flex flex-row justify-between">
            <p>All orders:</p>
            <p>Set Tax: {userData ? userData.tax ?? "N/A" : "Loading..."}</p>
          </div>

          <div className="flex flex-row justify-between items-start">
            <div>
              <p>In progress: {inProgress}</p>
              <p>Completed: {completed}</p>
            </div>
            <button className="bg-green px-2 py-1 rounded-lg">Change Tax</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>This month (january):</p>
          <p>Income: 1234$ Expenses: 123$</p>
          <Link href="finances/monthly" className={buttonStyle}>Monthly Financial Report</Link>
        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>This year (2025):</p>
          <p>Income: 1234$ Expenses: 123$</p>
          <Link href="finances/yearly" className={buttonStyle}>Yearly Financial Report</Link>        </div>

        <div className="flex flex-col gap-2 border-b border-b-darkBeige px-5 pb-3">
          <p>Other reports:</p>
          <div className="flex flex-col gap-2 w-60">
            <button className={buttonStyle}>Labor Cost</button>
            <button className={buttonStyle}>Supply Expenses</button>
            <button className={buttonStyle}>Order Payments</button>
          </div>
        </div>

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
        />

        <Menu
          type="OnlySlideMenu"
          iconFirst="/link.png"
        />
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
