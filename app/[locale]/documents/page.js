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

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Page() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserAuth();
  const [documents, setDocuments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.uid) {
        try {
          const userDocumentsCollection = collection(db, "users", user.uid, "documents");
          const querySnapshot = await getDocs(userDocumentsCollection);
          const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setDocuments(docs);
        } catch (error) {
          console.error("Error fetching user documents:", error);
        }
      } else {
        setDocuments([]);
      }
    };

    fetchDocuments();
  }, [user?.uid]);

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
      category: doc.queryParams?.category || '',
      sortOrder: doc.queryParams?.sortOrder || '',
      month: doc.queryParams?.month || '',
      year: doc.queryParams?.year || '',
      deadlineFilter: doc.queryParams?.deadlineFilter || '',
      searchTerm: doc.queryParams?.searchTerm || ''
    }).toString();

    router.push(`/documents/${doc.id}?${query}`);
  };

  const getCategoryDisplay = (doc) => {
        if (!doc.queryParams || !doc.type) return "Unknown Category";
    
         const { category, sortOrder, month, year, deadlineFilter, searchTerm } = doc.queryParams;
         let timeDisplay = "";
         if (month && year) {
           timeDisplay = `${month} ${year}`;
         } else if (year) {
           timeDisplay = `${year}`;
         } else if (month) {
           timeDisplay = `${month}`;
         }
         const timeSuffix = timeDisplay ? `, ${timeDisplay}` : "";
    
           switch (doc.type) {
          case "order":
              if (category === "cost") {
                   console.log("Inside 'order' and category === 'cost':");
                   console.log("  sortOrder:", sortOrder);
                   let text = "N/A"; // Default value
                   if (sortOrder === "desc" || sortOrder === "highest") {
                     text = "Highest to Lowest Price";
                   } else if (sortOrder === "asc" || sortOrder === "lowest") {
                     text = "Lowest to Highest Price";
                   }
                   console.log("  text:", text);
                   return `Orders by Cost: ${text}${timeSuffix}`;
              }
              if (category === "deadline") {
                let deadlineLabel = deadlineFilter === "past" ? "Past Due Deadline" : "Upcoming Deadline";
                let suffix = '';
                if (timeSuffix.includes(',')) {
                  const parts = timeSuffix.split(',');
                  if (parts.length > 1) {
                    const timeInfo = parts[1].trim();
                    // Check if the time info includes a month (assuming month names are capitalized)
                    const monthRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)/i;
                    if (monthRegex.test(timeInfo)) {
                      suffix = `, ${timeInfo.replace(/,?\s*\d{4}$/, '').trim()}`; // Remove trailing year if present
                    }
                  }
                }
                return `Orders by Deadline: ${deadlineLabel}${suffix}`;
              }
              if (category === "time") {
                return `Orders by Period of Time: ${timeSuffix.startsWith(', ') ? timeSuffix.substring(2) : 'All Time'}`;
              }
              if (["customerName", "description"].includes(category)) {
                return `Orders by ${category.charAt(0).toUpperCase() + category.slice(1)}: ${searchTerm || "N/A"}${timeSuffix}`;
              }
              break;
    
          case "product":
            if (category === "Default Category") return "Product Document";
            if (category === "cost") {
            console.log("Inside 'product' and category === 'cost':");
            console.log("  sortOrder:", sortOrder);
            const text = sortOrder === "desc" ? "Highest to Lowest Price" : "Lowest to Highest Price";
            console.log("  text:", text);
            return `Products by Cost: ${text}${timeSuffix}`;
          }
          if (["id", "category", "name"].includes(category)) {
            return `Products by ${category.charAt(0).toUpperCase() + category.slice(1)}: ${searchTerm || "N/A"}${timeSuffix}`;
          }
          if (category === "popularity") {
            return `Products by Popularity in Orders${timeSuffix.startsWith(', ') ? `: ${timeSuffix.substring(2)}` : ''}`;
          }
          break;
    
          case "material":
            if (category === "Default Category") return "Material Document";
            if (category === "cost") {
              console.log("Inside 'material' and category === 'cost':");
              console.log("  sortOrder:", sortOrder);
              const text = sortOrder === "desc" ? "Highest to Lowest Price" : "Lowest to Highest Price";
              console.log("  text:", text);
            return `Materials by Cost: ${text}${timeSuffix}`;
            }
            if (["id", "category", "name", "color", "quantity"].includes(category)) {
            return `Materials by ${category.charAt(0).toUpperCase() + category.slice(1)}: ${searchTerm || "N/A"}${timeSuffix}`;
            }
            if (category === "popularity") {
             return `Materials by Popularity in Orders${timeSuffix.startsWith(', ') ? `: ${timeSuffix.substring(2)}` : ''}`;
            }
            break;
    
           default:
          return "Unknown Category";
    }
    
         return "Unknown Category";
      } ;

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Documents" showUserName={true} />

        <div className="flex flex-row justify-between mx-4">
          <p className="font-bold">Total: {documents.length}</p>
        </div>

        <SearchBar onOpenFilters={toggleConfirmation} onSearch={(term) => setSearchTerm(term)} />

        <div className="mx-4 flex flex-col gap-4 pb-24">
          {documents.map((doc) => {
            let createdAtDate = new Date(doc.createdAt);
            const formattedDate = createdAtDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const formattedId = `#${doc.id.toString().padStart(7, "0").slice(-7)}`;

            return (
              <div
                key={doc.id}
                className="border p-6 rounded-lg shadow-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex flex-col items-start">
                  <p className="font-semibold text-lg">{doc.name}</p>
                  <p className="text-sm text-gray-500">{getCategoryDisplay(doc)}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-600">{formattedId}</p>
                  <p className="text-xs text-gray-500">Created on {formattedDate}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Menu
          type="OneButtonMenu"
          iconFirst="/link.png"
          firstTitle="Create document +"
          onFirstFunction={handleNavigateToCreatePage}
        />
      </div>
    );
  } else {
    return <NotLoggedWindow />;
  }
}