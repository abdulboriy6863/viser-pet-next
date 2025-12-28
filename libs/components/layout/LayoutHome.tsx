import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

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
					<Stack id="mobile-wrap" className="home-page">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Viser Pet | Pet care & shop</title>
						<meta name={'title'} content={`Viser Pet`} />
					</Head>
					<Stack id="pc-wrap" className="home-page">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'hero-banner'}>
							<Stack className={'hero-banner__inner'}>
								<Stack className={'hero-banner__content'}>
									<span className={'hero-banner__kicker'}>Save 20 -30% Off</span>
									<span className={'hero-banner__title'}>
										Everything your
										<br />
										pet need
									</span>

									<Stack className={'hero-banner__actions'}>
										<a className={'hero-banner__cta'} href={'/property'}>
											Shop now
										</a>
									</Stack>
								</Stack>

								<Stack className={'hero-banner__visual'}>
									<img
										className={'hero-banner__image'}
										src="/img/banner/bannerImg3.avif"
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

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
