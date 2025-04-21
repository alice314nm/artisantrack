"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { db } from "@/app/[locale]/_utils/firebase";
import { doc, getDoc, getDocs, collection, query, where, orderBy, orderDoc } from "firebase/firestore";
import Header from "@/app/[locale]/components/header";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import Menu from "@/app/[locale]/components/menu"; 

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function DocumentDetailPage() {
  const { documentid } = useParams();
  const searchParams = useSearchParams();
  const { user } = useUserAuth();
  const [documentData, setDocumentData] = useState(null);
  const [data, setData] = useState([]); 
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const router = useRouter(); 

  useEffect(() => {
    const fetchDocumentAndData = async () => {
      if (user?.uid && documentid) {
        setIsLoadingDocument(true);
        try {
          const docRef = doc(db, "users", user.uid, "documents", documentid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setDocumentData(docSnap.data());
            console.log("Fetched Document Data:", docSnap.data());
            const queryParams = docSnap.data().queryParams;
            console.log("Document Query Params:", queryParams);
            const documentType = docSnap.data().type;

            if (documentType === "order") {
              await fetchOrders(queryParams);
            } else if (documentType === "product") {
              await fetchProducts(queryParams);
            } else if (documentType === "material") {
              await fetchMaterials(queryParams);
            }
          } else {
            console.log("No such document!");
            setDocumentData(null);
            setData([]);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
          setDocumentData(null);
          setData([]);
        } finally {
          setIsLoadingDocument(false);
        }
      } else {
        setDocumentData(null);
        setData([]);
        setIsLoadingDocument(false);
      }
    };

    fetchDocumentAndData();
  }, [user?.uid, documentid, searchParams]);

  // Fetch orders based on query parameters
  const fetchOrders = async (queryParams) => {
    if (!user?.uid || !queryParams) return;

    setIsLoadingData(true);
    const ordersCollection = collection(db, "users", user.uid, "orders");
    let q = query(ordersCollection);

    if (queryParams?.month && queryParams?.year) {
      const monthIndex = monthNames.indexOf(queryParams.month);
      if (monthIndex > 0) {
        const startOfMonth = new Date(parseInt(queryParams.year), monthIndex - 1, 1);
        const endOfMonth = new Date(parseInt(queryParams.year), monthIndex, 0, 23, 59, 59, 999);
        q = query(q,
          where("startDate", ">=", startOfMonth),
          where("startDate", "<=", endOfMonth)
        );
      }
    } else if (queryParams?.year) {
      const startOfYear = new Date(parseInt(queryParams.year), 0, 1);
      const endOfYear = new Date(parseInt(queryParams.year), 11, 31, 23, 59, 59, 999);
      q = query(q,
        where("startDate", ">=", startOfYear),
        where("startDate", "<=", endOfYear)
      );
    } else if (queryParams?.month) {
      const monthIndex = monthNames.indexOf(queryParams.month);
      if (monthIndex > 0) {
        const year = new Date().getFullYear();
        const startOfMonth = new Date(year, monthIndex - 1, 1);
        const endOfMonth = new Date(year, monthIndex, 0, 23, 59, 59, 999);
        q = query(q,
          where("startDate", ">=", startOfMonth),
          where("startDate", "<=", endOfMonth)
        );
      }
    }

    if (queryParams?.category === "cost") {
      // ...
    } else if (queryParams?.category === "deadline") {
      const now = new Date();
      if (queryParams.deadlineFilter === "past") {
        q = query(q, where("deadline", "<", now), orderBy("deadline", "asc"));
      } else if (queryParams.deadlineFilter === "upcoming") {
        q = query(q, where("deadline", ">=", now), orderBy("deadline", "asc"));
      }
      
    } else if (queryParams?.category === "customerName" && queryParams?.searchTerm) {
      q = query(q, where("customerName", "==", queryParams.searchTerm));
    } else if (queryParams?.category === "description" && queryParams?.searchTerm) {
      q = query(q, where("description", "==", queryParams.searchTerm));
    }

    try {
      const querySnapshot = await getDocs(q);
      let fetchedOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (queryParams?.category === "cost" && queryParams?.sortOrder) {
        fetchedOrders.sort((a, b) => {
          const costA = parseFloat(a.totalCost);
          const costB = parseFloat(b.totalCost);
          if (queryParams.sortOrder === "desc" || queryParams.sortOrder === "highest") {
            return costB - costA; 
          } else if (queryParams.sortOrder === "asc" || queryParams.sortOrder === "lowest") {
            return costA - costB; 
          }
          return 0;
        });
      }

      setData(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const fetchProducts = async (queryParams) => {
    if (!user?.uid || !queryParams) return;
    console.log("Fetching Products with Query Params:", queryParams);
    console.log("Querying products with category:", queryParams.category);

    setIsLoadingData(true);
    const ordersCollection = collection(db, "users", user.uid, "orders");
    let ordersQuery = query(ordersCollection);

    // 🗓️ Apply date filtering to orders
    if (queryParams?.month && queryParams?.year) {
        const monthIndex = monthNames.indexOf(queryParams.month);
        if (monthIndex > 0) {
            const startOfMonth = new Date(parseInt(queryParams.year), monthIndex - 1, 1);
            const endOfMonth = new Date(parseInt(queryParams.year), monthIndex, 0, 23, 59, 59, 999);
            ordersQuery = query(ordersQuery,
                where("startDate", ">=", startOfMonth),
                where("startDate", "<=", endOfMonth)
            );
        }
    }

    try {
        const ordersSnapshot = await getDocs(ordersQuery);
        const fetchedData = [];
        const productsCollection = collection(db, "users", user.uid, "products");

        // 🧠 Popularity: Most ordered product(s)
        if (queryParams.category === "popularity") {
            const productCountMap = {};

            // Count how many times each product ID appears in orders
            for (const orderDoc of ordersSnapshot.docs) {
                const orderData = orderDoc.data();
                const pid = orderData?.productId;

                if (pid) {
                    productCountMap[pid] = (productCountMap[pid] || 0) + 1;
                }
            }

            const maxCount = Math.max(...Object.values(productCountMap));

            const mostPopularProductIds = Object.keys(productCountMap).filter(
                pid => productCountMap[pid] === maxCount
            );

            console.log("Most popular product IDs:", mostPopularProductIds);

            for (const orderDoc of ordersSnapshot.docs) {
                const orderData = orderDoc.data();
                const pid = orderData?.productId;

                if (pid && mostPopularProductIds.includes(pid)) {
                    const productDoc = await getDoc(doc(productsCollection, pid));
                    if (productDoc.exists()) {
                        const product = { id: productDoc.id, ...productDoc.data() };
                        fetchedData.push({ orderId: orderDoc.id, product, productId: pid });
                    }
                }
            }

            setData(fetchedData);
            setIsLoadingData(false);
            return;
        }

        for (const orderDoc of ordersSnapshot.docs) {
            const orderData = orderDoc.data();
            const pid = orderData?.productId;

            if (pid) {
                const productDoc = await getDoc(doc(productsCollection, pid));
                if (productDoc.exists()) {
                    const product = { id: productDoc.id, ...productDoc.data() };

                    if (queryParams.category === "name" && queryParams.searchTerm) {
                        if (product.name?.toLowerCase().includes(queryParams.searchTerm.toLowerCase())) {
                            fetchedData.push({ orderId: orderDoc.id, product, productId: pid });
                        }
                    } else if (queryParams.category === "id" && queryParams.searchTerm) {
                        if ((product.productId || product.id) === queryParams.searchTerm) {
                            fetchedData.push({ orderId: orderDoc.id, product, productId: pid });
                        }
                    } else if (queryParams.category === "categories" && queryParams.searchTerm) {
                        const searchCategory = queryParams.searchTerm.toLowerCase().trim();
                        const productCategories = product.categories || [];

                        if (
                            Array.isArray(productCategories) &&
                            productCategories.some(
                                (cat) => typeof cat === "string" && cat.toLowerCase().trim() === searchCategory
                            )
                        ) {
                            fetchedData.push({ orderId: orderDoc.id, product, productId: pid });
                        }
                    } else {
                        fetchedData.push({ orderId: orderDoc.id, product, productId: pid });
                    }
                }
            }
        }

        if (queryParams?.category === "cost" && queryParams?.sortOrder) {
            fetchedData.sort((a, b) => {
                const costA = parseFloat(a.product?.averageCost);
                const costB = parseFloat(b.product?.averageCost);
                return queryParams.sortOrder === "desc" ? costB - costA : costA - costB;
            });
        }

        console.log("Fetched Data:", fetchedData);
        setData(fetchedData);
    } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
    } finally {
        setIsLoadingData(false);
    }
};


// Fetch materials based on query parameters
  const fetchMaterials = async (queryParams) => {
    if (!user?.uid || !queryParams) return;
    console.log("Fetching Materials with Query Params:", queryParams);
    console.log("Querying materials with category:", queryParams.category);

    setIsLoadingData(true);
    const materialsCollection = collection(db, "users", user.uid, "materials");
    let materialsQuery = query(materialsCollection);


    if (queryParams.category === "popularity") {

    }

    try {
        const materialsSnapshot = await getDocs(materialsQuery);
        const fetchedData = [];

        for (const matDoc of materialsSnapshot.docs) {
            const material = { id: matDoc.id, ...matDoc.data() };

            let displayCategory = "N/A";
            if (material.categories && Array.isArray(material.categories) && material.categories.length > 0) {
                displayCategory = material.categories.join(", ");
            }

            console.log("Material:", material);
            console.log("Categories:", material.categories);

            
            if (queryParams.category === "name" && queryParams.searchTerm) {
                if (material.name?.toLowerCase().includes(queryParams.searchTerm.toLowerCase())) {
                    fetchedData.push({ material, category: displayCategory });
                }
            } else if (queryParams.category === "id" && queryParams.searchTerm) {
                if ((material.materialId || material.id) === queryParams.searchTerm) {
                    fetchedData.push({ material, category: displayCategory });
                }
              } else if (queryParams.category === "categories" && queryParams.searchTerm) {
                  if (
                      Array.isArray(material.categories) &&
                      material.categories.length > 0 &&
                      material.categories.some(cat =>
                        cat.toLowerCase() === queryParams.searchTerm.toLowerCase()
                      )
                  ) {

                  }
              } else if (queryParams.category === "quantity" && queryParams.searchTerm) {
                  if (String(material.quantity) === queryParams.searchTerm) {
                      fetchedData.push({ material, category: displayCategory });
                  }
              } else if (queryParams.category === "color" && queryParams.searchTerm) {
                if (material.color?.toLowerCase().includes(queryParams.searchTerm.toLowerCase())) {
                    fetchedData.push({ material, category: displayCategory });
                }
              } else {
                  fetchedData.push({ material, category: displayCategory });
              }
          }

        if (queryParams?.category === "cost" && queryParams?.sortOrder) {
          fetchedData.sort((a, b) => {
              const costA = parseFloat(a.material?.total);
              const costB = parseFloat(b.material?.total);
              return queryParams.sortOrder === "desc" ? costB - costA : costA - costB;
          });
      }

      console.log("Fetched Data:", fetchedData);


        setData(fetchedData);
        setIsLoadingData(false);
    } catch (error) {
        console.error("Error fetching materials:", error);
        setData([]);
    } finally {
        setIsLoadingData(false);
    }
  };

    const handleGoBack = () => {
    router.back();
  };

  if (user) {
    return (
      <div className="flex flex-col min-h-screen gap-4 relative pb-20">
        <Header title="Documents" showUserName={true} />
  
        {/* Loading / Document Header */}
        <div className="mx-4 mt-4">
          {isLoadingDocument ? (
            <h2 className="text-lg font-semibold mb-2">Loading document details...</h2>
          ) : documentData ? (
            <h2 className="text-lg font-semibold mb-2">{getCategoryDisplay(documentData)}</h2>
          ) : (
            <h2 className="text-lg font-semibold mb-2">Document Not Found</h2>
          )}
        </div>
  
        {/* Document Content */}
        <div className="mx-4 pb-24">
          <h2 className="text-xl font-semibold mb-4">
            {documentData?.type === "order"
              ? "Orders"
              : documentData?.type === "product"
              ? "Products"
              : documentData?.type === "material"
              ? "Materials"
              : "Unknown"}
          </h2>
  
          {isLoadingData ? (
            <p>Loading data...</p>
          ) : documentData?.type === "order" ? (
            data.length > 0 ? (
              <ul className="space-y-0">
                {data.map((item) => (
                  <li key={item.id} className="py-4 border-b border-gray-300 last:border-b-0">
                    <p><span className="font-semibold">Order ID:</span> {item.id}</p>
                    <p><span className="font-semibold">Order Name:</span> {item.nameOrder}</p>
                    <p><span className="font-semibold">Start Date:</span> {new Date(item.startDate?.seconds * 1000).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Deadline:</span> {new Date(item.deadline?.seconds * 1000).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Days Until Deadline:</span> {item.daysUntilDeadline}</p>
                    <p><span className="font-semibold">Description:</span> {item.description}</p>
                    <p><span className="font-semibold">Paid:</span> {item.paid ? "Yes" : "No"}</p>
                    <p><span className="font-semibold">Total Cost:</span> ${item.totalCost}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found for this document's criteria.</p>
            )
          ) : documentData?.type === "product" ? (
            data.length > 0 ? (
              <ul className="space-y-0">
                {data.map((item, index) => (
                  <li
                  key={`${item.orderId}-${index}`}


                    className="py-4 border-b border-gray-300 last:border-b-0"
                  >
                    <p><span className="font-semibold">Document ID:</span> {item.orderId}</p>
                    <p><span className="font-semibold">Product ID:</span> {item.product?.productId}</p>
                    <p><span className="font-semibold">Name:</span> {item.product?.name}</p>
                    <p><span className="font-semibold">Description:</span> {item.product?.description}</p>
                    <p><span className="font-semibold">Categories:</span> {item.product?.categories?.join(", ") || "N/A"}</p>
                    <p><span className="font-semibold">Average Cost:</span> ${item.product?.averageCost}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products found for the selected criteria.</p>
            )
          ) : documentData?.type === "material" ? (
            data.length > 0 ? (
              <ul className="space-y-0">
                {data.map((item, index) => { 
                  console.log("Material Item:", item);
                  return (
                    <li
                      key={`${item.material?.materialId || 'unknown'}-${index}`}
                      className="py-4 border-b border-gray-300 last:border-b-0"
                    >
                      <p><span className="font-semibold">Material ID:</span> {item.material?.materialId}</p>
                      <p><span className="font-semibold">Name:</span> {item.material?.name}</p>
                      <p><span className="font-semibold">Description:</span> {item.material?.description}</p>
                      <p><span className="font-semibold">Total Cost:</span> ${item.material?.total}</p>
                      <p><span className="font-semibold">Shop:</span> {item.material?.shop}</p>
                      <p><span className="font-semibold">Quantity:</span> {item.material?.quantity}</p>
                      <p><span className="font-semibold">Color:</span> {item.material?.color}</p>
                      <p><span className="font-semibold">Categories:</span> {item.material?.categories?.join(", ") || "N/A"}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No materials found for the selected criteria.</p>
            )
          ) : (
            <p>Unknown document type.</p>
          )}
        </div>
  
        {/* Bottom Navigation */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          {/* Green Back Button (Bottom Left) */}
          <button
            onClick={handleGoBack}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Back
          </button>
  
          {/* Hamburger Menu */}
          <div className="absolute bottom-4 right-4">
            <Menu type="HamburgerMenu" style={{ width: '50px', height: '50px' }} />
            <Menu type="OnlySlideMenu" iconFirst="/link.png" />
          </div>
        </div>
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

const getCategoryDisplay = (doc) => {
  if (!doc?.queryParams || !doc?.type) return "Unknown Category";

  const { category, sortOrder, month, year, searchTerm, deadlineFilter } = doc.queryParams;
  const formatDate = (month, year) => {
    if (month && year) return `, ${month} ${year}`;
    if (month) return `, ${month}`;
    if (year) return `, ${year}`;
    return "";
  };
  const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);

  let displayText = "";

  switch (doc.type) {
    case "order":
      if (category === "cost") {
        const sortText = sortOrder === "desc" ? "Highest to Lowest Price" : "Lowest to Highest Price";
        displayText = `Orders by Cost: ${sortText}${formatDate(month, year)}`;
      } else if (category === "deadline") {
        const deadlineText =
          deadlineFilter === "past"
            ? "Past Due Deadline"
            : deadlineFilter === "upcoming"
            ? "Upcoming Deadline"
            : "All";
        displayText = `Orders by Deadline: ${deadlineText}`;
      } else if (["customerName", "description"].includes(category)) {
        displayText = `Orders by ${capitalize(category)}: ${searchTerm || "N/A"}${formatDate(month, year)}`;
      } else if (month || year) {
        displayText = `Orders by Period of Time: ${(month || '')}${year ? ` ${year}` : ''}`.trim();
      } else {
        displayText = "Orders";
      }
      break;

    case "product":
      displayText = "Products";
      if (["name", "id"].includes(category)) {
        displayText += ` by ${capitalize(category)}: ${searchTerm || "All"}${formatDate(month, year)}`;
      } else if (category === "cost") {
        const sortText = sortOrder === "desc" ? "Highest to Lowest Price" : "Lowest to Highest Price";
        displayText += ` by Cost: ${sortText}${formatDate(month, year)}`;
      } else if (category === "popularity") {
        displayText += ` by Popularity in Orders${formatDate(month, year)}`;
      } else if (searchTerm) {
        displayText = `Products by Category: ${capitalize(searchTerm)}${formatDate(month, year)}`;
      }
      break;

    case "material":
      displayText = "Materials";
      if (["name", "id", "color", "quantity"].includes(category)) {
        displayText += ` by ${capitalize(category)}: ${searchTerm || "All"}${formatDate(month, year)}`;
      } else if (category === "cost") {
        const sortText = sortOrder === "desc" ? "Highest to Lowest Price" : "Lowest to Highest Price";
        displayText += ` by Cost: ${sortText}${formatDate(month, year)}`;
      } else if (category === "popularity") {
        displayText += ` by Popularity in Orders${formatDate(month, year)}`;
      } else if (searchTerm) {
        displayText = `Materials by Category: ${capitalize(searchTerm)}${formatDate(month, year)}`;
      }
      break;

    default:
      return "Unknown Category";
  }

  return displayText;
};