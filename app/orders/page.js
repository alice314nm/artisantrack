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
import FilterTotal from "../components/filter-total";

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const [orders, setOrders] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Initial loading timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Fetch orders
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
          } else {
            order.customerId = "Unknown";
          }
        }

        setOrders(ordersData);
        setFilteredOrders(ordersData); // Initialize filteredOrders with all orders
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Fetch categories
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

  // Apply filters and sorting
  useEffect(() => {
    if (loading) return; // Skip if still loading

    let result = [...orders];

    // Apply category filter
    if (filters.Categories?.length > 0) {
      result = result.filter(
        (order) =>
          Array.isArray(order.categories) &&
          order.categories.some((category) =>
            filters.Categories.includes(category)
          )
      );
    }

    // Apply sorting
    if (filters["Sort by"]) {
      switch (filters["Sort by"]) {
        case "Name Ascending":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "Name Descending":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "Category":
          result.sort((a, b) =>
            a.categories.join(", ").localeCompare(b.categories.join(", "))
          );
          break;
        case "ID Ascending":
          result.sort((a, b) => Number(a.productId) - Number(b.productId));
          break;
        case "ID Descending":
          result.sort((a, b) => Number(b.productId) - Number(a.productId));
          break;
        default:
          break;
      }
    }

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.name &&
          order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [orders, filters, searchTerm, loading]);

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

  const formatDeadline = (timestamp) => {
    const deadlineDate = new Date(timestamp * 1000);
    const today = new Date();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
        <Header title="Orders" />

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={(term) => setSearchTerm(term)}
          data-id="search-bar"
        />

        <FilterTotal
          onOpenFilters={toggleConfirmation}
          total={filteredOrders.length}
        />

        {filteredOrders.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">
            No orders found
          </p>
        ) : (
          <div className="w-full px-4 pb-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
              gap-4 sm:gap-6 lg:gap-8 
              auto-rows-[1fr] 
              justify-center items-stretch">
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