import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SelectedDayCard } from './SelectedDayCard';

describe('SelectedDayCard', () => {
  it('renders the section header with title and formatted date', () => {
    render(
      <SelectedDayCard
        iso="2023-10-12"
        steps={12430}
        goal={7500}
        onSave={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Selected Day' })).toBeInTheDocument();
    expect(screen.getByText('OCT 12, 2023')).toBeInTheDocument();
  });

  it('shows day of week, step count, goal, and Met status', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('THURSDAY')).toBeInTheDocument();
    expect(screen.getByText('12,430')).toBeInTheDocument();
    expect(screen.getByText('steps')).toBeInTheDocument();
    expect(screen.getByText(/Goal: 7,500/)).toBeInTheDocument();
    expect(screen.getByText('Met')).toBeInTheDocument();
  });

  it('shows Missed status when 0 < steps < goal', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={3000} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('Missed')).toBeInTheDocument();
  });

  it('shows Not logged status when steps is 0', () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={0} goal={7500} onSave={() => {}} />,
    );
    expect(screen.getByText('Not logged')).toBeInTheDocument();
  });

  it('clicking pencil enters edit mode with input prefilled and focused', async () => {
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    expect(input).toHaveValue(12430);
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Save calls onSave with parsed value and exits edit mode', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '8000');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 8000);
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit steps' })).toBeInTheDocument();
  });

  it('Save with empty input persists 0', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 0);
  });

  it('Save with negative input persists 0', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '-5');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('2023-10-12', 0);
  });

  it('Cancel does not call onSave and exits edit mode', async () => {
    const onSave = vi.fn();
    render(
      <SelectedDayCard iso="2023-10-12" steps={12430} goal={7500} onSave={onSave} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit steps' }));
    const input = screen.getByRole('spinbutton', { name: 'Steps' });
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit steps' })).toBeInTheDocument();
    // After cancel the original value still shows
    expect(screen.getByText('12,430')).toBeInTheDocument();
  });
});
