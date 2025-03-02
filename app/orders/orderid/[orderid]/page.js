"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { app } from "@/app/_utils/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

export default function OrderPageID() {
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [orders, setOrders] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [clientView, setClientView] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const params = useParams();
  const id = params.orderid;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const ordersCollection = collection(db, `users/${user.uid}/orders`);
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(ordersData);

        for (let order of ordersData) {
          if (order.orderImages && order.orderImages.length > 0) {
            const productImages = await Promise.all(
              order.orderImages.map(async (productId) => {
                const productRef = doc(
                  db,
                  `users/${user.uid}/products/${productId}`
                );
                const productSnapshot = await getDoc(productRef);
                const productData = productSnapshot.data();

                order.orderId = productData?.productId;
                return productData?.productImages?.[0]?.url || "Unknown";
              })
            );
            order.imageUrl = productImages[0];
          } else {
            order.imageUrl = "Unknown";
          }

          if (order.customerId) {
            const customerRef = doc(
              db,
              `users/${user.uid}/customers/${order.customerId}`
            );
            const customerSnapshot = await getDoc(customerRef);
            const customerData = customerSnapshot.data();
            order.customerId = customerData?.nameCustomer || "Unknown";
            console.log(order.customerId);
          } else {
            order.customerId = "Unknown";
          }
        }

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const singleOrder = [...orders];
  const orderId = singleOrder.filter((order) => order.id == id);
  const selectedOrder = orderId[0];
  const [mainImage, setMainImage] = useState(null);

  const toggleConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
  };

  const openConfirmation = () => {
    setConfirmWindowVisibility(true);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
  };

  //   const handleApplyFilters = (selectedFilters) => {
  //     setFilters(selectedFilters);
  //   };

  //   let filteredOrders = [...orders];
  //   if (filters.Categories?.length > 0) {
  //     filteredOrders = filteredOrders.filter(
  //       (order) =>
  //         Array.isArray(order.categories) &&
  //         order.categories.some((category) =>
  //           filters.Categories.includes(category)
  //         )
  //     );
  //   }

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

  //   if (searchTerm) {
  //     filteredOrders = filteredOrders.filter(
  //       (order) =>
  //         order.name &&
  //         order.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

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
            <div className="flex flex-row justify-between">
              <p className="font-bold">Your view:</p>
              <Link href="/orders">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            {/* <div className="flex flex-col gap-2">
              <img
                src={selectedOrder.imageUrl}
                alt="Product Image for Order"
                className="rounded-xl"
              />

              <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
                <SmallBlockHolder type="plainPicture" imageSource="/wool.png" />
              </div>
            </div> */}

            <div className="flex flex-col gap-2">
              <img
                src={selectedOrder.imageUrl || "/noImage.png"}
                alt="Order Image"
                className={`rounded-xl object-cover h-96 transition-all duration-300 ${
                  transitioning
                    ? "opacity-0 translate-y-1"
                    : "opacity-100 translate-y-0"
                }`}
              />

              {selectedOrder?.images?.length > 0 && (
                <div className="flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin">
                  {selectedOrder.orderImages.map((image, index) => (
                    <SmallBlockHolder
                      key={index}
                      type="plainPicture"
                      imageSource={image.url}
                      onButtonFunction={() => handleImageChange(image)}
                      mainStatus={mainImage === imageUrl}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <button className=" relative bg-green rounded-2xl w-[70%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Create receipt</p>
                  <img src="/receipt.png" alt="Pencil" className="w-5" />
                </button>
                <button className="relative bg-green rounded-2xl w-[28%] py-1 font-bold flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>

              <p className="text-xl">
                {selectedOrder.nameOrder} | Deadline:{" "}
                {selectedOrder.deadline?.seconds
                  ? formatDeadline(selectedOrder.deadline.seconds)
                  : "No deadline"}
              </p>

              <p>Category: testCategory, testCategory2</p>

              <div>
                <p>Pattern Description</p>
                <p>{selectedOrder.description}</p>
              </div>

              <div>
                <p>Client ID:</p>
                <p>{selectedOrder.customerId}</p>
              </div>

              <div>
                <p>Description</p>
                <p>{selectedOrder.description}</p>
              </div>

              <div>
                <p>Materials</p>

                <ul className="list-decimal px-6">
                  {/*<li>wool id123456 - 100g</li>*/}
                  {selectedOrder.materialIds.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
                <br></br>
                <p>Material cost: ${selectedOrder.materialsCost}</p>
              </div>

              <p>
                Total cost: ${selectedOrder.totalCost} {selectedOrder.currency}
              </p>

              <p>Total with tax {user.tax}: 134.4$</p>

              <p>Prepayment: 70$</p>

              <div className="flex flex-row float-right gap-1 justify-between font-bold">
                <button
                  className="hover:arrow bg-red w-[17%] h text-white rounded-xl"
                  onClick={openConfirmation}
                >
                  Delete
                </button>
                <button className="bg-yellow px-3 py-1 rounded-xl">
                  Set as paid
                </button>
                <button className="bg-yellow px-1 py-1 rounded-xl  w-[50%]">
                  Set as completed
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={closeConfirmation}
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
              <p className="font-bold">Client view:</p>
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
