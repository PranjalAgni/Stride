import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickAddRow } from './QuickAddRow';

describe('QuickAddRow', () => {
  it('renders the preset and custom buttons', () => {
    render(<QuickAddRow onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add 500 steps' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add 1000 steps' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom amount' })).toBeInTheDocument();
  });

  it('calls onAdd with preset value when tapped', async () => {
    const onAdd = vi.fn();
    render(<QuickAddRow onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add 500 steps' }));
    expect(onAdd).toHaveBeenCalledWith(500);
  });

  it('opens custom input and submits', async () => {
    const onAdd = vi.fn();
    render(<QuickAddRow onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: 'Custom amount' }));
    const input = screen.getByPlaceholderText('Enter steps');
    await userEvent.type(input, '750');
    await userEvent.click(screen.getByRole('button', { name: 'Add custom' }));
    expect(onAdd).toHaveBeenCalledWith(750);
  });
});
