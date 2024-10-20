import React, { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const CustomImage = ({ src, alt }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
                <Image src={src} alt={alt} layout="responsive" width={800} height={600} />
            </div>
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={[{ src, alt }]}
            />
        </>
    );
};

export default CustomImage;