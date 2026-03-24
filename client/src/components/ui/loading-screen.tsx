export function LoadingScreen() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="surface-card flex items-center gap-3 rounded-full px-5 py-3 text-sm text-[rgb(var(--muted))]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[rgb(var(--primary))]" />
        Loading workspace
      </div>
    </div>
  );
}
