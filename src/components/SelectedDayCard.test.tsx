import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
