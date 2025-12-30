import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
		}
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		console.warn(input);
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	console.log('+input: ', input);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'join-card'}>
						<Stack className={'join-left'}>
							<Box className={'brand'}>
								<img src="/img/logo/Frame.svg" alt="ViserPet" />
								<div>
									<strong>ViserPet</strong>
									<span>Happy pets, happier people</span>
								</div>
							</Box>

							<Box className={'mode-toggle'}>
								<button className={loginView ? 'active' : ''} onClick={() => viewChangeHandler(true)}>
									Log in
								</button>
								<button className={!loginView ? 'active' : ''} onClick={() => viewChangeHandler(false)}>
									Sign up
								</button>
							</Box>

							<Box className={'hero-copy'}>
								<span className="eyebrow">{loginView ? 'Welcome back' : 'Join the pack'}</span>
								<h1>{loginView ? 'Log in to your pet world' : 'Create your ViserPet account'}</h1>
								<p>
									Stay close to your favorite pets, agents, and community stories. Manage everything from one comfy place.
								</p>
							</Box>

							<Box className={'input-wrap'}>
								<div className={'input-box'}>
									<label>Nickname</label>
									<input
										type="text"
										placeholder={'Enter Nickname'}
										onChange={(e) => handleInput('nick', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								<div className={'input-box'}>
									<label>Password</label>
									<input
										type="password"
										placeholder={'Enter Password'}
										onChange={(e) => handleInput('password', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<label>Phone</label>
										<input
											type="tel"
											placeholder={'Enter Phone'}
											onChange={(e) => handleInput('phone', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter') doSignUp();
											}}
										/>
									</div>
								)}
							</Box>

							<Box className={'register'}>
								{!loginView && (
									<div className={'type-option'}>
										<span className={'text'}>Register as</span>
										<div className={'type-checkboxes'}>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'USER'}
															onChange={checkUserTypeHandler}
															checked={input?.type == 'USER'}
														/>
													}
													label="User"
												/>
											</FormGroup>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'AGENT'}
															onChange={checkUserTypeHandler}
															checked={input?.type == 'AGENT'}
														/>
													}
													label="Agent"
												/>
											</FormGroup>
										</div>
									</div>
								)}

								{loginView && (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
										</FormGroup>
										<a>Lost your password?</a>
									</div>
								)}

								<div className="cta-row">
									{loginView ? (
										<Button
											variant="contained"
											endIcon={<img src="/img/icons/rightup.svg" alt="" />}
											disabled={input.nick == '' || input.password == ''}
											onClick={doLogin}
										>
											Log in
										</Button>
									) : (
										<Button
											variant="contained"
											disabled={input.nick == '' || input.password == '' || input.phone == '' || input.type == ''}
											onClick={doSignUp}
											endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										>
											Sign up
										</Button>
									)}
									<p className="switch-text">
										{loginView ? (
											<>
												New here?{' '}
												<b
													onClick={() => {
														viewChangeHandler(false);
													}}
												>
													Create account
												</b>
											</>
										) : (
											<>
												Already a member?{' '}
												<b onClick={() => viewChangeHandler(true)}>Log in</b>
											</>
										)}
									</p>
								</div>
							</Box>
						</Stack>

						<Stack className={'join-right'}>
							<div className="visual">
								<span className={'hero-ellipse hero-ellipse--1'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--2'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--3'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--4'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--5'} aria-hidden />
								<span className={'hero-ellipse hero-ellipse--6'} aria-hidden />
								<div className="glow" />
								<div className="card">
									<p>Safe & easy</p>
									<strong>Care for every pet</strong>
								</div>
								<img src="/img/newProduct/dog_headphones.png" alt="Happy pet" />
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
