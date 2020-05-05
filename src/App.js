import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './covid.css';
import moment from 'moment';
//Import Table
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Line } from 'react-chartjs-2';
//Map Start
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import ReactTooltip from 'react-tooltip';
import LinearGradient from './LinearGradient.js';

const INDIA_TOPO_JSON = require('./india.topo.json');

const PROJECTION_CONFIG = {
    scale: 1100,
    center: [83, 22] // always in [East Latitude, North Longitude]
};

// Red Variants
const COLOR_RANGE = [
    '#ffedea',
    '#ffcec5',
    '#ffad9f',
    '#ff8a75',
    '#ff5533',
    '#e2492d',
    '#be3d26',
    '#9a311f',
    '#782618'
];

const DEFAULT_COLOR = '#EEE';

const geographyStyle = {
    default: {
        outline: 'none'
    },
    hover: {
        fill: '#ccc',
        transition: 'all 250ms',
        outline: 'none'
    },
    pressed: {
        outline: 'none'
    }
};
//End Map

const useStyles = makeStyles({
    table: {
        width: '100%'
    },
    TableContainer: {
        width: 'auto',
        margin: '20px 0',
    }
});

function App() {

    const [total, setTotal] = useState([])
    const [tn, setTN] = useState([])
    const classes = useStyles();
    const [dataTable, setdataTable] = useState([])
    const [district, setDistrict] = useState([])
    const [chartData, setChartData] = useState({})
    const [stateDaily, setStateDaily] = useState({})

    //Map Start
    const [tooltipContent, setTooltipContent] = useState('');

    const gradientData = {
        fromColor: COLOR_RANGE[0],
        toColor: COLOR_RANGE[COLOR_RANGE.length - 1],
        min: 0,
        max: dataTable.reduce((max, item) => (item.confirmed > max ? item.confirmed : max), 0)
    };

    const colorScale = scaleQuantile()
        .domain(dataTable.map(d => d.confirmed))
        .range(COLOR_RANGE);

    const onMouseEnter = (geo, current = { confirmed: 'NA' }) => {
        return () => {
            setTooltipContent(`${geo.properties.name}: ${current.confirmed}`);
        };
    };

    const onMouseLeave = () => {
        setTooltipContent('');
    };
    //Map End

    const districtData = (code) => {
        axios.get('https://api.covid19india.org/v2/state_district_wise.json')
            .then(res => {
                console.log(res.data)
                res.data.map((item, index) => {
                    if (item.statecode === code) {
                        setDistrict(res.data[index].districtData)
                    }
                    return null;
                })
            })
            .catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        let x = [];
        let y = [];
        //Get state wise data
        axios.get('https://api.covid19india.org/data.json')
            .then(res => {
                //console.log(res.data)
                setTotal(res.data.statewise[0])
                setdataTable(res.data.statewise)
                res.data.statewise.map(item => {
                    if (item.statecode === 'TN') {
                        setTN(item)
                    }
                    return null;
                })
                res.data.cases_time_series.map(item => {
                    x.push(item.date)
                    y.push(item.totalconfirmed)
                    return null;
                })
                setChartData({
                    labels: x,
                    datasets: [
                        {
                            label: "Confirmed",
                            data: y,
                            backgroundColor: 'rgba(240, 248, 255, 0)',
                            borderWidth: 3,
                            borderColor: 'rgb(255, 7, 58)',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: 'rgb(255, 7, 58)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 5,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: 'rgb(255, 7, 58)',
                            pointHoverBorderColor: 'rgba(220,220,220,1)',
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                        }
                    ]
                });
            })
            .catch(err => {
                console.log(err)
            })

        //State Daily Data
        let sx = [];
        let sy = [];
        axios.get('https://api.covid19india.org/states_daily.json')
            .then(res => {

                let sum = res.data.states_daily.filter(({status}) => status === 'Confirmed')
                .reduce((total, record) => {
                    sx.push(total + parseInt(record.tn))
                    sy.push(record.date)
                    return total + parseInt(record.tn)
                }, 0)

                setStateDaily({
                    labels: sy,
                    datasets: [
                        {
                            label: "Confirmed",
                            data: sx,
                            backgroundColor: 'rgba(240, 248, 255, 0)',
                            borderWidth: 3,
                            borderColor: 'rgb(255, 7, 58)',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: 'rgb(255, 7, 58)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 5,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: 'rgb(255, 7, 58)',
                            pointHoverBorderColor: 'rgba(220,220,220,1)',
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                        }
                    ]
                });

            })
            .catch(err => {
                console.log(err)
            })

        //Get district wise data
        axios.get('https://api.covid19india.org/v2/state_district_wise.json')
            .then(res => {
                setDistrict(res.data[26].districtData)
            })
            .catch(err => {
                console.log(err)
            })

    }, [])

    return (
        <>
            <h1 className="heading">COVID-19 Statistics</h1>
            <div className="container-covid">
                <div className="row">
                    <div className="col-5">
                        <div className="title">
                            <h2>INDIA <span>{moment().format('MMMM Do YYYY, h:mm:ss a')}</span></h2>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-blue">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{total.deltaconfirmed}]</span>
                            <strong>{total.confirmed}</strong>
                            <span>Confirmed</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-orange">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <strong>{total.active}</strong>
                            <span>Active</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-green">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{total.deltarecovered}]</span>
                            <strong>{total.recovered}</strong>
                            <span>Recovered</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-red">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{total.deltadeaths}]</span>
                            <strong>{total.deaths}</strong>
                            <span>Deaths</span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-5">
                        <div className="title">
                            <h2>Tamil Nadu <span>{moment().format('MMMM Do YYYY, h:mm:ss a')}</span></h2>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-blue">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{tn.deltaconfirmed}]</span>
                            <strong>{tn.confirmed}</strong>
                            <span>Confirmed</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-orange">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <strong>{tn.active}</strong>
                            <span>Active</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-green">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{tn.deltarecovered}]</span>
                            <strong>{tn.recovered}</strong>
                            <span>Recovered</span>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card bg-red">
                            <img src={require('./assets/icon-infected.png')} alt="Active Status" />
                            <span>[+{tn.deltadeaths}]</span>
                            <strong>{tn.deaths}</strong>
                            <span>Deaths</span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-2">
                        <TableContainer className={classes.TableContainer} component={Paper}>
                            <Table className={classes.table} stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>State/UI</TableCell>
                                        <TableCell align="right">Confirmed</TableCell>
                                        <TableCell align="right">Active</TableCell>
                                        <TableCell align="right">Recovered</TableCell>
                                        <TableCell align="right">Deaths</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataTable.map((row, index) => {
                                        if (index !== 0 && row.confirmed > 0) {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell onClick={() => districtData(row.statecode)}>{row.state}</TableCell>
                                                    <TableCell align="right">{row.confirmed}</TableCell>
                                                    <TableCell align="right">{row.active}</TableCell>
                                                    <TableCell align="right">{row.recovered}</TableCell>
                                                    <TableCell align="right">{row.deaths}</TableCell>
                                                </TableRow>
                                            );
                                        }
                                        return null;
                                    })}
                                </TableBody>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{total.state}</TableCell>
                                        <TableCell align="right">{total.confirmed}</TableCell>
                                        <TableCell align="right">{total.active}</TableCell>
                                        <TableCell align="right">{total.recovered}</TableCell>
                                        <TableCell align="right">{total.deaths}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div className="col-2">
                        <TableContainer className={classes.TableContainer} component={Paper}>
                            <Table className={classes.table} stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>District</TableCell>
                                        <TableCell align="right">Confirmed</TableCell>
                                        <TableCell align="right">Active</TableCell>
                                        <TableCell align="right">Recovered</TableCell>
                                        <TableCell align="right">Deaths</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {district.map((row, index) => {
                                        if (row.confirmed > 0) {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{row.district}</TableCell>
                                                    <TableCell align="right">{row.confirmed}</TableCell>
                                                    <TableCell align="right">{row.active}</TableCell>
                                                    <TableCell align="right">{row.recovered}</TableCell>
                                                    <TableCell align="right">{row.deceased}</TableCell>
                                                </TableRow>
                                            );
                                        }
                                        return null;
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>

                <div className="row">
                    <div className="col-2">
                        <h3><center>India</center></h3>
                        <Line
                            data={chartData} width={300}
                            options={{
                                responsive: true,
                                scales: {
                                    yAxes: [
                                        {
                                            ticks: {
                                                autoSkip: true,
                                                maxTicksLimit: 10,
                                                beginAtZero: true,
                                                callback: function(label, index, labels) {
                                                    return label/1000+'k';
                                                }
                                            },
                                            gridLines: {
                                                display: true
                                            },
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: '1k = 1000'
                                            }
                                        }
                                    ],
                                    xAxes: [
                                        {
                                            ticks: {
                                                autoSkip: true,
                                                maxTicksLimit: 14,
                                            },
                                            gridLines: {
                                                display: true
                                            }
                                        }
                                    ]
                                }
                            }}
                        />
                        <h3><center>Tamil Nadu</center></h3>
                        <Line
                            data={stateDaily} width={300}
                            options={{
                                responsive: true,
                                scales: {
                                    yAxes: [
                                        {
                                            ticks: {
                                                autoSkip: true,
                                                maxTicksLimit: 10,
                                                beginAtZero: true,
                                                callback: function(label, index, labels) {
                                                    return label/1000+'k';
                                                }
                                            },
                                            gridLines: {
                                                display: true
                                            },
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: '1k = 1000'
                                            }
                                        }
                                    ],
                                    xAxes: [
                                        {
                                            ticks: {
                                                autoSkip: true,
                                                maxTicksLimit: 14
                                            },
                                            gridLines: {
                                                display: true
                                            }
                                        }
                                    ]
                                }
                            }}
                        />
                    </div>
                    <div className="col-2">
                        <ReactTooltip>{tooltipContent}</ReactTooltip>
                        <ComposableMap
                            projectionConfig={PROJECTION_CONFIG}
                            projection="geoMercator"
                            width={600}
                            height={720}
                            data-tip=""
                        >
                            <Geographies geography={INDIA_TOPO_JSON}>
                                {({ geographies }) =>
                                    geographies.map(geo => {
                                        //console.log(geo.state);
                                        const current = dataTable.find(s => s.statecode === geo.id);
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={current ? colorScale(current.confirmed) : DEFAULT_COLOR}
                                                style={geographyStyle}
                                                onMouseEnter={onMouseEnter(geo, current)}
                                                onMouseLeave={onMouseLeave}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                        <LinearGradient data={gradientData} />
                    </div>
                </div>

            </div>
        </>
    );
}

export default App;