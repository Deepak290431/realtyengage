import React, { useState } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Button,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear,
  Search,
  CurrencyRupee
} from '@mui/icons-material';

const ProjectFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState([0, 50000000]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceChangeCommitted = (event, newValue) => {
    handleFilterChange('minPrice', newValue[0]);
    handleFilterChange('maxPrice', newValue[1]);
  };

  const formatPriceLabel = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(0)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const handleClear = () => {
    setLocalFilters({});
    setPriceRange([0, 50000000]);
    onClearFilters();
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v).length;

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search projects..."
        value={localFilters.search || ''}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Status Filter */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={localFilters.status || ''}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="upcoming">Upcoming</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      {/* Location Filter */}
      <TextField
        fullWidth
        size="small"
        label="Location/Area"
        value={localFilters.area || ''}
        onChange={(e) => handleFilterChange('area', e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Price Range */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {formatPriceLabel(priceRange[0])}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPriceLabel(priceRange[1])}
              </Typography>
            </Box>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              onChangeCommitted={handlePriceChangeCommitted}
              valueLabelDisplay="auto"
              valueLabelFormat={formatPriceLabel}
              min={0}
              max={50000000}
              step={500000}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Property Type */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Property Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="1bhk">1 BHK</MenuItem>
              <MenuItem value="2bhk">2 BHK</MenuItem>
              <MenuItem value="3bhk">3 BHK</MenuItem>
              <MenuItem value="4bhk">4 BHK</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="penthouse">Penthouse</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Amenities */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Amenities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Power Backup', 'Club House'].map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                size="small"
                clickable
                color={localFilters.amenities?.includes(amenity) ? 'primary' : 'default'}
                onClick={() => {
                  const current = localFilters.amenities || [];
                  const updated = current.includes(amenity)
                    ? current.filter(a => a !== amenity)
                    : [...current, amenity];
                  handleFilterChange('amenities', updated);
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Sort Options */}
      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={localFilters.sort || '-createdAt'}
          label="Sort By"
          onChange={(e) => handleFilterChange('sort', e.target.value)}
        >
          <MenuItem value="-createdAt">Newest First</MenuItem>
          <MenuItem value="createdAt">Oldest First</MenuItem>
          <MenuItem value="pricing.basePrice">Price: Low to High</MenuItem>
          <MenuItem value="-pricing.basePrice">Price: High to Low</MenuItem>
          <MenuItem value="name">Name: A to Z</MenuItem>
          <MenuItem value="-name">Name: Z to A</MenuItem>
          <MenuItem value="-views">Most Viewed</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default ProjectFilters;
