// The SVG icon component remains the same
const ServerIcon = () => (
  <svg
    className="mb-5 h-20 w-20 text-slate-800" // Use Tailwind classes for size and margin
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor" // Inherit color from parent
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <rect x="3" y="4" width="18" height="8" rx="3" />
    <rect x="3" y="12" width="18" height="8" rx="3" />
    <line x1="7" y1="8" x2="7" y2="8.01" />
    <line x1="7" y1="16" x2="7" y2="16.01" />
    {/* This cross indicates an error state */}
    <line
      x1="15"
      y1="14"
      x2="19"
      y2="18"
      className="stroke-red-500"
      strokeWidth="2"
    />
    <line
      x1="19"
      y1="14"
      x2="15"
      y2="18"
      className="stroke-red-500"
      strokeWidth="2"
    />
  </svg>
);

const ServerErrorPage = () => {
  // Function to handle click - redirects to the homepage
  const goToHomepage = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-5 font-sans text-gray-800">
      <div className="text-center">
        <ServerIcon />
        <h1 className="mb-3 text-4xl font-bold text-slate-800 md:text-5xl">
          500 - Вътрешна грешка в сървъра
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-gray-600">
          Опа! Нещо се обърка от наша страна. Моля, опитайте да презаредите
          страницата и, ако проблемът все още е наличен, се свържете със
          системния администратор.
        </p>
        <button
          onClick={goToHomepage}
          className="rounded-full bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/40 transition-transform duration-200 ease-in-out hover:bg-blue-600 hover:shadow-xl hover:-translate-y-1"
        >
          Върнете се към началото
        </button>
      </div>
    </div>
  );
};

export default ServerErrorPage;
