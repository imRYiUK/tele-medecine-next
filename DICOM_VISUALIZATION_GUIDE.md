# DICOM Visualization Guide

This guide covers all available options for visualizing DICOM images in your medical imaging application.

## Current Implementation

Your application currently uses Orthanc's built-in preview and WADO endpoints for basic DICOM image display.

### Backend API Endpoints

- **Preview**: `/api/dicom/instances/:id/preview` - Returns JPEG preview
- **WADO**: `/api/dicom/wado/:id` - Returns DICOM image via WADO-GET protocol
- **Raw DICOM**: `/api/dicom/instances/:id/file` - Returns raw DICOM file

## Visualization Options

### 1. Basic Image Display (Current)
**File**: `tele-medecine-next/src/app/(dashboard)/radiologue/dicom/series/[id]/page.tsx`

```typescript
<img
  src={selectedInstance.url}
  alt={`Image ${selectedInstance.instanceNumber}`}
  className="max-w-full max-h-96 object-contain"
/>
```

**Pros:**
- Simple implementation
- Works with any image format
- Fast loading
- No additional dependencies

**Cons:**
- No DICOM-specific features
- No window/level adjustment
- No measurements or annotations
- Limited medical imaging tools

### 2. Custom DICOM Viewer (Implemented)
**File**: `tele-medecine-next/src/components/DicomViewer.tsx`

**Features:**
- Window/level adjustment
- Zoom controls
- Basic image processing
- Canvas-based rendering

**Usage:**
```typescript
<DicomViewer
  imageUrl={`/api/dicom/wado/${instanceId}?contentType=image/jpeg`}
  instanceId={instanceId}
  onError={(error) => console.error('DICOM viewer error:', error)}
/>
```

### 3. Cornerstone.js (Recommended for Advanced Features)

**Installation:**
```bash
npm install cornerstone-core cornerstone-tools cornerstone-wado-image-loader
```

**Features:**
- Professional medical imaging tools
- Window/level adjustment
- Zoom, pan, rotate
- Measurements (distance, angle, area)
- Annotations and markup
- Multi-planar reconstruction (MPR)
- Support for all DICOM modalities

**Example Implementation:**
```typescript
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';

// Initialize cornerstone
cornerstoneTools.init();

// Load and display DICOM image
const element = document.getElementById('dicom-element');
const imageId = `wadouri:/api/dicom/wado/${instanceId}`;

cornerstone.loadImage(imageId).then((image) => {
  cornerstone.displayImage(element, image);
  
  // Enable tools
  cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
  cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 });
  cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 });
});
```

### 4. OHIF Viewer (Complete PACS Solution)

**Installation:**
```bash
npm install @ohif/viewer
```

**Features:**
- Complete PACS-like interface
- Multi-view layouts (1x1, 2x2, 3x3, etc.)
- Advanced measurement tools
- Study comparison
- Annotations and reports
- Built-in DICOM tag viewer

**Example Implementation:**
```typescript
import { OHIF } from '@ohif/viewer';

const viewer = new OHIF({
  container: document.getElementById('viewer'),
  studies: [{
    studyInstanceUid: studyId,
    series: [{
      seriesInstanceUid: seriesId,
      instances: [{
        sopInstanceUid: instanceId,
        url: `/api/dicom/wado/${instanceId}`
      }]
    }]
  }]
});
```

### 5. AMIVO (Modern React DICOM Viewer)

**Installation:**
```bash
npm install amivo
```

**Features:**
- React-native friendly
- Modern UI components
- Good performance
- Customizable
- TypeScript support

**Example Implementation:**
```typescript
import { DicomViewer } from 'amivo';

<DicomViewer
  imageUrl={`/api/dicom/wado/${instanceId}`}
  onError={handleError}
  tools={['window-level', 'zoom', 'pan', 'measure']}
/>
```

### 6. Custom Implementation with dicom-parser

Since you already have `dicom-parser` installed, you can build a custom viewer:

**Features you can implement:**
- Parse DICOM metadata
- Extract pixel data
- Apply window/level transformations
- Basic measurements
- Custom rendering

**Example:**
```typescript
import * as dicomParser from 'dicom-parser';

const parseDicom = (arrayBuffer: ArrayBuffer) => {
  const dataSet = dicomParser.parseDicom(arrayBuffer);
  
  // Extract metadata
  const windowCenter = dataSet.uint16('x00281050');
  const windowWidth = dataSet.uint16('x00281051');
  const pixelData = dataSet.elements.x7fe00010;
  
  return { windowCenter, windowWidth, pixelData };
};
```

## Recommended Implementation Strategy

### Phase 1: Enhanced Basic Viewer (Current)
- Use the custom `DicomViewer` component
- Add window/level controls
- Implement zoom and pan
- Add basic measurements

### Phase 2: Professional Medical Viewer
- Implement Cornerstone.js
- Add advanced measurement tools
- Include annotations
- Support multi-planar reconstruction

### Phase 3: Complete PACS Solution
- Consider OHIF Viewer for full PACS functionality
- Add study comparison
- Implement reporting tools
- Include advanced workflows

## Implementation Examples

### Enhanced DICOM Viewer with Measurements

```typescript
// Enhanced version of DicomViewer with measurements
interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'area';
  points: Point[];
  value: number;
  unit: string;
}

const EnhancedDicomViewer = ({ imageUrl, instanceId }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTool, setActiveTool] = useState<'pan' | 'measure' | 'window'>('pan');
  
  // Implementation details...
};
```

### Multi-View Layout

```typescript
const MultiViewDicomViewer = ({ series }) => {
  const [layout, setLayout] = useState('1x1'); // 1x1, 2x2, 3x3
  
  return (
    <div className={`grid grid-cols-${layout.split('x')[0]} gap-4`}>
      {series.instances.map((instance, index) => (
        <DicomViewer
          key={instance.id}
          imageUrl={`/api/dicom/wado/${instance.id}`}
          instanceId={instance.id}
        />
      ))}
    </div>
  );
};
```

## Performance Considerations

1. **Image Caching**: Implement client-side caching for frequently accessed images
2. **Progressive Loading**: Load low-resolution previews first, then high-resolution
3. **Lazy Loading**: Only load images when they're visible
4. **Web Workers**: Use web workers for heavy image processing
5. **Compression**: Use appropriate image compression (JPEG for previews, lossless for measurements)

## Security Considerations

1. **Authentication**: Ensure all DICOM endpoints require proper authentication
2. **Authorization**: Verify user permissions for accessing medical images
3. **Audit Logging**: Log all image access for compliance
4. **Data Protection**: Ensure images are transmitted securely (HTTPS)
5. **Patient Privacy**: Implement proper patient data anonymization if needed

## Integration with Your Current System

Your current system already has:
- ✅ Orthanc PACS server integration
- ✅ WADO and preview endpoints
- ✅ DICOM upload functionality
- ✅ Study and series management
- ✅ Basic image display

Next steps:
1. Implement the enhanced `DicomViewer` component
2. Add measurement tools
3. Consider Cornerstone.js for advanced features
4. Add multi-view layouts
5. Implement annotations and reporting

## Resources

- [Cornerstone.js Documentation](https://cornerstonejs.org/)
- [OHIF Viewer Documentation](https://docs.ohif.org/)
- [DICOM Standard](https://www.dicomstandard.org/)
- [Orthanc Documentation](https://book.orthanc-server.com/)
- [dicom-parser Documentation](https://github.com/cornerstonejs/dicomParser) 