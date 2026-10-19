"use client";

import dynamic from "next/dynamic";

const LazyNotFoundView = dynamic(() => import("@/_components/NotFoundView").catch(() => new Promise<never>(() => {})));

export default LazyNotFoundView;
