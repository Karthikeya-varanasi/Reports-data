"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Chart from 'chart.js/auto';
import { Select, DatePicker, Space, Button, Drawer, theme } from 'antd';
const { RangePicker } = DatePicker;
import { Flex, Spin } from 'antd';
import React from 'react';
import moment from "moment-timezone";
import dayjs from 'dayjs';
import "../../../../node_modules/bootstrap/dist/css/bootstrap.css";
import "../../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { AgGridReact } from "ag-grid-react";
import "../../../../node_modules/ag-grid-community/styles/ag-grid.css";
import "../../../../node_modules/ag-grid-community/styles/ag-theme-alpine.css";
import Navigation from "../head/navigation/page";
import Tbar from "../head/tbar/page";

export default function Aconsle() {
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const yesterday = dayjs().subtract(2, "days").format("YYYY-MM-DD")
    const defaultDates = [dayjs(yesterday), dayjs(yesterday)]
    const [startDate, setStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);
    const [timezone, setTimezone] = useState("UTC/Timezone")
    const [loading, setLoading] = useState(true);
    const [rawdata, setRawdata] = useState(null);
    const [Table, setTable] = useState(null)
    const [finaldata, setfinaldata] = useState([])
    const [visible, setVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState();
    const [Networks, setNetworks] = useState("FB_Mnet")
    const [Networkstotal, setNetworkstotal] = useState(null)
    const [AccountsTotal, setAccountsTotal] = useState(null)
    const [Mis, setMis] = useState(null)
    const handleChange = (value) => {
        setSelectedValue(value);
        setVisible(false);
    };
    const toggleSelect = () => {
        setVisible(!visible);
    };
    const onNetwork = (value) => {
        setNetworks(value)
    }
    useEffect(() => {
        async function fetchMainData() {
            try {
                setLoading(true);
                const Username = localStorage.getItem("Username");
                const response = await fetch(`/api/consleapi?user=${Username}&start=${startDate}&end=${endDate}&time=${timezone}`);
                const data = await response.json();
                const list = data.userinfo;
                const flattenedUserdata = data.fetchedAccounts.flat().filter(obj => Object.keys(obj).length > 0);
                const misdata = data.misdata.flat().filter(obj => Object.keys(obj).length > 0);
                console.log(misdata, "misdata")
                setMis(misdata)
                setTable(flattenedUserdata)
                const accountKey = Networks;
                const groupedData = {};
                if (accountKey && list.adAccounts[accountKey]) {
                    const buyerAccounts = list.adAccounts[accountKey];

                    for (const [buyerName, accountNumbers] of Object.entries(buyerAccounts)) {
                        const matchingDataForBuyer = flattenedUserdata.filter(user => accountNumbers.includes(user.account_number));
                        if (matchingDataForBuyer.length > 0) {
                            matchingDataForBuyer.forEach(dataEntry => {
                                const dynamicGroupValue = dataEntry.Networkname;
                                if (!groupedData[dynamicGroupValue]) {
                                    groupedData[dynamicGroupValue] = {
                                        accountNumbers: [],
                                        spend: 0,
                                        estimatedRevenue: 0,
                                        profit: 0,
                                        cpl: 0,
                                        cpc: 0,
                                        rpc: 0,
                                    };
                                }
                                groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                                groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                                groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                                groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                                groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
                                groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                                groupedData[dynamicGroupValue].buyername = dataEntry.buyername || groupedData[dynamicGroupValue].buyername;
                                if (!groupedData[dynamicGroupValue].accountNumbers.includes(dataEntry.account_number)) {
                                    groupedData[dynamicGroupValue].accountNumbers.push(dataEntry.account_number);
                                }
                            });
                        }
                    }
                    setNetworkstotal(groupedData);
                }
                flattenedUserdata.forEach(dataEntry => {
                    const dynamicGroupValue = dataEntry.account_number;
                    if (!groupedData[dynamicGroupValue]) {
                        groupedData[dynamicGroupValue] = {
                            accountNumbers: [],
                            spend: 0,
                            estimatedRevenue: 0,
                            profit: 0,
                            cpl: 0,
                            cpc: 0,
                            rpc: 0,
                        };
                    }
                    groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                    groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                    groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                    groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                    groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
                    groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                    groupedData[dynamicGroupValue].buyername = dataEntry.buyername || groupedData[dynamicGroupValue].buyername;
                    if (!groupedData[dynamicGroupValue].accountNumbers.includes(dataEntry.account_number)) {
                        groupedData[dynamicGroupValue].accountNumbers.push(dataEntry.account_number);
                    }
                });
                flattenedUserdata.forEach(dataEntry => {
                    const dynamicGroupValue = dataEntry.buyercode;
                    if (!groupedData[dynamicGroupValue]) {
                        groupedData[dynamicGroupValue] = {
                            accountNumbers: [],
                            spend: 0,
                            estimatedRevenue: 0,
                            profit: 0,
                            cpl: 0,
                            cpc: 0,
                            rpc: 0,
                            buyercode: [],
                            date_start: '',
                        };
                    }
                    groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                    groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                    groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                    groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                    groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
                    groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                    groupedData[dynamicGroupValue].buyername = dataEntry.buyername || groupedData[dynamicGroupValue].buyername;

                    if (!groupedData[dynamicGroupValue].accountNumbers.includes(dataEntry.account_number)) {
                        groupedData[dynamicGroupValue].accountNumbers.push(dataEntry.account_number);
                    }

                    if (!groupedData[dynamicGroupValue].date_start) {
                        groupedData[dynamicGroupValue].date_start = dayjs(dataEntry.date_start).format('YYYY-MM-DD');
                    } else {
                        const currentDate = dayjs(groupedData[dynamicGroupValue].date_start);
                        const newDate = dayjs(dataEntry.date_start);
                        groupedData[dynamicGroupValue].date_start = currentDate.isBefore(newDate)
                            ? newDate.format('YYYY-MM-DD')
                            : currentDate.format('YYYY-MM-DD');
                    }
                });
                setRawdata(groupedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching mainData:", error);
                setLoading(false);
            }
        }

        fetchMainData();
    }, [startDate, endDate, timezone]);


    useEffect(() => {
        async function fetchMainData() {
            try {
                if (!Table || Table.length === 0) {
                    console.log('Table is empty or undefined');
                    return;
                }

                const groupedData = Table.reduce((acc, item) => {
                    const accNumber = item.buyercode;
                    acc[accNumber] = acc[accNumber] || [];
                    acc[accNumber].push(item);
                    return acc;
                }, {});

                const top5ProfitData = Object.values(groupedData).flatMap(group => {
                    const positiveProfitGroup = group.filter(item => item.profit < 0);
                    const sortedGroup = positiveProfitGroup.sort((a, b) => b.profit - a.profit);
                    return sortedGroup.slice(0, 7);
                });

                setfinaldata(top5ProfitData);
            } catch (error) {
                console.error('Error fetching mainData:', error);
            }
        }

        fetchMainData();
    }, [Table]);



    const spender = (params) => {
        var total = 0;
        params.values.forEach((value) => (total += parseFloat(value)));
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
            var total22 = total2[1].slice(0, 2)
            var totalone = total2[0] + '.' + total22
            return parseFloat(totalone).toFixed(2)
        }
        return total;
    };


    const getprofit = (params) => {
        let margin = 0;

        if (params.data !== undefined) {
            const { estimatedRevenue, spend } = params.data;
            margin = (estimatedRevenue - spend);
        } else if (params.node.aggData !== undefined) {
            const { estimatedRevenue, spend } = params.node.aggData;
            margin = (estimatedRevenue - spend);

        }

        if (!isFinite(margin)) {
            return "0%";
        }
        return Number(margin.toFixed(3)) + "%";
    };

    const getMargin = (params) => {
        let margin = 0;

        if (params.data !== undefined) {
            const { estimatedRevenue, spend } = params.data;
            margin = ((estimatedRevenue - spend) / spend) * 100;
        } else if (params.node.aggData !== undefined) {
            const { estimatedRevenue, spend } = params.node.aggData;
            margin = ((estimatedRevenue - spend) / spend) * 100;
        }

        if (!isFinite(margin)) {
            return "0%";
        }

        return Number(margin.toFixed(3)) + "%";
    };



    const columnDefs = useMemo(() => {

        return [
            {
                headerName: "Adset Name",
                field: "adset_name",
            },
            {
                field: "spend",
                resizable: true,
                sortable: true,
                headerName: "Spends",
                aggFunc: spender,
                width: 100,
                lockPinned: true,
            },
            {
                field: "estimatedRevenue",
                aggFunc: spender,
                headerName: "EstimatedRevenue",
                width: 100,
                lockPinned: true,
            },
            {
                field: "profit",
                aggFunc: spender,
                headerName: "Profit",
                width: 100,
                lockPinned: true,
                cellClassRules: {
                    "negative-value": (params) => {
                        const profit = parseFloat(params.value);
                        return profit < 0;
                    },
                },
            },
            {
                field: "margin",
                headerName: "Margin",
                valueGetter: getMargin,
                width: 100,
                lockPinned: true,
                comparator: (a, b, isDescending) => {
                    const aString = typeof a === 'string' ? a : '';
                    const bString = typeof b === 'string' ? b : '';
                    const a_ = parseFloat(aString.replace("%", ""));
                    const b_ = parseFloat(bString.replace("%", ""));

                    if (!isNaN(a_) && !isNaN(b_)) {
                        if (isDescending) {
                            return b_ - a_;
                        } else {
                            return a_ - b_;
                        }
                    } else {
                        return 0;
                    }
                },
            },
            {
                headerName: "Clicks", field: "clicks_f", aggFunc: spender,
                width: 100,
            },
            { headerName: "Cpc", field: "cpc_f", aggFunc: spender, width: 100, },
            {
                field: "impressions_f",
                aggFunc: spender,
                headerName: "Impression_F",
                width: 100,
                lockPinned: true,
            },
            {
                field: "impressions_m",
                aggFunc: spender,
                headerName: "Impression_N",
                width: 100,
                lockPinned: true,
            },
            {
                field: "conversions",
                aggFunc: spender,
                headerName: "Conversions",
                width: 100,
                lockPinned: true,
            },
            {
                field: "cpl",
                aggFunc: spender,
                headerName: "Cpl",
                width: 100,
                lockPinned: true,
            },
            {
                field: "cpc",
                aggFunc: spender,
                headerName: "Cpc",
                width: 100,
                lockPinned: true,
            },
            {
                field: "rpc",
                aggFunc: spender,
                headerName: "Rpc",
                width: 100,
                lockPinned: true,
            },
            {
                field: "mCpl",
                aggFunc: spender,
                headerName: "Mcpl",
                width: 100,
                lockPinned: true,
            },
            {
                field: "pCtr",
                aggFunc: spender,
                headerName: "Pctr",
                width: 100,
                lockPinned: true,
            },
            {
                field: "leads",
                aggFunc: spender,
                headerName: "Leads",
                width: 100,
                lockPinned: true,
            },
        ];
    }, []);


    const columnmisDefs = useMemo(() => {

        return [
            {
                headerName: "Miscellaneous",
                field: "acc_number",
            },
            {
                headerName: "Network Name",
                field: "network",
            },
            {
                field: "spend",
                resizable: true,
                sortable: true,
                headerName: "Spends",
                aggFunc: spender,
                width: 100,
                lockPinned: true,
            },
            {
                field: "estimated_revenue",
                aggFunc: spender,
                headerName: "Revenue",
                width: 100,
                lockPinned: true,
            },
            {
                field: "profit",
                aggFunc: spender,
                valueGetter: getprofit,
                headerName: "Profit",
                width: 100,
                lockPinned: true,
                cellClassRules: {
                    "negative-value": (params) => {
                        const profit = parseFloat(params.value);
                        return profit < 0;
                    },
                },
            },
        ];
    }, []);
    const areaChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const rowData = rawdata ? Object.entries(rawdata).map(([name, data]) => ({
        spend: parseFloat(data.spend),
        estimatedRevenue: parseFloat(data.estimatedRevenue),
        cpl: data.cpl,
        cpc: data.cpc,
        rpc: data.rpc,
        date: data.date_start
    })) : [];
    const newData = rowData.map((element) => ({
        ...element,
        spend: element.spend,
        estimatedRevenue: element.estimatedRevenue,
    }));

    const totalSpend = newData.reduce((total, element) => total + element.spend, 0);
    const totalRevenue = newData.reduce((total, element) => total + element.estimatedRevenue, 0);

    const labels = newData.map((element) => element.date);
    const spendData = newData.map((element) => element.spend);
    const revenueData = newData.map((element) => element.estimatedRevenue);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Spend",
                backgroundColor: "rgba(54, 162, 235, 1)",
                borderColor: "rgba(54, 162, 235, 1)",
                data: spendData,
            },
            {
                label: "Estimated Revenue",
                backgroundColor: "rgba(255, 99, 132, 1)",
                borderColor: "rgba(255, 99, 132, 1)",
                data: revenueData,
            },
        ],
    };
    useEffect(() => {
        if (areaChartRef.current) areaChartRef.current.destroy();
        if (pieChartRef.current) pieChartRef.current.destroy();
        const ctx = document.getElementById('myAreaChart').getContext('2d');
        areaChartRef.current = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { beginAtZero: true } }
                },
            },
        });
        const pieCtx = document.getElementById('myPieChart').getContext('2d');
        pieChartRef.current = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ["Spend", "Revenue"],
                datasets: [{
                    data: [totalSpend, totalRevenue],
                    backgroundColor: ['#ff6384', '#4e73df'],
                    hoverBackgroundColor: ['#ff4070', '#2e59d9'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom' } },
            },
        });
    }, [labels, spendData, revenueData, totalSpend, totalRevenue]);

    console.log(document.title);
    const onRangeChange = (dates) => {
        setStartDate(dates[0]?.format('YYYY-MM-DD'));
        setEndDate(dates[1]?.format('YYYY-MM-DD'));
    };

    const onChange = (value) => setTimezone(value);
    const toggleSidebar = () => setSidebarToggled(!sidebarToggled);
    const rangePresets = [
        { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
        { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
        { label: 'Last 60 Days', value: [dayjs().subtract(60, 'day'), dayjs()] },
    ];

    const networkEntries = Networkstotal ? Object.entries(Networkstotal) : [];
    const firstNetwork = networkEntries.length > 0 ? networkEntries[0] : null;
    return (
        <>
            <Navigation toggleSidebar={toggleSidebar} sidebarToggled={sidebarToggled} />
            <div className="content-holder">

                <div className="topbar">
                    <Tbar toggleSidebar={toggleSidebar} />
                </div>
                <div className="container-fluid">
                    <div className="d-md-flex d-sm-grid  justify-content-between align-items-center mb-4">
                        <h1 style={{ color: "mediumseagreen" }}>Hi, Welcome To D!NJiT</h1>
                        <div className="filter-site">
                            <Select
                                showSearch
                                placeholder="Select a Timezone"
                                defaultValue={Networks}
                                onChange={onNetwork}
                                options={[
                                    { value: 'FB_Mnet', label: 'Media.Net' },
                                    // { value: 'FB_Tonic', label: 'Tonic.Net' },
                                ]}
                            />
                            <Select
                                showSearch
                                placeholder="Select a Timezone"
                                defaultValue={timezone}
                                onChange={onChange}
                                options={[
                                    { value: 'UTC/Timezone', label: 'UTC/Timezone' },
                                    { value: 'PDT/Timezone', label: 'PDT/Timezone' },
                                    { value: 'EDT/Timezone', label: 'EDT/Timezone' },
                                    { value: 'EEST/Timezone', label: 'EEST/Timezone' },
                                    { value: 'HST/Timezone', label: 'HST/Timezone' },
                                    { value: 'IST/Timezone', label: 'IST/Timezone' },
                                    { value: 'BST/Timezone', label: 'BST/Timezone' },
                                    { value: 'AST/Timezone', label: 'AST/Timezone' },
                                    { value: 'CST/Timezone', label: 'CST/Timezone' },
                                    { value: 'MST/Timezone', label: 'MST/Timezone' },
                                    { value: 'GMT/Timezone', label: 'GMT/Timezone' },
                                ]}
                            />
                            <Space direction="vertical" size={12}>
                                <RangePicker
                                    presets={rangePresets}
                                    onChange={onRangeChange}
                                    defaultValue={defaultDates}
                                    format="YYYY-MM-DD"
                                />
                            </Space>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Spends (Monthly)
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                {firstNetwork ? (
                                                    <>
                                                        <span>{`${firstNetwork[0]}: `}</span>
                                                        <span>{`$${firstNetwork[1].spend ? firstNetwork[1].spend.toFixed(2) : 'N/A'}`}</span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-auto" onClick={toggleSelect}>
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                        {visible && (
                                            <div style={{ marginTop: '10px' }}>
                                                <Select
                                                    value={selectedValue}
                                                    style={{ width: 200 }}
                                                    onChange={handleChange}
                                                    options={networkEntries.map(([networkName, data]) => ({
                                                        label: `${networkName}: $${data.spend ? data.spend.toFixed(2) : 'N/A'}`,
                                                        value: networkName,
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Revenue (Monthly)
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                {firstNetwork ? (
                                                    <>
                                                        <span>{`${firstNetwork[0]}: `}</span>
                                                        <span>{`$${firstNetwork[1].estimatedRevenue ? firstNetwork[1].estimatedRevenue.toFixed(2) : 'N/A'}`}</span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-auto" onClick={toggleSelect}>
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                        {visible && (
                                            <div style={{ marginTop: '10px' }}>
                                                <Select
                                                    value={selectedValue}
                                                    style={{ width: 200 }}
                                                    onChange={handleChange}
                                                    options={networkEntries.map(([networkName, data]) => ({
                                                        label: `${networkName}: $${data.estimatedRevenue ? data.estimatedRevenue.toFixed(2) : 'N/A'}`,
                                                        value: networkName,
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Profit (Monthly)
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                {firstNetwork ? (
                                                    <>
                                                        <span>{`${firstNetwork[0]}: `}</span>
                                                        <span>{`$${firstNetwork[1].profit ? firstNetwork[1].profit.toFixed(2) : 'N/A'}`}</span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-auto" onClick={toggleSelect}>
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                        {visible && (
                                            <div style={{ marginTop: '10px' }}>
                                                <Select
                                                    value={selectedValue}
                                                    style={{ width: 200 }}
                                                    onChange={handleChange}
                                                    options={networkEntries.map(([networkName, data]) => ({
                                                        label: `${networkName}: $${data.profit ? data.profit.toFixed(2) : 'N/A'}`,
                                                        value: networkName,
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-primary shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Rpc (Monthly)
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                {firstNetwork ? (
                                                    <>
                                                        <span>{`${firstNetwork[0]}: `}</span>
                                                        <span>{`$${firstNetwork[1].rpc ? firstNetwork[1].rpc.toFixed(2) : 'N/A'}`}</span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-auto" onClick={toggleSelect}>
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                        {visible && (
                                            <div style={{ marginTop: '10px' }}>
                                                <Select
                                                    value={selectedValue}
                                                    style={{ width: 200 }}
                                                    onChange={handleChange}
                                                    options={networkEntries.map(([networkName, data]) => ({
                                                        label: `${networkName}: $${data.profit ? data.profit.toFixed(2) : 'N/A'}`,
                                                        value: networkName,
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row d-flex">
                        <div className="col-xl-8 col-lg-7 d-flex align-items-stretch">
                            <div className="card shadow mb-4 w-100">
                                <div className="card-header py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Earnings Overview</h6>
                                </div>
                                <div className="card-body">
                                    <canvas id="myAreaChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-lg-5 d-flex align-items-stretch">
                            <div className="card shadow mb-4 w-100">
                                <div className="card-header py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Revenue Sources</h6>
                                </div>
                                <div className="card-body">
                                    <canvas id="myPieChart"></canvas>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <div className="ag-theme-alpine" style={{ height: 150, width: "100%" }}>
                            <AgGridReact rowData={Mis} columnDefs={columnmisDefs} />
                        </div>
                    <div className="ag-theme-alpine mt-1" style={{ height: 300, width: "100%" }}>
                        <AgGridReact rowData={finaldata} columnDefs={columnDefs} />
                    </div>
                </div>
            </div>
        </>
    );

}
