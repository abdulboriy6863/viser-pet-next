import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/Frame.svg" />

				{/* SEO */}
				<meta name="keyword" content={'viser-pet, viserpet.uz, viserPet, Viser, pets, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={
						'Buy and sell properties anywhere anytime in South Korea. Best Properties at Best prices on vier-pet.uz | ' +
						'Покупайте и продавайте недвижимость в любой точке Южной Кореи в любое время. Лучшая недвижимость по лучшим ценам на vier-pet.uz | ' +
						'대한민국 언제 어디서나 부동산을 사고팔 수 있습니다. VierPet.uz에서 최적의 가격으로 최고의 부동산을 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
//meta datalar quriladi yani title, description, keyword, og:title, og:description, og:image va hokazo
