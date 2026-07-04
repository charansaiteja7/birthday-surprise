/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const PhotoContext = createContext(null);
const STORAGE_KEY = 'birthday-surprise-gallery';

function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function PhotoProvider({ children }) {
  const [photos, setPhotos] = useState(() => loadPhotos());

  const addPhotos = useCallback((files) => {
    const readers = Array.from(files).map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        src: reader.result,
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));

    return Promise.all(readers).then((items) => {
      setPhotos((current) => {
        const next = [...items, ...current];
        savePhotos(next);
        return next;
      });
    });
  }, []);

  const deletePhoto = useCallback((id) => {
    setPhotos((current) => {
      const next = current.filter((photo) => photo.id !== id);
      savePhotos(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ photos, addPhotos, deletePhoto }), [photos, addPhotos, deletePhoto]);

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
}

export function usePhotos() {
  const value = useContext(PhotoContext);
  if (!value) throw new Error('usePhotos must be used inside PhotoProvider');
  return value;
}
