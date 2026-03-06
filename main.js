/* ═══════════════════════════════════════════════
   main.js — Bootstrap
   ═══════════════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', async () => {
  // Init panels — stay hidden until PlayFab inventory confirms access
  Owner.init();
  Dev.init();

  // Init UI — handles login, auto-login, leaderboard, shop etc.
  await UI.init();

  console.log('%c🧟 Zombie Tower Defence', 'color:#e74c3c;font-size:18px;font-weight:bold');
  console.log('%cPlayFab Title: 100286 | Catalog: ZTD_Cosmetics_v1', 'color:#2ecc71');
  console.log('%cPanels: owner_panel → 👑 Owner | mod_panel → 🛡 Mod | dev_panel → ⚙️ Dev', 'color:#ff6b35');
});

