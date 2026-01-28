"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function AdminPostsPage() {
  const posts = useQuery(api.posts.listAll);
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const deletePost = useMutation(api.posts.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Id<"posts"> | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: "",
      published: false,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPost) {
      await updatePost({
        id: editingPost,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        tags,
        published: formData.published,
      });
    } else {
      await createPost({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        tags,
        published: formData.published,
      });
    }
    resetForm();
  };

  const handleEdit = (post: NonNullable<typeof posts>[number]) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setEditingPost(post._id);
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"posts">) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost({ id });
    }
  };

  const togglePublished = async (post: NonNullable<typeof posts>[number]) => {
    await updatePost({
      id: post._id,
      published: !post.published,
    });
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-[#333] rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingPost ? "Edit Post" : "New Post"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-surface-dark border border-[#444] rounded-lg text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="my-post-title"
                  className="w-full px-3 py-2 bg-surface-dark border border-[#444] rounded-lg text-gray-100 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-dark border border-[#444] rounded-lg text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Content (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  className="w-full px-3 py-2 bg-surface-dark border border-[#444] rounded-lg font-mono text-sm text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="machine-learning, tutorial, python"
                  className="w-full px-3 py-2 bg-surface-dark border border-[#444] rounded-lg text-gray-100 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {editingPost ? "Update" : "Create"} Post
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-[#444] rounded-lg text-gray-300 hover:bg-surface-light"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {posts === undefined ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-surface border border-[#333] rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-100">{post.title}</h3>
                    {post.published ? (
                      <span className="text-xs bg-green-900/30 text-green-500 px-2 py-0.5 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-700/30 text-gray-400 px-2 py-0.5 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "MMM d, yyyy")
                      : "Not published"}
                    {" · "}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:underline"
                    >
                      /blog/{post.slug}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublished(post)}
                    className="p-2 text-gray-400 hover:bg-surface-light rounded"
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-gray-400 hover:bg-surface-light rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-red-500 hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
