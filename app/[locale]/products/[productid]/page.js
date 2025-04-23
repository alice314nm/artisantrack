"use client";

import { useTranslations } from "next-intl";
import {
  dbDeleteProductById,
  fetchProductById,
  fetchProducts,
} from "@/app/[locale]/_services/product-service";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import ConfirmationWindow from "@/app/[locale]/components/confirmation-window";
import Header from "@/app/[locale]/components/header";
import Menu from "@/app/[locale]/components/menu";
import SmallBlockHolder from "@/app/[locale]/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NotLoggedWindow from "../../components/not-logged-window";

export default function ProductPage() {
  const t = useTranslations("productId");
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
      "py-2 font-bold w-full rounded-md flex flex-row items-center justify-center gap-2 flex-shrink-0 hover:bg-darkGreen transition-colors duration-300",
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
    document.title = product.name || t("loading");
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
          <Header title={t("title")} />

          <div className="mx-4 flex flex-col gap-6 pb-24">
            {/* Back Button and View Title */}
            <div className="flex flex-row justify-between items-center">
              <Link href="/products">
                <button className={commonClasses.headerButton}>
                  <img src="/arrow-left.png" width={20} alt="Back" />
                  <p>{t("back")}</p>
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Images Section (Left Side on Non-Mobile) */}
              <div className="flex flex-col gap-4 md:w-1/2">
                <img
                  src={mainImage || "/noImage.png"}
                  alt={t("imageAlt")}
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

                {/* Categories */}
                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>
                    {t("categories")}:
                  </p>
                  <p className={commonClasses.sectionText}>
                    {Array.isArray(product?.categories) &&
                    product.categories.length > 0
                      ? product.categories.join(", ")
                      : t("noCategories")}
                  </p>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>
                    {t("description")}:
                  </p>
                  <p className={commonClasses.sectionText}>
                    {product.description || t("noDescription")}
                  </p>
                </div>

                {/* Average Total */}
                <div className="flex flex-col gap-2">
                  <p className={commonClasses.sectionTitle}>
                    {t("averageTotal")}:
                  </p>
                  <p className={commonClasses.sectionText}>
                    {product.averageCost || t("costNotSet")} {product.currency}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Confirmation Window */}
          <ConfirmationWindow
            windowVisibility={confirmWindowVisibility}
            onClose={openCloseConfirmation}
            onDelete={handleDeleteProduct}
          />

          {/* Menu */}
          <Menu
            type="TwoButtonsMenuId"
            iconSecond="/Pencil.png"
            firstTitle={t("delete")}
            secondTitle={t("edit")}
            onFirstFunction={openCloseConfirmation}
            onSecondFunction={() => (window.location.href = `./${productId}/edit`)}
          />
        </div>
      );
    }

    // View for unlogged users
    // else {
    //   return (
    //     <div className={commonClasses.container}>
    //       <Header title={t("products")} showUserName={true} />

    //       <div className="mx-4 flex flex-col gap-6 pb-24">
    //         {/* Back Button and View Title */}
    //         <div className="flex flex-row justify-between items-center">
    //           <p
    //             className="font-bold text-xl text-blackBeige"
    //             data-id="Client view"
    //           >
    //             {t("clientView")}
    //           </p>
    //           <Link href="/products">
    //             <button className={commonClasses.headerButton}>
    //               <img src="/arrow-left.png" width={20} alt="Back" />
    //               <p>{t("back")}</p>
    //             </button>
    //           </Link>
    //         </div>

    //         {/* Main Content */}
    //         <div className="flex flex-col md:flex-row gap-6">
    //           {/* Images Section (Left Side on Non-Mobile) */}
    //           <div className="flex flex-col gap-4 md:w-1/2">
    //             <img
    //               src={mainImage || "/noImage.png"}
    //               alt={t("imageAlt")}
    //               className={`${commonClasses.mainImage} ${
    //                 transitioning
    //                   ? "opacity-0 translate-y-1"
    //                   : "opacity-100 translate-y-0"
    //               }`}
    //             />

    //             {(product?.productImages?.length > 0 ||
    //               product?.patternImages?.length > 0) && (
    //               <div className={commonClasses.thumbnailContainer}>
    //                 {product?.productImages?.map((image, index) => (
    //                   <SmallBlockHolder
    //                     key={index}
    //                     type="plainPicture"
    //                     imageSource={image.url}
    //                     onButtonFunction={() => handleImageChange(image)}
    //                     mainStatus={mainImage === image.url}
    //                   />
    //                 ))}
    //                 {product?.patternImages?.map((image, index) => (
    //                   <SmallBlockHolder
    //                     key={index}
    //                     type="plainPicture"
    //                     imageSource={image.url}
    //                     onButtonFunction={() => handleImageChange(image)}
    //                     mainStatus={mainImage === image.url}
    //                   />
    //                 ))}
    //               </div>
    //             )}
    //           </div>

    //           {/* Product Details Section (Right Side on Non-Mobile) */}
    //           <div className={`${commonClasses.productDetails} md:w-1/2`}>
    //             <p className="text-2xl font-bold text-blackBeige">
    //               #{product.productId} | {product.name}
    //             </p>

    //             <div className="flex flex-col gap-2">
    //               <p className={commonClasses.sectionTitle}>
    //                 {t("categories")}
    //               </p>
    //               <p className={commonClasses.sectionText}>
    //                 {Array.isArray(product?.categories) &&
    //                 product.categories.length > 0
    //                   ? product.categories.join(", ")
    //                   : "No set categories"}
    //               </p>
    //             </div>

    //             {/* Description */}
    //             <div className="flex flex-col gap-2">
    //               <p className={commonClasses.sectionTitle}>
    //                 {t("description")}:
    //               </p>
    //               <p className={commonClasses.sectionText}>
    //                 {product.description || t("noDescription")}
    //               </p>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Menu */}
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
        <Header title={t("pageTitle")} />
        <NotLoggedWindow/>
      </div>
    );
  }
}
