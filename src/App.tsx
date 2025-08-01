import React, {useEffect} from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {IonApp, IonRouterOutlet} from '@ionic/react';
import WordFinder from "./components/WordPuzzle/WordFinder";
import WordFinderLevel from "./components/WordPuzzle/WordFinderLevel";
import {IonReactRouter} from "@ionic/react-router";
import {StatusBar} from "@capacitor/status-bar";
import DailyGiftPopup from "./components/WordPuzzle/DailyGiftPopup";
import CurrentLevelPage from "./components/WordPuzzle/CurrentLevelPage";
import './i18n';

const App: React.FC = () => {
    useEffect(() => {const hideStatusBar = async () => {
            try {
                await StatusBar.hide();
            } catch (e) {
                console.log('StatusBar not available in browser' + e);
            }
        };

        hideStatusBar();
    }, []);
  return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/" component={WordFinderLevel} />
              <Route path="/word-finder" component={WordFinder} />
              <Route path="/word-finder-level" component={WordFinderLevel} />
              <Route path="/wf-daily-gift" component={DailyGiftPopup} />
              <Route path="/wf-current-level" component={CurrentLevelPage} />
              <Redirect to="/" />
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
  );
};

export default App;
