import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function SimpleAuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login successful!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Signup successful! You can now log in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>{mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
      <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 8 }}
          />
        </div>
        {mode !== 'reset' && (
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
          </div>
        )}
        <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }}>
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Email'}
        </button>
      </form>
      <div style={{ textAlign: 'center' }}>
        {mode !== 'login' && <button onClick={() => setMode('login')}>Go to Login</button>}
        {mode !== 'signup' && <button onClick={() => setMode('signup')}>Create Account</button>}
        {mode !== 'reset' && <button onClick={() => setMode('reset')}>Forgot Password?</button>}
      </div>
    </div>
  );
} 