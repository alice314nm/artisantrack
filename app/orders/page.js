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
  const [categories, setCategories] = useState([]);

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

        for (let order of ordersData) {
          if (order.orderImages && order.orderImages.length > 0) {
            const productImages = await Promise.all(
              order.orderImages.map(async (productId) => {
                const productRef = doc(
                  db,
                  `users/${user.uid}/products/${productId}`
                );
                const productSnapshot = await getDoc(productRef);
                const productData = productSnapshot.data();

                order.orderId = productData?.productId;
                return productData?.productImages?.[0]?.url || "Unknown";
              })
            );
            order.imageUrl = productImages[0];
          } else {
            order.imageUrl = "Unknown";
          }

          if (order.customerId) {
            const customerRef = doc(
              db,
              `users/${user.uid}/customers/${order.customerId}`
            );
            const customerSnapshot = await getDoc(customerRef);
            const customerData = customerSnapshot.data();
            order.customerId = customerData?.nameCustomer || "Unknown";
            console.log(order.customerId);
          } else {
            order.customerId = "Unknown";
          }
        }

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      try {
        const db = getFirestore(app);
        const categoriesCollection = collection(
          db,
          `users/${user.uid}/productCategories`
        );
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map(
          (doc) => doc.data().name
        );
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    if (user) {
      fetchCategories();
    }
  }, [user]);

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

  let filteredOrders = [...orders];
  if (filters.Categories?.length > 0) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        Array.isArray(order.categories) &&
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
    const daysLeft = diffTime > 0 ? `(${diffTime} days)` : "(Due today)";

    return `${formattedDate} ${daysLeft}`;
  };

  if (searchTerm) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.name &&
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
          <p className="flex flex-col items-center w-full py-40">
            No orders yet
          </p>
        ) : (
          <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
            {filteredOrders.map((order) => (
              <Link
                href={`/order/${order.id}`}
                key={order.id}
                data-id="order-block"
              >
                <BlockHolder
                  id={order.orderId}
                  title={order.nameOrder}
                  imageSource={order.imageUrl || "Unknown"}
                  deadline={
                    order.deadline?.seconds
                      ? formatDeadline(order.deadline.seconds)
                      : "No deadline"
                  }
                  currency={order.currency}
                  total={order.totalCost}
                  customerId={order.customerId}
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
