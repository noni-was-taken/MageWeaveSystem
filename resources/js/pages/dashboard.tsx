import React, {use, useState, useEffect} from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage, router} from '@inertiajs/react';
import { Download, Plus, ChartBar, Edit, Target, Package, TrendingUp, Clock, CircleAlert, ClockAlertIcon, Calendar, CalendarIcon, SquareKanban, MoveRightIcon} from 'lucide-react';

type Product = {
  product_id: number;
  product_name: string;
  product_qty: number;
  product_price: number;
  low_stock_since: string | null;
  is_hidden: boolean;
  old_qty?: number;
  current_qty?: number;
};

type DashboardProps = {
  products: Product[];
  updateLogs: {
    update_id: number;
    value_update: number;
    product_id: number;
    description: string;
    update_date: string;
  }[];
  summaryData: {
    weekRange: string;
    date: string;
    topSales: {
      product_id: number;
      product_name: string;
      total_sold_qty: number;
      total_sales: number;
    }[];
    leastSold: {
      product_id: number;
      product_name: string;
      total_sold_qty: number;
      total_sales: number;
    }[];
    totalOrders: {
      totalStocksOrdered: number;
      totalSalesRevenue: number;
    };
    records: {
        record_id: number;
        startDay: string;
        endDay: string;
        sheet_file: string;
        is_monthly: boolean;
    }[];
  };
};


