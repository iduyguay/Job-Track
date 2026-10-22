export function describeError(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';
  if (
    [
      'auth/invalid-credential',
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-login-credentials',
    ].includes(code)
  )
    return 'The email or password is incorrect.';
  if (code === 'auth/email-already-in-use')
    return 'An account already exists for this email. Sign in or reset your password.';
  if (
    code === 'auth/weak-password' ||
    code === 'auth/password-does-not-meet-requirements'
  )
    return 'Choose a stronger password that meets the account policy.';
  if (code === 'auth/too-many-requests')
    return 'Too many attempts. Please wait before trying again.';
  if (code === 'auth/network-request-failed' || code === 'unavailable')
    return 'Could not reach the service. Check your connection and try again.';
  if (code === 'permission-denied')
    return 'Access was denied. Check your session and the Firebase security rules.';
  if (code === 'auth/operation-not-allowed')
    return 'Email and password sign-in is not enabled for this Firebase project.';
  return error instanceof Error && !code
    ? error.message
    : 'Something went wrong. Please try again.';
}
