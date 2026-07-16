import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders nothing when toast is null', () => {
    const { container } = render(<Toast toast={null} onDismiss={() => { }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success message correctly', () => {
    const toast = { type: 'success', message: 'Operation successful!' };
    render(<Toast toast={toast} onDismiss={() => { }} />);
    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-emerald-50');
  });

  it('renders error message correctly', () => {
    const toast = { type: 'error', message: 'Something went wrong!' };
    render(<Toast toast={toast} onDismiss={() => { }} />);
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('calls onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    const toast = { type: 'success', message: 'Success' };
    render(<Toast toast={toast} onDismiss={handleDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss automatically after duration', () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    const toast = { type: 'success', message: 'Success' };
    render(<Toast toast={toast} onDismiss={handleDismiss} duration={1000} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
