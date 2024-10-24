import * as React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import Section from '../Section';
import { Link, Action } from '../../atoms';
import ImageBlock from '../../molecules/ImageBlock';
import ArrowUpRightIcon from '../../svgs/arrow-up-right';
import Cart from '@/components/svgs/cart';

export default function ProductFeedSection(props) {
    const {
        type,
        elementId,
        colors,
        title,
        subtitle,
        actions = [],
        products = [],
        showDate,
        showDescription,
        showFeaturedImage,
        showReadMoreLink,
        styles = {}
    } = props;

    const sortedProducts = sortProductsByDate(products);

    return (
        <Section type={type} elementId={elementId} colors={colors} styles={styles.self}>
            {title && <h2 className={classNames(styles.title ? mapStyles(styles.title) : null)}>{title}</h2>}
            {subtitle && (
                <p className={classNames('text-lg', 'sm:text-xl', styles.subtitle ? mapStyles(styles.subtitle) : null, { 'mt-6': title })}>{subtitle}</p>
            )}
            <div className={classNames('grid', 'gap-y-12', 'md:grid-cols-2', 'gap-x-6 lg:gap-x-8', { 'mt-12': !!(title || subtitle) })}>
                {sortedProducts.map((product, index) => (
                    <Link key={index} href={product} className="sb-product-feed-item block group">
                        <article className="border-b border-current pb-10 max-w-3xl">
                            <div className="h-0 h-2/3 w-2/3 mb-6 pt-2/3 mx-auto relative overflow-hidden p-4 rounded-3xl transition-all transition-transform duration-500 group-hover:scale-105">
                                <ImageBlock
                                    {...product.featuredImage}
                                    className="absolute left-0 top-0 rounded-3xl object-cover transition-transform duration-500 transition-all"
                                />
                            </div>
                            {showDate && product.date && (
                                <div className="mb-3">
                                    <ProductDate date={product.date} />
                                </div>
                            )}
                            <h3>{product.title}</h3>
                            {showDescription && product.description && <p className="text-lg mt-5">{product.description}</p>}
                            {product.price && (
                                <p className="text-lg mt-2">
                                    Price: € {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                </p>
                            )}
                            {product.weight_g && <p className="text-lg mt-2">Weight: {product.weight_g} g</p>}
                            {/* TODO: add button to add to cart */}
                            <div className="mt-8">
                                <span className="sb-component sb-component-block sb-component-button sb-component-button-secondary sb-component-button-icon">
                                    <span className="p-2">Add to basket </span>
                                    <Cart className="fill-current h-5 w-5" />
                                </span>
                            </div>


                            {showReadMoreLink && (
                                <div className="mt-8">
                                    <span className="sb-component sb-component-block sb-component-button sb-component-button-secondary sb-component-button-icon">
                                        <span className="sr-only">Read more</span>
                                        <ArrowUpRightIcon className="fill-current h-5 w-5" />
                                    </span>
                                </div>
                            )}
                        </article>
                    </Link>
                ))}
            </div>
            <ProductFeedActions actions={actions} styles={styles.actions} />
        </Section>
    );
}

function ProductFeedActions(props) {
    const { actions = [], styles = {} } = props;
    if (actions.length === 0) {
        return null;
    }
    return (
        <div className="mt-10 overflow-x-hidden">
            <div className={classNames('flex', 'flex-wrap', 'items-center', '-mx-2', mapStyles(styles))}>
                {actions.map((action, index) => (
                    <Action key={index} {...action} className="my-2 mx-2 lg:whitespace-nowrap" />
                ))}
            </div>
        </div>
    );
}

function sortProductsByDate(products) {
    return products.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function ProductDate({ date }) {
    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return <time dateTime={dateTimeAttr}>{formattedDate}</time>;
}