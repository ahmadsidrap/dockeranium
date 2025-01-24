import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchInput from "./components/search-input";

export default function NetworksPage() {
  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Networks</h2>
        </div>
        <SearchInput />
      </div>
    </DashboardLayout>
  );
}
