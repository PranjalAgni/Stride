import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders the steps and goal text', () => {
    render(<ProgressRing steps={3000} goal={7500} />);
    expect(screen.getByText('3,000')).toBeInTheDocument();
    expect(screen.getByText(/7,500/)).toBeInTheDocument();
  });

  it('renders an SVG circle', () => {
    const { container } = render(<ProgressRing steps={3000} goal={7500} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
  });
});
