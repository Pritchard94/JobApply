const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (err) {
    console.error("SW registration failed:", err);
    return null;
  }
}

export async function subscribeToPush(registration: ServiceWorkerRegistration) {
  if (!("PushManager" in window)) return null;

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY,
      ) as BufferSource,
    });

    return {
      endpoint: subscription.endpoint,
      p256dh_key: btoa(
        String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)),
      ),
      auth_key: btoa(
        String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)),
      ),
    };
  } catch (err) {
    console.error("Push subscription failed:", err);
    return null;
  }
}

export async function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushPermission() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}
