import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, Typography, Checkbox, OutlinedInput, Tooltip, IconButton, Divider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ProductCollection, ProductVolume } from '../../enums/property.enum'; // ProductVolume shu yerda bo‘lsa
import { ProductInquiry } from '../../types/property/property.input';

interface FilterType {
	searchFilter: ProductInquiry;
	setSearchFilter: any;
	initialInput: ProductInquiry;
}

type CollectionGroupKey = 'FOOD' | 'ACCESSORIES_TOYS' | 'BEDS_CLOTHING_HYGIENE' | 'HEALTH';

const FILTER_IMAGE_SRC = '/img/newProduct/filtterImg.webp'; // o‘zing keyin almashtirasan

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();

	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');
	const [activeGroup, setActiveGroup] = useState<CollectionGroupKey | null>(null);

	// price inputs local (router.push paytida NaN bo‘lmasin)
	const [minPrice, setMinPrice] = useState<string>(
		searchFilter?.search?.pricesRange?.start !== undefined ? String(searchFilter.search.pricesRange.start) : '',
	);
	const [maxPrice, setMaxPrice] = useState<string>(
		searchFilter?.search?.pricesRange?.end !== undefined ? String(searchFilter.search.pricesRange.end) : '',
	);

	const allVolumes = useMemo(() => Object.values(ProductVolume ?? {}), []);
	// typeList / volumeList hozirgi holat
	const selectedTypes = searchFilter?.search?.typeList ?? [];
	const selectedVolumes = searchFilter?.search?.volumeList ?? [];
	const discounted = Boolean(searchFilter?.search?.discounted);

	// --- LABELS (clientga chiroyli ko‘rinish uchun) ---
	const collectionLabel = useCallback((c: ProductCollection) => {
		const map: Partial<Record<ProductCollection, string>> = {
			// ---- Food Types ----
			FOOD_DOG: 'Dog food',
			FOOD_CAT: 'Cat food',
			FOOD_FISH: 'Fish food',
			FOOD_BIRD: 'Bird food',

			FOOD_DRY: 'Dry food',
			FOOD_WET: 'Wet food',
			FOOD_TREAT: 'Treats',
			FOOD_SUPPLEMENT: 'Supplements',

			// ---- Accessories & Toys ----
			ACCESSORY_GENERAL: 'Accessories',
			ACCESSORY_DOG: 'Dog accessories',
			ACCESSORY_CAT: 'Cat accessories',
			ACCESSORY_FISH: 'Fish accessories',
			ACCESSORY_BIRD: 'Bird accessories',

			TOY_DOG: 'Dog toys',
			TOY_CAT: 'Cat toys',
			TOY_BIRD: 'Bird toys',

			// ---- Beds, Clothing, Hygiene ----
			BED_DOG: 'Dog beds',
			BED_CAT: 'Cat beds',

			CLOTHING_DOG: 'Dog clothing',
			CLOTHING_CAT: 'Cat clothing',

			CLEANING_GENERAL: 'Cleaning',
			CLEANING_DOG: 'Dog hygiene',
			CLEANING_CAT: 'Cat hygiene',

			// ---- Health products ----
			MEDICINE_GENERAL: 'Health products',
			MEDICINE_DOG: 'Dog medicine',
			MEDICINE_CAT: 'Cat medicine',
		};

		return map[c] ?? String(c).replaceAll('_', ' ').toLowerCase();
	}, []);

	const volumeLabel = useCallback((v: any) => {
		// Agar ProductVolume enum nomlari chiroyli bo‘lmasa, shu yerda map qilasan
		// masalan: VOLUME_SMALL => 'Small', ...
		return String(v).replaceAll('_', ' ').toLowerCase();
	}, []);

	// --- GROUPS (hover bo‘lganda ichidagi list ko‘rinadi) ---
	const COLLECTION_GROUPS = useMemo(() => {
		return [
			{
				key: 'FOOD' as const,
				title: 'Food Types',
				items: [
					ProductCollection.FOOD_DOG,
					ProductCollection.FOOD_CAT,
					ProductCollection.FOOD_FISH,
					ProductCollection.FOOD_BIRD,
					ProductCollection.FOOD_DRY,
					ProductCollection.FOOD_WET,
					ProductCollection.FOOD_TREAT,
					ProductCollection.FOOD_SUPPLEMENT,
				].filter(Boolean) as ProductCollection[],
			},
			{
				key: 'ACCESSORIES_TOYS' as const,
				title: 'Accessories & Toys',
				items: [
					ProductCollection.ACCESSORY_GENERAL,
					ProductCollection.ACCESSORY_DOG,
					ProductCollection.ACCESSORY_CAT,
					ProductCollection.ACCESSORY_FISH,
					ProductCollection.ACCESSORY_BIRD,
					ProductCollection.TOY_DOG,
					ProductCollection.TOY_CAT,
					ProductCollection.TOY_BIRD,
				].filter(Boolean) as ProductCollection[],
			},
			{
				key: 'BEDS_CLOTHING_HYGIENE' as const,
				title: 'Beds, Clothing, Hygiene',
				items: [
					ProductCollection.BED_DOG,
					ProductCollection.BED_CAT,
					ProductCollection.CLOTHING_DOG,
					ProductCollection.CLOTHING_CAT,
					ProductCollection.CLEANING_GENERAL,
					ProductCollection.CLEANING_DOG,
					ProductCollection.CLEANING_CAT,
				].filter(Boolean) as ProductCollection[],
			},
			{
				key: 'HEALTH' as const,
				title: 'Health products',
				items: [
					ProductCollection.MEDICINE_GENERAL,
					ProductCollection.MEDICINE_DOG,
					ProductCollection.MEDICINE_CAT,
				].filter(Boolean) as ProductCollection[],
			},
		];
	}, []);

	// --- router/update helper ---
	const pushFilter = useCallback(
		async (nextSearch: any) => {
			const next = {
				...searchFilter,
				search: {
					...searchFilter.search,
					...nextSearch,
				},
			};

			// clean empty arrays
			if (!next.search?.typeList?.length) delete next.search.typeList;
			if (!next.search?.volumeList?.length) delete next.search.volumeList;

			// clean empty price range
			if (
				!next.search?.pricesRange ||
				(next.search.pricesRange.start === undefined && next.search.pricesRange.end === undefined)
			) {
				delete next.search.pricesRange;
			}

			setSearchFilter(next);

			await router.push(`/property?input=${JSON.stringify(next)}`, `/property?input=${JSON.stringify(next)}`, {
				scroll: false,
			});
		},
		[router, searchFilter, setSearchFilter],
	);

	// sync searchText / price inputs when filter changes outside
	useEffect(() => {
		setSearchText(searchFilter?.search?.text ?? '');
		setMinPrice(
			searchFilter?.search?.pricesRange?.start !== undefined ? String(searchFilter.search.pricesRange.start) : '',
		);
		setMaxPrice(
			searchFilter?.search?.pricesRange?.end !== undefined ? String(searchFilter.search.pricesRange.end) : '',
		);
	}, [searchFilter?.search?.text, searchFilter?.search?.pricesRange?.start, searchFilter?.search?.pricesRange?.end]);

	// --- handlers ---
	const toggleType = useCallback(
		async (value: ProductCollection) => {
			const exists = selectedTypes.includes(value);
			const next = exists ? selectedTypes.filter((x) => x !== value) : [...selectedTypes, value];
			await pushFilter({ typeList: next });
		},
		[selectedTypes, pushFilter],
	);

	const toggleVolume = useCallback(
		async (value: any) => {
			const exists = selectedVolumes.includes(value);
			const next = exists ? selectedVolumes.filter((x: any) => x !== value) : [...selectedVolumes, value];
			await pushFilter({ volumeList: next });
		},
		[selectedVolumes, pushFilter],
	);

	const toggleDiscount = useCallback(async () => {
		await pushFilter({ discounted: !discounted });
	}, [discounted, pushFilter]);

	const applySearchText = useCallback(async () => {
		await pushFilter({ text: searchText?.trim() || '' });
	}, [pushFilter, searchText]);

	const applyPrice = useCallback(async () => {
		const start = minPrice.trim() === '' ? undefined : Number(minPrice);
		const end = maxPrice.trim() === '' ? undefined : Number(maxPrice);

		// invalid -> ignore
		const safeStart = Number.isFinite(start as any) ? (start as number) : undefined;
		const safeEnd = Number.isFinite(end as any) ? (end as number) : undefined;

		if (safeStart === undefined && safeEnd === undefined) {
			await pushFilter({ pricesRange: undefined });
			return;
		}

		await pushFilter({ pricesRange: { start: safeStart, end: safeEnd } });
	}, [minPrice, maxPrice, pushFilter]);

	const refreshHandler = useCallback(async () => {
		setSearchText('');
		setMinPrice('');
		setMaxPrice('');
		setActiveGroup(null);

		await router.push(
			`/property?input=${JSON.stringify(initialInput)}`,
			`/property?input=${JSON.stringify(initialInput)}`,
			{ scroll: false },
		);
		setSearchFilter(initialInput);
	}, [initialInput, router, setSearchFilter]);

	if (device === 'mobile') return <div>FILTER</div>;

	return (
		<Stack className="filter-main">
			{/* SEARCH */}
			<Stack className="filter-section">
				<Typography className="filter-titleMain">Find products</Typography>

				<Stack className="filter-searchRow">
					<OutlinedInput
						value={searchText}
						type="text"
						className="filter-searchInput"
						placeholder="What are you looking for?"
						onChange={(e: any) => setSearchText(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter') applySearchText();
						}}
						endAdornment={
							<CancelRoundedIcon
								className="filter-clearIcon"
								onClick={() => {
									setSearchText('');
									pushFilter({ text: '' });
								}}
							/>
						}
					/>

					<Tooltip title="Reset">
						<IconButton className="filter-resetBtn" onClick={refreshHandler}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* DISCOUNT (Product tags o‘rniga) */}
			<Stack className="filter-section">
				<Typography className="filter-title">Discount</Typography>

				<label className="filter-checkRow">
					<Checkbox
						className="filter-checkbox"
						checked={discounted}
						onChange={toggleDiscount}
						color="default"
						size="small"
					/>
					<span className="filter-checkLabel">Only discounted products</span>
				</label>
			</Stack>

			{/* PRODUCT COLLECTIONS (Product categories o‘rniga) */}
			<Stack className="filter-section" onMouseLeave={() => setActiveGroup(null)}>
				<Typography className="filter-title">Product collections</Typography>

				<Stack className="filter-groups">
					{COLLECTION_GROUPS.map((g) => (
						<div
							key={g.key}
							className={`filter-group ${activeGroup === g.key ? 'is-active' : ''}`}
							onMouseEnter={() => setActiveGroup(g.key)}
						>
							<div className="filter-groupHead">
								<span className="filter-groupTitle">{g.title}</span>
								<span className="filter-groupArrow">›</span>
							</div>

							{/* Hover submenu */}
							<div className={`filter-subMenu ${activeGroup === g.key ? 'is-open' : ''}`}>
								<div className="filter-subMenuInner">
									{g.items.map((item) => (
										<label key={String(item)} className="filter-checkRow">
											<Checkbox
												className="filter-checkbox"
												color="default"
												size="small"
												checked={selectedTypes.includes(item)}
												onChange={() => toggleType(item)}
											/>
											<span className="filter-checkLabel">{collectionLabel(item)}</span>
										</label>
									))}
								</div>
							</div>

							<Divider className="filter-divider" />
						</div>
					))}
				</Stack>
			</Stack>

			{/* PRODUCT VOLUME */}
			<Stack className="filter-section">
				<Typography className="filter-title">Product volume</Typography>

				<Stack className="filter-list">
					{allVolumes.map((v: any) => (
						<label key={String(v)} className="filter-checkRow">
							<Checkbox
								className="filter-checkbox"
								color="default"
								size="small"
								checked={selectedVolumes.includes(v)}
								onChange={() => toggleVolume(v)}
							/>
							<span className="filter-checkLabel">{volumeLabel(v)}</span>
						</label>
					))}
				</Stack>
			</Stack>

			{/* PRICE RANGE */}
			<Stack className="filter-section">
				<Typography className="filter-title">Price range</Typography>

				<div className="filter-priceRow">
					<input
						className="filter-priceInput"
						type="number"
						placeholder="$ min"
						min={0}
						value={minPrice}
						onChange={(e) => setMinPrice(e.target.value)}
						onBlur={applyPrice}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter') applyPrice();
						}}
					/>
					<div className="filter-priceDivider" />
					<input
						className="filter-priceInput"
						type="number"
						placeholder="$ max"
						min={0}
						value={maxPrice}
						onChange={(e) => setMaxPrice(e.target.value)}
						onBlur={applyPrice}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter') applyPrice();
						}}
					/>
				</div>
			</Stack>

			{/* BOTTOM IMAGE CARD */}
			<div className="filter-promoCard">
				<img className="filter-promoImg" src={FILTER_IMAGE_SRC} alt="Promo" />
			</div>
		</Stack>
	);
};

export default Filter;
