
"use client";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useEffect } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Select, DatePicker, Space, Button, Drawer, theme } from 'antd';
const { RangePicker } = DatePicker;
import { Flex, Spin } from 'antd';
import React from 'react';
import dayjs from 'dayjs';
import Navigation from "../components/head/navigation/page";
import Tbar from "../components/head/tbar/page";
import Mbuyna from "../components/summarycom/mbsummary/page";
const { Option } = Select;
export default function Remain() {
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);
    const [activeGrid, setActiveGrid] = useState('revenue');
    const [revenuedata, setRevenuedata] = useState(null);
    const [rawdata, setRawdata] = useState(null);
    const yesterday = dayjs().subtract(1, "days").format("YYYY-MM-DD")
    const defaultDates = [dayjs(yesterday), dayjs(yesterday)]
    const [startDate, setStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);
    const [timezone, setTimezone] = useState("UTC/Timezone")
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [platdata, setPlatdata] = useState(null);
    const [pinnedColumns, setPinnedColumns] = useState(true);
    const [Mediabuyer, setMediabuyer] = useState(null);
    const [dailydata, setdailydata] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dynamic, setDynamic] = useState(null);
    const [isNetworkView, setIsNetworkView] = useState(false);
    const [networkName, setNetworkName] = useState('');
    const loadGridData = (type) => {
        setActiveGrid(type);
    };
    const getProfit = (params) => {
        if (params.data !== undefined) {
            const { estimatedRevenue, spend } = params.data;
            if (spend !== 0) {
                const Profit = estimatedRevenue - spend;
                return Number(Profit.toFixed(2));
            }
        }
        if (params.node.aggData !== undefined) {
            const { estimatedRevenue, spend } = params.node.aggData;
            if (spend !== 0) {
                const Profit = estimatedRevenue - spend;
                return Number(Profit.toFixed(2));
            }
        }
        return 0;
    };

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();
        async function fetchMainData() {
            if (!activeGrid) {
                console.error('No active grid defined!');
                return;
            }
            try {
                const Username = localStorage.getItem("Username");
                if (!Username) {
                    console.error('No Username found in localStorage');
                    return;
                }
                setIsLoading(true);
                const response = await fetch(`/api/summaryapi?employName=${Username}&start=${startDate}&end=${endDate}&time=${timezone}&button=${activeGrid}`, {
                    signal: abortController.signal
                });
                const data = await response.json();
                if (isMounted) {
                    setRawdata(data.userData);
                    const flattenedUserdata = data.fetchedAccounts.flat().filter(obj => Object.keys(obj).length > 0);
                    let groupedData = {};
                    if (activeGrid === 'revenue') {
                        groupedData = processGridData(flattenedUserdata, 'Networkname');
                        setRevenuedata(Object.values(groupedData));
                    } else if (activeGrid === 'platform') {
                        groupedData = processGridData(flattenedUserdata, 'platform');
                        setPlatdata(Object.values(groupedData));
                    } else if (activeGrid === 'daily') {
                        groupedData = processGridData(flattenedUserdata, 'date_start');
                        setdailydata(Object.values(groupedData));
                    } else {
                        console.warn(`Unknown activeGrid value: ${activeGrid}`);
                    }

                    setIsLoading(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching mainData:', error);
                }
                setIsLoading(false);
            }
        }

        fetchMainData();
        return () => {
            isMounted = false;
            abortController.abort();
        };

    }, [activeGrid, startDate, endDate, timezone]);
    const processGridData = (data, key) => {
        return data.reduce((acc, obj) => {
            const gridKey = obj[key];
            if (!acc[gridKey]) {
                acc[gridKey] = {
                    spend: 0,
                    [key]: gridKey,
                    adset_name: obj.adset_name,
                    estimatedRevenue: 0,
                    clicks_f: 0,
                    cpc_f: 0,
                    impressions_f: 0,
                    impressions_m: 0,
                    conversions: 0,
                    cpl: 0,
                    cpc: 0,
                    rpc: 0,
                    mCpl: 0,
                    pCtr: 0,
                    profit: 0,
                    leads: 0,
                    cron_updated: ''
                };
            }
            acc[gridKey].spend += parseFloat(obj.spend || 0);
            acc[gridKey].clicks_f += parseFloat(obj.clicks_f || 0);
            acc[gridKey].cpc_f += parseFloat(obj.cpc_f || 0);
            acc[gridKey].impressions_f += parseFloat(obj.impressions_f || 0);
            acc[gridKey].impressions_m += parseFloat(obj.impressions_m || 0);
            acc[gridKey].estimatedRevenue += parseFloat(obj.estimatedRevenue || 0);
            acc[gridKey].conversions += parseFloat(obj.conversions || 0);
            acc[gridKey].cpl += parseFloat(obj.cpl || 0);
            acc[gridKey].cpc += parseFloat(obj.cpc || 0);
            acc[gridKey].rpc += parseFloat(obj.rpc || 0);
            acc[gridKey].mCpl += parseFloat(obj.mCpl || 0);
            acc[gridKey].pCtr += parseFloat(obj.pCtr || 0);
            acc[gridKey].profit += parseFloat(obj.profit || 0);
            acc[gridKey].leads += parseFloat(obj.leads || 0);
            acc[gridKey].cron_updated = obj.cron_updated;

            return acc;
        }, {});
    };
    const showDrawer = (data) => {
        setDynamic({
            startDate: startDate,
            endDate: endDate,
            timezone: timezone,
            data,
        });
        setNetworkName(data.Networkname);
        setIsNetworkView(true);
        setDrawerVisible(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const onChange = (value) => {
        setTimezone(value)
    };
    const onSearch = (value) => {
        console.log('search:', value);
    };
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


    const columnMap = {
        revenue: {
            field: 'Networkname',
            headerName: 'Network Name',

        },
        platform: {
            field: 'platform',
            headerName: 'Platform',
        },
        daily: {
            field: 'date_start',
            headerName: 'Date',
        }
    };

    const columnDefs = useMemo(() => {
        const { field, headerName } = columnMap[activeGrid] || {};

        if (!field || !headerName) {
            console.warn(`No field or headerName found for activeGrid: ${activeGrid}`);
            return [];
        }
        return [
            {
                field: field,
                resizable: true,
                sortable: true,
                headerName: headerName,
                lockPinned: true,
                pinnable: true,
                pinned: "left",
                cellRenderer: (params) => {
                    if (params.node.rowPinned) {
                        return 'Total';
                    }
                    const handleClick = () => {
                        if (activeGrid === "revenue") {
                            showDrawer(params.data);
                        }
                    };
                    return (
                        <div
                            style={{ display: 'flex', alignItems: 'center', cursor: activeGrid === "revenue" ? 'pointer' : 'default', fontWeight: 600, }}
                            onClick={handleClick}
                        >
                            <span>{params.value}</span>
                        </div>
                    );
                },
            },
            {
                field: "spend",
                resizable: true,
                sortable: true,
                headerName: "Spends",
                aggFunc: spender,

                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "estimatedRevenue",
                aggFunc: spender,
                headerName: "EstimatedRevenue",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "profit",
                aggFunc: spender,
                headerName: "Profit",
                valueGetter: getProfit,
                width: 200,
                lockPinned: true,
                cellClassRules: {
                    // Apply 'negative-value' class if profit is less than 0 (for red)
                    "negative-value": (params) => {
                        const profit = parseFloat(params.value);
                        return profit < 0;
                    },
                    // Apply 'positive-value' class if profit is greater than or equal to 0 (for green)
                    "positive-value": (params) => {
                        const profit = parseFloat(params.value);
                        return profit >= 0;
                    },
                },
                pinnable: true,
            },
            {
                field: "margin",
                headerName: "Margin",
                valueGetter: getMargin,
                width: 200,
                lockPinned: true,
                pinnable: true,
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
                width: 200,
                pinnable: true,
            },
            {
                field: "impressions_f",
                aggFunc: spender,
                headerName: "Impression_F",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "leads",
                aggFunc: spender,
                headerName: "Leads",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "impressions_m",
                aggFunc: spender,
                headerName: "Impression_N",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "conversions",
                aggFunc: spender,
                headerName: "Conversions",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "cpl",
                aggFunc: spender,
                headerName: "Cpl",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "cpc",
                aggFunc: spender,
                headerName: "Cpc",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "rpc",
                aggFunc: spender,
                headerName: "Rpc",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "mCpl",
                aggFunc: spender,
                headerName: "Mcpl",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
            {
                field: "pCtr",
                aggFunc: spender,
                headerName: "Pctr",
                width: 200,
                lockPinned: true,
                pinnable: true,
            },
        ];
    }, [activeGrid, startDate, endDate, timezone]);
    const toggleSidebar = () => {
        setSidebarToggled(!sidebarToggled);
    };
    const rangePresets = [
        { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
        { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
        { label: 'Last 60 Days', value: [dayjs().subtract(60, 'day'), dayjs()] },
    ];
    const onRangeChange = (dates) => {
        setStartDate(dates[0]?.format('YYYY-MM-DD'))
        setEndDate(dates[1]?.format('YYYY-MM-DD'))
    };
    const [selectedNetwork, setSelectedNetwork] = useState("Media.Net");
    const [cronUpdate, setCronUpdate] = useState('');
    const handleChange = (value) => {
        setSelectedNetwork(value);
        const networkData = userdata.find(user => user.Networkname === value);
        setCronUpdate(networkData ? networkData.cron_updated : '');
    };
    return (
        <>
            <Navigation toggleSidebar={toggleSidebar} sidebarToggled={sidebarToggled} />
            <div className="content-holder">

                <div className="topbar">
                    <Tbar toggleSidebar={toggleSidebar} />
                </div>
                <div className="container-fluid">
                    <div style={{padding: "30px 0px 0px 0px"}}>
                        <Drawer
                            title={
                                isNetworkView && (
                                    <div
                                        onClick={() => {
                                            setDrawerVisible(false);
                                            setIsNetworkView(false);
                                        }}
                                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                    >
                                        {networkName}
                                    </div>
                                ) || 'Reports Page'
                            }
                            placement="right"
                            closable={true}
                            onClose={() => {
                                setDrawerVisible(false);
                                setIsNetworkView(false);
                            }}
                            visible={drawerVisible}
                            zIndex={77777}
                            width={1200}
                        >
                            <Mbuyna SendAcc={dynamic} />
                        </Drawer>
                        <Select
                            showSearch
                            placeholder="Select a person"
                            optionFilterProp="label"
                            style={{ marginRight: "10px" }}
                            defaultValue={'UTC/Timezone'}
                            onChange={onChange}
                            onSearch={onSearch}
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
                                style={{ marginRight: "10px" }}
                            />
                        </Space>
                        <Space>
                        </Space>
                        <div className="menuhadler">
                        <div style={{ marginTop: "10px", marginBottom: "10px", width: "100%" }}>
                            <Button
                                onClick={() => loadGridData('revenue')}
                                style={{
                                    marginRight: "10px",
                                    backgroundColor: activeGrid === 'revenue' ? 'blue' : '',
                                    color: activeGrid === 'revenue' ? 'white' : 'black',
                                }}
                            >
                                Revenue Partner
                            </Button>

                            <Button
                                onClick={() => loadGridData('platform')}
                                style={{
                                    marginRight: "10px",
                                    backgroundColor: activeGrid === 'platform' ? 'blue' : '',
                                    color: activeGrid === 'platform' ? 'white' : 'black',
                                }}
                            >
                                Platform
                            </Button>

                            <Button
                                onClick={() => loadGridData('media')}
                                style={{
                                    marginRight: "10px",
                                    backgroundColor: activeGrid === 'media' ? 'blue' : '',
                                    color: activeGrid === 'media' ? 'white' : 'black',
                                }}
                            >
                                Media Buyer
                            </Button>

                            <Button
                                onClick={() => loadGridData('daily')}
                                style={{
                                    backgroundColor: activeGrid === 'daily' ? 'blue' : '',
                                    color: activeGrid === 'daily' ? 'white' : 'black',
                                }}
                            >
                                Daily
                            </Button>
                            
                            <Space>
                                {cronUpdate && <p>Cron Update: {cronUpdate}</p>}
                            </Space>

                        </div>
                        <div>
                        <Space>
                                {activeGrid === "revenue" && (
                                    <div>
                                        <Select
                                            value={selectedNetwork}
                                            onChange={handleChange}
                                            style={{ width: 200,}}
                                            placeholder="--Select an Account--"
                                        >
                                            {revenuedata && revenuedata.length > 0 ? (
                                                revenuedata.map(user => (
                                                    <Option key={user.Networkname} value={user.Networkname}>
                                                        {user.Networkname}
                                                    </Option>
                                                ))
                                            ) : (
                                                <Option disabled>No accounts available</Option>
                                            )}
                                        </Select>
                                    </div>
                                )}
                            </Space>
                        </div>
                        </div>
                        <div className="ag-theme-alpine" >
                            {activeGrid === 'revenue' && (
                                <>
                                    {isLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={isLoading} size="large" />
                                        </div>
                                    ) : (
                                        (!revenuedata || revenuedata.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No Live data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: "70vh", width: '100%' }}>
                                                <AgGridReact
                                                    rowData={revenuedata}
                                                    columnDefs={columnDefs}
                                                    animateRows={true}
                                                    pinnedBottomRowData={[
                                                        {
                                                            Networkname: "Total",
                                                            mCpl: revenuedata.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                                            pCtr: revenuedata.reduce((sum, row) => sum + (row.pCtr || 0), 0),
                                                            spend: revenuedata.reduce((sum, row) => sum + (row.spend || 0), 0),
                                                            estimatedRevenue: revenuedata.reduce((sum, row) => sum + (row.estimatedRevenue || 0), 0),
                                                            profit: revenuedata.reduce((sum, row) => sum + (row.profit || 0), 0),
                                                            margin: revenuedata.reduce((sum, row) => sum + (row.margin || 0), 0),
                                                            clicks_f: revenuedata.reduce((sum, row) => sum + (row.clicks_f || 0), 0),
                                                            impressions_f: revenuedata.reduce((sum, row) => sum + (row.impressions_f || 0), 0),
                                                            impressions_m: revenuedata.reduce((sum, row) => sum + (row.impressions_m || 0), 0),
                                                            leads: revenuedata.reduce((sum, row) => sum + (row.leads || 0), 0),
                                                            cpl: revenuedata.reduce((sum, row) => sum + (row.cpl || 0), 0),
                                                            conversions: revenuedata.reduce((sum, row) => sum + (row.conversions || 0), 0),
                                                            cpc: revenuedata.reduce((sum, row) => sum + (row.cpc || 0), 0),
                                                            rpc: revenuedata.reduce((sum, row) => sum + (row.rpc || 0), 0),

                                                        }
                                                    ]}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}

                            {activeGrid === 'platform' && (
                                <>
                                    {isLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={isLoading} size="large" />
                                        </div>
                                    ) : (
                                        (!platdata || platdata.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No PLatform data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: "70vh", width: '100%' }}>
                                                <AgGridReact
                                                    rowData={platdata}
                                                    columnDefs={columnDefs}
                                                    pinnedBottomRowData={[
                                                        {
                                                            platform: "Total",
                                                            mCpl: platdata.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                                            pCtr: platdata.reduce((sum, row) => sum + (row.pCtr || 0), 0),
                                                            spend: platdata.reduce((sum, row) => sum + (row.spend || 0), 0),
                                                            estimatedRevenue: platdata.reduce((sum, row) => sum + (row.estimatedRevenue || 0), 0),
                                                            profit: platdata.reduce((sum, row) => sum + (row.profit || 0), 0),
                                                            margin: platdata.reduce((sum, row) => sum + (row.margin || 0), 0),
                                                            clicks_f: platdata.reduce((sum, row) => sum + (row.clicks_f || 0), 0),
                                                            impressions_f: platdata.reduce((sum, row) => sum + (row.impressions_f || 0), 0),
                                                            impressions_m: platdata.reduce((sum, row) => sum + (row.impressions_m || 0), 0),
                                                            leads: platdata.reduce((sum, row) => sum + (row.leads || 0), 0),
                                                            cpl: platdata.reduce((sum, row) => sum + (row.cpl || 0), 0),
                                                            conversions: platdata.reduce((sum, row) => sum + (row.conversions || 0), 0),
                                                            cpc: platdata.reduce((sum, row) => sum + (row.cpc || 0), 0),
                                                            rpc: platdata.reduce((sum, row) => sum + (row.rpc || 0), 0),
                                                        }
                                                    ]}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                            {activeGrid === 'media' && (
                                <>
                                    {isLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={isLoading} size="large" />
                                        </div>
                                    ) : (
                                        (!Mediabuyer || Mediabuyer.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No Mediabuyers data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: "70vh", width: '100%' }}>
                                                <AgGridReact
                                                    rowData={Mediabuyer}
                                                    columnDefs={columnDefs}
                                                    groupIncludeTotalFooter={true}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                            {activeGrid === 'daily' && (
                                <>
                                    {isLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={isLoading} size="large" />
                                        </div>
                                    ) : (
                                        (!dailydata || dailydata.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No Daily data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: "70vh", width: '100%' }}>
                                                <AgGridReact
                                                    rowData={dailydata}
                                                    columnDefs={columnDefs}
                                                    pinnedBottomRowData={[
                                                        {
                                                            date_start: "Total",
                                                            mCpl: dailydata.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                                            pCtr: dailydata.reduce((sum, row) => sum + (row.pCtr || 0), 0),
                                                            spend: dailydata.reduce((sum, row) => sum + (row.spend || 0), 0),
                                                            estimatedRevenue: dailydata.reduce((sum, row) => sum + (row.estimatedRevenue || 0), 0),
                                                            profit: dailydata.reduce((sum, row) => sum + (row.profit || 0), 0),
                                                            margin: dailydata.reduce((sum, row) => sum + (row.margin || 0), 0),
                                                            clicks_f: dailydata.reduce((sum, row) => sum + (row.clicks_f || 0), 0),
                                                            impressions_f: dailydata.reduce((sum, row) => sum + (row.impressions_f || 0), 0),
                                                            impressions_m: dailydata.reduce((sum, row) => sum + (row.impressions_m || 0), 0),
                                                            leads: dailydata.reduce((sum, row) => sum + (row.leads || 0), 0),
                                                            cpl: dailydata.reduce((sum, row) => sum + (row.cpl || 0), 0),
                                                            conversions: dailydata.reduce((sum, row) => sum + (row.conversions || 0), 0),
                                                            cpc: dailydata.reduce((sum, row) => sum + (row.cpc || 0), 0),
                                                            rpc: dailydata.reduce((sum, row) => sum + (row.rpc || 0), 0),

                                                        }
                                                    ]}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
