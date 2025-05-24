import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = process.env.SUPABASE_URL; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY; // Replace with your Supabase anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const emailInput = document.getElementById('email');
const signUpBtn = document.getElementById('sign-up');
const signInBtn = document.getElementById('sign-in');
const signOutBtn = document.getElementById('sign-out');
const messageDiv = document.getElementById('message');

async function signUp() {
  const email = emailInput.value;
  if (!email) {
    showMessage('Please enter an email.');
    return;
  }
  const { error } = await supabase.auth.signUp({ email });
  if (error) {
    showMessage('Sign up error: ' + error.message);
  } else {
    showMessage('Sign up successful! Check your email for a confirmation link.');
  }
}

async function signIn() {
  const email = emailInput.value;
  if (!email) {
    showMessage('Please enter an email.');
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    showMessage('Sign in error: ' + error.message);
  } else {
    showMessage('Sign in email sent! Check your inbox.');
    toggleAuthButtons(false);
  }
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showMessage('Sign out error: ' + error.message);
  } else {
    showMessage('Signed out successfully.');
    toggleAuthButtons(true);
  }
}

function showMessage(msg) {
  messageDiv.textContent = msg;
}

function toggleAuthButtons(show) {
  signUpBtn.style.display = show ? 'inline-block' : 'none';
  signInBtn.style.display = show ? 'inline-block' : 'none';
  signOutBtn.style.display = show ? 'none' : 'inline-block';
}

signUpBtn.addEventListener('click', signUp);
signInBtn.addEventListener('click', signIn);
signOutBtn.addEventListener('click', signOut);

// Check for user session on page load
supabase.auth.getSession().then(({ data: { session } }) => {
  toggleAuthButtons(!session);
  if (session) {
    showMessage('Logged in as ' + session.user.email);
  }
});
