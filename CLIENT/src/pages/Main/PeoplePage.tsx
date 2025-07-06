const PeoplePage = () => {
  return (
    <div className="p-4 w-full flex flex-col bg-red-400 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧑 People</h1>
      </div>

      <div className="w-full h-60 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
        No people detected yet.
      </div>
    </div>
  );
};
