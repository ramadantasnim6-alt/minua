// --- 1. HOME PAGE VIEW SWITCHING ---

// --- 1. CHECK PERSISTENT LOGIN ON PAGE LOAD ---
let savedUser = null;
try {
  savedUser = localStorage.getItem('nexus_user');
} catch (e) {
  console.warn('Storage access blocked:', e);
}

if (savedUser) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadMainPage(savedUser));
  } else {
    loadMainPage(savedUser);
  }
}
const welcomeView = document.getElementById('welcome-view');
const signupView = document.getElementById('signup-view');
const loginView = document.getElementById('login-view');

const goToSignupBtn = document.getElementById('go-to-signup');
const goToLoginBtn = document.getElementById('go-to-login');
const backFromSignup = document.getElementById('back-from-signup');
const backFromLogin = document.getElementById('back-from-login');

const loginForm = document.getElementById('login-form');

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

// Log In Form Submission
// Log In Form Submission with strict registration check
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('li-email').value.trim();
    const passInput = document.getElementById('li-pass').value; // Make sure your login form has a password field, or check email only

    // Get the registered users stored in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('nexus_registered_users')) || [];

    // Check if the email exists in our database
    const matchedUser = existingUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase());

    if (!matchedUser) {
      alert("⚠️ Error: This email has not been signed up yet! Please create an account first.");
      return;
    }

    // Optional: Check if password matches too (if your login form has a password input)
    // if (matchedUser.password !== passInput) {
    //   alert("⚠️ Error: Incorrect password.");
    //   return;
    // }

    // If email exists, log them in using their actual saved username
    localStorage.setItem('nexus_user', matchedUser.username);
    alert(`✅ Welcome back, ${matchedUser.username}!`);
    loadMainPage(matchedUser.username);
  });
}


