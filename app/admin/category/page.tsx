import CategoryForm from "@/features/category-management/ui/CategoryForm";
import CategoryTreeList from "@/features/category-management/ui/CategoryTreeList";

const page = () => {
  return (
    <div className="flex gap-4 px-4">
      <CategoryTreeList />
      <CategoryForm />
    </div>
  );
};

export default page;
