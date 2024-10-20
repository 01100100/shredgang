import * as React from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import { Annotated } from '@/components/Annotated';

export default function ImageBlock(props) {
    const { elementId, className, url, altText = '', width, height } = props;
    if (!url) {
        return null;
    }

    return (
        <Annotated content={props}>
            <div id={elementId || null} className={classNames('sb-component', 'sb-component-block', 'sb-component-image-block', className)}>
                <Image
                    src={url}
                    alt={altText}
                    width={width || 800} // Provide default width if not specified
                    height={height || 600} // Provide default height if not specified
                    layout="responsive"
                    className={className}
                />
            </div>
        </Annotated>
    );
}