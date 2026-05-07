import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black tracking-tight text-black mb-6">404</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          The page or app you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/" className="inline-flex px-8 py-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-lg">
          Return Home
        </Link>
      </div>
    </div>
  );
}
