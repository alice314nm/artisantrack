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
import { app } from "@/app/_utils/firebase";
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
  const [materials, setMaterials] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const materialsCollection = collection(
          db,
          `users/${user.uid}/materials`
        );
        const materialsSnapshot = await getDocs(materialsCollection);
        const materialsData = materialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(materialsData);

        const materialsWithCategoriesColorsAndImages = await Promise.all(
          materialsData.map(async (material) => {
            const categoryNames = await Promise.all(
              material.categories.map(async (categoryId) => {
                const categoryDocRef = doc(
                  db,
                  `users/${user.uid}/materialCategories/${categoryId}`
                );
                const categoryDoc = await getDoc(categoryDocRef);
                return categoryDoc.exists()
                  ? categoryDoc.data().name
                  : "Unknown";
              })
            );

            let colorNames = [];
            if (Array.isArray(material.color)) {
              colorNames = await Promise.all(
                material.color.map(async (colorId) => {
                  const colorDocRef = doc(
                    db,
                    `users/${user.uid}/colors/${colorId}`
                  );
                  const colorDoc = await getDoc(colorDocRef);
                  return colorDoc.exists() ? colorDoc.data().name : "Unknown";
                })
              );
            } else if (material.color) {
              const colorDocRef = doc(
                db,
                `users/${user.uid}/colors/${material.color}`
              );
              const colorDoc = await getDoc(colorDocRef);
              colorNames = colorDoc.exists()
                ? [colorDoc.data().name]
                : ["Unknown"];
            }

            const imageUrls = material.images?.map((image) => image.url) || [];

            return {
              ...material,
              categories: categoryNames,
              colors: colorNames,
              images: imageUrls,
            };
          })
        );

        setMaterials(materialsWithCategoriesColorsAndImages);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
        setIsDataFetched(true);
      }
    };

    fetchMaterials();
  }, [user]);

  const handleNavigateToCreatePage = () => {
    window.location.href = "/create_material";
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
    ...new Set(materials.flatMap((material) => material.categories)),
  ];

  let filteredMaterials = [...materials];
  if (filters.Categories?.length > 0) {
    filteredMaterials = filteredMaterials.filter((material) =>
      material.categories.some((category) =>
        filters.Categories.includes(category)
      )
    );
  }

  if (filters.Colors?.length > 0) {
    filteredMaterials = filteredMaterials.filter((material) =>
      material.colors.some((color) => filters.Colors.includes(color))
    );
  }

  if (filters["Sort by"]) {
    switch (filters["Sort by"]) {
      case "Name Ascending":
        filteredMaterials.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Descending":
        filteredMaterials.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Category":
        filteredMaterials.sort((a, b) =>
          a.categories.join(", ").localeCompare(b.categories.join(", "))
        );
        break;
      case "ID Ascending":
        filteredMaterials.sort(
          (a, b) => Number(a.materialId) - Number(b.materialId)
        );
        break;
      case "ID Descending":
        filteredMaterials.sort(
          (a, b) => Number(b.materialId) - Number(a.materialId)
        );
        break;
      default:
        break;
    }
  }

  if (searchTerm) {
    filteredMaterials = filteredMaterials.filter((material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Header title="Materials" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold" data-id="total-count">
            Total: {filteredMaterials.length}
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

        {isDataFetched && filteredMaterials.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">
            No materials yet
          </p>
        ) : (
          <div className="items-center mx-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-center pb-24">
            {filteredMaterials.map((material) => (
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
                  color={material.colors.join(", ") || "—"}
                  imageSource={material.images[0] || "/noImage.png"}
                  type={"material"}
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
          pageType={"material"}
        />

        <Menu
          type="TwoButtonsMenu"
          iconFirst="/link.png"
          firstTitle="Copy for client"
          secondTitle="Create material +"
          onSecondFunction={handleNavigateToCreatePage}
          data-id="menu-button"
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
