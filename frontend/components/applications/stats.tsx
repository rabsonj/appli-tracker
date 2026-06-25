import { Application } from "@/types"

export default function ApplicationsStats({
    applications
}: { applications: Application[] }) {
    const submitted = applications.filter((a) => a.status === "submitted").length;
    const underReview = applications.filter(
        (a) => a.status === "under_review"
    ).length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;

    return (
        <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: applications.length, className: "" },
          {
            label: "Submitted",
            value: submitted,
            className: "text-blue-600",
          },
          {
            label: "Under Review",
            value: underReview,
            className: "text-yellow-600",
          },
          {
            label: "Approved",
            value: approved,
            className: "text-green-600",
          },
          {
            label: "Rejected",
            value: rejected,
            className: "text-red-600",
          },
        ].map(({ label, value, className }) => (
          <div key={label} className="rounded-md bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-xl font-medium ${className}`}>{value}</p>
          </div>
        ))}
      </div>
    )
}