document.addEventListener('DOMContentLoaded', async () => {
  const unauthView = document.getElementById('unauth-view');
  const authView = document.getElementById('auth-view');
  
  const tokenInput = document.getElementById('token-input');
  const saveBtn = document.getElementById('save-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const syncBtn = document.getElementById('sync-btn');
  const blockCount = document.getElementById('block-count');

  // Check state
  const { apiToken } = await chrome.storage.local.get(['apiToken']);
  
  if (apiToken) {
    unauthView.style.display = 'none';
    authView.style.display = 'block';
    updateStats();
  }

  saveBtn.addEventListener('click', async () => {
    const val = tokenInput.value.trim();
    if (!val) return;
    
    // Test token
    try {
      saveBtn.innerText = 'Verificando...';
      const res = await fetch('https://gambtroy.onrender.com/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${val}` }
      });
      if (!res.ok) throw new Error('Token inválido');
      
      await chrome.storage.local.set({ apiToken: val });
      
      // Tell background to sync
      chrome.runtime.sendMessage({ action: 'sync_blocklist' });

      unauthView.style.display = 'none';
      authView.style.display = 'block';
      updateStats();
    } catch(e) {
      alert('Token rehusado. Revisa que lo hayas copiado bien de tu panel.');
      saveBtn.innerText = 'Vincular Dispositivo';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    const ok = confirm("Alerta: Desactivar la protección puede ser notificado a tu guardián. ¿Deseas continuar?");
    if (ok) {
      await chrome.storage.local.remove(['apiToken', 'blockCount']);
      // Clear all rules
      chrome.runtime.sendMessage({ action: 'clear_rules' });
      unauthView.style.display = 'block';
      authView.style.display = 'none';
    }
  });

  syncBtn.addEventListener('click', () => {
    syncBtn.innerText = 'Sincronizando...';
    chrome.runtime.sendMessage({ action: 'sync_blocklist' }, () => {
      setTimeout(() => {
        syncBtn.innerText = 'Sincronizar Manualmente';
        updateStats();
      }, 1000);
    });
  });

  async function updateStats() {
    const data = await chrome.storage.local.get(['blockCount']);
    blockCount.innerText = data.blockCount || '0';
  }
});
