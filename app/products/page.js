"use client";


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

export default function Home() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const [products, setProducts] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

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

        const productsWithCategoriesAndImages = await Promise.all(
          productsData.map(async (product) => {
            const categoryNames = await Promise.all(
              product.categories.map(async (categoryId) => {
                const categoryDocRef = doc(
                  db,
                  `users/${user.uid}/productCategories/${categoryId}`
                );
                const categoryDoc = await getDoc(categoryDocRef);
                return categoryDoc.exists()
                  ? categoryDoc.data().name
                  : "Unknown";
              })
            );

            const productImageUrls = product.productImages?.map((image) => image.url) || [];
            const patternImageUrls = product.patternImages?.map((image) => image.url) || [];


            return {
              ...product,
              categories: categoryNames,
              productImages: productImageUrls,
              patternImage: patternImageUrls,
            };
          })
        );

        setProducts(productsWithCategoriesAndImages);
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
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Descending":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
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
        <Header title="Products" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold" data-id="total-count">
            Total: {filteredProducts.length}
          </p>
          <div
            className="bg-green rounded-xl px-4 font-bold cursor-pointer"
            data-id="create-document-button"
          >
            Create document
          </div>
        </div>

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={setSearchTerm}
          filterOn={true}
          data-id="search-bar"
        />

        {filteredProducts.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">No products yet</p>
        ) : (
          <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
            {filteredProducts.map((product) => (
              <Link
              href={`/products/${product.id}`}
                key={product.id}
                data-id="product-block"
              >
                <BlockHolder
                  key={product.productId}
                  id={product.productId}
                  title={product.name}
                  currency={product.currency}
                  category={product.categories.join(", ") || "—"}
                  total={product.averageCost || "—"}
                  imageSource={product.productImages[0] || "/noImage.png"}
                  type={"product"}
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
          pageType={"product"}
        />

        <Menu
          type="TwoButtonsMenu"
          iconFirst="/link.png"
          firstTitle="Copy for client"
          secondTitle="Create product +"
          onSecondFunction={handleNavigateToCreatePage}
          data-id="menu-button"
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Products" />
        <NotLoggedWindow />
      </div>
    );
  }
}