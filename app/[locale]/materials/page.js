"use client";

import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import BlockHolder from "@/app/[locale]/components/block-holder";
import FilterWindow from "@/app/[locale]/components/filter-window";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
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

export default function Page() {
  const t = useTranslations();
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ Categories: [], "Sort by": "" });
  const [materials, setMaterials] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("materials.pageTitle");
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
        setMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
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
      filters.Colors.includes(material.color)
    );
  }

  if (filters["Sort by"]) {
    switch (filters["Sort by"]) {
      case "Name Ascending":
        filteredMaterials.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        break;
      case "Name Descending":
        filteredMaterials.sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { sensitivity: "base" })
        );
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
        <Header title={t("materials.pageTitle")} />

        <SearchBar
          onOpenFilters={toggleConfirmation}
          onSearch={setSearchTerm}
          data-id="search-bar"
        />

        <FilterTotal
          onOpenFilters={toggleConfirmation}
          total={filteredMaterials.length}
        />

        {filteredMaterials.length === 0 ? (
          <p className="flex flex-col items-center w-full py-40">
            {t("materials.noMaterials")}
          </p>
        ) : (
          <div className="w-full px-4 pb-20">
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 
              gap-4 sm:gap-6 lg:gap-8 
              auto-rows-[1fr] 
              justify-center items-stretch"
            >
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
                    color={material.color || "—"}
                    imageSource={material.images[0]?.url || "/noImage.png"}
                    type={"material"}
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
          pageType={"material"}
        />

        <Menu
          type="TwoButtonsMenu"
          iconFirst="/link.png"
          firstTitle={t("materials.copyForClient")}
          secondTitle={t("materials.createMaterial")}
          onSecondFunction={handleNavigateToCreatePage}
          data-id="menu-button"
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("auth.notLoggedInTitle")} />
        <NotLoggedWindow />
      </div>
    );
  }
}
