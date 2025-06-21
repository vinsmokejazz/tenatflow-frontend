"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-[40rem] h-[25rem] rounded-xl p-6 border flex flex-col items-center justify-center">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white mb-1"
        >
          TenantFlow
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-3"
        >
          The best way to manage your tenants and properties
        </CardItem>
        <CardItem translateZ="100" className="w-full flex-1 flex items-center justify-center mt-4">
          <img
            src="/images/Screenshot 2025-06-21 202319.png"
            width={2514}
            height={1225}
            className="w-full h-full object-contain rounded-xl group-hover/card:shadow-xl"
            alt="TenantFlow Dashboard Screenshot"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
} 