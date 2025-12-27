import { create } from 'zustand';

interface UIState {
    mobileMenuOpen: boolean;
    searchOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    setSearchOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    toggleSearch: () => void;

    // Can add more global state here like 'themeMode' or 'authModalOpen'
}

export const useUIStore = create<UIState>((set) => ({
    mobileMenuOpen: false,
    searchOpen: false,

    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    setSearchOpen: (open) => set({ searchOpen: open }),

    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
}));

// Export a hook for convenience (Zustand typically returns the hook directly)
export const useGlobalState = useUIStore;
