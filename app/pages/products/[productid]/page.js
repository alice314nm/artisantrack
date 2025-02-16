"use client";

import { app } from "@/app/_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";

export default function ProductPage() {
  const { user } = useUserAuth();
  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [clientView, setClientView] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.productid;

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

        const productsWithImages = await Promise.all(
          productsData.map(async (product) => {
            const imageUrls = product.images?.map((image) => image.url) || [];
            
            return {
              ...product,
              images: imageUrls,
            };
          })
        );

        setProducts(productsWithImages);
        console.log(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const deleteProduct = async () => {
    const db = getFirestore();
    const productRef = doc(db, "users", user.uid, "products", productId[0].id);
  
    try {
      const storage = getStorage();
      const imagesToDelete = productId[0].images || [];
  
      await Promise.all(
        imagesToDelete.map(async (image) => {
          if (!image.url) {
            console.log("Image URL is undefined or missing", image);
            return; // Skip deletion if the URL is invalid
          }
          // Create a reference to the image in Firebase Storage
          const imageRef = ref(storage, `images/${user.uid}/${image.url}`);
          console.log(`Deleting image at path: ${imageRef.fullPath}`);
          await deleteObject(imageRef);
          console.log(`Image ${image.url} deleted from storage.`);
        })
      );
      
      await deleteDoc(productRef);
      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product or images: ", error);
    }
  };

  const filteredProducts = [...products];
  const productId = filteredProducts.filter((product) => product.id == id);

  const openConfirmation = () => {
    setConfirmWindowVisibility(true);
  };

  const closeConfirmation = () => {
    setConfirmWindowVisibility(false);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/loading-gif.gif" className="h-10" />
      </div>
    );
  }

  if (user) {
    if (!clientView) {
      return (
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Products" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Your view">
                Your view:
              </p>
              <Link href="/pages/products">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img
                src={productId[0].images[0]}
                alt="Product Image"
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>

              <p className="text-xl">{productId[0].name} | {productId[0].productId}</p>
              <p>Category: {productId[0].category}</p>

              <div>
                <p>Description</p>
                <p>{productId[0].description || "Product not found"}</p>
              </div>

              <p>Average Cost: {productId[0].averageCost}</p>

              <button
                className="hover:arrow bg-red text-white rounded-xl w-32"
                onClick={openConfirmation}
                data-id="delete-button"
              >
                Delete
              </button>
            </div>
          </div>

          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={closeConfirmation}
            onDelete={deleteProduct}
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
          <Header title="Products" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
              <Link href="/pages/products">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img src="/product-image.png" alt="Product Image" className="rounded-xl" />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xl">Test Product | testId</p>

              <p>Category: Test Category</p>

              <div>
                <p>Description</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
              </div>

              <p>Average Cost: $100</p>
            </div>
          </div>

          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={closeConfirmation}
          />

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
        <Header title="Product Track" />

        <div className="mx-4 flex flex-col gap-4 pb-24">
          <div className="flex flex-col gap-2">
            <img src="/product-image.png" alt="Product Image" className="rounded-xl" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xl">Test Product | testId</p>

            <p>Category: Test Category</p>

            <div>
              <p>Description</p>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </div>

            <p>Average Cost: $100</p>
          </div>
        </div>
      </div>
    );
  }
}



  