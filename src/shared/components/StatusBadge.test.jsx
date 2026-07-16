import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders the status text capitalized', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders fallback text when status is missing', () => {
    render(<StatusBadge status="" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('applies custom className if provided', () => {
    const { container } = render(<StatusBadge status="active" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
