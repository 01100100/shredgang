// src/components/LightGalleryWrapper.tsx
import React from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

const LightGalleryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <LightGallery plugins={[lgThumbnail, lgZoom]}>
            {children}
        </LightGallery>
    );
};

export default LightGalleryWrapper;