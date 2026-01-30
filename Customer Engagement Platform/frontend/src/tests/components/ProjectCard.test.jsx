import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProjectCard from '../../components/projects/ProjectCard';
import { store } from '../../store';
import '@testing-library/jest-dom';

// Test wrapper component
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const theme = createTheme();
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const renderWithProviders = (component) => {
  return render(component, { wrapper: AllTheProviders });
};

describe('ProjectCard Component', () => {
  const mockProject = {
    _id: '1',
    name: 'Skyline Apartments',
    images: [{ url: '/test-image.jpg' }],
    location: {
      address: '123 Main St',
      city: 'Bangalore',
      state: 'Karnataka',
    },
    area: 'Whitefield',
    status: 'in_progress',
    pricing: {
      basePrice: 15000000,
      pricePerSqFt: 5000,
    },
    specifications: [
      { label: 'Area', value: '1500 sq ft' },
      { label: 'Bedrooms', value: '3 BHK' },
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking'],
    availability: { total: 50, sold: 30 },
  };

  const mockOnEnquire = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders project card with basic information', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('Skyline Apartments')).toBeInTheDocument();
    expect(screen.getByText('Whitefield')).toBeInTheDocument();
    expect(screen.getByText('₹1.50 Cr')).toBeInTheDocument();
  });

  test('displays project status correctly', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    const statusChip = screen.getByText('In Progress');
    expect(statusChip).toBeInTheDocument();
    expect(statusChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorInfo');
  });

  test('shows availability information', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('20 units available')).toBeInTheDocument();
  });

  test('displays specifications correctly', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('1500 sq ft')).toBeInTheDocument();
    expect(screen.getByText('3 BHK')).toBeInTheDocument();
  });

  test('shows amenities when available', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  test('calls onEnquire when Enquire Now button is clicked', async () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    const enquireButton = screen.getByRole('button', { name: /enquire now/i });
    fireEvent.click(enquireButton);

    await waitFor(() => {
      expect(mockOnEnquire).toHaveBeenCalledWith(mockProject);
    });
  });

  test('navigates to project details on View Details click', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={mockOnEnquire} />
    );

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    expect(viewDetailsButton).toHaveAttribute('href', '/projects/1');
  });

  test('shows admin-specific actions for admin users', () => {
    const adminStore = {
      ...store.getState(),
      auth: { user: { role: 'admin' }, isAuthenticated: true },
    };

    const AdminProvider = ({ children }) => (
      <Provider store={{ ...store, getState: () => adminStore }}>
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <ThemeProvider theme={createTheme()}>
              {children}
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );

    render(<ProjectCard project={mockProject} onEnquire={mockOnEnquire} />, {
      wrapper: AdminProvider,
    });

    expect(screen.getByRole('button', { name: /view enquiries/i })).toBeInTheDocument();
  });

  test('handles missing pricing gracefully', () => {
    const projectWithoutPricing = {
      ...mockProject,
      pricing: null,
    };

    renderWithProviders(
      <ProjectCard project={projectWithoutPricing} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('Price on Request')).toBeInTheDocument();
  });

  test('handles missing images gracefully', () => {
    const projectWithoutImages = {
      ...mockProject,
      images: [],
    };

    renderWithProviders(
      <ProjectCard project={projectWithoutImages} onEnquire={mockOnEnquire} />
    );

    // Should render without crashing
    expect(screen.getByText('Skyline Apartments')).toBeInTheDocument();
  });

  test('displays sold out status when no units available', () => {
    const soldOutProject = {
      ...mockProject,
      availability: { total: 50, sold: 50 },
    };

    renderWithProviders(
      <ProjectCard project={soldOutProject} onEnquire={mockOnEnquire} />
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });
});

describe('ProjectCard Accessibility', () => {
  const mockProject = {
    _id: '1',
    name: 'Test Project',
    area: 'Test Area',
    status: 'upcoming',
    pricing: { basePrice: 10000000 },
  };

  test('has proper ARIA labels', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={jest.fn()} />
    );

    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });

  test('buttons are keyboard accessible', () => {
    renderWithProviders(
      <ProjectCard project={mockProject} onEnquire={jest.fn()} />
    );

    const enquireButton = screen.getByRole('button', { name: /enquire now/i });
    expect(enquireButton).toBeVisible();
    
    // Simulate keyboard navigation
    enquireButton.focus();
    expect(document.activeElement).toBe(enquireButton);
  });
});
