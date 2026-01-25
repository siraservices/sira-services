import Link from "next/link";
import { FileText, Users } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/posts"
            className="block p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Blog Posts</h2>
            <p className="text-gray-600">
              Create, edit, and manage your blog posts.
            </p>
          </Link>

          <Link
            href="/admin/leads"
            className="block p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Leads</h2>
            <p className="text-gray-600">
              View and manage contact form submissions.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
