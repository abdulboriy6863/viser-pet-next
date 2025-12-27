import React from 'react';
import { Stack, Box } from '@mui/material';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import moment from 'moment';
import useDeviceDetect from '../hooks/useDeviceDetect';

const Footer = () => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	return (
		<Stack id="footer" component="footer">
			{/* TOP WAVE (rasm senda bor - pathni o'zing qo'yasan) */}
			<Box className="vp-footer__wave" aria-hidden />

			<Box className="footer-container">
				{/* PROMO CARD */}

				{/* MAIN FOOTER */}
				<Box className="vp-footer__main">
					{/* BRAND */}
					<Box className="vp-footer__brand">
						<Box className="vp-footer__logoRow">
							<img className="vp-footer__logo" src="/img/logo/Frame.svg" alt="ViserPet" />
							<Box className="vp-footer__brandText">
								<strong>ViserPet</strong>
								<span>YOUR BEST CHOOSE</span>
							</Box>
						</Box>

						<p className="vp-footer__desc">Maecenas tempus tellus eget condimentum rhoncus sem quam semper</p>

						<Box className="vp-footer__call">
							<span className="vp-footer__callLabel">CALL US</span>
							<a className="vp-footer__callValue" href="tel:00088889999">
								000 - 8888 - 9999
							</a>
						</Box>

						<Box className="vp-footer__social">
							<FacebookOutlinedIcon />
							<TelegramIcon />
							<InstagramIcon />
							<TwitterIcon />
						</Box>
					</Box>

					{/* LINKS 1 */}
					<Box className="vp-footer__col">
						<h4 className="vp-footer__colTitle">Useful Links</h4>
						<a className="vp-footer__link" href="#">
							Help &amp; Contact
						</a>
						<a className="vp-footer__link" href="#">
							About Us
						</a>
						<a className="vp-footer__link" href="#">
							Privacy Policy
						</a>
						<a className="vp-footer__link" href="#">
							Order History
						</a>
					</Box>

					{/* LINKS 2 (rasmda 2ta Useful Links bor edi) */}
					<Box className="vp-footer__col">
						<h4 className="vp-footer__colTitle">Useful Links</h4>
						<a className="vp-footer__link" href="#">
							Help &amp; Contact
						</a>
						<a className="vp-footer__link" href="#">
							About Us
						</a>
						<a className="vp-footer__link" href="#">
							Privacy Policy
						</a>
						<a className="vp-footer__link" href="#">
							Order History
						</a>
					</Box>

					{/* NEWSLETTER */}
					<Box className="vp-footer__newsletter">
						<h4 className="vp-footer__colTitle">
							Subscribe To Our Newsletter And Get
							<br />
							10% Off Your First Purchase..
						</h4>

						<Box className="vp-footer__inputWrap">
							<input className="vp-footer__input" placeholder="Email Address" />
							<button className="vp-footer__sendBtn" type="button" aria-label="Subscribe">
								<SendRoundedIcon />
							</button>
						</Box>
					</Box>
				</Box>

				{/* BOTTOM LINE */}
				<Box className="vp-footer__bottom">
					<span>© ViserPet - All rights reserved. {moment().year()}</span>

					{!isMobile && <span className="vp-footer__bottomLinks">Privacy · Terms · Sitemap</span>}
				</Box>
			</Box>
		</Stack>
	);
};

export default Footer;
