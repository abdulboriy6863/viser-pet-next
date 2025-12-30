import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCollection, ProductVolume } from '../../enums/property.enum';
import { REACT_APP_API_URL } from '../../config';
import { ProductInput } from '../../types/property/property.input';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';

const MAX_IMAGES = 5;

const AddProduct = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement | null>(null);

	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	const [insertProductData, setInsertProductData] = useState<ProductInput>(initialValues);
	const [isUploading, setIsUploading] = useState(false);

	const productVolumeList = useMemo(() => Object.values(ProductVolume), []);
	const productCollectionList = useMemo(() => Object.values(ProductCollection), []);

	const isEditMode = Boolean(router.query.productId);

	/** APOLLO **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getProductLoading,
		data: getProductData,
		refetch: getProductRefetch,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		skip: !isEditMode,
		variables: { input: router.query.productId },
	});

	/** Hydrate form on edit **/
	useEffect(() => {
		if (!isEditMode) return;
		if (getProductLoading) return;

		const p = getProductData?.getProduct;
		if (!p) return;

		setInsertProductData((prev) => ({
			...prev,
			_id: p?._id, // if your backend accepts it; if not, remove
			productVolume: p?.productVolume ?? '',
			productPrice: Number(p?.productPrice ?? 0),
			productCollection: p?.productCollection ?? '',
			productName: p?.productName ?? '',
			productDetail: p?.productDetail ?? '',
			productDiscount: Number(p?.productDiscount ?? 0),
			productLeftCount: Number(p?.productLeftCount ?? 0),
			productImages: Array.isArray(p?.productImages) ? p.productImages : [],
		}));
	}, [isEditMode, getProductLoading, getProductData]);

	/** Access control (admin/agent) **/
	useEffect(() => {
		// sen "admin" dediing, lekin eski code AGENT tekshirardi.
		// Ikkalasiga ruxsat beramiz (xohlasang faqat ADMIN qilamiz).
		if (!user) return;
		if (user?.memberType !== 'ADMIN' && user?.memberType !== 'AGENT') {
			router.back();
		}
	}, [user, router]);

	/** Helpers **/
	const setField = useCallback(<K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
		setInsertProductData((prev) => ({ ...prev, [key]: value }));
	}, []);

	const doDisabledCheck = useMemo(() => {
		const d = insertProductData;

		if (!d.productName?.trim()) return true;
		if (!d.productDetail?.trim()) return true;

		// required enums
		// @ts-ignore
		if (!d.productVolume || d.productVolume === '') return true;
		// @ts-ignore
		if (!d.productCollection || d.productCollection === '') return true;

		if (!Number.isFinite(d.productPrice) || d.productPrice <= 0) return true;

		// leftCount required (sen avval 0 bo'lsa disable qilgansan)
		const left = Number(d.productLeftCount ?? 0);
		if (!Number.isFinite(left) || left <= 0) return true;

		// discount optional: 0 bo’lsa ham mumkin
		const imgs = Array.isArray(d.productImages) ? d.productImages : [];
		if (imgs.length === 0) return true;

		return false;
	}, [insertProductData]);

	/** Upload **/
	const uploadImages = useCallback(async () => {
		try {
			if (!inputRef.current?.files) return;

			const selectedFiles = inputRef.current.files;
			if (selectedFiles.length === 0) return;

			const currentCount = insertProductData.productImages?.length ?? 0;
			if (currentCount + selectedFiles.length > MAX_IMAGES) {
				throw new Error(`You can upload up to ${MAX_IMAGES} images total.`);
			}

			setIsUploading(true);

			const formData = new FormData();
			const filesCount = Math.min(selectedFiles.length, MAX_IMAGES);

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
					}`,
					variables: {
						files: new Array(filesCount).fill(null),
						target: 'property',
					},
				}),
			);

			const map: Record<string, string[]> = {};
			for (let i = 0; i < filesCount; i++) map[String(i)] = [`variables.files.${i}`];

			formData.append('map', JSON.stringify(map));

			for (let i = 0; i < filesCount; i++) {
				formData.append(String(i), selectedFiles[i]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages: string[] = response?.data?.data?.imagesUploader ?? [];

			setInsertProductData((prev) => ({
				...prev,
				productImages: [...(prev.productImages ?? []), ...responseImages].slice(0, MAX_IMAGES),
			}));

			// reset input so same file can be re-uploaded
			if (inputRef.current) inputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Image upload failed');
		} finally {
			setIsUploading(false);
		}
	}, [insertProductData.productImages, token]);

	const removeImage = useCallback((idx: number) => {
		setInsertProductData((prev) => {
			const next = [...(prev.productImages ?? [])];
			next.splice(idx, 1);
			return { ...prev, productImages: next };
		});
	}, []);

	/** Submit **/
	const insertProductHandler = useCallback(async () => {
		try {
			await createProduct({ variables: { input: insertProductData } });

			await sweetMixinSuccessAlert('Product created successfully.');
			await router.push({ pathname: '/mypage', query: { category: 'myProperties' } });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	}, [createProduct, insertProductData, router]);

	const updateProductHandler = useCallback(async () => {
		try {
			// edit mode uchun productId ni inputga qo’shib yuboramiz (backend shuni kutsa)
			const payload: any = {
				...insertProductData,
				_id: getProductData?.getProduct?._id ?? router.query.productId,
			};

			await updateProduct({ variables: { input: payload } });

			await sweetMixinSuccessAlert('Product updated successfully.');
			await router.push({ pathname: '/mypage', query: { category: 'myProperties' } });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	}, [updateProduct, insertProductData, getProductData, router]);

	if (device === 'mobile') return <div>ADD PRODUCT MOBILE (TODO)</div>;

	return (
		<div id="add-product-v2-page">
			<Stack className="ap-header">
				<Stack className="ap-header__left">
					<Typography className="ap-title">{isEditMode ? 'Edit Product' : 'Create Product'}</Typography>
					<Typography className="ap-subtitle">
						Fill out the details carefully — looks premium when done right.
					</Typography>
				</Stack>

				<Stack className="ap-header__right">
					<div className="ap-chip">
						<span className="dot" />
						<span className="text">{isEditMode ? 'Editing Mode' : 'New Product'}</span>
					</div>
				</Stack>
			</Stack>

			<div className="ap-shell">
				{/* LEFT: FORM */}
				<Stack className="ap-card ap-card--form">
					<Typography className="ap-card__title">Product Information</Typography>

					<div className="ap-grid">
						<div className="ap-field ap-field--full">
							<label className="ap-label">Product Name</label>
							<input
								className="ap-input"
								placeholder="e.g. Premium Dog Jacket"
								value={insertProductData.productName}
								onChange={(e) => setField('productName', e.target.value)}
							/>
							<span className="ap-hint">Make it short, clear, and searchable.</span>
						</div>

						<div className="ap-field">
							<label className="ap-label">Price</label>
							<input
								className="ap-input"
								type="number"
								min={0}
								placeholder="0"
								value={insertProductData.productPrice}
								onChange={(e) => setField('productPrice', Number(e.target.value))}
							/>
						</div>

						<div className="ap-field">
							<label className="ap-label">Stock (Left Count)</label>
							<input
								className="ap-input"
								type="number"
								min={0}
								placeholder="0"
								value={insertProductData.productLeftCount ?? 0}
								onChange={(e) => setField('productLeftCount', Number(e.target.value))}
							/>
						</div>

						<div className="ap-field">
							<label className="ap-label">Volume</label>
							<div className="ap-selectWrap">
								<select
									className="ap-select"
									value={(insertProductData.productVolume as any) || ''}
									onChange={(e) => setField('productVolume', e.target.value as any)}
								>
									<option value="" disabled>
										Select volume
									</option>
									{productVolumeList.map((v: any) => (
										<option key={v} value={v}>
											{v}
										</option>
									))}
								</select>
								<span className="ap-caret">▾</span>
							</div>
						</div>

						<div className="ap-field">
							<label className="ap-label">Collection</label>
							<div className="ap-selectWrap">
								<select
									className="ap-select"
									value={(insertProductData.productCollection as any) || ''}
									onChange={(e) => setField('productCollection', e.target.value as any)}
								>
									<option value="" disabled>
										Select collection
									</option>
									{productCollectionList.map((c: any) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
								<span className="ap-caret">▾</span>
							</div>
						</div>

						<div className="ap-field">
							<label className="ap-label">Discount (%)</label>
							<input
								className="ap-input"
								type="number"
								min={0}
								max={100}
								placeholder="0"
								value={insertProductData.productDiscount ?? 0}
								onChange={(e) => setField('productDiscount', Number(e.target.value))}
							/>
							<span className="ap-hint">Optional. 0 means no discount.</span>
						</div>

						<div className="ap-field ap-field--full">
							<label className="ap-label">Description</label>
							<textarea
								className="ap-textarea"
								placeholder="Write a clean, premium description..."
								value={insertProductData.productDetail}
								onChange={(e) => setField('productDetail', e.target.value)}
							/>
						</div>
					</div>
				</Stack>

				{/* RIGHT: IMAGES */}
				<Stack className="ap-card ap-card--media">
					<div className="ap-mediaHead">
						<div>
							<Typography className="ap-card__title">Product Images</Typography>
							<Typography className="ap-mediaSub">
								Upload up to {MAX_IMAGES}. First image is usually the cover.
							</Typography>
						</div>

						<Button
							className="ap-uploadBtn"
							disabled={isUploading || (insertProductData.productImages?.length ?? 0) >= MAX_IMAGES}
							onClick={() => inputRef.current?.click()}
						>
							{isUploading ? 'Uploading...' : 'Add Images'}
							<input
								ref={inputRef}
								type="file"
								hidden
								multiple
								accept="image/jpg, image/jpeg, image/png"
								onChange={uploadImages}
							/>
						</Button>
					</div>

					<div className="ap-drop">
						<div className="ap-drop__icon">⬆</div>
						<div className="ap-drop__text">
							<div className="t1">Drop files here or click “Add Images”</div>
							<div className="t2">JPEG/PNG recommended. Keep it clean & sharp.</div>
						</div>
					</div>

					<div className="ap-gallery">
						{(insertProductData.productImages ?? []).map((image, idx) => {
							const imagePath = `${REACT_APP_API_URL}/${image}`;
							return (
								<div className="ap-thumb" key={`${image}-${idx}`}>
									<img src={imagePath} alt={`product-${idx}`} />
									<button type="button" className="ap-remove" onClick={() => removeImage(idx)}>
										✕
									</button>
									{idx === 0 ? <div className="ap-badge">Cover</div> : null}
								</div>
							);
						})}

						{(insertProductData.productImages?.length ?? 0) === 0 ? (
							<div className="ap-empty">
								<div className="h1">No images yet</div>
								<div className="h2">Add at least one image to enable “Save”.</div>
							</div>
						) : null}
					</div>

					<div className="ap-actions">
						<Button
							className="ap-saveBtn"
							disabled={doDisabledCheck || isUploading}
							onClick={isEditMode ? updateProductHandler : insertProductHandler}
						>
							{isEditMode ? 'Save Changes' : 'Create Product'}
						</Button>

						<Button
							className="ap-ghostBtn"
							onClick={() => router.push({ pathname: '/mypage', query: { category: 'myProperties' } })}
						>
							Cancel
						</Button>
					</div>
				</Stack>
			</div>
		</div>
	);
};

AddProduct.defaultProps = {
	initialValues: {
		productDetail: '',
		productPrice: 0,
		productVolume: '' as any,
		productCollection: '' as any,
		productName: '',
		productDiscount: 0,
		productLeftCount: 0,
		productImages: [],
	},
};

export default AddProduct;
