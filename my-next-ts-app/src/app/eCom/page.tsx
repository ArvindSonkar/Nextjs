"use client";
import Link from "next/link";
import { useState } from "react";
import { HiApiResponseModel } from "../api/Hi/route";

const Ecommerce = () => {
  const [result, setResult] = useState<HiApiResponseModel>({ message: "" });
  const makeApiCall = async () => {
    const res = await fetch("/api/Hi");
    const response = (await res.json()) as HiApiResponseModel;
    console.log(response, "response");
    setResult(response);

    fetch("/api/Hi", {
      method: "POST",
      body: JSON.stringify({ name: "Arvind" }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <>
      <div>Ecommerce</div>
      <Link href={"/blogs"}>Go to Blogs</Link>
      <br />
      <button onClick={makeApiCall}>Hi Api</button>
      {!!result && <div>{result?.message}</div>}
    </>
  );
};

export default Ecommerce;
