"use client";

import { AlertCircle, XCircle, CheckCircle2, Info } from "lucide-react";
import { Modal, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notification";
import { cn } from "@/lib/utils";

export function NotificationModal() {
  const { isOpen, title, message, type, hide } = useNotificationStore();

  const config = {
    error: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      shadow: "shadow-destructive/10",
      button: "destructive",
    },
    success: {
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      shadow: "shadow-success/10",
      button: "success",
    },
    info: {
      icon: Info,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      shadow: "shadow-primary/10",
      button: "default",
    },
  }[type];

  const Icon = config.icon;

  return (
    <Modal open={isOpen} onClose={hide} className={cn("max-w-md", config.border, config.shadow)}>
      <ModalHeader className="flex flex-col items-center text-center">
        <div className={cn("mb-4 rounded-full p-3", config.bg)}>
          <Icon className={cn("h-8 w-8", config.color)} />
        </div>
        <ModalTitle className={cn("text-xl", config.color)}>{title}</ModalTitle>
        <ModalDescription className="mt-2 text-base leading-relaxed">
          {message}
        </ModalDescription>
      </ModalHeader>
      
      <div className="mt-6 flex justify-center">
        <Button 
          variant={config.button as any} 
          onClick={hide}
          className="min-w-[120px] rounded-lg"
        >
          {type === "error" ? "Close" : "Got it"}
        </Button>
      </div>
    </Modal>
  );
}
