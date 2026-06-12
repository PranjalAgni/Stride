import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickAddRow } from './QuickAddRow';

describe('QuickAddRow', () => {
  it('renders the four presets', () => {
    render(<QuickAddRow onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: '+100' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+500' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+1,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+2,000' })).toBeInTheDocument();
  });

  it('calls onAdd with the correct value when tapped', async () => {
    const onAdd = vi.fn();
    render(<QuickAddRow onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: '+500' }));
    expect(onAdd).toHaveBeenCalledWith(500);
  });
});
