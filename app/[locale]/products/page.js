"use client";

import { useTranslations } from "use-intl";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import SearchBar from "../components/search-bar";
import Link from "next/link";
import BlockHolder from "../components/block-holder";
import FilterWindow from "../components/filter-window";
import Menu from "../components/menu";
import Header from "../components/header";
import NotLoggedWindow from "../components/not-logged-window";
import { useUserAuth } from "../_utils/auth-context";
import { app } from "../_utils/firebase";
import FilterTotal from "../components/filter-total";

export default function Home() {
  const t = useTranslations("productPage");
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const [products, setProducts] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("title");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const productsCollection = collection(db, `users/${user.uid}/products`);
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(productsData);

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching fetchProducts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleNavigateToCreatePage = () => {
    window.location.href = "/create_product";
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
    ...new Set(products.flatMap((product) => product.categories)),
  ];

  let filteredProducts = [...products];
  if (filters.Categories?.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      product.categories.some((category) =>
        filters.Categories.includes(category)
      )
    );
  }

  if (filters["Sort by"]) {
    switch (filters["Sort by"]) {
      case "Name Ascending":
        filteredProducts.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        break;
      case "Name Descending":
        filteredProducts.sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { sensitivity: "base" })
        );
        break;
      case "Category":
        filteredProducts.sort((a, b) =>
          a.categories.join(", ").localeCompare(b.categories.join(", "))
        );
        break;
      case "ID Ascending":
        filteredProducts.sort(
          (a, b) => Number(a.productId) - Number(b.productId)
        );
        break;
      case "ID Descending":
        filteredProducts.sort(
          (a, b) => Number(b.productId) - Number(a.productId)
        );
        break;
      default:
        break;
    }
  }

  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Header title={t("title")} />

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={setSearchTerm}
          data-id="search-bar"
        />

        <FilterTotal
          onOpenFilters={toggleConfirmation}
          total={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">
            {t("noProducts")}
          </p>
        ) : (
          <div className="w-full px-4 pb-20">
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
              gap-4 sm:gap-6 lg:gap-8 
              auto-rows-[1fr] 
              justify-center items-stretch"
            >
              {filteredProducts.map((product) => (
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
                    category={product.categories.join(", ") || "—"}
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

        <FilterWindow
          onClose={closeConfirmation}
          windowVisibility={confirmWindowVisibility}
          onApplyFilters={handleApplyFilters}
          categories={categories}
          pageType={"product"}
        />

        <Menu
          type="TwoButtonsMenu"
          iconFirst="/link.png"
          firstTitle={t("copyForClient")}
          secondTitle={t("createProduct")}
          onSecondFunction={handleNavigateToCreatePage}
          data-id="menu-button"
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("title")} />
        <NotLoggedWindow />
      </div>
    );
  }
}