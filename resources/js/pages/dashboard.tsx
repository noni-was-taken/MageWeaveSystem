import React, {use, useState} from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, ChartBar, Edit, Target, Package, TrendingUp, Clock, ClockAlertIcon, Calendar, CalendarIcon, SquareKanban, MoveRightIcon} from 'lucide-react';


type DashboardProps = {
    products: {
        product_id: number;
        product_name: string;
        product_qty: number;
        product_price: number;
    }[];
    
    updateLogs: {
        update_id: number;
        value_update: number;
        product_id: number;
        description: string;
        update_date: string;
    }[];
};


export default function dashboard() {
    const { products, updateLogs } = usePage<DashboardProps>().props; 
    
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
    const [actionType, setActionType] = useState<'sale' | 'restock' | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<null | {
        product_id: number;
        product_name: string;
        current_qty: number;
    }>(null);
    const [quantityInput, setQuantityInput] = useState('');
    const [showQtyPopup, setShowQtyPopup] = useState(false);

    const handleActionClick = (
        type: 'sale' | 'restock',
        item: { product_id: number; product_name: string; product_qty: number; product_price: number }
    ) => {
        setActionType(type);
        setSelectedProduct({
            product_id: item.product_id,
            product_name: item.product_name,
            current_qty: item.product_qty,
        });
        setShowQtyPopup(true);
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

    const [summaryData] = useState({
        weekRange: 'Week of June 30 - July 6',
        date: 'as of June 30, 2025',
        topSales: [
            { name: 'Item 1', sales: 173 },
            { name: 'Item 5', sales: 156 },
            { name: 'Item 4', sales: 142 }
        ],
        leastSold: [
            { name: 'Item 6', sales: 12 },
            { name: 'Item 2', sales: 28 },
            { name: 'Item 3', sales: 35 }
        ],
        highestSellingItem: {
            name: 'Item 1',
            stocksSold: 173
        },
        totalOrders: {
            ordered: 17,
            shipped: 5,
            totalStocksOrdered: 1390,
            totalStocksSold: 736
        }
    });

    const filteredStock = stockData.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLowStockAlerts = () => {
        const alerts: { message: string; level: string }[] = [];

        stockData.forEach(item => {
            if (item.product_qty <= 0) {
                alerts.push({
                    message: `${item.product_name} is out of stock.`,
                    level: 'critical'
                });
            } else if (item.product_qty < 20) {
                alerts.push({
                    message: `${item.product_name} is critically low on stock.`,
                    level: 'warning'
                });
            } else if (item.product_qty < 50) {
                alerts.push({
                    message: `${item.product_name} is running low on stock.`,
                    level: 'info'
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
                        <h1 className='text-3xl font'>|MageWeave Logo|</h1>
                        <h1 className='text-md '>Cozy Textiles</h1>
                    </div>
                    {/* current date */}
                    <div className='w-1/6 ml-auto h-full flex items-center justify-center '>
                        <div className='text-center'>
                            <h1 className='text-xl text-gray-700 font-semibold'>July 11, 2025</h1>
                            <p className='text-sm text-gray-500'>Friday</p>
                        </div>
                    </div>
                    {/* user profile */}
                    <div className='ml-auto w-2/12 h-full flex justify-center items-center'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold'>
                                A
                            </div>
                            <div>
                                <h1 className='text-lg text-gray-700 font-semibold'>Admin</h1>
                                <p className='text-sm text-gray-500'>user321</p>
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
                            <div onClick={() => setShowEditTable(true)} className='flex items-center space-x-2 bg-white rounded-lg shadow-sm px-3 py-2 border border-gray-200 hover:shadow-md transition-shadow duration-200'>
                                <h1 className='text-md'>Add Item</h1>
                                <Plus className='w-4 h-4 text-gray-500 hover:text-black' />
                            </div>
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
                                        <tr key={item.product_id} className='border-b border-gray-100 hover:bg-gray-50'>
                                            <td className='py-3 px-4'>
                                                <Edit onClick={()=>setShowEditPage(true)} className='w-4 h-4 text-gray-400 hover:text-black' />
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
                                                        className='bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors duration-200'
                                                    >
                                                        Sale
                                                    </button>
                                                    <button
                                                        onClick={() => handleActionClick('restock', item)}
                                                        className='bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200'
                                                    >
                                                        Restock
                                                    </button>
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
                                            <p className='text-sm font-medium text-gray-800'>Form {log.product_id}</p>
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
                                    <ClockAlertIcon className={`w-6 h-6 ${
                                        alert.level === 'critical' ? 'text-red-950' :
                                        alert.level === 'warning' ? 'text-red-500' :
                                        'text-yellow-500'
                                    }`} />
                                    <div>
                                        <p className='text-sm font-medium text-gray-800'>Low Stock Alert</p>
                                        <p className='text-xs text-gray-600'>{alert.message}</p>
                                    </div>
                                </div>
                                <span className='text-sm text-gray-500'>Now</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>    
            {/* Weekly Summary Viewer */}
            {showWeeklySummary && (
                <div className='fixed inset-0 flex items-center bg-black/40 justify-center z-50 backdrop-blur-sm'>
                    <div className='bg-white flex flex-col rounded-xl shadow-lg max-w-full overflow-auto m-18 p-8 border border-gray-200'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800'>Summary</h2>
                                <p className='text-gray-600'>{summaryData.weekRange}</p>
                                <p className='text-sm text-gray-500'>{summaryData.date}</p>
                            </div>
                            <Calendar className='w-8 h-8 text-gray-400' />
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
                                            <span className='text-sm text-gray-700'>• {item.name}</span>
                                            <span className='text-sm font-medium text-gray-800'>{item.sales}</span>
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
                                            <span className='text-sm text-gray-700'>• {item.name}</span>
                                            <span className='text-sm font-medium text-gray-800'>{item.sales}</span>
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
                                        <span className='text-sm text-gray-700'>• {summaryData.totalOrders.ordered} ordered shipments</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-gray-700'>• {summaryData.totalOrders.shipped} ordered shipments</span>
                                    </div>
                                    <div className='text-xs text-gray-600 mt-2'>
                                        <p>{summaryData.totalOrders.totalStocksOrdered} total stocks ordered</p>
                                        <p>{summaryData.totalOrders.totalStocksSold} total stocks sold</p>
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
                                <p className='text-sm text-gray-500'>Product ID</p>
                            </div>
                            <Edit className='w-8 h-8 text-gray-400' />
                        </div>

                        <div className= 'w-full h-3/4 flex flex-col justify-between'>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Name:</h1>
                                <p className='text-md text-grey-500'>Old-Product Name</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input type="text" placeholder='New Product Name' className='w-3/4 px-4 py-2 border border-gray-300 rounded-lg'/>
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Quantity:</h1>
                                <p className='text-md text-grey-500'>618</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input type="text" placeholder='New Quantity' className='w-3/4 px-4 py-2 border border-gray-300 rounded-lg'/>
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Price:</h1>
                                <p className='text-md text-grey-500'>₱13.73</p>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input type="text" placeholder='New Price' className='w-3/4 px-4 py-2 border border-gray-300 rounded-lg'/>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between w-full'>
                            <button className='bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
                                    Delete  
                                </button>
                            <div className='flex space-x-2 w-1/2 items-end justify-end'>
                                <button onClick={() => setShowEditPage(false)} className='bg-blue-600  text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-2/6'>
                                    Close
                                </button>    
                                <button onClick={() => setShowEditPage(false)} className='bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-green-700 transition-colors duration-200 w-2/6'>
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
                                    <input type="text" placeholder='New Product Name' className='w-3/4 px-4 py-2 border border-gray-300 rounded-lg'/>
                                </div>
                            </div>
                            <div className='w-full h-1/4 flex items-center gap-2'>
                                <h1 className='text-lg font-bold text-gray-800 '>Product Price:</h1>
                                <div className='ml-auto w-1/2 flex items-center gap-2 justify-end pr-4'>
                                    <MoveRightIcon className='h-8 w-8'/>
                                    <input type="text" placeholder='New Quantity' className='w-3/4 px-4 py-2 border border-gray-300 rounded-lg'/>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={() => setShowEditTable(false)} className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
                                Close
                            </button>
                            <button onClick={() => setShowEditTable(false)} className='bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer mt-3 hover:bg-blue-700 transition-colors duration-200 w-1/6'>
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
                            {selectedProduct.product_name} — Current Stock: {selectedProduct.current_qty}
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
                                onClick={handleSubmitQty}
                                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

console.log('Dashboard page loaded');