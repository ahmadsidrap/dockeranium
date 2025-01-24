export default function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">{error}</p>
    </div>
  );
}
