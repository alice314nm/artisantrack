"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { db } from "@/app/[locale]/_utils/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  orderDoc,
} from "firebase/firestore";
import BlockHolder from "@/app/[locale]/components/block-holder";
import Header from "@/app/[locale]/components/header";
import NotLoggedWindow from "@/app/[locale]/components/not-logged-window";
import Menu from "@/app/[locale]/components/menu";

const monthNames = [
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

export default function DocumentDetailPage() {
  const t = useTranslations("DocumentsID");
  const { documentid } = useParams();
  const searchParams = useSearchParams();
  const { user } = useUserAuth();
  const [documentData, setDocumentData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const monthIndices = [
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

  useEffect(() => {
    document.title = t("documentDetailsTitle");
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

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

    // Handle date range: from startMonth to endMonth
    if (queryParams?.startMonth && queryParams?.endMonth && queryParams?.year) {
      const startMonthIndex = monthNames.indexOf(queryParams.startMonth);
      const endMonthIndex = monthNames.indexOf(queryParams.endMonth);

      if (startMonthIndex > 0 && endMonthIndex > 0) {
        // Create date range from startMonth to endMonth within the same year
        const startDate = new Date(
          parseInt(queryParams.year),
          startMonthIndex - 1,
          1
        );
        const endDate = new Date(
          parseInt(queryParams.year),
          endMonthIndex,
          0,
          23,
          59,
          59,
          999
        );

        console.log(
          `Fetching orders from ${startDate.toDateString()} to ${endDate.toDateString()}`
        );

        q = query(
          q,
          where("startDate", ">=", startDate),
          where("startDate", "<=", endDate)
        );
      }
    } else if (queryParams?.startMonth && queryParams?.year) {
      // Handle case where only startMonth is specified (single month)
      const monthIndex = monthNames.indexOf(queryParams.startMonth);
      if (monthIndex > 0) {
        const startOfMonth = new Date(
          parseInt(queryParams.year),
          monthIndex - 1,
          1
        );
        const endOfMonth = new Date(
          parseInt(queryParams.year),
          monthIndex,
          0,
          23,
          59,
          59,
          999
        );
        q = query(
          q,
          where("startDate", ">=", startOfMonth),
          where("startDate", "<=", endOfMonth)
        );
      }
    } else if (queryParams?.year) {
      // Fall back to full year if only year is specified
      const startOfYear = new Date(parseInt(queryParams.year), 0, 1);
      const endOfYear = new Date(
        parseInt(queryParams.year),
        11,
        31,
        23,
        59,
        59,
        999
      );
      q = query(
        q,
        where("startDate", ">=", startOfYear),
        where("startDate", "<=", endOfYear)
      );
    } else if (queryParams?.month) {
      const monthIndex = monthNames.indexOf(queryParams.month);
      if (monthIndex > 0) {
        const year = new Date().getFullYear();
        const startOfMonth = new Date(year, monthIndex - 1, 1);
        const endOfMonth = new Date(year, monthIndex, 0, 23, 59, 59, 999);
        q = query(
          q,
          where("startDate", ">=", startOfMonth),
          where("startDate", "<=", endOfMonth)
        );
      }
    }

    if (queryParams?.category === "cost") {
      // ... existing cost query logic
    } else if (queryParams?.category === "deadline") {
      const now = new Date();
      if (queryParams.deadlineFilter === "past") {
        q = query(q, where("deadline", "<", now), orderBy("deadline", "asc"));
      } else if (queryParams.deadlineFilter === "upcoming") {
        q = query(q, where("deadline", ">=", now), orderBy("deadline", "asc"));
      }
    } else if (
      queryParams?.category === "customerName" &&
      queryParams?.searchTerm
    ) {
      q = query(q, where("customerName", "==", queryParams.searchTerm));
    } else if (
      queryParams?.category === "description" &&
      queryParams?.searchTerm
    ) {
      q = query(q, where("description", "==", queryParams.searchTerm));
    }

    try {
      const querySnapshot = await getDocs(q);
      let fetchedOrders = [];

      // Process each order and fetch the associated product image
      for (const orderDoc of querySnapshot.docs) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() };

        // Check if the order has product references in orderImages
        if (orderData.orderImages && orderData.orderImages.length > 0) {
          // Get the first product ID from the orderImages array
          const productId = orderData.orderImages[0];

          try {
            // Fetch the product document to get the image
            const productDoc = await getDoc(
              doc(db, "users", user.uid, "products", productId)
            );

            if (productDoc.exists()) {
              const productData = productDoc.data();

              // Add the product image URL to the order data
              if (
                productData.productImages &&
                productData.productImages.length > 0 &&
                productData.productImages[0].url
              ) {
                orderData.imageUrl = productData.productImages[0].url;
                console.log(
                  `Found image for order ${orderData.id}: ${orderData.imageUrl}`
                );
              } else {
                console.log(`No productImages found for product ${productId}`);
                orderData.imageUrl = "/noImage.png";
              }
            } else {
              console.log(`Product ${productId} not found`);
              orderData.imageUrl = "/noImage.png";
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            orderData.imageUrl = "/noImage.png";
          }
        } else {
          console.log(`No orderImages array found for order ${orderData.id}`);
          orderData.imageUrl = "/noImage.png";
        }

        fetchedOrders.push(orderData);
      }

      if (queryParams?.category === "cost" && queryParams?.sortOrder) {
        fetchedOrders.sort((a, b) => {
          const costA = parseFloat(a.totalCost);
          const costB = parseFloat(b.totalCost);
          if (
            queryParams.sortOrder === "desc" ||
            queryParams.sortOrder === "highest"
          ) {
            return costB - costA;
          } else if (
            queryParams.sortOrder === "asc" ||
            queryParams.sortOrder === "lowest"
          ) {
            return costA - costB;
          }
          return 0;
        });
      }

      console.log("Fetched Orders with Images:", fetchedOrders);
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

    setIsLoadingData(true);
    const ordersCollection = collection(db, "users", user.uid, "orders");
    let ordersQuery = query(ordersCollection);

    // 🗓️ Apply date filtering to orders
    if (queryParams?.startMonth && queryParams?.endMonth && queryParams?.year) {
      const startMonthIndex = monthNames.indexOf(queryParams.startMonth);
      const endMonthIndex = monthNames.indexOf(queryParams.endMonth);

      if (startMonthIndex > 0 && endMonthIndex > 0) {
        const startDate = new Date(
          parseInt(queryParams.year),
          startMonthIndex - 1,
          1
        );
        const endDate = new Date(
          parseInt(queryParams.year),
          endMonthIndex,
          0,
          23,
          59,
          59,
          999
        );

        console.log(
          `Fetching products from ${startDate.toDateString()} to ${endDate.toDateString()}`
        );

        ordersQuery = query(
          ordersQuery,
          where("startDate", ">=", startDate),
          where("startDate", "<=", endDate)
        );
      }
    } else if (queryParams?.startMonth && queryParams?.year) {
      // Single month case
      const monthIndex = monthNames.indexOf(queryParams.startMonth);
      if (monthIndex > 0) {
        const startOfMonth = new Date(
          parseInt(queryParams.year),
          monthIndex - 1,
          1
        );
        const endOfMonth = new Date(
          parseInt(queryParams.year),
          monthIndex,
          0,
          23,
          59,
          59,
          999
        );
        ordersQuery = query(
          ordersQuery,
          where("startDate", ">=", startOfMonth),
          where("startDate", "<=", endOfMonth)
        );
      }
    } else if (queryParams?.year) {
      // Year only case
      const startOfYear = new Date(parseInt(queryParams.year), 0, 1);
      const endOfYear = new Date(
        parseInt(queryParams.year),
        11,
        31,
        23,
        59,
        59,
        999
      );
      ordersQuery = query(
        ordersQuery,
        where("startDate", ">=", startOfYear),
        where("startDate", "<=", endOfYear)
      );
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
          (pid) => productCountMap[pid] === maxCount
        );

        console.log("Most popular product IDs:", mostPopularProductIds);

        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = orderDoc.data();
          const pid = orderData?.productId;

          if (pid && mostPopularProductIds.includes(pid)) {
            const productDoc = await getDoc(doc(productsCollection, pid));
            if (productDoc.exists()) {
              const product = { id: productDoc.id, ...productDoc.data() };
              fetchedData.push({
                orderId: orderDoc.id,
                product,
                productId: pid,
              });
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
              if (
                product.name
                  ?.toLowerCase()
                  .includes(queryParams.searchTerm.toLowerCase())
              ) {
                fetchedData.push({
                  orderId: orderDoc.id,
                  product,
                  productId: pid,
                });
              }
            } else if (
              queryParams.category === "id" &&
              queryParams.searchTerm
            ) {
              if (
                (product.productId || product.id) === queryParams.searchTerm
              ) {
                fetchedData.push({
                  orderId: orderDoc.id,
                  product,
                  productId: pid,
                });
              }
            } else if (
              queryParams.category === "categories" &&
              queryParams.searchTerm
            ) {
              const searchCategory = queryParams.searchTerm
                .toLowerCase()
                .trim();
              const productCategories = product.categories || [];

              if (
                Array.isArray(productCategories) &&
                productCategories.some(
                  (cat) =>
                    typeof cat === "string" &&
                    cat.toLowerCase().trim() === searchCategory
                )
              ) {
                fetchedData.push({
                  orderId: orderDoc.id,
                  product,
                  productId: pid,
                });
              }
            } else {
              fetchedData.push({
                orderId: orderDoc.id,
                product,
                productId: pid,
              });
            }
          }
        }
      }

      if (queryParams?.category === "cost" && queryParams?.sortOrder) {
        fetchedData.sort((a, b) => {
          const costA = parseFloat(a.product?.averageCost);
          const costB = parseFloat(b.product?.averageCost);
          return queryParams.sortOrder === "desc"
            ? costB - costA
            : costA - costB;
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
        if (
          material.categories &&
          Array.isArray(material.categories) &&
          material.categories.length > 0
        ) {
          displayCategory = material.categories.join(", ");
        }

        console.log("Material:", material);
        console.log("Categories:", material.categories);

        if (queryParams.category === "name" && queryParams.searchTerm) {
          if (
            material.name
              ?.toLowerCase()
              .includes(queryParams.searchTerm.toLowerCase())
          ) {
            fetchedData.push({ material, category: displayCategory });
          }
        } else if (queryParams.category === "id" && queryParams.searchTerm) {
          if ((material.materialId || material.id) === queryParams.searchTerm) {
            fetchedData.push({ material, category: displayCategory });
          }
        } else if (
          queryParams.category === "categories" &&
          queryParams.searchTerm
        ) {
          if (
            Array.isArray(material.categories) &&
            material.categories.length > 0 &&
            material.categories.some(
              (cat) =>
                cat.toLowerCase() === queryParams.searchTerm.toLowerCase()
            )
          ) {
          }
        } else if (
          queryParams.category === "quantity" &&
          queryParams.searchTerm
        ) {
          if (String(material.quantity) === queryParams.searchTerm) {
            fetchedData.push({ material, category: displayCategory });
          }
        } else if (queryParams.category === "color" && queryParams.searchTerm) {
          if (
            material.color
              ?.toLowerCase()
              .includes(queryParams.searchTerm.toLowerCase())
          ) {
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
          return queryParams.sortOrder === "desc"
            ? costB - costA
            : costA - costB;
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

  const getCategoryDisplay = (doc) => {
    if (!doc?.queryParams || !doc?.type) return t("unknownCategory");

    const {
      category,
      sortOrder,
      startMonth,
      endMonth,
      year,
      month,
      searchTerm,
      deadlineFilter,
    } = doc.queryParams;

    // Format date range display
    const formatDateRange = (startMonth, endMonth, year) => {
      if (startMonth && endMonth && year) {
        const startMonthLower = startMonth.toLowerCase();
        const endMonthLower = endMonth.toLowerCase();

        const translatedStartMonth = t(
          `months.${monthIndices.indexOf(startMonthLower)}`
        );
        const translatedEndMonth = t(
          `months.${monthIndices.indexOf(endMonthLower)}`
        );

        if (startMonth === endMonth) {
          return `, ${translatedStartMonth} ${year}`;
        }
        return `, ${translatedStartMonth} ${t(
          "to"
        )} ${translatedEndMonth} ${year}`;
      }
      if (startMonth && year) {
        const translatedMonth = t(
          `months.${monthIndices.indexOf(startMonth.toLowerCase())}`
        );
        return `, ${translatedMonth} ${year}`;
      }
      if (endMonth && year) {
        const translatedMonth = t(
          `months.${monthIndices.indexOf(endMonth.toLowerCase())}`
        );
        return `, ${translatedMonth} ${year}`;
      }
      if (year) return `, ${year}`;
      return "";
    };

    // For backward compatibility with older documents
    const formatLegacyDate = (month, year) => {
      if (month && year) {
        const translatedMonth = t(
          `months.${monthIndices.indexOf(month.toLowerCase())}`
        );
        return `, ${translatedMonth} ${year}`;
      }
      if (month) {
        const translatedMonth = t(
          `months.${monthIndices.indexOf(month.toLowerCase())}`
        );
        return `, ${translatedMonth}`;
      }
      if (year) return `, ${year}`;
      return "";
    };

    const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);

    let displayText = "";

    switch (doc.type) {
      case "order":
        if (category === "cost") {
          const sortText =
            sortOrder === "desc"
              ? t("highestToLowestPrice")
              : t("lowestToHighestPrice");
          displayText = `${t("ordersByCost")}: ${sortText}${formatDateRange(
            startMonth,
            endMonth,
            year
          )}`;
        } else if (category === "deadline") {
          let deadlineText;
          if (deadlineFilter === "past") {
            deadlineText = t("pastDueDeadline");
          } else if (deadlineFilter === "upcoming") {
            deadlineText = t("upcomingDeadline");
          } else {
            deadlineText = t("all");
          }

          displayText = `${t(
            "ordersByDeadline"
          )}: ${deadlineText}${formatDateRange(startMonth, endMonth, year)}`;
        } else if (["customerName", "description"].includes(category)) {
          // Translate the category name
          const categoryTranslation =
            category === "customerName" ? t("customerName") : t("description");

          displayText = `${t("ordersBy")} ${categoryTranslation}: ${
            searchTerm || t("notAvailable")
          }${formatDateRange(startMonth, endMonth, year)}`;
        } else if (startMonth || endMonth || year) {
          // Time period display
          if (startMonth === endMonth) {
            const translatedMonth = startMonth
              ? t(`months.${monthIndices.indexOf(startMonth.toLowerCase())}`)
              : "";
            displayText = `${t("ordersFor")} ${translatedMonth} ${
              year || ""
            }`.trim();
          } else {
            const translatedStartMonth = startMonth
              ? t(`months.${monthIndices.indexOf(startMonth.toLowerCase())}`)
              : "";
            const translatedEndMonth = endMonth
              ? t(`months.${monthIndices.indexOf(endMonth.toLowerCase())}`)
              : "";

            displayText = `${t("ordersFrom")} ${translatedStartMonth} ${t(
              "to"
            )} ${translatedEndMonth} ${year || ""}`.trim();
          }
        } else {
          displayText = t("orders");
        }
        break;

      case "product":
        displayText = t("products");
        // Similar translation patterns for products...
        break;

      case "material":
        displayText = t("materials");
        // Similar translation patterns for materials...
        break;

      default:
        return t("unknownCategory");
    }

    return displayText;
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
      <div className="flex flex-col min-h-screen gap-4 relative pb-20">
        <Header title={t("documentsTitle")} showUserName={true} />

        {/* Loading / Document Header */}
        <div className="mx-4 mt-4">
          {isLoadingDocument ? (
            <h2 className="text-lg font-semibold mb-2">
              {t("loadingDocumentDetails")}
            </h2>
          ) : documentData ? (
            <h2 className="text-lg font-semibold mb-2">
              {getCategoryDisplay(documentData)}
            </h2>
          ) : (
            <h2 className="text-lg font-semibold mb-2">
              {t("documentNotFound")}
            </h2>
          )}
        </div>

        {/* Document Content */}
        <div className="mx-4 pb-24">
          <h2 className="text-xl font-semibold mb-4">
            {documentData?.type === "order"
              ? t("orders")
              : documentData?.type === "product"
              ? t("products")
              : documentData?.type === "material"
              ? t("materials")
              : t("unknown")}
          </h2>

          {isLoadingData ? (
            <p>{t("loadingData")}</p>
          ) : documentData?.type === "order" ? (
            data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((item) => {
                  const imageUrl = item.imageUrl || "/noImage.png";
                  const daysRemaining = item.daysUntilDeadline || 0;

                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <BlockHolder
                        id={item.id}
                        title={item.nameOrder || t("unnamedOrder")}
                        category={item.category || t("notAvailable")}
                        client={item.customerName || t("notAvailable")}
                        deadline={[
                          new Date(
                            item.deadline?.seconds * 1000
                          ).toLocaleDateString(),
                          "",
                          `${daysRemaining} ${t("daysRemaining")}`,
                        ]}
                        total={item.totalCost || "0"}
                        currency="$"
                        imageSource={imageUrl}
                        type="order"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>{t("noOrdersFound")}</p>
            )
          ) : documentData?.type === "product" ? (
            data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((item, index) => {
                  const productImages = item.product?.productImages || [];
                  const imageUrl =
                    productImages.length > 0 && productImages[0].url
                      ? productImages[0].url
                      : "/noImage.png";

                  return (
                    <div
                      key={`${item.orderId}-${index}`}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <BlockHolder
                        id={item.product?.productId || item.productId}
                        title={item.product?.name || t("unnamedProduct")}
                        category={
                          item.product?.categories &&
                          item.product.categories.length > 0
                            ? item.product.categories[0]
                            : t("notAvailable")
                        }
                        total={item.product?.averageCost || "0"}
                        currency="$"
                        imageSource={imageUrl}
                        type="product"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>{t("noProductsFound")}</p>
            )
          ) : documentData?.type === "material" ? (
            data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((item, index) => {
                  const materialImages = item.material?.images || [];
                  const imageUrl =
                    materialImages.length > 0 && materialImages[0]?.url
                      ? materialImages[0].url
                      : "/noImage.png";

                  return (
                    <div
                      key={`${item.material?.materialId || "unknown"}-${index}`}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <BlockHolder
                        id={item.material?.materialId || item.material?.id}
                        title={item.material?.name || t("unnamedMaterial")}
                        category={item.category || t("notAvailable")}
                        quantity={item.material?.quantity || "0"}
                        color={item.material?.color || t("notAvailable")}
                        total={item.material?.total || "0"}
                        currency="$"
                        imageSource={imageUrl}
                        type="material"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>{t("noMaterialsFound")}</p>
            )
          ) : (
            <p>{t("unknownDocumentType")}</p>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          {/* Green Back Button (Bottom Left) */}
          <button
            onClick={handleGoBack}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {t("back")}
          </button>

          {/* Hamburger Menu */}
          <div className="absolute bottom-4 right-4">
            <Menu
              type="HamburgerMenu"
              style={{ width: "50px", height: "50px" }}
            />
            <Menu type="OnlySlideMenu" iconFirst="/link.png" />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title={t("appTitle")} />
        <NotLoggedWindow />
      </div>
    );
  }
}
