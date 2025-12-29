import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/property':
					title = 'Property Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/properties.png';
					break;
				case '/product':
					title = 'Products';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/properties.png';
					break;
				case '/agent':
					title = 'Agents';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/agents.webp';
					break;
				case '/agent/detail':
					title = 'Agent Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		const isAgent = router.pathname.startsWith('/agent');
		const isProductLike = router.pathname.startsWith('/product') || router.pathname.startsWith('/property') || isAgent;
		const footerClassName = isAgent ? 'footer--agent hero-section' : undefined;

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Nestar</title>
						<meta name={'title'} content={`Nestar`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'} className={footerClassName}>
							<Footer className={footerClassName} />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Viser pet</title>
						<meta name={'title'} content={`Nestar`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{!isProductLike && (
							<Stack
								className={`header-basic ${authHeader && 'auth'}`}
								style={{
									backgroundImage: `url(${memoizedValues.bgImage})`,
									backgroundSize: 'cover',
									boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
								}}
							>
								<Stack className={'container'}>
									<strong>{t(memoizedValues.title)}</strong>
									<span>{t(memoizedValues.desc)}</span>
								</Stack>
							</Stack>
						)}

						{isProductLike && (
							<Stack
								className={`hero-banner-product${isAgent ? ' hero-banner-product--agent hero-section' : ''}`}
							>
								<Stack className={`hero-banner__inner${isAgent ? ' hero-banner__inner--agent' : ''}`}>
									<Stack className={'hero-banner__content'}>
										<span className={'hero-banner__title'}>
											New & Exclusive
											<br />
											Dog Clothing
										</span>

										<span
											className="hero-banner__title-button"
											style={{
												color: '#1a1a1a',
												fontFamily: '"Nunito", sans-serif',
												fontSize: '20px',
												fontWeight: 500,
												letterSpacing: '-0.2px',
												lineHeight: '1.6',
											}}
										>
											Shop our new range of winter dog
											<br />
											coats & jackets in-store or online
										</span>

										{/* <Stack className={'hero-banner__actions'}>
											<a className={'hero-banner__cta'} href={'/property'}>
												Shop now
											</a>
										</Stack> */}
									</Stack>

									<Stack className={`hero-banner__visual${isAgent ? ' hero-banner__visual--agent' : ''}`}>
										<img
											className={'hero-banner__image'}
											src={isAgent ? '/img/newProduct/dog_headphones.png' : '/img/newProduct/image2.png'}
											alt="Puppy with bow tie"
											loading="lazy"
										/>
									</Stack>
								</Stack>

								<span className={'hero-ellipse hero-ellipse--1'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--2'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--3'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--4'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--5'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--6'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--7'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--1b'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--3b'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--7b'} aria-hidden />
								<span className={'hero-banner__wave'} aria-hidden />
							</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'} className={footerClassName}>
							<Footer className={footerClassName} />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
