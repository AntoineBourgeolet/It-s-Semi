// Notification system for It's Semi

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn("Les notifications ne sont pas supportées par ce navigateur.");
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Show confirmation notification
    showLocalNotification(
      "🔔 It's Semi : Notifications activées !",
      "Super ! Vous serez alerté en cas d'épisode météo critique ou au début d'un nouveau mois de semis."
    );
  }
  return permission;
}

export function checkNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function showLocalNotification(title: string, body: string, options: NotificationOptions = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions: any = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/mask-icon.svg',
    vibrate: [200, 100, 200],
    ...options
  };

  // If service worker registration is available, prefer using registration.showNotification for robust PWA behavior
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        registration.showNotification(title, defaultOptions);
        return;
      }
    } catch (e) {
      console.warn("Le Service Worker n'est pas prêt, utilisation de la notification standard:", e);
    }
  }

  // Fallback to standard client browser notification
  try {
    new Notification(title, defaultOptions);
  } catch (e) {
    console.error("Impossible d'afficher la notification standard:", e);
  }
}

/**
 * Triggers monthly notifications when the month transitions
 */
export function triggerMonthNotification(monthName: string) {
  // Load settings
  let enabled = true;
  try {
    const saved = localStorage.getItem('itssemi_notif_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.sowMonth === false) enabled = false;
    }
  } catch (e) {}
  if (!enabled) return;

  const currentMonthIdx = new Date().getMonth();
  const storageKey = 'itssemi_last_notified_month';
  const lastMonth = localStorage.getItem(storageKey);

  if (lastMonth !== String(currentMonthIdx)) {
    // Save to prevent repeat notification
    localStorage.setItem(storageKey, String(currentMonthIdx));

    showLocalNotification(
      `🌱 Nouveau mois, nouveaux semis !`,
      `Nous sommes en ${monthName}. Ouvrez It's Semi pour voir la liste des variétés phares à planter ce mois-ci !`
    );
  }
}

/**
 * Triggers daily weather notifications if there are severe warnings and plants are in garden
 */
export function triggerWeatherAlertNotification(alertsCount: number, alertMessage: string) {
  if (alertsCount <= 0) return;

  // Load settings
  let enabled = true;
  try {
    const saved = localStorage.getItem('itssemi_notif_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.weather === false) enabled = false;
    }
  } catch (e) {}
  if (!enabled) return;

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const storageKey = 'itssemi_last_weather_alert_date';
  const lastAlertDate = localStorage.getItem(storageKey);

  // Notify max once per day about weather risks to prevent spamming
  if (lastAlertDate !== todayStr) {
    localStorage.setItem(storageKey, todayStr);

    showLocalNotification(
      `⚠️ Alerte météo - Protégez vos plantes !`,
      `${alertMessage}. Des mesures de protection des semis ou des plants peuvent être requises.`
    );
  }
}

/**
 * Sends a confirmation notification when a notification channel is activated
 */
export function notifyStatusChanged(type: 'weather' | 'sowMonth' | 'tips', active: boolean) {
  if (!active) return; // Only notify on activation
  
  if (type === 'weather') {
    showLocalNotification(
      "❄️ Alertes Météo activées ! 🌿",
      "Vous recevrez désormais des alertes météo locales et des avertissements de risques de gel pour vos plantes."
    );
  } else if (type === 'sowMonth') {
    showLocalNotification(
      "🌱 Rappels de semis activés ! 🗓️",
      "Vous serez prévenu au début de chaque mois pour connaître les variétés phares à planter !"
    );
  } else if (type === 'tips') {
    showLocalNotification(
      "💡 Conseils et astuces activés ! 💧",
      "C'est parti ! Vous recevrez régulièrement des conseils et astuces d'arrosage, de paillage ou de récolte."
    );
  }
}

/**
 * Test utility to immediately trigger a nice gardeners notification
 */
export function triggerTestNotification(type: 'weather' | 'month' | 'tip') {
  if (type === 'weather') {
    showLocalNotification(
      "⚠️ Alerte météo (Simulée) - Protégez vos plants !",
      "Risque de gelée matinale prévue sous les 4°C. Pensez à couvrir vos jeunes pousses avec un voile de forçage !"
    );
  } else if (type === 'month') {
    showLocalNotification(
      "🌱 Nouveau mois de semis (Simulé) !",
      "Nous entamons un nouveau cycle ! Cap de semer des tomates cerises, des courgettes ou du basilic en pleine terre ce mois-ci."
    );
  } else {
    showLocalNotification(
      "💧 Conseil potager : Arrosage malin",
      "Arrosez de préférence tôt le matin ou tard le soir pour limiter l'évaporation de l'eau et optimiser la vigueur des racines."
    );
  }
}
