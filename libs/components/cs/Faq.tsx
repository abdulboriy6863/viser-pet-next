import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [category, setCategory] = useState<string>('property');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/

	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	// ✅ TEXTLAR PETS GA MOSLAB ALMASHTIRILDI (LOGIC O'ZGARMAGAN)
	const data: any = {
		property: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are the pet products on the site authentic and safe?',
				content: 'Yes. We list only trusted, pet-safe products from verified suppliers.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What types of pet products do you offer?',
				content: 'Food, treats, toys, grooming items, hygiene products, carriers, and accessories.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How can I search for pet products on your website?',
				content: 'Use the search bar and filters like pet type, brand, price range, and product category.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'Do you help new pet owners choose the right items?',
				content: 'Yes. We can recommend starter essentials based on your pet’s age, size, and needs.',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What should I consider when buying pet food?',
				content: 'Check age/size, ingredients, allergies, health conditions, and feeding guidelines.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: 'How long does delivery typically take?',
				content: 'Usually 1 to 3 days depending on your location and the delivery option.',
			},
			{
				id: '00f5a45ed8897f8090116a29',
				subject: 'What if I receive a damaged or wrong pet item?',
				content: 'Contact support immediately. We will help with exchange or return based on our policy.',
			},
			{
				id: '00f5a45ed8897f8090116a28',
				subject: 'Do you sell products for specific breeds or sizes?',
				content: 'Yes. Many items have size/breed options—check the product details and size chart.',
			},
			{
				id: '00f5a45ed8897f8090116a27',
				subject: 'Can I sell pet products on your platform?',
				content: 'Yes, sellers can apply. Please contact the admin to start the onboarding process.',
			},
			{
				id: '00f5a45ed8897f8090116b99',
				subject: 'What if I need help choosing the correct size (collar/harness/clothes)?',
				content: 'Use our size guide and measurements. If unsure, contact support for recommendations.',
			},
		],

		payment: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'How can I pay for my pet order?',
				content: 'You can pay securely using the available checkout payment methods.',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Are there any extra fees when ordering?',
				content: 'No hidden fees. Delivery fees (if any) will be shown clearly before you place the order.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'Do you offer installment payments?',
				content: 'If supported by your payment provider, installments may be available at checkout.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'Is my payment information secure?',
				content: 'Yes. We use secure payment processing and protect your data with encryption.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I pay online?',
				content: 'Yes, you can complete payment online through our secure checkout.',
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: 'What if my payment fails?',
				content: 'Try again or use another method. If the issue continues, contact support for help.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'Do you offer refunds?',
				content: 'Refund eligibility depends on the item type and condition. Check our return/refund policy.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'Are there discounts or promo codes?',
				content: 'Yes, we run promotions sometimes. Apply promo codes at checkout if available.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'How long does payment processing take?',
				content: 'Most card payments are instant. Bank transfers can take longer depending on the provider.',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Are there penalties for late payment?',
				content: 'Late payment rules depend on your payment provider or installment plan terms.',
			},
		],

		buyers: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'What should pet owners pay attention to when ordering?',
				content: 'Confirm pet size/age, ingredients, and product compatibility before buying.',
			},
			{
				id: '00f5a45ed8897f8090116a85',
				subject: 'How do I choose products within my budget?',
				content: 'Use price filters and bundles. Our support can suggest cost-effective essentials.',
			},
			{
				id: '00f5a45ed8897f8090116a84',
				subject: 'What details should I provide when ordering?',
				content: 'Delivery address, contact info, and any notes (e.g., pet allergies) if needed.',
			},
			{
				id: '00f5a45ed8897f8090116a83',
				subject: 'What should I consider when choosing pet grooming items?',
				content: 'Coat type, skin sensitivity, pet behavior, and recommended usage instructions.',
			},
			{
				id: '00f5a45ed8897f8090116a82',
				subject: 'Can I change or cancel my order?',
				content: 'If the order is not shipped yet, we may be able to modify/cancel it. Contact support quickly.',
			},
			{
				id: '00f5a45ed8897f8090116a81',
				subject: 'What are red flags when buying pet food or treats?',
				content: 'Unknown brands, unclear ingredients, no expiry date, or missing nutrition information.',
			},
			{
				id: '00f5a45ed8897f8090116a80',
				subject: 'Do you provide product recommendations?',
				content: 'Yes. Tell us your pet’s breed/age/weight and we’ll suggest suitable options.',
			},
			{
				id: '00f5a45ed8897f8090116a79',
				subject: 'How fast can I get my pet supplies?',
				content: 'Delivery time depends on stock and location. Express options may be available.',
			},
			{
				id: '00f5a45ed8897f8090116a78',
				subject: 'Why buy from a specialized pet platform?',
				content: 'You get curated pet-safe products, guidance, and better category/size filtering.',
			},
			{
				id: '00f5a45ed8897f8090116a77',
				subject: 'What if I change my mind after ordering?',
				content: 'You can request a return if the item meets our return conditions and is unopened/unused.',
			},
		],

		agents: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'How can I become a seller/partner on this pet platform?',
				content: 'Read our terms and contact the admin to start the partner registration process.',
			},
			{
				id: '00f5a45ed8897f8090116a62',
				subject: 'What do I need to start selling pet products here?',
				content: 'Provide business info, product catalog, and pass basic verification.',
			},
			{
				id: '00f5a45ed8897f8090116a63',
				subject: 'How do I attract more customers?',
				content: 'Use clear product photos, detailed descriptions, and competitive pricing.',
			},
			{
				id: '00f5a45ed8897f8090116a64',
				subject: 'What marketing strategies work well for pet products?',
				content: 'Social media content, bundles, seasonal promos, and influencer collaborations.',
			},
			{
				id: '00f5a45ed8897f8090116a65',
				subject: 'How do I handle customer questions and complaints?',
				content: 'Respond fast, be kind, and provide exchange/return options when applicable.',
			},
			{
				id: '00f5a45ed8897f8090116a66',
				subject: 'How do I stay updated with pet market trends?',
				content: 'Follow pet industry news, review customer feedback, and monitor best sellers.',
			},
			{
				id: '00f5a45ed8897f8090116a67',
				subject: 'How do I handle difficult customers?',
				content: 'Stay professional, offer solutions, and escalate complex cases to admin if needed.',
			},
			{
				id: '00f5a45ed8897f8090116a68',
				subject: 'What tools should I use as a seller?',
				content: 'Inventory tracking, order management tools, and analytics to optimize listings.',
			},
			{
				id: '00f5a45ed8897f8090116a69',
				subject: 'How do I ensure compliance for pet products?',
				content: 'Sell safe products, show expiry dates, and follow local consumer regulations.',
			},
			{
				id: '00f5a45ed8897f8090116a70',
				subject: 'How can I grow my pet business on this platform?',
				content: 'Improve listings, maintain fast shipping, and earn trust through good reviews.',
			},
		],

		membership: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'Do you have a membership program?',
				content: 'Not yet. We’re working on a membership program for pet lovers.',
			},
			{
				id: '00f5a45ed8897f8090116a60',
				subject: 'What benefits will members get in the future?',
				content: 'Potentially points, exclusive deals, early access, and member-only bundles.',
			},
			{
				id: '00f5a45ed8897f8090116a59',
				subject: 'Is there a membership fee?',
				content: 'No fee for now because membership features are not launched yet.',
			},
			{
				id: '00f5a45ed8897f8090116a58',
				subject: 'Will membership unlock exclusive pet content or features?',
				content: 'Not currently, but we plan to add member-only content and discounts later.',
			},
			{
				id: '00f5a45ed8897f8090116a57',
				subject: 'How can I sign up for membership?',
				content: 'Membership sign-up will be available when the program launches.',
			},
			{
				id: '00f5a45ed8897f8090116a56',
				subject: 'Will members receive discounts on pet products?',
				content: 'Not right now. Discounts may be introduced when membership is launched.',
			},
			{
				id: '00f5a45ed8897f8090116a55',
				subject: 'Are you planning to introduce membership soon?',
				content: 'We’re exploring options and will announce updates inside the app/site.',
			},
			{
				id: '00f5a45ed8897f8090116a54',
				subject: 'What kind of perks are you considering?',
				content: 'Points, free delivery events, exclusive discounts, and special pet-care guides.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you offer premium membership?',
				content: 'Not yet. Premium membership is not available at the moment.',
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Will membership offer special deals?',
				content: 'Not currently, but we plan to add deals and perks in the future.',
			},
		],

		community: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'What if someone is abusive in the pet community?',
				content: 'Please report immediately or contact the admin so we can take action.',
			},
			{
				id: '00f5a45ed8897f8090116a44',
				subject: 'How can I participate in the pet community?',
				content: 'Create an account and share questions, tips, and pet stories.',
			},
			{
				id: '00f5a45ed8897f8090116a45',
				subject: 'Are there rules for posting?',
				content: 'Yes. Follow our community guidelines to keep it friendly and safe.',
			},
			{
				id: '00f5a45ed8897f8090116a46',
				subject: 'What should I do about spam posts?',
				content: 'Report them. Our team will review and remove spam quickly.',
			},
			{
				id: '00f5a45ed8897f8090116a47',
				subject: 'Can I message other members privately?',
				content: 'Currently, private messaging is not supported.',
			},
			{
				id: '00f5a45ed8897f8090116a48',
				subject: 'Can I share vet tips or product recommendations?',
				content: 'Yes, as long as it’s helpful, respectful, and not misleading.',
			},
			{
				id: '00f5a45ed8897f8090116a49',
				subject: 'How do I protect my privacy?',
				content: 'Avoid posting personal phone numbers, addresses, or sensitive information.',
			},
			{
				id: '00f5a45ed8897f8090116a50',
				subject: 'How can I contribute positively?',
				content: 'Be kind, give constructive advice, and support new pet owners.',
			},
			{
				id: '00f5a45ed8897f8090116a51',
				subject: 'What if I see misinformation about pet care?',
				content: 'Share correct info politely or report the post so admins can review it.',
			},
			{
				id: '00f5a45ed8897f8090116a52',
				subject: 'Are there moderators?',
				content: 'Yes, moderators help keep the pet community safe and respectful.',
			},
		],

		other: [
			{
				id: '00f5a45ed8897f8090116a40',
				subject: 'Who can I contact for business collaboration?',
				content: 'Contact the admin to discuss partnerships or collaboration opportunities.',
			},
			{
				id: '00f5a45ed8897f8090116a39',
				subject: 'Can I advertise my pet services on your platform?',
				content: 'Advertising is not available right now, but we may add it in the future.',
			},
			{
				id: '00f5a45ed8897f8090116a38',
				subject: 'Are sponsorship opportunities available?',
				content: 'Not at the moment. We will announce sponsorship programs if launched.',
			},
			{
				id: '00f5a45ed8897f8090116a36',
				subject: 'Can I write guest posts about pet care?',
				content: "We're not accepting guest posts currently, but we may open it later.",
			},
			{
				id: '00f5a45ed8897f8090116a35',
				subject: 'Do you have a referral program?',
				content: "Not yet. We're considering referral rewards for pet lovers.",
			},
			{
				id: '00f5a45ed8897f8090116a34',
				subject: 'Do you offer affiliate partnerships?',
				content: 'Affiliate partnerships are not available right now.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you sell pet merchandise?',
				content: "We don't offer merch yet, but it may come later.",
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Are you hiring right now?',
				content: 'Currently, we do not have open positions. Check later for updates.',
			},
			{
				id: '00f5a45ed8897f8090116a31',
				subject: 'Do you host pet events or webinars?',
				content: "We're not hosting events right now, but we may in the future.",
			},
			{
				id: '00f5a45ed8897f8090116a30',
				subject: 'Can I request a new feature?',
				content: "Yes. Share your idea with us, and we'll review it for future updates.",
			},
		],
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'property' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('property');
						}}
					>
						Pet Products
					</div>
					<div
						className={category === 'payment' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('payment');
						}}
					>
						Payments
					</div>
					<div
						className={category === 'buyers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('buyers');
						}}
					>
						For Pet Owners
					</div>
					<div
						className={category === 'agents' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('agents');
						}}
					>
						For Sellers
					</div>
					<div
						className={category === 'membership' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('membership');
						}}
					>
						Membership
					</div>
					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
						Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						Other
					</div>
				</Box>

				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
