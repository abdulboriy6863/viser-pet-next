import React from 'react';
import { Stack } from '@mui/material';

const Advertisement = () => {
	return (
		<Stack className="advertisement">
			<div className="advertisement__banner">
				<img src="/img/newProduct/imgforadsbanner.jpg" alt="Happy pet owner" />
			</div>
			<Stack className="container advertisement__content">
				<div className="advertisement__details"></div>
			</Stack>
		</Stack>
	);
};

export default Advertisement;
