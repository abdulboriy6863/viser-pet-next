// Top.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { Stack, Box, Typography, Button, Menu, MenuItem, Divider } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import type { MenuProps } from '@mui/material/Menu';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PinterestIcon from '@mui/icons-material/Pinterest';
import { Logout } from '@mui/icons-material';
import { CaretDown } from 'phosphor-react';

import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

import useDeviceDetect from '../hooks/useDeviceDetect';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { REACT_APP_API_URL } from '../config';
import { formatterStr } from '../utils';

import { basketTotals, removeItem, subscribeBasket } from '../hooks/basket';

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
		'& .MuiMenu-list': { padding: '4px 0' },
		'& .MuiMenuItem-root': {
			'&:active': {
				backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
			},
		},
	},
}));

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();

	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);

	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);

	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);

	const [cartAnchor, setCartAnchor] = useState<null | HTMLElement>(null);
	const cartOpen = Boolean(cartAnchor);

	// ✅ Basket state
	const [basketCount, setBasketCount] = useState(0);
	const [basketSubtotal, setBasketSubtotal] = useState(0);
	const [basketItems, setBasketItems] = useState<any[]>([]);

	// locale
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem('locale');
		if (!stored) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else setLang(stored);
	}, [router.asPath]);

	// bg
	useEffect(() => {
		setBgColor(router.pathname === '/property/detail');
	}, [router.pathname]);

	// jwt -> userVar sync
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	// scroll listener (memory leak yo‘q)
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const onScroll = () => setColorChange(window.scrollY >= 50);
		window.addEventListener('scroll', onScroll);
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// ✅ basket refresh
	const refreshBasket = useCallback(() => {
		const { items, subtotal, count } = basketTotals(user?._id);
		setBasketItems(items);
		setBasketSubtotal(subtotal);
		setBasketCount(count);
	}, [user?._id]);

	useEffect(() => {
		refreshBasket();
	}, [refreshBasket, user?._id]);

	useEffect(() => {
		const unsub = subscribeBasket(user?._id, refreshBasket);
		return () => unsub();
	}, [user?._id, refreshBasket]);

	/** HANDLERS **/
	const langClick = (e: any) => setAnchorEl2(e.currentTarget);
	const langClose = () => setAnchorEl2(null);

	const langChoice = useCallback(
		async (e: any) => {
			const next = e.target.id;
			setLang(next);
			if (typeof window !== 'undefined') localStorage.setItem('locale', next);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: next });
		},
		[router],
	);

	const handleCartClick = (event: any) => setCartAnchor(event.currentTarget);
	const handleCartClose = () => setCartAnchor(null);

	const handleGoOrder = async () => {
		setCartAnchor(null);
		await router.push('/order');
	};

	const handleRemove = (productId: string) => {
		if (!user?._id) return;
		removeItem(productId, user._id);
		refreshBasket();
	};

	const handleLogout = () => {
		setLogoutAnchor(null);
		setCartAnchor(null);
		logOut();
	};

	if (device === 'mobile') {
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
					<div>{t('Agents')}</div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div>{t('Community')}</div>
				</Link>
				<Link href={'/cs'}>
					<div>{t('CS')}</div>
				</Link>
			</Stack>
		);
	}

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
									<img src={`/img/flag/lang${lang || 'en'}.png`} alt={'flag'} />
								</Box>
								<span className={'lang-label'}>{(lang || 'en').toUpperCase()}</span>
							</Button>

							<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
								<MenuItem disableRipple onClick={langChoice} id="en">
									<img className="img-flag" src={'/img/flag/langen.png'} id="en" alt={'usaFlag'} />
									{t('English')}
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="kr">
									<img className="img-flag" src={'/img/flag/langkr.png'} id="kr" alt={'koreanFlag'} />
									{t('Korean')}
								</MenuItem>
								<MenuItem disableRipple onClick={langChoice} id="ru">
									<img className="img-flag" src={'/img/flag/langru.png'} id="ru" alt={'russiaFlag'} />
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
							<div>{t('Agents')}</div>
						</Link>
						<Link href={'/community?articleCategory=FREE'}>
							<div>{t('Community')}</div>
						</Link>
						{user?._id && (
							<Link href={'/mypage'}>
								<div>{t('My Page')}</div>
							</Link>
						)}
						<Link href={'/cs'}>
							<div>{t('CS')}</div>
						</Link>
					</Box>

					<Box component={'div'} className={'nav-right'}>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt="user"
										/>
									</div>

									<Menu
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => setLogoutAnchor(null)}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={handleLogout}>
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
								<span className={'badge'}>{user?._id ? basketCount : 0}</span>
							</div>

							<SettingsOutlinedIcon className={'nav-icon'} />
						</Box>

						<Menu
							anchorEl={cartAnchor}
							open={cartOpen}
							onClose={handleCartClose}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							PaperProps={{ sx: { minWidth: 360, borderRadius: '14px', padding: '10px' } }}
						>
							<Stack spacing={1.5} sx={{ p: '12px' }}>
								<Typography sx={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '15px' }}>
									Basket ({user?._id ? basketCount : 0})
								</Typography>

								{!user?._id ? (
									<>
										<Typography sx={{ color: '#6b7280', fontSize: '13px' }}>Please login to use basket.</Typography>
										<Button variant="contained" onClick={() => router.push('/account/join')}>
											Login / Register
										</Button>
									</>
								) : basketItems.length === 0 ? (
									<>
										<Typography sx={{ color: '#6b7280', fontSize: '13px' }}>Your basket is empty.</Typography>
										<Button variant="contained" onClick={() => router.push('/property')}>
											Go shopping
										</Button>
									</>
								) : (
									<>
										<Divider />

										<Stack spacing={1.2} sx={{ maxHeight: 320, overflowY: 'auto', pr: '4px' }}>
											{basketItems.map((it: any) => {
												const img = it.productImage
													? `${REACT_APP_API_URL}/${it.productImage}`
													: '/img/property/bigImage.png';

												const lineTotal = (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0);

												return (
													<Stack key={it.productId} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
														<Box
															component="img"
															src={img}
															alt={it.productName}
															sx={{ width: 54, height: 54, borderRadius: '10px', objectFit: 'cover' }}
														/>
														<Stack sx={{ flex: 1, minWidth: 0 }}>
															<Typography sx={{ fontSize: '13px', fontWeight: 800 }} noWrap>
																{it.productName}
															</Typography>
															<Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
																Qty: {it.quantity} · ${formatterStr(it.unitPrice)}
															</Typography>
															<Typography sx={{ fontSize: '12px', fontWeight: 800 }}>
																${formatterStr(lineTotal)}
															</Typography>
														</Stack>

														<Button
															variant="text"
															sx={{ minWidth: 'auto', fontSize: '12px' }}
															onClick={() => handleRemove(it.productId)}
														>
															Remove
														</Button>
													</Stack>
												);
											})}
										</Stack>

										<Divider />

										<Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography sx={{ fontWeight: 800 }}>Subtotal</Typography>
											<Typography sx={{ fontWeight: 900 }}>${formatterStr(basketSubtotal)}</Typography>
										</Stack>

										<Button variant="contained" onClick={handleGoOrder}>
											Checkout / Order
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
};

export default withRouter(Top);
