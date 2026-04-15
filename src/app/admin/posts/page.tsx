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
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text">Blog Posts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-cta text-black font-display font-semibold rounded-lg hover:bg-cta-dark transition-all duration-200 text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-surface-alt shadow-card border border-surface-border rounded-xl mb-8"
          >
            <h2 className="text-lg font-display font-semibold text-text mb-5">
              {editingPost ? "Edit Post" : "New Post"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="my-post-title"
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Content (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="machine-learning, tutorial, python"
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="rounded bg-surface-muted border-surface-border text-primary focus:ring-primary/30 cursor-pointer"
                />
                <label
                  htmlFor="published"
                  className="text-sm text-text-muted cursor-pointer"
                >
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cta text-black font-display font-semibold rounded-lg hover:bg-cta-dark transition-all duration-200 text-sm cursor-pointer"
                >
                  {editingPost ? "Update" : "Create"} Post
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-surface-border text-text-muted rounded-lg hover:bg-surface-hover transition-all duration-200 text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {posts === undefined ? (
          <div className="flex items-center gap-3 justify-center py-12 text-text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No posts yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-4 bg-surface-alt shadow-soft border border-surface-border rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-text">
                      {post.title}
                    </h3>
                    {post.published ? (
                      <span className="text-[10px] font-display font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                        Published
                      </span>
                    ) : (
                      <span className="text-[10px] font-display font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-text-dim">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-dim">
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "MMM d, yyyy")
                      : "Not published"}
                    {" · "}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:text-primary-light transition-colors duration-200"
                    >
                      /blog/{post.slug}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublished(post)}
                    className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors duration-200 cursor-pointer"
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
                    className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
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
