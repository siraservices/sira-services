"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Trash2, Mail, Building, MessageSquare } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  new: "bg-primary-50 text-primary",
  contacted: "bg-primary-50 text-primary-light",
  qualified: "bg-primary-50 text-primary",
  closed: "bg-primary-50 text-text-dim",
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
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text mb-8">Leads</h1>

        {leads === undefined ? (
          <div className="flex items-center gap-3 justify-center py-12 text-text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Loading...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No leads yet. They&apos;ll appear here when someone submits the
            contact form.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead._id}
                className="p-5 bg-surface-alt shadow-soft border border-surface-border rounded-xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-text">
                      {lead.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-text-muted mt-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-primary transition-colors duration-200"
                        >
                          {lead.email}
                        </a>
                      </span>
                      {lead.company && (
                        <span className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5" />
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
                      className={`text-xs font-display font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-colors duration-200 ${statusColors[lead.status] || statusColors.new}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-surface-muted border border-surface-border rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-text-dim mt-0.5" />
                    <p className="text-sm text-text-muted">{lead.message}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-text-dim">
                  Submitted{" "}
                  {format(
                    new Date(lead.createdAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
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
