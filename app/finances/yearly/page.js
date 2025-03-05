"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import Header from "@/app/components/header";
import Menu from "@/app/components/menu";
import NotLoggedWindow from "@/app/components/not-logged-window";
import PieChart from "@/app/components/pie-chart";

import { useEffect, useState } from "react";

export default function WelcomePage() {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [stateShow, setStateShow] = useState('orders');
  const [income, setIncome] = useState(70); 
  const [expenses, setExpenses] = useState(30); 
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);


  //Function where to set/change variables for popular entities, incomes, expense when the chosen year is changing
  useEffect(()=>{

  }, [currentYear])

  const handleStateOrders = () => {
    setStateShow('orders');
  };

  const handleStateProducts = () => {
    setStateShow('products');
  };

  const handleStateMaterials = () => {
    setStateShow('materials');
  };

  const goToPreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const goToNextYear = () => {
    setCurrentYear(currentYear + 1);
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
    return (
      <div className="flex flex-col min-h-screen gap-4">
        <Header title="Yearly Report" />

        <div className="flex flex-col gap-4 pb-20">
          {/* Toggle */}
          <div className="border-b border-b-darkBeige">
            <div className="flex flex-row items-center pb-4 justify-between px-4">
              <button onClick={goToPreviousYear}>
                <img className="h-5" src="/arrowLeft.png" />
              </button>
              <p className="text-xl font-semibold">{currentYear}</p> {/* Display current year */}
              <button onClick={goToNextYear}>
                <img className="h-5" src="/arrowRight.png" />
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="px-4 pb-22 gap-4 flex flex-col">
            {/* Diagram */}
            <div className="flex flex-col gap-2">
              {/* Finance text */}
              <div className="flex flex-row gap-2 text-xl">
                <p>Income:</p>
                <p>Expenses:</p>
              </div>
              {/* Place for diagram */}
              <div className="flex justify-center px-4">
                <PieChart income={income} expenses={expenses} />
              </div>

              <div className="pt-2">
                <p>
                  Popular product this year:{" "}
                  <span className="underline">#id | Name</span>
                </p>
                <p>
                  Popular material this year:{" "}
                  <span className="underline">#id | Name</span>
                </p>
                <p>Regular client: Alex Smith</p>
              </div>
            </div>

            {/* View */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Show</p>
              <div className="flex flex-row gap-2 justify-between items-center">
                <button
                  className={`w-[33%] py-1 rounded-md ${stateShow === "orders" ? "bg-transparent border-2 border-green" : "bg-green"}`}
                  onClick={handleStateOrders}
                >
                  Orders
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${stateShow === "products" ? "bg-transparent border-2 border-green" : "bg-green"}`}
                  onClick={handleStateProducts}
                >
                  Products
                </button>
                <button
                  className={`w-[33%] py-1 rounded-md ${stateShow === "materials" ? "bg-transparent border-2 border-red text-blackBeige" : "bg-red text-white"}`}
                  onClick={handleStateMaterials}
                >
                  Materials
                </button>
              </div>

              {/* Show orders, products, or materials */}
              {stateShow === "orders" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 auto-rows-[1fr] justify-center items-stretch">
                  {/* Render orders */}
                </div>
              )}

              {stateShow === "products" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 auto-rows-[1fr] justify-center items-stretch">
                  {/* Render products */}
                </div>
              )}

              {stateShow === "materials" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 auto-rows-[1fr] justify-center items-stretch">
                  {/* Render materials */}
                </div>
              )}
            </div>
          </div>
        </div>

        <Menu 
        type="TwoButtonsMenu"
        firstTitle={"Go back"}
        iconFirst={"/arrow-left.png"}
        onFirstFunction={() => window.location.href = `/finances`}
        secondTitle={"Download"}
        iconSecond={"/download.png"} />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen gap-6">
        <Header title="Artisan Track" />
        <NotLoggedWindow />
      </div>
    );
  }
}
