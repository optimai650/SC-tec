export default function PublicNavbar() {
  return (
    <nav className="bg-[#003087] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#003087] font-bold text-sm">T</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none block">Feria de Servicio Social</span>
              <span className="text-blue-200 text-xs">Tecnológico de Monterrey</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
