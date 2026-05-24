import Link from "next/link";

const Custom404 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-blue-600">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Page not found
        </h2>

        <p className="mt-2 text-gray-600">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition no-underline"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
