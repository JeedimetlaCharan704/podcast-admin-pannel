// Firebase Configuration
let auth;
let googleProvider;
const ALLOWED_DOMAIN = "aurora.edu.in";

try {
  const firebaseConfig = {
    apiKey: "AIzaSyBjWiZR4jwf7IYKR7y2xir1CUmTI0vzm8Y",
    authDomain: "college-podcast.firebaseapp.com",
    projectId: "college-podcast",
    storageBucket: "college-podcast.firebasestorage.app",
    messagingSenderId: "988666865867",
    appId: "1:988666865867:web:dedc4ace9107437ce9134e",
    measurementId: "G-22P0S6BLHJ"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Auth instance
  auth = firebase.auth();

  // Google provider with additional scopes
  googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  console.log('Firebase initialized successfully');
} catch(e) {
  console.log('Firebase init error:', e);
}

// Helper: Check if email domain is allowed
function isAllowedDomain(email) {
  if (!email) return false;
  const domain = email.split("@")[1];
  return domain === ALLOWED_DOMAIN;
}
