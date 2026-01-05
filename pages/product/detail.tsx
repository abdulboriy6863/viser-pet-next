import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Pagination as MuiPagination } from '@mui/material';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import Review from '../../libs/components/product/Review';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GET_COMMENTS, GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';

import { Product } from '../../libs/types/product/property';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';

import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

// ✅ MUHIM: to‘g‘ri import
import { addToBasket } from '../../libs/hooks/basket';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [productId, setProductId] = useState<string>('');
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');

	const [activePdTab, setActivePdTab] = useState<'description' | 'comment' | 'faq'>('description');
	const [addingToBasket, setAddingToBasket] = useState<boolean>(false);

	// comments
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [productComments, setProductComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);

	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PRODUCT,
		commentContent: '',
		commentRefId: '',
	});

	/** MAP (client-only) */
	const KoreaPetStatsMap = dynamic(() => import('./koreaPetsStatsMap'), { ssr: false });

	/** =========================
	 * APOLLO
	 * ========================= */
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);

	const { loading: getProductLoading, refetch: getProductRefetch } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const p = data?.getProduct;
			if (p) {
				setProduct(p);
				setSlideImage(p?.productImages?.[0] ?? '');
			}
		},
		onError: async (err) => {
			await sweetMixinErrorAlert(err?.message || 'Failed to load product');
		},
	});

	const { refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !productId,
		notifyOnNetworkStatusChange: true,
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry?.search?.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProductComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
		onError: async (err) => {
			await sweetMixinErrorAlert(err?.message || 'Failed to load comments');
		},
	});

	/** =========================
	 * LIFECYCLE
	 * ========================= */
	useEffect(() => {
		const id = router.query?.id;
		if (!id) return;

		const pid = String(id);
		setProductId(pid);

		setCommentInquiry((prev: CommentsInquiry) => ({
			...prev,
			search: { ...prev.search, commentRefId: pid },
		}));

		setInsertCommentData((prev) => ({
			...prev,
			commentRefId: pid,
		}));
	}, [router.query?.id]);

	useEffect(() => {
		if (!commentInquiry?.search?.commentRefId) return;
		getCommentsRefetch({ input: commentInquiry });
	}, [commentInquiry.search.commentRefId, commentInquiry.page]);

	/** =========================
	 * PRICE
	 * ========================= */
	const priceInfo = useMemo(() => {
		const basePrice = Number(product?.productPrice) || 0;
		const discountValue = Number(product?.productDiscount) || 0;

		const hasDiscount = discountValue > 0;
		const isPercent = hasDiscount && discountValue <= 100;

		const discountAmount = hasDiscount ? (isPercent ? (basePrice * discountValue) / 100 : discountValue) : 0;
		const finalPrice = Math.max(0, basePrice - discountAmount);

		return {
			basePrice,
			finalPrice,
			hasDiscount,
			priceLabel: `₩${formatterStr(finalPrice)}`,
			originalPriceLabel: hasDiscount && finalPrice !== basePrice ? `₩${formatterStr(basePrice)}` : null,
		};
	}, [product]);

	/** =========================
	 * HANDLERS
	 * ========================= */
	const changeImageHandler = (image: string) => setSlideImage(image);

	const likeProductHandler = async (pid?: string) => {
		try {
			if (!pid) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({ variables: { input: pid } });

			if (pid === product?._id) {
				await getProductRefetch({ input: pid });
			}

			await getProductsRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {},
				},
			});

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Unable to like product');
		}
	};

	const commentPaginationChangeHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const createCommentHandler = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!insertCommentData.commentContent?.trim()) return;

			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	// ✅ ADD TO BASKET (works)
	const handleAddToBasket = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!product?._id) throw new Error('Product not ready');

			setAddingToBasket(true);

			const next = addToBasket(product, 1, user._id);

			// ✅ Debug: yozildimi tekshir
			// console.log('[BASKET]', localStorage.getItem(`basket_${user._id}`), next);

			await sweetTopSmallSuccessAlert('Added to basket', 900);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Failed to add to basket');
		} finally {
			setAddingToBasket(false);
		}
	};

	/** =========================
	 * LOADING
	 * ========================= */
	if (getProductLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') return <div>PRODUCT DETAIL PAGE</div>;

	return (
		<div id={'property-detail-page'}>
			<div className={'container'}>
				<Stack className={'property-detail-config'}>
					<Stack className={'property-info-config'}>
						<Stack className={'pd-layout'}>
							{/* LEFT: images */}
							<Stack className={'pd-images'}>
								<Stack className={'pd-thumbs'}>
									{product?.productImages?.map((subImg: string) => {
										const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
										return (
											<Stack className={'pd-thumb'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={imagePath} alt="thumb" />
											</Stack>
										);
									})}
								</Stack>

								<Stack className={'pd-main'}>
									<img
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
										alt="main"
									/>
								</Stack>
							</Stack>

							{/* RIGHT: info panel */}
							<Stack className={'pd-info'}>
								<Typography className={'pd-title'}>{product?.productName}</Typography>

								<Stack className={'pd-priceRow'}>
									<Typography className={'pd-price'}>{priceInfo.priceLabel}</Typography>
									{priceInfo.originalPriceLabel && (
										<Typography className={'pd-discount'}>{priceInfo.originalPriceLabel}</Typography>
									)}
								</Stack>

								<Typography className={'pd-desc'}>{product?.productDetail}</Typography>

								<Stack className={'pd-details'}>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Collection</Typography>
										<Typography className={'v'}>{product?.productCollection}</Typography>
									</Stack>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Volume</Typography>
										<Typography className={'v'}>{product?.productVolume}</Typography>
									</Stack>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Left Count</Typography>
										<Typography className={'v'}>{product?.productLeftCount}</Typography>
									</Stack>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Sold Count</Typography>
										<Typography className={'v'}>{product?.productSoldCount}</Typography>
									</Stack>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Views</Typography>
										<Typography className={'v'}>{product?.productViews}</Typography>
									</Stack>
									<Stack className={'pd-row'}>
										<Typography className={'k'}>Likes</Typography>
										<Typography className={'v'}>{product?.productLikes}</Typography>
									</Stack>
								</Stack>

								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{product?.productViews}</Typography>
										</Stack>

										<Stack className="button-box">
											{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													fontSize={'medium'}
													onClick={() => likeProductHandler(product?._id)}
												/>
											) : (
												<FavoriteBorderIcon fontSize={'medium'} onClick={() => likeProductHandler(product?._id)} />
											)}
											<Typography>{product?.productLikes}</Typography>
										</Stack>
									</Stack>

									<Button
										variant="contained"
										className="add-basket"
										onClick={handleAddToBasket}
										disabled={addingToBasket || !product}
									>
										{addingToBasket ? 'Adding...' : 'Add to basket'}
									</Button>
								</Stack>
							</Stack>
						</Stack>
					</Stack>

					{/* DESC / COMMENT / FAQ */}
					<Stack className={'property-desc-config'}>
						<Stack className={'left-config'}>
							<Stack className={'prop-desc-config'}>
								<Stack className={'pd-tabs'}>
									<button
										type="button"
										className={`pd-tab ${activePdTab === 'description' ? 'active' : ''}`}
										onClick={() => setActivePdTab('description')}
									>
										Description
									</button>
									<button
										type="button"
										className={`pd-tab ${activePdTab === 'comment' ? 'active' : ''}`}
										onClick={() => setActivePdTab('comment')}
									>
										Comment
									</button>
									<button
										type="button"
										className={`pd-tab ${activePdTab === 'faq' ? 'active' : ''}`}
										onClick={() => setActivePdTab('faq')}
									>
										FAQ
									</button>
								</Stack>

								<Stack className={'pd-tabBody'}>
									{activePdTab === 'description' && (
										<Stack className={'pd-description'}>
											<Typography className={'desc'}>{product?.productDesc ?? 'No Description!'}</Typography>
										</Stack>
									)}

									{activePdTab === 'comment' && (
										<Stack className={'pd-comments'}>
											<Stack className={'pd-commentsHead'}>
												<Typography className={'pd-commentsTitle'}>Comments</Typography>
												<Typography className={'pd-commentsCount'}>{commentTotal ?? 0} total</Typography>
											</Stack>

											<Stack className={'reviews-config pd-commentsWrap'}>
												<Stack className={'review-list'}>
													{!commentTotal ? (
														<Typography className={'pd-empty'}>Hozircha comment yo‘q.</Typography>
													) : (
														<>
															{productComments?.map((comment: Comment) => (
																<Review comment={comment} key={comment?._id} />
															))}
															<Box component={'div'} className={'pagination-box'}>
																<MuiPagination
																	page={commentInquiry.page}
																	count={Math.ceil(commentTotal / commentInquiry.limit)}
																	onChange={commentPaginationChangeHandler}
																	shape="circular"
																	color="primary"
																/>
															</Box>
														</>
													)}
												</Stack>
											</Stack>
										</Stack>
									)}

									{activePdTab === 'faq' && (
										<Stack className={'pd-faq'}>
											<Stack className={'pd-faqItem'} component="details">
												<Typography component="summary" className={'pd-faqQ'}>
													Yetkazib berish qancha vaqt oladi?
												</Typography>
												<Typography className={'pd-faqA'}>
													Odatda 1–3 ish kuni ichida yetkazib beriladi. Hududga qarab ozgina farq qilishi mumkin.
												</Typography>
											</Stack>
											<Stack className={'pd-faqItem'} component="details">
												<Typography component="summary" className={'pd-faqQ'}>
													Discount qanday ishlaydi?
												</Typography>
												<Typography className={'pd-faqA'}>
													Discount bo‘lsa narx yonida ko‘rinadi. Aksiyadagi mahsulotlar tez tugashi mumkin.
												</Typography>
											</Stack>
											<Stack className={'pd-faqItem'} component="details">
												<Typography component="summary" className={'pd-faqQ'}>
													Qaytarish (refund) mumkinmi?
												</Typography>
												<Typography className={'pd-faqA'}>
													Ha, mahsulot holati saqlangan bo‘lsa 7 kun ichida qaytarish mumkin. Chek/receipt talab
													qilinadi.
												</Typography>
											</Stack>
											<Stack className={'pd-faqItem'} component="details">
												<Typography component="summary" className={'pd-faqQ'}>
													Commentlar qanday tekshiriladi?
												</Typography>
												<Typography className={'pd-faqA'}>
													Spam yoki haqoratli kontent o‘chiriladi. Real foydalanuvchi izohlari ustuvor.
												</Typography>
											</Stack>
										</Stack>
									)}
								</Stack>
							</Stack>

							<Stack className="floor-plans-config">
								<div className="video-overlay">
									<h2>반려동물을 보호합시다</h2>
									<p>
										반려동물은 단순한 동물이 아니라 우리의 가족이자 소중한 친구입니다. 작은 관심과 사랑이 그들의 삶을 더
										안전하고 행복하게 만듭니다.
									</p>
								</div>
								<video className="floor-video" src="/img/newProduct/detailvideo1.mp4" autoPlay muted loop playsInline />
							</Stack>

							<KoreaPetStatsMap />

							{commentTotal !== 0 && (
								<Stack className={'reviews-config'}>
									<Stack className={'review-list'}>
										{productComments?.map((comment: Comment) => (
											<Review comment={comment} key={comment?._id} />
										))}
										<Box component={'div'} className={'pagination-box'}>
											<MuiPagination
												page={commentInquiry.page}
												count={Math.ceil(commentTotal / commentInquiry.limit)}
												onChange={commentPaginationChangeHandler}
												shape="circular"
												color="primary"
											/>
										</Box>
									</Stack>
								</Stack>
							)}

							<Stack className={'leave-review-config'}>
								<Typography className={'main-title'}>Leave A Review</Typography>
								<textarea
									onChange={({ target: { value } }: any) =>
										setInsertCommentData((prev) => ({ ...prev, commentContent: value }))
									}
									value={insertCommentData.commentContent}
								/>
								<Box className={'submit-btn'} component={'div'}>
									<Button
										className={'submit-review'}
										disabled={insertCommentData.commentContent === '' || !user?._id}
										onClick={createCommentHandler}
									>
										<Typography className={'title'}>Submit Review</Typography>
									</Button>
								</Box>
							</Stack>
						</Stack>

						{/* RIGHT CONTACT */}
						<Stack className={'right-config'}>
							<Stack className={'info-box'}>
								<Typography className={'main-title'}>Get More Information</Typography>
								<Stack className={'image-info'}>
									<img
										className={'member-image'}
										src={
											product?.memberData?.memberImage
												? `${REACT_APP_API_URL}/${product?.memberData?.memberImage}`
												: '/img/profile/defaultUser.svg'
										}
										alt="member"
									/>
									<Stack className={'name-phone-listings'}>
										<Link href={`/member?memberId=${product?.memberData?._id}`}>
											<Typography className={'name'}>{product?.memberData?.memberNick}</Typography>
										</Link>
										<Stack className={'phone-number'}>
											<Typography className={'number'}>{product?.memberData?.memberPhone}</Typography>
										</Stack>
										<Typography className={'listings'}>View Listings</Typography>
									</Stack>
								</Stack>
							</Stack>

							<Stack className={'info-box'}>
								<Typography className={'sub-title'}>Name</Typography>
								<input type={'text'} placeholder={'Enter your name'} />
							</Stack>
							<Stack className={'info-box'}>
								<Typography className={'sub-title'}>Phone</Typography>
								<input type={'text'} placeholder={'Enter your phone'} />
							</Stack>
							<Stack className={'info-box'}>
								<Typography className={'sub-title'}>Email</Typography>
								<input type={'text'} placeholder={'creativelayers088'} />
							</Stack>
							<Stack className={'info-box'}>
								<Typography className={'sub-title'}>Message</Typography>
								<textarea placeholder={'Hello, I am interested in \n' + '[Renovated property at  floor]'} />
							</Stack>
							<Stack className={'info-box'}>
								<Button className={'send-message'}>
									<Typography className={'title'}>Send Message</Typography>
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

PropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutFull(PropertyDetail);
