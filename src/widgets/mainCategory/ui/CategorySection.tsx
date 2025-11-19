import CategoryCardList from "./CategoryCardList";

const CategorySection = () => {
  return (
    <section className="mt-14">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Browse The Range</h2>
        <p>장소를 선택하세요.</p>
      </div>

      <CategoryCardList />
    </section>
  );
};

export default CategorySection;
