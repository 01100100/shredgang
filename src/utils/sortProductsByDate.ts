import dayjs from 'dayjs';

interface Product {
    date?: string;
}

const sortProductsByDate = (products: Product[]) => {
    return products.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return dayjs(b.date).unix() - dayjs(a.date).unix();
    });
};

export default sortProductsByDate;