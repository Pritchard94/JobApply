"use client";

import { create } from "zustand";

type NotificationType = "error" | "success" | "info";

interface NotificationState {
  title: string;
  message: string;
  isOpen: boolean;
  type: NotificationType;
  show: (message: string, title?: string, type?: NotificationType) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  title: "",
  message: "",
  isOpen: false,
  type: "info",
  show: (message, title = "Notice", type = "info") =>
    set({ message, title, type, isOpen: true }),
  showError: (message, title = "Error") =>
    set({ message, title, type: "error", isOpen: true }),
  showSuccess: (message, title = "Success") =>
    set({ message, title, type: "success", isOpen: true }),
  hide: () => set({ isOpen: false }),
}));
