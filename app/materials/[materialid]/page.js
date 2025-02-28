"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import ConfirmationWindow from "@/app/components/confirmation-window";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import SmallBlockHolder from "@/app/components/small-block-holder";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { dbDeleteMaterialById, fetchMaterials } from "@/app/_services/material-service";

export default function MaterialPage() {
  const { user } = useUserAuth();
  const params = useParams();
  const id = params.materialid;

  const [confirmWindowVisibility, setConfirmWindowVisibility] = useState(false);
  const [clientView, setClientView] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
        if (!user) return;
        setLoading(true);
        const materialsData = await fetchMaterials(user.uid);
        setMaterials(materialsData);
        setLoading(false);
    };
    
    loadMaterials();
  }, [user]);
  
  
  const filteredMaterials = [...materials];
  const materialId = filteredMaterials.filter((material) => material.id == id);
  const selectedMaterial = materialId[0];
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    if (selectedMaterial && selectedMaterial.images && selectedMaterial.images.length > 0) {
      setMainImage(selectedMaterial.images[0].url);
    }
  }, [selectedMaterial]);


  const handleImageChange = (image) => {
    if (mainImage === image.url || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setMainImage(image.url);
      setTransitioning(false)
    }, 300); 
  };

  const handleDeleteMaterial = async (e) => {  
    setLoading(true);
    try {
        await dbDeleteMaterialById(user.uid, selectedMaterial.id);
        console.log("Material deleted successfully");
        window.location.href = '/materials';
    } catch (error) {
        console.error("Error adding material:", error);
    }
  };
    

  const openCloseConfirmation = () => {
    setConfirmWindowVisibility((prev) => !prev);
    console.log(selectedMaterial.colors)

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
          <Header title="Materials" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Your view">
                Your view:
              </p>
              <Link href="/materials">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img
                src={mainImage || "/noImage.png"}
                alt="Material Image"
                className={`rounded-xl object-cover h-96 transition-all duration-300 ${
                  transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              /> 

              {(selectedMaterial?.images?.length > 0) && (
                <div className="flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin">
                  {selectedMaterial.images.map((image, index) => (
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

            <div className="flex flex-col gap-2">
              <div className="relative bg-green rounded-2xl w-32">
                <Link href={`./${id}/edit`}>
                  <button className="py-1 font-bold w-full flex flex-row items-center justify-center gap-2 flex-shrink-0">
                    <p>Edit</p>
                    <img src="/Pencil.png" alt="Pencil" className="w-4 h4" />
                  </button>
                </Link>
              </div>

              <p className="text-xl">
                #{selectedMaterial.materialId} | {selectedMaterial.name} 
              </p>

              <p>Categories: {selectedMaterial.categories.join(", ") ||"No set categories"}</p>

              <p>Color: {Array.isArray(selectedMaterial.colors) && selectedMaterial.colors[0].length > 0 
                  ? selectedMaterial.colors.join(", ") 
                  : "No set colors"}
              </p>

              <div>
                <p>Description</p>
                <p>{selectedMaterial.description || "No Description"}</p>
              </div>

              {selectedMaterial?.pricing?.length > 0 ? (
                selectedMaterial.pricing.map((item, index) => (
                  <div key={index}>
                    <p>Cost</p>
                    <li>{item.shopName} {item.price}</li>
                  </div>
                ))
              ) :(
                  <div>
                    <p>Cost</p>
                    <p className="right">No set shops</p>
                  </div>
                  )}
              
              <p>
                Total cost: {selectedMaterial.total || "No set total"}{selectedMaterial.currency}
              </p>
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
            onDelete={handleDeleteMaterial}
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
          <Header title="Materials" showUserName={true} />

          <div className="mx-4 flex flex-col gap-4 pb-24">
            <div className="flex flex-row justify-between">
              <p className="font-bold" data-id="Client view">
                Client view:
              </p>
              <Link href="/materials">
                <button className="font-bold bg-green rounded-2xl px-4 flex gap-1 flex-row justify-center items-center">
                  <img src="/arrow-left.png" width={20} />
                  <p>Back</p>
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <img
                src={mainImage || "/noImage.png"}
                alt="Material Image"
                className={`rounded-xl object-cover h-96 transition-all duration-300 ${
                  transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              /> 

              {(selectedMaterial?.images?.length > 0 ) && (
                <div className="flex flex-row gap-2 overflow-x-auto items-center h-28 whitespace-nowrap scrollbar scrollbar-thin">
                  {selectedMaterial?.images?.map((image, index) => (
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

            <div className="flex flex-col gap-2">
              <p className="text-xl">
                #{selectedMaterial.materialId} | {selectedMaterial.name} 
              </p>

              <p>Categories: {selectedMaterial.categories.join(", ") ||"No set categories"}</p>

              <p>Color: {Array.isArray(selectedMaterial.colors) && selectedMaterial.colors[0].length > 0 
                  ? selectedMaterial.colors.join(", ") 
                  : "No set colors"}
              </p>

              <div>
                <p>Description</p>
                <p>{selectedMaterial.description || "No Description"}</p>
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
  } 
  else {
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
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xl">testNameMaterial | testId</p>

            <p>Category: testCategory1, testCategory2</p>

            <div>
              <p>Description</p>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
