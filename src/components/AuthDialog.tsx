import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { describeError } from '../lib/errors';
import Modal from './Modal';
export default function AuthDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const title =
    mode === 'signup'
      ? 'Start your next chapter.'
      : mode === 'reset'
        ? 'Reset your password.'
        : 'Welcome back.';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage(
          'If an account exists for this email, you will receive a password reset link.',
        );
      } else if (mode === 'signup')
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }
  function switchMode(value: typeof mode) {
    setMode(value);
    setError('');
    setMessage('');
    setPassword('');
  }
  return (
    <Modal titleId="auth-title" onClose={onClose} busy={busy}>
      <header className="dialog-header">
        <div>
          <p className="eyebrow">YOUR PRIVATE WORKSPACE</p>
          <h2 id="auth-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close sign-in dialog"
        >
          <X size={20} />
        </button>
      </header>
      {auth ? (
        <form className="application-form" onSubmit={submit}>
          <p className="auth-description">
            Your local demo stays separate from your account.
          </p>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
            />
          </label>
          {mode !== 'reset' && (
            <label>
              Password
              <input
                type="password"
                name="password"
                required
                minLength={mode === 'signup' ? 8 : undefined}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
              {mode === 'signup' && <small>Use at least 8 characters.</small>}
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'reset'
                  ? 'Send reset link'
                  : 'Sign in'}
          </button>
          <div className="auth-links">
            {mode === 'signin' ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  className="text-button"
                  onClick={() => switchMode('signup')}
                >
                  Create an account
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="text-button"
                  onClick={() => switchMode('reset')}
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busy}
                className="text-button"
                onClick={() => switchMode('signin')}
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="auth-description">
          <p>
            Cloud accounts are not connected in this installation yet. You can
            use the local workspace without an account.
          </p>
          <p>
            To enable cloud access, configure the Firebase web app settings
            described in the README.
          </p>
          <button className="button primary" onClick={onClose}>
            Continue locally
          </button>
        </div>
      )}
    </Modal>
  );
}
