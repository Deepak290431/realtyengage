import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Maximize2,
  Layers,
  ZoomIn,
  ZoomOut,
  School,
  ShoppingBag,
  Train,
  Building,
  Heart,
  Star,
  ChevronRight,
  Map as MapIcon
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const GoogleMap = ({
  location,
  coordinates,
  nearbyPlaces = [],
  projectName,
  address,
  className = "",
  height = "450px"
}) => {
  const [mapType, setMapType] = useState('roadmap');
  const [zoom, setZoom] = useState(15);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isClassicMode, setIsClassicMode] = useState(false);

  // Generate Google Maps embed URL
  const generateMapUrl = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const query = encodeURIComponent(`${projectName}, ${address}`);

    // If we're in classic mode or no API key, use the permissive embed
    if (isClassicMode || !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      return `https://maps.google.com/maps?q=${query}&t=${mapType === 'satellite' ? 'k' : ''}&z=${zoom}&output=embed`;
    }

    // Standard Embed API View
    const baseUrl = 'https://www.google.com/maps/embed/v1/place';
    const lat = coordinates?.lat ?? coordinates?.latitude;
    const lng = coordinates?.lng ?? coordinates?.longitude;
    const centerParam = (lat !== undefined && lng !== undefined && lat !== null && lng !== null) ? `&center=${lat},${lng}` : '';

    return `${baseUrl}?key=${apiKey}&q=${query}${centerParam}&zoom=${zoom}&maptype=${mapType}`;
  };

  // Generate directions URL
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(`${projectName}, ${address}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  // Get icon for place type
  const getPlaceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'education':
      case 'school':
        return School;
      case 'shopping':
      case 'mall':
        return ShoppingBag;
      case 'transport':
      case 'railway':
      case 'metro':
        return Train;
      case 'healthcare':
      case 'hospital':
        return Heart;
      default:
        return Building;
    }
  };

  // Get color for place type
  const getPlaceColor = (type) => {
    switch (type.toLowerCase()) {
      case 'education':
      case 'school':
        return 'text-blue-600 bg-blue-100';
      case 'shopping':
      case 'mall':
        return 'text-blue-500 bg-blue-50';
      case 'transport':
      case 'railway':
      case 'metro':
        return 'text-green-600 bg-green-100';
      case 'healthcare':
      case 'hospital':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`${className}`}>
      <Card className="overflow-hidden">
        {/* Map Header */}
        <div className="bg-[#0B1F33] p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <MapIcon className="h-5 w-5 text-[#C9A24D]" />
              </div>
              <h3 className="text-lg font-bold">Project Location</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-8 text-[11px]"
                onClick={() => setIsClassicMode(!isClassicMode)}
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                {isClassicMode ? 'Use Pro Map' : 'Use Classic Map'}
              </Button>
              {/* Map Type Toggle */}
              <div className="flex bg-white/20 rounded-lg p-0.5">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${mapType === 'roadmap' ? 'bg-white text-[#0B1F33]' : 'text-white hover:bg-white/10'
                    }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${mapType === 'satellite' ? 'bg-white text-[#0B1F33]' : 'text-white hover:bg-white/10'
                    }`}
                >
                  Sat
                </button>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-black mb-1.5 truncate">{projectName}</h4>
              <div className="flex items-start space-x-1.5 text-white/80">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9A24D]" />
                <span className="text-sm line-clamp-2">{address}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(getDirectionsUrl(), '_blank')}
              className="bg-[#C9A24D] hover:bg-[#B69141] text-[#0B1F33] font-bold border-none shadow-lg w-full sm:w-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full overflow-hidden min-h-[300px]" style={{ height }}>
          <iframe
            title="Project Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={generateMapUrl()}
          />

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 1, 20))}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              <ZoomIn className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 1, 10))}
              className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              <ZoomOut className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Full Screen Button */}
          <button
            onClick={() => window.open(getDirectionsUrl(), '_blank')}
            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="font-semibold mb-3 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Nearby Landmarks & Facilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nearbyPlaces.map((place, index) => {
                const Icon = getPlaceIcon(place.type);
                const colorClass = getPlaceColor(place.type);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer ${selectedPlace === index ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => setSelectedPlace(selectedPlace === index ? null : index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{place.name}</p>
                          <p className="text-xs text-gray-500">{place.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {place.distance}
                        </Badge>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedPlace === index ? 'rotate-90' : ''
                          }`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedPlace === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Approx. Travel Time:</span>
                          <span className="font-medium">
                            {place.travelTime || `${parseInt(place.distance) * 2} min`}
                          </span>
                        </div>
                        {place.rating && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-600">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{place.rating}</span>
                            </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            const placeQuery = encodeURIComponent(place.name);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${placeQuery}`, '_blank');
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Actions Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const lat = coordinates?.lat ?? coordinates?.latitude ?? '12.9716';
                const lng = coordinates?.lng ?? coordinates?.longitude ?? '77.5946';
                const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
                window.open(streetViewUrl, '_blank');
              }}
            >
              <Layers className="h-4 w-4 mr-1" />
              Street View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const currentAddress = address || 'Bangalore';
                const nearbyUrl = `https://www.google.com/maps/search/restaurants+near+${encodeURIComponent(currentAddress)}`;
                window.open(nearbyUrl, '_blank');
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              Nearby Restaurants
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const currentAddress = address || 'Bangalore';
                const transitUrl = `https://www.google.com/maps/search/public+transport+near+${encodeURIComponent(currentAddress)}`;
                window.open(transitUrl, '_blank');
              }}
            >
              <Train className="h-4 w-4 mr-1" />
              Public Transport
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GoogleMap;
