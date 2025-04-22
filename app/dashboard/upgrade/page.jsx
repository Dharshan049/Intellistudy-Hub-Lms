"use client";

import React, { useEffect, useState } from "react";
import { Check, Sparkles, Zap, Shield } from "lucide-react";
import axios from "axios";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";

const PricingPlans = () => {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check theme
    const checkTheme = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    };

    checkTheme();
    const interval = setInterval(checkTheme, 100);

    if (user) GetUserDetails();

    return () => clearInterval(interval);
  }, [user]);

  const GetUserDetails = async () => {
    const result = await db
      .select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, user?.primaryEmailAddress?.emailAddress));

    setUserDetails(result[0]);
  };

  const OnCheckoutClick = async () => {
    const result = await axios.post("/api/payment/checkout", {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
    });

    console.log(result.data);
    window.open(result.data?.url);
  };

  const onPaymentManage = async () => {
    const result = await axios.post("/api/payment/manage-payment", {
      customerId: userDetails?.customerId,
    });

    console.log(result.data);

    const url = result.data?.url;
    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("Failed to retrieve the customer portal URL.");
    }
  };

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock unlimited potential with our premium features
          </p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Free Plan */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg rounded-xl p-8 border border-white/20 dark:border-gray-800/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Free Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Perfect for getting started</p>
                </div>
                <Shield className="w-10 h-10 text-[#E5DBFF] dark:text-[#635AE5]" />
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Check className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Five Course Limit</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Check className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Unlimited Notes Taking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Check className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Email Support</span>
                </li>
              </ul>

              <button className="w-full py-3 rounded-lg border-2 border-[#E5DBFF] dark:border-[#635AE5] text-gray-900 dark:text-white font-medium transition-all hover:bg-[#F0D5FF] hover:border-[#F0D5FF] dark:hover:bg-[#635AE5] dark:hover:border-[#635AE5]">
                Current Plan
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg rounded-xl p-8 border border-white/20 dark:border-gray-800/50">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
                <div className="bg-gradient-to-r from-[#E5DBFF] to-[#F0D5FF] dark:from-[#4B47B3] dark:to-[#635AE5] text-black dark:text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Premium Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">For power users</p>
                </div>
                <Sparkles className="w-10 h-10 text-[#a392d0] dark:text-[#635AE5]" />
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$10</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Zap className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Unlimited Course Creation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Check className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#F0D5FF] dark:bg-[#635AE5] bg-opacity-30">
                    <Check className="w-4 h-4 text-[#635AE5] dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Advanced Features</span>
                </li>
              </ul>

              {userDetails?.isMember == false ? (
                <button
                  onClick={OnCheckoutClick}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02]"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={onPaymentManage}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02]"
                >
                  Manage Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;