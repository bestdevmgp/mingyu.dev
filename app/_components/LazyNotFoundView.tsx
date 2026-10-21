"use client";

import dynamic from "next/dynamic";

const LazyNotFoundView = dynamic(() => import("./NotFoundView").catch(() => new Promise<never>(() => {})));

export default LazyNotFoundView;
