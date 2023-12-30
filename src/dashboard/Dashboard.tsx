import React, {useCallback, useEffect, useMemo, useState} from 'react';
import * as appl from '../data/5min-aggregate-appl.json';
import * as allTickers from '../data/tickers.json';
import {LineChart} from '@mui/x-charts/LineChart';
import {Grid, MenuItem} from "@mui/material";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {Timespan} from "../utils/StringConstants";
import {DatePicker} from "@mui/x-date-pickers";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useDebouncedCallback } from 'use-debounce';

export interface Ticker {
  ticker: string,
  name: string
}


const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [tickerData, setTickerData] = useState<Ticker[]>([]);
  const [ticker, setTicker] = React.useState('AAPL');
  const [timespan, setTimespan] = useState<Timespan>('minute');
  const [from, setFrom] = useState<Date>(new Date(2023, 11, 28));
  const [to, setTo] = useState<Date>(new Date(2023, 11, 28));

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly Ticker[]>([]);
  const loading = open && options.length === 0;

  const handleChange = (event: SelectChangeEvent) => {
    setTicker(event.target.value as string);
  };

  const handleTimespanChange = (event: SelectChangeEvent) => {
    setTimespan(event.target.value as Timespan);
  };

  useEffect(() => {
    (async () => {
      let multiplier = 1;
      if (timespan === "minute") {
        multiplier = 5;
      }

      // const aggregateData = await getAggregateData(ticker, multiplier, timespan, from, to);
      // const tickers = await getTickerData(ticker);
      const aggregateData = appl;
      const tickers = allTickers;
      setData(aggregateData.results);
      setTickerData(tickers.results);
    })();
  }, [ticker, timespan, from, to]);

  const closePriceVals = useMemo(() => {
    return data.map(datum => datum.c);
  }, [data]);

  const openPriceVals = useMemo(() => {
    return data.map(datum => datum.o);
  }, [data]);

  const volumeWeightedAveVals = useMemo(() => {
    return data.map(datum => datum.vw);
  }, [data]);

  const xVals = useMemo(() => {
    return data.map(datum => new Date(datum.t));
  }, [data]);

  const tickerMenuItems = useMemo(() => {
    return tickerData.map(ticker => {
      return (<MenuItem value={ticker.ticker}>{ticker.ticker} - {ticker.name}</MenuItem>)
    })
  }, [tickerData]);

  const timespanMenuItems = useMemo(() => {
    return ["minute", "day"].map(timespan => {
      return (<MenuItem value={timespan}>{timespan}</MenuItem>)
    })
  }, [tickerData]);

  const handleFromChange = useCallback((val: Date | null) => {
    if (val !== null) {
      setFrom(val);
    }
  }, [from])

  const handleToChange = useCallback((val: Date | null) => {
    if (val !== null) {
      setTo(val);
    }
  }, [to]);

  const handleAutocompleteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = event.target.value;
    if (val !== null) {
      setTicker(val);
    }
  }, [ticker])

  const debouncedHandleAutochange = useDebouncedCallback(
    // function
    (value) => {
      handleAutocompleteChange(value);
    },
    // delay in ms
    3000
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{flexGrow: 1}}>
        <AppBar position="static">
          <Toolbar>
            <Grid container spacing={2}>
              <Grid item >
                <FormControl>
                  <Autocomplete
                    id="asynchronous-demo"
                    sx={{ width: 300 }}
                    open={open}
                    onOpen={() => {
                      setOpen(true);
                    }}
                    onClose={() => {
                      setOpen(false);
                    }}
                    isOptionEqualToValue={(option, value) => option.ticker === value.ticker || option.name.toLowerCase() === value.name.toLowerCase()}
                    getOptionLabel={(option) => option.ticker}
                    options={options}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onChange={(e) => debouncedHandleAutochange(e)}
                        label={ticker}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <Select
                    labelId="demo-simple-select-label2"
                    id="demo-simple-select2"
                    value={timespan}
                    label="Timespan"
                    onChange={handleTimespanChange}
                  >
                    {timespanMenuItems}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <DatePicker value={from} onChange={handleFromChange}/>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <DatePicker value={to} onChange={handleToChange}/>
                </FormControl>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Box>
      <div style={{height: "90vh"}}>
        <LineChart
          xAxis={[{data: xVals, tickInterval: (time) => time.getHours() === 0, scaleType: 'time', }]}
          series={[
            {
              label: 'Close price',
              data: closePriceVals,
            },
            {
              label: 'Open price',
              data: openPriceVals,
            },
            {
              label: 'Volume weighted price',
              data: volumeWeightedAveVals,
            },
          ]}
        />
      </div>
    </LocalizationProvider>
  );
}

export default Dashboard;