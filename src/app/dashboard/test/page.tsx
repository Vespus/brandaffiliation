'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [testValue, setTestValue] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestValue() {
      try {
        const response = await fetch('/api/test');
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Test-Wertes');
        }
        const data = await response.json();
        setTestValue(data.value);
        setEditedValue(data.value || '');
      } catch (err) {
        setError('Fehler beim Laden des Test-Wertes');
      } finally {
        setLoading(false);
      }
    }

    fetchTestValue();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: editedValue }),
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Test-Wertes');
      }
      
      const data = await response.json();
      setTestValue(data.value);
      setSuccess('Test-Wert erfolgreich gespeichert');
    } catch (err) {
      setError('Fehler beim Speichern des Test-Wertes');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: null }),
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Zurücksetzen des Test-Wertes');
      }
      
      const data = await response.json();
      setTestValue(data.value);
      setEditedValue(data.value || '');
      setSuccess('Test-Wert erfolgreich zurückgesetzt');
    } catch (err) {
      setError('Fehler beim Zurücksetzen des Test-Wertes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test-Route</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">VERCEL_TEST Umgebungsvariable:</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm font-mono">{testValue || 'Nicht gesetzt'}</code>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="testValue" className="block text-sm font-medium text-gray-700">
                Neuer Wert:
              </label>
              <input
                type="text"
                id="testValue"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Neuen Wert eingeben"
              />
            </div>
            
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              
              <button
                onClick={handleReset}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {saving ? 'Zurücksetzen...' : 'Zurücksetzen'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <h3 className="font-medium mb-2">Hinweis:</h3>
            <p className="text-sm">
              Änderungen an dieser Variable sind nur für die Laufzeit gültig. Nach einem Neustart der Anwendung wird der Standardwert aus der Vercel-Umgebungsvariable wiederhergestellt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 