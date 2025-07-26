import { create } from 'zustand';

// UI state for dashboard
interface DashboardUIState {
  activeSection: 'profile' | 'balance' | 'summary';
  showUserMenu: boolean;
}

interface DashboardUIActions {
  setActiveSection: (section: 'profile' | 'balance' | 'summary') => void;
  setShowUserMenu: (show: boolean) => void;
  toggleUserMenu: () => void;
}

type DashboardUIStore = DashboardUIState & DashboardUIActions;

const INITIAL_STATE: DashboardUIState = {
  activeSection: 'profile',
  showUserMenu: false,
};

export const useDashboardUIStore = create<DashboardUIStore>((set, get) => ({
  ...INITIAL_STATE,

  setActiveSection: section => {
    set({ activeSection: section });
  },

  setShowUserMenu: show => {
    set({ showUserMenu: show });
  },

  toggleUserMenu: () => {
    set({ showUserMenu: !get().showUserMenu });
  },
}));

// Selector hooks
export const useDashboardUI = () => {
  const { activeSection, showUserMenu } = useDashboardUIStore();
  return { activeSection, showUserMenu };
};

export const useDashboardUIActions = () => {
  const { setActiveSection, setShowUserMenu, toggleUserMenu } =
    useDashboardUIStore();
  return { setActiveSection, setShowUserMenu, toggleUserMenu };
};
