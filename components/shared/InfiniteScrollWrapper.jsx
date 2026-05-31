"use client";
import { useEffect, useRef } from "react";

export default function InfiniteScrollWrapper({ children, onLoadMore, hasMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) onLoadMore(); },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <>
      {children}
      <div ref={sentinelRef} />
    </>
  );
}
