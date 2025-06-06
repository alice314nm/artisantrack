"use client";

import { useTranslations } from "next-intl";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import ConfirmationWindow from "@/app/[locale]/components/confirmation-window";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import SmallBlockHolder from "@/app/[locale]/components/small-block-holder";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  dbDeleteOrderById,
  dbGetOrderById,
  toggleOrderCompleted,
  toggleOrderPaid,
} from "@/app/[locale]/_services/order-service";
import MaterialOrderDisplay from "@/app/[locale]/components/material-order-display";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderPageID() {
  const t = useTranslations("OrderPageID");
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [clientView, setClientView] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const params = useParams();
  const id = params.orderid;
  const [selectedOrder, setSelectedOrder] = useState({});
  const [mainImage, setMainImage] = useState(null);

  const [paid, setPaid] = useState(false);
  const [completed, setCompleted] = useState(false);

  const commonClasses = {
    container: "flex flex-col min-h-screen gap-4 bg-lightBeige",
    headerButton:
      "font-bold bg-green rounded-md px-4 py-2 flex gap-2 flex-row justify-center items-center hover:bg-darkGreen transition-colors duration-300",
    mainImage: "rounded-md object-cover w-full transition-all duration-300",
    thumbnailContainer:
      "flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin",
    productDetails: "flex flex-col gap-4",
    sectionTitle: "text-lg font-semibold ",
    sectionText: "",
    editButton:
      "py-2 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0 hover:bg-darkGreen transition-colors duration-300",
    deleteButton:
      "bg-red text-white rounded-md w-32 py-2 hover:bg-darkRed transition-colors duration-300",
  };

  useEffect(() => {
    document.title = selectedOrder.nameOrder || "Loading...";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [selectedOrder]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user && id) {
      dbGetOrderById(user.uid, id, setSelectedOrder);
    }
  }, [user, id]);

  const openCloseConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
  };

  useEffect(() => {
    setPaid(selectedOrder.paid);
    setCompleted(selectedOrder.completed);

    if (selectedOrder?.productForOrderData?.productImages?.length) {
      setMainImage(selectedOrder.productForOrderData.productImages[0].url);
    }
  }, [selectedOrder]);

  const togglePaid = async () => {
    try {
      const newPaidStatus = await toggleOrderPaid(user.uid, id, paid);
      setPaid(newPaidStatus);
    } catch (error) {
      console.error("Failed to toggle paid status:", error);
    }
  };

  const toggleCompleted = async () => {
    try {
      const newCompletedStatus = await toggleOrderCompleted(
        user.uid,
        id,
        completed
      );
      setCompleted(newCompletedStatus);
    } catch (error) {
      console.error("Failed to toggle completed status:", error);
    }
  };

  const formatDeadline = (timestamp) => {
    const deadlineDate = new Date(timestamp * 1000);
    const today = new Date();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = monthNames[deadlineDate.getMonth()];
    // Now accessing month translations under OrderPageID.months
    const translatedMonth = t(`months.${month}`);

    const formattedDate = `${translatedMonth} ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;
    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft =
      diffTime > 0 ? t("daysLeft", { days: diffTime }) : t("dueToday");

    return `${formattedDate}`;
  };

  const handleDeleteOrder = async (e) => {
    setLoading(true);
    try {
      await dbDeleteOrderById(user.uid, id);
      console.log("Order deleted successfully");
      window.location.href = "/orders";
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const handleImageChange = (image) => {
    if (mainImage === image.url || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setMainImage(image.url);
      setTransitioning(false);
    }, 300);
  };

  console.log("data:", selectedOrder);

  const handleDownloadReceipt = () => {
    if (!selectedOrder) return;

    // Create a new PDF document with explicit encoding
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      hotfixes: ["px_scaling"], // Add hotfixes for scaling issues
    });

    // Add support for UTF-8 encoding
    doc.addFont("helvetica", "normal");
    doc.addFont("helvetica", "bold");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t("createReceipt"), 105, 20, { align: "center" });

    // Order Info - Use regular font
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Break up strings into shorter segments for better handling
    const orderInfo = [
      `${t("orderID")}: ${id}`,
      `${t("client")}: ${selectedOrder.customerName || t("noClient")}`,
      `${t("deadline")}: ${
        selectedOrder.deadline?.seconds
          ? formatDeadline(selectedOrder.deadline.seconds)
          : t("noDeadline")
      }`,
      `${t("description")}: ${selectedOrder.description || t("noDescription")}`,
    ];

    // Print each line separately
    let yPosition = 40;
    orderInfo.forEach((line) => {
      doc.text(line, 15, yPosition);
      yPosition += 10;
    });

    // First Table: Materials
    autoTable(doc, {
      startY: 80,
      head: [[t("material"), t("quantity"), t("price")]],
      body: selectedOrder?.materialsForOrderData?.map((material, index) => [
        material.materialName,
        selectedOrder.quantities[index]?.quantity || t("noQuantity"),
        `$${selectedOrder.materialsCost || t("noCost")}`,
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
      columnStyles: {
        2: { cellWidth: 40 },
      },
    });

    // Get Y position after first table
    const afterMaterialTableY = doc.lastAutoTable.finalY + 10;

    // Second Table: Products
    autoTable(doc, {
      startY: afterMaterialTableY,
      head: [[t("product"), t("price")]],
      body: [
        [
          selectedOrder.productForOrderData.productName || t("noProduct"),
          `$${selectedOrder.productCost || t("noCost")}`,
        ],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
      columnStyles: {
        1: { cellWidth: 40 },
      },
    });

    const afterProductTableY = doc.lastAutoTable.finalY + 10;

    // Third Table: Work Cost
    autoTable(doc, {
      startY: afterProductTableY,
      head: [[t("workCost")]],
      body: [[`$${selectedOrder.workCost || t("noCost")}`]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
    });

    // Get Y position after second table
    const afterWorkCostTableY = doc.lastAutoTable.finalY + 10;

    // Display the total cost formula in the desired format
    doc.setFont("helvetica", "bold");
    const totalText = `${t("totalCost")} = $${selectedOrder.materialsCost} + $${
      selectedOrder.productCost
    } + $${selectedOrder.workCost} = $${selectedOrder.totalCost}`;
    doc.text(totalText, 15, afterWorkCostTableY);

    // Download the PDF
    doc.save(`${t("receipt")}_${id}.pdf`);
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
    if (!clientView) {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title={t("title")} showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between items-center">
              <Link href="/orders">
                <button className={commonClasses.headerButton}>
                  <img src="/arrow-left.png" width={20} alt="Back" />
                  <p>{t("back")}</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-4 md:w-1/2">
                <img
                  src={mainImage || "/noImage.png"}
                  alt="Product Image"
                  className={`${commonClasses.mainImage} ${
                    transitioning
                      ? "opacity-0 translate-y-1"
                      : "opacity-100 translate-y-0"
                  }`}
                />

                {selectedOrder?.productForOrderData?.productImages?.length >
                  0 && (
                  <div className={commonClasses.thumbnailContainer}>
                    {selectedOrder.productForOrderData.productImages.map(
                      (image, index) => (
                        <SmallBlockHolder
                          key={index}
                          type="plainPicture"
                          imageSource={image.url}
                          onButtonFunction={() => handleImageChange(image)}
                          mainStatus={mainImage === image.url}
                        />
                      )
                    )}
                    {selectedOrder.productForOrderData.patternImages.map(
                      (image, index) => (
                        <SmallBlockHolder
                          key={index}
                          type="plainPicture"
                          imageSource={image.url}
                          onButtonFunction={() => handleImageChange(image)}
                          mainStatus={mainImage === image.url}
                        />
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <button
                    onClick={handleDownloadReceipt}
                    className="hover:bg-darkGreen relative bg-green rounded-md w-[70%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0"
                  >
                    <p>{t("createReceipt")}</p>
                    <img src="/receipt.png" alt="Pencil" className="w-5" />
                  </button>
                </div>

                <p className="text-2xl font-bold text-blackBeige">
                  {selectedOrder.nameOrder} <br />
                  {t("deadline")}{" "}
                  {selectedOrder.deadline?.seconds
                    ? formatDeadline(selectedOrder.deadline.seconds)
                    : t("noDeadline")}
                </p>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>{t("client")}</p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.customerName || t("noClient")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>
                    {t("description")}
                  </p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.description || t("noDescription")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>{t("materials")}</p>

                  {selectedOrder?.materialsForOrderData?.map(
                    (material, index) => (
                      <MaterialOrderDisplay
                        key={index}
                        index={index + 1}
                        id={material.materialId}
                        name={material.materialName}
                        quantity={selectedOrder.quantities[index].quantity}
                        imageSrc={material.materialImage.url || "/noImage.png"}
                      />
                    )
                  )}

                  <p className={commonClasses.sectionText}>
                    {t("materialCost", { cost: selectedOrder.materialsCost })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>{t("total")}</p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.totalCost || t("noTotal")}
                  </p>
                </div>

                <div className="flex flex-row float-right gap-1 justify-between font-bold">
                  <button
                    className={`${
                      paid ? "bg-darkYellow text-white" : "bg-yellow"
                    } text-sm py-1 rounded-md w-[50%]`}
                    onClick={togglePaid}
                  >
                    {paid ? t("setUnpaid") : t("setPaid")}
                  </button>
                  <button
                    className={`${
                      completed ? "bg-darkYellow text-white" : "bg-yellow"
                    } text-sm py-1 rounded-md w-[50%]`}
                    onClick={toggleCompleted}
                  >
                    {completed ? t("setIncomplete") : t("setCompleted")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={openCloseConfirmation}
            onDelete={handleDeleteOrder}
          />

          <Menu
            type="TwoButtonsMenuId"
            iconSecond="/Pencil.png"
            firstTitle={t("delete")}
            secondTitle={t("edit")}
            onFirstFunction={openCloseConfirmation}
            onSecondFunction={() => (window.location.href = `/orders/${id}/edit`)}
          />
        </div>
      );
    }

    // View for unlogged users
    // else {
    //   return (
    //     <div className="flex flex-col min-h-screen gap-4">
    //       <Header title={t("title")} showUserName={true} />

    //       <div className="mx-4 flex flex-col gap-4 pb-24">
    //         <div className="flex flex-row justify-between">
    //           <p className="font-bold" data-id="Client view">
    //             {t("clientView")}
    //           </p>
    //           <Link href="/orders">
    //             <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
    //               <img src="/arrow-left.png" width={20} />
    //               <p>{t("back")}</p>
    //             </button>
    //           </Link>
    //         </div>

    //         <div className="flex flex-col gap-2">
    //           <img src="/wool.png" alt="Sweater" className="rounded-xl" />

    //           <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
    //             <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
    //             <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
    //             <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
    //             <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
    //           </div>
    //         </div>

    //         <div className="flex flex-col gap-2">
    //           <p className="text-xl">
    //             testNameOrder | {t("deadline")} 1 Jan, 2025
    //           </p>

    //           <div>
    //             <p>{t("client")}</p>
    //             <p>Alex Smith</p>
    //           </div>

    //           <div>
    //             <p>{t("description")}</p>
    //             <p>Address, phone, measurements shoulder shoulder</p>
    //           </div>

    //           <div>
    //             <p>{t("materials")}</p>
    //             <ul className="list-decimal px-6">
    //               <li>wool id123456 - 400g</li>
    //               <li>wool id123456 - 100g</li>
    //             </ul>
    //           </div>

    //           <p>{t("total")} 140$</p>

    //           <p>{t("prepayment", { amount: 70 })}</p>
    //         </div>
    //       </div>

    //       <Menu
    //         type="TwoButtonsMenu"
    //         iconFirst="/link.png"
    //         iconSecond="/eye-crossed.png"
    //         firstTitle={t("copyForClient")}
    //         secondTitle={t("defaultView")}
    //         onSecondFunction={changeView}
    //       />
    //     </div>
    //   );
    // }
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />
        <NotLoggedWindow />
      </div>
    );
  }
}
