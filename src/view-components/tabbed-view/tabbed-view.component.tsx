import React, { useState } from "react";
import {
  Route,
  Link,
  Redirect,
  useHistory,
  useParams,
  useLocation,
  Switch,
  useRouteMatch
} from "react-router-dom";

import styles from "./tabbed-view.css";
import { getView, View } from "../view-utils";
import { useConfig } from "@openmrs/esm-module-config";
import { Navbar } from "../../config-schemas/openmrs-esm-patient-chart-schema";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TabbedView(props: any) {
  const [views, setViews] = useState<View[]>([]);
  const match = useRouteMatch();
  const config = useConfig();

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    const viewPath = match.url.substr(match.url.lastIndexOf("/"));
    const navItemIndex = props.config.navbar.findIndex(
      element => element.path === viewPath
    );

    return navItemIndex === -1 ? 0 : navItemIndex;
  }

  React.useEffect(() => {
    setViews(
      props.config.navbar.map(item => {
        let view = getView(item.view, config, props.defaultPath);
        if (view && view.component) item.component = view.component;
        return item;
      })
    );
  }, [config, props.config, props.defaultPath]);
  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ul>
          {props.config.navbar.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={props.defaultPath + item.path}>
                    <button
                      className="omrs-unstyled"
                      onClick={() => setSelected(index)}
                    >
                      {item.label}
                    </button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.routesContainer}>
        {views.length > 0 && (
          <Route exact path={props.defaultPath}>
            <Redirect to={props.defaultPath + views[0].path} />
          </Route>
        )}

        <Switch>
          {views.map((route, index) => {
            return (
              <Route
                key={route.label}
                path={`${props.defaultPath + route.path}`}
              >
                {route.component && route.component()}
              </Route>
            );
          })}
        </Switch>
      </div>
    </>
  );
}

type TabbedViewProps = {
  config: {
    name: string;
    title: string;
    navbar: Navbar[];
  };
  defaultPath?: string;
};
