import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors"
    >
      ← Atrás
    </button>
  );
}
