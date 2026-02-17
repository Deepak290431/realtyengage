import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Home,
  Visibility,
  Favorite,
  Share,
  CurrencyRupee,
  PlayCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';

const ProjectCard = ({ project, isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lacs`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleEnquire = (e) => {
    e.stopPropagation();
    if (isAdmin) {
      navigate(`/admin/enquiries?projectId=${project._id}`);
    } else {
      dispatch(openModal('enquiry'));
    }
  };

  const handleViewDetails = () => {
    if (isAdmin) {
      navigate(`/admin/projects/${project._id}`);
    } else {
      navigate(`/projects/${project._id}`);
    }
  };

  const handleVirtualTourClick = (e) => {
    e.stopPropagation();
    const projectId = project._id || project.id;
    if (!projectId) {
      toast.error('Project ID not found');
      return;
    }

    const virtualTour = project.virtualTour;
    const hasTour = (virtualTour?.images360?.length > 0) || !!virtualTour?.video360?.url;

    if (hasTour) {
      const detailPath = isAdmin ? `/admin/projects/${projectId}` : `/projects/${projectId}`;
      navigate(`${detailPath}?viewTour=true`);
    } else {
      toast.error('Virtual tour content is not available yet');
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
      onClick={handleViewDetails}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={project.primaryImage || project.images?.[0]?.url || '/placeholder-project.jpg'}
          alt={project.name}
        />
        <Chip
          label={project.status.replace('_', ' ').toUpperCase()}
          color={getStatusColor(project.status)}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontWeight: 600
          }}
        />
        {project.availability && (
          <Chip
            label={`${project.availability.availableUnits}/${project.availability.totalUnits} Available`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600, mb: 0 }}>
            {project.name}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleVirtualTourClick}
            startIcon={<PlayCircleOutline />}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontSize: '0.7rem',
              py: 0.2,
              px: 1,
              ml: 1,
              whiteSpace: 'nowrap',
              backgroundColor: (project.virtualTour?.images360?.length > 0 || project.virtualTour?.video360?.url) ? 'primary.main' : 'transparent',
              color: (project.virtualTour?.images360?.length > 0 || project.virtualTour?.video360?.url) ? 'white' : 'text.disabled',
              borderColor: (project.virtualTour?.images360?.length > 0 || project.virtualTour?.video360?.url) ? 'primary.main' : 'grey.300',
              '&:hover': {
                backgroundColor: (project.virtualTour?.images360?.length > 0 || project.virtualTour?.video360?.url) ? 'primary.dark' : 'grey.100',
                borderColor: (project.virtualTour?.images360?.length > 0 || project.virtualTour?.video360?.url) ? 'primary.dark' : 'grey.400',
              }
            }}
          >
            Virtual Tour
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{project.area}</Typography>
        </Box>

        <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
          {formatPrice(project.pricing?.basePrice || 0)}
          {project.pricing?.pricePerSqFt && (
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}• ₹{project.pricing.pricePerSqFt}/sqft
            </Typography>
          )}
        </Typography>

        {project.specifications && project.specifications.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {project.specifications.slice(0, 3).map((spec, index) => (
              <Chip
                key={index}
                label={`${spec.type}: ${spec.value}`}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}

        {project.shortDescription && (
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {project.shortDescription}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          onClick={handleEnquire}
          sx={{ flexGrow: 1 }}
        >
          {isAdmin ? 'View Enquiries' : 'Enquire Now'}
        </Button>
        <Tooltip title="Views">
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Visibility fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {project.views || 0}
            </Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Add to Wishlist">
          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
            <Favorite fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
            <Share fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
