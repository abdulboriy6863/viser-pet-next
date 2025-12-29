import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.status(200).json({
		rows: [
			{ label: 'Seoul', value: 210 },
			{ label: 'Busan', value: 120 },
			{ label: 'Incheon', value: 90 },
			{ label: 'Daegu', value: 80 },
			{ label: 'Others', value: 160 },
		],
	});
}