export default function dashboard() {
    const { products, updateLogs, summaryData } = usePage<DashboardProps>().props;
    const records = summaryData.records;
    const [currentDate, setCurrentDate] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('');

    useEffect(() => {
        const now = new Date();

        const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        };
        const formattedDate = now.toLocaleDateString('en-US', options);

        const day = now.toLocaleDateString('en-US', { weekday: 'long' });

        setCurrentDate(formattedDate);
        setDayOfWeek(day);
    }, []);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [newProductName, setNewProductName] = useState('');
    const [newProductQty, setNewProductQty] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');

    const { user } = usePage().props as any;
    const isAdmin = user?.role === 'Admin';

    const totalValue = products.reduce((sum, p) => { // total value
        return sum + (Number(p.product_price) * Number(p.product_qty));
        }, 0);
    
    const totalQty = products.reduce((sum, p) => { // total qty
        return sum + (Number(p.product_qty));
        }, 0);
    
    const [showWeeklySummary, setShowWeeklySummary] = useState(false);
    const [showEditPage, setShowEditPage] = useState(false);
    const [showEditTable, setShowEditTable] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');   
    const [stockData, setStockData] = useState(products);

    const toggleProductVisibility = async (productId: number, newVisibility: boolean) => {
        try {
            const response = await fetch(`/products/${productId}/visibility`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({ is_hidden: newVisibility })
            });

            if (!response.ok) {
                throw new Error('Failed to update product visibility');
            }

            // Optionally show a toast or reload
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };
    
        const handleUpdate = async () => {
            if (!selectedProduct) return;

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                const response = await fetch(`/products/${selectedProduct.product_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    product_name: selectedProduct.product_name,
                    product_qty: selectedProduct.product_qty,
                    product_price: selectedProduct.product_price,
                    old_qty: selectedProduct.old_qty ?? 0,
                }),
            });

                if (response.ok) {
                alert('Product updated successfully!');
                setShowEditPage(false);
                window.location.reload(); // or refresh product list without reload
                } else {
                const data = await response.json();
                alert(data.message || 'Update failed.');
                }
            } catch (err) {
                console.error(err);
                alert('Error occurred while updating.');
            }
        };

    const [actionType, setActionType] = useState<'sale' | 'restock' | null>(null);
    const [quantityInput, setQuantityInput] = useState('');
    const [showQtyPopup, setShowQtyPopup] = useState(false);
    const [showHistoricalSummary, setShowHistoricalSummary] = useState(false);

    const handleActionClick = (
        type: 'sale' | 'restock',
        item: Product
    ) => {
        setActionType(type);
        setSelectedProduct({
            product_id: item.product_id,
            product_name: item.product_name,
            product_qty: item.product_qty,
            product_price: item.product_price,
            current_qty: item.product_qty,
            low_stock_since: null,
            is_hidden: item.is_hidden,
        });
        setShowQtyPopup(true);
    };

        const handleDelete = async () => {
        if (!selectedProduct) return;

        const confirmDelete = confirm(`Are you sure you want to delete ${selectedProduct.product_name}?`);
        if (!confirmDelete) return;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/products/${selectedProduct.product_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (response.ok) {
                alert('Product deleted!');
                setShowEditPage(false); // close modal
                window.location.reload(); // reload page
            } else {
                const data = await response.json();
                alert(data.message || 'Delete failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error occurred while deleting.');
        }
    };

    const handleRestock = async () => {
    if (!selectedProduct || !quantityInput) return;

    const qty = parseInt(quantityInput);
    if (isNaN(qty) || qty <= 0) {
        alert('Enter a valid quantity.');
        return;
    }

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/products/${selectedProduct.product_id}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ quantity: qty }),
            });

            if (response.ok) {
                alert('Product restocked successfully!');
                setShowQtyPopup(false);
                setQuantityInput('');
                window.location.reload(); // Optional: update state instead
            } else {
                const data = await response.json();
                alert(data.message || 'Restock failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error occurred while restocking.');
        }
    };

        const handleSale = async () => {
        if (!selectedProduct || !quantityInput) return;

        const qty = parseInt(quantityInput);
        if (isNaN(qty) || qty <= 0) {
            alert('Enter a valid quantity.');
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/products/${selectedProduct.product_id}/sale`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ quantity: qty }),
            });

            if (response.ok) {
                alert('Sale recorded!');
                setShowQtyPopup(false);
                setQuantityInput('');
                window.location.reload(); // Or update state
            } else {
                const data = await response.json();
                alert(data.message || 'Sale failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error occurred during sale.');
        }
    };

            const handleAddProduct = async () => {
        if (!newProductName || !newProductPrice) {
            alert('Please enter both name and price');
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
            body: JSON.stringify({
                product_name: newProductName,
                product_qty: 0, // 👈 default value
                product_price: parseFloat(newProductPrice),
            }),
            });

            if (response.ok) {
            alert('Product added successfully!');
            setNewProductName('');
            setNewProductPrice('');
            setShowEditTable(false); // close modal
            window.location.reload(); // or update local state
            } else {
            const data = await response.json();
            alert(data.message || 'Failed to add product.');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
        };



    const handleSubmitQty = () => {
        const qty = parseInt(quantityInput);
        if (isNaN(qty) || qty <= 0) {
            alert('Enter a valid quantity.');
            return;
        }
        

        console.log(`${actionType?.toUpperCase()} ${qty} units of ${selectedProduct?.product_name}`);
        
        // reset state
        setShowQtyPopup(false);
        setQuantityInput('');
        setSelectedProduct(null);
        setActionType(null);
    };

    const filteredStock = stockData.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (isAdmin || !item.is_hidden)
    );


    const getLowStockAlerts = () => {
        const alerts: { message: string; level: string; daysLow: number; sinceDate: string }[] = [];

        stockData.forEach(item => {
            if (item.product_qty <= 50 && item.low_stock_since) {
                const sinceDate = new Date(item.low_stock_since);
                const now = new Date();

                const diffTime = Math.abs(now.getTime() - sinceDate.getTime());
                const daysLow = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                let level = '';
                if (item.product_qty <= 0) level = 'critical';
                else if (item.product_qty <= 20) level = 'warning';
                else level = 'info';

                alerts.push({
                    message: `${item.product_name} is ${level === 'critical' ? 'out of stock' : level === 'warning' ? 'critically low' : 'running low'} on stock.`,
                    level,
                    daysLow,
                    sinceDate: sinceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                });
            }
        });

        return alerts;
    };



    return (
        <>
            <Head title="MageWeave - Dashboard" />
            <div className='min-h-screen bg-gray-50'>
                {/* header */}
                <div className='w-full h-28 p-2.5 flex items-center shadow-lg bg-white'>
                    {/* logo */}
                    <div className='flex flex-col justify-center w-1/6 h-full items-center space-x-2 '>
                        <img src="/MageWeave_Logo.png" alt="MageWeave Logo" className='h-27 object-contain' />
                    </div>
                    {/* current date */}
                    <div className='w-1/6 ml-auto h-full flex items-center justify-center '>
                        <div className='text-center'>
                            <h1 className='text-xl text-gray-700 font-bold'>{currentDate}</h1>
                            <p className='text-sm text-gray-500'>{dayOfWeek}</p>
                        </div>
                    </div>
                    {/* user profile */}
                    <div className='ml-auto w-2/12 h-full flex justify-center items-center'>
                        <div className='flex items-center space-x-3'>
                            {isAdmin ? (
                                <div className='w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold'>
                                A
                                </div>
                            ) : (
                                <div className='w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold'>
                                U </div>   
                            )}
                            <div>
                                <h1 className='text-lg text-gray-700 font-semibold'>{user.role}</h1>
                                <p className='text-sm text-gray-500'>{user.name}</p>
                            </div>
                            <div className='ml-8'>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button" className='text-red-600 hover:text-red-800 transition-colors underline duration-200 hover:underline-offset-2 cursor-pointer'>
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* first layer */}
                <div className='p-8 w-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        {/* total value */}
                        <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-600 text-sm'>Total Inventory Value</p>
                                    <p className='text-2xl font-bold text-gray-800'>₱{totalValue.toFixed(2)}</p>
                                </div>
                                <TrendingUp className='w-8 h-8'/>
                            </div>
                        </div>
                        {/* total quantity */}
                        <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-gray-600 text-sm'>Total Quantity</p>
                                    <p className='text-2xl font-bold text-gray-800'>{totalQty}</p>
                                </div>
                                <Package className='w-8 h-8'/>
                            </div>
                        </div>
                        {/* view weekly summary button */}
                        <div onClick={()=>setShowWeeklySummary(true)} className='bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center  justify-between cursor-pointer hover:bg-gray-50 transition-colors duration-200'>
                            <div className='flex items-center justify-center'>
                                <p className='text-2xl font-semibold'>View Weekly Summary</p>
                            </div>
                            <CalendarIcon className='h-8 w-8 mr-2 text-green-500'></CalendarIcon>
                        </div>
                    </div>
                </div>

                {/* second layer */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 px-4'>
                    {/* Live Stock Overview */}
                    <div className='lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                        <div className='w-full h-auto flex justify-between'>
                            <h2 className='text-xl font-bold text-gray-800 mb-6'> Live Stock Overview </h2>
                            {isAdmin && (
                                <div onClick={() => setShowEditTable(true)} className='flex cursor-pointer items-center space-x-2 bg-white rounded-lg shadow-sm px-3 py-2 border border-gray-200 hover:shadow-md transition-shadow duration-200'>
                                    <h1 className='text-md'>Add Item</h1>
                                    <Plus className='w-4 h-4 text-gray-500 hover:text-black' />
                                </div>
                            )}
                        </div>
                            
                        <div className='space-y-4 h-96 overflow-x-auto overflow-y-auto'>
                            <table className='min-w-full divide-gray-200'>
                                <thead>
                                    <tr className='border-b border-gray-200'>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'></th>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'>Item ID</th>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'>Item Name</th>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'>Quantity</th>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'>Price</th>
                                        <th className='text-left py-3 px-4 text-gray-600 font-semibold'>Sale/Restock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStock.map((item) => (
                                        <tr key={item.product_id} className={`hover:bg-gray-50 transition-all ${item.is_hidden ? 'bg-red-100 text-red-900 hover:bg-red-50' : 'border-gray-100'}`}>

                                            <td className='py-3 px-4'>

                                                {isAdmin && (
                                                    <Edit 
                                                        onClick={() => {
                                                            setSelectedProduct({
                                                            ...item,
                                                            old_qty: item.product_qty, //store current qty
                                                            });
                                                            setShowEditPage(true);
                                                        }} 
                                                        className='w-4 h-4 text-gray-400 cursor-pointer hover:text-black' 
                                                        />
                                                )}
                                            </td>
                                            <td className='py-3 px-4'> {item.product_id}
                                            </td>
                                            <td className='py-3 px-4 font-medium text-gray-800'>{item.product_name}</td>
                                            <td className='py-3 px-4'>
                                                <span className={`px-2 py-1 rounded-full text-sm ${
                                                    item.product_qty < 50 ? 'bg-red-100 text-red-800' :
                                                    item.product_qty < 100 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {item.product_qty}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4 text-gray-700'>₱{Number(item.product_price).toFixed(2)}</td>
                                            <td>
                                                <div className='flex items-center space-x-2'>
                                                    <button
                                                        onClick={() => handleActionClick('sale', item)}
                                                        className='bg-yellow-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-yellow-700 transition-colors duration-200'
                                                    >
                                                        Sale
                                                    </button>
                                                    <button
                                                        onClick={() => handleActionClick('restock', item)}
                                                        className='bg-green-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-green-700 transition-colors duration-200'
                                                    >
                                                        Restock
                                                    </button>

                                                        {user.role === 'Admin' && (
                                                            <button
                                                                onClick={() => toggleProductVisibility(item.product_id, !item.is_hidden)}
                                                                className={`px-3 py-1 rounded-lg text-white transition-colors duration-200 cursor-pointer ${
                                                                    item.is_hidden ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-600 hover:bg-red-700'
                                                                }`}
                                                            >
                                                                {item.is_hidden ? 'Unhide' : 'Hide'}
                                                            </button>
                                                        )}

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* update log */}
                    <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                        <h2 className='text-xl font-bold text-gray-800 mb-6'>Update Logs</h2>
                        <div className='space-y-4 h-96 overflow-y-auto'>
                            {updateLogs.map((log) => (
                                <div key={log.update_id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div className='flex items-center space-x-3'>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${Number(
                                            log.value_update) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {log.value_update}
                                        </div>
                                        <div>
                                            <p className='text-sm font-medium text-gray-800'>Item {log.product_id}</p>
                                            <p className='text-xs text-gray-600'>{log.description}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center text-gray-500'>
                                        <Clock className='w-4 h-4 mr-1'></Clock>
                                        <span className='text-sm'>{log.update_date.slice(11, 16)}</span>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* third layer - alerts*/}
                <div className='bg-white shadow-lg p-6 mt-8 border border-gray-200'>
                    <h2 className='text-xl font-bold text-gray-800 mb-6'>Alerts</h2>
                    <div className='space-y-4 max-h-96 overflow-y-auto'>
                        {getLowStockAlerts().map((alert, index) => (
                            <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                <div className='flex items-center space-x-3'>
                                    <CircleAlert className={`w-6 h-6 ${
                                        alert.level === 'critical' ? 'text-red-950' :
                                        alert.level === 'warning' ? 'text-red-500' :
                                        'text-yellow-500'
                                    }`} />
                                    <div>
                                        <p className='text-sm font-medium text-gray-800'>Low Stock Alert</p>
                                        <p className='text-xs text-gray-600'>{alert.message}</p>
                                    </div>
                                </div>
                                <div className='flex items-center text-gray-500 space-x-2'>
                                    <ClockAlertIcon className='h-7 w-7 text-red-500' />
                                    <div className='flex flex-col items-center justify-between h-max'>
                                        <span className='text-sm text-red-500 font-bold'>{alert.daysLow} Day{alert.daysLow !== 1 ? 's' : ''} ago</span>
                                        <span className='text-xs text-black'>{alert.sinceDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>    
            {/* Weekly Summary Viewer */}
            {showWeeklySummary && (
                <div className='fixed inset-0 flex items-center bg-black/40 justify-center z-50 backdrop-blur-sm'>
                    <div className='bg-white flex flex-col rounded-xl shadow-lg w-1/2 overflow-auto m-18 p-8 border border-gray-200'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Summary</h2>
                                <p className='text-gray-600'>{summaryData.weekRange}</p>
                                <p className='text-sm text-gray-500'>{summaryData.date}</p>
                            </div>
                            <Calendar onClick={()=>setShowHistoricalSummary(true)}  className='w-8 h-8 text-gray-400 hover:text-black transition-all cursor-pointer' />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {/* Top Sales */}
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                                    <ChartBar className='w-5 h-5 mr-2 text-green-500' />
                                    Top Sales
                                </h3>
                                <div className='space-y-2'>
                                    {summaryData.topSales.map((item, index) => (
                                        <div key={index} className='flex justify-between items-center'>
                                            <span className='text-sm text-gray-700'>• {item.product_name}</span>
                                            <span className='text-sm font-medium text-gray-800'>
                                            {item.total_sold_qty} sold • ₱{item.total_sales.toFixed(2)}
                                            </span>
                                        </div>
                                        ))}
                                </div>
                            </div>

                            {/* Least Sold */}
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                                    <Target className='w-5 h-5 mr-2 text-red-500' />
                                    Least Sold
                                </h3>
                                <div className='space-y-2'>
                                    {summaryData.leastSold.map((item, index) => (
                                    <div key={index} className='flex justify-between items-center'>
                                        <span className='text-sm text-gray-700'>• {item.product_name}</span>
                                        <span className='text-sm font-medium text-gray-800'>
                                        {item.total_sold_qty} sold • ₱{item.total_sales.toFixed(2)}
                                        </span>
                                    </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Orders and Sales */}
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                                    <SquareKanban className='w-5 h-5 mr-2 text-blue-500' />
                                    Total Orders and Sales
                                </h3>
                                <div className='space-y-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-gray-700'>• Total Quantity Sold</span>
                                        <span className='text-sm font-medium text-gray-800'>{summaryData.totalOrders.totalStocksOrdered}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-gray-700'>• Total Sales Revenue</span>
                                        <span className='text-sm font-medium text-gray-800'>₱{summaryData.totalOrders.totalSalesRevenue.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowWeeklySummary(false)} className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showEditPage && (
                <div className='fixed inset-0 flex items-center bg-black/40 justify-center z-50 backdrop-blur-sm'>
                    {/* Edit Page */}
                    <div className='bg-white flex flex-col rounded-xl shadow-lg w-2/5 h-1/2 overflow-auto m-18 p-8 border border-gray-200'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Edit</h2>
                                <p className='text-gray-600'>Product Name</p>
                                <p className='text-sm text-gray-500'>ID: {selectedProduct?.product_id}</p>
                            </div>
                            <Edit className='w-8 h-8 text-gray-400' />
                        </div>

                        <div className= 'w-full h-3/4 flex flex-col justify-between'>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Name:</h1>
                                <p className='text-md text-grey-500'>{selectedProduct?.product_name}</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input
                                        type="text"
                                        value={selectedProduct?.product_name ?? ''}
                                        onChange={(e) =>
                                            setSelectedProduct((prev) =>
                                            prev ? { ...prev, product_name: e.target.value } : prev
                                            )
                                        }
                                        placeholder="New Product Name"
                                        className="w-3/4 px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Quantity:</h1>
                                <p className='text-md text-grey-500'>{selectedProduct?.product_qty}</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input
                                        type="number"
                                        value={selectedProduct?.product_qty ?? ''}
                                        onChange={(e) =>
                                            setSelectedProduct((prev: Product | null) =>
                                            prev ? { ...prev, product_qty: parseInt(e.target.value) || 0 } : prev
                                            )
                                        }
                                        placeholder="New Quantity"
                                        className="w-3/4 px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Price:</h1>
                                <p className='text-md text-grey-500'>₱{selectedProduct?Number(selectedProduct.product_price).toFixed(2) : ''}</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedProduct?.product_price ?? ''}
                                        onChange={(e) =>
                                            setSelectedProduct((prev: Product | null) =>
                                            prev ? { ...prev, product_price: parseFloat(e.target.value) || 0 } : prev
                                            )
                                        }
                                        placeholder="New Price"
                                        className="w-3/4 px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between w-full'>
                            <button onClick={handleDelete} className='bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-red-700 transition-colors duration-200 w-1/6'>
                                    Delete  
                                </button>
                            <div className='flex space-x-2 w-1/2 items-end justify-end'>
                                <button onClick={() => setShowEditPage(false)} className='bg-blue-600  text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-2/6'>
                                    Close
                                </button>    
                                    <button
                                    onClick={handleUpdate}
                                    className='bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-green-700 transition-colors duration-200 w-2/6'
                                    >
                                    Edit
                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditTable && (
                <div className='fixed inset-0 flex items-center bg-black/40 justify-center z-50 backdrop-blur-sm'>
                    <div className='bg-white flex flex-col rounded-xl shadow-lg w-2/5 h-1/2 overflow-auto m-18 p-8 border border-gray-200'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Add Product</h2>
                            </div>
                            <Edit className='w-8 h-8 text-gray-400' />
                        </div>

                        <div className= 'w-full h-3/4 flex flex-col justify-around'>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Name:</h1>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input
                                    type="text"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    placeholder="New Product Name"
                                    className="w-3/4 px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Price:</h1>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input
                                    type="number"
                                    step="0.01"
                                    value={newProductPrice}
                                    onChange={(e) => setNewProductPrice(e.target.value)}
                                    placeholder="New Price"
                                    className="w-3/4 px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={() => setShowEditTable(false)} className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
                                Close
                            </button>

                            <button
                            onClick={handleAddProduct}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6"
                            >
                            Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* sale restock popup */}
            {showQtyPopup && selectedProduct && (
                <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-6 rounded-xl shadow-lg w-96'>
                        <h2 className='text-xl font-bold text-gray-800 mb-4'>
                            {actionType === 'sale' ? 'Record Sale' : 'Restock Product'}
                        </h2>
                        <p className='text-sm mb-2 text-gray-600'>
                            {selectedProduct.product_name} — Current Stock: {selectedProduct.product_qty}
                        </p>
                        <input
                            type='number'
                            className='w-full p-2 border border-gray-300 rounded-md mb-4'
                            placeholder='Enter quantity...'
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                        />
                        <div className='flex justify-between'>
                            <button
                                onClick={() => setShowQtyPopup(false)}
                                className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={actionType === 'sale' ? handleSale : handleRestock}
                                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoricalSummary && (
                <div className='fixed inset-0 flex items-center bg-black/40 justify-center z-50 backdrop-blur-sm'>
                    <div className='bg-white flex flex-col rounded-xl shadow-lg w-1/2 h-3/4 overflow-auto m-18 p-8 border border-gray-200'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Historical Summary</h2>
                                <p className='text-gray-600'>View historical data by week or month </p>
                            </div>
                            <Calendar className='w-8 h-8 text-gray-400' />
                        </div>

                        <div className='space-y-4 h-3/4 overflow-y-auto border border-gray-200 shadow-inner p-4 rounded-lg shaw'>
  
                            {/* Weekly Export Logs */}
                            <table className='min-w-full divide-gray-200'>
                                <thead>
                                <tr className='border-b border-gray-200'>
                                    <th className='text-left py-2 px-4 text-gray-600 font-semibold'>Week</th>
                                    <th className='text-right py-2 px-4 text-gray-600 font-semibold'>Export</th>
                                </tr>
                                </thead>
                                <tbody>
                                {records?.filter(rec => !rec.is_monthly).map((rec) => (
                                    <tr key={rec.record_id}>
                                    <td className='py-2 px-4 font-semibold'>
                                        {new Date(rec.startDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - 
                                        {new Date(rec.endDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className='py-2 px-4 text-right justify-end flex mr-3'>
                                        <a href={`/download/${rec.record_id}`} className='text-gray-400 hover:text-black transition-all'>
                                        <Download className='cursor-pointer' />
                                        </a>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* Monthly Export Logs */}
                            <table className='min-w-full divide-gray-200'>
                                <thead>
                                <tr className='border-b border-gray-200'>
                                    <th className='text-left py-2 px-4 text-gray-600 font-semibold'>Month</th>
                                    <th className='text-right py-2 px-4 text-gray-600 font-semibold'>Export</th>
                                </tr>
                                </thead>
                                <tbody>
                                {records?.filter(rec => rec.is_monthly).map((rec) => (
                                    <tr key={rec.record_id}>
                                    <td className='py-2 px-4 font-semibold'>
                                        {new Date(rec.startDay).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className='py-2 px-4 text-right justify-end flex mr-3'>
                                        <a href={`/download/${rec.record_id}`} className='text-gray-400 hover:text-black transition-all'>
                                        <Download className='cursor-pointer' />
                                        </a>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>

                        <button onClick={() => setShowHistoricalSummary(false)} className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

console.log('Dashboard page loaded');