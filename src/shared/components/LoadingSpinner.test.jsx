import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders with custom loading text', () => {
    render(<LoadingSpinner text="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('has correct accessibility role and attributes', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
