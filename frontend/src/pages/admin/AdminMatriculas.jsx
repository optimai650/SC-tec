import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { getMatriculas, importMatriculas } from '../../services/admin';

export default function AdminMatriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    getMatriculas().then(setMatriculas).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const previewCount = csv.split('\n').filter(l => l.trim()).length;

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importMatriculas(csv);
      setImportResult(result);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsv(ev.target.result);
    reader.readAsText(file);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCsv('');
    setImportResult(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Matrículas</h1>
            <p className="text-gray-500 text-sm">{matriculas.length} matrículas registradas</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>+ Importar matrículas</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Matrícula</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Importada</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map(m => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-[#003087]">{m.matricula}</td>
                    <td className="px-4 py-3 text-gray-700">{m.nombre || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(m.importedAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matriculas.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">🎓</div>
                <p>No hay matrículas registradas. Importa desde un CSV.</p>
              </div>
            )}
          </div>
        )}

        {/* Import Modal */}
        <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Importar matrículas" size="lg">
          {!importResult ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Formato CSV:</p>
                <p>Una matrícula por línea. Opcional: nombre y email.</p>
                <code className="block mt-2 bg-white border rounded p-2 font-mono text-xs">
                  A01234567,Juan Pérez,juan@tec.mx<br />
                  A01234568,María López<br />
                  A01234569
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pegar CSV</label>
                <textarea
                  value={csv}
                  onChange={e => setCsv(e.target.value)}
                  rows={8}
                  placeholder="A01234567,Nombre Apellido,email@tec.mx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] font-mono text-sm"
                />
                {csv && (
                  <p className="mt-1 text-sm text-gray-500">
                    {previewCount} matrícula{previewCount !== 1 ? 's' : ''} para importar
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O subir archivo .csv</label>
                <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFile} className="text-sm text-gray-600" />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImport} loading={importing} disabled={!csv.trim()}>
                  Importar {previewCount > 0 ? `(${previewCount})` : ''}
                </Button>
                <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-xl font-bold text-green-700">{importResult.imported} importadas</p>
                <p className="text-sm text-gray-600">de {importResult.total} líneas procesadas</p>
              </div>
              {importResult.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-700 mb-2">Errores ({importResult.errors.length}):</p>
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-sm text-red-600">{e.matricula}: {e.error}</p>
                  ))}
                </div>
              )}
              <Button onClick={handleCloseModal} className="w-full">Cerrar</Button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
