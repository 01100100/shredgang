import React from 'react';
import dayjs from 'dayjs';

type ProductDateProps = {
    date: string;
};

const ProductDate: React.FC<ProductDateProps> = ({ date }) => {
    return <span>{dayjs(date).format('MMMM D, YYYY')}</span>;
};

export default ProductDate;