import React from 'react';
import { FavoriteItem } from '../types';
import { Bookmark, X, MapPin, Trash2 } from 'lucide-react';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onSelectFavorite: (fav: FavoriteItem) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        id="favorites-modal"
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleUp"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Saved Favorite Cities
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 max-h-80 overflow-y-auto space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No favorite cities saved yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any city card to save it for quick access!
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-600/50 transition group"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectFavorite(fav);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {fav.name}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {fav.country}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavorite(fav.id)}
                  title="Remove from favorites"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
