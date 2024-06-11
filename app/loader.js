"use client"

import Image from "next/image";
import React from "react";

const loading = () => {
  return (
    <div className="h-[100vh] w-[100vw] grid place-content-center">
        <Image
          src="/loader.gif"
          alt="Ojutu Api"
          className="h-[100px] w-[100px] mb-5"
          width={200}
          height={200}
        />
    </div>
  )
}

export default loading