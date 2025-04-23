"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { db } from "@/app/[locale]/_utils/firebase";
import { getDocs, collection } from "firebase/firestore";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import SearchBar from "@/app/[locale]/components/search-bar";
import { useTranslations } from "next-intl";

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthIndices = [
  "",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export default function Page() {
  const t = useTranslations("Documents");
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserAuth();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("documentsTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.uid) {
        try {
          const userDocumentsCollection = collection(
            db,
            "users",
            user.uid,
            "documents"
          );
          const querySnapshot = await getDocs(userDocumentsCollection);
          const docs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDocuments(docs);
          setFilteredDocuments(docs); // Initially, filtered docs = all docs
        } catch (error) {
          console.error("Error fetching user documents:", error);
        }
      } else {
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };

    fetchDocuments();
  }, [user?.uid]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocuments(documents);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = documents.filter((doc) => {
      // Search by document name
      if (doc.name && doc.name.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search by document type
      if (doc.type && doc.type.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search by category (if available)
      if (
        doc.queryParams?.category &&
        doc.queryParams.category.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      // Search by search term in query params (if available)
      if (
        doc.queryParams?.searchTerm &&
        doc.queryParams.searchTerm.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      return false;
    });

    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const handleNavigateToCreatePage = () => {
    router.push("/create_document");
  };

  const toggleConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const handleDocumentClick = (doc) => {
    const query = new URLSearchParams({
      category: doc.queryParams?.category || "",
      sortOrder: doc.queryParams?.sortOrder || "",
      month: doc.queryParams?.month || "",
      year: doc.queryParams?.year || "",
      deadlineFilter: doc.queryParams?.deadlineFilter || "",
      searchTerm: doc.queryParams?.searchTerm || "",
    }).toString();

    router.push(`/documents/${doc.id}?${query}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getCategoryDisplay = (doc) => {
    if (!doc.queryParams || !doc.type) return t("unknownCategory");

    const { category, sortOrder, month, year, deadlineFilter, searchTerm } =
      doc.queryParams;

    // Format timeDisplay with translated month names
    let timeDisplay = "";
    if (month && year) {
      const translatedMonth = t(
        `months.${monthIndices.indexOf(month.toLowerCase())}`
      );
      timeDisplay = `${translatedMonth} ${year}`;
    } else if (year) {
      timeDisplay = `${year}`;
    } else if (month) {
      const translatedMonth = t(
        `months.${monthIndices.indexOf(month.toLowerCase())}`
      );
      timeDisplay = `${translatedMonth}`;
    }
    const timeSuffix = timeDisplay ? `, ${timeDisplay}` : "";

    switch (doc.type) {
      case "order":
        if (category === "cost") {
          let costOrderText;
          if (sortOrder === "desc" || sortOrder === "highest") {
            costOrderText = t("highestToLowestPrice");
          } else if (sortOrder === "asc" || sortOrder === "lowest") {
            costOrderText = t("lowestToHighestPrice");
          } else {
            costOrderText = t("notAvailable");
          }
          return `${t("ordersByCost")}: ${costOrderText}${timeSuffix}`;
        }

        if (category === "deadline") {
          let deadlineLabel =
            deadlineFilter === "past"
              ? t("pastDueDeadline")
              : t("upcomingDeadline");
          let suffix = "";
          if (timeSuffix.includes(",")) {
            const parts = timeSuffix.split(",");
            if (parts.length > 1) {
              const timeInfo = parts[1].trim();
              // Check if the time info includes a month (assuming month names are capitalized)
              const monthRegex = new RegExp(monthNames.slice(1).join("|"), "i");
              if (monthRegex.test(timeInfo)) {
                suffix = `, ${timeInfo.replace(/,?\s*\d{4}$/, "").trim()}`; // Remove trailing year if present
              }
            }
          }
          return `${t("ordersByDeadline")}: ${deadlineLabel}${suffix}`;
        }

        if (category === "time") {
          return `${t("ordersByPeriod")}: ${
            timeSuffix.startsWith(", ") ? timeSuffix.substring(2) : t("allTime")
          }`;
        }

        if (["customerName", "description"].includes(category)) {
          const categoryTranslation =
            category === "customerName" ? t("customerName") : t("description");
          return `${t("ordersBy")} ${categoryTranslation}: ${
            searchTerm || t("notAvailable")
          }${timeSuffix}`;
        }
        break;

      case "product":
        if (category === "Default Category") return t("productDocument");

        if (category === "cost") {
          const costOrderText =
            sortOrder === "desc"
              ? t("highestToLowestPrice")
              : t("lowestToHighestPrice");
          return `${t("productsByCost")}: ${costOrderText}${timeSuffix}`;
        }

        if (["id", "category", "name"].includes(category)) {
          const categoryTranslation = t(`${category}Category`);
          return `${t("productsBy")} ${categoryTranslation}: ${
            searchTerm || t("notAvailable")
          }${timeSuffix}`;
        }

        if (category === "popularity") {
          return `${t("productsByPopularity")}${
            timeSuffix.startsWith(", ") ? `: ${timeSuffix.substring(2)}` : ""
          }`;
        }
        break;

      case "material":
        if (category === "Default Category") return t("materialDocument");

        if (category === "cost") {
          const costOrderText =
            sortOrder === "desc"
              ? t("highestToLowestPrice")
              : t("lowestToHighestPrice");
          return `${t("materialsByCost")}: ${costOrderText}${timeSuffix}`;
        }

        if (
          ["id", "category", "name", "color", "quantity"].includes(category)
        ) {
          const categoryTranslation = t(`${category}Category`);
          return `${t("materialsBy")} ${categoryTranslation}: ${
            searchTerm || t("notAvailable")
          }${timeSuffix}`;
        }

        if (category === "popularity") {
          return `${t("materialsByPopularity")}${
            timeSuffix.startsWith(", ") ? `: ${timeSuffix.substring(2)}` : ""
          }`;
        }
        break;

      default:
        return t("unknownCategory");
    }

    return t("unknownCategory");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("documentsTitle")} showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold">
            {t("total")}: {documents.length}
          </p>
        </div>

        <div className="mx-4">
          <SearchBar
            placeholder={t("searchPlaceholder")}
            onOpenFilters={toggleConfirmation}
            onSearch={handleSearch}
          />
        </div>

        <div className="mx-4 flex flex-col gap-4 pb-24">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => {
              let createdAtDate = new Date(doc.createdAt);
              const formattedDate = createdAtDate.toLocaleDateString(); // Use browser's locale
              const formattedId = `#${doc.id
                .toString()
                .padStart(7, "0")
                .slice(-7)}`;

              return (
                <div
                  key={doc.id}
                  className="border p-6 rounded-lg shadow-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex flex-col items-start">
                    <p className="font-semibold text-lg">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {getCategoryDisplay(doc)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-600">{formattedId}</p>
                    <p className="text-xs text-gray-500">
                      {t("createdOn")} {formattedDate}
                    </p>
                  </div>
                </div>
              );
            })
          ) : searchTerm ? (
            <p className="text-center text-gray-500 py-8">
              {t("noDocumentsFound")}
            </p>
          ) : null}
        </div>

        <Menu
          type="OneButtonMenu"
          iconFirst="/link.png"
          firstTitle={t("createDocument")}
          onFirstFunction={handleNavigateToCreatePage}
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("documentsTitle")} />
        <NotLoggedWindow />
      </div>
    );
  }
}
