
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

export default function Uconsle() {
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const yesterday = dayjs().subtract(2, "days").format("YYYY-MM-DD")
    const defaultDates = [dayjs(yesterday), dayjs(yesterday)]
    const [startDate, setStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);
    const [timezone, setTimezone] = useState("UTC/Timezone")
    const [loading, setLoading] = useState(true);
    const [rawdata, setRawdata] = useState(null);
    const [Table, setTable] = useState(null)
    const [finaldata, setfinaldata] = useState([]);

    // State to check if the component is mounted (client-side)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Set mounted to true when component mounts
        setIsMounted(true);
    }, []);

    useEffect(() => {
        async function fetchMainData() {
            try {
                setLoading(true);
                
                // Only access localStorage if mounted (client-side)
                const userName = isMounted ? localStorage.getItem("userName") : null;

                const response = await fetch(`/api/meboard?user=${userName}&start=${startDate}&end=${endDate}&time=${timezone}`);
                const data = await response.json();
                console.log(data,"dboard")
                const list = data.userinfo;
                const flattenedUserdata = data.fetchedAccounts.flat().filter(obj => Object.keys(obj).length > 0);
                setTable(flattenedUserdata)
                const groupedData = {};
                flattenedUserdata.forEach(dataEntry => {
                    const dynamicGroupValue = dataEntry.platform;
                    if (!groupedData[dynamicGroupValue]) {
                        groupedData[dynamicGroupValue] = {
                            spend: 0,
                            estimatedRevenue: 0,
                            profit: 0,
                            cpl: 0,
                            cpc: 0,
                            rpc: 0,
                            date_start: '',
                        };
                    }
                    groupedData[dynamicGroupValue].spend += parseFloat(dataEntry.spend || 0);
                    groupedData[dynamicGroupValue].estimatedRevenue += parseFloat(dataEntry.estimatedRevenue || 0);
                    groupedData[dynamicGroupValue].profit += parseFloat(dataEntry.profit || 0);
                    groupedData[dynamicGroupValue].cpl += parseFloat(dataEntry.cpl || 0);
                    groupedData[dynamicGroupValue].cpc += parseFloat(dataEntry.cpc || 0);
                    groupedData[dynamicGroupValue].rpc += parseFloat(dataEntry.rpc || 0);
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

        if (isMounted) {
            fetchMainData();
        }
    }, [startDate, endDate, timezone, isMounted]);

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

        if (Table) {
            fetchMainData();
        }
    }, [Table]);

    // ... (rest of your code remains unchanged)

    return (
        <>
            <Navigation toggleSidebar={toggleSidebar} sidebarToggled={sidebarToggled} />
            <div className="content-holder">
                <div className="topbar">
                    <Tbar toggleSidebar={toggleSidebar} />
                </div>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 style={{ color: "mediumseagreen" }}>Hi, Welcome To D!NJ!T</h1>
                        <div>
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
                                                Spends (Monthly)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">  {rawdata?.Facebook?.spend !== undefined ? rawdata.Facebook.spend.toFixed(3) : 'N/A'}</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-success shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Revenue (Monthly)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">{rawdata?.Facebook?.estimatedRevenue !== undefined ? rawdata.Facebook.estimatedRevenue.toFixed(3) : 'N/A'}</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-success shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Profit (Monthly)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">{rawdata?.Facebook?.profit !== undefined ? rawdata.Facebook.profit.toFixed(3) : 'N/A'}</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6 mb-4">
                            <div className="card border-left-success shadow h-100 py-2">
                                <div className="card-body">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col mr-2">
                                            <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                RPC (Monthly)</div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">{rawdata?.Facebook?.rpc !== undefined ? rawdata.Facebook.rpc.toFixed(3) : 'N/A'}</div>
                                        </div>
                                        <div className="col-auto">
                                            <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                        </div>
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
                    <div className="ag-theme-alpine" style={{ height: 300, width: "100%" }}>
                        <AgGridReact rowData={finaldata} columnDefs={columnDefs} />
                    </div>
                </div>
            </div>
        </>
    );
}
