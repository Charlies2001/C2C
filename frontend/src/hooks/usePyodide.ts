import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { initPyodide } from '../services/pyodide';

export function usePyodide() {
  const setPyodideReady = useStore((s) => s.setPyodideReady);

  useEffect(() => {
    initPyodide().then(() => setPyodideReady(true)).catch(console.error);
  }, [setPyodideReady]);
}
