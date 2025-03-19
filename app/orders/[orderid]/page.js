"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  dbDeleteOrderById,
  dbGetOrderById,
  toggleOrderCompleted,
  toggleOrderPaid,
} from "@/app/_services/order-service";
import MaterialOrderDisplay from "@/app/components/material-order-display";

export default function OrderPageID() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [orders, setOrders] = useState([]);
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
    const formattedDate = `${
      monthNames[deadlineDate.getMonth()]
    } ${deadlineDate.getDate()}, ${deadlineDate.getFullYear()}`;
    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? `(${diffTime} days)` : "(Due today)";

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
          <Header title="Order" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between items-center">
              <p
                className="font-bold text-xl text-blackBeige"
                data-id="Your view"
              >
                Your View
              </p>
              <Link href="/orders">
                <button className={commonClasses.headerButton}>
                  <img src="/arrow-left.png" width={20} alt="Back" />
                  <p>Back</p>
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
                  <button className=" relative bg-green rounded-md w-[70%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0">
                    <p>Create receipt</p>
                    <img src="/receipt.png" alt="Pencil" className="w-5" />
                  </button>
                  <button
                    className="relative bg-green rounded-md w-[28%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0"
                    onClick={() =>
                      (window.location.href = `/orders/${id}/edit`)
                    }
                  >
                    <p>Edit</p>
                    <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                  </button>
                </div>

                <p className="text-2xl font-bold text-blackBeige">
                  {selectedOrder.nameOrder} <br />
                  Deadline:{" "}
                  {selectedOrder.deadline?.seconds
                    ? formatDeadline(selectedOrder.deadline.seconds)
                    : "No deadline"}
                </p>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Client:</p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.customerName || "No set client."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Description:</p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.description || "No set description."}
                  </p>
                </div>

                {/* <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Materials:</p>
                  <p className={commonClasses.sectionText}>
                    {Array.isArray(selectedOrder?.categories) && selectedMaterial.categories.length > 0
                      ? selectedMaterial.categories.join(", ")
                      : "No set categories"}
                  </p>
                </div> */}

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Materials:</p>

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
                    Material cost: ${selectedOrder.materialsCost}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Total:</p>
                  <p className={commonClasses.sectionText}>
                    {selectedOrder.totalCost || "No set total."}
                  </p>
                </div>

                <div className="flex flex-row float-right gap-1 justify-between font-bold">
                  <button
                    data-id="delete-button"
                    className="hover:arrow text-sm bg-red w-[25%] h text-white rounded-md"
                    onClick={openCloseConfirmation}
                  >
                    Delete
                  </button>
                  <button
                    className={`${
                      paid ? "bg-darkYellow text-white" : "bg-yellow"
                    } text-sm py-1 rounded-md w-[60%]`}
                    onClick={togglePaid}
                  >
                    {paid ? "Set as unpaid" : "Set as Paid"}
                  </button>
                  <button
                    className={`${
                      completed ? "bg-darkYellow text-white" : "bg-yellow"
                    } text-sm py-1 rounded-md w-[60%]`}
                    onClick={toggleCompleted}
                  >
                    {completed ? "Set as Incomplete" : "Set as Completed"}
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
            type="TwoButtonsMenu"
            iconFirst="/link.png"
            iconSecond="/eye.png"
            firstTitle="Copy for client"
            secondTitle="View for client"
            onSecondFunction={changeView}
          />
        </div>
      );
    }

    // View for unlogged users
    else {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Order" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
              <Link href="/orders">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img src="/wool.png" alt="Sweater" className="rounded-xl" />

              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xl">testNameOrder | deadline: 1 Jan, 2025</p>

              <div>
                <p>Client name:</p>
                <p>Alex Smith</p>
              </div>

              <div>
                <p>Description</p>
                <p>Address, phone, measurements shoulder shoulder</p>
              </div>

              <div>
                <p>Materials</p>
                <ul className="list-decimal px-6">
                  <li>wool id123456 - 400g</li>
                  <li>wool id123456 - 100g</li>
                </ul>
              </div>

              <p>
                Total cost: 140$
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>

              <p>
                Prepayment: 70$
                {/* {filteredProducts.length > 0
                  ? filteredProducts[0].total
                  : "Product not found"}$ */}
              </p>
            </div>
          </div>

          <Menu
            type="TwoButtonsMenu"
            iconFirst="/link.png"
            iconSecond="/eye-crossed.png"
            firstTitle="Copy for client"
            secondTitle="Default View"
            onSecondFunction={changeView}
          />
        </div>
      );
    }
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />

        <div className="mx-4 flex flex-col gap-4 pb-24">
          <div className="flex flex-col gap-2">
            <img src="/wool.png" alt="Sweater" className="rounded-xl" />

            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xl">testNameOrder | deadline: 1 Jan, 2025</p>

            <div>
              <p>Client name:</p>
              <p>Alex Smith</p>
            </div>

            <div>
              <p>Description</p>
              <p>Address, phone, measurements shoulder shoulder</p>
            </div>

            <div>
              <p>Materials</p>
              <ul className="list-decimal px-6">
                <li>wool id123456 - 400g</li>
                <li>wool id123456 - 100g</li>
              </ul>
            </div>

            <p>Total cost: 140$</p>

            <p>Prepayment: 70$</p>
          </div>
        </div>
      </div>
    );
  }
}
