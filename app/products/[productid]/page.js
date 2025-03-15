"use client";

import {
  dbDeleteProductById,
  fetchProductById,
  fetchProducts,
} from "@/app/_services/product-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const { user } = useUserAuth();

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

  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [clientView, setClientView] = useState(false);
  const params = useParams();
  const productId = params.productid;
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = product.name || "Loading...";
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [product]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user && productId) {
      fetchProductById(user.uid, productId, setProduct);
    }
  }, [user, productId]);

  useEffect(() => {
    if (product && product.productImages && product.productImages.length > 0) {
      setMainImage(product.productImages[0].url);
      console.log(product);
    }
  }, [product]);

  const handleImageChange = (image) => {
    if (mainImage === image.url || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setMainImage(image.url);
      setTransitioning(false);
    }, 300);
  };

  const handleDeleteProduct = async (e) => {
    setLoading(true);
    try {
      await dbDeleteProductById(user.uid, product.id);
      console.log("product deleted successfully");
      window.location.href = "/products";
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const openCloseConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
    console.log(confirmWindowVisibility);
  };

  const changeView = () => {
    setClientView((prev) => !prev);
    console.log();
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
        <div className={commonClasses.container}>
          <Header title="Product" />

          <div className="mx-4 flex flex-col gap-6 pb-24">
            {/* Back Button and View Title */}
            <div className="flex flex-row justify-between items-center">
              <p
                className="font-bold text-xl text-blackBeige"
                data-id="Your view"
              >
                Your View
              </p>
              <Link href="/products">
                <button className={commonClasses.headerButton}>
                  <img src="/arrow-left.png" width={20} alt="Back" />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Images Section (Left Side on Non-Mobile) */}
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

                {(product?.productImages?.length > 0 ||
                  product?.patternImages?.length > 0) && (
                  <div className={commonClasses.thumbnailContainer}>
                    {product?.productImages?.map((image, index) => (
                      <SmallBlockHolder
                        key={index}
                        type="plainPicture"
                        imageSource={image.url}
                        onButtonFunction={() => handleImageChange(image)}
                        mainStatus={mainImage === image.url}
                      />
                    ))}
                    {product?.patternImages?.map((image, index) => (
                      <SmallBlockHolder
                        key={index}
                        type="plainPicture"
                        imageSource={image.url}
                        onButtonFunction={() => handleImageChange(image)}
                        mainStatus={mainImage === image.url}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section (Right Side on Non-Mobile) */}
              <div className={`${commonClasses.productDetails} md:w-1/2`}>
                <div className="relative bg-green rounded-md w-32">
                  <Link href={`./${productId}/edit`}>
                    <button className={commonClasses.editButton}>
                      <p>Edit</p>
                      <img src="/Pencil.png" alt="Pencil" className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <p className="text-2xl font-bold text-blackBeige">
                  #{product.productId} | {product.name}
                </p>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Categories:</p>
                  <p className={commonClasses.sectionText}>
                    {Array.isArray(product?.categories) &&
                    product.categories.length > 0
                      ? product.categories.join(", ")
                      : "No set categories"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Description:</p>
                  <p className={commonClasses.sectionText}>
                    {product.description || "No Description"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Average Total:</p>
                  <p className={commonClasses.sectionText}>
                    {product.averageCost || "Cost is not set"}{" "}
                    {product.currency}
                  </p>
                </div>

                <button
                  className={commonClasses.deleteButton}
                  onClick={openCloseConfirmation}
                  data-id="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={openCloseConfirmation}
            onDelete={handleDeleteProduct}
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
        <div className={commonClasses.container}>
          <Header title="Products" showUserName={true} />

          <div className="mx-4 flex flex-col gap-6 pb-24">
            {/* Back Button and View Title */}
            <div className="flex flex-row justify-between items-center">
              <p
                className="font-bold text-xl text-blackBeige"
                data-id="Client view"
              >
                Client View
              </p>
              <Link href="/products">
                <button className={commonClasses.headerButton}>
                  <img src="/arrow-left.png" width={20} alt="Back" />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Images Section (Left Side on Non-Mobile) */}
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

                {(product?.productImages?.length > 0 ||
                  product?.patternImages?.length > 0) && (
                  <div className={commonClasses.thumbnailContainer}>
                    {product?.productImages?.map((image, index) => (
                      <SmallBlockHolder
                        key={index}
                        type="plainPicture"
                        imageSource={image.url}
                        onButtonFunction={() => handleImageChange(image)}
                        mainStatus={mainImage === image.url}
                      />
                    ))}
                    {product?.patternImages?.map((image, index) => (
                      <SmallBlockHolder
                        key={index}
                        type="plainPicture"
                        imageSource={image.url}
                        onButtonFunction={() => handleImageChange(image)}
                        mainStatus={mainImage === image.url}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section (Right Side on Non-Mobile) */}
              <div className={`${commonClasses.productDetails} md:w-1/2`}>
                <p className="text-2xl font-bold text-blackBeige">
                  #{product.productId} | {product.name}
                </p>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Categories:</p>
                  <p className={commonClasses.sectionText}>
                    {Array.isArray(product?.categories) &&
                    product.categories.length > 0
                      ? product.categories.join(", ")
                      : "No set categories"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>Description:</p>
                  <p className={commonClasses.sectionText}>
                    {product.description || "No Description"}
                  </p>
                </div>
              </div>
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
      <div className={commonClasses.container}>
        <Header title="Artisan Track" />

        <div className="mx-4 flex flex-col gap-6 pb-24">
          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Images Section (Left Side on Non-Mobile) */}
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

              {(product?.productImages?.length > 0 ||
                product?.patternImages?.length > 0) && (
                <div className={commonClasses.thumbnailContainer}>
                  {product?.productImages?.map((image, index) => (
                    <SmallBlockHolder
                      key={index}
                      type="plainPicture"
                      imageSource={image.url}
                      onButtonFunction={() => handleImageChange(image)}
                      mainStatus={mainImage === image.url}
                    />
                  ))}
                  {product?.patternImages?.map((image, index) => (
                    <SmallBlockHolder
                      key={index}
                      type="plainPicture"
                      imageSource={image.url}
                      onButtonFunction={() => handleImageChange(image)}
                      mainStatus={mainImage === image.url}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section (Right Side on Non-Mobile) */}
            <div className={`${commonClasses.productDetails} md:w-1/2`}>
              <p className="text-2xl font-bold text-blackBeige">
                #{product.productId} | {product.name}
              </p>

              <div className="flex flex-col gap-2">
                <p className={commonClasses.sectionTitle}>Categories:</p>
                <p className={commonClasses.sectionText}>
                  {Array.isArray(product?.categories) &&
                  product.categories.length > 0
                    ? product.categories.join(", ")
                    : "No set categories"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className={commonClasses.sectionTitle}>Description:</p>
                <p className={commonClasses.sectionText}>
                  {product.description || "No Description"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
