import * as React from 'react';
import classNames from 'classnames';

import { DynamicComponent } from '../../components-registry';
import BaseLayout from '../BaseLayout';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { ProductFeedLayout, PageComponentProps, ProjectLayout, Product, SectionModels } from '@/types';
import BlotterBackground from '../../backgrounds/BlotterBackground';

type ComponentProps = PageComponentProps & ProductFeedLayout & { items: ProjectLayout[] };

const Component: React.FC<ComponentProps> = (props) => {
    const { global, ...page } = props;
    const { title, topSections = [], bottomSections = [], items, projectFeed, styles = {} } = page;

    // Transform ProjectLayout[] to Product[]
    const transformedProducts: Product[] = items.map((item) => ({
        id: item.__metadata.id, // Guaranteed to exist
        title: item.title,
        description: item.description,
        date: item.date,
        featuredImage: {
            url: item.featuredImage?.url || '/default-image.jpg', // Provide a default URL if missing
        },
        // Map other necessary fields here
    }));

    return (
        < BlotterBackground >
            <BaseLayout {...props}>
                <main id="main" className="layout page-layout">
                    {title && (
                        <div
                            className={classNames(
                                'flex',
                                'py-12',
                                'lg:py-16',
                                'px-4',
                                mapStyles({ justifyContent: projectFeed?.styles?.self?.justifyContent ?? 'center' })
                            )}
                        >
                            <h1
                                className={classNames(
                                    'w-full',
                                    mapStyles({ width: projectFeed?.styles?.self?.width ?? 'wide' }),
                                    styles?.title ? mapStyles(styles.title) : null
                                )}
                            >
                                {title}
                            </h1>
                        </div>
                    )}
                    <Sections sections={topSections} />
                    <div className="flex items-center justify-center py-36">
                        <div className="max-w-2xl px-4 mx-auto">
                            <h1 className="text-center text-xl font-semibold leading-relaxed coming-soon">
                                Go out and ride your bike!
                            </h1>
                            <div className="text-center text-lg font-medium leading-relaxed mt-4">
                                We have nothing to sell, not everything needs to be about money. Come along to one of our events, have fun and meet some lovely people.
                            </div>
                        </div>
                    </div>
                    <Sections sections={bottomSections} />
                </main>
            </BaseLayout>
        </ BlotterBackground >
    );
};

export default Component;

function Sections({ sections }: { sections: SectionModels[] }) {
    if (sections.length === 0) {
        return null;
    }
    return (
        <div>
            {sections.map((section, index) => {
                return <DynamicComponent key={index} {...section} />;
            })}
        </div>
    );
}