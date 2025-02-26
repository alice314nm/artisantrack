"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import BlockHolder from "@/app/components/block-holder";
import FilterWindow from "@/app/components/filter-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import SearchBar from "@/app/components/search-bar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { app } from "../_utils/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const [orders, setOrders] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }
    , [user]);

  const handleNavigateToCreatePage = () => {
    window.location.href = "/create_order";
  };

  const toggleConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
  };

  const categories = [
    ...new Set(orders.flatMap((order) => order.categories)),
  ];

  let filteredOrders = [...orders];
  if (filters.Categories?.length > 0) {
    filteredOrders = filteredOrders.filter((order) =>
      order.categories.some((category) =>
        filters.Categories.includes(category)
      )
    );
  }

  if (filters["Sort by"]) {
    switch (filters["Sort by"]) {
      case "Name Ascending":
        filteredOrders.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Descending":
        filteredOrders.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Category":
        filteredOrders.sort((a, b) =>
          a.categories.join(", ").localeCompare(b.categories.join(", "))
        );
        break;
      case "ID Ascending":
        filteredOrders.sort(
          (a, b) => Number(a.productId) - Number(b.productId)
        );
        break;
      case "ID Descending":
        filteredOrders.sort(
          (a, b) => Number(b.productId) - Number(a.productId)
        );
        break;
      default:
        break;
    }
  }

  if (searchTerm) {
    filteredOrders = filteredOrders.filter((order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

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
        <Header title="Orders" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold" data-id="total-count">
            Total: {filteredOrders.length}
          </p>

          <div className="bg-green rounded-xl px-4 font-bold cursor-pointer">
            Create document
          </div>
        </div>

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={(term) => setSearchTerm(term)}
          filterOn={true}
        />

        {filteredOrders.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">No orders yet</p>
        ) : (
          <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
            {filteredOrders.map((order) => (
              <Link
                href={`/order/${order.id}`}
                key={order.id}
                data-id="order-block"
              >
                <BlockHolder
                  id={order.id}
                  title={order.nameOrder}
                  category={order.categories.join(", ")}
                  total={order.total}
                  imageSource={"no-image"}
                  type={"order"}
                />
              </Link>
            ))}
          </div>
        )}

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
          onApplyFilters={handleApplyFilters}
          categories={categories}
          pageType={"order"}
        />

        <Menu
          type="OneButtonMenu"
          iconFirst="/link.png"
          firstTitle="Create order +"
          onFirstFunction={handleNavigateToCreatePage}
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
