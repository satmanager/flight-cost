import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios to prevent real network requests
jest.mock('axios');

describe('Flight Optimization App', () => {
  
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  test('renders the title and form inputs', () => {
    render(<App />);
    
    // Check Title
    expect(screen.getByText(/Flight Value Optimizer/i)).toBeInTheDocument();
    
    // Check Inputs
    expect(screen.getByPlaceholderText(/e.g. London/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Paris, Berlin, Madrid/i)).toBeInTheDocument();
    
    // Check Button
    expect(screen.getByRole('button', { name: /Search Best Flight/i })).toBeInTheDocument();
  });

  test('allows user to type in inputs', () => {
    render(<App />);
    
    const originInput = screen.getByPlaceholderText(/e.g. London/i);
    const destInput = screen.getByPlaceholderText(/e.g. Paris, Berlin, Madrid/i);

    fireEvent.change(originInput, { target: { value: 'New York' } });
    fireEvent.change(destInput, { target: { value: 'Miami' } });

    expect(originInput.value).toBe('New York');
    expect(destInput.value).toBe('Miami');
  });

  test('displays loading state and then results on successful API call', async () => {
    // Setup the mock response
    const mockResponse = {
      data: {
        destination: 'Paris',
        price: 100,
        distance: 500,
        ratio: 0.2
      }
    };
    axios.post.mockResolvedValueOnce(mockResponse);

    render(<App />);

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText(/e.g. London/i), { target: { value: 'London' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Paris, Berlin, Madrid/i), { target: { value: 'Paris' } });

    // Click Search
    fireEvent.click(screen.getByRole('button', { name: /Search Best Flight/i }));

    // Check for "Please wait..." (Loading state)
    expect(screen.getByText(/Please wait.../i)).toBeInTheDocument();

    // Wait for the result to appear
    await waitFor(() => {
      expect(screen.getByText(/🏆 Best Option: Paris/i)).toBeInTheDocument();
      expect(screen.getByText(/\$0.20 \/ km/i)).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    // Setup the mock error
    const mockError = {
      response: {
        data: { error: 'Invalid city' }
      }
    };
    axios.post.mockRejectedValueOnce(mockError);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/e.g. London/i), { target: { value: 'Mars' } });
    fireEvent.click(screen.getByRole('button', { name: /Search Best Flight/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid city/i)).toBeInTheDocument();
    });
  });

  test('clears the form when Clear button is clicked', () => {
    render(<App />);
    
    const originInput = screen.getByPlaceholderText(/e.g. London/i);
    
    // Type something
    fireEvent.change(originInput, { target: { value: 'London' } });
    expect(originInput.value).toBe('London');

    // Click Clear
    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));

    // Verify it is empty
    expect(originInput.value).toBe('');
  });

});