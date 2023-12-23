import React, { useState } from "react";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import CameraScreen from "./CameraScreen";
import HomeScreen from "./MediaScreen";
import { useRecoilState } from "recoil";
import { activeTab } from "../lib/atom";


const SuperGalary = () => {
    const [index, setIndex] = useRecoilState(activeTab);
    const [routes] = useState([
        { key: "first", title: "Camera" },
        { key: "second", title: "Home" },
    ]);

    const renderScene = SceneMap({
        first: CameraScreen,
        second: HomeScreen,
    });

    return (
        <TabView
            navigationState={{ index, routes }}
            tabBarPosition={'bottom'}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: "black" }}
                    style={{ backgroundColor: "white" }}
                    labelStyle={{ color: "black" }}
                />
            )}
        />
    )
}
export default SuperGalary