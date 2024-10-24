"use client";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useEffect } from "react";
import { redirect } from "next/navigation";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Select, DatePicker, Space } from 'antd';
const { RangePicker } = DatePicker;
import React from 'react';
import dayjs from 'dayjs';
import { Flex, Spin } from 'antd';
import Camsumm from "../camsummary/page";
const { Option } = Select;

export default function Acnum({ NNdata }) {
    const accckey = NNdata?.accountKey
    const start = NNdata?.startDate || dayjs().startOf('month').format('YYYY-MM-DD');
    const end = NNdata?.endDate || dayjs().endOf('month').format('YYYY-MM-DD');
    const zone = NNdata?.timezone || 'UTC/Timezone';
    const revenue = NNdata?.accountKey;
    const [prop, setProp] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [rawdata, setRawdata] = useState(null);
    const [loading, setLoading] = useState(true);
    const defaultDates = [dayjs(start), dayjs(end)]
    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);
    const [timezone, setTimezone] = useState(zone)
    const [Username, setUsername] = useState(null);
    const [selectOption, setselectOption] = useState('account_number');

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUsername = localStorage.getItem("data");
            setUsername(storedUsername);
        }
    }, []);

    const rangePresets = [
        { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
        { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
        { label: 'Last 60 Days', value: [dayjs().subtract(60, 'day'), dayjs()] },
    ];
    useEffect(() => {
        async function fetchMainData() {
            try {
                const Username = localStorage.getItem("Username");
                const response = await fetch(`../api/summaryapi?employName=${Username}&start=${startDate}&end=${endDate}&time=${timezone}`);
                const data = await response.json();
                const list = data.userData;
                const flattenedUserdata = data.fetchedAccounts.flat().filter(obj => Object.keys(obj).length > 0);
                const groupedData = {};
                const accountKey = NNdata?.accountKey
                const name = NNdata?.names;
                const specificUserAccounts = list.adAccounts[accountKey]?.[name];
                if (specificUserAccounts) {
                    specificUserAccounts.forEach(accountNumber => {
                        const matchingData = flattenedUserdata.filter(user => user.account_number === accountNumber);
                        if (matchingData.length) {
                            matchingData.forEach(dataEntry => {
                                const dynamicGroupValue = dataEntry[selectOption];
                                if (!groupedData[dynamicGroupValue]) {
                                    groupedData[dynamicGroupValue] = {
                                        accountNumbers: [],
                                        buyername: '',
                                        spend: 0,
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
                                        leads:0,
                                       cron_updated:'',
                                    };
                                }
                                groupedData[dynamicGroupValue].leads += parseFloat(dataEntry.leads || 0);
                                groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                                groupedData[dynamicGroupValue].impressions_f += parseFloat(dataEntry.impressions_f || 0);
                                groupedData[dynamicGroupValue].impressions_m += parseFloat(dataEntry.impressions_m || 0);
                                groupedData[dynamicGroupValue].clicks_f += parseFloat(dataEntry.clicks_f || 0);
                                groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                                groupedData[dynamicGroupValue].cpc_f += parseFloat(dataEntry.cpc_f || 0);
                                groupedData[dynamicGroupValue].conversions += parseFloat(dataEntry.conversions || 0);
                                groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                                groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                                groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
                                groupedData[dynamicGroupValue].mCpl += parseFloat(dataEntry.mCpl || 0);
                                groupedData[dynamicGroupValue].pCtr += parseFloat(dataEntry.pCtr || 0);
                                groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                                groupedData[dynamicGroupValue].cron_updated = dataEntry.cron_updated;
                                groupedData[dynamicGroupValue].leads += parseFloat(dataEntry.leads || 0);
                                groupedData[dynamicGroupValue].buyername = dataEntry.buyername || groupedData[dynamicGroupValue].buyername;
                                if (!groupedData[dynamicGroupValue].accountNumbers.includes(accountNumber)) {
                                    groupedData[dynamicGroupValue].accountNumbers.push(accountNumber);
                                }
                            });
                        }
                        console.log(`Processed data for account number:Accounts`);
                    });
                } else {
                    console.error(`No accounts found for user: ${name}`);
                }
                setRawdata(groupedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching mainData:', error);
                setLoading(false);
            }
        }
        fetchMainData();
    }, [startDate, endDate, timezone, selectOption, NNdata]);
    const rowData = rawdata ? Object.entries(rawdata).map(([accountNumber, data]) => ({
        spends: data.spend,
       Revenue: data.estimatedRevenue,
        clicks_fb: data.clicks_f,
        impressions_fb: data.impressions_f,
        impressions_N: data.impressions_m,
        conversions: data.conversions,
        cpl: data.cpl,
        cpc: data.cpc,
        rpc: data.rpc,
        mCpl: data.mCpl,
        pCtr: data.pCtr,
        profit: data.profit,
        leads: data.leads,
        cron_updated:data.cron_updated,
        [selectOption]: accountNumber,
    })) : [];
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
        "adset_name": {
            field: 'adset_name',
            headerName: 'Adset Name',
        },
        "buyername": {
            field: 'buyername',
            headerName: 'Buyer Name',
        },
        "adset_id": {
            field: 'adset_id',
            headerName: 'Adset Id',
        },
        "account_number": {
            field: 'account_number',
            headerName: 'Account Number',
        },
        "hour_m": {
            field: 'hour_m',
            headerName: 'Hour',
        }
    };
    const [click,setClick] = useState(null)
    const columnDefs = useMemo(() => {
        const columnConfig = columnMap[selectOption] || {};
        const { field, headerName } = columnConfig;

        if (!field || !headerName) {
            console.warn(`No field or headerName found for selectOption: ${selectOption}`);
            return [];
        }
        return [
            {
                headerName: headerName,
                field: field,
                width:400,
                pinned:"left",
                cellRenderer: (params) => {
                    const dynamicFieldValue = params.data ? params.data[selectOption] : null;
                    const key = NNdata?.accountKey;
                    if (!dynamicFieldValue && params.node.rowPinned) {
                        return 'Total';
                    }
                    const handleClick = () => {
                        if (!params.node.footer && ['adset_name', 'campaign_name', 'adset_id', 'campaign_id'].includes(selectOption)) {
                            const url = `/pastarchives/?startDate=${startDate}&endDate=${endDate}&timezone=${timezone}&names=${encodeURIComponent(dynamicFieldValue)}&accountKey=${encodeURIComponent(accckey)}&option=${encodeURIComponent(selectOption)}`;
                            window.open(url, '_blank');
                            setProp({
                                startDate: startDate,
                                endDate: endDate,
                                timezone: timezone,
                                names: dynamicFieldValue,
                                accountKey: accckey,
                            });
                            setClick({names: dynamicFieldValue})
                            setShowGrid(true);
                        } else if (!params.node.footer && ['Buyername', 'account_number'].includes(selectOption)) {
                            setProp({
                                startDate: startDate,
                                endDate: endDate,
                                timezone: timezone,
                                names: dynamicFieldValue,
                                accountKey: accckey,
                            });
                            setShowGrid(false);
                        }
                    };
                    return (
                        <span
                            onClick={handleClick}
                            style={{
                                cursor: (!params.node.footer && ['buyername', 'adset_name', 'campaign_name', 'adset_id', 'campaign_id'].includes(selectOption)) ? 'pointer' : 'default',
                                color: 'Black',
                                fontWeight: '600',
                            }}
                        >
                            {dynamicFieldValue || ''}
                        </span>
                    );
                },
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
                headerName: "EstimatedRevenue",
                width: 100,
                lockPinned: true,
            },
            {
                field: "profit",
                aggFunc: spender,
                headerName: "Profit",
                valueGetter:getprofit,
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
    }, [selectOption, startDate, endDate, timezone]);
    const onRangeChange = (dates) => {
        setStartDate(dates[0]?.format("YYYY-MM-DD"));
        setEndDate(dates[1]?.format("YYYY-MM-DD"));
    };

    const onChange = (value) => {
        setselectOption(value);
    };

    const onTimezoneChange = (value) => {
        setTimezone(value);
    };

    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [cronUpdate, setCronUpdate] = useState('');

    const handleChange = (value) => {
        setSelectedNetwork(value);
        const networkData = rowData.find(user => user.account_number === value);
        setCronUpdate(networkData ? networkData.cron_updated : '');
    };


    return (
        <div className="filter-handle">
            {showGrid ? (
                <div className="ag-theme-alpine" style={{ height: "80vh"}}>
                    <>   <Select
                        showSearch
                        placeholder="Select a media buyer"
                        optionFilterProp="label"
                        style={{ marginRight: "10px", marginBottom:"10px", }}
                        onChange={onChange}
                        defaultValue={selectOption}
                        options={[
                            { value: 'adset_name', label: 'Adset_Name' },
                            { value: 'buyername', label: 'Buyer_Name' },
                            { value: 'adset_id', label: 'Adset_ID' },
                            { value: 'account_number', label: 'Account_Number' },
                            { value: 'hour_m', label: 'Hour_N' },
                        ]}
                    />
                        <Select
                            showSearch
                            placeholder="Select a timezone"
                            optionFilterProp="label"
                            style={{ marginRight: "10px", }}
                            defaultValue={zone}
                            onChange={onTimezoneChange}
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
                        <Space direction="vertical">
            <Select
                value={selectedNetwork}
                onChange={handleChange}
                style={{ width: 200 }}
                placeholder="--Select an Account--"
            >
                {rowData && rowData.length > 0 ? (
                    rowData.map(user => (
                        <Option key={user.account_number} value={user.account_number}>
                            {user.account_number}
                        </Option>
                    ))
                ) : (
                    <Option disabled>No accounts available</Option>
                )}
            </Select>
        </Space>
        <Space  style={{ float:"right" }}>
            {cronUpdate && <p>Cron Update: {cronUpdate}</p>}
            </Space>
                        <div className="mt-1">
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <Spin spinning={loading} size="large" />
                            </div>
                        ) : (
                            (!rowData || rowData.length === 0) ? (
                                <h2 style={{ display: "flex", justifyContent: "center", marginTop: "15%", color: "mediumpurple" }}>
                                    No Accounts data available from {startDate} to {endDate}
                                </h2>
                            ) : (
                                <div className="ag-theme-alpine" style={{ height: "80vh", width: '100%' }}>
                                    <AgGridReact
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        pinnedBottomRowData={[
                                            {
                                                buyername: "Total", 
                                            mCpl: rowData.reduce((sum, row) => sum + (row.mCpl || 0), 0),
                                            pCtr: rowData.reduce((sum, row) => sum + (row.pCtr || 0), 0), 
                                            spends: rowData.reduce((sum, row) => sum + (row.spends || 0), 0),
                                            // field: rowData.reduce((sum, row) => sum + (row.field || 0), 0), 
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
                        </div>
                    </>
                </div>
            ) : (
                <Camsumm NNAdata={prop} />
            )}
        </div>
    );

}