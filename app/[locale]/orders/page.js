"use client";

import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import BlockHolder from "@/app/[locale]/components/block-holder";
import FilterWindow from "@/app/[locale]/components/filter-window";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import SearchBar from "@/app/[locale]/components/search-bar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { app } from "@/app/[locale]/_utils/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import FilterTotal from "../components/filter-total";
import { useTranslations } from "next-intl";
import NotLoggedWindow from "../components/not-logged-window";

export default function Page() {
  const t = useTranslations("OrdersPage");

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
    document.title = t("pageTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
  
      const db = getFirestore(app);
  
      // Fetch orders and related product data
      const fetchOrders = async () => {
        try {
          const ordersCollection = collection(db, `users/${user.uid}/orders`);
          const ordersSnapshot = await getDocs(ordersCollection);
  
          const ordersData = await Promise.all(
            ordersSnapshot.docs.map(async (docSnap) => {
              const order = { id: docSnap.id, ...docSnap.data() };
  
              if (order.orderImages?.length > 0) {
                const productSnapshots = await Promise.all(
                  order.orderImages.map((productId) =>
                    getDoc(doc(db, `users/${user.uid}/products/${productId}`))
                  )
                );
  
                const productDataList = productSnapshots.map((snap) => snap.data());
  
                const firstProduct = productDataList[0];
  
                order.imageUrl = firstProduct?.productImages?.[0]?.url || "/noImage.png";
                order.orderId = firstProduct?.productId || order.id;
                order.categories = firstProduct?.categories || [t("unknown")];
              } else {
                order.imageUrl = "/noImage.png";
                order.categories = [t("unknown")];
              }
  
              return order;
            })
          );
  
          setOrders(ordersData);
          setFilteredOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
  
      // Fetch categories
      const fetchCategories = async () => {
        try {
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
          console.error("Error fetching categories:", error);
        }
      };
  
      // Run both in parallel
      await Promise.all([fetchOrders(), fetchCategories()]);
    };
  
    fetchData();
  }, [user, t]);
  

  // Apply filters and sorting
  useEffect(() => {
    if (loading) return; // Skip if still loading

    let result = [...orders];

    // Apply category filter
    if (filters.Categories?.length > 0) {
      result = result.filter((order) => {
        const categoriesArray = Array.isArray(order.categories)
          ? order.categories
          : [order.categories];
        return categoriesArray.some((category) =>
          filters.Categories.includes(category)
        );
      });
    }

    if (filters.Clients?.length > 0) {
      result = result.filter((order) =>
        filters.Clients.includes(order.customerName)
      );
    }

    // Apply sorting
    if (filters["Sort by"]) {
      switch (filters["Sort by"]) {
        case t("nameAscending"):
          result.sort((a, b) =>
            (a.nameOrder || "").localeCompare(b.nameOrder || "")
          );
          break;
        case t("nameDescending"):
          result.sort((a, b) =>
            (b.nameOrder || "").localeCompare(a.nameOrder || "")
          );
          break;
        case t("category"):
          result.sort((a, b) =>
            a.categories.join(", ").localeCompare(b.categories.join(", "))
          );
          break;
        case t("earliestDeadline"):
          result.sort((a, b) => {
            const deadlineA = a.deadline?.seconds || Infinity;
            const deadlineB = b.deadline?.seconds || Infinity;
            return deadlineA - deadlineB;
          });
          break;
        case t("latestDeadline"):
          result.sort((a, b) => {
            const deadlineA = a.deadline?.seconds || 0;
            const deadlineB = b.deadline?.seconds || 0;
            return deadlineB - deadlineA;
          });
          break;
        default:
          break;
      }
    }

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.nameOrder &&
          order.nameOrder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [orders, filters, searchTerm, loading, t]);

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

    const formattedDate = `${monthNames[deadlineDate.getMonth()]
      } ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;

    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    const daysLeft = diffTime > 0 ? diffTime : 0;
    const daysStatus =
      diffTime > 0 ? `${diffTime} ${t("days")}` : t("dueToday");

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
        <Header title={t("pageTitle")} />

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
            {t("noOrdersFound")}
          </p>
        ) : (
          <div className="w-full px-4 pb-20">
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
                    customerId={order.customerName}
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
          firstTitle={t("createOrderButton")}
          onFirstFunction={handleNavigateToCreatePage}
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("pageTitle")} />
        <NotLoggedWindow />
      </div>
    );
  }
}