// --- 2. STRICT SIGN-UP VALIDATION & UNIQUE USERNAMES ---
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener('submit', function(e) {
  if (e.target && e.target.id === 'signup-form') {
    e.preventDefault();

    const emailInput = document.getElementById('su-email').value.trim();
    const userInput = document.getElementById('su-user').value.trim();
    const passInput = document.getElementById('su-pass').value;

    if (!isValidEmail(emailInput)) {
      alert("⚠️ Error: Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('nexus_registered_users')) || [];
    const userExists = existingUsers.some(u => u.username.toLowerCase() === userInput.toLowerCase());

    if (userExists) {
      alert(`⚠️ Error: The username "${userInput}" is already taken! Please choose another one.`);
      return;
    }
    const emailExists = existingUsers.some(u => u.email.toLowerCase() === emailInput.toLowerCase());

    if (emailExists) {
      alert(`⚠️ Error: An account with the email "${emailInput}" already exists! Please use a different email or log in.`);
      return;
    }

    if (passInput.length < 8) {
      alert("⚠️ Error: Your password must be at least 8 characters long.");
      return;
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    alert(`📧 [Simulated Email]: We sent a verification code to ${emailInput}.\nYour code is: ${verificationCode}`);

    const userEnteredCode = prompt("Enter the 4-digit verification code sent to your email:");

    if (userEnteredCode !== verificationCode.toString()) {
      alert("❌ Incorrect verification code! Sign-up cancelled.");
      return;
    }

    existingUsers.push({ username: userInput, email: emailInput, password: passInput });
    localStorage.setItem('nexus_registered_users', JSON.stringify(existingUsers));
    localStorage.setItem('nexus_user', userInput);

    alert("✅ Success! Email verified and account created.");
    loadMainPage(userInput);
  }
});


// --- 3. MAIN PAGE BUILDER (BOX, SQUARE, CUSTOMIZATION, DRAGGING) ---
// --- 3. MAIN PAGE BUILDER (BOX, SQUARE, CUSTOMIZATION, DRAGGING) ---
function loadMainPage(username) {
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
    <div class="external-header">
      <span class="user-display">Logged in as: <b>${username}</b></span>
      <button id="customize-btn" class="btn-customize">Customize 🎨</button>
      
      <div class="settings-wrapper">
        <button id="settings-btn" class="btn-secondary-custom">Settings ⚙️</button>
        <div id="settings-dropdown" class="settings-dropdown hidden">
          <button class="menu-item" id="nav-account">Account Information</button>
          <button class="menu-item" id="nav-notifications">Notifications</button>
          <button class="menu-item" id="nav-appearance">Appearance</button>
          <hr class="menu-divider" />
          <button class="menu-item logout-item" id="logout-btn">Log Out</button>
        </div>
      </div>
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
  `;

  const mainStyle = document.createElement('style');
  mainStyle.innerHTML = `
    .blank-main-page { width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; transition: background 0.2s; }
    .external-header { position: absolute; top: 15px; right: 20px; display: flex; align-items: center; gap: 12px; z-index: 100; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #333333; }
    .settings-wrapper { position: relative; display: inline-block; }
    .settings-dropdown { position: absolute; top: 110%; right: 0; width: 180px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); padding: 6px; z-index: 200; display: flex; flex-direction: column; gap: 2px; }
    .menu-item { background: transparent; border: none; color: #374151; padding: 8px 10px; text-align: left; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: background 0.2s; }
    .menu-item:hover { background: #f3f4f6; }
    .menu-divider { border: none; border-top: 1px solid #e5e7eb; margin: 4px 0; }
    .logout-item { color: #ef4444; font-weight: 600; }
    .logout-item:hover { background: #fef2f2; color: #dc2626; }
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
    .big-box { width: 97vw; height: 90vh; border: 2px solid #000000; border-radius: 1px; position: relative; overflow: hidden; transition: background 0.2s; }
    .draggable-square { width: 200px; height: 240px; border: 2px solid #000000; border-radius: 1px; position: absolute; cursor: grab; display: flex; flex-direction: column; align-items: center; padding: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.15); transition: background 0.2s; }
    .draggable-square:active { cursor: grabbing; }
    .profile-image-container { width: 70px; height: 70px; background: #ffffff; border: 2px dashed #333333; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; overflow: hidden; margin-bottom: 12px; flex-shrink: 0; transition: border-color 0.2s; }
    .profile-image-container:hover { border-color: #ffffff; }
    .upload-placeholder { font-size: 1.2rem; }
    .profile-image-container img { width: 100%; height: 100%; object-fit: cover; }
    .profile-bio { width: 100%; flex: 1; background: rgba(255, 255, 255, 0.15); border: 1px dashed rgba(255, 255, 255, 0.4); border-radius: 8px; color: #ffffff; font-size: 0.85rem; padding: 8px; outline: none; text-align: center; overflow-y: auto; word-break: break-word; }
    .profile-bio:empty:before { content: attr(placeholder); color: rgba(255, 255, 255, 0.6); }
    .hidden { display: none !important; }
  `;
  document.head.appendChild(mainStyle);

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
  const settingsDropdown = document.getElementById('settings-dropdown');

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
      settingsDropdown.classList.add('hidden');
    }
  });

  function saveProfileState() {
    const currentProfile = {
      image: uploadTrigger.querySelector('img') ? uploadTrigger.querySelector('img').src : '',
      bio: bioElement.innerText,
      squareBg: square.style.background,
      boxBg: bigBox.style.background,
      pageBg: pageWrapper.style.background,
      posX: square.offsetLeft,
      posY: square.offsetTop
    };
    localStorage.setItem(savedDataKey, JSON.stringify(currentProfile));
  }

  customizeBtn.addEventListener('click', () => {
    customModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    customModal.classList.add('hidden');
    saveProfileState();
  });

  pickerPageBg.addEventListener('input', (e) => {
    pageWrapper.style.background = e.target.value;
    saveProfileState();
  });

  pickerBoxBg.addEventListener('input', (e) => {
    bigBox.style.background = e.target.value;
    saveProfileState();
  });

  pickerSquareBg.addEventListener('input', (e) => {
    square.style.background = e.target.value;
    saveProfileState();
  });

  modalUploadBtn.addEventListener('click', () => {
    modalImageUpload.click();
  });

  modalImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        uploadTrigger.innerHTML = `<img src="${event.target.result}" alt="Profile Image">`;
        saveProfileState();
      };
      reader.readAsDataURL(file);
    }
  });

  uploadTrigger.addEventListener('click', () => {
    imageUpload.click();
  });

  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        uploadTrigger.innerHTML = `<img src="${event.target.result}" alt="Profile Image">`;
        saveProfileState();
      };
      reader.readAsDataURL(file);
    }
  });

  let isDragging = false;
  let startX, startY;

  square.addEventListener('mousedown', (e) => {
    if (e.target.closest('.profile-bio') || e.target.closest('.profile-image-container')) {
      return;
    }
    isDragging = true;
    startX = e.clientX - square.offsetLeft;
    startY = e.clientY - square.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let newX = e.clientX - startX;
    let newY = e.clientY - startY;

    const maxX = bigBox.clientWidth - square.clientWidth;
    const maxY = bigBox.clientHeight - square.clientHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    square.style.left = `${newX}px`;
    square.style.top = `${newY}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      saveProfileState();
    }
  });

  square.addEventListener('touchstart', (e) => {
    if (e.target.closest('.profile-bio') || e.target.closest('.profile-image-container')) return;
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX - square.offsetLeft;
    startY = touch.clientY - square.offsetTop;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    let newX = touch.clientX - startX;
    let newY = touch.clientY - startY;

    const maxX = bigBox.clientWidth - square.clientWidth;
    const maxY = bigBox.clientHeight - square.clientHeight;

    square.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    square.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      saveProfileState();
    }
  });

  bioElement.addEventListener('input', () => {
    saveProfileState();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('nexus_user');
    location.reload();
  });
}
