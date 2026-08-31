var firebaseConfig = {
  apiKey: "AIzaSyBC8ukohMx1yqiKWMPRmBHmUt_aYnyy2bM",
  authDomain: "minua-95068.firebaseapp.com",
  databaseURL: "https://minua-95068-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "minua-95068",
  storageBucket: "minua-95068.firebasestorage.app",
  messagingSenderId: "451698384504",
  appId: "1:451698384504:web:31f8acf1d577e67a13978d",
  measurementId: "G-6MWLFWK5T4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();
var db = firebase.database();

var currentRoomCode = null;
var roomListenerRef = null;

var savedUser = null;
try {
  savedUser = localStorage.getItem('nexus_user');
} catch (e) {
  console.warn('Storage access blocked:', e);
}

auth.onAuthStateChanged((user) => {
  if (user || (savedUser && savedUser !== "null")) {
    const username = user ? (user.displayName || user.email.split('@')[0]) : savedUser;
    loadMainPage(username);
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener('DOMContentLoaded', () => {
  const welcomeView = document.getElementById('welcome-view');
  const signupView = document.getElementById('signup-view');
  const loginView = document.getElementById('login-view');

  const goToSignupBtn = document.getElementById('go-to-signup');
  const goToLoginBtn = document.getElementById('go-to-login');
  const backFromSignup = document.getElementById('back-from-signup');
  const backFromLogin = document.getElementById('back-from-login');

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (goToSignupBtn) {
    goToSignupBtn.addEventListener('click', () => {
      welcomeView.classList.add('hidden');
      signupView.classList.remove('hidden');
    });
  }

  if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', () => {
      welcomeView.classList.add('hidden');
      loginView.classList.remove('hidden');
    });
  }

  if (backFromSignup) {
    backFromSignup.addEventListener('click', () => {
      signupView.classList.add('hidden');
      welcomeView.classList.remove('hidden');
    });
  }

  if (backFromLogin) {
    backFromLogin.addEventListener('click', () => {
      loginView.classList.add('hidden');
      welcomeView.classList.remove('hidden');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('li-email').value.trim();
      const passInput = document.getElementById('li-pass').value;

      auth.signInWithEmailAndPassword(emailInput, passInput)
        .then(() => {
          const username = emailInput.split('@')[0];
          localStorage.setItem('nexus_user', username);
          alert("✅ Welcome back!");
          loadMainPage(username);
        })
        .catch((error) => {
          alert(`⚠️ Login Failed: ${error.message}`);
        });
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('su-email').value.trim();
      const userInput = document.getElementById('su-user').value.trim();
      const passInput = document.getElementById('su-pass').value;

      if (!isValidEmail(emailInput)) {
        alert("⚠️ Error: Please enter a valid email address.");
        return;
      }

      if (passInput.length < 6) {
        alert("⚠️ Error: Password must be at least 6 characters long.");
        return;
      }

      auth.createUserWithEmailAndPassword(emailInput, passInput)
        .then(() => {
          localStorage.setItem('nexus_user', userInput);
          alert("✅ Account created successfully!");
          loadMainPage(userInput);
        })
        .catch((error) => {
          alert(`⚠️ Sign Up Failed: ${error.message}`);
        });
    });
  }
});

function loadMainPage(username) {
  if (!document.getElementById('cropper-css')) {
    const css = document.createElement('link');
    css.id = 'cropper-css';
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
    document.head.appendChild(js);
  }

  const body = document.querySelector('body');
  
  const savedDataKey = `nexus_profile_${username}`;
  let savedProfile = JSON.parse(localStorage.getItem(savedDataKey)) || { 
    image: '', 
    bio: '', 
    squareBg: '#6366f1', 
    boxBg: '#f8f9fa', 
    pageBg: '#ffffff',
    posX: 50, 
    posY: 50 
  };

  body.innerHTML = `
    <!-- MAIN PAGE VIEW -->
    <div id="main-page-view">
      <div class="external-header">
        <div id="room-controls-wrapper" style="display: flex; gap: 8px;">
          <button id="create-room-btn" class="btn-room" style="padding: 6px 12px; background: #ffffff; color: black; border: 2px solid #000000; border-radius: 1px; cursor: pointer; font-weight: 600;">Create Room</button>
          <button id="join-room-btn" class="btn-room" style="padding: 6px 12px; background: #ffffff; color: black; border: 2px solid #000000; border-radius: 1px; cursor: pointer; font-weight: 600;">Join Room</button>
        </div>

        <div id="room-status-badge" class="hidden" style="display: flex; align-items: center; gap: 10px; background: #ffffff; padding: 4px 12px; border-radius: 1px; border: 4px solid #000000; font-size: 0.85rem;">
          <span style="color: #374151;">Room: <b id="current-room-display" style="color: #4f46e5;">NONE</b></span>
          <button id="leave-room-btn" style="padding: 3px 8px; background: #ffffff; color: black; border: 1px solid #000000 border-radius: 1px; cursor: pointer; font-weight: 600; font-size: 0.75rem;">Leave Room</button>
        </div>

        <span class="user-display" style="margin-left: auto;">Logged in as: <b>${username}</b></span>
        <button id="customize-btn" class="btn-customize">Customize 🎨</button>
        <button id="settings-btn" class="btn-secondary-custom">Settings ⚙️</button>
      </div>

      <div id="custom-modal" class="custom-modal hidden">
        <div class="modal-content">
          <h3>Customize Your Space</h3>
          <div class="custom-section">
            <label>Outside Box Background Color</label>
            <input type="color" id="picker-page-bg" value="${savedProfile.pageBg}">
          </div>
          <div class="custom-section">
            <label>Big Box Background Color</label>
            <input type="color" id="picker-box-bg" value="${savedProfile.boxBg}">
          </div>
          <div class="custom-section">
            <label>Square Background Color</label>
            <input type="color" id="picker-square-bg" value="${savedProfile.squareBg}">
          </div>
          <div class="custom-section">
            <label>Square Profile Picture</label>
            <button id="modal-upload-btn" class="btn-secondary-custom">Upload Photo</button>
            <input type="file" id="modal-image-upload" accept="image/*" style="display: none;">
          </div>
          <button id="close-modal-btn" class="btn-primary-custom">Done</button>
        </div>
      </div>

      <div class="blank-main-page" id="page-wrapper" style="background: ${savedProfile.pageBg};">
        <div class="big-box" id="big-box" style="background: ${savedProfile.boxBg};">
          <div class="draggable-square" id="draggable-square" style="background: ${savedProfile.squareBg}; left: ${savedProfile.posX || 50}px; top: ${savedProfile.posY || 50}px;">
            <div class="square-username">${username}</div>
            <input type="file" id="image-upload" accept="image/*" style="display: none;">
            <div class="profile-image-container" id="upload-trigger" title="Click to upload image">
              ${savedProfile.image ? `<img src="${savedProfile.image}" alt="Profile Image">` : `<span class="upload-placeholder">📷</span>`}
            </div>
            <div class="profile-bio" id="profile-bio" contenteditable="true" placeholder="Add your bio...">${savedProfile.bio || ''}</div>
          </div>
        </div>
      </div>

      <div id="room-chat-box" class="chat-box hidden minimized">
        <div id="chat-header" class="chat-header">
          <span>Room Chat</span>
          <button id="chat-toggle-btn" class="chat-toggle-btn">▲</button>
        </div>
        <div id="chat-body" class="chat-body">
          <div id="chat-messages" class="chat-messages"></div>
          <form id="chat-form" class="chat-form">
            <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off" />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>

    <!-- SETTINGS PAGE VIEW -->
    <div id="settings-page-view" class="hidden">
      <button id="back-from-settings" class="btn-back">← Back</button>
      <h2>Settings</h2>

      <!-- Account Info -->
      <div class="settings-section">
        <h3>Account Information</h3>
        <button id="change-username-btn" class="settings-btn-item">Change Username</button>
        <button id="change-password-btn" class="settings-btn-item">Change Password</button>
        <button id="change-email-btn" class="settings-btn-item">Change Email</button>
        
        <div class="avatar-upload-group">
          <label style="font-weight:600; display:block; margin-top:8px; margin-bottom:4px;">Change Profile Picture:</label>
          <input type="file" id="cropper-file-input" accept="image/*">
          <div id="cropper-wrapper" class="hidden">
            <img id="cropper-image-preview" src="" alt="Preview">
            <button id="crop-save-btn" class="btn-back" style="margin-top:10px;">Save Cropped Picture</button>
          </div>
        </div>
        <button class="settings-btn-item logout-item" id="logout-btn" style="margin-top:10px;">Log Out</button>
      </div>

      <!-- Notifications -->
      <div class="settings-section">
        <h3>Notifications</h3>
        <label style="display:flex; gap:10px; align-items:center; font-size:0.9rem;">
          <input type="checkbox" id="notify-friend-req" checked>
          Notify when someone adds you as a friend
        </label>
      </div>

      <!-- Customization -->
      <div class="settings-section">
        <h3>Personal Customization</h3>
        
        <div class="picker-group">
          <label>Outside Box Background:</label>
          <input type="color" id="settings-outside-bg" value="${savedProfile.pageBg}">
        </div>
        <div class="picker-group">
          <label>Outside Box Gradient (optional):</label>
          <input type="text" id="gradient-outside-bg" placeholder="linear-gradient(...)">
        </div>

        <div class="picker-group">
          <label>Big Box Background:</label>
          <input type="color" id="settings-big-box-bg" value="${savedProfile.boxBg}">
        </div>
        <div class="picker-group">
          <label>Big Box Gradient (optional):</label>
          <input type="text" id="gradient-big-box-bg" placeholder="linear-gradient(...)">
        </div>

        <div class="picker-group">
          <label>Square Background:</label>
          <input type="color" id="settings-square-bg" value="${savedProfile.squareBg}">
        </div>

        <hr class="section-divider">

        <h3>Room Customizations</h3>
        <p class="subtext">(Room Host Only)</p>
        
        <div class="picker-group">
          <label>Room Background Color:</label>
          <input type="color" id="picker-room-bg" value="#ffffff">
        </div>

        <div class="picker-group">
          <label>Chat Box Color:</label>
          <input type="color" id="picker-chat-bg" value="#4f46e5">
        </div>
      </div>
    </div>
  `;

  const mainStyle = document.createElement('style');
  mainStyle.innerHTML = `
    .blank-main-page { width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; transition: background 0.2s; }
    .external-header { position: absolute; top: 1px; right: 20px; left: 20px; display: flex; align-items: center; gap: 12px; z-index: 100; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #333333; }
    .btn-customize { padding: 6px 12px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
    .btn-customize:hover { background: #4f46e5; }
    .btn-secondary-custom { padding: 6px 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-weight: 600; cursor: pointer; color: #374151; }
    .btn-secondary-custom:hover { background: #e5e7eb; }
    .custom-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: #ffffff; padding: 30px; border-radius: 14px; width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 15px; color: #111; }
    .modal-content h3 { font-size: 1.2rem; margin-bottom: 5px; }
    .custom-section { display: flex; flex-direction: column; gap: 6px; }
    .custom-section label { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
    .custom-section input[type="color"] { width: 100%; height: 40px; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; background: none; padding: 2px; }
    .btn-primary-custom { padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; }
    .btn-primary-custom:hover { background: #4f46e5; }
    .big-box { width: 97vw; height: 90vh; border: 2px solid #000000; border-radius: 1px; position: relative; overflow: hidden; transition: background 0.2s; touch-action: none; }
    .draggable-square { width: 200px; height: 240px; border: 2px solid #000000; border-radius: 1px; position: absolute; cursor: grab; display: flex; flex-direction: column; align-items: center; padding: 15px; transition: background 0.2s; touch-action: none; }
    .draggable-square:active { cursor: grabbing; }
    .square-username { font-weight: bold; margin-bottom: 10px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); pointer-events: none; }
    .profile-image-container { width: 70px; height: 70px; background: #ffffff; border: 2px dashed #333333; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; overflow: hidden; margin-bottom: 12px; flex-shrink: 0; transition: border-color 0.2s; }
    .profile-image-container:hover { border-color: #ffffff; }
    .upload-placeholder { font-size: 1.2rem; }
    .profile-image-container img { width: 100%; height: 100%; object-fit: cover; }
    .profile-bio { width: 100%; flex: 1; background: rgba(255, 255, 255, 0.15); border: 1px dashed rgba(255, 255, 255, 0.4); border-radius: 8px; color: #ffffff; font-size: 0.85rem; padding: 8px; outline: none; text-align: center; overflow-y: auto; word-break: break-word; }
    .profile-bio:empty:before { content: attr(placeholder); color: rgba(255, 255, 255, 0.6); }
    .hidden { display: none !important; }
  `;
  document.head.appendChild(mainStyle);

  // Element Selectors
  const square = document.getElementById('draggable-square');
  const bigBox = document.getElementById('big-box');
  const pageWrapper = document.getElementById('page-wrapper');
  const uploadTrigger = document.getElementById('upload-trigger');
  const imageUpload = document.getElementById('image-upload');
  const bioElement = document.getElementById('profile-bio');
  const logoutBtn = document.getElementById('logout-btn');
  
  const customizeBtn = document.getElementById('customize-btn');
  const customModal = document.getElementById('custom-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  const pickerPageBg = document.getElementById('picker-page-bg');
  const pickerBoxBg = document.getElementById('picker-box-bg');
  const pickerSquareBg = document.getElementById('picker-square-bg');
  const modalUploadBtn = document.getElementById('modal-upload-btn');
  const modalImageUpload = document.getElementById('modal-image-upload');

  const settingsBtn = document.getElementById('settings-btn');
  const backBtn = document.getElementById('back-from-settings');

  const roomStatusBadge = document.getElementById('room-status-badge');
  const currentRoomDisplay = document.getElementById('current-room-display');
  const leaveRoomBtn = document.getElementById('leave-room-btn');
  var chatListenerRef = null;

  // Settings View Page Toggle Navigation
  settingsBtn.addEventListener('click', () => {
    document.getElementById('main-page-view').classList.add('hidden');
    document.getElementById('settings-page-view').classList.remove('hidden');
  });

  backBtn.addEventListener('click', () => {
    document.getElementById('settings-page-view').classList.add('hidden');
    document.getElementById('main-page-view').classList.remove('hidden');
  });

  // Account Information Button Handlers
  document.getElementById('change-username-btn')?.addEventListener('click', () => {
    const newName = prompt("Enter your new username:");
    if (newName) alert(`Username updated to: ${newName}`);
  });

  document.getElementById('change-password-btn')?.addEventListener('click', () => {
    const newPass = prompt("Enter your new password:");
    if (newPass) alert("Password updated successfully!");
  });

  document.getElementById('change-email-btn')?.addEventListener('click', () => {
    const newEmail = prompt("Enter your new email address:");
    if (newEmail) alert(`Email updated to: ${newEmail}`);
  });

  // Cropper Image Handling
  let cropperInstance = null;
  const fileInput = document.getElementById('cropper-file-input');
  const cropperImg = document.getElementById('cropper-image-preview');
  const cropperWrapper = document.getElementById('cropper-wrapper');

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      cropperImg.src = event.target.result;
      cropperWrapper.classList.remove('hidden');

      if (cropperInstance) cropperInstance.destroy();
      cropperInstance = new Cropper(cropperImg, {
        aspectRatio: 1,
        viewMode: 1
      });
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('crop-save-btn')?.addEventListener('click', () => {
    if (!cropperInstance) return;
    const canvas = cropperInstance.getCroppedCanvas({ width: 150, height: 150 });
    const croppedDataUrl = canvas.toDataURL();

    uploadTrigger.innerHTML = `<img src="${croppedDataUrl}" alt="Profile Image">`;
    saveProfileState();

    cropperInstance.destroy();
    cropperWrapper.classList.add('hidden');
    alert("Profile picture updated!");
  });

  // Lighten Hex Color Helper
  function lightenColor(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  }

  // Color & Gradient Customization Listeners
  document.getElementById('settings-outside-bg')?.addEventListener('input', (e) => {
    const baseColor = e.target.value;
    const lighterColor = lightenColor(baseColor, 35);

    pageWrapper.style.background = baseColor;
    
    document.getElementById('create-room-btn').style.backgroundColor = lighterColor;
    document.getElementById('join-room-btn').style.backgroundColor = lighterColor;
    document.getElementById('leave-room-btn').style.backgroundColor = lighterColor;
    
    saveProfileState();
  });

  document.getElementById('gradient-outside-bg')?.addEventListener('input', (e) => {
    if (e.target.value.trim() !== '') {
      pageWrapper.style.background = e.target.value;
    }
  });

  document.getElementById('settings-big-box-bg')?.addEventListener('input', (e) => {
    bigBox.style.background = e.target.value;
    saveProfileState();
  });

  document.getElementById('gradient-big-box-bg')?.addEventListener('input', (e) => {
    if (e.target.value.trim() !== '') {
      bigBox.style.background = e.target.value;
    }
  });

  document.getElementById('settings-square-bg')?.addEventListener('input', (e) => {
    square.style.background = e.target.value;
    saveProfileState();
  });

  document.getElementById('picker-room-bg')?.addEventListener('input', (e) => {
    if (currentRoomCode) {
      bigBox.style.background = e.target.value;
    }
  });

  document.getElementById('picker-chat-bg')?.addEventListener('input', (e) => {
    document.getElementById('chat-header').style.backgroundColor = e.target.value;
  });

  // Chat Listeners
  const chatBox = document.getElementById('room-chat-box');
  const chatHeader = document.getElementById('chat-header');
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  chatHeader.addEventListener('click', () => {
    chatBox.classList.toggle('minimized');
    chatToggleBtn.innerText = chatBox.classList.contains('minimized') ? '▲' : '▼';
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msgText = chatInput.value.trim();
    if (!msgText || !window.currentRoomCode) return;

    db.ref(`rooms/${window.currentRoomCode}/messages`).push({
      sender: username,
      text: msgText,
      timestamp: Date.now()
    });

    chatInput.value = '';
  });

  function saveProfileState() {
    const imgEl = uploadTrigger.querySelector('img');
    const currentProfile = {
      image: imgEl ? imgEl.src : '',
      bio: bioElement.innerText,
      squareBg: square.style.background || '#6366f1',
      boxBg: bigBox.style.background,
      pageBg: pageWrapper.style.background,
      posX: square.offsetLeft,
      posY: square.offsetTop
    };
    localStorage.setItem(savedDataKey, JSON.stringify(currentProfile));

    if (currentRoomCode) {
      db.ref(`rooms/${currentRoomCode}/members/${username}`).update(currentProfile);
    }
  }

  customizeBtn.addEventListener('click', () => customModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => {
    customModal.classList.add('hidden');
    saveProfileState();
  });

  pickerPageBg.addEventListener('input', (e) => { pageWrapper.style.background = e.target.value; saveProfileState(); });
  pickerBoxBg.addEventListener('input', (e) => { bigBox.style.background = e.target.value; saveProfileState(); });
  pickerSquareBg.addEventListener('input', (e) => { square.style.background = e.target.value; saveProfileState(); });

  modalUploadBtn.addEventListener('click', () => modalImageUpload.click());
  modalImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadTrigger.innerHTML = `<img src="${evt.target.result}" alt="Profile Image">`;
        saveProfileState();
      };
      reader.readAsDataURL(file);
    }
  });

  uploadTrigger.addEventListener('click', () => imageUpload.click());
  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadTrigger.innerHTML = `<img src="${evt.target.result}" alt="Profile Image">`;
        saveProfileState();
      };
      reader.readAsDataURL(file);
    }
  });

  // DRAGGING SYSTEM
  let isDragging = false;
  let startX, startY;

  function getClientCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function startDrag(e) {
    if (e.target.closest('.profile-bio') || e.target.closest('.profile-image-container')) return;
    isDragging = true;
    const coords = getClientCoords(e);
    startX = coords.x - square.offsetLeft;
    startY = coords.y - square.offsetTop;
  }

  function moveDrag(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();

    const coords = getClientCoords(e);
    let newX = Math.max(0, Math.min(coords.x - startX, bigBox.clientWidth - square.clientWidth));
    let newY = Math.max(0, Math.min(coords.y - startY, bigBox.clientHeight - square.clientHeight));

    square.style.left = `${newX}px`;
    square.style.top = `${newY}px`;

    if (currentRoomCode) {
      db.ref(`rooms/${currentRoomCode}/members/${username}`).update({ posX: newX, posY: newY });
    }
  }

  function stopDrag() {
    if (isDragging) {
      isDragging = false;
      saveProfileState();
    }
  }

  square.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', stopDrag);

  square.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);

  bioElement.addEventListener('input', () => saveProfileState());
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('nexus_user');
    
    auth.signOut().then(() => {
      location.reload();
    }).catch((error) => {
      console.error("Sign out error:", error);
      location.reload();
    });
  });

  function renderRoomMembers(membersData) {
    const container = document.getElementById('big-box');
    if (!container) return;

    document.querySelectorAll('.remote-player-square').forEach(el => {
      const userKey = el.getAttribute('data-user');
      if (!membersData || !membersData[userKey]) {
        el.remove();
      }
    });

    Object.keys(membersData || {}).forEach((userKey) => {
      if (userKey === username) return;

      const profile = membersData[userKey] || {};
      let guestSquare = document.querySelector(`.remote-player-square[data-user="${userKey}"]`);

      if (!guestSquare) {
        guestSquare = document.createElement('div');
        guestSquare.className = 'draggable-square remote-player-square';
        guestSquare.setAttribute('data-user', userKey);
        guestSquare.style.position = 'absolute';
        guestSquare.style.pointerEvents = 'none';
        container.appendChild(guestSquare);
      }

      guestSquare.style.background = profile.squareBg || '#6366f1';
      guestSquare.style.left = `${profile.posX ?? 250}px`;
      guestSquare.style.top = `${profile.posY ?? 50}px`;

      guestSquare.innerHTML = `
        <div class="square-username">${userKey}</div>
        <div class="profile-image-container" style="cursor:default;">
          ${profile.image ? `<img src="${profile.image}" alt="Profile">` : `<span class="upload-placeholder">📷</span>`}
        </div>
        <div class="profile-bio" style="border:none;">${profile.bio || ''}</div>
      `;
    });
  }

  function joinRoomSession(code) {
    if (currentRoomCode) leaveRoomSession();

    currentRoomCode = code;
    const imgEl = uploadTrigger.querySelector('img');
    const myProfile = {
      squareBg: square.style.background || '#6366f1',
      posX: square.offsetLeft || 50,
      posY: square.offsetTop || 50,
      bio: bioElement.innerText || '',
      image: imgEl ? imgEl.src : ''
    };

    currentRoomDisplay.innerText = code;
    roomStatusBadge.classList.remove('hidden');
    window.location.hash = code;

    const userRef = db.ref(`rooms/${code}/members/${username}`);
    userRef.set(myProfile);
    userRef.onDisconnect().remove();

    roomListenerRef = db.ref(`rooms/${code}/members`);
    roomListenerRef.on('value', (snapshot) => {
      renderRoomMembers(snapshot.val() || {});
    });

    chatBox.classList.remove('hidden');

    chatListenerRef = db.ref(`rooms/${code}/messages`);
    chatListenerRef.on('child_added', (snapshot) => {
      const msg = snapshot.val();
      const msgEl = document.createElement('div');
      msgEl.className = 'chat-message';
      msgEl.innerHTML = `<span class="author">${msg.sender}:</span> <span>${msg.text}</span>`;
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function leaveRoomSession() {
    if (!currentRoomCode) return;

    db.ref(`rooms/${currentRoomCode}/members/${username}`).remove();
    if (roomListenerRef) roomListenerRef.off();

    currentRoomCode = null;
    roomStatusBadge.classList.add('hidden');
    currentRoomDisplay.innerText = "NONE";
    
    history.pushState("", document.title, window.location.pathname + window.location.search);

    document.querySelectorAll('.remote-player-square').forEach(el => el.remove());
    chatBox.classList.add('hidden');
    chatMessages.innerHTML = '';
    if (chatListenerRef) chatListenerRef.off();
  }

  leaveRoomBtn.addEventListener('click', () => {
    leaveRoomSession();
    alert("🚪 You left the room.");
  });

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  document.getElementById('create-room-btn').addEventListener('click', () => {
    const code = generateCode();
    joinRoomSession(code);
    alert(`🎉 Room Created!\n\nRoom Code: ${code}\n\nShare your link with up to 3 friends!`);
  });

  document.getElementById('join-room-btn').addEventListener('click', () => {
    const userCode = prompt("Enter 6-character room code:");
    if (!userCode) return;
    const code = userCode.trim().toUpperCase();

    db.ref(`rooms/${code}`).get().then((snapshot) => {
      if (snapshot.exists()) {
        const members = snapshot.val().members || {};
        if (Object.keys(members).length >= 4) {
          alert("⚠️ Room is full (4/4 players max)!");
        } else {
          joinRoomSession(code);
          alert(`🚀 Joined room ${code}!`);
        }
      } else {
        alert("⚠️ Room code not found!");
      }
    });
  });

  const initialHash = window.location.hash.replace('#', '').trim().toUpperCase();
  if (initialHash && initialHash.length === 6) {
    db.ref(`rooms/${initialHash}`).get().then((snapshot) => {
      if (snapshot.exists()) {
        joinRoomSession(initialHash);
      }
    });
  }
}
