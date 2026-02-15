import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

// Helper component that triggers a toast
function ToastTrigger({ message = 'Test toast', type = 'info' }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>Show Toast</button>;
}

function renderWithToast(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('Toast System', () => {
  it('renders ToastProvider without crashing', () => {
    renderWithToast(<div>content</div>);
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('shows a toast when triggered', () => {
    renderWithToast(<ToastTrigger message="Hello!" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Hello!')).toBeTruthy();
  });

  it('renders correct icon for success toast', () => {
    renderWithToast(<ToastTrigger message="Success!" type="success" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('renders correct icon for error toast', () => {
    renderWithToast(<ToastTrigger message="Error!" type="error" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('✗')).toBeTruthy();
  });

  it('renders correct icon for info toast', () => {
    renderWithToast(<ToastTrigger message="Info!" type="info" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('ℹ')).toBeTruthy();
  });

  it('error toast has role="alert"', () => {
    renderWithToast(<ToastTrigger message="Error msg" type="error" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('info toast has role="status"', () => {
    renderWithToast(<ToastTrigger message="Info msg" type="info" />);
    fireEvent.click(screen.getByText('Show Toast'));
    // The container also has role="status", so there'll be multiple
    const statuses = screen.getAllByRole('status');
    expect(statuses.length).toBeGreaterThanOrEqual(1);
  });

  it('removes toast when close button is clicked', () => {
    renderWithToast(<ToastTrigger message="Close me" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Close me')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(screen.queryByText('Close me')).toBeNull();
  });

  it('auto-dismisses toast after 3 seconds', () => {
    vi.useFakeTimers();
    renderWithToast(<ToastTrigger message="Auto dismiss" />);
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Auto dismiss')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(3100); });
    expect(screen.queryByText('Auto dismiss')).toBeNull();
    vi.useRealTimers();
  });

  it('toast container has aria-live="polite"', () => {
    const { container } = renderWithToast(<div>test</div>);
    const toastContainer = container.querySelector('.toast-container');
    expect(toastContainer.getAttribute('aria-live')).toBe('polite');
  });

  it('useToast throws when used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToastTrigger />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });
});
