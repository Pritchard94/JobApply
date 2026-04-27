export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">&#128268;</div>
        <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          AutoApply requires an internet connection to search for jobs and send
          applications. Please check your connection and try again.
        </p>
      </div>
    </div>
  );
}
