import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('App component', () => {
  it('renders App without crashing', () => {
    render(React.createElement(App));
    expect(screen.getAllByText(/Piktogram Maker/i).length).toBeGreaterThan(0);
  });
});
