import React, { useState, useCallback, memo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  MarkerClusterer,
  DirectionsRenderer,
  Circle
} from '@react-google-maps/api';
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  MyLocation,
  Directions,
  FilterList,
  Close,
  LocationOn,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946 // Bangalore center
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const libraries = ['places', 'drawing', 'geometry'];

const ProjectMap = ({ projects = [], selectedProject = null, onProjectSelect, showFilters = true }) => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5000); // meters
  const [showClusters, setShowClusters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priceRange: '',
    propertyType: ''
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setCenter(location);
          if (map) {
            map.panTo(location);
            map.setZoom(14);
          }
          toast.success('Location found!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Calculate directions to a project
  const getDirections = (project) => {
    if (!userLocation) {
      toast.error('Please enable location first');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: project.location.latitude,
          lng: project.location.longitude
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const distance = result.routes[0].legs[0].distance.text;
          const duration = result.routes[0].legs[0].duration.text;
          toast.success(`Distance: ${distance}, Time: ${duration}`);
        } else {
          toast.error('Could not calculate directions');
        }
      }
    );
  };

  // Filter projects based on criteria
  const filteredProjects = projects.filter((project) => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.propertyType && !project.specifications?.some(s => 
      s.value.toLowerCase().includes(filters.propertyType.toLowerCase())
    )) return false;
    if (filters.priceRange) {
      const price = project.pricing?.basePrice;
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (price < min * 1000000 || price > max * 1000000) return false;
    }
    return true;
  });

  // Custom marker icon based on status
  const getMarkerIcon = (status) => {
    const colors = {
      upcoming: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      in_progress: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      completed: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    return colors[status] || colors.upcoming;
  };

  const handleMarkerClick = (project) => {
    setSelectedMarker(project);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const renderInfoWindow = () => {
    if (!selectedMarker) return null;

    return (
      <InfoWindow
        position={{
          lat: selectedMarker.location.latitude,
          lng: selectedMarker.location.longitude
        }}
        onCloseClick={() => setSelectedMarker(null)}
      >
        <Card sx={{ maxWidth: 300 }}>
          {selectedMarker.images?.[0] && (
            <CardMedia
              component="img"
              height="140"
              image={selectedMarker.images[0].url}
              alt={selectedMarker.name}
            />
          )}
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedMarker.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {selectedMarker.area}
              </Typography>
            </Box>
            <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
              ₹{(selectedMarker.pricing?.basePrice / 10000000).toFixed(2)} Cr
            </Typography>
            <Chip
              label={selectedMarker.status.replace('_', ' ')}
              size="small"
              color={
                selectedMarker.status === 'completed' ? 'success' :
                selectedMarker.status === 'in_progress' ? 'info' : 'warning'
              }
              sx={{ mt: 1 }}
            />
          </CardContent>
          <CardActions>
            <Button
              size="small"
              onClick={() => navigate(`/projects/${selectedMarker._id}`)}
            >
              View Details
            </Button>
            {userLocation && (
              <Button
                size="small"
                onClick={() => getDirections(selectedMarker)}
                startIcon={<Directions />}
              >
                Directions
              </Button>
            )}
          </CardActions>
        </Card>
      </InfoWindow>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList /> Map Filters
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Price Range</InputLabel>
            <Select
              value={filters.priceRange}
              label="Price Range"
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
            >
              <MenuItem value="">All Prices</MenuItem>
              <MenuItem value="0-1">Under ₹1 Cr</MenuItem>
              <MenuItem value="1-2">₹1-2 Cr</MenuItem>
              <MenuItem value="2-5">₹2-5 Cr</MenuItem>
              <MenuItem value="5-10">₹5-10 Cr</MenuItem>
              <MenuItem value="10-100">Above ₹10 Cr</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search area..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              if (searchTerm && map) {
                const foundProject = projects.find(p => 
                  p.area.toLowerCase().includes(searchTerm)
                );
                if (foundProject) {
                  map.panTo({
                    lat: foundProject.location.latitude,
                    lng: foundProject.location.longitude
                  });
                  map.setZoom(14);
                }
              }
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
              />
            }
            label="Clusters"
          />

          <Button
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={getCurrentLocation}
          >
            My Location
          </Button>
        </Box>
      </Paper>
    );
  };

  if (loadError) {
    return (
      <Alert severity="error">
        Error loading maps. Please check your API key configuration.
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {renderFilters()}
      
      <Paper elevation={3} sx={{ position: 'relative', overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* User location marker */}
          {userLocation && (
            <>
              <Marker
                position={userLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
                title="Your Location"
              />
              {/* Search radius circle */}
              <Circle
                center={userLocation}
                radius={searchRadius}
                options={{
                  fillColor: '#4285F4',
                  fillOpacity: 0.1,
                  strokeColor: '#4285F4',
                  strokeOpacity: 0.3,
                  strokeWeight: 1
                }}
              />
            </>
          )}

          {/* Project markers */}
          {showClusters ? (
            <MarkerClusterer
              options={{
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 15
              }}
            >
              {(clusterer) =>
                filteredProjects.map((project) => (
                  <Marker
                    key={project._id}
                    position={{
                      lat: project.location.latitude,
                      lng: project.location.longitude
                    }}
                    icon={getMarkerIcon(project.status)}
                    title={project.name}
                    onClick={() => handleMarkerClick(project)}
                    clusterer={clusterer}
                  />
                ))
              }
            </MarkerClusterer>
          ) : (
            filteredProjects.map((project) => (
              <Marker
                key={project._id}
                position={{
                  lat: project.location.latitude,
                  lng: project.location.longitude
                }}
                icon={getMarkerIcon(project.status)}
                title={project.name}
                onClick={() => handleMarkerClick(project)}
              />
            ))
          )}

          {/* Directions */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#1976d2',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}

          {/* Info window */}
          {renderInfoWindow()}
        </GoogleMap>

        {/* Map controls */}
        <Box sx={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Fab
            size="small"
            color="primary"
            onClick={() => map && map.setZoom(map.getZoom() + 1)}
          >
            <ZoomIn />
          </Fab>
          <Fab
            size="small"
            color="primary"
            onClick={() => map && map.setZoom(map.getZoom() - 1)}
          >
            <ZoomOut />
          </Fab>
        </Box>

        {/* Legend */}
        <Paper sx={{ position: 'absolute', top: 10, left: 10, p: 1 }}>
          <Typography variant="caption" fontWeight="bold">Project Status</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFC107' }} />
              <Typography variant="caption">Upcoming</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2196F3' }} />
              <Typography variant="caption">In Progress</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4CAF50' }} />
              <Typography variant="caption">Completed</Typography>
            </Box>
          </Box>
        </Paper>
      </Paper>

      {/* Project count */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredProjects.length} of {projects.length} projects on map
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(ProjectMap);
