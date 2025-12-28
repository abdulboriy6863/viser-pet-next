import React, { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCollection } from '../../enums/property.enum';
import { ProductsInquiry } from '../../types/property/property.input';

interface FilterTopProps {
	searchFilter: ProductsInquiry;
	onCollectionChange: (collections: ProductCollection[]) => void;
}

const COLLECTIONS: { key: ProductCollection; label: string; icon: string; bg: string; color: string }[] = [
	{ key: ProductCollection.ANIMAL_DOG, label: 'Dog Shop', icon: '🐶', bg: '#e8f5e4', color: '#6cb24a' },
	{ key: ProductCollection.ANIMAL_CAT, label: 'Cat Shop', icon: '🐱', bg: '#fdf0d9', color: '#f4ae3d' },
	{ key: ProductCollection.ANIMAL_FISH, label: 'Fish Food', icon: '🐟', bg: '#e6e6f5', color: '#6770c9' },
	{ key: ProductCollection.ANIMAL_OTHER, label: 'Small Animal', icon: '🐰', bg: '#e5f8fd', color: '#1aa4d9' },
	{ key: ProductCollection.ANIMAL_BIRD, label: 'Bird Shop', icon: '🐦', bg: '#fde9ee', color: '#e15b77' },
];

const FilterTop = ({ searchFilter, onCollectionChange }: FilterTopProps) => {
	const device = useDeviceDetect();
	const activeCollections = useMemo(() => searchFilter?.search?.typeList || [], [searchFilter]);

	const toggleCollection = (key: ProductCollection) => {
		const exists = activeCollections.includes(key);
		const next = exists ? [] : [key];
		onCollectionChange(next);
	};

	if (device === 'mobile') {
		return null;
	}

	return (
		<Stack className="filter-top" direction="row" justifyContent="center" alignItems="center" spacing={3}>
			{COLLECTIONS.map((item) => {
				const isActive = activeCollections.includes(item.key);
				return (
					<button
						type="button"
						className={`filter-top__pill ${isActive ? 'active' : ''}`}
						style={{ backgroundColor: item.bg, borderColor: isActive ? item.color : 'transparent' }}
						onClick={() => toggleCollection(item.key)}
						key={item.key}
					>
						<span className="filter-top__icon" style={{ color: item.color }}>
							{item.icon}
						</span>
						<Typography component="span" className="filter-top__label" color={isActive ? '#2f2f2f' : '#3d3d3d'}>
							{item.label}
						</Typography>
					</button>
				);
			})}
		</Stack>
	);
};

export default FilterTop;
