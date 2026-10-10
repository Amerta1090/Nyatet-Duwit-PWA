import { create } from 'zustand';

interface DataState {
  revision: number;
  bumpRevision: () => void;
}

/**
 * Global "data berubah" signal.
 *
 * Setiap kali repositori menulis ke database lokal, `notifyDataChanged()`
 * dipanggil sehingga komponen yang menampilkan data turunan (widget ringkasan
 * di Home, dll.) bisa me-refresh datanya — bukan hanya saat mount pertama.
 */
export const useDataStore = create<DataState>((set) => ({
  revision: 0,
  bumpRevision: () => set((state) => ({ revision: state.revision + 1 })),
}));

/** Panggil dari data layer (bukan React) setelah mutasi DB selesai. */
export function notifyDataChanged(): void {
  useDataStore.getState().bumpRevision();
}