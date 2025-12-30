import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { AllProductsInquiry } from '../../../libs/types/property/property.input';
import { Product } from '../../../libs/types/property/property';
import { ProductCollection, ProductStatus } from '../../../libs/enums/property.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { ProductUpdate } from '../../../libs/types/property/property.update';
import { ProductPanelList } from '../../../libs/components/admin/properties/PropertyList';

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [productsInquiry, setProductsInquiry] = useState<AllProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Product[]>([]);
	const [productsTotal, setProductsTotal] = useState<number>(0);
	const [value, setValue] = useState(
		productsInquiry?.search?.productStatus ? productsInquiry?.search?.productStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const {
		loading: getAllProuctsByAdminLoading,
		data: getAllProuctsByAdminData,
		error: getAllProuctsByAdminError,
		refetch: getAllProuctsByAdminRefetch,
	} = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list);
			setProductsTotal(data?.getAllProductsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getAllProuctsByAdminRefetch({ input: productsInquiry }).then();
	}, [productsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		productsInquiry.page = newPage + 1;
		await getAllProuctsByAdminRefetch({ input: productsInquiry });

		setProductsInquiry({ ...productsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		productsInquiry.limit = parseInt(event.target.value, 10);
		productsInquiry.page = 1;
		await getAllProuctsByAdminRefetch({ input: productsInquiry });
		setProductsInquiry({ ...productsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setProductsInquiry({ ...productsInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.ACTIVE } });
				break;
			case 'SOLD':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.SOLD } });
				break;
			case 'DELETE':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.DELETE } });
				break;
			default:
				delete productsInquiry?.search?.productStatus;
				setProductsInquiry({ ...productsInquiry });
				break;
		}
	};

	const removeProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeProductByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllProuctsByAdminRefetch({ input: productsInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setProductsInquiry({
					...productsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...productsInquiry.search,
						productCollection: [newValue as ProductCollection],
					},
				});
			} else {
				delete productsInquiry?.search?.productCollection;
				setProductsInquiry({ ...productsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateProductHandler = async (updateData: ProductUpdate) => {
		try {
			console.log('+updateData: ', updateData);
			await updateProductByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllProuctsByAdminRefetch({ input: productsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Product List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'SOLD')}
									value="SOLD"
									className={value === 'SOLD' ? 'li on' : 'li'}
								>
									Sold
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(ProductCollection).map((productCollection: string) => (
										<MenuItem
											value={productCollection}
											onClick={() => searchTypeHandler(productCollection)}
											key={productCollection}
										>
											{productCollection}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<ProductPanelList
							products={products}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateProductHandler={updateProductHandler}
							removeProductHandler={removeProductHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={productsTotal}
							rowsPerPage={productsInquiry?.limit}
							page={productsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminProperties.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminProperties);
