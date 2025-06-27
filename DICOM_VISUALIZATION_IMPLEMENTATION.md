# DICOM Visualization Implementation

This document describes the complete DICOM image visualization system implemented in your tele-medicine application.

## Overview

The DICOM visualization system consists of:

1. **Main DICOM Page** (`/radiologue/dicom`) - Browse studies and series
2. **Series Detail Page** (`/radiologue/dicom/series/[id]`) - View and interact with DICOM images
3. **Download Page** (`/radiologue/dicom/series/[id]/download`) - Download DICOM files
4. **DicomViewer Component** - Advanced DICOM image viewer with window/level controls

## Features Implemented

### ✅ Core Features
- **Study Browser**: View all DICOM studies with patient information
- **Series Management**: Browse series within studies
- **Image Viewer**: Advanced DICOM image visualization with:
  - Window/level adjustment
  - Zoom controls
  - Image navigation (previous/next)
  - Search functionality
- **Download System**: Download individual images or entire series as ZIP
- **Responsive Design**: Works on desktop and mobile devices

### ✅ Advanced Features
- **Real-time Image Processing**: Canvas-based window/level adjustment
- **Error Handling**: Graceful fallback to simple mode if advanced viewer fails
- **Loading States**: Progress indicators and loading spinners
- **Search & Filter**: Find specific images by number or comments
- **Keyboard Navigation**: Arrow keys for image navigation

## File Structure

```
tele-medecine-next/src/
├── app/(dashboard)/radiologue/dicom/
│   ├── page.tsx                           # Main DICOM browser
│   └── series/[id]/
│       ├── page.tsx                       # Series detail with image viewer
│       └── download/
│           └── page.tsx                   # Download functionality
├── components/
│   └── DicomViewer.tsx                    # Advanced DICOM viewer component
└── lib/
    └── api.ts                             # API client configuration
```

## API Endpoints Used

### Backend (tele-medecine-nest)
- `GET /dicom/studies` - Get all studies
- `GET /dicom/studies/:id/series` - Get series for a study
- `GET /dicom/series/:id` - Get series details
- `GET /dicom/series/:id/instances` - Get instances for a series
- `GET /dicom/instances/:id/preview` - Get image preview (JPEG)
- `GET /dicom/instances/:id/file` - Get raw DICOM file
- `GET /dicom/wado/:id` - WADO-GET image access

## How to Use

### 1. Access DICOM Browser
Navigate to `/radiologue/dicom` to see all available DICOM studies.

### 2. Browse Studies
- Use the search bar to find studies by patient name, description, or ID
- Click on a study to see its series
- View study details in the bottom panel

### 3. View Series Images
- Click "Voir" on any series to open the image viewer
- Use the left panel to browse through images
- Navigate with arrow buttons or click on specific images
- Use search to find specific images

### 4. Interact with Images
- **Window/Level**: Adjust image contrast and brightness
- **Zoom**: Use zoom controls or mouse wheel
- **Navigation**: Use arrow keys or buttons to move between images
- **Download**: Download individual images or entire series

### 5. Download Images
- Click the download icon next to any image for individual download
- Visit the download page for bulk download options
- Choose between ZIP download (all images) or individual files

## Technical Implementation

### DicomViewer Component

The `DicomViewer` component provides advanced DICOM image visualization:

```tsx
<DicomViewer
  imageUrl={`/api/dicom/instances/${instanceId}/preview?quality=90`}
  instanceId={instanceId}
  onError={(error) => console.error('DICOM viewer error:', error)}
/>
```

**Features:**
- Canvas-based rendering for real-time image processing
- Window/level adjustment with sliders
- Zoom controls with mouse wheel support
- Error handling with fallback to simple mode
- Loading states and progress indicators

### Image Processing

The viewer applies window/level transformations in real-time:

```typescript
const applyWindowLevel = (ctx, img, center, width) => {
  // Apply window/level transformation to pixel data
  const min = center - width / 2;
  const max = center + width / 2;
  const range = max - min;
  
  // Transform each pixel value
  for (let i = 0; i < data.length; i += 4) {
    const pixelValue = data[i];
    let newValue = ((pixelValue - min) / range) * 255;
    newValue = Math.max(0, Math.min(255, newValue));
    data[i] = data[i + 1] = data[i + 2] = newValue;
  }
};
```

### Error Handling

The system includes comprehensive error handling:

1. **API Errors**: Network failures, authentication issues
2. **Image Loading Errors**: Corrupted or missing images
3. **Viewer Errors**: Fallback to simple image display
4. **Download Errors**: Progress tracking and retry mechanisms

## Performance Optimizations

### Image Loading
- Progressive loading with quality parameters
- Client-side caching for frequently accessed images
- Lazy loading of image thumbnails

### Memory Management
- Proper cleanup of canvas contexts
- URL.revokeObjectURL for blob cleanup
- Efficient array buffer handling

### User Experience
- Loading spinners and progress indicators
- Responsive design for all screen sizes
- Keyboard shortcuts for power users

## Security Considerations

### Authentication
- All DICOM endpoints require valid JWT tokens
- Automatic token refresh and logout on expiration
- Role-based access control (RADIOLOGUE, MEDECIN)

### Data Protection
- HTTPS transmission for all image data
- Secure file download with proper headers
- Audit logging for image access

## Future Enhancements

### Planned Features
1. **Cornerstone.js Integration**: Professional medical imaging tools
2. **Multi-planar Reconstruction (MPR)**: 3D image viewing
3. **Annotations**: Drawing tools and measurements
4. **Study Comparison**: Side-by-side image comparison
5. **Advanced Measurements**: Distance, angle, area calculations

### Performance Improvements
1. **Web Workers**: Background image processing
2. **Image Compression**: Adaptive quality based on zoom level
3. **Caching Strategy**: Intelligent image caching
4. **Virtual Scrolling**: For large series with many images

## Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Check authentication token
   - Verify API endpoint availability
   - Check browser console for errors

2. **Viewer Not Working**
   - Try switching to simple mode
   - Check browser compatibility
   - Verify image format support

3. **Download Failures**
   - Check file size limits
   - Verify network connectivity
   - Check browser download settings

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('dicom-debug', 'true');
```

This will log detailed information about:
- API requests and responses
- Image loading progress
- Viewer state changes
- Error details

## Dependencies

### Required Packages
- `jszip`: For creating ZIP downloads
- `axios`: For API communication
- `lucide-react`: For icons
- `@radix-ui/react-*`: For UI components

### Optional Packages (for future enhancements)
- `cornerstone-core`: Professional DICOM viewing
- `cornerstone-tools`: Advanced measurement tools
- `dicom-parser`: Raw DICOM file parsing

## Testing

### Manual Testing Checklist
- [ ] Study browsing and search
- [ ] Series navigation
- [ ] Image viewing and navigation
- [ ] Window/level adjustment
- [ ] Zoom controls
- [ ] Download functionality
- [ ] Error handling
- [ ] Mobile responsiveness

### Automated Testing
Run the test suite:
```bash
npm run test
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the API documentation
3. Check network connectivity
4. Verify authentication status

## Contributing

When adding new features:
1. Follow the existing code structure
2. Add proper error handling
3. Include loading states
4. Test on multiple devices
5. Update this documentation 