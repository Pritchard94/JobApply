"use client";

export default function SearchProfileEditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Edit Search Profile</h1>
      <p className="text-muted-foreground mt-1">Profile ID: {params.id}</p>
      {/* Full edit form will be connected to API */}
    </div>
  );
}
