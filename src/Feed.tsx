import React, { useState, useEffect, useRef } from "react";

interface FeedPost {
  id: string;
  photoUrl: string;
  caption: string;
  createdAt: string;
}

const Feed: React.FC = () => {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [otherPosts, setOtherPosts] = useState<FeedPost[]>([]);
  const [feedCaption, setFeedCaption] = useState("");
  const [feedPhoto, setFeedPhoto] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const token = localStorage.getItem("authToken");
  console.log(token, 'tokemn')

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchFeedPosts = async () => {
    try {
      const response = await fetch("https://affworld-services-1.onrender.com/api/v1/feed/getPosts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setFeedPosts(data.result);
    } catch (error) {
      console.error("Error fetching user feed posts:", error);
    }
  };

  const fetchOtherPosts = async () => {
    try {
      const response = await fetch("https://affworld-services-1.onrender.com/api/v1/feed/allPosts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch other posts");
      }
      const data = await response.json();
      setOtherPosts(data.result);
    } catch (error) {
      console.error("Error fetching other posts:", error);
    }
  };

  // Add a new feed post
  const addFeedPost = async () => {
    if (!feedPhoto || !feedCaption) {
      alert("Please add both a photo and a caption.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", feedCaption);
    formData.append("file", feedPhoto);

    setIsPosting(true);

    try {
      const response = await fetch("https://affworld-services-1.onrender.com/api/v1/feed/createPost", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      await fetchFeedPosts();
      await fetchOtherPosts();
      setFeedCaption("");
      setFeedPhoto(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
    fetchOtherPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-8 transition-all duration-500 ease-in-out">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Feed</h2>

      {/* Post Creation Section */}
      <div className="mb-6">
        <textarea
          placeholder="Write something amazing..."
          value={feedCaption}
          onChange={(e) => setFeedCaption(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-xl p-4 mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
        />
        <div className="flex items-center mb-3">
          <label
            htmlFor="file-upload"
            className="bg-violet-500 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-violet-700 transition-all duration-300 ease-in-out"
          >
            Choose File
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setFeedPhoto(e.target.files?.[0] || null)}
            className="hidden"
          />
          {feedPhoto && (
            <span className="ml-4 text-sm text-gray-500">{feedPhoto.name}</span>
          )}
        </div>
        <button
          onClick={addFeedPost}
          disabled={isPosting}
          className={`bg-blue-600 text-white py-2 px-6 rounded-lg transition-all duration-300 ease-in-out ${
            isPosting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* User Feed Posts */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Feed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedPosts.length > 0 ? (
            feedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <img
                  src={post.photoUrl}
                  alt="Post"
                  className="w-full h-56 object-cover transition-all duration-300 ease-in-out"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{post.caption}</p>
                  <p className="text-xs text-gray-400">
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No posts available. Be the first to share something!
            </p>
          )}
        </div>
      </div>

      {/* Other Posts (excluding user's posts) */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPosts.length > 0 ? (
            otherPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <img
                  src={post.photoUrl}
                  alt="Post"
                  className="w-full h-56 object-cover transition-all duration-300 ease-in-out"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{post.caption}</p>
                  <p className="text-xs text-gray-400">
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No posts available from others.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
