import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-[#161C2D] mb-2">Page not found</h1>
      <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist or was moved.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#161C2D] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Go to VeriPay
      </Link>
    </div>
  );
}
