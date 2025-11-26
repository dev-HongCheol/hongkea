import CategoryForm from "@/features/category-management/ui/CategoryForm";
import CategoryTreeList from "@/features/category-management/ui/CategoryTreeList";

const page = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CategoryTreeList />
      <CategoryForm />
    </div>
  );
};

export default page;
