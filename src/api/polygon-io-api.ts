import axios from "axios";
import {APPLICATION_JSON, getAggregateDataUrl, getTickerDataUrl, Timespan} from "../utils/StringConstants";
import { API_TOKEN }  from "../utils/StringConstants";

export const getAggregateData = async (ticker: string, multiplier: number, timespan: Timespan, from: Date, to: Date) => {
  try {
    const res = await axios({
      timeout: 300000,
      url: getAggregateDataUrl(ticker, multiplier, timespan, from, to),
      method: "GET",
      headers: {
        "Authorization": "Bearer " + API_TOKEN,
        "Content-Type": APPLICATION_JSON
      }
    });

    return res.data;
  } catch (err) {
    let errString = "Backend is down or courses API returned an exception: " + err;
    console.log(
      errString
    );
    return {
      "ticker": ticker,
      "queryCount": 0,
      "resultsCount": 0,
      "adjusted": true,
      "results": []
    };
  }
}

export const getTickerData = async (search: string) => {
  try {
    const res = await axios({
      timeout: 300000,
      url: getTickerDataUrl(search),
      method: "GET",
      headers: {
        "Authorization": "Bearer " + API_TOKEN,
        "Content-Type": APPLICATION_JSON
      }
    });

    return res.data;
  } catch (err) {
    let errString = "Backend is down or courses API returned an exception: " + err;
    console.log(
      errString
    );
    return
  }
}