import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from '../hooks/useSession';

beforeEach(() => {
  localStorage.clear();
  global.fetch = undefined;
});

function TestComponent() {
  const { isLoggedIn, displayName, createSession, clearSession } = useSession();
  return (
    <div>
      <span data-testid="logged-in">{isLoggedIn ? 'yes' : 'no'}</span>
      <span data-testid="display-name">{displayName || 'none'}</span>
      <button data-testid="create" onClick={() => createSession('Neo')}>
        Create
      </button>
      <button data-testid="clear" onClick={clearSession}>
        Clear
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SessionProvider>
      <TestComponent />
    </SessionProvider>
  );
}

it('reads session from localStorage on mount', () => {
  localStorage.setItem('sessionToken', 'test-uuid');
  localStorage.setItem('displayName', 'Neo');
  renderWithProvider();
  expect(screen.getByTestId('logged-in').textContent).toBe('yes');
  expect(screen.getByTestId('display-name').textContent).toBe('Neo');
});

it('shows not logged in when no stored session', () => {
  renderWithProvider();
  expect(screen.getByTestId('logged-in').textContent).toBe('no');
  expect(screen.getByTestId('display-name').textContent).toBe('none');
});

it('stores session on createSession', async () => {
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ sessionToken: 'new-uuid', displayName: 'Neo' }),
    });

  renderWithProvider();
  screen.getByTestId('create').click();

  await waitFor(() => {
    expect(screen.getByTestId('logged-in').textContent).toBe('yes');
    expect(screen.getByTestId('display-name').textContent).toBe('Neo');
  });

  expect(localStorage.getItem('sessionToken')).toBe('new-uuid');
  expect(localStorage.getItem('displayName')).toBe('Neo');
});

it('clears session on clearSession', async () => {
  localStorage.setItem('sessionToken', 'test-uuid');
  localStorage.setItem('displayName', 'Neo');
  renderWithProvider();
  screen.getByTestId('clear').click();

  await waitFor(() => {
    expect(screen.getByTestId('logged-in').textContent).toBe('no');
    expect(screen.getByTestId('display-name').textContent).toBe('none');
  });
  expect(localStorage.getItem('sessionToken')).toBeNull();
});
