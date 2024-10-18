import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const LightboxMarkdown = ({ content }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');

    const options = {
        overrides: {
            img: {
                component: ({ src, alt }) => (
                    <img
                        src={src}
                        alt={alt}
                        onClick={() => {
                            setCurrentImage(src);
                            setIsOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                ),
            },
        },
    };

    return (
        <>
            <Markdown options={options}>{content}</Markdown>
            {isOpen && (
                <Lightbox
                    mainSrc={currentImage}
                    onCloseRequest={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default LightboxMarkdown;