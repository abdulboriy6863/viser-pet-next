import { Stack } from '@mui/material';
import { useRouter } from 'next/router';

type CategoryItem = {
	title: string;
	icon: string;
	shape: string;
	slug: string;
};

const categories: CategoryItem[] = [
	{ title: 'Accessories', icon: '/img/category/pet-bowl 1.png', shape: '/img/category/Ellipse 15.png', slug: 'accessories' },
	{ title: 'Dog Shop', icon: '/img/category/dog 1.png', shape: '/img/category/Ellipse 15 (1).png', slug: 'dog' },
	{ title: 'Cat Shop', icon: '/img/category/happy 1.png', shape: '/img/category/Ellipse 15 (2).png', slug: 'cat' },
	{ title: 'Fish Food', icon: '/img/category/fish (1) 1.png', shape: '/img/category/Ellipse 15 (3).png', slug: 'fish' },
	{ title: 'Small Animal', icon: '/img/category/rabbit (1) 1.png', shape: '/img/category/Ellipse 15 (4).png', slug: 'small-animal' },
	{ title: 'Bird Shop', icon: '/img/category/bird (1) 1.png', shape: '/img/category/Ellipse 15 (5).png', slug: 'bird' },
];

const Category = () => {
	const router = useRouter();

	const handleClick = (slug: string) => {
		router.push(`/property?category=${slug}`);
	};

	return (
		<section className="category-tiles">
			<Stack className="container">
				<Stack className="category-tiles__inner">
					{categories.map((item) => (
						<button key={item.slug} className="category-card" onClick={() => handleClick(item.slug)} aria-label={item.title}>
							<span className="category-card__shape">
								<img src={item.shape} alt="" loading="lazy" />
							</span>
							<span className="category-card__icon">
								<img src={item.icon} alt={item.title} loading="lazy" />
							</span>
							<span className="category-card__title">{item.title}</span>
						</button>
					))}
				</Stack>
			</Stack>
		</section>
	);
};

export default Category;
