import Link from "next/link";
import { FileText, Users } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text mb-8">
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/posts"
            className="group p-6 bg-white shadow-card border border-surface-border rounded-xl hover:shadow-elevated transition-all duration-200 cursor-pointer"
          >
            <div className="p-3 rounded-lg bg-primary-50 w-fit mb-4">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold text-text mb-2 group-hover:text-primary transition-colors duration-200">
              Blog Posts
            </h2>
            <p className="text-sm text-text-muted">
              Create, edit, and manage your blog posts.
            </p>
          </Link>

          <Link
            href="/admin/leads"
            className="group p-6 bg-white shadow-card border border-surface-border rounded-xl hover:shadow-elevated transition-all duration-200 cursor-pointer"
          >
            <div className="p-3 rounded-lg bg-orange-50 w-fit mb-4">
              <Users className="h-5 w-5 text-cta" />
            </div>
            <h2 className="text-lg font-display font-semibold text-text mb-2 group-hover:text-cta transition-colors duration-200">
              Leads
            </h2>
            <p className="text-sm text-text-muted">
              View and manage contact form submissions.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
