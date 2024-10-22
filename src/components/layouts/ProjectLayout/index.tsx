import * as React from 'react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import classNames from 'classnames';

import HighlightedPreBlock from './../../../utils/highlighted-markdown';
import BaseLayout from '../BaseLayout';
import { DynamicComponent } from '../../components-registry';
import ImageBlock from '../../molecules/ImageBlock';
import Link from '../../atoms/Link';
import { Annotated } from '@/components/Annotated';
import { PageComponentProps, ProjectLayout } from '@/types';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import ParticleBackground from '../../ParticleBackground';

type ComponentProps = PageComponentProps &
    ProjectLayout & {
        prevProject?: ProjectLayout;
        nextProject?: ProjectLayout;
    };
const Component: React.FC<ComponentProps> = (props) => {
    const { global, ...page } = props;
    const { title, date, client, description, markdownContent, media, prevProject, nextProject, bottomSections = [] } = page;
    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const startDate = dayjs(date).format('YYYY-MM-DD');
    const startTime = dayjs(date).format('HH:mm');
    const endDate = dayjs(date).add(1, 'hour').format('YYYY-MM-DD'); // Assuming end date is 1 hour after start
    const endTime = dayjs(date).add(1, 'hour').format('HH:mm');

    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    return (
        <ParticleBackground>
            <BaseLayout {...props}>
                <main id="main" className="sb-layout sb-project-layout">
                    <article className="px-4 py-14 lg:py-20">
                        <div className="max-w-5xl mx-auto">
                            <header className="mb-10 sm:mb-16">
                                {client && <div className="text-lg uppercase mb-2 md:mb-6">{client}</div>}
                                <div className="md:flex md:justify-between">
                                    <div className="text-lg mb-6 md:mb-0 md:ml-12 md:order-last">
                                        <div className="mb-2">
                                            <time dateTime={dateTimeAttr}>{formattedDate}</time>
                                        </div>
                                        <div className="mb-2">
                                            <AddToCalendarButton
                                                name={title}
                                                options={['Apple', 'Google']}
                                                location="Berlin"
                                                startDate={startDate}
                                                startTime={startTime}
                                                endTime={endTime}
                                                timeZone="Europe/Berlin"
                                                buttonStyle="flat"
                                                size="0"
                                                lightMode="dark"
                                                trigger="click"
                                                organizer="ShredGang|contact@shredgang.cc"
                                                hideBranding="true"
                                                description={`[url]${currentUrl}|${currentUrl}[/url] ❤️‍🔥`}
                                            />
                                        </div>
                                    </div>
                                    <h1 className="md:max-w-2xl md:flex-grow">{title}</h1>
                                </div>
                            </header>
                            {description && <div className="text-xl leading-normal uppercase max-w-screen-md mx-auto mb-10 sm:mb-16">{description}</div>}
                            {media && (
                                <div className="mb-10 sm:mb-16">
                                    <ProjectMedia media={media} />
                                </div>
                            )}
                            {markdownContent && (
                                <Markdown options={{ forceBlock: true, overrides: { pre: HighlightedPreBlock } }} className="sb-markdown max-w-screen-md mx-auto">
                                    {markdownContent}
                                </Markdown>
                            )}
                        </div>
                    </article>
                    {bottomSections.length > 0 && (
                        <div>
                            {bottomSections.map((section, index) => {
                                return <DynamicComponent key={index} {...section} />;
                            })}
                        </div>
                    )}
                </main>
            </BaseLayout>
        </ParticleBackground>
    );
};
export default Component;

function ProjectMedia({ media }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}

function ProjectNavItem({ project, label }) {
    return (
        <Annotated content={project}>
            <Link className="sb-project-nav-item group" href={project}>
                {project.featuredImage && (
                    <div className="h-0 w-full mb-6 pt-2/3 relative overflow-hidden">
                        <ImageBlock
                            {...project.featuredImage}
                            className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <span className="sb-component sb-component-block sb-component-link">{label}</span>
            </Link>
        </Annotated>
    );
}
