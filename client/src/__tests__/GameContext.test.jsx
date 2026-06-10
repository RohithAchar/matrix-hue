import { render, screen, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../context/GameContext';

function TestComponent() {
  const { difficulty, mode, selectDifficulty, selectMode, resetSelection } = useGame();
  return (
    <div>
      <span data-testid="difficulty">{difficulty || 'none'}</span>
      <span data-testid="mode">{mode || 'none'}</span>
      <button data-testid="set-easy" onClick={() => selectDifficulty('easy')}>Easy</button>
      <button data-testid="set-hard" onClick={() => selectDifficulty('hard')}>Hard</button>
      <button data-testid="set-single" onClick={() => selectMode('single')}>Single</button>
      <button data-testid="reset" onClick={resetSelection}>Reset</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <GameProvider>
      <TestComponent />
    </GameProvider>
  );
}

it('starts with null difficulty and mode', () => {
  renderWithProvider();
  expect(screen.getByTestId('difficulty').textContent).toBe('none');
  expect(screen.getByTestId('mode').textContent).toBe('none');
});

it('updates difficulty on selectDifficulty', async () => {
  renderWithProvider();
  screen.getByTestId('set-easy').click();
  await waitFor(() => {
    expect(screen.getByTestId('difficulty').textContent).toBe('easy');
  });
  screen.getByTestId('set-hard').click();
  await waitFor(() => {
    expect(screen.getByTestId('difficulty').textContent).toBe('hard');
  });
});

it('updates mode on selectMode', async () => {
  renderWithProvider();
  screen.getByTestId('set-single').click();
  await waitFor(() => {
    expect(screen.getByTestId('mode').textContent).toBe('single');
  });
});

it('resets selection on resetSelection', async () => {
  renderWithProvider();
  screen.getByTestId('set-easy').click();
  await waitFor(() => {
    expect(screen.getByTestId('difficulty').textContent).toBe('easy');
  });
  screen.getByTestId('set-single').click();
  screen.getByTestId('reset').click();
  await waitFor(() => {
    expect(screen.getByTestId('difficulty').textContent).toBe('none');
    expect(screen.getByTestId('mode').textContent).toBe('none');
  });
});
