import React from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

type GalleryProps = {
    images: { url: string; altText: string }[];
};

const Gallery: React.FC<GalleryProps> = ({ images }) => {
    return (
        <LightGallery plugins={[lgThumbnail, lgZoom]}>
            {images.map((image, index) => (
                <a key={index} href={image.url}>
                    <img src={image.url} alt={image.altText} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                </a>
            ))}
        </LightGallery>
    );
};

export default Gallery;