"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  async function fetchPosts(cur = null) {
    setLoading(true);
    try {
      const url = `/api/posts${cur ? `?cursor=${cur}` : ""}`;
      const { data } = await axios.get(url);
      if (cur) setPosts((prev) => [...prev, ...data.data]);
      else setPosts(data.data);
      setHasMore(!!data.nextCursor);
      setCursor(data.nextCursor);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetchPosts(); }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && cursor) fetchPosts(cursor);
  }, [loading, hasMore, cursor]);

  function addPost(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function removePost(id) {
    setPosts((prev) => prev.filter((p) => String(p._id) !== String(id)));
  }

  return { posts, loading, hasMore, loadMore, addPost, removePost };
}
