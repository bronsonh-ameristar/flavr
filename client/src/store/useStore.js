import { create } from 'zustand';

const useStore = create((set) => ({
    // Theme State
    isDarkMode: (() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.getAttribute('data-theme') === 'dark';
        }
        return true; // Default fallback
    })(),

    toggleTheme: () => set((state) => {
        const newIsDarkMode = !state.isDarkMode;
        const newTheme = newIsDarkMode ? 'dark' : 'light';

        // Update DOM and localStorage
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        return { isDarkMode: newIsDarkMode };
    }),

    // Future state slices (Meal Plans, Grocery List) can be added here
    // mealPlans: [],
    // setMealPlans: (plans) => set({ mealPlans: plans }),
}));

export default useStore;
