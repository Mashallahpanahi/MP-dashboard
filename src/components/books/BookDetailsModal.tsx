// src/components/books/BookDetailsModal.tsx
import type { Book } from "@/types/book";

interface BookDetailsModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

const BookDetailsModal = ({
  isOpen,
  book,
  onClose,
}: BookDetailsModalProps) => {
  if (!isOpen || !book) return null;

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      return '$0.00';
    }
    return `$${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <span className="w-1/3 text-sm font-medium text-gray-600">{label}</span>
      <span className="w-2/3 text-sm text-gray-900 break-all">
        {value !== null && value !== undefined && value !== '' ? String(value) : '—'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Book Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete information for this book
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Book Title Section */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h2 className="text-2xl font-bold text-blue-900">{book.name}</h2>
            {book.code && (
              <p className="mt-1 text-sm text-blue-700">
                Code: <span className="font-mono">{book.code}</span>
              </p>
            )}
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Basic Information
              </h4>
              <InfoRow label="Book Name" value={book.name} />
              <InfoRow label="Code" value={book.code} />
              <InfoRow label="ISBN" value={book.isbn} />
              <InfoRow label="Level" value={book.level} />
              <InfoRow label="Category" value={book.category} />
              <InfoRow label="Level Order" value={book.levelOrder} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Academic Details
              </h4>
              <InfoRow label="Duration (Weeks)" value={book.durationWeeks} />
              <InfoRow label="Passing Score" value={book.passingScore + '%'} />
              <InfoRow label="Total Lessons" value={book.totalLessons} />
              <InfoRow label="Total Hours" value={book.totalHours} />
              <InfoRow label="Price" value={formatPrice(book.bookPrice)} />
              <InfoRow label="Status" value={book.isActive ? 'Active' : 'Inactive'} />
            </div>
          </div>

          {/* Author & Publisher */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Author & Publisher
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <InfoRow label="Author" value={book.author} />
              <InfoRow label="Publisher" value={book.publisher} />
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Description
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {book.description}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              System Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <InfoRow label="Created At" value={formatDate(book.createdAt)} />
              <InfoRow label="Updated At" value={formatDate(book.updatedAt)} />
              <InfoRow label="ID" value={book.id} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;