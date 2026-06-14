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
});
