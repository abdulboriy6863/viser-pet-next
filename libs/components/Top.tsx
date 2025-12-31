import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PinterestIcon from '@mui/icons-material/Pinterest';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL, Messages } from '../config';
import {
	BasketItem,
	BASKET_EVENT,
	BASKET_KEY,
	basketTotals,
	clearBasket,
	readBasket,
	removeFromBasket,
} from '../utils/basket';
import { CREATE_ORDER } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { CreateOrderInput, CreateOrderResponse } from '../types/order/order';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [cartAnchor, setCartAnchor] = useState<null | HTMLElement>(null);
	const cartOpen = Boolean(cartAnchor);
	const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
	const [creatingOrder, setCreatingOrder] = useState<boolean>(false);
	const [createOrder] = useMutation<CreateOrderResponse, { input: CreateOrderInput }>(CREATE_ORDER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/property/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const syncBasket = () => setBasketItems(readBasket());

		syncBasket();
		const handleStorage = (e: StorageEvent) => {
			if (e.key === BASKET_KEY) syncBasket();
		};
		const handleCustom = () => syncBasket();

		window.addEventListener('storage', handleStorage);
		window.addEventListener(BASKET_EVENT, handleCustom as EventListener);
		return () => {
			window.removeEventListener('storage', handleStorage);
			window.removeEventListener(BASKET_EVENT, handleCustom as EventListener);
		};
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleCartClick = (event: any) => {
		setCartAnchor(event.currentTarget);
	};

	const handleCartClose = () => {
		setCartAnchor(null);
	};

	const handleCreateOrder = async () => {
		try {
			if (!basketItems.length) {
				await sweetMixinErrorAlert('Basket is empty');
				return;
			}
			if (!user?._id) {
				await sweetMixinErrorAlert(Messages.error2);
				router.push('/account/join');
				return;
			}

			setCreatingOrder(true);

			const orderItems = basketItems.map((item) => ({
				productId: item.productId,
				memberId: user._id,
				itemQuantity: item.quantity,
				itemPrice: Number(item.product?.productPrice ?? 0),
			}));

			const res = await createOrder({
				variables: {
					input: {
						memberId: user._id,
						items: orderItems,
					},
				},
			});

			const newOrderId = (res.data as any)?.createOrder?._id;

			clearBasket();
			setBasketItems([]);
			setCartAnchor(null);

			await sweetTopSmallSuccessAlert('Order created from basket', 1200);

			router.push(newOrderId ? `/order?orderId=${newOrderId}` : '/order');
		} catch (err: any) {
			console.log('ERROR create order from basket', err?.message);
			await sweetMixinErrorAlert(err?.message || Messages.error1);
		} finally {
			setCreatingOrder(false);
		}
	};

	const handleRemoveItem = (productId: string) => {
		const updated = removeFromBasket(productId);
		setBasketItems(updated);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/property'}>
					<div>{t('Products')}</div>
				</Link>
				<Link href={'/order'}>
					<div>Orders</div>
				</Link>
				<Link href={'/agent'}>
					<div> {t('Agents')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Box component={'div'} className={'top-info-bar'}>
					<Stack className={'container'}>
						<span className={'welcome-text'}>{t('Welcome to our shop!')}</span>
						<Box component={'div'} className={'top-info-actions'}>
							<Box component={'div'} className={'social-links'}>
								<a href={'#'} aria-label="Facebook">
									<FacebookOutlinedIcon />
								</a>
								<a href={'#'} aria-label="Twitter">
									<TwitterIcon />
								</a>
								<a href={'#'} aria-label="LinkedIn">
									<LinkedInIcon />
								</a>
								<a href={'#'} aria-label="Pinterest">
									<PinterestIcon />
								</a>
							</Box>
							<div className={'lan-box'}>
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#ffffff" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'flag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'flag'} />
										)}
									</Box>
									<span className={'lang-label'}>{(lang || 'en').toUpperCase()}</span>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'usaFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="kr"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russiaFlag'}
										/>
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Box>
				<Stack className={`navbar-main ${colorChange ? 'is-sticky' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<img src="/img/logo/Frame.svg" alt="ViserPet logo" />
							</Link>
						</Box>
						<Box className={'brand-name'}>
							<Box className={'brand-title'}>ViserPet</Box>
							<Box className={'brand-subtitle'}>YOUR BEST CHOICE</Box>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/property'}>
								<div>{t('Products')}</div>
							</Link>
							<Link href={'/order'}>
								<div>Orders</div>
							</Link>
							<Link href={'/agent'}>
								<div> {t('Agents')} </div>
							</Link>
							<Link href={'/community?articleCategory=FREE'}>
								<div> {t('Community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'}>
									<div> {t('My Page')} </div>
								</Link>
							)}
							<Link href={'/cs'}>
								<div> {t('CS')} </div>
							</Link>
						</Box>
						<Box component={'div'} className={'nav-right'}>
							<Box component={'div'} className={'user-box'}>
								{user?._id ? (
									<>
										<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
											<img
												src={
													user?.memberImage
														? `${REACT_APP_API_URL}/${user?.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												alt=""
											/>
										</div>

										<Menu
											id="basic-menu"
											anchorEl={logoutAnchor}
											open={logoutOpen}
											onClose={() => {
												setLogoutAnchor(null);
											}}
											sx={{ mt: '5px' }}
										>
											<MenuItem onClick={() => logOut()}>
												<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
												Logout
											</MenuItem>
										</Menu>
									</>
								) : (
									<Link href={'/account/join'}>
										<div className={'join-box'}>
											<AccountCircleOutlinedIcon />
											<span>
												{t('Login')} / {t('Register')}
											</span>
										</div>
									</Link>
								)}
							</Box>
							<Box component={'div'} className={'nav-actions'}>
								<SearchOutlinedIcon className={'nav-icon'} />
								<div className={'cart-icon'} onClick={handleCartClick}>
									<ShoppingCartOutlinedIcon className={'nav-icon'} />
									<span className={'badge'}>{basketItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
								</div>
								<SettingsOutlinedIcon className={'nav-icon'} />
							</Box>

							<Menu
								anchorEl={cartAnchor}
								open={cartOpen}
								onClose={handleCartClose}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								PaperProps={{ sx: { minWidth: 320, borderRadius: '14px', padding: '10px' } }}
							>
								<Stack spacing={1.5} sx={{ p: '4px' }}>
									<Typography sx={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '15px' }}>Basket</Typography>
									{!basketItems.length ? (
										<Typography sx={{ color: '#6b7280', fontSize: '13px' }}>Basket is empty</Typography>
									) : (
										<>
											{basketItems.map((item) => (
												<Stack
													key={item.productId}
													direction="row"
													alignItems="center"
													spacing={1.5}
													sx={{
														border: '1px solid #e5e7eb',
														borderRadius: '12px',
														padding: '8px 10px',
													}}
												>
													<Box
														component="div"
														sx={{
															width: 48,
															height: 48,
															borderRadius: '10px',
															overflow: 'hidden',
															bgcolor: '#f3f4f6',
															border: '1px solid #eef0f3',
														}}
													>
														<img
															src={
																item.product?.productImages?.[0]
																	? `${REACT_APP_API_URL}/${item.product.productImages[0]}`
																	: '/img/property/default.jpg'
															}
															alt={item.product?.productName}
															style={{ width: '100%', height: '100%', objectFit: 'cover' }}
														/>
													</Box>
													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography
															noWrap
															sx={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}
														>
															{item.product?.productName}
														</Typography>
														<Typography sx={{ fontFamily: 'Nunito', fontSize: '12px', color: '#6b7280' }}>
															Qty: {item.quantity}
														</Typography>
													</Box>
													<Typography
														sx={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}
													>
														${Number(item.product?.productPrice ?? 0).toFixed(2)}
													</Typography>
													<Button
														variant="text"
														size="small"
														onClick={() => handleRemoveItem(item.productId)}
														sx={{ minWidth: 0, color: '#b91c1c', fontSize: '12px', fontWeight: 800 }}
													>
														x
													</Button>
												</Stack>
											))}

											<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: '2px' }}>
												<Typography sx={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
													Subtotal
												</Typography>
												<Typography sx={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '14px', color: '#0f172a' }}>
													${basketTotals().subtotal.toFixed(2)}
												</Typography>
											</Stack>

											<Button
												variant="contained"
												disabled={creatingOrder}
												onClick={handleCreateOrder}
												sx={{
													textTransform: 'none',
													borderRadius: '12px',
													fontFamily: 'Nunito',
													fontWeight: 800,
													background: 'linear-gradient(135deg, #b3544f 0%, #8f3d3b 100%)',
												}}
											>
												{creatingOrder ? 'Creating...' : 'Buy now'}
											</Button>
										</>
									)}
								</Stack>
							</Menu>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
