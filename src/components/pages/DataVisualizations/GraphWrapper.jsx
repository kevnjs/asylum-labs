import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import CitizenshipMapAll from './Graphs/CitizenshipMapAll';
import CitizenshipMapSingleOffice from './Graphs/CitizenshipMapSingleOffice';
import TimeSeriesAll from './Graphs/TimeSeriesAll';
import OfficeHeatMap from './Graphs/OfficeHeatMap';
import TimeSeriesSingleOffice from './Graphs/TimeSeriesSingleOffice';
import YearLimitsSelect from './YearLimitsSelect';
import ViewSelect from './ViewSelect';
import axios from 'axios';
import {
  resetVisualizationQuery,
  setVisualizationData,
} from '../../../state/actionCreators';
import test_data from '../../../data/test_data.json';
import { colors } from '../../../styles/data_vis_colors';
import ScrollToTopOnMount from '../../../utils/scrollToTopOnMount';
import { enablePatches } from 'immer';
import { rawApiDataToPlotlyReadyInfo } from '../../../utils';
import { CircularProgress } from '@material-ui/core';

const { background_color } = colors;

function GraphWrapper(props) {
  console.log('ENV', process.env.REACT_APP_AUTH0_DOMAIN);
  console.log(window.location.origin);

  const { set_view, dispatch } = props;
  let { office, view } = useParams();
  if (!view) {
    set_view('time-series');
    view = 'time-series';
  }
  let map_to_render;
  if (!office) {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesAll />;
        break;
      case 'office-heat-map':
        map_to_render = <OfficeHeatMap />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapAll />;
        break;
      default:
        break;
    }
  } else {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesSingleOffice office={office} />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapSingleOffice office={office} />;
        break;
      default:
        break;
    }
  }

  function updateStateWithNewData(years, view, office, stateSettingCallback) {
    /*
          _                                                                             _
        |                                                                                 |
        |   Example request for once the `/summary` endpoint is up and running:           |
        |                                                                                 |
        |     `${url}/summary?to=2022&from=2015&office=ZLA`                               |
        |                                                                                 |
        |     so in axios we will say:                                                    |
        |                                                                                 |     
        |       axios.get(`${url}/summary`, {                                             |
        |         params: {                                                               |
        |           from: <year_start>,                                                   |
        |           to: <year_end>,                                                       |
        |           office: <office>,       [ <-- this one is optional! when    ]         |
        |         },                        [ querying by `all offices` there's ]         |
        |       })                          [ no `office` param in the query    ]         |
        |                                                                                 |
          _                                                                             _
                                   -- Mack 
    
    */

    let endpoints = [
      'https://hrf-asylum-be-b.herokuapp.com/cases/fiscalSummary',
      `https://hrf-asylum-be-b.herokuapp.com/cases/citizenshipSummary`,
    ];

    const fiscalDataAll = axios.get(endpoints[0], {
      params: {
        from: years[0],
        to: years[1],
      },
    });

    const fiscalDataOffice = axios.get(endpoints[0], {
      params: {
        from: years[0],
        to: years[1],
        office: office,
      },
    });

    const citizenShipData = axios.get(endpoints[1]);

    const allData = axios
      .all([fiscalDataAll, fiscalDataOffice, citizenShipData])
      .then(axios.spread((...allData) => allData));

    const setData = async () => {
      try {
        let finishedData = await allData;
        stateSettingCallback(view, office, finishedData);
      } catch (err) {
        console.log(err);
      }
    };

    // if(view === 'citizenship') {
    //   setData();
    // };

    // if ((office === 'all' || !office) {
    //   setData();
    //  } else {
    //  };

    setData();
  }
  const clearQuery = (view, office) => {
    dispatch(resetVisualizationQuery(view, office));
  };

  return (
    <div
      className="map-wrapper-container"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '50px',
        backgroundColor: background_color,
      }}
    >
      <ScrollToTopOnMount />
      {map_to_render}
      <div
        className="user-input-sidebar-container"
        style={{
          width: '300px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <ViewSelect set_view={set_view} />
        <YearLimitsSelect
          view={view}
          office={office}
          clearQuery={clearQuery}
          updateStateWithNewData={updateStateWithNewData}
        />
      </div>
    </div>
  );
}

export default connect()(GraphWrapper);
