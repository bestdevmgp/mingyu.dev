"use client";

import dynamic from "next/dynamic";

const LazyNotFoundView = dynamic(() => import("@/_components/NotFoundView"));

export default LazyNotFoundView;
