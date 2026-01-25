"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Trash2, Mail, Building, MessageSquare } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

export default function AdminLeadsPage() {
  const leads = useQuery(api.leads.list, {});
  const updateStatus = useMutation(api.leads.updateStatus);
  const deleteLead = useMutation(api.leads.remove);

  const handleStatusChange = async (id: Id<"leads">, status: string) => {
    await updateStatus({ id, status });
  };

  const handleDelete = async (id: Id<"leads">) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead({ id });
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Leads</h1>

        {leads === undefined ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leads yet. They&apos;ll appear here when someone submits the contact
            form.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead._id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-blue-600"
                        >
                          {lead.email}
                        </a>
                      </span>
                      {lead.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {lead.company}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead._id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded border-0 ${statusColors[lead.status] || statusColors.new}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-700">{lead.message}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Submitted {format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  {lead.source && ` · Source: ${lead.source}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
