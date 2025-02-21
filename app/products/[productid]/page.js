"use client";

import { dbDeleteProductById, fetchProductById, fetchProducts } from "@/app/_services/product-service";
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

  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [clientView, setClientView] = useState(false);
  const params = useParams();
  const productId = params.productid;
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const [mainImage, setMainImage] = useState(null);


  useEffect(() => {
    setLoading(true);

    if (!user) {
        return;
    }

    if (user && productId) {
      fetchProductById(user.uid, productId, setProduct); 
    }
    setLoading(false);
  }, [user, productId]);

  useEffect(() => {
    
    if (product && product.productImages && product.productImages.length > 0) {
      setMainImage(product.productImages[0].url);
      console.log(product)
    }
  }, [product]);

  const handleImageChange = (image) => {
    if (mainImage === image.url || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setMainImage(image.url);
      setTransitioning(false)
    }, 300); 
  };

  const handleDeleteProduct = async (e) => {  
      setLoading(true);
      try {
          await dbDeleteProductById(user.uid, product.id);
          console.log("product deleted successfully");
          window.location.href = '/products';
      } catch (error) {
          console.error("Error adding material:", error);
      }
    };
      
  
  const openCloseConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
    console.log(confirmWindowVisibility)
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
              <Link href="/products">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img
                src={mainImage}
                alt="Product Image"
                className={`rounded-xl object-cover h-96 transition-all duration-300 ${
                  transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              /> 

                <div className="flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin">
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
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <Link href={`./${productId}/edit`}>
                  <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                    <p>Edit</p>
                    <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                  </button>
                </Link>
              </div>

              <p className="text-xl">
                {product.name} | {product.productId}
              </p>

              <p>Categories: {product.categories ||"No set categories"}</p>

              <div>
                <p>Description</p>
                <p>{product.description || "No Description"}</p>
              </div>

              <p>Average Total: {product.averageCost || "Cost is not set"}{product.currency}</p>

              <button
                className="hover:arrow bg-red text-white rounded-xl w-32"
                onClick={openCloseConfirmation}
                data-id="delete-button"
              >
                Delete
              </button>
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
        <div className="flex flex-col min-h-screen gap-4">
          <Header title="Products" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
              <Link href="/">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img
                src={mainImage}
                alt="Product Image"
                className={`rounded-xl object-cover h-96 transition-all duration-300 ${
                  transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              /> 

                <div className="flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin">
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
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                  <p>Edit</p>
                  <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                </button>
              </div>

              <p className="text-xl">{product.name} | {product.productId}</p>

              <p>Categories: {product.categories ||"No set categories"}</p>

              <div>
                <p>Description</p>
                <p>{product.description || "No Description"} </p>
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
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Artisan Track" />

        <div className="mx-4 flex flex-col gap-4 pb-24">
          <div className="flex flex-col gap-2">
            <img src="/Sweater.jpg" alt="Sweater" className="rounded-xl" />

            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar scrollbar-thin">
              <SmallBlockHolder
                type="plainPicture"
                imageSource="/Sweater.jpg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xl">
              testNameProduct
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].title
              : "Product not found"} */}
            </p>
            <p>
              Category: testCategory1, testCategory2
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].category
              : "Product not found"} */}
            </p>
            <p>
              Average Total: 123$
              {/* {filteredProducts.length > 0
              ? filteredProducts[0].total
              : "Product not found"}$ */}
            </p>
          </div>
        </div>
      </div>
    );
  }
}