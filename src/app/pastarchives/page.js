"use client";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useEffect, Suspense } from "react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Select, DatePicker, Space, Button } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    LineChart
} from "recharts";
import { useSearchParams } from 'next/navigation';
import { Flex, Spin } from 'antd';
import Navigation from "../components/head/navigation/page";
import Tbar from "../components/head/tbar/page";
export default function Past() {
    const searchParams = useSearchParams();
    const accountKey = searchParams.get('accountKey');
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    const time = searchParams.get('timezone');
    const names = searchParams.get('names');
    const option = searchParams.get('option');
    const [loading, setLoading] = useState(true);
    const [timezone, setTimezone] = useState(time || "UTC/Timezone")
    const [selectedOption, setSelectedOption] = useState("");
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const [activeGrid, setActiveGrid] = useState('hourly');
    const yesterday = dayjs().subtract(1, "days").format("YYYY-MM-DD")
    // const defaultDates = [dayjs(start), dayjs(end)]
    const [startDate, setStartDate] = useState(start || yesterday);
    const [endDate, setEndDate] = useState(end || yesterday);
    const [defaultDates, setDefaultDates] = useState(null)
    const loadGridData = (type) => {
        setActiveGrid(type);
    };

    useEffect(() => {
        if (activeGrid === "hourly") {
            setSelectedOption("hour_m");
            setDefaultDates([dayjs(start), dayjs(end)]);
        } else if (activeGrid === "daily") {
            setSelectedOption("date_start");
            setDefaultDates([]);
        }
    }, [activeGrid]);
    const toggleSidebar = () => {
        setSidebarToggled(!sidebarToggled);
    };
    const [group, setGroup] = useState(null);
    useEffect(() => {
        async function fetchMainData() {
            try {
                const Username = localStorage.getItem("Username");
                setLoading(true);
                let response = await fetch(`/api/summaryapi?employName=${Username}&start=${startDate}&end=${endDate}&time=${timezone}&accountKey=${accountKey}&names=${names}&option=${option}&activeGrid=${activeGrid}`);
                const data = await response.json();
                const rawdata = data.fetchedAccounts;
                const groupedData = {};
                rawdata.forEach(dataEntry => {
                    const dynamicGroupValue = dataEntry[selectedOption];
                    if (!groupedData[dynamicGroupValue]) {
                        groupedData[dynamicGroupValue] = {
                            spend: 0,
                            estimatedRevenue: 0,
                            clicks_f: 0,
                            cpc_f: 0,
                            impressions_f: 0,
                            impressions_m: 0,
                            conversions: 0,
                            // date_start: 0,
                            // hour_m: 0,
                            cpl: 0,
                            cpc: 0,
                            rpc: 0,
                            mCpl: 0,
                            pCtr: 0,
                            profit: 0,
                            leads: 0,
                            accountNumbers: [],
                            buyername: dataEntry.buyername || '',
                        };
                    }
                    groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                    groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                    groupedData[dynamicGroupValue].clicks_f += parseFloat(dataEntry.clicks_f || 0);
                    groupedData[dynamicGroupValue].impressions_f += parseFloat(dataEntry.impressions_f || 0);
                    groupedData[dynamicGroupValue].impressions_m += parseFloat(dataEntry.impressions_m || 0);
                    groupedData[dynamicGroupValue].conversions += parseFloat(dataEntry.conversions || 0);
                    // groupedData[dynamicGroupValue].date_start += parseFloat(dataEntry.date_start || 0);
                    groupedData[dynamicGroupValue].cpc_f += parseFloat(dataEntry.cpc_f || 0);
                    // groupedData[dynamicGroupValue].hour_m += parseFloat(dataEntry.hour_m || 0);
                    groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                    groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                    groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
                    groupedData[dynamicGroupValue].mCpl += parseFloat(dataEntry.mCpl || 0);
                    groupedData[dynamicGroupValue].pCtr += parseFloat(dataEntry.pCtr || 0);
                    groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                    groupedData[dynamicGroupValue].leads += parseFloat(dataEntry.leads || 0);
                    const accountNumber = dataEntry.accountNumber || 'Unknown Account';
                    if (!groupedData[dynamicGroupValue].accountNumbers.includes(accountNumber)) {
                        groupedData[dynamicGroupValue].accountNumbers.push(accountNumber);
                    }
                    if (!groupedData[dynamicGroupValue].buyername) {
                        groupedData[dynamicGroupValue].buyername = dataEntry.buyername;
                    }
                });
                if (activeGrid === "hourly") {
                    setGroup(groupedData);
                    setDailyGroup({});
                } else if (activeGrid === "daily") {
                    setGroup(groupedData);
                    setHourlyGroup({});
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching mainData:", error);
                setLoading(false);
            }
        }
        fetchMainData();
    }, [selectedOption, startDate, endDate, timezone, activeGrid]);

    const rowData = group ? Object.entries(group).map(([group, data]) => ({
        spends: data.spend,
        Revenue: data.estimatedRevenue,
        clicks_fb: data.clicks_f,
        impressions_fb: data.impressions_f,
        impressions_N: data.impressions_m,
        conversions: data.conversions,
        date_start: data.date_start,
        cpc_f: data.cpc_f,
        hour_m: data.hour_m,
        cpl: data.cpl,
        cpc: data.cpc,
        rpc: data.rpc,
        mCpl: data.mCpl,
        pCtr: data.pCtr,
        profit: data.profit,
        leads: data.leads,
        buyername: data.buyername,
        accountNumbers: data.accountNumbers,
        [selectedOption]: group
    })) : [];
    const chartData = rowData.map((item) => ({
        name: item[selectedOption],
        rpc: item.rpc,
        cpc: item.cpc,
        cpl: item.cpl,
    }));
    const memoizedCellRenderer = useMemo(() => (params) => {
        const dynamicFieldValue = params.data ? params.data[selectedOption] : null;
        if (!dynamicFieldValue && params.node.footer) {
            return 'Total';
        }
        return (
            <span
                style={{
                    cursor: (!params.node.footer && ['adset_name', 'campaign_name'].includes(selectedOption)) ? 'pointer' : 'default',
                    color: 'blue'
                }}
            >
                {dynamicFieldValue || ''}
            </span>
        );
    }, [selectedOption]);

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
        if (params.data !== undefined) {
            const { Revenue, spends } = params.data;
            if (spends !== 0) {
                const Profit = Revenue - spends;
                return Number(Profit.toFixed(2));
            }
        }
        if (params.node.aggData !== undefined) {
            const { Revenue, spends } = params.node.aggData;
            if (spends !== 0) {
                const Profit = Revenue - spends;
                return Number(Profit.toFixed(2));
            }
        }
        return 0;
    };


    const getMargin = (params) => {
        let margin = 0;

        if (params.data !== undefined) {
            const { Revenue, spends } = params.data;
            margin = ((Revenue - spends) / spends) * 100;
        } else if (params.node.aggData !== undefined) {
            const { Revenue, spends } = params.node.aggData;
            margin = ((Revenue - spends) / spends) * 100;
        }

        if (!isFinite(margin)) {
            return "0%";
        }

        return Number(margin.toFixed(3)) + "%";
    };

    const columnMap = {
        hourly: {
            field: 'hour_m',
            headerName: 'Hour_N',
        },
        daily: {
            field: 'date_start',
            headerName: 'Date',
        }
    };

    const columnDefs = useMemo(() => {
        const columnConfig = columnMap[activeGrid] || {};
        const { field, headerName } = columnConfig;

        if (!field || !headerName) {
            console.warn(`No field or headerName found for selectedOption: ${selectedOption}`);
            return [];
        }

        return [
            {
                headerName: headerName,
                field: field,
                cellRenderer: memoizedCellRenderer,
            },
            {
                field: "spends",
                resizable: true,
                sortable: true,
                headerName: "Spends",
                aggFunc: spender,
                width: 100,
                lockPinned: true,
            },
            {
                field: "Revenue",
                aggFunc: spender,
                headerName: "Revenue",
                width: 100,
                lockPinned: true,
            },
            {
                field: "profit",
                aggFunc: spender,
                headerName: "Profit",
                valueGetter: getprofit,
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
                headerName: "Clicks", field: "clicks_fb", aggFunc: spender,
                width: 100,
            },
            // { headerName: "Cpc", field: "cpc_f",aggFunc:spender, width: 100,  },
            {
                field: "impressions_fb",
                aggFunc: spender,
                headerName: "Impression_F",
                width: 100,
                lockPinned: true,
            },
            {
                field: "impressions_N",
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
    }, [selectedOption, startDate, endDate, timezone]);

    const rangePresets = [
        { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
        { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
        { label: 'Last 60 Days', value: [dayjs().subtract(60, 'day'), dayjs()] },
    ];

    const onRangeChange = (dates) => {
        setStartDate(dates[0]?.format("YYYY-MM-DD"));
        setEndDate(dates[1]?.format("YYYY-MM-DD"));
    };
    const onTimezoneChange = (value) => {
        setTimezone(value);
    };

    return (
        <>
            <Navigation toggleSidebar={toggleSidebar} sidebarToggled={sidebarToggled} />
            <div className="content-holder">

                <div className="topbar">
                    <Tbar toggleSidebar={toggleSidebar} />
                </div>
                <div className="container-fluid">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line dataKey="rpc" stroke="#8884d8" />
                            <Line dataKey="cpc" stroke="#82ca9d" />
                            <Line dataKey="cpl" stroke="#ffc658" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: '10px' }}>
                        <Button onClick={() => loadGridData('hourly')} type="primary" style={{ marginRight: "10px" }}> Hourly</Button>
                        <Button onClick={() => loadGridData('daily')} style={{ marginRight: "10px" }}>Daily</Button>
                        <Select
                            showSearch
                            placeholder="Select a timezone"
                            optionFilterProp="label"
                            style={{ marginRight: "10px" }}
                            defaultValue={time}
                            onChange={onTimezoneChange}
                            options={[
                                { value: 'UTC/Timezone', label: 'UTC/Date' },
                                { value: 'PDT/Timezone', label: 'PDT/Date' },
                                { value: 'EDT/Timezone', label: 'EDT/Date' },
                                { value: 'EEST/Timezone', label: 'EEST/Date' },
                                { value: 'HST/Timezone', label: 'HST/Date' },
                                { value: 'IST/Timezone', label: 'IST/Date' },
                                { value: 'BST/Timezone', label: 'BST/Date' },
                                { value: 'AST/Timezone', label: 'AST/Date' },
                                { value: 'CST/Timezone', label: 'CST/Date' },
                                { value: 'MST/Timezone', label: 'MST/Date' },
                                { value: 'GMT/Timezone', label: 'GMT/Date' },
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

                        <Space> <p style={{ float: "right", color: "mediumseagreen" }}>{`AdsetName:${names}`}</p></Space>
                    </div>

                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="ag-theme-alpine" style={{ height: 350 }}>
                            {activeGrid === 'hourly' && (
                                <>
                                    {loading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={loading} size="large" />
                                        </div>
                                    ) : (
                                        (!rowData || rowData.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No Live History data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
                                                <AgGridReact
                                                    rowData={rowData}
                                                    columnDefs={columnDefs}
                                                    pinnedBottomRowData={[
                                                        {
                                                            hour_m: "Total",
                                                            mCpl: rowData.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                                            pCtr: rowData.reduce((sum, row) => sum + (row.pCtr || 0), 0),
                                                            spends: rowData.reduce((sum, row) => sum + (row.spends || 0), 0),
                                                            Revenue: rowData.reduce((sum, row) => sum + (row.Revenue || 0), 0),
                                                            profit: rowData.reduce((sum, row) => sum + (row.profit || 0), 0),
                                                            margin: rowData.reduce((sum, row) => sum + (row.margin || 0), 0),
                                                            clicks_fb: rowData.reduce((sum, row) => sum + (row.clicks_fb || 0), 0),
                                                            // cpc_f: rowData.reduce((sum, row) => sum + (row.cpc_f || 0), 0),
                                                            impressions_fb: rowData.reduce((sum, row) => sum + (row.impressions_fb || 0), 0),
                                                            impressions_N: rowData.reduce((sum, row) => sum + (row.impressions_N || 0), 0),
                                                            leads: rowData.reduce((sum, row) => sum + (row.leads || 0), 0),
                                                            cpl: rowData.reduce((sum, row) => sum + (row.cpl || 0), 0),
                                                            conversions: rowData.reduce((sum, row) => sum + (row.conversions || 0), 0),
                                                            cpc: rowData.reduce((sum, row) => sum + (row.cpc || 0), 0),
                                                            rpc: rowData.reduce((sum, row) => sum + (row.rpc || 0), 0),

                                                        }
                                                    ]}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}

                            {activeGrid === 'daily' && (

                                <>
                                    {loading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                            <Spin spinning={loading} size="large" />
                                        </div>
                                    ) : (
                                        (!rowData || rowData.length === 0) ? (
                                            <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                                No Daily History data available from {startDate} to {endDate}
                                            </h2>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
                                                <AgGridReact
                                                    rowData={rowData}
                                                    columnDefs={columnDefs}
                                                    pinnedBottomRowData={[
                                                        {
                                                            date_start: "Total", // Change this to the appropriate field name
                                                            mCpl: rowData.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                                            pCtr: rowData.reduce((sum, row) => sum + (row.pCtr || 0), 0),
                                                            spend: rowData.reduce((sum, row) => sum + (row.spend || 0), 0),
                                                            // field: rowData.reduce((sum, row) => sum + (row.field || 0), 0), 
                                                            estimatedRevenue: rowData.reduce((sum, row) => sum + (row.estimatedRevenue || 0), 0),
                                                            profit: rowData.reduce((sum, row) => sum + (row.profit || 0), 0),
                                                            margin: rowData.reduce((sum, row) => sum + (row.margin || 0), 0),
                                                            clicks_f: rowData.reduce((sum, row) => sum + (row.clicks_f || 0), 0),
                                                            // cpc_f: rowData.reduce((sum, row) => sum + (row.cpc_f || 0), 0),
                                                            impressions_f: rowData.reduce((sum, row) => sum + (row.impressions_f || 0), 0),
                                                            impressions_m: rowData.reduce((sum, row) => sum + (row.impressions_m || 0), 0),
                                                            leads: rowData.reduce((sum, row) => sum + (row.leads || 0), 0),
                                                            cpl: rowData.reduce((sum, row) => sum + (row.cpl || 0), 0),
                                                            conversions: rowData.reduce((sum, row) => sum + (row.conversions || 0), 0),
                                                            cpc: rowData.reduce((sum, row) => sum + (row.cpc || 0), 0),
                                                            rpc: rowData.reduce((sum, row) => sum + (row.rpc || 0), 0),

                                                        }
                                                    ]}
                                                />
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                            {!activeGrid && (
                                <h1>No Data Available</h1>
                            )}
                        </div>
                    </Suspense>
                </div>
            </div>
        </>
    );
}
