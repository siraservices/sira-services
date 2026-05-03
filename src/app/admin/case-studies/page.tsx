"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { Id } from "../../../../convex/_generated/dataModel";

type FormData = {
  title: string;
  slug: string;
  client: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  tags: string;
  imageUrl: string;
  published: boolean;
};

const emptyForm: FormData = {
  title: "",
  slug: "",
  client: "",
  description: "",
  challenge: "",
  solution: "",
  results: "",
  tags: "",
  imageUrl: "",
  published: false,
};

export default function AdminCaseStudiesPage() {
  const caseStudies = useQuery(api.caseStudies.listAll);
  const createCaseStudy = useMutation(api.caseStudies.create);
  const updateCaseStudy = useMutation(api.caseStudies.update);
  const deleteCaseStudy = useMutation(api.caseStudies.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"caseStudies"> | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const imageUrl = formData.imageUrl.trim() || undefined;

    if (editingId) {
      await updateCaseStudy({
        id: editingId,
        title: formData.title,
        slug: formData.slug,
        client: formData.client,
        description: formData.description,
        challenge: formData.challenge,
        solution: formData.solution,
        results: formData.results,
        tags,
        imageUrl,
        published: formData.published,
      });
    } else {
      await createCaseStudy({
        title: formData.title,
        slug: formData.slug,
        client: formData.client,
        description: formData.description,
        challenge: formData.challenge,
        solution: formData.solution,
        results: formData.results,
        tags,
        imageUrl,
        published: formData.published,
      });
    }
    resetForm();
  };

  const handleEdit = (cs: NonNullable<typeof caseStudies>[number]) => {
    setFormData({
      title: cs.title,
      slug: cs.slug,
      client: cs.client,
      description: cs.description,
      challenge: cs.challenge,
      solution: cs.solution,
      results: cs.results,
      tags: cs.tags.join(", "),
      imageUrl: cs.imageUrl ?? "",
      published: cs.published,
    });
    setEditingId(cs._id);
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"caseStudies">) => {
    if (confirm("Are you sure you want to delete this case study?")) {
      await deleteCaseStudy({ id });
    }
  };

  const togglePublished = async (cs: NonNullable<typeof caseStudies>[number]) => {
    await updateCaseStudy({ id: cs._id, published: !cs.published });
  };

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text">
            Case Studies
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-cta text-black font-display font-semibold rounded-lg hover:bg-cta-dark transition-all duration-200 text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Case Study
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-surface-alt shadow-card border border-surface-border rounded-xl mb-8"
          >
            <h2 className="text-lg font-display font-semibold text-text mb-5">
              {editingId ? "Edit Case Study" : "New Case Study"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="my-case-study"
                    className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-display font-medium text-text mb-2">
                    Client
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
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
                    placeholder="machine-learning, python, nlp"
                    className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Description (shown on card)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  The Challenge
                </label>
                <textarea
                  value={formData.challenge}
                  onChange={(e) =>
                    setFormData({ ...formData, challenge: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Our Solution
                </label>
                <textarea
                  value={formData.solution}
                  onChange={(e) =>
                    setFormData({ ...formData, solution: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Results
                </label>
                <textarea
                  value={formData.results}
                  onChange={(e) =>
                    setFormData({ ...formData, results: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-text mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
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
                  {editingId ? "Update" : "Create"} Case Study
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

        {caseStudies === undefined ? (
          <div className="flex items-center gap-3 justify-center py-12 text-text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Loading...
          </div>
        ) : caseStudies.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No case studies yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {caseStudies.map((cs) => (
              <div
                key={cs._id}
                className="p-4 bg-surface-alt shadow-soft border border-surface-border rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-text">
                      {cs.title}
                    </h3>
                    {cs.published ? (
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
                    {cs.client}
                    {" · "}
                    {cs.publishedAt
                      ? format(new Date(cs.publishedAt), "MMM d, yyyy")
                      : "Not published"}
                    {" · "}
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="text-primary hover:text-primary-light transition-colors duration-200"
                    >
                      /case-studies/{cs.slug}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublished(cs)}
                    className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors duration-200 cursor-pointer"
                    title={cs.published ? "Unpublish" : "Publish"}
                  >
                    {cs.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(cs)}
                    className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cs._id)}
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
